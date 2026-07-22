# Hanna in Middle Earth

A hub of fantasy mini-games for kids. One JavaScript codebase (Phaser 3 + Vite), shipped as
a web game and as an Android app (Capacitor). All art is hand-drawn vector (SVG) defined in
code — no emoji, no external assets, fully offline.

## Develop

```bash
npm install
npm run dev        # hot-reload dev server (open on a phone-sized viewport, portrait)
```

Deep-link into any scene while developing: `http://localhost:5173/?scene=Memory`

Screenshot / interaction check without opening a browser:

```bash
node scripts/shot.js "http://localhost:5173" out.png 3000          # screenshot
node scripts/shot.js "http://localhost:5173/?scene=Memory" out.png 2500 88,206   # click, then screenshot
```

## Ship

```bash
npm run build      # static web build in dist/ — host anywhere
npm run android    # build + sync + open in Android Studio (run on device/emulator from there)
```

## Add a new mini-game

1. Create `src/games/<name>/<Name>Scene.js` (copy `memory/MemoryScene.js` as a template —
   keep the same top bar: home, progress, sound).
2. Register the scene in `src/main.js`.
3. Add one entry to `src/games/registry.js` (`status: 'soon'` shows it locked in the menu;
   flip to `'ready'` when playable).
4. Add its strings (ES + EN) in `src/strings.js`.
5. On win, `this.scene.launch('Win', { replay: '<SceneKey>' })` — celebration is shared.

## Design system

- Tokens in `src/config.js` (palette: Shire greens, parchment, gold; font: Fredoka, bundled).
- All SVG art lives in `src/assets/art.js`, rasterized at 2x at boot. New art = new `def(...)`.
- UI helpers in `src/ui.js`: `chunkyButton`, `iconButton`, `parchmentPanel`, `pressable`.
- Signature motif: the round hobbit door (card backs, circular badges).
- Sounds are synthesized in `src/sfx.js` — no audio files.
