import Phaser from 'phaser';
import { FONT, COLORS } from './config.js';
import { sfx } from './sfx.js';
import { CHAR_INFO } from './profiles.js';

// Art textures are rasterized at 2x — this places one at its natural size * scale.
export function addArt(scene, x, y, key, scale = 1) {
  return scene.add.image(x, y, key).setScale(scale * 0.5);
}

export function textStyle(size, color = '#FFFFFF', weight = 600) {
  return { fontFamily: FONT, fontSize: `${size}px`, color, fontStyle: String(weight) };
}

// Hover / press micro-interactions for any sized container or image.
export function pressable(scene, obj, onTap, { hover = 1.04 } = {}) {
  obj.setInteractive({ useHandCursor: true });
  const bx = obj.scaleX;
  const by = obj.scaleY;
  const to = (sx, sy, dur, ease = 'Sine.easeOut') =>
    scene.tweens.add({ targets: obj, scaleX: sx, scaleY: sy, duration: dur, ease });
  obj.on('pointerover', () => to(bx * hover, by * hover, 120));
  obj.on('pointerout', () => to(bx, by, 120));
  obj.on('pointerdown', () => to(bx * 0.95, by * 0.95, 70));
  obj.on('pointerup', () => {
    to(bx, by, 160, 'Back.easeOut');
    if (onTap) onTap();
  });
}

// Chunky rounded button with a darker base edge (the "pressable toy" look).
export function chunkyButton(scene, x, y, w, h, label, opts = {}, onTap) {
  const {
    fill = COLORS.green,
    base = COLORS.greenDark,
    color = '#FFFFFF',
    size = 34,
    icon = null,
  } = opts;
  const c = scene.add.container(x, y);
  const r = Math.min(24, h / 2);
  const g = scene.add.graphics();
  g.fillStyle(base, 1);
  g.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, r);
  g.fillStyle(fill, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  g.fillStyle(0xffffff, 0.18);
  g.fillRoundedRect(-w / 2 + 8, -h / 2 + 6, w - 16, h * 0.36, r * 0.6);
  c.add(g);

  const tx = scene.add.text(0, -2, label, textStyle(size, color)).setOrigin(0.5);
  if (icon) {
    const iconSize = size + 14;
    const ic = scene.add.image(0, -2, icon).setDisplaySize(iconSize, iconSize);
    const total = iconSize + 12 + tx.width;
    ic.x = -total / 2 + iconSize / 2;
    tx.x = ic.x + iconSize / 2 + 12 + tx.width / 2;
    tx.setOrigin(0.5);
    c.add(ic);
  }
  c.add(tx);
  c.setSize(w, h + 7);
  pressable(scene, c, () => {
    sfx.click();
    if (onTap) onTap();
  });
  return c;
}

// Round icon button (top bars, close buttons).
export function iconButton(scene, x, y, key, opts = {}, onTap) {
  const { fill = COLORS.greenDark, base = COLORS.greenDeep, r = 36, iconSize = 40 } = opts;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(base, 1);
  g.fillCircle(0, 5, r);
  g.fillStyle(fill, 1);
  g.fillCircle(0, 0, r);
  g.fillStyle(0xffffff, 0.16);
  g.fillEllipse(0, -r * 0.42, r * 1.3, r * 0.66);
  c.add(g);
  const ic = scene.add.image(0, 0, key).setDisplaySize(iconSize, iconSize);
  c.add(ic);
  c.icon = ic;
  c.setSize(r * 2, r * 2 + 5);
  pressable(scene, c, () => {
    sfx.click();
    if (onTap) onTap();
  });
  return c;
}

// Parchment panel with double border and soft drop shadow (drawn at 0,0 — put in a container).
export function parchmentPanel(scene, w, h) {
  const g = scene.add.graphics();
  g.fillStyle(COLORS.woodDark, 0.28);
  g.fillRoundedRect(-w / 2 + 6, -h / 2 + 12, w, h, 26);
  g.fillStyle(COLORS.parchment, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 26);
  g.lineStyle(5, COLORS.parchmentEdge, 1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 26);
  g.lineStyle(2, COLORS.parchmentEdge, 0.7);
  g.strokeRoundedRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 18);
  return g;
}

// Character medallion: colored disc with the figure standing on it.
export function makePortrait(scene, x, y, charKey, r = 40) {
  const info = CHAR_INFO[charKey];
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(info.color, 0.3);
  g.fillCircle(0, 0, r);
  g.lineStyle(Math.max(3, r * 0.1), info.color, 1);
  g.strokeCircle(0, 0, r);
  c.add(g);
  const img = scene.add.image(0, r - r * 0.15, info.art).setOrigin(0.5, 1);
  img.setScale((r * 1.7) / img.height);
  c.add(img);
  c.setSize(r * 2, r * 2);
  return c;
}

export function darken(color, amount = 28) {
  return Phaser.Display.Color.ValueToColor(color).darken(amount).color;
}

// Renderer-independent vertical gradient (banded).
export function verticalGradient(scene, x, y, w, h, topHex, bottomHex, steps = 16) {
  const top = Phaser.Display.Color.ValueToColor(topHex);
  const bottom = Phaser.Display.Color.ValueToColor(bottomHex);
  const g = scene.add.graphics();
  const bandH = h / steps;
  for (let i = 0; i < steps; i++) {
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(top, bottom, steps - 1, i);
    g.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 1);
    g.fillRect(x, y + i * bandH, w, bandH + 1);
  }
  return g;
}
