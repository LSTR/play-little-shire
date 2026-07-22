import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t, lang } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, pressable, iconButton, parchmentPanel, verticalGradient } from '../../ui.js';
import { showPlayerSetup, playerRoster, makeScoreChips } from '../setup.js';
import { RIDDLES } from './riddles.js';

const SOLO_ROUNDS = 5;
const DUEL_ROUNDS = 6; // 3 riddles each, alternating

// some answers reuse art that isn't a tok-* token
const TOKEN_TEX = { star: 'icon-star', door: 'hobbit-door' };
const texFor = (name) => TOKEN_TEX[name] || `tok-${name}`;

export default class RiddlesScene extends Phaser.Scene {
  constructor() {
    super('Riddles');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.answering = true;

    // --- crystal cave backdrop ---
    verticalGradient(this, 0, 0, W, H, '#1B2340', '#2E3A5C');
    addArt(this, W / 2, 0, 'stalactites').setOrigin(0.5, 0);
    if (!REDUCED_MOTION) {
      this.add.particles(0, 0, 'crystal-glow', {
        x: { min: 30, max: W - 30 },
        y: { min: H * 0.2, max: H * 0.95 },
        lifespan: 5000,
        speedY: { min: -14, max: -4 },
        scale: { start: 0.6, end: 0.2 },
        alpha: { start: 0, end: 0.8, ease: 'Sine.easeInOut' },
        frequency: 600,
      });
    }

    // --- top bar ---
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    // --- the cave friend ---
    this.creature = addArt(this, 112, 648, 'creature', 0.82);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: this.creature, y: this.creature.y - 9, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    this.sparkle = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.7, end: 0 },
      lifespan: 550,
      emitting: false,
    });
    this.sparkle.setDepth(10);

    // dev deep-link: &players=N skips setup
    const pCount = parseInt(new URLSearchParams(location.search).get('players'), 10);
    if (pCount === 1) this.begin(null);
    else if (pCount === 2) this.begin(playerRoster(2));
    else showPlayerSetup(this, { max: 2, onStart: (roster) => this.begin(roster) });
  }

  begin(roster) {
    const W = this.scale.width;
    this.idx = 0;
    this.solved = 0;
    this.attempts = 0;

    if (roster) {
      this.duel = { players: roster.map((p) => ({ ...p, score: 0 })), turn: 0, num: 0 };
      this.chipsUi = makeScoreChips(this, roster, 168);
      this.chipsUi.update([0, 0], 0);
      this.add.image(W / 2 - 56, 70, 'icon-star').setDisplaySize(40, 40);
      this.roundText = this.add.text(W / 2 + 30, 70, `1 / ${DUEL_ROUNDS}`, textStyle(34, HEX.parchment, 600)).setOrigin(0.5);
    } else {
      this.duel = null;
      this.add
        .text(W / 2, 200, t('riddles.title'), textStyle(40, HEX.gold, 700))
        .setOrigin(0.5)
        .setShadow(0, 3, '#0E1322', 3);
      this.stars = Array.from({ length: SOLO_ROUNDS }, (_, i) =>
        this.add
          .image(W / 2 - ((SOLO_ROUNDS - 1) * 52) / 2 + i * 52, 70, 'icon-star')
          .setDisplaySize(42, 42)
          .setTint(0x2a3450)
      );
    }

    this.order = Phaser.Utils.Array.Shuffle([...RIDDLES]).slice(0, this.duel ? DUEL_ROUNDS : SOLO_ROUNDS);
    this.buildRiddle();
  }

  buildRiddle() {
    const W = this.scale.width;
    const riddle = this.order[this.idx];
    const round = this.add.container(0, 0);
    this.round = round;
    this.answering = true;
    this.attempts = 0;

    // parchment scroll with the riddle
    const panel = this.add.container(W / 2, 410);
    panel.add(parchmentPanel(this, 600, 300));
    panel.add(
      this.add
        .text(0, 0, riddle.text[lang], { ...textStyle(29, HEX.ink, 500), align: 'center', lineSpacing: 10, wordWrap: { width: 540 } })
        .setOrigin(0.5)
    );
    round.add(panel);

    // three illustrated answers
    const xs = [150, 360, 570];
    Phaser.Utils.Array.Shuffle([...riddle.choices]).forEach((name, i) => {
      round.add(this.makeChoice(name, xs[i], 890, name === riddle.answer));
    });

    round.setAlpha(0).setY(26);
    this.tweens.add({ targets: round, alpha: 1, y: 0, duration: 280, ease: 'Sine.easeOut' });
  }

  makeChoice(name, x, y, isCorrect) {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.fillStyle(0x141b30, 0.55);
    g.fillCircle(0, 8, 74);
    g.fillStyle(COLORS.parchment, 1);
    g.fillCircle(0, 0, 74);
    g.lineStyle(6, COLORS.parchmentEdge, 1);
    g.strokeCircle(0, 0, 74);
    c.add(g);
    const icon = this.add.image(0, 0, texFor(name));
    icon.setDisplaySize(108, 108 * (icon.height / icon.width));
    c.add(icon);
    const label = this.add.text(0, 112, t(`tokens.${name}`), textStyle(26, '#B9C4D6', 500)).setOrigin(0.5);
    c.add(label);
    c.setSize(160, 160);
    pressable(this, c, () => (isCorrect ? this.onCorrect(c) : this.onWrong(c)));
    return c;
  }

  onCorrect(choice) {
    if (!this.answering) return;
    this.answering = false;
    sfx.match();
    this.sparkle.emitParticleAt(choice.x, choice.y, 14);
    this.tweens.add({ targets: choice, scale: 1.15, duration: 150, yoyo: true, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: this.creature, scale: this.creature.scale * 1.18, duration: 180, yoyo: true, ease: 'Back.easeOut' });

    if (this.duel) {
      // first try = 2 gems, second = 1, later = 0 (but never a punishment)
      const gained = [2, 1, 0][Math.min(this.attempts, 2)];
      const p = this.duel.players[this.duel.turn];
      p.score += gained;
      this.chipsUi.update(this.duel.players.map((x) => x.score), this.duel.turn);
      if (gained > 0) {
        const f = this.add
          .text(choice.x, choice.y - 90, `+${gained}`, textStyle(52, HEX.gold, 700))
          .setOrigin(0.5)
          .setShadow(0, 3, '#0E1322', 4);
        this.tweens.add({ targets: f, y: f.y - 60, alpha: 0, duration: 900, onComplete: () => f.destroy() });
      }
    } else {
      const star = this.stars[this.solved];
      star.clearTint();
      this.tweens.add({ targets: star, scale: star.scale * 1.5, duration: 180, yoyo: true, onStart: () => sfx.pop() });
    }

    this.solved++;
    this.idx++;
    this.time.delayedCall(900, () => {
      this.tweens.add({
        targets: this.round,
        alpha: 0,
        y: -26,
        duration: 220,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.round.destroy();
          if (this.duel) {
            this.duel.num++;
            if (this.duel.num === DUEL_ROUNDS) return this.finishDuel();
            this.duel.turn = 1 - this.duel.turn;
            this.chipsUi.update(this.duel.players.map((x) => x.score), this.duel.turn);
            this.roundText.setText(`${this.duel.num + 1} / ${DUEL_ROUNDS}`);
            this.buildRiddle();
          } else if (this.solved === SOLO_ROUNDS) {
            sfx.win();
            this.time.delayedCall(300, () => this.scene.launch('Win', { replay: 'Riddles' }));
          } else {
            this.buildRiddle();
          }
        },
      });
    });
  }

  finishDuel() {
    sfx.win();
    const [a, b] = this.duel.players;
    const data = { replay: 'Riddles' };
    if (a.score !== b.score) {
      const w = a.score > b.score ? a : b;
      data.winner = { name: w.name, char: w.char };
    }
    this.time.delayedCall(300, () => this.scene.launch('Win', data));
  }

  onWrong(choice) {
    if (!this.answering) return;
    this.attempts++;
    sfx.miss();
    choice.disableInteractive();
    this.tweens.add({
      targets: choice,
      x: choice.x + 8,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => choice.setAlpha(0.35),
    });
    // the cave friend covers its giggle
    this.tweens.add({ targets: this.creature, angle: { from: -3, to: 3 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => this.creature.setAngle(0) });
  }
}
