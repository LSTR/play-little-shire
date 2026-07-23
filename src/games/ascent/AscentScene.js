import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, makePortrait } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const GRAVITY = 1400; // px/s^2
const BOUNCE_VY = -820; // px/s, upward impulse on landing
const MAX_VX = 420;
const PLATFORM_W = 136;
const PLATFORM_GAP = [130, 190];
const HEIGHT_GOAL_DEFAULT = 4200;
const GOBLIN_CHANCE = 0.28;
const COIN_CHANCE = 0.4;

// A vertical bouncer, not a side-scroller: gravity pulls the walker down,
// landing on a ledge bounces them back up automatically — no jump button to
// time. Dragging anywhere steers left/right. Climb from the goblin caves up
// to daylight. Falling off-screen is never a fail state: an eagle swoops in
// and drops you back on a ledge, same rule as the rest of the catalog.
export default class AscentScene extends Phaser.Scene {
  constructor() {
    super('Ascent');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.profile = getProfiles()[0];
    this.finished = false;
    this.pointerDown = false;
    this.pointerX = W / 2;
    this.coins = 0;
    this.heightClimbed = 0;
    this.threshold = H * 0.38;

    const params = new URLSearchParams(location.search);
    this.heightGoal = parseFloat(params.get('goal')) || HEIGHT_GOAL_DEFAULT;

    // --- the world: everything that scrolls lives in one container ---
    this.world = this.add.container(0, 0);
    const totalH = this.heightGoal + H + 200;
    const steps = 34;
    const bandH = totalH / steps;
    const cave = Phaser.Display.Color.ValueToColor('#241C14');
    const sky = Phaser.Display.Color.ValueToColor('#BFE3F0');
    const bg = this.add.graphics();
    for (let i = 0; i < steps; i++) {
      const c = Phaser.Display.Color.Interpolate.ColorWithColor(cave, sky, steps - 1, i);
      bg.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
      bg.fillRect(0, H - (i + 1) * bandH, W, bandH + 1);
    }
    this.world.add(bg);

    this.platforms = [];
    this.coinImgs = [];
    // starting ledge, safe and centered, then a climbable chain above it
    this.spawnPlatform(W / 2, H - 160, false);
    this.highestY = H - 160;
    this.lastPlatX = W / 2;
    while (this.highestY > -H) this.spawnNextPlatform();
    // clear goblins/coins that landed right under the fixed top bar —
    // only an issue for this one-time initial seed, never once scrolling starts
    this.platforms.forEach((plat) => {
      if (plat.y < 190 && plat.goblin) {
        plat.goblin.destroy();
        plat.goblin = null;
      }
    });
    this.coinImgs = this.coinImgs.filter((c) => {
      if (c.y < 190) {
        c.img.destroy();
        return false;
      }
      return true;
    });

    // --- the walker ---
    this.player = { x: W / 2, y: H - 230, vy: 0, vx: 0 };
    this.startY = this.player.y;
    this.playerImg = makePortrait(this, this.player.x, this.player.y, this.profile.char, 42).setDepth(10);

    // --- HUD ---
    addArt(this, W / 2 - 18, 140, 'gem', 0.55).setDepth(11);
    this.coinText = this.add.text(W / 2 + 14, 140, '0', textStyle(30, HEX.parchment, 700)).setOrigin(0, 0.5).setDepth(11);

    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    // --- steering: drag anywhere below the top bar ---
    const dragZone = this.add.rectangle(W / 2, (150 + H) / 2, W, H - 150, 0xffffff, 0.001);
    dragZone.setInteractive();
    dragZone.on('pointerdown', (p) => {
      this.pointerDown = true;
      this.pointerX = p.x;
    });
    this.input.on('pointermove', (p) => {
      if (this.pointerDown) this.pointerX = p.x;
    });
    const endDrag = () => {
      this.pointerDown = false;
    };
    this.input.on('pointerup', endDrag);
    this.input.on('pointerupoutside', endDrag);

    this.eagle = addArt(this, W / 2, -100, 'tok-eagle', 1.1).setDepth(30).setVisible(false);

    this.landDust = this.add.particles(0, 0, 'cloud', {
      speed: { min: 30, max: 90 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.1, end: 0.2 },
      alpha: { start: 0.55, end: 0 },
      lifespan: 340,
      tint: 0xd9c6a0,
      emitting: false,
    });
    this.landDust.setDepth(9);
  }

  spawnPlatform(x, y, allowExtras) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.woodDark, 1);
    g.fillRoundedRect(-PLATFORM_W / 2, 6, PLATFORM_W, 22, 11);
    g.fillStyle(COLORS.stone, 1);
    g.fillRoundedRect(-PLATFORM_W / 2, 0, PLATFORM_W, 22, 11);
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(-PLATFORM_W / 2 + 8, 3, PLATFORM_W - 16, 7, 4);
    g.setPosition(x, y);
    this.world.add(g);
    const plat = { x, y, img: g, goblin: null };

    if (allowExtras && Math.random() < GOBLIN_CHANCE) {
      const gob = addArt(this, x, y - 46, 'tok-troll', 0.7).setDepth(4);
      this.world.add(gob);
      plat.goblin = gob;
    } else if (allowExtras && Math.random() < COIN_CHANCE) {
      const coin = addArt(this, x + Phaser.Math.Between(-40, 40), y - 90, 'gem', 0.6).setDepth(4);
      this.world.add(coin);
      if (!REDUCED_MOTION) {
        this.tweens.add({ targets: coin, y: coin.y - 8, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      this.coinImgs.push({ x: coin.x, y: y - 90, img: coin });
    }
    this.platforms.push(plat);
  }

  spawnNextPlatform() {
    const W = this.scale.width;
    const gap = Phaser.Math.Between(PLATFORM_GAP[0], PLATFORM_GAP[1]);
    // keep each ledge within reach of the last one — fully random x could place
    // the next ledge farther sideways than the bounce hang-time allows to steer
    const x = Phaser.Math.Clamp(this.lastPlatX + Phaser.Math.Between(-150, 150), 90, W - 90);
    this.lastPlatX = x;
    this.highestY -= gap;
    this.spawnPlatform(x, this.highestY, true);
  }

  bouncePlatform(plat) {
    // harder landings (higher fall speed) get a bigger, slightly slower squash
    const impact = Phaser.Math.Clamp(Math.abs(this.player.vy) / 900, 0.4, 1.1);
    this.player.vy = BOUNCE_VY;
    this.player.y = plat.y - 40;
    sfx.pop();
    this.tweens.killTweensOf(this.playerImg);
    this.tweens.add({
      targets: this.playerImg,
      scaleY: 1 - 0.32 * impact,
      scaleX: 1 + 0.22 * impact,
      duration: 90 + 40 * impact,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
    if (!REDUCED_MOTION) {
      this.landDust.emitParticleAt(this.player.x, plat.y, 5 + Math.round(3 * impact));
      this.tweens.add({ targets: plat.img, scaleY: 0.82, duration: 80, yoyo: true, ease: 'Sine.easeOut' });
    }
    if (plat.goblin) {
      const gob = plat.goblin;
      plat.goblin = null;
      sfx.match();
      this.addCoin(1);
      this.tweens.add({ targets: gob, scale: 0, alpha: 0, angle: 180, duration: 260, ease: 'Back.easeIn', onComplete: () => gob.destroy() });
    }
  }

  addCoin(n) {
    this.coins += n;
    this.coinText.setText(String(this.coins));
  }

  rescue() {
    sfx.roar();
    const W = this.scale.width;
    this.eagle.setVisible(true).setPosition(W / 2, this.player.y - 40).setAlpha(1);
    this.tweens.add({
      targets: this.eagle,
      y: this.player.y - 140,
      duration: 500,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => this.eagle.setVisible(false),
    });
    this.player.y = this.threshold - 60;
    this.player.vy = BOUNCE_VY * 0.6;
  }

  update(time, delta) {
    if (this.finished) return;
    const dt = Math.min(delta, 50) / 1000;
    const W = this.scale.width;
    const H = this.scale.height;
    const p = this.player;

    // horizontal steering
    if (this.pointerDown) {
      const dx = this.pointerX - p.x;
      p.vx = Phaser.Math.Clamp(dx * 4, -MAX_VX, MAX_VX);
    } else {
      p.vx *= 0.9;
    }
    p.x += p.vx * dt;
    if (p.x < -20) p.x = W + 20;
    if (p.x > W + 20) p.x = -20;

    // gravity + landing check (world coords, before any scroll this frame)
    const prevFootY = p.y + 40;
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;
    const footY = p.y + 40;

    if (p.vy > 0) {
      for (const plat of this.platforms) {
        if (Math.abs(p.x - plat.x) < PLATFORM_W / 2 + 20 && prevFootY <= plat.y && footY >= plat.y) {
          this.bouncePlatform(plat);
          break;
        }
      }
    }

    // fell out of view — the eagle catches the walker, no penalty
    if (p.y > H + 60) this.rescue();

    // scroll the world once the walker climbs above the pinned screen line
    if (p.y < this.threshold) {
      this.world.y += this.threshold - p.y;
      p.y = this.threshold;
    }
    // total climb is measured in world space, so it counts from the very
    // first bounce — not just after the screen starts scrolling
    this.heightClimbed = this.startY - (p.y - this.world.y);

    this.playerImg.setPosition(p.x, p.y);
    if (Math.abs(p.vx) > 20) this.playerImg.scaleX = (p.vx < 0 ? -1 : 1) * Math.abs(this.playerImg.scaleX);
    // a soft lean into the direction of travel — lerped, never snapped, for an elegant feel
    const leanTarget = Phaser.Math.Clamp(p.vx * 0.035, -14, 14);
    this.playerImg.angle = Phaser.Math.Linear(this.playerImg.angle, leanTarget, 0.15);

    // keep the ledge chain going above the highest point reached
    while (this.highestY + this.world.y > -100) this.spawnNextPlatform();
    // drop platforms once well below view (cheap cleanup, keeps object count sane)
    for (let k = this.platforms.length - 1; k >= 0; k--) {
      const plat = this.platforms[k];
      if (plat.y + this.world.y > H + 200) {
        plat.img.destroy();
        if (plat.goblin) plat.goblin.destroy();
        this.platforms.splice(k, 1);
      }
    }

    // coins collected by walking near them (screen-space check)
    for (let k = this.coinImgs.length - 1; k >= 0; k--) {
      const c = this.coinImgs[k];
      const screenY = c.y + this.world.y;
      if (Math.abs(p.x - c.x) < 55 && Math.abs(p.y - screenY) < 55) {
        this.coinImgs.splice(k, 1);
        this.addCoin(1);
        sfx.pop();
        this.tweens.add({ targets: c.img, scale: 0, alpha: 0, duration: 250, ease: 'Back.easeIn', onComplete: () => c.img.destroy() });
      }
    }

    if (this.heightClimbed >= this.heightGoal) this.win();
  }

  win() {
    this.finished = true;
    sfx.win();
    this.cameras.main.flash(400, 255, 244, 214);
    const W = this.scale.width;
    this.eagle.setVisible(true).setPosition(this.player.x, this.player.y).setAlpha(1);
    this.tweens.add({ targets: this.eagle, y: -120, duration: 800, ease: 'Sine.easeIn' });
    this.tweens.add({ targets: this.playerImg, y: this.playerImg.y - 40, alpha: 0, duration: 600, ease: 'Sine.easeIn' });
    this.time.delayedCall(700, () =>
      this.scene.launch('Win', { replay: 'Ascent', winner: { name: this.profile.name, char: this.profile.char } })
    );
  }
}
