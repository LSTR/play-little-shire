import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient, makePortrait } from '../../ui.js';
import { getProfiles, CHAR_INFO } from '../../profiles.js';
import { showPlayerSetup, playerRoster } from '../setup.js';

const RIVER_TOP = 232;
const RIVER_BOTTOM = 1280;
const BARREL_Y = RIVER_BOTTOM - 170;
const STUN_MS = 600;

// Continuous-motion river runner. Obstacle scroll speed is constant and shared by
// every river (fair course); a hit only slows *your* progress rate, so a race is
// won by dodging, not by luck of the draw.
export default class BarrelsScene extends Phaser.Scene {
  constructor() {
    super('Barrels');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

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

    const params = new URLSearchParams(location.search);
    this.finishDist = parseFloat(params.get('finish')) || 7000;
    this.baseFlow = parseFloat(params.get('speed')) || 260;

    const pCount = parseInt(params.get('players'), 10);
    if (pCount === 1) this.begin(null);
    else if (pCount === 2) this.begin(playerRoster(2));
    else showPlayerSetup(this, { max: 2, onStart: (roster) => this.begin(roster) });
  }

  begin(roster) {
    const W = this.scale.width;
    this.race = !!roster;
    const players = roster || [getProfiles()[0]];
    this.elapsed = 0;
    this.spawnAcc = 0;
    this.spawnInterval = 1100;
    this.finished = false;

    this.zones = players.map((p, i) =>
      this.makeRiver(p, i, this.race ? (i === 0 ? W / 4 : (3 * W) / 4) : W / 2, this.race ? [-95, 0, 95] : [-165, 0, 165])
    );

    if (this.race) {
      const dg = this.add.graphics().setDepth(8);
      dg.fillStyle(0xd9c6a0, 0.9);
      for (let y = RIVER_TOP + 10; y < RIVER_BOTTOM; y += 34) dg.fillRect(W / 2 - 4, y, 8, 20);
    }

    // shared progress track: everyone's marker on one line, so who's ahead is obvious
    const trackY = 168;
    this.add.image(78, trackY, 'hobbit-door').setDisplaySize(46, 46);
    this.add.image(W - 78, trackY, 'gate').setDisplaySize(50, 50);
    const tg = this.add.graphics();
    tg.fillStyle(0x1e2430, 0.35);
    tg.fillRoundedRect(112, trackY - 7, W - 224, 14, 7);
    this.trackX0 = 118;
    this.trackX1 = W - 118;
    this.markers = this.zones.map((z) => {
      const m = makePortrait(this, this.trackX0, trackY, z.char, 24);
      m.setDepth(9);
      return m;
    });

    this.title = !this.race
      ? this.add.text(W / 2, 200, t('barrels.title'), textStyle(36, HEX.gold, 700)).setOrigin(0.5).setShadow(0, 3, '#1E2430', 3)
      : null;
  }

  makeRiver(profile, i, centerX, laneOffsets) {
    const W = this.scale.width;
    const zoneW = this.race ? W / 2 : W;
    const left = centerX - zoneW / 2;

    // water
    verticalGradient(this, left, RIVER_TOP, zoneW, RIVER_BOTTOM - RIVER_TOP, '#3E7B9E', '#2E5E7D');
    // banks
    const bankW = zoneW / 2 - (Math.max(...laneOffsets) + 60);
    if (bankW > 4) {
      this.add.rectangle(left + bankW / 2, (RIVER_TOP + RIVER_BOTTOM) / 2, bankW, RIVER_BOTTOM - RIVER_TOP, COLORS.green).setDepth(1);
      this.add.rectangle(left + zoneW - bankW / 2, (RIVER_TOP + RIVER_BOTTOM) / 2, bankW, RIVER_BOTTOM - RIVER_TOP, COLORS.green).setDepth(1);
      addArt(this, left + bankW / 2, RIVER_TOP + 90, 'tok-tree', 0.55).setDepth(2);
      addArt(this, left + zoneW - bankW / 2, RIVER_TOP + 320, 'tok-tree', 0.5).setDepth(2);
    }

    if (!REDUCED_MOTION) {
      const foam = this.add.particles(0, 0, 'foam-drop', {
        x: { min: left + 20, max: left + zoneW - 20 },
        y: RIVER_TOP,
        lifespan: 1400,
        speedY: { min: this.baseFlow * 0.9, max: this.baseFlow * 1.1 },
        alpha: { start: 0.5, end: 0 },
        scale: { min: 0.6, max: 1.1 },
        frequency: 90,
      });
      foam.setDepth(3);
    }

    // lane tap zones — tap where you want your barrel to be
    laneOffsets.forEach((off, laneIdx) => {
      const hit = this.add.rectangle(centerX + off, (RIVER_TOP + RIVER_BOTTOM) / 2, zoneW / laneOffsets.length, RIVER_BOTTOM - RIVER_TOP, 0xffffff, 0);
      hit.setInteractive({ useHandCursor: true }).setDepth(5);
      hit.on('pointerdown', () => this.setLane(zone, laneIdx));
    });

    const info = CHAR_INFO[profile.char];
    const veh = this.add.container(centerX + laneOffsets[1], BARREL_Y).setDepth(6);
    const bob = this.add.container(0, 0);
    bob.add(addArt(this, 0, 8, 'tok-barrel', 0.8));
    bob.add(makePortrait(this, 0, -30, profile.char, 22));
    veh.add(bob);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: bob, y: -6, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    const wake = this.add.particles(0, 0, 'sparkle', { speed: { min: 20, max: 60 }, scale: { start: 0.4, end: 0 }, lifespan: 300, emitting: false });
    wake.setDepth(6);

    const zone = {
      centerX,
      left,
      zoneW,
      laneOffsets,
      laneIdx: 1,
      veh,
      wake,
      obstacles: [],
      distance: 0,
      stunUntil: 0,
      hits: 0,
      char: profile.char,
      name: profile.name,
      color: info.color,
    };
    return zone;
  }

  setLane(zone, laneIdx) {
    if (this.finished) return;
    zone.laneIdx = laneIdx;
    this.tweens.add({ targets: zone.veh, x: zone.centerX + zone.laneOffsets[laneIdx], duration: 160, ease: 'Sine.easeOut' });
  }

  spawnWave() {
    const n = this.zones[0].laneOffsets.length;
    const blocked = new Set();
    const blockCount = Phaser.Math.Between(1, n - 1); // always leave >=1 lane open
    while (blocked.size < blockCount) blocked.add(Phaser.Math.Between(0, n - 1));
    this.zones.forEach((zone) => {
      blocked.forEach((laneIdx) => {
        const img = addArt(this, zone.centerX + zone.laneOffsets[laneIdx], RIVER_TOP - 50, 'obstacle-rock', 0.85).setDepth(4);
        zone.obstacles.push({ img, lane: laneIdx, hit: false });
      });
    });
  }

  update(time, delta) {
    if (!this.zones) return;
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += delta;
    if (this.finished) return;

    // difficulty ramps gently and identically for every river — stays fair
    const flow = this.baseFlow * (1 + Math.min(this.elapsed / 40000, 0.5));
    this.spawnInterval = Math.max(650, 1100 - this.elapsed / 60);
    this.spawnAcc += delta;
    if (this.spawnAcc >= this.spawnInterval) {
      this.spawnAcc = 0;
      this.spawnWave();
    }

    this.zones.forEach((zone, i) => {
      const stunned = time < zone.stunUntil;
      zone.distance += flow * (stunned ? 0.3 : 1) * dt;

      for (let k = zone.obstacles.length - 1; k >= 0; k--) {
        const ob = zone.obstacles[k];
        ob.img.y += flow * dt;
        if (
          !ob.hit &&
          ob.lane === zone.laneIdx &&
          ob.img.y > BARREL_Y - 38 &&
          ob.img.y < BARREL_Y + 38
        ) {
          ob.hit = true;
          zone.hits++;
          zone.stunUntil = time + STUN_MS;
          sfx.miss();
          zone.wake.emitParticleAt(zone.veh.x, zone.veh.y, 8);
          this.tweens.add({ targets: zone.veh, angle: { from: -8, to: 8 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => zone.veh.setAngle(0) });
          this.cameras.main.shake(90, 0.0015);
        }
        if (ob.img.y > RIVER_BOTTOM + 60) {
          ob.img.destroy();
          zone.obstacles.splice(k, 1);
        }
      }

      const frac = Phaser.Math.Clamp(zone.distance / this.finishDist, 0, 1);
      this.markers[i].x = this.trackX0 + frac * (this.trackX1 - this.trackX0);

      if (zone.distance >= this.finishDist && !this.finished) this.win(zone);
    });
  }

  win(zone) {
    this.finished = true;
    sfx.win();
    this.cameras.main.flash(350, 214, 244, 255);
    const data = { replay: 'Barrels' };
    if (this.race) data.winner = { name: zone.name, char: zone.char };
    this.time.delayedCall(700, () => this.scene.launch('Win', data));
  }
}
