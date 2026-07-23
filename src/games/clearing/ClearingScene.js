import Phaser from 'phaser';
import { COLORS, REDUCED_MOTION } from '../../config.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, iconButton, verticalGradient, makePortrait } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const PLAY_TOP = 200;
const PLAY_BOTTOM = 1280;
const GOAL = { x: 360, y: 260 };
const START = { x: 360, y: 1120 };
const SPEED = 230; // px/s
const SPIDERS_DEFAULT = 6;

const JOY_BASE = { x: 130, y: 1150 };
const JOY_RADIUS = 70;
const JOY_DEADZONE = 14;

// The catalog's first free-roam game: a virtual joystick instead of taps or
// turns. One player walks from the bottom of a small clearing to the gate at
// the top. Spiders are in the way but never block the path — tap one to shoo
// it off (same gesture as Defender la Comarca), or just steer around it.
// No clock, no way to lose: "defeat or pass by" are equally valid.
export default class ClearingScene extends Phaser.Scene {
  constructor() {
    super('Clearing');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.profile = getProfiles()[0];
    this.finished = false;
    this.joyActive = false;
    this.joyDir = { x: 0, y: 0 };

    // --- the forest clearing at dusk ---
    verticalGradient(this, 0, 0, W, H, '#22331E', '#4A6B3A');
    const treeSpots = [
      [70, 340, 0.6], [640, 420, 0.55], [110, 780, 0.65],
      [610, 950, 0.6], [180, 1180, 0.55], [560, 1220, 0.6],
    ];
    treeSpots.forEach(([x, y, s]) => addArt(this, x, y, 'tok-tree', s).setTint(0x2f4a2a).setAlpha(0.8).setDepth(1));
    if (!REDUCED_MOTION) {
      for (let s = 0; s < 12; s++) {
        this.add.image(Phaser.Math.Between(20, W - 20), Phaser.Math.Between(60, 400), 'sparkle')
          .setDisplaySize(7, 7)
          .setAlpha(Phaser.Math.FloatBetween(0.2, 0.5));
      }
    }

    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    // dev deep-link: &spiders=N sets how many are scattered in the clearing
    const params = new URLSearchParams(location.search);
    const spiderCount = Math.max(0, parseInt(params.get('spiders'), 10) || SPIDERS_DEFAULT);

    // --- the goal ---
    this.add.circle(GOAL.x, GOAL.y, 78, 0xf2b84b, 0.16).setDepth(2);
    addArt(this, GOAL.x, GOAL.y, 'gate', 1.4).setDepth(3);

    // --- spiders, scattered clear of the start/goal and each other ---
    this.spiders = [];
    for (let i = 0; i < spiderCount; i++) {
      let x, y, tries = 0;
      do {
        x = Phaser.Math.Between(90, W - 90);
        y = Phaser.Math.Between(PLAY_TOP + 170, PLAY_BOTTOM - 260);
        tries++;
      } while (
        tries < 25 &&
        (Phaser.Math.Distance.Between(x, y, GOAL.x, GOAL.y) < 150 ||
          this.spiders.some((sp) => Phaser.Math.Distance.Between(x, y, sp.x, sp.y) < 95))
      );
      const img = addArt(this, x, y, 'tok-spider', 1).setDepth(4);
      img.setInteractive({ useHandCursor: true });
      const spider = { x, y, img };
      img.on('pointerdown', () => this.shooSpider(spider));
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: img, y: y - 8, duration: 650 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      this.spiders.push(spider);
    }

    // --- the walker ---
    this.player = { x: START.x, y: START.y };
    this.playerImg = makePortrait(this, START.x, START.y, this.profile.char, 44).setDepth(10);

    // --- virtual joystick, fixed in the corner ---
    const joyBase = this.add.circle(JOY_BASE.x, JOY_BASE.y, JOY_RADIUS, 0x1e2430, 0.28).setDepth(20);
    joyBase.setStrokeStyle(4, 0xf7ecd4, 0.4);
    this.nub = this.add.circle(JOY_BASE.x, JOY_BASE.y, 34, COLORS.gold, 0.9).setDepth(21);
    this.nub.setStrokeStyle(3, COLORS.goldDark, 1);

    const joyHit = this.add.circle(JOY_BASE.x, JOY_BASE.y, JOY_RADIUS + 24, 0xffffff, 0.001).setDepth(19);
    joyHit.setInteractive();
    joyHit.on('pointerdown', (p) => {
      this.joyPointerId = p.id;
      this.joyActive = true;
      this.updateJoyNub(p.x, p.y);
    });
    this.input.on('pointermove', (p) => {
      if (this.joyActive && p.id === this.joyPointerId) this.updateJoyNub(p.x, p.y);
    });
    const endJoy = (p) => {
      if (p.id === this.joyPointerId) {
        this.joyActive = false;
        this.joyDir = { x: 0, y: 0 };
        this.nub.setPosition(JOY_BASE.x, JOY_BASE.y);
      }
    };
    this.input.on('pointerup', endJoy);
    this.input.on('pointerupoutside', endJoy);
  }

  updateJoyNub(px, py) {
    const dx = px - JOY_BASE.x;
    const dy = py - JOY_BASE.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, JOY_RADIUS);
    const nx = dist > 0 ? dx / dist : 0;
    const ny = dist > 0 ? dy / dist : 0;
    this.nub.setPosition(JOY_BASE.x + nx * clamped, JOY_BASE.y + ny * clamped);
    this.joyDir = dist > JOY_DEADZONE ? { x: nx, y: ny } : { x: 0, y: 0 };
  }

  shooSpider(spider) {
    if (this.finished || !this.spiders.includes(spider)) return;
    sfx.pop();
    Phaser.Utils.Array.Remove(this.spiders, spider);
    this.tweens.killTweensOf(spider.img);
    this.tweens.add({
      targets: spider.img,
      scale: 0,
      alpha: 0,
      angle: 180,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => spider.img.destroy(),
    });
  }

  update(time, delta) {
    if (this.finished) return;
    const dt = Math.min(delta, 50) / 1000;

    if (this.joyDir.x || this.joyDir.y) {
      this.player.x = Phaser.Math.Clamp(this.player.x + this.joyDir.x * SPEED * dt, 60, this.scale.width - 60);
      this.player.y = Phaser.Math.Clamp(this.player.y + this.joyDir.y * SPEED * dt, PLAY_TOP + 40, PLAY_BOTTOM - 40);
      this.playerImg.setPosition(this.player.x, this.player.y);
      if (Math.abs(this.joyDir.x) > 0.15) this.playerImg.scaleX = this.joyDir.x < 0 ? -1 : 1;
    }

    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, GOAL.x, GOAL.y) < 72) this.win();
  }

  win() {
    this.finished = true;
    sfx.win();
    this.cameras.main.flash(350, 214, 244, 255);
    this.time.delayedCall(600, () =>
      this.scene.launch('Win', { replay: 'Clearing', winner: { name: this.profile.name, char: this.profile.char } })
    );
  }
}
