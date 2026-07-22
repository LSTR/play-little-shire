import Phaser from 'phaser';
import { HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient, makePortrait, darken } from '../../ui.js';
import { getProfiles, CHAR_INFO } from '../../profiles.js';

const ROUNDS_TO_WIN = 2;
const TAP_MIN_MS = 80; // ~12 taps/second max, so finger-dragging doesn't cheat

// Split-screen mash duel: pull the rope, drag the troll into your mud pool.
export default class TugScene extends Phaser.Scene {
  constructor() {
    super('Tug');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = getProfiles().map((p) => ({ ...p, rounds: 0 }));
    this.pos = 0; // -1 = top player wins the round, +1 = bottom player
    this.phase = 'ready';
    this.lastTap = [0, 0];
    this.pull = parseFloat(new URLSearchParams(location.search).get('pull')) || 0.045;

    // grassy arena
    verticalGradient(this, 0, 0, W, H, '#3E6B35', '#7FB35A');
    addArt(this, W / 2, 378, 'mud', 1);
    addArt(this, W / 2, 902, 'mud', 1);

    this.ropeG = this.add.graphics().setDepth(5);
    this.troll = this.add.container(W / 2, 640).setDepth(6);
    this.troll.add(addArt(this, 0, 0, 'troll-body', 0.95));

    const dg = this.make.graphics({ add: false });
    dg.fillStyle(0x6b4426, 1);
    dg.fillCircle(7, 7, 7);
    dg.generateTexture('mud-drop', 14, 14);
    dg.destroy();
    this.splash = this.add.particles(0, 0, 'mud-drop', {
      speed: { min: 120, max: 280 },
      angle: { min: 200, max: 340 },
      gravityY: 500,
      scale: { min: 0.6, max: 1.3 },
      lifespan: 700,
      emitting: false,
    });
    this.splash.setDepth(7);

    this.zones = [this.makeZone(0, 1075, 0), this.makeZone(1, 205, 180)];
    this.updateDots();

    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    this.startRound();
  }

  makeZone(i, y, angle) {
    const p = this.players[i];
    const info = CHAR_INFO[p.char];
    const z = this.add.container(this.scale.width / 2, y).setAngle(angle);

    const btn = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(darken(info.color), 1);
    g.fillCircle(0, 8, 114);
    g.fillStyle(info.color, 1);
    g.fillCircle(0, 0, 112);
    g.fillStyle(0xffffff, 0.15);
    g.fillEllipse(0, -48, 146, 68);
    btn.add(g);
    btn.add(makePortrait(this, 0, -20, p.char, 42));
    btn.add(this.add.text(0, 52, p.name, textStyle(28, '#FFFFFF', 700)).setOrigin(0.5));
    btn.setSize(235, 235);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.tap(i));
    z.add(btn);
    z.btn = btn;

    // round dots (best of 3)
    z.dots = [];
    for (let k = 0; k < ROUNDS_TO_WIN; k++) {
      const d = this.add.graphics();
      d.setPosition(k * 46 - 23, -152);
      z.add(d);
      z.dots.push(d);
    }

    z.status = this.add.text(0, -204, '', textStyle(29, HEX.parchment, 600)).setOrigin(0.5);
    z.add(z.status);
    return z;
  }

  updateDots() {
    this.zones.forEach((z, i) => {
      z.dots.forEach((d, k) => {
        d.clear();
        d.lineStyle(4, 0xf2b84b, 1);
        d.strokeCircle(0, 0, 14);
        if (k < this.players[i].rounds) {
          d.fillStyle(0xf2b84b, 1);
          d.fillCircle(0, 0, 14);
        }
      });
    });
  }

  setStatus(i, text, color = '#F7ECD4') {
    this.zones[i].status.setText(text).setColor(color);
  }

  startRound() {
    this.phase = 'ready';
    this.pos = 0;
    this.troll.setPosition(this.scale.width / 2, 640).setAngle(0).setAlpha(1).setScale(1);
    this.zones.forEach((z, i) => this.setStatus(i, t('tug.ready')));
    this.time.delayedCall(1000, () => {
      this.phase = 'play';
      sfx.pop();
      this.zones.forEach((z, i) => this.setStatus(i, t('tug.go'), '#F2B84B'));
      const go = this.add
        .text(this.scale.width / 2, 640, t('tug.go'), textStyle(120, HEX.gold, 700))
        .setOrigin(0.5)
        .setDepth(40)
        .setShadow(0, 5, '#1E3018', 6)
        .setScale(0);
      this.tweens.add({ targets: go, scale: 1, duration: 220, ease: 'Back.easeOut' });
      this.tweens.add({ targets: go, alpha: 0, delay: 500, duration: 250, onComplete: () => go.destroy() });
    });
  }

  tap(i) {
    if (this.phase !== 'play') return;
    const now = this.time.now;
    if (now - this.lastTap[i] < TAP_MIN_MS) return;
    this.lastTap[i] = now;
    sfx.flip();
    const dir = i === 0 ? 1 : -1;
    this.pos = Phaser.Math.Clamp(this.pos + dir * this.pull, -1.15, 1.15);
    if (Math.abs(this.pos) >= 1) this.endRound(this.pos > 0 ? 0 : 1);
  }

  endRound(wi) {
    this.phase = 'result';
    const winner = this.players[wi];
    const mudY = wi === 0 ? 902 : 378;
    sfx.miss();
    this.tweens.add({
      targets: this.troll,
      y: mudY,
      angle: wi === 0 ? 96 : -96,
      scale: 0.8,
      duration: 420,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.splash.emitParticleAt(this.scale.width / 2, mudY, 16);
        this.cameras.main.shake(140, 0.004);
        sfx.match();
      },
    });
    winner.rounds++;
    this.updateDots();
    this.setStatus(wi, t('tug.round').replace('{name}', winner.name), '#8FC15C');
    this.setStatus(1 - wi, '');

    if (winner.rounds >= ROUNDS_TO_WIN) {
      sfx.win();
      this.time.delayedCall(1300, () =>
        this.scene.launch('Win', { replay: 'Tug', winner: { name: winner.name, char: winner.char } })
      );
    } else {
      this.time.delayedCall(1800, () => this.startRound());
    }
  }

  update(time) {
    // rope: two segments meeting at the troll's hands, with a knot
    const grip = { x: this.troll.x, y: this.troll.y - 64 };
    const g = this.ropeG;
    g.clear();
    g.lineStyle(10, 0xd9c6a0, 1);
    g.beginPath();
    g.moveTo(this.scale.width / 2, 338);
    g.lineTo(grip.x, grip.y);
    g.lineTo(this.scale.width / 2, 942);
    g.strokePath();
    g.fillStyle(0xc9912d, 1);
    g.fillCircle(grip.x, grip.y, 13);

    if (this.phase === 'play') {
      this.troll.y = 640 + this.pos * 215;
      const wobble = REDUCED_MOTION ? 0 : Math.sin(time * 0.03) * (2 + Math.abs(this.pos) * 10);
      this.troll.x = this.scale.width / 2 + wobble;
      this.troll.angle = wobble * 0.5;
    }
  }
}
