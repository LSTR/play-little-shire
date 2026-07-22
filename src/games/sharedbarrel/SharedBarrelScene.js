import Phaser from 'phaser';
import { COLORS, REDUCED_MOTION } from '../../config.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, iconButton, verticalGradient, makePortrait, darken } from '../../ui.js';
import { getProfiles, CHAR_INFO } from '../../profiles.js';

const RIVER_TOP = 232;
const RIVER_BOTTOM = 960; // the dock (controls) starts here
const LANE_X = [195, 360, 525];
const ROW_Y = [650, 760, 870];
// Logs start well outside the lane collision band (150-570, from LANE_X ± LOG_TOL_X)
// so an edge lane never gets an instant, no-warning hit — same reaction time rocks get.
const LOG_MIN_X = -60;
const LOG_MAX_X = 780;
const STUN_MS = 600;
const ROCK_TOL_Y = 38;
const LOG_TOL_X = 45;

// One barrel, two players, two independent axes: player 1 steers the lane
// (left/right, dodging rocks that fall downstream) and player 2 steers the
// row (near/far, dodging logs that drift across the current). Neither hazard
// cares about the other player's axis, so the two of them watch their own
// danger and call it out — that's the whole cooperative hook. A hit is just
// a brief stun, same forgiving rule as the solo Barrel Run: never a fail state.
export default class SharedBarrelScene extends Phaser.Scene {
  constructor() {
    super('SharedBarrel');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = getProfiles();
    this.laneIdx = 1;
    this.rowIdx = 1;
    this.elapsed = 0;
    this.rockAcc = 0;
    this.logAcc = 0;
    this.finished = false;
    this.stunUntil = 0;
    this.distance = 0;
    this.rocks = [];
    this.logs = [];

    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    if (!this.textures.exists('foam-drop')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillEllipse(10, 4, 10, 4);
      g.generateTexture('foam-drop', 20, 8);
      g.destroy();
    }
    if (!this.textures.exists('ctrl-dot')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 16, 13);
      g.generateTexture('ctrl-dot', 32, 32);
      g.destroy();
    }

    // dev deep-links: &finish=px total distance, &speed=px/s base flow,
    // &hazard=rock|log|both restricts what spawns, &lane=0-2 &row=0-2 set the
    // starting position (all for deterministic screenshot testing)
    const params = new URLSearchParams(location.search);
    this.finishDist = parseFloat(params.get('finish')) || 7000;
    this.baseFlow = parseFloat(params.get('speed')) || 260;
    this.hazard = params.get('hazard') || 'both';
    const li = parseInt(params.get('lane'), 10);
    const ri = parseInt(params.get('row'), 10);
    if (li >= 0 && li <= 2) this.laneIdx = li;
    if (ri >= 0 && ri <= 2) this.rowIdx = ri;

    // --- the shared river ---
    verticalGradient(this, 0, RIVER_TOP, W, RIVER_BOTTOM - RIVER_TOP, '#3E7B9E', '#2E5E7D');
    const bankW = W / 2 - (165 + 60);
    this.add.rectangle(bankW / 2, (RIVER_TOP + RIVER_BOTTOM) / 2, bankW, RIVER_BOTTOM - RIVER_TOP, COLORS.green).setDepth(1);
    this.add.rectangle(W - bankW / 2, (RIVER_TOP + RIVER_BOTTOM) / 2, bankW, RIVER_BOTTOM - RIVER_TOP, COLORS.green).setDepth(1);
    addArt(this, bankW / 2, RIVER_TOP + 90, 'tok-tree', 0.55).setDepth(2);
    addArt(this, W - bankW / 2, RIVER_TOP + 320, 'tok-tree', 0.5).setDepth(2);

    if (!REDUCED_MOTION) {
      const foam = this.add.particles(0, 0, 'foam-drop', {
        x: { min: bankW + 10, max: W - bankW - 10 },
        y: RIVER_TOP,
        lifespan: 1400,
        speedY: { min: this.baseFlow * 0.9, max: this.baseFlow * 1.1 },
        alpha: { start: 0.5, end: 0 },
        scale: { min: 0.6, max: 1.1 },
        frequency: 90,
      });
      foam.setDepth(3);
    }

    // --- the dock, where both players stand to steer ---
    this.add.rectangle(W / 2, (RIVER_BOTTOM + H) / 2, W, H - RIVER_BOTTOM, COLORS.wood);

    // --- shared progress track ---
    const trackY = 168;
    this.add.image(78, trackY, 'hobbit-door').setDisplaySize(46, 46);
    this.add.image(W - 78, trackY, 'gate').setDisplaySize(50, 50);
    const tg = this.add.graphics();
    tg.fillStyle(0x1e2430, 0.35);
    tg.fillRoundedRect(112, trackY - 7, W - 224, 14, 7);
    this.trackX0 = 118;
    this.trackX1 = W - 118;
    this.marker = addArt(this, this.trackX0, trackY, 'tok-barrel', 0.5).setDepth(9);

    // --- the barrel itself, carrying both of them ---
    this.veh = this.add.container(LANE_X[this.laneIdx], ROW_Y[this.rowIdx]).setDepth(6);
    const bob = this.add.container(0, 0);
    bob.add(addArt(this, 0, 8, 'tok-barrel', 0.8));
    bob.add(makePortrait(this, -16, -28, this.players[0].char, 18));
    bob.add(makePortrait(this, 16, -28, this.players[1].char, 18));
    this.veh.add(bob);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: bob, y: -6, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    this.hitBurst = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 20, max: 60 },
      scale: { start: 0.4, end: 0 },
      lifespan: 300,
      emitting: false,
    });
    this.hitBurst.setDepth(7);

    this.makeControls();
  }

  makeControls() {
    const W = this.scale.width;
    const CTRL_Y = 1110;
    const infoA = CHAR_INFO[this.players[0].char];
    const infoB = CHAR_INFO[this.players[1].char];

    makePortrait(this, W / 4, 935, this.players[0].char, 24);
    makePortrait(this, (3 * W) / 4, 935, this.players[1].char, 24);

    // player 1: lane control (left/right), three buttons in a row
    const laneX = [W / 4 - 100, W / 4, W / 4 + 100];
    this.laneBtns = laneX.map((x, i) => {
      const icon = i === 1 ? 'ctrl-dot' : 'icon-arrow';
      const btn = iconButton(this, x, CTRL_Y, icon, { fill: infoA.color, base: darken(infoA.color), r: 48, iconSize: i === 1 ? 22 : 40 }, () =>
        this.setLane(i)
      );
      if (i === 0) btn.icon.setFlipX(true);
      return btn;
    });

    // player 2: row control (near/far), three buttons stacked
    const rowX = (3 * W) / 4;
    const rowY = [CTRL_Y - 100, CTRL_Y, CTRL_Y + 100];
    this.rowBtns = rowY.map((y, i) => {
      const icon = i === 1 ? 'ctrl-dot' : 'icon-arrow';
      const btn = iconButton(this, rowX, y, icon, { fill: infoB.color, base: darken(infoB.color), r: 48, iconSize: i === 1 ? 22 : 40 }, () =>
        this.setRow(i)
      );
      if (i === 0) btn.icon.setAngle(-90);
      if (i === 2) btn.icon.setAngle(90);
      return btn;
    });

    this.updateLaneButtons();
    this.updateRowButtons();
  }

  updateLaneButtons() {
    this.laneBtns.forEach((b, i) => b.setAlpha(i === this.laneIdx ? 1 : 0.6));
  }

  updateRowButtons() {
    this.rowBtns.forEach((b, i) => b.setAlpha(i === this.rowIdx ? 1 : 0.6));
  }

  setLane(idx) {
    if (this.finished || idx === this.laneIdx) return;
    this.laneIdx = idx;
    this.tweens.add({ targets: this.veh, x: LANE_X[idx], duration: 160, ease: 'Sine.easeOut' });
    this.updateLaneButtons();
  }

  setRow(idx) {
    if (this.finished || idx === this.rowIdx) return;
    this.rowIdx = idx;
    this.tweens.add({ targets: this.veh, y: ROW_Y[idx], duration: 160, ease: 'Sine.easeOut' });
    this.updateRowButtons();
  }

  spawnRocks() {
    const n = LANE_X.length;
    const blockCount = Phaser.Math.Between(1, n - 1); // always leave >=1 lane open
    const blocked = new Set();
    while (blocked.size < blockCount) blocked.add(Phaser.Math.Between(0, n - 1));
    blocked.forEach((laneIdx) => {
      const img = addArt(this, LANE_X[laneIdx], RIVER_TOP - 50, 'obstacle-rock', 0.85).setDepth(4);
      this.rocks.push({ img, lane: laneIdx, hit: false });
    });
  }

  spawnLogs() {
    const n = ROW_Y.length;
    const blockCount = Phaser.Math.Between(1, n - 1); // always leave >=1 row open
    const blocked = new Set();
    while (blocked.size < blockCount) blocked.add(Phaser.Math.Between(0, n - 1));
    blocked.forEach((rowIdx) => {
      const dir = Phaser.Math.Between(0, 1) === 0 ? 1 : -1; // 1 = drifts left-to-right
      const x = dir === 1 ? LOG_MIN_X : LOG_MAX_X;
      const img = addArt(this, x, ROW_Y[rowIdx], 'obstacle-log', 0.85).setFlipX(dir === -1).setDepth(4);
      this.logs.push({ img, row: rowIdx, dir, hit: false });
    });
  }

  onHit() {
    this.stunUntil = this.time.now + STUN_MS;
    sfx.miss();
    this.hitBurst.emitParticleAt(this.veh.x, this.veh.y, 8);
    this.tweens.add({ targets: this.veh, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => this.veh.setAngle(0) });
    this.cameras.main.shake(90, 0.0015);
  }

  update(time, delta) {
    if (!this.veh || this.finished) return;
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += delta;

    // difficulty ramps gently, same curve as the solo Barrel Run
    const flow = this.baseFlow * (1 + Math.min(this.elapsed / 40000, 0.5));
    const rockInterval = Math.max(650, 1100 - this.elapsed / 60);
    const logInterval = rockInterval * 1.3; // the newer hazard gets a little more breathing room

    if (this.hazard !== 'log') {
      this.rockAcc += delta;
      if (this.rockAcc >= rockInterval) {
        this.rockAcc = 0;
        this.spawnRocks();
      }
    }
    if (this.hazard !== 'rock') {
      this.logAcc += delta;
      if (this.logAcc >= logInterval) {
        this.logAcc = 0;
        this.spawnLogs();
      }
    }

    const stunned = time < this.stunUntil;
    this.distance += flow * (stunned ? 0.3 : 1) * dt;

    for (let k = this.rocks.length - 1; k >= 0; k--) {
      const r = this.rocks[k];
      r.img.y += flow * dt;
      if (!r.hit && r.lane === this.laneIdx && r.img.y > this.veh.y - ROCK_TOL_Y && r.img.y < this.veh.y + ROCK_TOL_Y) {
        r.hit = true;
        this.onHit();
      }
      if (r.img.y > RIVER_BOTTOM - 10) {
        r.img.destroy();
        this.rocks.splice(k, 1);
      }
    }

    const logSpeed = flow * 0.85;
    for (let k = this.logs.length - 1; k >= 0; k--) {
      const l = this.logs[k];
      l.img.x += logSpeed * l.dir * dt;
      if (!l.hit && l.row === this.rowIdx && l.img.x > this.veh.x - LOG_TOL_X && l.img.x < this.veh.x + LOG_TOL_X) {
        l.hit = true;
        this.onHit();
      }
      if (l.img.x < LOG_MIN_X - 20 || l.img.x > LOG_MAX_X + 20) {
        l.img.destroy();
        this.logs.splice(k, 1);
      }
    }

    const frac = Phaser.Math.Clamp(this.distance / this.finishDist, 0, 1);
    this.marker.x = this.trackX0 + frac * (this.trackX1 - this.trackX0);

    if (this.distance >= this.finishDist) this.win();
  }

  win() {
    this.finished = true;
    sfx.win();
    this.cameras.main.flash(350, 214, 244, 255);
    this.time.delayedCall(700, () =>
      this.scene.launch('Win', { replay: 'SharedBarrel', team: this.players.map((p) => p.char) })
    );
  }
}
