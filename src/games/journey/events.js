// The road from the Shire to the Lonely Mountain: 24 tiles (0 = Shire, 23 = the Gate).
// Events keyed by tile index; `move` is applied after the player lands there by dice.
// Event-triggered moves never chain into another event.
export const PATH_LENGTH = 24;

export const EVENTS = {
  3: { key: 'trolls', icon: 'tok-troll', move: -2 },
  6: { key: 'rivendell', icon: 'tok-elf', move: 2 },
  9: { key: 'storm', icon: 'tok-wind', move: -1 },
  11: { key: 'cave', icon: 'creature', move: 1 },
  13: { key: 'eagles', icon: 'tok-eagle', move: 3 },
  15: { key: 'beorn', icon: 'tok-honey', move: 2 },
  17: { key: 'spiders', icon: 'tok-spider', move: -2 },
  19: { key: 'barrels', icon: 'tok-barrel', move: 2 },
  21: { key: 'laketown', icon: 'tok-fish', move: 1 },
};
