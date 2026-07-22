import Phaser from 'phaser';
import { COLORS, HEX, REDUCED_MOTION } from '../config.js';
import { t } from '../strings.js';
import { sfx } from '../sfx.js';
import { chunkyButton, parchmentPanel, textStyle, makePortrait } from '../ui.js';

const CONFETTI = [0xf2b84b, 0xd95b43, 0x5e9642, 0x4a90d9, 0x7a5aa6];

export default class WinScene extends Phaser.Scene {
  constructor() {
    super('Win');
  }

  create(data) {
    const replay = data?.replay || 'Memory';
    const W = this.scale.width;
    const H = this.scale.height;

    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x1e3018, 0).setInteractive();
    this.tweens.add({ targets: dim, fillAlpha: 0.6, duration: 250 });

    // confetti rain
    CONFETTI.forEach((color, i) => {
      const key = `conf${i}`;
      if (!this.textures.exists(key)) {
        const g = this.make.graphics({ add: false });
        g.fillStyle(color, 1);
        g.fillRoundedRect(0, 0, 14, 20, 4);
        g.generateTexture(key, 14, 20);
        g.destroy();
      }
      const em = this.add.particles(0, 0, key, {
        x: { min: 0, max: W },
        y: -30,
        speedY: { min: 220, max: 420 },
        speedX: { min: -60, max: 60 },
        rotate: { start: 0, end: 720 },
        lifespan: 3800,
        frequency: REDUCED_MOTION ? 400 : 110,
        scale: { min: 0.7, max: 1.1 },
      });
      this.time.delayedCall(2600, () => em.stop());
    });

    // dev deep-link: /?scene=Win&winner=<charKey> previews the winner layout,
    // &team=char1,char2 previews the team-victory layout
    const devChar = new URLSearchParams(location.search).get('winner');
    const devTeam = new URLSearchParams(location.search).get('team');
    const winner = data?.winner || (devChar ? { name: 'Bilbo', char: devChar } : null);
    const team = data?.team || (devTeam ? devTeam.split(',') : null);
    const tall = winner || team;
    const panel = this.add.container(W / 2, H / 2);
    panel.add(parchmentPanel(this, 560, tall ? 680 : 600));

    // three stars bounce in
    const starTop = tall ? -40 : 0;
    const starPos = [
      [-120, -160 + starTop, -14],
      [0, -185 + starTop, 0],
      [120, -160 + starTop, 14],
    ];
    starPos.forEach(([sx, sy, ang], i) => {
      const star = this.add.image(sx, sy, 'icon-star').setDisplaySize(110, 110).setAngle(ang).setScale(0);
      panel.add(star);
      this.tweens.add({
        targets: star,
        scale: 110 / star.width,
        duration: 380,
        delay: 350 + i * 260,
        ease: 'Back.easeOut',
        onStart: () => sfx.pop(),
      });
    });

    if (team) {
      const n = team.length;
      const spacing = n <= 2 ? 110 : n === 3 ? 85 : 65;
      team.forEach((ch, i) => {
        const port = makePortrait(this, (i - (n - 1) / 2) * spacing, -75, ch, 42);
        port.setScale(0);
        panel.add(port);
        this.tweens.add({ targets: port, scale: 1, duration: 380, delay: 1150 + i * 80, ease: 'Back.easeOut' });
      });
      panel.add(this.add.text(0, 25, t('winTeam'), textStyle(46, HEX.ink, 700)).setOrigin(0.5));
    } else if (winner) {
      const port = makePortrait(this, 0, -75, winner.char, 56);
      port.setScale(0);
      this.tweens.add({ targets: port, scale: 1, duration: 380, delay: 1150, ease: 'Back.easeOut' });
      panel.add(port);
      panel.add(this.add.text(0, 25, t('winner').replace('{name}', winner.name), textStyle(46, HEX.ink, 700)).setOrigin(0.5));
    } else {
      panel.add(this.add.text(0, -30, t('win'), textStyle(52, HEX.ink, 700)).setOrigin(0.5));
    }

    panel.add(
      chunkyButton(this, 0, tall ? 130 : 90, 330, 92, t('again'), { size: 36, icon: 'icon-replay' }, () => {
        const target = this.scene.get(replay);
        this.scene.stop();
        target.scene.restart();
      })
    );
    panel.add(
      chunkyButton(
        this,
        0,
        tall ? 250 : 210,
        330,
        92,
        t('home'),
        { size: 36, icon: 'icon-home', fill: COLORS.wood, base: COLORS.woodDark },
        () => {
          this.scene.stop(replay);
          this.scene.start('Menu');
        }
      )
    );

    panel.setScale(0.5).setAlpha(0);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 320, ease: 'Back.easeOut' });
  }
}
