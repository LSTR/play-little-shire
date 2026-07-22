import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient, makePortrait, darken } from '../../ui.js';
import { getProfiles, CHAR_INFO } from '../../profiles.js';

const GEMS_TO_WIN = 5;

// Split-screen reflex duel: device flat on the table, one player per side.
// Player 2's half is rotated 180° so it reads correctly from across the table.
export default class DragonScene extends Phaser.Scene {
  constructor() {
    super('Dragon');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const profiles = getProfiles();
    this.players = profiles.map((p) => ({ ...p, gems: 0 }));
    this.phase = 'sleep';
    this.locked = [false, false];

    // --- the dragon's lair ---
    verticalGradient(this, 0, 0, W, H, '#26161A', '#4A2E20');
    if (!REDUCED_MOTION) {
      this.add.particles(0, 0, 'sparkle', {
        x: { min: 30, max: W - 30 },
        y: { min: H * 0.3, max: H * 0.7 },
        lifespan: 3000,
        speedY: { min: -10, max: -3 },
        scale: { start: 0.4, end: 0.1 },
        alpha: { start: 0, end: 0.5, ease: 'Sine.easeInOut' },
        tint: 0xf2b84b,
        frequency: 700,
      });
    }

    // --- Smaug on his hoard, eyes as a separate animatable sprite ---
    this.dragon = addArt(this, W / 2, 640, 'dragon-sleep', 1.1);
    this.eyes = addArt(this, W / 2, 640 - 30, 'eyes-closed', 1.1);
    this.zzz = this.add.text(W / 2 + 96, 528, 'z Z z', textStyle(34, HEX.gold, 600)).setAlpha(0.85).setAngle(14);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: this.zzz, y: 516, alpha: 0.5, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.smoke = this.add.particles(0, 0, 'cloud', {
      speedY: { min: -60, max: -30 },
      speedX: { min: -12, max: 12 },
      scale: { start: 0.06, end: 0.14 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 900,
      tint: 0xbbbbbb,
      emitting: false,
    });

    this.sparkle = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.7, end: 0 },
      lifespan: 550,
      emitting: false,
    });
    this.sparkle.setDepth(30);

    // --- player zones (P2 rotated for face-to-face play) ---
    this.zones = [this.makeZone(0, 1030, 0), this.makeZone(1, 250, 180)];

    // --- corners: home + sound (for the grown-up holding the table) ---
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    // dev deep-links: &wake=ms fixes the wake delay, &gems=N pre-fills both scores
    const params = new URLSearchParams(location.search);
    this.fixedWake = parseInt(params.get('wake'), 10) || null;
    const g0 = parseInt(params.get('gems'), 10);
    if (g0 > 0 && g0 < GEMS_TO_WIN) {
      this.players.forEach((p, i) => {
        p.gems = g0;
        this.renderGems(i);
      });
    }

    this.startRound();
  }

  makeZone(i, y, angle) {
    const p = this.players[i];
    const info = CHAR_INFO[p.char];
    const z = this.add.container(this.scale.width / 2, y).setAngle(angle);

    // the big button
    const btn = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(darken(info.color), 1);
    g.fillCircle(0, 8, 122);
    g.fillStyle(info.color, 1);
    g.fillCircle(0, 0, 120);
    g.fillStyle(0xffffff, 0.15);
    g.fillEllipse(0, -52, 156, 74);
    btn.add(g);
    btn.add(makePortrait(this, 0, -20, p.char, 46));
    btn.add(this.add.text(0, 58, p.name, textStyle(30, '#FFFFFF', 700)).setOrigin(0.5));
    btn.setSize(250, 250);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.tap(i)); // pointerdown: reflexes deserve zero latency
    z.add(btn);
    z.btn = btn;

    // gem slots
    z.gemSlots = [];
    for (let k = 0; k < GEMS_TO_WIN; k++) {
      const gx = (k - (GEMS_TO_WIN - 1) / 2) * 58;
      const slot = this.add.graphics();
      slot.lineStyle(3.5, info.color, 0.7);
      slot.strokeCircle(gx, -180, 23);
      z.add(slot);
      const gem = this.add.image(gx, -180, 'gem').setDisplaySize(38, 38).setVisible(false);
      z.add(gem);
      z.gemSlots.push({ x: gx, gem });
    }

    // status line
    z.status = this.add.text(0, -248, '', textStyle(30, HEX.parchment, 600)).setOrigin(0.5);
    z.add(z.status);
    return z;
  }

  renderGems(i) {
    this.zones[i].gemSlots.forEach((slot, k) => slot.gem.setVisible(k < this.players[i].gems));
  }

  setStatus(i, text, color = '#F7ECD4') {
    this.zones[i].status.setText(text).setColor(color);
  }

  startRound() {
    this.phase = 'sleep';
    this.locked = [false, false];
    this.eyes.setTexture('eyes-closed');
    this.zzz.setVisible(true);
    this.zones.forEach((z, i) => {
      z.btn.setAlpha(1);
      this.setStatus(i, t('dragon.sleep'));
    });

    const wait = this.fixedWake || Phaser.Math.Between(2000, 7000);
    // teasing blinks that punish the impatient
    for (let b = 0; b < 2; b++) {
      const bt = Phaser.Math.Between(700, Math.max(800, wait - 700));
      if (bt < wait - 500) {
        this.time.delayedCall(bt, () => {
          if (this.phase !== 'sleep') return;
          this.eyes.setTexture('eyes-half');
          this.time.delayedCall(240, () => {
            if (this.phase === 'sleep') this.eyes.setTexture('eyes-closed');
          });
        });
      }
    }
    this.wakeTimer = this.time.delayedCall(wait, () => this.wake());
  }

  wake() {
    if (this.phase !== 'sleep') return;
    this.phase = 'open';
    this.openedAt = this.time.now;
    this.eyes.setTexture('eyes-open');
    this.zzz.setVisible(false);
    sfx.roar();
    this.cameras.main.flash(200, 255, 214, 120);
    const ring = this.add.container(this.scale.width / 2, 640);
    const rg = this.add.graphics();
    rg.lineStyle(8, COLORS.gold, 0.9);
    rg.strokeCircle(0, 0, 130);
    ring.add(rg);
    this.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 450, ease: 'Sine.easeOut', onComplete: () => ring.destroy() });
    this.zones.forEach((z, i) => {
      if (!this.locked[i]) this.setStatus(i, t('dragon.now'), '#F2B84B');
    });
    // nobody reacted — the dragon goes back to sleep
    this.time.delayedCall(3000, () => {
      if (this.phase !== 'open') return;
      this.phase = 'result';
      this.eyes.setTexture('eyes-closed');
      this.time.delayedCall(800, () => this.startRound());
    });
  }

  tap(i) {
    if (this.phase === 'sleep') {
      if (this.locked[i]) return;
      this.locked[i] = true;
      sfx.lock();
      this.zones[i].btn.setAlpha(0.35);
      this.setStatus(i, t('dragon.early'), '#E88070');
      this.smoke.emitParticleAt(this.scale.width / 2, 560, 4);
      if (this.locked[0] && this.locked[1]) {
        // both jumped the gun — restart quietly
        this.wakeTimer.remove(false);
        this.phase = 'result';
        this.time.delayedCall(900, () => this.startRound());
      }
      return;
    }
    if (this.phase !== 'open' || this.locked[i]) return;
    this.phase = 'result';
    const p = this.players[i];
    p.gems++;
    sfx.match();
    this.setStatus(i, t('dragon.gem').replace('{name}', p.name), '#8FC15C');

    // the gem flies from the dragon to the winner's next slot
    const zone = this.zones[i];
    const slot = zone.gemSlots[p.gems - 1];
    const flip = zone.angle === 180 ? -1 : 1;
    const targetX = this.scale.width / 2 + flip * slot.x;
    const targetY = zone.y + flip * -180;
    const fly = this.add.image(this.scale.width / 2, 640, 'gem').setDisplaySize(56, 56).setDepth(40);
    this.tweens.add({
      targets: fly,
      x: targetX,
      y: targetY,
      displayWidth: 38,
      displayHeight: 38,
      duration: 520,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        fly.destroy();
        this.renderGems(i);
        this.sparkle.emitParticleAt(targetX, targetY, 8);
      },
    });

    this.time.delayedCall(700, () => this.eyes.setTexture('eyes-closed'));
    if (p.gems >= GEMS_TO_WIN) {
      sfx.win();
      this.time.delayedCall(1100, () => this.scene.launch('Win', { replay: 'Dragon', winner: { name: p.name, char: p.char } }));
    } else {
      this.time.delayedCall(1700, () => this.startRound());
    }
  }
}
