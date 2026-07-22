// Design tokens — "storybook Shire at golden hour"
export const GAME_W = 720;
export const GAME_H = 1280;

export const FONT = '"Fredoka", "Trebuchet MS", sans-serif';

export const COLORS = {
  skyTop: 0xbfe3f0,
  skyBottom: 0xeaf4d9,
  meadow: 0x8fc15c,
  hill: 0x6ea84b,
  pine: 0x3e7b3e,
  green: 0x5e9642,
  greenDark: 0x3e7b3e,
  greenDeep: 0x2f5d2f,
  ink: 0x2e4a2a,
  inkSoft: 0x6b5b45,
  parchment: 0xf7ecd4,
  parchmentEdge: 0xd9c6a0,
  wood: 0x8a5a33,
  woodDark: 0x5a3a1e,
  gold: 0xf2b84b,
  goldDark: 0xc9912d,
  berry: 0xc8553d,
  berryDark: 0x9c3f2e,
  stone: 0x6e7b8c,
};

export const HEX = {
  ink: '#2E4A2A',
  inkSoft: '#6B5B45',
  parchment: '#F7ECD4',
  gold: '#F2B84B',
  white: '#FFFFFF',
};

export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
