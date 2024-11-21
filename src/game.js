import { GameplayStageScene } from './GameplayStageScene.js';
import { GameStartScene } from './GameStartScene.js';
import { MainMenuScene } from './MainMenuScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 540,
        height: 960,
    },
    scene: [MainMenuScene, GameStartScene, GameplayStageScene], // Add both scene here
};

const game = new Phaser.Game(config);