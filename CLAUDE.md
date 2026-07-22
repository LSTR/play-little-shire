# Hanna in Middle Earth — project notes

Kids' mini-game hub (ages ~4-10), Tolkien-inspired but original art. Web + Android from one
codebase: Phaser 3 + Vite + Capacitor. See README.md for workflows.

Hard rules:
- No emoji anywhere in the UI — all art is hand-drawn SVG in `src/assets/art.js`.
- All user-facing text goes through `t()` in `src/strings.js`, in Spanish AND English (default ES).
- Kid UX: big touch targets, no harsh fail states, no reading required to play, portrait 720x1280.
- If this ever ships publicly (Play Store), keep names "inspired-by" — no literal Tolkien
  character names or trademarks in store-facing content.

Verification: dev server + `node scripts/shot.js <url> <out.png> [waitMs] [x,y ...]`
(uses system Chrome headless; viewport 450x800 = game coords * 0.625).
Deep-link scenes with `?scene=<SceneKey>`; Journey: `&players=N` skips the "who's playing" setup
(add `&mode=coop|race` to also skip the race-vs-team choice), `&ev=<key>` previews an event card,
`&smokeMax=N` shrinks the co-op smoke gauge for quick fail testing; Win: `&winner=<charKey>`
previews the solo-winner layout, `&team=char1,char2` previews the co-op team-victory layout.
Player profiles (2, default Bilbo/Gollum) live in `src/profiles.js` + localStorage, edited in
Settings; multiplayer games read them via `getProfiles()` / `CHAR_INFO`.

See `Pendientes.md` for the backlog of proposed-but-not-yet-built games and other pending
work — check it at the start of a session before assuming the roadmap is empty.
