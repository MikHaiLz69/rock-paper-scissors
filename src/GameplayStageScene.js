class GameplayStageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameplayStageScene' });
    }

    preload() {
        // Preload assets
        this.load.image('gameplaybackground', './src/ui/platformer_background_1/pink_pastel_bg.png');
        this.load.image('rockButton', './src/ui/Icons/rock.png');
        this.load.image('paperButton', './src/ui/Icons/paper.png');
        this.load.image('scissorsButton', './src/ui/Icons/scissors.png');
        this.load.image('lifeIcon', './src/ui/Icons/Icon_Large_HeartFull.png');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Background setup
        const bg = this.add.image(centerX, centerY, 'gameplaybackground')
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Life Points Display
        this.lifePoints = 3; // initialize life points
        this.lifeIcons = [];
        this.createLifeIcons();

        // Score Counter
        this.score = 0;
        this.winStreak = 0;
        this.scoreText = this.add.text(this.cameras.main.width - 50, 50, 'Score: 0', {
            font: '24px Arial',
            fill: '#ffffff',
        }).setOrigin(1, 0.5);

        // Timer
        this.timerText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.1, '10', {
            font: '48px Arial',
            fill: '#ffffff',
        }).setOrigin(0.5);

        // Opponent and Player Choices
        this.opponentChoice = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.25, 'Opponent: ', {
            font: '36px Arial',
            fill: '#ffffff',
        }).setOrigin(0.5);
        this.playerChoice = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.7, 'You: ', {
            font: '36px Arial',
            fill: '#ffffff',
        }).setOrigin(0.5);

        // Decision Buttons (Rock, Paper, Scissors)
        const buttonSpacing = this.cameras.main.width / 4;
        const buttonY = this.cameras.main.height - 100;
        this.add.image(buttonSpacing, buttonY, 'rockButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.7)
            .on('pointerdown', () => this.makeChoice('rock'));
        this.add.image(buttonSpacing * 2, buttonY, 'paperButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.7)
            .on('pointerdown', () => this.makeChoice('paper'));
        this.add.image(buttonSpacing * 3, buttonY, 'scissorsButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.7)
            .on('pointerdown', () => this.makeChoice('scissors'));

        // Responsive scaling
        this.scale.on('resize', this.resizeScene, this);
    }

    // Create life icons
    createLifeIcons() {
        const iconSize = 30;
        const startX = 50;
        const startY = 50;

        // Clear existing icons
        if(this.lifeIcons.length) {
            this.lifeIcons.forEach(icon => icon.destroy());
            this.lifeIcons = [];
        }

        // Add icons based on life points
        for (let i = 0; i < this.lifePoints; i++) {
            const icon = this.add.image(startX + i * (iconSize + 30), startY, 'lifeIcon')
                .setOrigin(0.5)
                .setScale(0.2)
            this.lifeIcons.push(icon);
        }
    }

    // Update life icons when life points change
    updateLifePoints(newLifePoints) {
        this.lifePoints = Math.max(0, newLifePoints); // Ensure life points don't go below 0 
        this.createLifeIcons();
    }

    makeChoice(choice) {
        this.playerChoice.setText(`You: ${choice}`);
    
        // Simulate opponent choice (for now)
        const opponentChoices = ['rock', 'paper', 'scissors'];
        const opponentChoice = Phaser.Utils.Array.GetRandom(opponentChoices);
        this.opponentChoice.setText(`Opponent: ${opponentChoice}`);
    
        // Display choices on the screen
        this.displayChoices(choice, opponentChoice);
    
        // Calculate round result
        const roundResult = this.calculateRoundResult(choice, opponentChoice);
    
        // Update score and life points based on result
        this.updateScore(roundResult);
        this.updateLifePointsAfterRound(roundResult);
    
        // Show round result
        this.showRoundResult(roundResult);
    
        // If game over, show result
        if (this.lifePoints <= 0) {
            this.endGame();
        }
    }
    
    displayChoices(playerChoice, opponentChoice) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
    
        // Clear previous choice images
        if (this.playerChoiceImage) this.playerChoiceImage.destroy();
        if (this.opponentChoiceImage) this.opponentChoiceImage.destroy();
    
        // Show opponent's choice
        this.opponentChoiceImage = this.add.image(centerX, centerY - 120, opponentChoice + 'Button')
            .setOrigin(0.5)
            .setScale(0.5);
    
        // Show player's choice
        this.playerChoiceImage = this.add.image(centerX, centerY + 70, playerChoice + 'Button')
            .setOrigin(0.5)
            .setScale(0.5);
    }
    
    showRoundResult(result) {
        const resultText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.47, '', {
            font: '24px Arial',
            fill: '#ffffff',
        }).setOrigin(0.5);
    
        if (result === 'win') {
            resultText.setText('You Win!');
        } else if (result === 'lose') {
            resultText.setText('You Lose!');
        } else {
            resultText.setText('It\'s a Tie!');
        }
    
        // Display result text for a short time, then clear it
        this.time.delayedCall(1000, () => resultText.destroy());
    }    

    calculateRoundResult(playerChoice, opponentChoice) {
        if (playerChoice === opponentChoice) return 'tie';
        if (
            (playerChoice === 'rock' && opponentChoice === 'scissors') ||
            (playerChoice === 'paper' && opponentChoice === 'rock') ||
            (playerChoice === 'scissors' && opponentChoice === 'paper')
        ) return 'win';
        return 'lose';
    }

    updateScore(roundResult) {
        switch (roundResult) {
            case 'win':
                this.score += 10 + this.winStreak;
                this.winStreak++;
                break;
            case 'tie':
                this.score += 1;
                break;
            case 'lose':
                this.score -= 5;
                break;
        }
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateLifePointsAfterRound(roundResult) {
        if (roundResult === 'lose') {
            this.updateLifePoints(this.lifePoints - 1); // Deduct only one life point per loss
        }
    }

    endGame() {
        // Display main menu button when the player loses
        const mainMenuButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.8, 'Main Menu', {
            font: '24px Arial',
            fill: 'black',
        }).setOrigin(0.5).setInteractive();
    
        mainMenuButton.on('pointerdown', () => {
            // Transition to Main Menu scene
            this.scene.start('MainMenuScene'); // Replace with your actual main menu scene key
        });
    
        // Optionally, display a game over message
        const gameOverText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height * 0.47, 'Game Over', {
            font: '32px Arial',
            fill: '#ff0000',
        }).setOrigin(0.5);
    }

    resizeScene() {
        // Resize or reposition elements for responsive design
        const { width, height } = this.scale.gameSize;
        this.cameras.resize(width, height);
    }
}

export { GameplayStageScene };