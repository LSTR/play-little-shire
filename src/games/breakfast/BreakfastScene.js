import Phaser from 'phaser';
import { HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient, makePortrait } from '../../ui.js';
import { getProfiles } from '../../profiles.js';

const FOODS = ['egg', 'mushroom', 'honey', 'fish'];
const MATCH_SECONDS = 60;

// Two non-rotated horizontal zones (both players read the screen the same way,
// like siblings sitting side by side) — always 2 players, no setup screen needed.
export default class BreakfastScene extends Phaser.Scene {
  constructor() {
    super('Breakfast');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const profiles = getProfiles();
    this.finished = false;
    this.timeLeft = parseFloat(new URLSearchParams(location.search).get('time')) || MATCH_SECONDS;

    this.sparkle = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 160 },
      scale: { start: 0.6, end: 0 },
      lifespan: 450,
      emitting: false,
    });
    this.sparkle.setDepth(20);

    const zoneH = (H - 140) / 2;
    this.zones = [
      this.makeZone(profiles[0], 0, 140 + zoneH, zoneH, '#8FC15C', '#6EA84B'),
      this.makeZone(profiles[1], 1, 140, zoneH, '#B9E4EF', '#8FD1DF'),
    ];

    // shared table divider + top bar
    const div = this.add.graphics().setDepth(10);
    div.fillStyle(0x5a3a1e, 1);
    div.fillRect(0, 140 + zoneH - 5, W, 10);
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });
    this.timeText = this.add.text(W / 2, 70, String(Math.ceil(this.timeLeft)), textStyle(46, HEX.parchment, 700)).setOrigin(0.5);

    this.zones.forEach((z) => this.newRequest(z));
  }

  makeZone(profile, i, top, h, skyA, skyB) {
    const W = this.scale.width;
    verticalGradient(this, 0, top, W, h, skyA, skyB);
    this.add.rectangle(W / 2, top + h - 60, W, 120, 0x8a5a33).setDepth(1);
    this.add.rectangle(W / 2, top + h - 60, W, 8, 0x6b4426).setDepth(1);

    // identity badge, top corner of this zone
    const badgeY = top + 44;
    makePortrait(this, 56, badgeY, profile.char, 30).setDepth(5);
    this.add.text(100, badgeY, profile.name, textStyle(26, HEX.ink, 600)).setOrigin(0, 0.5).setDepth(5);
    const scoreText = this.add.text(W - 56, badgeY, '0', textStyle(38, HEX.ink, 700)).setOrigin(0.5).setDepth(5);

    // the hungry hobbit + thought bubble
    const custY = top + h / 2 + 20;
    const customer = addArt(this, 130, custY, 'mascot', 0.62).setDepth(4);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: customer, y: custY - 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    const bubble = this.add.container(150, custY - 118).setDepth(6);
    bubble.add(addArt(this, 0, 0, 'bubble', 0.85));
    const wantIcon = this.add.image(6, -12, 'tok-egg').setDisplaySize(56, 56);
    bubble.add(wantIcon);

    // plates — interactive is wired up ONCE here; newRequest() only ever swaps the
    // icon/food, it never re-touches interactivity (Phaser containers don't reliably
    // recover their hit area across disableInteractive()/removeInteractive() cycles)
    const plateXs = [370, 500, 630];
    const plates = plateXs.map((x) => {
      const c = this.add.container(x, custY).setDepth(4);
      c.add(addArt(this, 0, 0, 'plate', 1.05));
      const icon = this.add.image(0, -10, 'tok-egg').setDisplaySize(58, 58);
      c.add(icon);
      c.icon = icon;
      c.setSize(96, 96);
      c.setInteractive({ useHandCursor: true });
      return c;
    });
    const zone = { profile, score: 0, scoreText, customer, wantIcon, plates, target: null, locked: false };
    plates.forEach((p) => p.on('pointerup', () => this.serve(zone, p)));
    return zone;
  }

  newRequest(zone) {
    let target = Phaser.Utils.Array.GetRandom(FOODS);
    while (target === zone.target && FOODS.length > 1) target = Phaser.Utils.Array.GetRandom(FOODS);
    zone.target = target;
    zone.wantIcon.setTexture(`tok-${target}`);

    const distractors = Phaser.Utils.Array.Shuffle(FOODS.filter((f) => f !== target)).slice(0, 2);
    const layout = Phaser.Utils.Array.Shuffle([target, ...distractors]);
    zone.plates.forEach((p, i) => {
      const food = layout[i];
      p.icon.setTexture(`tok-${food}`);
      p.food = food;
      p.setScale(1);
    });
  }

  serve(zone, plate) {
    if (this.finished || zone.locked) return;
    if (plate.food === zone.target) {
      zone.locked = true;
      zone.score++;
      zone.scoreText.setText(String(zone.score));
      sfx.match();
      this.sparkle.emitParticleAt(plate.x, plate.y, 10);
      this.tweens.add({ targets: zone.customer, scale: zone.customer.scale * 1.2, duration: 140, yoyo: true, ease: 'Back.easeOut' });
      this.time.delayedCall(350, () => {
        zone.locked = false;
        if (!this.finished) this.newRequest(zone);
      });
    } else {
      sfx.miss();
      this.tweens.add({ targets: plate, angle: { from: -6, to: 6 }, duration: 55, yoyo: true, repeat: 3, onComplete: () => plate.setAngle(0) });
    }
  }

  update(time, delta) {
    if (this.finished) return;
    this.timeLeft -= delta / 1000;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.finish();
    }
    const secs = Math.ceil(this.timeLeft);
    this.timeText.setText(String(secs));
    this.timeText.setColor(secs <= 10 ? '#E88070' : HEX.parchment);
  }

  finish() {
    this.finished = true;
    this.zones.forEach((z) => z.plates.forEach((p) => p.disableInteractive()));
    sfx.win();
    const [a, b] = this.zones;
    const data = { replay: 'Breakfast' };
    if (a.score !== b.score) {
      const w = a.score > b.score ? a : b;
      data.winner = { name: w.profile.name, char: w.profile.char };
    }
    this.time.delayedCall(600, () => this.scene.launch('Win', data));
  }
}
