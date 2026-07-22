import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../../config.js';
import { t } from '../../strings.js';
import { sfx, isSoundOn, toggleSound } from '../../sfx.js';
import { addArt, textStyle, iconButton, verticalGradient, makePortrait, darken } from '../../ui.js';
import { getProfiles, CHAR_INFO } from '../../profiles.js';

const GEMS_TO_WIN = 5;
const SYNC_MS = 1200; // after one player taps, how long the partner has to join

// Co-op stealth twist on the Dragon duel: the troll naps in cycles, and when it
// sinks into deep sleep (green glow on both buttons) BOTH players must tap
// together to tiptoe past and steal a gem. Waking it never costs gems — the
// troll just grumbles, settles, and the pair tries again.
export default class SneakScene extends Phaser.Scene {
  constructor() {
    super('Sneak');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.players = getProfiles();
    this.gems = 0;
    this.phase = 'wait'; // wait (light sleep, unsafe) | safe | result
    this.tapped = [false, false];

    // --- moonlit clearing ---
    verticalGradient(this, 0, 0, W, H, '#1B2337', '#2E4A2A');
    addArt(this, 612, 468, 'tok-moon', 1.3).setAlpha(0.9);
    if (!REDUCED_MOTION) {
      this.add.particles(0, 0, 'firefly', {
        x: { min: 30, max: W - 30 },
        y: { min: H * 0.32, max: H * 0.68 },
        lifespan: 4000,
        speedX: { min: -12, max: 12 },
        speedY: { min: -14, max: -4 },
        scale: { start: 0.5, end: 0.2 },
        alpha: { start: 0, end: 0.8, ease: 'Sine.easeInOut' },
        frequency: 900,
      });
    }

    // --- the troll, napping on his gem hoard ---
    this.troll = this.add.container(W / 2, 640);
    this.troll.add(addArt(this, 0, 0, 'troll-body', 1.7));
    this.eyes = addArt(this, 0, -13, 'troll-eyes-closed', 1.7);
    this.troll.add(this.eyes);
    this.zzzC = this.add.container(W / 2 + 112, 512);
    this.zzz = this.add.text(0, 0, 'z Z z', textStyle(34, HEX.gold, 600)).setAlpha(0.85).setAngle(14);
    this.zzzC.add(this.zzz);
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: this.zzzC, y: 500, alpha: 0.6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    this.hoard = [
      [-104, 732, -15],
      [-52, 740, -6],
      [2, 742, 0],
      [56, 738, 10],
      [106, 730, 18],
    ].map(([x, y, a]) => this.add.image(W / 2 + x, y, 'gem').setDisplaySize(44, 44).setAngle(a));

    // --- player zones (P2 rotated for face-to-face play) ---
    this.zones = [this.makeZone(0, 1030, 0), this.makeZone(1, 250, 180)];

    this.sparkle = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.7, end: 0 },
      lifespan: 550,
      emitting: false,
    });
    this.sparkle.setDepth(30);

    // --- corners: home + sound (for the grown-up holding the table) ---
    iconButton(this, 64, 70, 'icon-home', {}, () => this.scene.start('Menu'));
    this.soundBtn = iconButton(this, W - 64, 70, isSoundOn() ? 'icon-sound-on' : 'icon-sound-off', {}, () => {
      const on = toggleSound();
      this.soundBtn.icon.setTexture(on ? 'icon-sound-on' : 'icon-sound-off');
    });

    // dev deep-links: &wait=ms fixes the nap length, &safe=ms the glow window,
    // &sync=ms the partner window, &gems=N pre-fills the score
    const params = new URLSearchParams(location.search);
    this.fixedWait = parseInt(params.get('wait'), 10) || null;
    this.safeMs = parseInt(params.get('safe'), 10) || 2600;
    this.syncMs = parseInt(params.get('sync'), 10) || SYNC_MS;
    const g0 = parseInt(params.get('gems'), 10);
    if (g0 > 0 && g0 < GEMS_TO_WIN) {
      this.gems = g0;
      this.renderGems();
      for (let k = 1; k <= g0; k++) this.hoard[this.hoard.length - k].setVisible(false);
    }

    this.startRound();
  }

  makeZone(i, y, angle) {
    const p = this.players[i];
    const info = CHAR_INFO[p.char];
    const z = this.add.container(this.scale.width / 2, y).setAngle(angle);

    // deep-sleep glow: lights up when it's safe to sneak
    const glow = this.add.graphics();
    glow.lineStyle(12, COLORS.meadow, 1);
    glow.strokeCircle(0, 0, 142);
    glow.setAlpha(0);
    z.add(glow);
    z.glow = glow;

    // the big button
    const btn = this.add.container(0, 0);
    const g = this.add.graphics();
    g.fillStyle(darken(info.color), 1);
    g.fillCircle(0, 8, 122);
    g.fillStyle(info.color, 1);
    g.fillCircle(0, 0, 120);
    g.fillStyle(0xffffff, 0.15);
    g.fillEllipse(0, -52, 156, 74);
    btn.add(g);
    btn.add(makePortrait(this, 0, -20, p.char, 46));
    btn.add(this.add.text(0, 58, p.name, textStyle(30, '#FFFFFF', 700)).setOrigin(0.5));
    btn.setSize(250, 250);
    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => this.tap(i)); // pointerdown: sneaking deserves zero latency
    z.add(btn);
    z.btn = btn;

    // partner countdown ring: shrinks while one player waits for the other
    const sync = this.add.graphics();
    sync.lineStyle(12, COLORS.gold, 1);
    sync.strokeCircle(0, 0, 150);
    sync.setVisible(false);
    z.add(sync);
    z.sync = sync;

    // shared gem slots, mirrored on both sides
    z.gemSlots = [];
    for (let k = 0; k < GEMS_TO_WIN; k++) {
      const gx = (k - (GEMS_TO_WIN - 1) / 2) * 58;
      const slot = this.add.graphics();
      slot.lineStyle(3.5, info.color, 0.7);
      slot.strokeCircle(gx, -180, 23);
      z.add(slot);
      const gem = this.add.image(gx, -180, 'gem').setDisplaySize(38, 38).setVisible(false);
      z.add(gem);
      z.gemSlots.push({ x: gx, gem });
    }

    // status line
    z.status = this.add.text(0, -248, '', textStyle(30, HEX.parchment, 600)).setOrigin(0.5);
    z.add(z.status);
    return z;
  }

  renderGems() {
    this.zones.forEach((z) => z.gemSlots.forEach((slot, k) => slot.gem.setVisible(k < this.gems)));
  }

  setStatus(i, text, color = '#F7ECD4') {
    this.zones[i].status.setText(text).setColor(color);
  }

  setEyes(state) {
    this.eyes.setTexture(state === 'half' ? 'troll-eyes-half' : 'troll-eyes-closed');
  }

  glowOn() {
    this.zones.forEach((z) => {
      this.tweens.killTweensOf(z.glow);
      if (REDUCED_MOTION) {
        z.glow.setAlpha(0.9);
      } else {
        z.glow.setAlpha(0.25);
        this.tweens.add({ targets: z.glow, alpha: 0.95, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
    });
  }

  glowOff() {
    this.zones.forEach((z) => {
      this.tweens.killTweensOf(z.glow);
      z.glow.setAlpha(0);
    });
  }

  shakeTroll() {
    this.tweens.add({ targets: this.troll, angle: { from: -2.5, to: 2.5 }, duration: 70, yoyo: true, repeat: 3, onComplete: () => this.troll.setAngle(0) });
  }

  startRound() {
    this.phase = 'wait';
    this.tapped = [false, false];
    this.setEyes('closed');
    this.glowOff();
    this.zzzC.setVisible(true);
    this.tweens.killTweensOf(this.zzz);
    this.zzz.setScale(1);
    this.zones.forEach((z, i) => {
      z.btn.setAlpha(1);
      z.sync.setVisible(false);
      this.tweens.killTweensOf(z.sync);
      this.setStatus(i, t('sneak.wait'));
    });

    const wait = this.fixedWait || Phaser.Math.Between(2200, 4800);
    // teasing stirs that punish the impatient
    for (let b = 0; b < 2; b++) {
      const bt = Phaser.Math.Between(700, Math.max(800, wait - 900));
      if (bt < wait - 600) {
        this.time.delayedCall(bt, () => {
          if (this.phase !== 'wait') return;
          this.setEyes('half');
          this.time.delayedCall(260, () => {
            if (this.phase === 'wait') this.setEyes('closed');
          });
        });
      }
    }
    this.waitTimer = this.time.delayedCall(wait, () => this.openSafe());
  }

  openSafe() {
    if (this.phase !== 'wait') return;
    this.phase = 'safe';
    sfx.pop();
    this.setEyes('closed');
    this.glowOn();
    if (!REDUCED_MOTION) {
      this.tweens.add({ targets: this.zzz, scale: 1.4, duration: 300, ease: 'Back.easeOut' });
    }
    this.zones.forEach((z, i) => this.setStatus(i, t('sneak.now'), '#8FC15C'));
    this.safeTimer = this.time.delayedCall(this.safeMs, () => this.closeSafe());
  }

  closeSafe() {
    if (this.phase !== 'safe') return;
    if (this.tapped[0] || this.tapped[1]) return; // let the sync window decide
    this.startRound();
  }

  tap(i) {
    if (this.phase === 'wait') {
      this.stir(i);
      return;
    }
    if (this.phase !== 'safe' || this.tapped[i]) return;
    this.tapped[i] = true;
    sfx.flip();
    this.zones[i].btn.setAlpha(0.75);
    if (this.tapped[0] && this.tapped[1]) {
      this.success();
      return;
    }

    // first tap: the partner gets a shrinking countdown ring
    const other = 1 - i;
    this.setStatus(i, t('sneak.good'), '#8FC15C');
    this.setStatus(other, t('sneak.together'), '#F2B84B');
    const ring = this.zones[other].sync;
    ring.setVisible(true).setScale(1).setAlpha(1);
    this.tweens.add({ targets: ring, scale: 0.55, alpha: 0.35, duration: this.syncMs, ease: 'Linear' });
    this.syncTimer = this.time.delayedCall(this.syncMs, () => this.missSync());
  }

  // tapped while the troll is only lightly asleep — it stirs, nothing is lost
  stir(i) {
    if (this.phase !== 'wait') return;
    this.phase = 'result';
    this.waitTimer.remove(false);
    sfx.lock();
    this.setEyes('half');
    this.zzzC.setVisible(false);
    this.setStatus(i, t('sneak.shh'), '#E88070');
    this.shakeTroll();
    this.time.delayedCall(1100, () => this.startRound());
  }

  // one player tapped but the partner missed the window — gentle retry
  missSync() {
    if (this.phase !== 'safe') return;
    this.phase = 'result';
    this.safeTimer.remove(false);
    sfx.lock();
    this.setEyes('half');
    this.zzzC.setVisible(false);
    this.glowOff();
    this.zones.forEach((z, i) => {
      z.sync.setVisible(false);
      this.tweens.killTweensOf(z.sync);
      this.setStatus(i, t('sneak.miss'), '#E88070');
    });
    this.shakeTroll();
    this.time.delayedCall(1300, () => this.startRound());
  }

  success() {
    this.phase = 'result';
    this.safeTimer.remove(false);
    if (this.syncTimer) this.syncTimer.remove(false);
    this.glowOff();
    this.gems++;
    sfx.match();

    // the stolen gem leaves the hoard and flies to both mirrored slot rows
    const from = this.hoard[this.hoard.length - this.gems];
    from.setVisible(false);
    this.zones.forEach((z, i) => {
      z.sync.setVisible(false);
      this.tweens.killTweensOf(z.sync);
      this.setStatus(i, t('sneak.got'), '#8FC15C');
      const slot = z.gemSlots[this.gems - 1];
      const flip = z.angle === 180 ? -1 : 1;
      const tx = this.scale.width / 2 + flip * slot.x;
      const ty = z.y + flip * -180;
      const fly = this.add.image(from.x, from.y, 'gem').setDisplaySize(54, 54).setDepth(40);
      this.tweens.add({
        targets: fly,
        x: tx,
        y: ty,
        displayWidth: 38,
        displayHeight: 38,
        duration: 520,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          fly.destroy();
          this.renderGems();
          this.sparkle.emitParticleAt(tx, ty, 8);
        },
      });
    });

    if (this.gems >= GEMS_TO_WIN) {
      sfx.win();
      this.time.delayedCall(1200, () =>
        this.scene.launch('Win', { replay: 'Sneak', team: this.players.map((p) => p.char) })
      );
    } else {
      this.time.delayedCall(1700, () => this.startRound());
    }
  }
}
