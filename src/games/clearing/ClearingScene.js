import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient, makePortrait } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const PLAY_TOP = 200;
const PLAY_BOTTOM = 1280;
const GOAL = { x: 360, y: 260 };
const START = { x: 360, y: 1120 };
const SPEED = 230; // px/s
const SPIDERS_DEFAULT = 6;
const TROLLS_DEFAULT = 2;
const GEMS_DEFAULT = 4;

const JOY_BASE = { x: 130, y: 1150 };
const JOY_RADIUS = 70;
const JOY_DEADZONE = 14;

// The catalog's first free-roam game: a virtual joystick instead of taps or
// turns. One player walks from the bottom of a small clearing to the gate at
// the top. Two creature types are in the way (spiders sit still, trolls
// patrol slowly) but neither ever blocks the path — tap one to shoo it off,
// or just steer around it. Gems along the way are a free bonus, walk over to
// collect. No clock, no way to lose: "defeat or pass by" are equally valid.
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
    this.gemsCollected = 0;

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

    // --- gem counter ---
    addArt(this, W / 2 - 18, 140, 'gem', 0.55).setDepth(6);
    this.gemText = this.add.text(W / 2 + 14, 140, '0', textStyle(30, HEX.parchment, 700)).setOrigin(0, 0.5).setDepth(6);

    // dev deep-links: &spiders=N &trolls=N &gems=N set how many of each appear
    const params = new URLSearchParams(location.search);
    const spiderCount = Math.max(0, parseInt(params.get('spiders'), 10) || SPIDERS_DEFAULT);
    const trollCount = Math.max(0, parseInt(params.get('trolls'), 10) || TROLLS_DEFAULT);
    const gemCount = Math.max(0, parseInt(params.get('gems'), 10) || GEMS_DEFAULT);

    // --- the goal ---
    this.add.circle(GOAL.x, GOAL.y, 78, 0xf2b84b, 0.16).setDepth(2);
    addArt(this, GOAL.x, GOAL.y, 'gate', 1.4).setDepth(3);

    this.creatures = [];
    this.gems = [];
    for (let i = 0; i < spiderCount; i++) this.spawnCreature('tok-spider', 1, 0);
    for (let i = 0; i < trollCount; i++) this.spawnCreature('tok-troll', 1.25, 70);
    for (let i = 0; i < gemCount; i++) this.spawnGem();

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

  // shared spot-finder: keeps new things clear of the goal and each other
  findSpot(minGoalDist) {
    const W = this.scale.width;
    let x, y, tries = 0;
    do {
      x = Phaser.Math.Between(90, W - 90);
      y = Phaser.Math.Between(PLAY_TOP + 170, PLAY_BOTTOM - 260);
      tries++;
    } while (
      tries < 25 &&
      (Phaser.Math.Distance.Between(x, y, GOAL.x, GOAL.y) < minGoalDist ||
        this.creatures.some((c) => Phaser.Math.Distance.Between(x, y, c.x, c.y) < 95) ||
        this.gems.some((g) => Phaser.Math.Distance.Between(x, y, g.x, g.y) < 80))
    );
    return { x, y };
  }

  spawnCreature(key, scale, wanderX) {
    const { x, y } = this.findSpot(150);
    const img = addArt(this, x, y, key, scale).setDepth(4);
    img.setInteractive({ useHandCursor: true });
    const creature = { x, y, img };
    img.on('pointerdown', () => this.shooCreature(creature));
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: img, y: y - 8, duration: 650 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      if (wanderX) {
        this.tweens.add({ targets: img, x: x + wanderX, duration: 2200 + Math.random() * 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }
    this.creatures.push(creature);
  }

  spawnGem() {
    const { x, y } = this.findSpot(130);
    const img = addArt(this, x, y, 'gem', 0.85).setDepth(4);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: img, y: y - 10, angle: 8, duration: 750 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.gems.push({ x, y, img });
  }

  shooCreature(creature) {
    if (this.finished || !this.creatures.includes(creature)) return;
    sfx.pop();
    Phaser.Utils.Array.Remove(this.creatures, creature);
    this.tweens.killTweensOf(creature.img);
    this.tweens.add({
      targets: creature.img,
      scale: 0,
      alpha: 0,
      angle: 180,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: () => creature.img.destroy(),
    });
  }

  collectGem(gem) {
    Phaser.Utils.Array.Remove(this.gems, gem);
    this.gemsCollected++;
    this.gemText.setText(String(this.gemsCollected));
    sfx.pop();
    this.tweens.killTweensOf(gem.img);
    this.tweens.add({
      targets: gem.img,
      scale: 0,
      alpha: 0,
      y: gem.img.y - 30,
      duration: 320,
      ease: 'Back.easeIn',
      onComplete: () => gem.img.destroy(),
    });
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

  update(time, delta) {
    if (this.finished) return;
    const dt = Math.min(delta, 50) / 1000;

    if (this.joyDir.x || this.joyDir.y) {
      this.player.x = Phaser.Math.Clamp(this.player.x + this.joyDir.x * SPEED * dt, 60, this.scale.width - 60);
      this.player.y = Phaser.Math.Clamp(this.player.y + this.joyDir.y * SPEED * dt, PLAY_TOP + 40, PLAY_BOTTOM - 40);
      this.playerImg.setPosition(this.player.x, this.player.y);
      if (Math.abs(this.joyDir.x) > 0.15) this.playerImg.scaleX = this.joyDir.x < 0 ? -1 : 1;
    }

    for (let k = this.gems.length - 1; k >= 0; k--) {
      const g = this.gems[k];
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, g.x, g.y) < 55) this.collectGem(g);
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
