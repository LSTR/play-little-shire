import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient } from '../../ui.js';
import { showPlayerSetup, playerRoster, makeScoreChips } from '../setup.js';

const ITEMS = [
  'tok-ring',
  'tok-dragon',
  'tok-wizard',
  'tok-mountain',
  'tok-tree',
  'tok-mushroom',
  'tok-sword',
  'tok-spider',
];

const CARD_W = 128;
const CARD_H = 155;

export default class MemoryScene extends Phaser.Scene {
  constructor() {
    super('Memory');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.pairs = 0;
    this.open = [];
    this.lock = false;
    this.mp = null;

    // --- evening meadow backdrop ---
    verticalGradient(this, 0, 0, W, H, '#23411F', '#3E6B35');
    addArt(this, W / 2, H, 'hill-near').setOrigin(0.5, 1).setTint(0x2a4a26).setAlpha(0.9);
    addArt(this, W / 2, H - 90, 'hill-mid').setOrigin(0.5, 1).setTint(0x315530).setAlpha(0.7);
    if (!REDUCED_MOTION) {
      this.add.particles(0, 0, 'firefly', {
        x: { min: 30, max: W - 30 },
        y: { min: H * 0.15, max: H * 0.95 },
        lifespan: 4500,
        speedX: { min: -12, max: 12 },
        speedY: { min: -18, max: 6 },
        scale: { start: 0.5, end: 0.15 },
        alpha: { start: 0, end: 0.9, ease: 'Sine.easeInOut' },
        frequency: 500,
      });
    }

    // --- top bar (same layout in every game) ---
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });
    this.add.image(W / 2 - 74, 70, 'icon-star').setDisplaySize(42, 42);
    this.progress = this.add
      .text(W / 2 + 20, 70, `0 / ${ITEMS.length}`, textStyle(36, HEX.parchment, 600))
      .setOrigin(0.5);

    // --- card front texture (generated once) ---
    if (!this.textures.exists('mem-front')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(COLORS.parchment, 1);
      g.fillRoundedRect(0, 0, CARD_W, CARD_H, 16);
      g.lineStyle(5, COLORS.parchmentEdge, 1);
      g.strokeRoundedRect(2, 2, CARD_W - 4, CARD_H - 4, 16);
      g.generateTexture('mem-front', CARD_W, CARD_H);
      g.destroy();
    }

    // sparkle burst emitter for matches
    this.sparkle = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.7, end: 0 },
      lifespan: 550,
      emitting: false,
    });
    this.sparkle.setDepth(10);

    // dev deep-link: &players=N skips setup
    const pCount = parseInt(new URLSearchParams(location.search).get('players'), 10);
    if (pCount === 1) this.beginGame(null);
    else if (pCount >= 2 && pCount <= 4) this.beginGame(playerRoster(pCount));
    else showPlayerSetup(this, { onStart: (roster) => this.beginGame(roster) });
  }

  beginGame(roster) {
    const W = this.scale.width;
    if (roster) {
      this.mp = { players: roster.map((p) => ({ ...p, score: 0 })), turn: 0 };
      this.chipsUi = makeScoreChips(this, roster);
      this.updateChips();
    } else {
      this.add
        .text(W / 2, 168, t('memory.title'), textStyle(40, HEX.gold, 700))
        .setOrigin(0.5)
        .setShadow(0, 3, '#1E3018', 3);
    }

    // --- deal the doors ---
    const deck = Phaser.Utils.Array.Shuffle([...ITEMS, ...ITEMS]);
    const gapX = 18;
    const gapY = 20;
    const x0 = W / 2 - (3 * (CARD_W + gapX)) / 2;
    const y0 = 330;
    deck.forEach((key, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      this.makeCard(x0 + col * (CARD_W + gapX), y0 + row * (CARD_H + gapY), key, i);
    });
  }

  updateChips() {
    this.chipsUi.update(this.mp.players.map((p) => p.score), this.mp.turn);
  }

  makeCard(x, y, key, i) {
    const c = this.add.container(x, y);
    c.back = this.add.image(0, 0, 'card-back').setDisplaySize(CARD_W, CARD_H);
    c.frontBg = this.add.image(0, 0, 'mem-front').setVisible(false);
    c.token = addArt(this, 0, 0, key, 0.9).setVisible(false);
    c.add([c.back, c.frontBg, c.token]);
    c.key = key;
    c.isOpen = false;
    c.matched = false;
    c.setSize(CARD_W, CARD_H);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerup', () => this.tap(c));

    // deal-in animation
    c.setScale(0).setAngle(-6);
    this.tweens.add({ targets: c, scale: 1, angle: 0, duration: 320, delay: i * 35, ease: 'Back.easeOut' });
    return c;
  }

  tap(card) {
    if (this.lock || card.isOpen || card.matched) return;
    sfx.flip();
    this.flip(card, true);
    this.open.push(card);
    if (this.open.length === 2) {
      this.lock = true;
      this.time.delayedCall(500, () => this.check());
    }
  }

  flip(card, toFront, onDone) {
    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 110,
      ease: 'Sine.easeIn',
      onComplete: () => {
        card.back.setVisible(!toFront);
        card.frontBg.setVisible(toFront);
        card.token.setVisible(toFront);
        card.isOpen = toFront;
        this.tweens.add({ targets: card, scaleX: 1, duration: 110, ease: 'Sine.easeOut', onComplete: onDone });
      },
    });
  }

  check() {
    const [a, b] = this.open;
    if (a.key === b.key) {
      a.matched = true;
      b.matched = true;
      sfx.match();
      for (const card of [a, b]) {
        this.sparkle.emitParticleAt(card.x, card.y, 10);
        this.tweens.add({ targets: card, scale: 1.12, duration: 130, yoyo: true, ease: 'Sine.easeOut' });
      }
      this.pairs++;
      this.progress.setText(`${this.pairs} / ${ITEMS.length}`);
      if (this.mp) {
        this.mp.players[this.mp.turn].score++; // match = point + play again
        this.updateChips();
      }
      this.open = [];
      this.lock = false;
      if (this.pairs === ITEMS.length) this.finish();
    } else {
      sfx.miss();
      let done = 0;
      for (const card of [a, b]) {
        this.tweens.add({
          targets: card,
          x: card.x + 7,
          duration: 45,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            this.flip(card, false, () => {
              if (++done === 2) {
                if (this.mp) {
                  this.mp.turn = (this.mp.turn + 1) % this.mp.players.length;
                  this.updateChips();
                }
                this.open = [];
                this.lock = false;
              }
            });
          },
        });
      }
    }
  }

  finish() {
    sfx.win();
    const data = { replay: 'Memory' };
    if (this.mp) {
      const best = Math.max(...this.mp.players.map((p) => p.score));
      const winners = this.mp.players.filter((p) => p.score === best);
      if (winners.length === 1) data.winner = { name: winners[0].name, char: winners[0].char };
      // tie: generic celebration for everyone
    }
    this.time.delayedCall(700, () => this.scene.launch('Win', data));
  }
}
