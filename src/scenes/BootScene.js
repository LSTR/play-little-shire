import Phaser from 'phaser';
import { loadArt } from '../assets/art.js';
import { FONT } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  async create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#BFE3F0');
    const dots = this.add
      .text(width / 2, height / 2, '· · ·', { fontFamily: FONT, fontSize: '48px', color: '#3E7B3E' })
      .setOrigin(0.5);
    this.tweens.add({ targets: dots, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });

    try {
      await Promise.all(
        ['300', '400', '600', '700'].map((w) => document.fonts.load(`${w} 40px Fredoka`))
      );
    } catch (e) {
      /* fall back to system font */
    }
    await loadArt(this);
    // dev deep-link: /?scene=Memory jumps straight into a scene
    const wanted = new URLSearchParams(location.search).get('scene');
    this.scene.start(wanted && this.scene.get(wanted) ? wanted : 'Menu');
  }
}
