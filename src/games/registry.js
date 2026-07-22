// The game catalog. Adding a mini-game = add its folder under src/games/,
// register its scene in main.js, and add one entry here. The menu builds itself.
export const GAMES = [
  { id: 'memory', scene: 'Memory', icon: 'tok-ring', color: 0x5e9642, status: 'ready', minAge: 4 },
  { id: 'riddles', scene: 'Riddles', icon: 'tok-wizard', color: 0x7a5aa6, status: 'ready', minAge: 6 },
  { id: 'barrels', scene: 'Barrels', icon: 'tok-barrel', color: 0x4a90d9, status: 'ready', minAge: 5 },
  { id: 'sharedbarrel', scene: 'SharedBarrel', icon: 'tok-barrel', color: 0x2fa8c9, status: 'ready', minAge: 6 },
  { id: 'journey', scene: 'Journey', icon: 'tok-mountain', color: 0xc8553d, status: 'ready', minAge: 4 },
  { id: 'dragon', scene: 'Dragon', icon: 'tok-dragon', color: 0xd95b43, status: 'ready', minAge: 5 },
  { id: 'tug', scene: 'Tug', icon: 'tok-troll', color: 0x7e947a, status: 'ready', minAge: 4 },
  { id: 'breakfast', scene: 'Breakfast', icon: 'tok-honey', color: 0xf2b84b, status: 'ready', minAge: 5 },
  { id: 'sneak', scene: 'Sneak', icon: 'tok-moon', color: 0x54628f, status: 'ready', minAge: 5 },
  { id: 'treasure', scene: 'Treasure', icon: 'gem', color: 0x2f8f83, status: 'ready', minAge: 4 },
  { id: 'shire', scene: 'Shire', icon: 'tok-spider', color: 0x5d4a7e, status: 'ready', minAge: 5 },
  { id: 'beacons', scene: 'Beacons', icon: 'tok-mountain', color: 0xc2622a, status: 'ready', minAge: 5 },
  { id: 'secrettree', scene: 'SecretTree', icon: 'tok-tree', color: 0x3f9e6b, status: 'ready', minAge: 7 },
];
