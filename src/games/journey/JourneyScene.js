import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import {
  addArt,
  textStyle,
  chunkyButton,
  iconButton,
  parchmentPanel,
  verticalGradient,
  makePortrait,
  darken,
} from '../../ui.js';
import { CHAR_INFO } from '../../profiles.js';
import { showPlayerSetup, playerRoster } from '../setup.js';
import { EVENTS, PATH_LENGTH } from './events.js';

const XS = [120, 280, 440, 600];
const YS = [1040, 896, 752, 608, 464, 320]; // bottom row first — the journey goes UP
const SMOKE_BASE = 7; // Smaug stirs a little every turn, win or lose
const SMOKE_EVENT = 15; // ...and a lot more when a bad event hits

export default class JourneyScene extends Phaser.Scene {
  constructor() {
    super('Journey');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = null;
    this.turn = 0;
    this.busy = true; // unlocked once the setup picks who plays
    this.rolled = false;
    this.rollBtn = null;
    this.banner = null;

    // --- tile positions (snake path, 4 per row) ---
    this.tiles = [];
    for (let i = 0; i < PATH_LENGTH; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      this.tiles.push({ x: XS[row % 2 === 0 ? col : 3 - col], y: YS[row] });
    }

    this.drawMap(W, H);
    this.tiles.forEach((p, i) => this.drawTile(p.x, p.y, i));

    // --- top bar ---
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });
    this.add.image(W / 2 - 64, 70, 'gate').setDisplaySize(44, 44);
    this.progress = this.add.text(W / 2 + 26, 70, `1 / ${PATH_LENGTH}`, textStyle(34, HEX.parchment, 600)).setOrigin(0.5);

    // --- die face ---
    const dg = this.add.graphics();
    dg.fillStyle(COLORS.woodDark, 0.4);
    dg.fillRoundedRect(W / 2 + 156, 1190 - 42 + 6, 84, 84, 18);
    dg.fillStyle(COLORS.parchment, 1);
    dg.fillRoundedRect(W / 2 + 156, 1190 - 42, 84, 84, 18);
    dg.lineStyle(4, COLORS.parchmentEdge, 1);
    dg.strokeRoundedRect(W / 2 + 156, 1190 - 42, 84, 84, 18);
    this.dieDots = this.add.graphics();
    this.dieCenter = { x: W / 2 + 198, y: 1190 };
    this.drawDie(1);

    this.sparkle = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.7, end: 0 },
      lifespan: 550,
      emitting: false,
    });
    this.sparkle.setDepth(30);

    // dev deep-link: &players=N skips setup (add &mode=coop|race to also skip the mode
    // choice), &ev=<key> previews an event card, &smokeMax=N shrinks the smoke gauge
    const params = new URLSearchParams(location.search);
    this.smokeMax = parseFloat(params.get('smokeMax')) || 100;
    const pCount = parseInt(params.get('players'), 10);
    const modeParam = params.get('mode');
    if (pCount >= 1 && pCount <= 4) {
      const roster = pCount === 1 ? null : playerRoster(pCount);
      if (roster && modeParam) this.startGame(this.toPlayers(roster), modeParam === 'coop');
      else this.afterRosterChosen(roster);
    } else {
      showPlayerSetup(this, { onStart: (roster) => this.afterRosterChosen(roster) });
    }
    const evKey = params.get('ev');
    const ev = Object.values(EVENTS).find((e) => e.key === evKey);
    if (ev) this.time.delayedCall(500, () => this.showEvent(ev));
  }

  cur() {
    return this.players[this.turn];
  }

  multi() {
    return this.players && this.players.length > 1;
  }

  activeMover() {
    return this.coop ? this.sharedEntity : this.cur();
  }

  toPlayers(roster) {
    return roster ? roster.map((p) => ({ ...p, pos: 0 })) : [{ name: '', char: 'party', pos: 0 }];
  }

  afterRosterChosen(roster) {
    if (roster && roster.length >= 2) this.showModeChoice(roster);
    else this.startGame(this.toPlayers(roster), false);
  }

  // ---- 2+ players choose Race (first to arrive) or Team (share one token vs. the smoke gauge) ----
  showModeChoice(roster) {
    const W = this.scale.width;
    const overlay = this.add.container(0, 0).setDepth(60);
    const dim = this.add.rectangle(W / 2, 640, W, 1280, 0x1e2430, 0.55).setInteractive();
    overlay.add(dim);
    const panel = this.add.container(W / 2, 620);
    panel.add(parchmentPanel(this, 580, 560));
    panel.add(this.add.text(0, -230, t('journey.modeTitle'), textStyle(36, HEX.ink, 700)).setOrigin(0.5));
    panel.add(
      this.add
        .text(0, -140, t('journey.modeHint'), { ...textStyle(23, HEX.inkSoft, 400), align: 'center', lineSpacing: 8 })
        .setOrigin(0.5)
    );

    const closeAndStart = (coop) => {
      this.tweens.add({
        targets: panel,
        scale: 0.7,
        alpha: 0,
        duration: 150,
        ease: 'Sine.easeIn',
        onComplete: () => {
          overlay.destroy();
          this.startGame(this.toPlayers(roster), coop);
        },
      });
      this.tweens.add({ targets: dim, fillAlpha: 0, duration: 160 });
    };

    panel.add(chunkyButton(this, 0, -10, 400, 100, t('journey.modeRace'), { size: 34, icon: 'icon-play' }, () => closeAndStart(false)));
    panel.add(
      chunkyButton(
        this,
        0,
        120,
        400,
        100,
        t('journey.modeTeam'),
        { size: 34, icon: 'icon-star', fill: COLORS.gold, base: darken(COLORS.gold) },
        () => closeAndStart(true)
      )
    );

    overlay.add(panel);
    panel.setScale(0.6).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
  }

  startGame(players, coop = false) {
    const W = this.scale.width;
    this.players = players;
    this.turn = 0;
    this.coop = coop;
    if (coop) {
      this.smoke = 0;
      this.sharedEntity = { pos: 0, piece: this.makeCoopPiece(players.map((p) => p.char)) };
    } else {
      players.forEach((p) => {
        p.piece = this.makePiece(p.char);
      });
    }
    this.layoutPieces(true);
    if (this.multi()) {
      this.banner = this.add.container(W / 2, this.coop ? 196 : 148).setDepth(12);
      this.renderBanner();
    }
    if (this.coop) this.makeSmokeGauge();
    this.makeRollBtn();
    this.hint = this.add
      .text(W / 2 - 50, 1112, t('journey.rollHint'), textStyle(27, HEX.gold, 600))
      .setOrigin(0.5)
      .setShadow(0, 2, '#1E2430', 3);
    this.tweens.add({ targets: this.hint, y: this.hint.y - 10, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.busy = false;
  }

  // the whole chosen party travels as one cluster (2-4 characters, however many joined)
  makeCoopPiece(chars) {
    const c = this.add.container(this.tiles[0].x, this.tiles[0].y - 34).setDepth(20);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillEllipse(0, 42, 78, 16);
    c.add(shadow);
    const figures = this.add.container(0, 0);
    const offsetsByCount = {
      2: [[-24, -6], [24, -2]],
      3: [[-32, -8], [0, -15], [32, -6]],
      4: [[-36, -8], [-12, -16], [12, -14], [36, -6]],
    };
    const offs = offsetsByCount[chars.length];
    chars.forEach((ch, i) => {
      const info = CHAR_INFO[ch];
      const [ox, oy] = offs[i];
      const img = this.add.image(ox, 40 + oy, info.art).setOrigin(0.5, 1);
      img.setScale((info.pieceH * 0.7) / img.height);
      figures.add(img);
    });
    c.add(figures);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: figures, y: -5, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    return c;
  }

  makeSmokeGauge() {
    const W = this.scale.width;
    const y = 112;
    const x0 = W / 2 - 150;
    const w = 260;
    const h = 16;
    const bg = this.add.graphics().setDepth(11);
    bg.fillStyle(0x1e2430, 0.35);
    bg.fillRoundedRect(x0, y - h / 2, w, h, h / 2);
    this.smokeBar = { x0, w, y, h };
    this.smokeFillG = this.add.graphics().setDepth(12);
    this.smokeDragon = this.add.image(x0 + w + 34, y, 'tok-dragon').setDisplaySize(46, 46).setDepth(13);
    this.drawSmokeGauge();
  }

  drawSmokeGauge() {
    const { x0, w, y, h } = this.smokeBar;
    const frac = Phaser.Math.Clamp(this.smoke / this.smokeMax, 0, 1);
    this.smokeFillG.clear();
    const color = frac < 0.5 ? 0xf2b84b : frac < 0.8 ? 0xd9822b : 0xd95b43;
    this.smokeFillG.fillStyle(color, 1);
    this.smokeFillG.fillRoundedRect(x0, y - h / 2, Math.max(h, w * frac), h, h / 2);
    if (frac >= 0.8 && !this.dragonPulseStarted) {
      this.dragonPulseStarted = true;
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: this.smokeDragon, scale: this.smokeDragon.scale * 1.18, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }
  }

  addSmoke(amount) {
    this.smoke = Math.min(this.smokeMax, this.smoke + amount);
    this.drawSmokeGauge();
  }

  makePiece(char) {
    const c = this.add.container(this.tiles[0].x, this.tiles[0].y - 34).setDepth(20);
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.22);
    shadow.fillEllipse(0, 42, char === 'party' ? 76 : 52, char === 'party' ? 16 : 12);
    c.add(shadow);
    // idle bob animates this inner container (local coords), never the piece itself
    const figures = this.add.container(0, 0);
    if (char === 'party') {
      figures.add(addArt(this, -26, -10, 'gandalf', 0.62));
      figures.add(addArt(this, 28, -4, 'dwarf', 0.56));
      figures.add(addArt(this, 0, 12, 'mascot', 0.36));
    } else {
      const info = CHAR_INFO[char];
      const img = this.add.image(0, 40, info.art).setOrigin(0.5, 1);
      img.setScale(info.pieceH / img.height);
      figures.add(img);
    }
    c.add(figures);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: figures, y: -5, duration: 1200 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    return c;
  }

  // fan out pieces sharing a tile so everyone stays visible (race mode only —
  // co-op has a single shared piece, so it just goes straight to its tile)
  layoutPieces(instant = false) {
    if (this.coop) {
      const tp = this.tiles[this.sharedEntity.pos];
      const x = tp.x;
      const y = tp.y - 34;
      if (instant) this.sharedEntity.piece.setPosition(x, y);
      else this.tweens.add({ targets: this.sharedEntity.piece, x, y, duration: 200, ease: 'Sine.easeOut' });
      return;
    }
    const byPos = {};
    this.players.forEach((p) => {
      (byPos[p.pos] = byPos[p.pos] || []).push(p);
    });
    Object.entries(byPos).forEach(([pos, list]) => {
      const tp = this.tiles[pos];
      list.forEach((p, i) => {
        const x = tp.x + (i - (list.length - 1) / 2) * 42;
        const y = tp.y - 34;
        if (instant) p.piece.setPosition(x, y);
        else this.tweens.add({ targets: p.piece, x, y, duration: 200, ease: 'Sine.easeOut' });
      });
    });
  }

  renderBanner() {
    const p = this.cur();
    const info = CHAR_INFO[p.char];
    this.banner.removeAll(true);
    const g = this.add.graphics();
    g.fillStyle(darken(info.color), 1);
    g.fillRoundedRect(-180, -28, 360, 62, 22);
    g.fillStyle(info.color, 1);
    g.fillRoundedRect(-180, -33, 360, 62, 22);
    g.fillStyle(0xffffff, 0.16);
    g.fillRoundedRect(-172, -28, 344, 22, 12);
    this.banner.add(g);
    this.banner.add(makePortrait(this, -136, -2, p.char, 27));
    this.banner.add(
      this.add.text(24, -2, t('journey.turn').replace('{name}', p.name), textStyle(28, '#FFFFFF', 600)).setOrigin(0.5)
    );
    this.banner.setScale(0.85);
    this.tweens.add({ targets: this.banner, scale: 1, duration: 220, ease: 'Back.easeOut' });
  }

  makeRollBtn() {
    const W = this.scale.width;
    if (this.rollBtn) this.rollBtn.destroy();
    const color = this.multi() ? CHAR_INFO[this.cur().char].color : COLORS.green;
    this.rollBtn = chunkyButton(this, W / 2 - 50, 1190, 280, 92, t('journey.roll'), { size: 36, fill: color, base: darken(color) }, () =>
      this.roll()
    );
    if (!this.rolled && !REDUCED_MOTION) {
      this.rollPulse = this.tweens.add({ targets: this.rollBtn, scaleX: 1.05, scaleY: 1.05, duration: 550, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  // ---- the illustrated map ----
  drawMap(W, H) {
    verticalGradient(this, 0, H * 0.45, W, H * 0.55, '#5E8C44', '#8FC15C');
    verticalGradient(this, 0, 0, W, H * 0.45, '#454F63', '#5E8C44');

    // the Shire: rolling hills and trees
    addArt(this, W / 2, 1170, 'hill-mid').setOrigin(0.5, 1).setAlpha(0.85);
    addArt(this, 640, 1105, 'tok-tree', 1.1);
    addArt(this, 60, 962, 'tok-tree', 0.75).setAlpha(0.85);

    // Misty Mountains ridge behind its row
    addArt(this, W / 2, 806, 'peaks').setOrigin(0.5, 1).setAlpha(0.5);

    // Mirkwood: darker band + webs, where the spiders and barrels live
    this.add.rectangle(W / 2, 464, W, 150, 0x16260f, 0.28);
    addArt(this, 36, 418, 'web', 1).setAlpha(0.8);
    addArt(this, 684, 512, 'web', 1).setAlpha(0.7).setFlipX(true).setAngle(90);
    addArt(this, 660, 424, 'tok-tree', 0.7).setAlpha(0.55).setTint(0x3a5535);

    // the river, flowing out of Mirkwood toward Lake-town
    addArt(this, W / 2, 394, 'river').setAlpha(0.95);

    // Erebor
    addArt(this, 140, 212, 'tok-mountain', 2.3);
    addArt(this, 600, 210, 'cloud', 0.5).setAlpha(0.3);
    this.add.text(430, 205, t('journey.title'), textStyle(36, HEX.gold, 700)).setOrigin(0.5).setShadow(0, 3, '#1E2430', 3);

    // zone names, like watermarks on an adventure map
    const zones = t('journey.zones');
    zones.forEach((name, row) => {
      if (!name) return;
      this.add
        .text(W / 2, YS[row] + 62, name.toUpperCase(), { ...textStyle(34, '#F7ECD4', 700) })
        .setOrigin(0.5)
        .setAlpha(0.16)
        .setLetterSpacing(6);
    });

    // dotted footpath winding through every tile
    const spline = new Phaser.Curves.Spline(this.tiles.map((p) => new Phaser.Math.Vector2(p.x, p.y)));
    const dots = spline.getSpacedPoints(Math.floor(spline.getLength() / 26));
    const road = this.add.graphics();
    road.fillStyle(0xf7ecd4, 0.45);
    for (const p of dots) road.fillCircle(p.x, p.y, 4.5);
  }

  drawTile(x, y, i) {
    const ev = EVENTS[i];
    const start = i === 0;
    const goal = i === PATH_LENGTH - 1;
    const r = goal ? 35 : 31;
    const g = this.add.graphics();
    g.fillStyle(0x1e2430, 0.35);
    g.fillCircle(x, y + 4, r);
    g.fillStyle(COLORS.parchment, 1);
    g.fillCircle(x, y, r);
    const ring = goal ? COLORS.gold : start ? COLORS.green : ev ? (ev.move > 0 ? COLORS.green : COLORS.berry) : COLORS.parchmentEdge;
    g.lineStyle(5, ring, 1);
    g.strokeCircle(x, y, r);
    if (start) this.add.image(x, y, 'hobbit-door').setDisplaySize(50, 50);
    else if (goal) this.add.image(x, y, 'gate').setDisplaySize(54, 54);
    else if (ev) this.add.image(x, y, ev.icon).setDisplaySize(44, 44);
    else this.add.text(x, y, String(i + 1), textStyle(22, '#B7A886', 500)).setOrigin(0.5).setAlpha(0.9);
  }

  drawDie(n) {
    const { x, y } = this.dieCenter;
    const spots = { 1: [[0, 0]], 2: [[-16, -16], [16, 16]], 3: [[-18, -18], [0, 0], [18, 18]] };
    this.dieDots.clear();
    this.dieDots.fillStyle(COLORS.ink, 1);
    for (const [dx, dy] of spots[n]) this.dieDots.fillCircle(x + dx, y + dy, 8);
  }

  roll() {
    if (this.busy) return;
    this.busy = true;
    if (this.coop) this.addSmoke(SMOKE_BASE);
    if (!this.rolled) {
      this.rolled = true;
      if (this.hint) this.hint.destroy();
      if (this.rollPulse) {
        this.rollPulse.stop();
        this.rollBtn.setScale(1);
      }
    }
    const result = Phaser.Math.Between(1, 3);
    let ticks = 0;
    this.time.addEvent({
      delay: 60,
      repeat: 7,
      callback: () => {
        ticks++;
        this.drawDie(ticks < 8 ? Phaser.Math.Between(1, 3) : result);
        if (ticks === 8) this.announceRoll(result);
      },
    });
  }

  // big number pops in the middle, the path lights up, then the piece walks
  announceRoll(n) {
    sfx.pop();
    const big = this.add
      .text(this.scale.width / 2, 660, String(n), { ...textStyle(150, HEX.gold, 700) })
      .setOrigin(0.5)
      .setDepth(40)
      .setShadow(0, 5, '#1E2430', 6)
      .setScale(0);
    this.tweens.add({ targets: big, scale: 1, duration: 260, ease: 'Back.easeOut' });
    this.tweens.add({ targets: big, alpha: 0, y: 600, delay: 650, duration: 350, onComplete: () => big.destroy() });

    const from = this.activeMover().pos;
    const target = Phaser.Math.Clamp(from + n, 0, PATH_LENGTH - 1);
    for (let i = from + 1; i <= target; i++) {
      const p = this.tiles[i];
      const halo = this.add.graphics().setDepth(15);
      halo.lineStyle(6, COLORS.gold, 0.9);
      halo.strokeCircle(p.x, p.y, 38);
      this.tweens.add({ targets: halo, alpha: 0, duration: 900, delay: (i - from) * 120, onComplete: () => halo.destroy() });
    }
    this.time.delayedCall(700, () => this.movePiece(n, true));
  }

  movePiece(move, allowEvent) {
    const p = this.activeMover();
    const target = Phaser.Math.Clamp(p.pos + move, 0, PATH_LENGTH - 1);
    const dir = target > p.pos ? 1 : -1;
    const step = () => {
      if (p.pos === target) {
        this.layoutPieces();
        return this.arrive(allowEvent);
      }
      p.pos += dir;
      const tp = this.tiles[p.pos];
      sfx.pop();
      this.progress.setText(`${p.pos + 1} / ${PATH_LENGTH}`);
      this.tweens.add({ targets: p.piece, x: tp.x, y: tp.y - 34, duration: 240, ease: 'Sine.easeInOut', onComplete: step });
      this.tweens.add({ targets: p.piece, scaleY: 0.88, duration: 120, yoyo: true, ease: 'Sine.easeOut' });
    };
    if (p.pos === target) this.arrive(allowEvent);
    else step();
  }

  arrive(allowEvent) {
    const p = this.activeMover();
    if (p.pos === PATH_LENGTH - 1) {
      this.sparkle.emitParticleAt(p.piece.x, p.piece.y, 18);
      this.cameras.main.flash(400, 255, 244, 214);
      sfx.win();
      const data = { replay: 'Journey' };
      if (this.coop) data.team = this.players.map((pl) => pl.char);
      else if (this.multi()) data.winner = { name: p.name, char: p.char };
      this.time.delayedCall(900, () => this.scene.launch('Win', data));
      return;
    }
    const ev = EVENTS[p.pos];
    if (allowEvent && ev) {
      this.time.delayedCall(350, () => this.showEvent(ev));
    } else {
      this.endTurn();
    }
  }

  endTurn() {
    if (this.coop && this.smoke >= this.smokeMax) {
      this.showSmokeFail();
      return;
    }
    if (this.multi()) {
      this.turn = (this.turn + 1) % this.players.length;
      this.renderBanner();
      this.makeRollBtn();
    }
    this.progress.setText(`${this.activeMover().pos + 1} / ${PATH_LENGTH}`);
    this.busy = false;
  }

  // Smaug's smoke caught up before the party reached the mountain — soft fail, easy retry
  showSmokeFail() {
    const W = this.scale.width;
    const H = this.scale.height;
    sfx.roar();
    this.cameras.main.shake(220, 0.006);
    const overlay = this.add.container(0, 0).setDepth(70);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x1e2430, 0).setInteractive();
    overlay.add(dim);
    this.tweens.add({ targets: dim, fillAlpha: 0.6, duration: 250 });

    const panel = this.add.container(W / 2, H / 2);
    panel.add(parchmentPanel(this, 560, 680));
    const dragonC = this.add.container(0, -170);
    dragonC.add(this.add.image(0, 20, 'dragon-sleep').setScale(0.6));
    dragonC.add(this.add.image(0, -12, 'eyes-open').setScale(0.6));
    panel.add(dragonC);
    panel.add(this.add.text(0, 30, t('journey.smokeTitle'), textStyle(40, HEX.ink, 700)).setOrigin(0.5));
    panel.add(
      this.add
        .text(0, 95, t('journey.smokeDesc'), { ...textStyle(25, HEX.inkSoft, 400), align: 'center', lineSpacing: 8 })
        .setOrigin(0.5)
    );
    panel.add(chunkyButton(this, 0, 205, 300, 86, t('again'), { size: 34, icon: 'icon-replay' }, () => this.scene.restart()));
    panel.add(
      chunkyButton(this, 0, 295, 300, 86, t('home'), { size: 32, icon: 'icon-home', fill: COLORS.wood, base: COLORS.woodDark }, () =>
        this.scene.start('Menu')
      )
    );
    overlay.add(panel);
    panel.setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 320, ease: 'Back.easeOut' });
  }

  // floating "+2" / "−2" above the current piece
  showFloat(text, colorHex) {
    const piece = this.activeMover().piece;
    const f = this.add
      .text(piece.x, piece.y - 70, text, textStyle(52, colorHex, 700))
      .setOrigin(0.5)
      .setDepth(40)
      .setShadow(0, 3, '#1E2430', 4);
    this.tweens.add({ targets: f, y: f.y - 60, alpha: 0, duration: 900, ease: 'Sine.easeOut', onComplete: () => f.destroy() });
  }

  showEvent(ev) {
    const W = this.scale.width;
    const H = this.scale.height;
    const good = ev.move > 0;
    const accent = good ? COLORS.green : COLORS.berry;
    const overlay = this.add.container(0, 0).setDepth(50);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x1e2430, 0).setInteractive();
    overlay.add(dim);
    this.tweens.add({ targets: dim, fillAlpha: 0.55, duration: 200 });

    const panel = this.add.container(W / 2, H / 2 - 30);
    panel.add(parchmentPanel(this, 560, 620));

    // where we are
    panel.add(this.add.text(0, -258, t(`journey.places.${ev.key}`), textStyle(37, HEX.ink, 700)).setOrigin(0.5));

    // what happened (illustrated)
    const badge = this.add.graphics();
    badge.fillStyle(accent, 0.25);
    badge.fillCircle(0, -128, 80);
    badge.lineStyle(5, accent, 0.8);
    badge.strokeCircle(0, -128, 80);
    panel.add(badge);
    const icon = this.add.image(0, -128, ev.icon);
    icon.setDisplaySize(112, 112 * (icon.height / icon.width));
    panel.add(icon);
    panel.add(
      this.add
        .text(0, 8, t(`journey.events.${ev.key}`), { ...textStyle(27, HEX.inkSoft, 500), align: 'center', lineSpacing: 9 })
        .setOrigin(0.5)
    );

    // the effect, unmistakable: colored chip with arrow + number
    const chip = this.add.container(0, 105);
    const cg = this.add.graphics();
    cg.fillStyle(accent, 1);
    cg.fillRoundedRect(-85, -29, 170, 58, 18);
    chip.add(cg);
    const arrow = this.add.image(good ? 42 : -42, 0, 'icon-arrow').setDisplaySize(36, 36).setFlipX(!good);
    chip.add(arrow);
    chip.add(
      this.add
        .text(good ? -18 : 18, 0, `${good ? '+' : '−'}${Math.abs(ev.move)}`, textStyle(36, '#FFFFFF', 700))
        .setOrigin(0.5)
    );
    panel.add(chip);
    this.tweens.add({ targets: chip, scale: { from: 1, to: 1.08 }, duration: 450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    panel.add(
      chunkyButton(this, 0, 215, 280, 86, t('journey.go'), { size: 32, fill: accent, base: good ? COLORS.greenDark : COLORS.berryDark }, () => {
        this.tweens.add({
          targets: panel,
          scale: 0.7,
          alpha: 0,
          duration: 150,
          ease: 'Sine.easeIn',
          onComplete: () => {
            overlay.destroy();
            this.showFloat(`${good ? '+' : '−'}${Math.abs(ev.move)}`, good ? '#8FC15C' : '#E88070');
            if (!good) {
              this.cameras.main.shake(170, 0.0035);
              if (this.coop) this.addSmoke(SMOKE_EVENT);
            }
            this.movePiece(ev.move, false);
          },
        });
        this.tweens.add({ targets: dim, fillAlpha: 0, duration: 160 });
      })
    );
    overlay.add(panel);
    panel.setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
    if (good) sfx.match();
    else sfx.miss();
  }
}
