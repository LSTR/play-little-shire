// Player profiles (2, editable in Settings) + the character catalog.
// Persisted on-device; every multiplayer game reads from here.
const KEY = 'lme-profiles';

export const CHAR_KEYS = ['mascot', 'creature', 'gandalf', 'dwarf', 'elf'];

export const CHAR_INFO = {
  mascot: { art: 'mascot', color: 0x5e9642, pieceH: 88 },
  creature: { art: 'creature', color: 0x6fc7d9, pieceH: 78 },
  gandalf: { art: 'gandalf', color: 0x8c8ca6, pieceH: 86 },
  dwarf: { art: 'dwarf', color: 0xc8553d, pieceH: 80 },
  elf: { art: 'elf-fig', color: 0xf2b84b, pieceH: 82 },
};

const DEFAULTS = [
  { name: 'Bilbo', char: 'mascot' },
  { name: 'Gollum', char: 'creature' },
];

export function getProfiles() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(raw) && raw.length === 2 && raw.every((p) => p.name && CHAR_INFO[p.char])) {
      return raw;
    }
  } catch (e) {
    /* corrupted storage — fall back to defaults */
  }
  return DEFAULTS.map((p) => ({ ...p }));
}

export function setProfile(i, patch) {
  const ps = getProfiles();
  ps[i] = { ...ps[i], ...patch };
  localStorage.setItem(KEY, JSON.stringify(ps));
  return ps;
}
