import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient, makePortrait } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const POOL = ['gem', 'tok-ring', 'tok-key', 'tok-sword', 'tok-egg', 'tok-candle'];
const SLOTS = 6;
const DECOYS = 5;

// Hand-placed floor spots — loose grid with breathing room for small fingers.
const SPOTS = [
  [95, 375], [270, 345], [450, 360], [620, 390],
  [110, 530], [300, 505], [480, 520], [635, 555],
  [165, 675], [350, 650], [525, 670], [640, 720],
];

// The calm one: no clock, no danger, no way to lose. The chest asks for one
// treasure at a time (glowing silhouette); players take turns tapping the
// matching treasure on the cave floor. Wrong taps just wobble — retry forever.
export default class TreasureScene extends Phaser.Scene {
  constructor() {
    super('Treasure');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = getProfiles();
    this.turn = 0;
    this.filled = 0;
    this.busy = false;
    this.finale = false;

    // --- the great hall under the mountain ---
    verticalGradient(this, 0, 0, W, H, '#1E2430', '#4A2E20');
    addArt(this, W / 2, 75, 'stalactites');
    if (!REDUCED_MOTION) {
      this.add.particles(0, 0, 'sparkle', {
        x: { min: 30, max: W - 30 },
        y: { min: H * 0.25, max: H * 0.8 },
        lifespan: 3200,
        speedY: { min: -8, max: -2 },
        scale: { start: 0.35, end: 0.08 },
        alpha: { start: 0, end: 0.5, ease: 'Sine.easeInOut' },
        tint: 0xf2b84b,
        frequency: 800,
      });
    }

    // --- turn banner ---
    this.portraits = this.players.map((p, i) => {
      const port = makePortrait(this, W / 2 + (i === 0 ? -80 : 80), 205, p.char, 42);
      const ring = this.add.graphics();
      ring.lineStyle(6, COLORS.gold, 1);
      ring.strokeCircle(0, 0, 50);
      port.addAt(ring, 0);
      port.ring = ring;
      return port;
    });
    this.turnText = this.add.text(W / 2, 285, '', textStyle(32, HEX.parchment, 600)).setOrigin(0.5);

    // --- corners ---
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    // dev deep-links: &fixed=1 disables shuffles, &filled=N pre-fills slots
    const params = new URLSearchParams(location.search);
    const fixed = params.get('fixed') === '1';

    // --- what the chest wants, and what lies on the floor ---
    this.needed = [...POOL];
    if (!fixed) Phaser.Utils.Array.Shuffle(this.needed);
    const floorTypes = [...this.needed];
    for (let d = 0; d < DECOYS; d++) {
      floorTypes.push(fixed ? POOL[d % POOL.length] : Phaser.Utils.Array.GetRandom(POOL));
    }
    const spots = [...SPOTS];
    if (!fixed) Phaser.Utils.Array.Shuffle(spots);

    this.items = floorTypes.map((type, k) => {
      const [x, y] = spots[k];
      const img = addArt(this, x, y, type, 1.05).setAngle(fixed ? 0 : Phaser.Math.Between(-14, 14));
      img.type = type;
      img.baseAngle = img.angle;
      img.setInteractive({ useHandCursor: true });
      img.on('pointerdown', () => this.tapItem(img));
      return img;
    });

    // --- the chest and its slot row ---
    this.chestOpen = addArt(this, W / 2, 1053, 'chest-open', 1.35);
    this.chestClosed = addArt(this, W / 2, 1094, 'chest-closed', 1.35).setVisible(false);

    this.slots = this.needed.map((type, k) => {
      const x = W / 2 + (k - (SLOTS - 1) / 2) * 100;
      const y = 865;
      const circle = this.add.graphics();
      circle.fillStyle(0x1e2430, 0.5);
      circle.fillCircle(x, y, 42);
      circle.lineStyle(4, COLORS.parchmentEdge, 0.45);
      circle.strokeCircle(x, y, 42);
      const ring = this.add.graphics();
      ring.lineStyle(6, COLORS.gold, 1);
      ring.strokeCircle(x, y, 46);
      ring.setAlpha(0);
      const sil = this.add.image(x, y, type).setDisplaySize(56, 56);
      sil.setTintFill(0x120d08);
      sil.setAlpha(0.8);
      return { x, y, type, ring, sil };
    });

    const g0 = parseInt(params.get('filled'), 10) || 0;
    for (let k = 0; k < Math.min(g0, SLOTS); k++) this.prefill(k);

    this.updateTurn();
    this.activateSlot();
  }

  prefill(k) {
    const slot = this.slots[k];
    slot.sil.clearTint();
    slot.sil.setAlpha(1);
    const item = this.items.find((it) => it.active && it.type === slot.type);
    if (item) {
      item.disableInteractive();
      item.destroy();
    }
    this.filled++;
    this.turn = this.filled % 2;
  }

  updateTurn() {
    this.portraits.forEach((port, i) => {
      const active = i === this.turn;
      port.ring.setAlpha(active ? 1 : 0);
      port.setAlpha(active ? 1 : 0.45);
      port.setScale(active ? 1.08 : 0.9);
    });
    this.turnText.setText(t('treasure.turn').replace('{name}', this.players[this.turn].name)).setColor(HEX.parchment);
  }

  activateSlot() {
    this.slots.forEach((slot, k) => {
      this.tweens.killTweensOf([slot.ring, slot.sil]);
      if (k < this.filled) return; // already filled: colored, no ring
      slot.ring.setAlpha(0);
      slot.sil.setAlpha(k === this.filled ? 0.8 : 0.35);
      if (k === this.filled) {
        if (REDUCED_MOTION) {
          slot.ring.setAlpha(0.9);
        } else {
          slot.ring.setAlpha(0.3);
          this.tweens.add({ targets: slot.ring, alpha: 1, duration: 550, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
          this.tweens.add({ targets: slot.sil, alpha: 0.45, duration: 550, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        }
      }
    });
  }

  tapItem(item) {
    if (this.busy || this.finale) return;
    const slot = this.slots[this.filled];
    if (item.type !== slot.type) {
      // friendly wobble — no penalty, no timer, try again
      sfx.miss();
      this.tweens.killTweensOf(item);
      this.tweens.add({ targets: item, angle: item.baseAngle + 12, duration: 70, yoyo: true, repeat: 3, onComplete: () => item.setAngle(item.baseAngle) });
      return;
    }

    this.busy = true;
    sfx.pop();
    item.disableInteractive();
    this.tweens.killTweensOf(item);
    this.tweens.add({
      targets: item,
      x: slot.x,
      y: slot.y,
      angle: 0,
      displayWidth: 56,
      displayHeight: 56,
      duration: 550,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        item.destroy();
        sfx.match();
        slot.sil.clearTint();
        slot.sil.setAlpha(1);
        this.sparkleAt(slot.x, slot.y, 8);
        this.filled++;
        this.busy = false;
        if (this.filled >= SLOTS) {
          this.closeChest();
        } else {
          this.turn = 1 - this.turn;
          this.updateTurn();
          this.activateSlot();
        }
      },
    });
  }

  sparkleAt(x, y, n) {
    if (!this.burst) {
      this.burst = this.add.particles(0, 0, 'sparkle', {
        speed: { min: 60, max: 200 },
        scale: { start: 0.8, end: 0 },
        lifespan: 600,
        tint: 0xf2b84b,
        emitting: false,
      });
      this.burst.setDepth(30);
    }
    this.burst.emitParticleAt(x, y, n);
  }

  closeChest() {
    this.finale = true;
    this.slots.forEach((slot) => {
      this.tweens.killTweensOf([slot.ring, slot.sil]);
      slot.ring.setAlpha(0);
    });
    this.turnText.setText(t('treasure.full')).setColor(HEX.gold);
    this.portraits.forEach((port) => {
      port.ring.setAlpha(1);
      port.setAlpha(1);
      port.setScale(1.08);
    });

    this.time.delayedCall(600, () => {
      this.chestOpen.setVisible(false);
      this.chestClosed.setVisible(true);
      sfx.win();
      const W = this.scale.width;
      for (let b = 0; b < 5; b++) {
        this.time.delayedCall(b * 160, () =>
          this.sparkleAt(W / 2 + Phaser.Math.Between(-140, 140), 1060 + Phaser.Math.Between(-60, 40), 10)
        );
      }
      this.time.delayedCall(1500, () =>
        this.scene.launch('Win', { replay: 'Treasure', team: this.players.map((p) => p.char) })
      );
    });
  }
}
