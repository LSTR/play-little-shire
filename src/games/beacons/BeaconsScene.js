import Phaser from 'phaser';
import { COLORS, REDUCED_MOTION } from '../../config.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, iconButton, verticalGradient, makePortrait } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const WINDOW_MS = 2200;

// Beacon rows, nearest (bottom) to farthest (top) — each row holds one beacon
// per player, left column always player 1, right column always player 2.
const ROWS = [
  { y: 1080, scale: 1.25, x: [190, 530] },
  { y: 800, scale: 1.0, x: [230, 490] },
  { y: 540, scale: 0.78, x: [270, 450] },
];

// The signal relay from Return of the King, in miniature: it zigzags left,
// right, left, right, up the mountainside, so both players get equal turns.
// Each beacon gets a shrinking ring once the flame reaches it; light it in
// time and the spark leaps onward. Miss the window and — unlike the film —
// nothing is lost: that same beacon just tries again (this project's rule is
// no harsh fail states, so "the chain breaks" becomes "try that one again").
export default class BeaconsScene extends Phaser.Scene {
  constructor() {
    super('Beacons');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = getProfiles();
    this.finished = false;
    this.busy = false;
    this.current = -1;
    this.deadline = 0;

    // dev deep-links: &window=ms tap-window duration, &beacon=0-5 starts with
    // the earlier beacons already lit (deterministic screenshot testing)
    const params = new URLSearchParams(location.search);
    this.windowMs = parseInt(params.get('window'), 10) || WINDOW_MS;
    const startAt = parseInt(params.get('beacon'), 10);

    // --- dusk sky over the mountains ---
    verticalGradient(this, 0, 0, W, H, '#242850', '#D98A4A');
    if (!REDUCED_MOTION) {
      for (let s = 0; s < 16; s++) {
        this.add
          .image(Phaser.Math.Between(20, W - 20), Phaser.Math.Between(40, 400), 'sparkle')
          .setDisplaySize(8, 8)
          .setAlpha(Phaser.Math.FloatBetween(0.2, 0.55));
      }
    }
    addArt(this, W / 2, 470, 'peaks', 1.1).setTint(0x2c3050).setAlpha(0.85).setDepth(1);

    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    makePortrait(this, 200, 160, this.players[0].char, 30);
    makePortrait(this, 520, 160, this.players[1].char, 30);

    // --- the beacon chain ---
    this.sequence = [];
    ROWS.forEach((row, ri) => {
      row.x.forEach((x, ci) => {
        const img = addArt(this, x, row.y, 'beacon-unlit', row.scale).setDepth(4);
        img.setInteractive({ useHandCursor: true });
        const ring = this.add.graphics().setDepth(5);
        ring.lineStyle(10, COLORS.gold, 1);
        ring.strokeCircle(0, 0, 75 * row.scale);
        ring.setPosition(x, row.y);
        ring.setVisible(false);
        const b = { x, y: row.y, scale: row.scale, baseScale: img.scaleX, col: ci, row: ri, img, ring, lit: false };
        img.on('pointerdown', () => this.tryLight(b));
        this.sequence.push(b);
      });
    });

    this.spark = addArt(this, 0, 0, 'sparkle', 1.4).setTint(0xffcf7a).setDepth(6).setVisible(false);
    this.emberBurst = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 20, max: 70 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      tint: 0xf2b84b,
      emitting: false,
    });
    this.emberBurst.setDepth(6);

    if (startAt >= 0 && startAt <= 5) {
      for (let i = 0; i < startAt; i++) this.igniteInstant(this.sequence[i]);
      this.advance(startAt);
    } else {
      this.time.delayedCall(500, () => this.advance(0));
    }
  }

  igniteInstant(b) {
    b.lit = true;
    b.img.setTexture('beacon-lit');
    b.img.disableInteractive();
    this.startFlicker(b);
  }

  startFlicker(b) {
    if (REDUCED_MOTION) return;
    this.tweens.add({
      targets: b.img,
      alpha: { from: 1, to: 0.82 },
      duration: 160 + Math.random() * 140,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  advance(idx) {
    this.current = idx;
    if (idx >= this.sequence.length) {
      this.win();
      return;
    }
    const b = this.sequence[idx];
    const from = idx === 0 ? { x: this.scale.width / 2, y: this.scale.height + 40 } : { x: this.sequence[idx - 1].x, y: this.sequence[idx - 1].y };
    this.spark.setPosition(from.x, from.y).setVisible(true).setScale(0.8).setAlpha(1);
    this.tweens.add({
      targets: this.spark,
      x: b.x,
      y: b.y - 20,
      duration: 450,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.spark.setVisible(false);
        this.emberBurst.emitParticleAt(b.x, b.y - 20, 6);
        this.armBeacon(b);
      },
    });
  }

  armBeacon(b) {
    this.deadline = this.time.now + this.windowMs;
    b.ring.setScale(1).setAlpha(1).setVisible(true);
    this.tweens.add({ targets: b.ring, scale: 0.5, alpha: 0.3, duration: this.windowMs, ease: 'Linear' });
    this.tweens.add({
      targets: b.img,
      scale: { from: b.baseScale, to: b.baseScale * 1.1 },
      yoyo: true,
      repeat: -1,
      duration: 260,
      ease: 'Sine.easeInOut',
    });
  }

  tryLight(b) {
    if (this.finished || this.busy) return;
    const cur = this.sequence[this.current];
    if (b !== cur || b.lit) {
      if (!b.lit) {
        this.tweens.add({ targets: b.img, angle: { from: -6, to: 6 }, duration: 60, yoyo: true, repeat: 2, onComplete: () => b.img.setAngle(0) });
      }
      return;
    }
    this.igniteBeacon(cur);
  }

  igniteBeacon(b) {
    this.busy = true;
    b.lit = true;
    b.ring.setVisible(false);
    this.tweens.killTweensOf(b.img);
    b.img.setScale(b.baseScale).setTexture('beacon-lit');
    b.img.disableInteractive();
    sfx.match();
    this.emberBurst.emitParticleAt(b.x, b.y - 30 * b.scale, 10);
    this.tweens.add({ targets: b.img, scale: { from: b.baseScale * 1.2, to: b.baseScale }, duration: 220, ease: 'Back.easeOut' });
    this.startFlicker(b);
    this.time.delayedCall(500, () => {
      this.busy = false;
      this.advance(this.current + 1);
    });
  }

  // missed the window — same beacon tries again, nothing lost (no harsh fail states)
  missBeacon(b) {
    this.busy = true;
    sfx.miss();
    this.tweens.killTweensOf(b.img);
    b.img.setScale(b.baseScale);
    b.ring.setVisible(false);
    this.tweens.add({ targets: b.img, angle: { from: -8, to: 8 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => b.img.setAngle(0) });
    if (!REDUCED_MOTION) this.cameras.main.shake(60, 0.001);
    this.time.delayedCall(500, () => {
      this.busy = false;
      this.armBeacon(b);
    });
  }

  update(time) {
    if (this.finished || this.busy || this.current < 0 || this.current >= this.sequence.length) return;
    const b = this.sequence[this.current];
    if (!b.lit && time > this.deadline) this.missBeacon(b);
  }

  win() {
    this.finished = true;
    sfx.win();
    const last = this.sequence[this.sequence.length - 1];
    this.spark.setPosition(last.x, last.y - 20).setVisible(true).setScale(0.8).setAlpha(1);
    this.tweens.add({ targets: this.spark, y: -80, alpha: 0, duration: 700, ease: 'Sine.easeIn' });
    this.cameras.main.flash(400, 255, 224, 150);
    this.time.delayedCall(1000, () =>
      this.scene.launch('Win', { replay: 'Beacons', team: this.players.map((p) => p.char) })
    );
  }
}
