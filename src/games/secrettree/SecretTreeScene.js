import Phaser from 'phaser';
import { COLORS, REDUCED_MOTION } from '../../config.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, iconButton, verticalGradient, makePortrait } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const TOKENS = ['tok-ring', 'tok-dragon', 'tok-wizard', 'tok-mountain', 'tok-tree', 'tok-mushroom', 'tok-sword', 'tok-spider'];
const PAIRS_DEFAULT = 6;
const CARD_W = 128;
const CARD_H = 155;
const COLS = [-190, 0, 190];
const ROW_OFF = [-100, 100];
const ZONE_Y = [950, 330]; // player 1 (bottom, upright), player 2 (top, rotated 180°)

// Codenames-style split memory: the device lies flat on the table, each
// player only ever sees their own half (rotated 180° for whoever sits
// across). Every symbol appears once per side, so a match always requires
// describing it out loud — there is no way to solve it by looking alone.
// No fail state: a wrong guess is just a friendly wobble, try again.
export default class SecretTreeScene extends Phaser.Scene {
  constructor() {
    super('SecretTree');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = getProfiles();
    this.finished = false;
    this.busy = false;
    this.found = 0;
    this.picks = [null, null];

    // dev deep-links: &pairs=3-8 board size, &fixed=1 no shuffle,
    // &found=N pre-solves N pairs (deterministic screenshot testing)
    const params = new URLSearchParams(location.search);
    const pairsParam = parseInt(params.get('pairs'), 10);
    this.pairsTotal = pairsParam >= 3 && pairsParam <= TOKENS.length ? pairsParam : PAIRS_DEFAULT;
    const fixed = params.get('fixed') === '1';
    const preFound = Math.min(parseInt(params.get('found'), 10) || 0, this.pairsTotal);

    // --- the hollow tree, glowing warm at its heart, dark at both far edges ---
    // (mirror-symmetric around the centerline so it reads right for both players)
    verticalGradient(this, 0, 0, W, H / 2, '#1C2B18', '#6B4F2C');
    verticalGradient(this, 0, H / 2, W, H / 2, '#6B4F2C', '#1C2B18');
    if (!REDUCED_MOTION) {
      this.add.particles(0, 0, 'firefly', {
        x: { min: 30, max: W - 30 },
        y: { min: 40, max: H - 40 },
        lifespan: 4500,
        speedX: { min: -12, max: 12 },
        speedY: { min: -18, max: 18 },
        scale: { start: 0.5, end: 0.15 },
        alpha: { start: 0, end: 0.85, ease: 'Sine.easeInOut' },
        frequency: 450,
      });
    }
    const divider = this.add.graphics();
    divider.fillStyle(COLORS.woodDark, 0.6);
    divider.fillRoundedRect(40, H / 2 - 9, W - 80, 18, 9);

    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    if (!this.textures.exists('mem-front')) {
      const g = this.make.graphics({ add: false });
      g.fillStyle(COLORS.parchment, 1);
      g.fillRoundedRect(0, 0, CARD_W, CARD_H, 16);
      g.lineStyle(5, COLORS.parchmentEdge, 1);
      g.strokeRoundedRect(2, 2, CARD_W - 4, CARD_H - 4, 16);
      g.generateTexture('mem-front', CARD_W, CARD_H);
      g.destroy();
    }

    // --- pick which symbols are in play, and where they sit on each side ---
    const pool = fixed ? TOKENS.slice(0, this.pairsTotal) : Phaser.Utils.Array.Shuffle([...TOKENS]).slice(0, this.pairsTotal);
    const slots = [];
    ROW_OFF.forEach((ry) => COLS.forEach((cx) => slots.push({ x: cx, y: ry })));
    const orderA = fixed ? [...pool] : Phaser.Utils.Array.Shuffle([...pool]);
    const orderB = fixed ? [...pool] : Phaser.Utils.Array.Shuffle([...pool]);

    this.zones = ZONE_Y.map((y, zi) => {
      const z = this.add.container(W / 2, y).setAngle(zi === 0 ? 0 : 180);
      z.add(makePortrait(this, 0, 230, this.players[zi].char, 30));
      return z;
    });

    this.cards = [[], []];
    [orderA, orderB].forEach((order, zi) => {
      order.forEach((key, i) => {
        const slot = slots[i];
        this.cards[zi].push(this.makeCard(this.zones[zi], zi, slot.x, slot.y, key));
      });
    });

    for (let k = 0; k < preFound; k++) {
      const key = pool[k];
      const a = this.cards[0].find((c) => c.key === key && !c.matched);
      const b = this.cards[1].find((c) => c.key === key && !c.matched);
      if (a) { a.matched = true; a.destroy(); }
      if (b) { b.matched = true; b.destroy(); }
      this.found++;
    }
  }

  makeCard(zone, zoneIdx, x, y, key) {
    const c = this.add.container(x, y);
    c.add(this.add.image(0, 0, 'mem-front').setDisplaySize(CARD_W, CARD_H));
    c.add(addArt(this, 0, 0, key, 0.9));
    const ring = this.add.graphics();
    ring.lineStyle(6, COLORS.gold, 1);
    ring.strokeRoundedRect(-CARD_W / 2 - 6, -CARD_H / 2 - 6, CARD_W + 12, CARD_H + 12, 18);
    ring.setVisible(false);
    c.add(ring);
    c.ring = ring;
    c.key = key;
    c.matched = false;
    c.setSize(CARD_W, CARD_H);
    c.setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => this.selectCard(zoneIdx, c));
    zone.add(c);
    return c;
  }

  setSelected(card, on) {
    card.ring.setVisible(on);
    this.tweens.add({ targets: card, scale: on ? 1.08 : 1, duration: 120, ease: 'Sine.easeOut' });
  }

  selectCard(zoneIdx, card) {
    if (this.busy || this.finished || card.matched) return;
    const cur = this.picks[zoneIdx];
    if (cur === card) {
      this.setSelected(card, false);
      this.picks[zoneIdx] = null;
      return;
    }
    sfx.click();
    if (cur) this.setSelected(cur, false);
    this.setSelected(card, true);
    this.picks[zoneIdx] = card;
    if (this.picks[0] && this.picks[1]) this.checkMatch();
  }

  checkMatch() {
    this.busy = true;
    const [a, b] = this.picks;
    if (a.key === b.key) {
      sfx.match();
      [a, b].forEach((card) => {
        card.matched = true;
        card.ring.setVisible(false);
        card.disableInteractive();
        this.tweens.add({ targets: card, scale: 0, alpha: 0, duration: 260, ease: 'Back.easeIn', onComplete: () => card.destroy() });
      });
      this.found++;
      this.picks = [null, null];
      if (this.found >= this.pairsTotal) this.time.delayedCall(400, () => this.win());
      else this.busy = false;
    } else {
      sfx.miss();
      [a, b].forEach((card) => {
        this.tweens.add({ targets: card, x: card.x + 7, duration: 45, yoyo: true, repeat: 3 });
      });
      this.time.delayedCall(450, () => {
        this.setSelected(a, false);
        this.setSelected(b, false);
        this.picks = [null, null];
        this.busy = false;
      });
    }
  }

  win() {
    this.finished = true;
    sfx.win();
    this.cameras.main.flash(400, 214, 244, 255);
    this.time.delayedCall(700, () =>
      this.scene.launch('Win', { replay: 'SecretTree', team: this.players.map((p) => p.char) })
    );
  }
}
