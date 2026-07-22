import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, chunkyButton, parchmentPanel, verticalGradient } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const HEARTS = 5;
const RUN_MS = 60000;
const DOOR = { x: 360, y: 680 };

// Real-time co-op defense, both players at once: spiders creep in from both
// edges toward the round door and each player shoos their own side, but the
// row of hearts is shared — the garden survives or falls together. Hold out
// until sunrise. Losing is gentle: a "try again" panel, never a winner screen.
export default class ShireScene extends Phaser.Scene {
  constructor() {
    super('Shire');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = getProfiles();
    this.over = false;
    this.elapsed = 0;
    this.spawnAcc = 0;
    this.spawned = 0;
    this.nextSide = 0;
    this.creatures = [];

    // --- the Shire at night ---
    verticalGradient(this, 0, 0, W, H, '#1C2440', '#2F4A30');
    for (let s = 0; s < 14; s++) {
      this.add.image(Phaser.Math.Between(20, W - 20), Phaser.Math.Between(40, 300), 'sparkle')
        .setDisplaySize(10, 10)
        .setAlpha(Phaser.Math.FloatBetween(0.25, 0.6));
    }

    // each player's half, marked by a soft dashed line
    const dg = this.add.graphics().setDepth(1);
    dg.fillStyle(COLORS.parchment, 0.18);
    for (let y = 310; y < 1120; y += 40) dg.fillRect(W / 2 - 3, y, 6, 22);

    // the round door on its mound — what everyone is protecting
    this.add.ellipse(DOOR.x, DOOR.y + 62, 300, 120, COLORS.greenDeep).setDepth(2);
    addArt(this, DOOR.x, DOOR.y, 'hobbit-door', 1.6).setDepth(3);

    // --- night-to-sunrise progress track ---
    const trackY = 168;
    const tg = this.add.graphics();
    tg.fillStyle(0x141b2e, 0.5);
    tg.fillRoundedRect(112, trackY - 7, W - 224, 14, 7);
    this.add.image(78, trackY, 'tok-moon').setDisplaySize(46, 46);
    this.add.image(W - 78, trackY, 'tok-sun').setDisplaySize(52, 52);
    this.trackX0 = 118;
    this.trackX1 = W - 118;
    this.sunMarker = this.add.image(this.trackX0, trackY, 'tok-sun').setDisplaySize(38, 38).setDepth(9);

    // --- shared hearts ---
    this.heartImgs = [];
    for (let k = 0; k < HEARTS; k++) {
      const hx = W / 2 + (k - (HEARTS - 1) / 2) * 58;
      this.heartImgs.push(this.add.image(hx, 245, 'heart').setDisplaySize(46, 46));
    }
    this.hearts = HEARTS;

    // --- corners ---
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    this.sparkleBurst = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.6, end: 0 },
      lifespan: 500,
      emitting: false,
    });
    this.sparkleBurst.setDepth(20);
    this.poof = this.add.particles(0, 0, 'cloud', {
      speed: { min: 20, max: 60 },
      scale: { start: 0.08, end: 0.16 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 500,
      tint: 0x9aa394,
      emitting: false,
    });
    this.poof.setDepth(20);

    // dev deep-links: &run=ms shortens the night, &hearts=N, &spawn=ms fixes the
    // spawn interval, &speed=px/s fixes spider speed, &lane=y fixes the spawn row
    const params = new URLSearchParams(location.search);
    this.runMs = parseInt(params.get('run'), 10) || RUN_MS;
    this.hearts = Math.min(parseInt(params.get('hearts'), 10) || HEARTS, HEARTS);
    this.fixedSpawn = parseInt(params.get('spawn'), 10) || null;
    this.fixedSpeed = parseInt(params.get('speed'), 10) || null;
    this.fixedLane = parseInt(params.get('lane'), 10) || null;
    this.renderHearts();
  }

  renderHearts() {
    this.heartImgs.forEach((img, k) => img.setAlpha(k < this.hearts ? 1 : 0.22));
  }

  spawn() {
    const W = this.scale.width;
    const side = this.nextSide;
    this.nextSide = 1 - this.nextSide;
    this.spawned++;
    const isTroll = this.spawned % 5 === 0;
    const x = side === 0 ? -50 : W + 50;
    const y = this.fixedLane || Phaser.Math.Between(300, 1080);
    const ramp = 1 + Math.min(this.elapsed / this.runMs, 1) * 0.4;
    const speed = this.fixedSpeed
      ? (isTroll ? this.fixedSpeed * 0.6 : this.fixedSpeed)
      : (isTroll ? 40 : Phaser.Math.Between(55, 75)) * ramp;

    const img = addArt(this, x, y, isTroll ? 'tok-troll' : 'tok-spider', isTroll ? 1.35 : 1.15);
    img.setDepth(5).setFlipX(side === 1);
    img.setInteractive({ useHandCursor: true });
    const c = {
      img,
      posX: x,
      posY: y,
      hp: isTroll ? 2 : 1,
      speed,
      side,
      phase: Math.random() * Math.PI * 2,
    };
    img.on('pointerdown', () => this.hit(c));
    this.creatures.push(c);
  }

  hit(c) {
    if (this.over || !this.creatures.includes(c)) return;
    c.hp--;
    if (c.hp > 0) {
      // sturdy troll: first tap knocks it back
      sfx.click();
      const [dx, dy] = this.dirTo(c);
      c.posX -= dx * 120;
      c.posY -= dy * 120;
      this.tweens.add({ targets: c.img, angle: { from: -10, to: 10 }, duration: 60, yoyo: true, repeat: 2, onComplete: () => c.img.setAngle(0) });
      return;
    }
    sfx.pop();
    this.sparkleBurst.emitParticleAt(c.img.x, c.img.y, 6);
    this.flee(c);
  }

  // scared away: leaves the flock and tumbles back off its own edge
  flee(c) {
    Phaser.Utils.Array.Remove(this.creatures, c);
    c.img.disableInteractive();
    const [dx] = this.dirTo(c);
    this.tweens.add({
      targets: c.img,
      x: c.img.x - dx * 500,
      y: c.img.y - 240,
      angle: dx * -300,
      alpha: 0,
      duration: 500,
      ease: 'Sine.easeIn',
      onComplete: () => c.img.destroy(),
    });
  }

  dirTo(c) {
    const d = Math.hypot(DOOR.x - c.posX, DOOR.y - c.posY) || 1;
    return [(DOOR.x - c.posX) / d, (DOOR.y - c.posY) / d];
  }

  update(time, delta) {
    if (this.over || !this.creatures) return;
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += delta;

    const frac = Phaser.Math.Clamp(this.elapsed / this.runMs, 0, 1);
    this.sunMarker.x = this.trackX0 + frac * (this.trackX1 - this.trackX0);

    // spawning stops near sunrise so the field can clear
    if (this.elapsed < this.runMs - 4000) {
      const interval = this.fixedSpawn || 2200 - Math.min(this.elapsed / this.runMs, 1) * 1200;
      this.spawnAcc += delta;
      if (this.spawnAcc >= interval) {
        this.spawnAcc = 0;
        this.spawn();
      }
    }

    for (let k = this.creatures.length - 1; k >= 0; k--) {
      const c = this.creatures[k];
      const [dx, dy] = this.dirTo(c);
      c.posX += dx * c.speed * dt;
      c.posY += dy * c.speed * dt;
      c.img.x = c.posX;
      c.img.y = c.posY + Math.sin(time * 0.006 + c.phase) * 6;

      if (Math.hypot(DOOR.x - c.posX, DOOR.y - c.posY) < 100) {
        // it reached the door — one shared heart, gently
        this.creatures.splice(k, 1);
        this.poof.emitParticleAt(c.img.x, c.img.y, 5);
        c.img.destroy();
        this.hearts--;
        this.renderHearts();
        sfx.miss();
        if (!REDUCED_MOTION) this.cameras.main.shake(130, 0.004);
        if (this.hearts <= 0) {
          this.fail();
          return;
        }
      }
    }

    if (this.elapsed >= this.runMs && this.creatures.length === 0) this.dawn();
  }

  dawn() {
    this.over = true;
    sfx.win();
    if (!REDUCED_MOTION) this.cameras.main.flash(500, 255, 224, 150);
    const W = this.scale.width;
    const banner = this.add.text(W / 2, 560, t('shire.dawn'), textStyle(56, HEX.gold, 700)).setOrigin(0.5).setDepth(40);
    banner.setShadow(0, 4, '#1E2430', 4);
    banner.setScale(0);
    this.tweens.add({ targets: banner, scale: 1, duration: 380, ease: 'Back.easeOut' });
    this.time.delayedCall(1500, () =>
      this.scene.launch('Win', { replay: 'Shire', team: this.players.map((p) => p.char) })
    );
  }

  fail() {
    this.over = true;
    sfx.roar();
    this.creatures.forEach((c) => {
      c.img.disableInteractive();
      this.tweens.add({ targets: c.img, alpha: 0, duration: 400 });
    });
    this.creatures = [];

    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.container(0, 0).setDepth(50);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x1e3018, 0).setInteractive();
    overlay.add(dim);
    this.tweens.add({ targets: dim, fillAlpha: 0.55, duration: 250 });

    const panel = this.add.container(W / 2, H / 2);
    panel.add(parchmentPanel(this, 560, 620));
    panel.add(addArt(this, 0, -190, 'tok-spider', 1.5));
    panel.add(this.add.text(0, -80, t('shire.failTitle'), textStyle(42, HEX.ink, 700)).setOrigin(0.5));
    panel.add(
      this.add
        .text(0, 15, t('shire.failDesc'), { ...textStyle(27, HEX.inkSoft, 400), align: 'center', lineSpacing: 8 })
        .setOrigin(0.5)
    );
    panel.add(chunkyButton(this, 0, 130, 330, 92, t('again'), { size: 36, icon: 'icon-replay' }, () => this.scene.restart()));
    panel.add(
      chunkyButton(this, 0, 245, 330, 92, t('home'), { size: 36, icon: 'icon-home', fill: COLORS.wood, base: COLORS.woodDark }, () =>
        this.scene.start('Menu')
      )
    );
    overlay.add(panel);
    panel.setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 300, ease: 'Back.easeOut' });
  }
}
