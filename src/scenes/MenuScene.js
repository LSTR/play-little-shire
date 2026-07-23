import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../config.js';
import { t, lang, setLang } from '../strings.js';
import { GAMES } from '../games/registry.js';
import { sfx, isSoundOn, toggleSound } from '../sfx.js';
import {
  addArt,
  textStyle,
  pressable,
  chunkyButton,
  iconButton,
  parchmentPanel,
  verticalGradient,
  makePortrait,
} from '../ui.js';
import { getProfiles, setProfile, CHAR_KEYS } from '../profiles.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // --- living Shire backdrop ---
    verticalGradient(this, 0, 0, W, H * 0.75, '#BFE3F0', '#EAF4D9');
    this.add.rectangle(W / 2, H * 0.85, W, H * 0.3, COLORS.meadow);
    this.add.circle(600, 150, 92, 0xffe9a8, 0.25);
    this.add.circle(600, 150, 62, 0xffe9a8, 0.85);

    this.clouds = [
      { s: addArt(this, 130, 120, 'cloud', 0.9).setAlpha(0.9), v: 0.012 },
      { s: addArt(this, 420, 220, 'cloud', 0.6).setAlpha(0.75), v: 0.02 },
      { s: addArt(this, 640, 90, 'cloud', 0.45).setAlpha(0.6), v: 0.028 },
    ];

    this.hillFar = addArt(this, W / 2, H - 260, 'hill-far').setOrigin(0.5, 1);
    this.hillMid = addArt(this, W / 2, H - 120, 'hill-mid').setOrigin(0.5, 1);
    this.hillNear = addArt(this, W / 2, H, 'hill-near').setOrigin(0.5, 1);

    if (!REDUCED_MOTION) {
      this.add.particles(0, 0, 'leaf', {
        x: { min: 0, max: W },
        y: -20,
        lifespan: 10000,
        speedY: { min: 35, max: 75 },
        speedX: { min: -25, max: 25 },
        rotate: { start: 0, end: 360 },
        scale: { min: 0.3, max: 0.5 },
        alpha: { start: 0.9, end: 0.5 },
        frequency: 900,
      });
    }

    // --- wooden signpost logo ---
    const sign = this.add.container(W / 2, 180);
    const signImg = this.add.image(0, 0, 'sign').setScale(0.625); // 425px wide
    const t1 = this.add.text(0, -41, t('title1'), textStyle(38, HEX.parchment, 700)).setOrigin(0.5);
    const t2 = this.add.text(0, 46, t('title2'), textStyle(40, HEX.gold, 700)).setOrigin(0.5);
    t1.setLetterSpacing(10);
    t2.setLetterSpacing(2);
    if (t1.width > 360) t1.setScale(360 / t1.width);
    if (t2.width > 330) t2.setScale(330 / t2.width);
    t1.setShadow(0, 3, '#5A3A1E', 2);
    t2.setShadow(0, 3, '#5A3A1E', 2);
    sign.add([signImg, t1, t2]);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: sign, angle: 1.1, duration: 3200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // --- mascot ---
    const mascot = addArt(this, 118, 425, 'mascot', 0.6);
    this.tweens.add({ targets: mascot, y: mascot.y - 10, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // --- top bar ---
    iconButton(this, 64, 70, 'icon-gear', {}, () => this.showSettings());
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    // --- game cards, straight from the registry (drag to scroll when they overflow) ---
    this.cardsC = this.add.container(0, 0);
    GAMES.forEach((game, i) => this.cardsC.add(this.makeGameCard(game, W / 2, 572 + i * 154)));
    this.dragDist = 0;
    this.scrollVel = 0;
    const contentBottom = 572 + (GAMES.length - 1) * 154 + 100;
    this.maxScroll = Math.max(0, contentBottom - H);
    if (this.maxScroll > 0) {
      this.input.on('pointerdown', (p) => {
        this.dragStartY = p.y;
        this.cardsStartY = this.cardsC.y;
        this.dragDist = 0;
        this.scrollVel = 0;
        this.lastPointerY = p.y;
        this.lastPointerTime = this.time.now;
      });
      this.input.on('pointermove', (p) => {
        if (!p.isDown || this.dragStartY === undefined) return;
        const dy = p.y - this.dragStartY;
        this.dragDist = Math.max(this.dragDist, Math.abs(dy));
        this.cardsC.y = this.rubberBand(this.cardsStartY + dy);

        // light-smoothed velocity sample, so a flick still has momentum on release
        const dt = this.time.now - this.lastPointerTime;
        if (dt > 0) {
          const v = (p.y - this.lastPointerY) / dt;
          this.scrollVel = this.scrollVel * 0.7 + v * 0.3;
        }
        this.lastPointerY = p.y;
        this.lastPointerTime = this.time.now;
      });
      const releaseScroll = () => {
        this.dragStartY = undefined;
        const clamped = Phaser.Math.Clamp(this.cardsC.y, -this.maxScroll, 0);
        if (clamped !== this.cardsC.y) {
          // released mid-overscroll: spring back to the edge instead of coasting
          this.scrollVel = 0;
          this.tweens.add({
            targets: this.cardsC,
            y: clamped,
            duration: REDUCED_MOTION ? 1 : 260,
            ease: 'Sine.easeOut',
          });
        }
      };
      this.input.on('pointerup', releaseScroll);
      this.input.on('pointerupoutside', releaseScroll);

      // "more below" hint — a chunky wooden trail-marker button (same recipe as
      // iconButton: darker base + fill + top highlight), just not interactive
      this.scrollHint = this.add.container(W / 2, H - 50).setDepth(5);
      this.scrollHint.add(this.add.ellipse(0, 30, 66, 16, 0x1e2430, 0.2));
      const r = 34;
      const hg = this.add.graphics();
      hg.fillStyle(COLORS.woodDark, 1);
      hg.fillCircle(0, 5, r);
      hg.fillStyle(COLORS.wood, 1);
      hg.fillCircle(0, 0, r);
      hg.fillStyle(0xffffff, 0.22);
      hg.fillEllipse(0, -r * 0.42, r * 1.3, r * 0.66);
      this.scrollHint.add(hg);
      this.scrollHint.add(this.add.image(0, 0, 'icon-arrow').setDisplaySize(28, 28).setAngle(90));
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: this.scrollHint, y: '+=12', duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    }
  }

  makeGameCard(game, x, y) {
    const w = 620;
    const h = 140;
    const ready = game.status === 'ready';
    const c = this.add.container(x, y);

    const g = this.add.graphics();
    g.fillStyle(COLORS.woodDark, 0.22);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 9, w, h, 24);
    g.fillStyle(COLORS.parchment, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 24);
    g.lineStyle(4, COLORS.parchmentEdge, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 24);
    c.add(g);

    // left badge: round-door circle with the game token
    const badge = this.add.graphics();
    badge.fillStyle(ready ? game.color : 0x9aa394, ready ? 0.28 : 0.25);
    badge.fillCircle(-232, 0, 55);
    badge.lineStyle(4, ready ? game.color : 0x9aa394, 0.75);
    badge.strokeCircle(-232, 0, 55);
    c.add(badge);
    const token = addArt(this, -232, 0, game.icon, 0.95);
    c.add(token);

    // minimum-age chip, tucked into the icon badge's corner
    if (game.minAge) {
      const age = this.add.container(-196, 38);
      const ag = this.add.graphics();
      ag.fillStyle(COLORS.woodDark, 1);
      ag.fillCircle(0, 2, 22);
      ag.fillStyle(ready ? COLORS.gold : 0x9aa394, 1);
      ag.fillCircle(0, 0, 20);
      age.add(ag);
      age.add(this.add.text(0, 0, `${game.minAge}+`, textStyle(18, HEX.ink, 700)).setOrigin(0.5));
      c.add(age);
    }

    const title = this.add
      .text(-150, -28, t(`${game.id}.title`), textStyle(33, HEX.ink, 600))
      .setOrigin(0, 0.5);
    const maxTitleW = ready ? 340 : 290;
    if (title.width > maxTitleW) title.setScale(maxTitleW / title.width);
    const desc = this.add
      .text(-150, 18, t(`${game.id}.desc`), {
        ...textStyle(21, HEX.inkSoft, 400),
        wordWrap: { width: 330 },
        lineSpacing: 2,
      })
      .setOrigin(0, 0.5);
    c.add([title, desc]);

    // right badge: play or lock
    const rb = this.add.graphics();
    rb.fillStyle(ready ? COLORS.green : 0x9aa394, 1);
    rb.fillCircle(250, 0, 40);
    rb.fillStyle(0xffffff, 0.18);
    rb.fillEllipse(250, -16, 52, 26);
    c.add(rb);
    const rIcon = this.add.image(ready ? 253 : 250, 0, ready ? 'icon-play' : 'icon-lock').setDisplaySize(38, 38);
    c.add(rIcon);

    if (!ready) {
      token.setTint(0xbbbbbb).setAlpha(0.75);
      title.setColor('#7d8577');
      const ribbon = this.add.container(240, -56);
      const rg = this.add.graphics();
      rg.fillStyle(COLORS.berry, 1);
      rg.fillRoundedRect(-58, -18, 116, 36, 12);
      ribbon.add(rg);
      ribbon.add(this.add.text(0, 0, t('soon'), textStyle(21, '#FFFFFF', 600)).setOrigin(0.5));
      ribbon.setAngle(-9);
      c.add(ribbon);
    }

    c.setSize(w, h);
    if (ready) {
      pressable(this, c, () => {
        if (this.dragDist > 15) return; // it was a scroll, not a tap
        sfx.click();
        this.showIntro(game);
      }, { hover: 1.02 });
    } else {
      c.setInteractive({ useHandCursor: true });
      c.on('pointerup', () => {
        if (this.dragDist > 15) return;
        sfx.lock();
        this.tweens.add({ targets: c, angle: { from: -1.6, to: 1.6 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => c.setAngle(0) });
      });
    }
    return c;
  }

  // ---- intro overlay: the round door "opens" into the game ----
  showIntro(game) {
    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.container(0, 0).setDepth(50);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x1e3018, 0).setInteractive();
    overlay.add(dim);
    this.tweens.add({ targets: dim, fillAlpha: 0.55, duration: 200 });

    const panel = this.add.container(W / 2, H / 2);
    panel.add(parchmentPanel(this, 560, 660));

    const badge = this.add.graphics();
    badge.fillStyle(game.color, 0.28);
    badge.fillCircle(0, -170, 88);
    badge.lineStyle(6, game.color, 0.8);
    badge.strokeCircle(0, -170, 88);
    panel.add(badge);
    panel.add(addArt(this, 0, -170, game.icon, 1.5));

    panel.add(this.add.text(0, -40, t(`${game.id}.title`), textStyle(38, HEX.ink, 700)).setOrigin(0.5));
    panel.add(
      this.add
        .text(0, 45, t(`${game.id}.how`), { ...textStyle(25, HEX.inkSoft, 400), align: 'center', lineSpacing: 8 })
        .setOrigin(0.5)
    );

    panel.add(
      chunkyButton(this, 0, 190, 310, 92, t('play'), { size: 38, icon: 'icon-play' }, () =>
        this.scene.start(game.scene)
      )
    );
    panel.add(
      iconButton(this, 252, -302, 'icon-close', { fill: COLORS.berry, base: COLORS.berryDark, r: 32, iconSize: 30 }, () => {
        this.tweens.add({
          targets: panel,
          scale: 0.7,
          alpha: 0,
          duration: 160,
          ease: 'Sine.easeIn',
          onComplete: () => overlay.destroy(),
        });
        this.tweens.add({ targets: dim, fillAlpha: 0, duration: 180 });
      })
    );
    overlay.add(panel);
    panel.setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
  }

  // ---- settings overlay ----
  showSettings() {
    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.container(0, 0).setDepth(50);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x1e3018, 0).setInteractive();
    overlay.add(dim);
    this.tweens.add({ targets: dim, fillAlpha: 0.55, duration: 200 });

    const panel = this.add.container(W / 2, H / 2);
    panel.add(parchmentPanel(this, 540, 700));
    panel.add(this.add.text(0, -305, t('settings'), textStyle(40, HEX.ink, 700)).setOrigin(0.5));

    // sound row
    panel.add(this.add.text(-200, -220, t('sound'), textStyle(30, HEX.inkSoft, 500)).setOrigin(0, 0.5));
    const sBtn = iconButton(this, 170, -220, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      sBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });
    panel.add(sBtn);

    // language row
    panel.add(this.add.text(-200, -130, t('language'), textStyle(30, HEX.inkSoft, 500)).setOrigin(0, 0.5));
    const mkLangChip = (label, code, cx) => {
      const active = lang === code;
      return chunkyButton(
        this,
        cx,
        -130,
        110,
        66,
        label,
        {
          size: 27,
          fill: active ? COLORS.green : COLORS.parchmentEdge,
          base: active ? COLORS.greenDark : 0xbfa87e,
          color: active ? '#FFFFFF' : '#6B5B45',
        },
        () => {
          if (lang !== code) {
            setLang(code);
            this.scene.restart();
          }
        }
      );
    };
    panel.add(mkLangChip('ES', 'es', 90));
    panel.add(mkLangChip('EN', 'en', 215));

    // players section — profiles used by every multiplayer game
    const divider = this.add.graphics();
    divider.lineStyle(2, COLORS.parchmentEdge, 0.8);
    divider.lineBetween(-230, -70, 230, -70);
    panel.add(divider);
    panel.add(this.add.text(-200, -28, t('players'), textStyle(30, HEX.inkSoft, 500)).setOrigin(0, 0.5));

    const rowRefs = [];
    const buildRow = (i, y) => {
      if (rowRefs[i]) rowRefs[i].destroy();
      const p = getProfiles()[i];
      const row = this.add.container(0, y);
      const port = makePortrait(this, -185, 0, p.char, 42);
      pressable(this, port, () => {
        const cur = getProfiles();
        const other = cur[1 - i].char;
        let idx = CHAR_KEYS.indexOf(cur[i].char);
        do {
          idx = (idx + 1) % CHAR_KEYS.length;
        } while (CHAR_KEYS[idx] === other);
        setProfile(i, { char: CHAR_KEYS[idx] });
        sfx.click();
        buildRow(i, y);
      });
      row.add(port);
      row.add(this.add.text(-125, -10, p.name, textStyle(31, HEX.ink, 600)).setOrigin(0, 0.5));
      row.add(this.add.text(-125, 24, t(`chars.${p.char}`), textStyle(19, HEX.inkSoft, 400)).setOrigin(0, 0.5));
      row.add(
        iconButton(this, 195, 0, 'icon-pencil', { fill: COLORS.wood, base: COLORS.woodDark, r: 30, iconSize: 28 }, () =>
          this.editName(i, () => buildRow(i, y))
        )
      );
      rowRefs[i] = row;
      panel.add(row);
    };
    buildRow(0, 50);
    buildRow(1, 175);

    panel.add(
      iconButton(this, 242, -317, 'icon-close', { fill: COLORS.berry, base: COLORS.berryDark, r: 32, iconSize: 30 }, () => {
        this.tweens.add({
          targets: panel,
          scale: 0.7,
          alpha: 0,
          duration: 160,
          ease: 'Sine.easeIn',
          onComplete: () => overlay.destroy(),
        });
        this.tweens.add({ targets: dim, fillAlpha: 0, duration: 180 });
      })
    );
    overlay.add(panel);
    panel.setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
  }

  // ---- name editor: a real text input so the phone keyboard opens ----
  editName(i, onDone) {
    const W = this.scale.width;
    const overlay = this.add.container(0, 0).setDepth(80);
    const dim = this.add.rectangle(W / 2, 640, W, 1280, 0x1e3018, 0.6).setInteractive();
    overlay.add(dim);
    const panel = this.add.container(W / 2, 520);
    panel.add(parchmentPanel(this, 480, 330));

    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 12;
    input.value = getProfiles()[i].name;
    input.style.cssText =
      'width:340px;height:64px;font-family:Fredoka,sans-serif;font-size:30px;font-weight:600;' +
      'text-align:center;border-radius:16px;border:3px solid #D9C6A0;background:#FFFFFF;color:#2E4A2A;outline:none;';
    const dom = this.add.dom(W / 2, 480, input).setDepth(81);

    const save = () => {
      const v = input.value.trim().slice(0, 12);
      if (v) setProfile(i, { name: v });
      dom.destroy();
      overlay.destroy();
      onDone();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
    });
    panel.add(chunkyButton(this, 0, 90, 200, 80, 'OK', { size: 34 }, save));
    overlay.add(panel);
    setTimeout(() => input.focus(), 60);
  }

  // pulls the target back toward the valid range with resistance, so dragging
  // past either end still gives a little (like native rubber-band scrolling)
  rubberBand(target) {
    if (target > 0) return target * 0.35;
    if (target < -this.maxScroll) return -this.maxScroll + (target + this.maxScroll) * 0.35;
    return target;
  }

  update(time, delta) {
    const W = this.scale.width;
    for (const c of this.clouds) {
      c.s.x += c.v;
      if (c.s.x > W + 130) c.s.x = -130;
    }
    if (!REDUCED_MOTION) {
      this.hillFar.x = W / 2 + Math.sin(time * 0.00009) * 6;
      this.hillMid.x = W / 2 + Math.sin(time * 0.00013 + 2) * 4;
    }

    // momentum: once the finger lifts, keep coasting and decay toward a stop
    if (this.maxScroll > 0 && this.dragStartY === undefined && Math.abs(this.scrollVel) > 0.01) {
      this.cardsC.y = Phaser.Math.Clamp(this.cardsC.y + this.scrollVel * delta, -this.maxScroll, 0);
      this.scrollVel *= REDUCED_MOTION ? 0 : 0.92;
      if (this.cardsC.y === 0 || this.cardsC.y === -this.maxScroll) this.scrollVel = 0;
    }

    if (this.scrollHint) {
      this.scrollHint.setVisible(this.cardsC.y > -this.maxScroll + 12);
    }
  }
}
