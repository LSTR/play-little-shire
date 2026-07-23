import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import WinScene from './scenes/WinScene.js';
import MemoryScene from './games/memory/MemoryScene.js';
import RiddlesScene from './games/riddles/RiddlesScene.js';
import JourneyScene from './games/journey/JourneyScene.js';
import DragonScene from './games/dragon/DragonScene.js';
import TugScene from './games/tug/TugScene.js';
import BarrelsScene from './games/barrels/BarrelsScene.js';
import SharedBarrelScene from './games/sharedbarrel/SharedBarrelScene.js';
import BreakfastScene from './games/breakfast/BreakfastScene.js';
import SneakScene from './games/sneak/SneakScene.js';
import TreasureScene from './games/treasure/TreasureScene.js';
import ShireScene from './games/shire/ShireScene.js';
import BeaconsScene from './games/beacons/BeaconsScene.js';
import SecretTreeScene from './games/secrettree/SecretTreeScene.js';
import ClearingScene from './games/clearing/ClearingScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#BFE3F0',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: { createContainer: true },
  input: { activePointers: 4 }, // simultaneous touches for split-screen duels
  scene: [
    BootScene,
    MenuScene,
    MemoryScene,
    RiddlesScene,
    JourneyScene,
    DragonScene,
    TugScene,
    BarrelsScene,
    SharedBarrelScene,
    BreakfastScene,
    SneakScene,
    TreasureScene,
    ShireScene,
    BeaconsScene,
    SecretTreeScene,
    ClearingScene,
    WinScene,
  ],
});
