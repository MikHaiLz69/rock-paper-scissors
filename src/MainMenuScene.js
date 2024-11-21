class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // Preload assets like background images or buttons
        this.load.image('title', './src/ui/title.png');
        this.load.image('background', './src/ui/platformer_background_1/background_1_darken.png'); // Add your actual image path
        this.load.image('playButton', './src/ui/ButtonsText/ButtonText_Small_ROund.png'); // Add your actual playButton image path
        this.load.image('rankingButton', './src/ui/ButtonsText/ButtonText_Small_ROund.png'); // Add your actual rankingButton image path
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        // Add background to the scene
        const background = this.add.image(centerX, centerY, 'background')
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        const scaleX = this.cameras.main.width / background.width;
        const scaleY = this.cameras.main.height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale).setScrollFactor(0);
        
        // Add title
        const title = this.add.image(centerX, this.cameras.main.height * 0.2, 'title')
            .setOrigin(0.5)
            .setScale(0.5);

        // Add playButton
        const playButton = this.add.image(centerX, this.cameras.main.height * 0.5, 'playButton')
            .setInteractive()
            .setScale(0.3)
            .setOrigin(0.5);
        
        // Add "Main Menu" text above the Play button
        this.add.text(this.cameras.main.width / 2, playButton.y - 70, 'Main Menu', { 
                font: 'bold 30px Arial',
                fill: '#ffffff' })
            .setOrigin(0.5);
        
        // Add "Play" text on playButton
        this.add.text(playButton.x, playButton.y, 'Play', { font: '20px Arial', fill: '#ffffff' })
            .setOrigin(0.5);
    
        // Add rankingButton
        const rankingButton = this.add.image(centerX, this.cameras.main.height * 0.6, 'rankingButton')
            .setInteractive()
            .setScale(0.3)
            .setOrigin(0.5);
        
        // Add "Ranking" text on rankingButton
        this.add.text(rankingButton.x, rankingButton.y, 'Ranking', { font: '20px Arial', fill: '#ffffff' })
            .setOrigin(0.5);
    
        // Button interactions
        playButton.on('pointerdown', () => {
            this.scene.start('GameStartScene'); // Replace with the actual game scene name
        });
    
        rankingButton.on('pointerdown', () => {
            this.scene.start('RankingScene'); // Replace with the actual ranking scene name
        });
    }    

}

export { MainMenuScene };