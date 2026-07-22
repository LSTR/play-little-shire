// Shared "who is playing?" overlay, roster builder and score chips for multiplayer games.
import { t } from '../strings.js';
import { getProfiles, CHAR_KEYS, CHAR_INFO } from '../profiles.js';
import { chunkyButton, parchmentPanel, makePortrait, textStyle, darken } from '../ui.js';
import { COLORS, HEX } from '../config.js';

// Roster for n >= 2: players 1-2 come from the profiles, 3-4 get the remaining characters.
export function playerRoster(n) {
  const profs = getProfiles();
  const players = [];
  for (let i = 0; i < n; i++) {
    if (i < 2) players.push({ name: profs[i].name, char: profs[i].char });
    else {
      const used = players.map((p) => p.char);
      const char = CHAR_KEYS.find((c) => !used.includes(c));
      players.push({ name: t(`chars.${char}`), char });
    }
  }
  return players;
}

// Score chips row: portrait + points per player; the active player's chip glows.
export function makeScoreChips(scene, roster, y = 168) {
  const W = scene.scale.width;
  const n = roster.length;
  const spacing = n === 2 ? 300 : n === 3 ? 225 : 172;
  const chipW = n === 2 ? 250 : n === 3 ? 200 : 158;
  const chips = roster.map((p, i) => {
    const info = CHAR_INFO[p.char];
    const c = scene.add.container(W / 2 + (i - (n - 1) / 2) * spacing, y);
    const g = scene.add.graphics();
    g.fillStyle(darken(info.color), 1);
    g.fillRoundedRect(-chipW / 2, -27, chipW, 58, 20);
    g.fillStyle(info.color, 1);
    g.fillRoundedRect(-chipW / 2, -32, chipW, 58, 20);
    c.add(g);
    c.add(makePortrait(scene, -chipW / 2 + 34, -3, p.char, 24));
    if (n === 2) {
      c.add(scene.add.text(-chipW / 2 + 68, -3, p.name, textStyle(24, '#FFFFFF', 600)).setOrigin(0, 0.5));
    }
    c.scoreText = scene.add.text(chipW / 2 - 30, -3, '0', textStyle(30, '#FFFFFF', 700)).setOrigin(0.5);
    c.add(c.scoreText);
    c.ring = scene.add.graphics();
    c.ring.lineStyle(5, COLORS.gold, 1);
    c.ring.strokeRoundedRect(-chipW / 2 - 5, -37, chipW + 10, 68, 24);
    c.add(c.ring);
    return c;
  });
  return {
    chips,
    update(scores, turn) {
      chips.forEach((c, i) => {
        c.scoreText.setText(String(scores[i]));
        c.ring.setVisible(i === turn);
        c.setAlpha(i === turn ? 1 : 0.6);
      });
    },
  };
}

// Calls onStart(roster) — roster is null for single player.
export function showPlayerSetup(scene, { max = 4, onStart }) {
  const W = scene.scale.width;
  const overlay = scene.add.container(0, 0).setDepth(60);
  const dim = scene.add.rectangle(W / 2, 640, W, 1280, 0x1e2430, 0.55).setInteractive();
  overlay.add(dim);
  const panel = scene.add.container(W / 2, 620);
  panel.add(parchmentPanel(scene, 580, 720));
  panel.add(scene.add.text(0, -310, t('whoPlays'), textStyle(38, HEX.ink, 700)).setOrigin(0.5));

  let count = 1;
  const marks = [];
  const rows = scene.add.container(0, 0);
  panel.add(rows);

  const renderRows = () => {
    rows.removeAll(true);
    const p0 = getProfiles()[0];
    const roster = count === 1 ? [{ name: p0.name, char: p0.char }] : playerRoster(count);
    roster.forEach((p, i) => {
      const y = -95 + i * 95;
      rows.add(makePortrait(scene, -150, y, p.char, 38));
      rows.add(scene.add.text(-95, y, p.name, textStyle(29, HEX.ink, 600)).setOrigin(0, 0.5));
    });
  };

  for (let n = 1; n <= max; n++) {
    const i = n - 1;
    const x = -195 + i * 130;
    panel.add(
      chunkyButton(scene, x, -220, 112, 92, String(n), { size: 40 }, () => {
        count = n;
        marks.forEach((m, j) => m.setVisible(j === i));
        renderRows();
      })
    );
    const mark = scene.add.graphics();
    mark.lineStyle(6, COLORS.gold, 1);
    mark.strokeRoundedRect(x - 62, -272, 124, 104, 26);
    mark.setVisible(n === 1);
    panel.add(mark);
    marks.push(mark);
  }
  renderRows();

  panel.add(
    chunkyButton(scene, 0, 300, 320, 96, t('start'), { size: 36, icon: 'icon-play' }, () => {
      scene.tweens.add({
        targets: panel,
        scale: 0.7,
        alpha: 0,
        duration: 160,
        ease: 'Sine.easeIn',
        onComplete: () => {
          overlay.destroy();
          onStart(count === 1 ? null : playerRoster(count));
        },
      });
      scene.tweens.add({ targets: dim, fillAlpha: 0, duration: 180 });
    })
  );
  overlay.add(panel);
  panel.setScale(0.6).setAlpha(0);
  scene.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 280, ease: 'Back.easeOut' });
}
