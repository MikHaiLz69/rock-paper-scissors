class GameplayStageScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameplayStageScene' });
        this.TOTAL_STAGES = 10;
        this.ROUNDS_TO_WIN = 2;
        this.MAX_LIFE_POINTS = 3;
        this.ROUND_TIME = 10;
    }

    preload() {
        // Preload assets
        this.load.image('gameplaybackground', './src/ui/platformer_background_1/pink_pastel_bg.png');
        this.load.image('rockButton', './src/ui/Icons/rock.png');
        this.load.image('paperButton', './src/ui/Icons/paper.png');
        this.load.image('scissorsButton', './src/ui/Icons/scissors.png');
        this.load.image('lifeIcon', './src/ui/Icons/Icon_Large_HeartFull.png');
        this.load.image('stageActive', './src/ui/Icons/Icon_Large_Star.png');
        this.load.image('stageInactive', './src/ui/Icons/Icon_Large_StarGrey.png');
    }

    create() {
        // Initialize stage-related properties
        this.currentStage = 1;
        this.currentRound = 1;
        this.roundWins = 0;
        this.consecutiveFullLife = 0;
        this.stageIcons = [];
        this.timeRemaining = this.ROUND_TIME;
        this.isRoundActive = false;
        
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Background setup
        const bg = this.add.image(centerX, centerY, 'gameplaybackground')
            .setOrigin(0.5)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Create stage indicators
        this.createStageIndicators();

        // Stage text - Adjusted position
        this.stageText = this.add.text(centerX - 170, 100, `stage ${this.currentStage}`, {
            font: 'bold 24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Round text - Adjusted position
        this.roundText = this.add.text(centerX + 170, 100, `Round ${this.currentRound}/3`, {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Life Points Display - Adjusted position
        this.lifePoints = 3; // initialize life points
        this.lifeIcons = [];
        this.createLifeIcons();

        // Score Counter - Adjusted position
        this.score = 0;
        this.winStreak = 0;
        this.scoreText = this.add.text(this.cameras.main.width - 100, 50, 'Score: 0', {
            font: '24px Arial',
            fill: '#ffffff',
        }).setOrigin(1, 0.5);

        // Add isGameOver flag
        this.isGameOver = false;

        // Timer - Adjusted position
        this.timerText = this.add.text(centerX, 50, this.ROUND_TIME.toString(), {
            font: 'Bold 48px Arial',
            fill: 'Yellow',
        }).setOrigin(0.5);

        // Opponent and Player Choices - Adjusted position
        this.opponentChoice = this.add.text(centerX, centerY - 230, 'Opponent: ', {
            font: '36px Arial',
            fill: '#ffffff',
        }).setOrigin(0.5);
        this.playerChoice = this.add.text(centerX, centerY + 180, 'You: ', {
            font: '36px Arial',
            fill: '#ffffff',
        }).setOrigin(0.5);

        // Create choice button
        this.createChoiceButton();

        // Startfirst round timer
        this.startRoundTimer();

        // Responsive scaling
        this.scale.on('resize', this.resizeScene, this);
    }

    createChoiceButton() {        
        const buttonY = this.cameras.main.height - 100;
        const buttonSpacing = 120; // Adjusted spacing
        const centerX = this.cameras.main.width / 2;

        // Create button centered at the bottom
        this.rockButton = this.add.image(centerX - buttonSpacing, buttonY, 'rockButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.7)
            .on('pointerdown', () => this.makeChoice('rock'));

        this.paperButton = this.add.image(centerX, buttonY, 'paperButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.7)
            .on('pointerdown', () => this.makeChoice('paper'));

        this.scissorsButton = this.add.image(centerX + buttonSpacing, buttonY, 'scissorsButton')
            .setInteractive()
            .setOrigin(0.5)
            .setScale(0.7)
            .on('pointerdown', () => this.makeChoice('scissors'));

        
    }

    startRoundTimer() {
        if (this.isGameOver) return;

        this.isRoundActive = true;
        this.timeRemaining = this.ROUND_TIME;
        this.timerText.setText(this.timeRemaining.toString());

        // Clear any existing timer
        if (this.roundTimer) {
            this.roundTimer.remove();
        }
        
        // Create timer event
        this.roundTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer(){
        if(!this.isRoundActive || this.isGameOver) return;

        this.timeRemaining--;
        this.timerText.setText(this.timeRemaining.toString());

        if(this.timeRemaining <= 0) {
            // Make random choice when time run out
            const choices = ['rock', 'paper', 'scissors'];
            const randomChoice = Phaser.Utils.Array.GetRandom(choices);
            this.makeChoice(randomChoice);
        }
    }

    createStageIndicators() {
        const startX = 50;
        const startY = 150;
        const spacing = 35;

        // Clear existing stage icons
        this.stageIcons.forEach(icon => icon.destroy());
        this.stageIcons = [];

        for (let i = 0; i < this.TOTAL_STAGES; i++) {
            const icon = this.add.image(
                startX + i * spacing,
                startY,
                i < this.currentStage ? 'stageActive' : 'stageInactive'
            )
            .setOrigin(0.5)
            .setScale(0.1);

            this.stageIcons.push(icon);
        }
    }

    updatestageIndicators() {
        this.stageIcons.forEach((icon, index) => {
            icon.setTexture(index < this.currentStage ? 'stageActive' : 'stageInactive');
        });
        this.stageText.setText(`Stage ${this.currentStage}`);
        this.roundText.setText(`Round ${this.currentRound}/3`);
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
        if (!this.isRoundActive) return;
        this.isRoundActive = false;

        // Stop the timer
        if (this.roundTimer) {
            this.roundTimer.remove();
        }
        

        this.playerChoice.setText(`You: ${choice}`);
    
        // Simulate opponent choice (for now)
        const opponentChoices = ['rock', 'paper', 'scissors'];
        const opponentChoice = Phaser.Utils.Array.GetRandom(opponentChoices);
        this.opponentChoice.setText(`Opponent: ${opponentChoice}`);
    
        // Calculate round result
        const roundResult = this.calculateRoundResult(choice, opponentChoice);
        this.displayChoices(choice, opponentChoice); // Display choices on the screen
        this.updateScore(roundResult, this.timeRemaining); // Update score and life points based on result
        this.updateLifePointsAfterRound(roundResult);
        this.showRoundResult(roundResult); // Show round result

        // Update round tracking
        if (roundResult === 'win') this.roundWins++;

        // Only proceed if game is not over
        if (!this.isGameOver) {
            // Delay before starting next round or completing stage
            this.time.delayedCall(1500, () => {
                if (this.currentRound < 3) {
                    this.currentRound++;
                    this.roundText.setText(`Round ${this.currentRound}/3`);
                    this.clearRoundDisplay();
                    this.startRoundTimer();
                } else {
                    this.handleStageCompletion();
                }
            });
        }

                

        // Check if stage is complete
        if (this.currentRound > 3) {
            this.handleStageCompletion();
        }
    
        // If game over, show result
        if (this.lifePoints <= 0) {
            this.endGame();
        }
    }

    clearRoundDisplay() {
        this.playerChoice.setText('You: ');
        this.opponentChoice.setText('Opponent: ');
        if (this.playerChoiceImage) this.playerChoiceImage.destroy();
        if (this.opponentChoiceImage) this.opponentChoiceImage.destroy();
    }

    handleStageCompletion(){
        if (this.isGameOver) return;

        const stageCleared = this.roundWins >= this.ROUNDS_TO_WIN;

        if (stageCleared) {
            // Award stage completion bonus
            this.awardStageBonus();

            // Handle life recovery every 3 stages
            if (this.currentStage % 3 === 0) {
                this.handleLifeRecovery();
            }

            // Advance to next stage
            this.currentStage++;
            if (this.currentStage > this.TOTAL_STAGES) {
                this.handleGameWin();
                } else {
                    this.startNewStage();
                }
            } else {
                this.handleStageFailed();
            }
        }
    
    awardStageBonus() {
        let bonus = 0;
        if (this.lifePoints === 3) {
            bonus = 10;
            this.consecutiveFullLife++;
        } else if (this.lifePoints === 2) {
            bonus = 5;
            this.consecutiveFullLife = 0;
        } else {
            this.consecutiveFullLife = 0;
        }

        this.score += bonus;
        this.scoreText.setText(`Score: ${this.score}`);

        // Show bonus text
        if (bonus > 0) {
            const bonusText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height * 2,
                `Stage Bonus: +${bonus}`,
                {font: '24px Arial', fill: '#00ff00' }
            ).setOrigin(0.5);

            this.time.delayedCall(1500, () => bonusText.destroy());
        }
    }

    handleLifeRecovery() {
        // Increase life points by 1 every 3 stages
        if (this.lifePoints < this.MAX_LIFE_POINTS) {
            this.updateLifePoints(this.lifePoints + 1);

            // Optinal: Add visual feedback
            const recoveryText = this.add.text(
                this.cameras.main.width / 2,
                this.cache.main.height * 0.4,
                'Life Point Recovered!', {
                    font: '24px Arial',
                    fill: '#00ff00'
                }
            ).setOrigin(0.5);

            this.time.delayedCall(1500, () => recoveryText.destroy());
        }
    }

    startNewStage() {
        this.currentRound = 1;
        this.roundWins = 0;
        this.updatestageIndicators();
        this.clearRoundDisplay();

        // Show stage transition message
        const stageText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.4,
            `Stage ${this.currentStage}`,
            { font: 'bold 48px Arial', fill: '#4169E1' }
        ).setOrigin(0.5);

        this.time.delayedCall(1500, () => {
            stageText.destroy();
            this.startRoundTimer();
        });
    }

    handleStageFailed() {
        this.updateLifePoints(this.lifePoints - 1);
        if (this.lifePoints > 0) {
            // Reset round counters and retry stage
            this.currentRound = 1;
            this.roundWins = 0;

            const retryText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height * 0.2,
                'Stage Failed - Retry',
                { font: '20px Arial', fill: '#ff0000' }
            ).setOrigin(0.5);

            this.time.delayedCall(1500, () => {
                retryText.destroy();
                this.startRoundTimer();
            });
        } else {
            this.endGame();
        }
    }

    handleGameWin() {
        const winText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.4,
            'Congratulation!\nYou completed all staged!',
            {
                font: 'bold 32px Arial',
                fill: '#00ff00',
                align: 'center'
            }
        ).setOrigin(0.5);

        const finalscore = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.5,
            `Final Score: ${this.score}`,
            {
                font: '24px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        const mainMenuButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.6,
            'Return to Main Menu',
            { 
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.scene.start('MainMenuScene'));
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
            font: 'bold 24px Arial',
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

    updateScore(roundResult, timeRemaining) {
        let points = 0;
        switch (roundResult) {
            case 'win':
                this.score = 10 + this.winStreak + timeRemaining; // Add time bonus
                this.winStreak++;
                break;
            case 'tie':
                this.score = 1;
                break;
            case 'lose':
                this.score = -5;
                this.winStreak = 0;
                break;
        }

        // Prevent score from going negative
        this.score = Math.max(0, this.score + points);
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateLifePointsAfterRound(roundResult) {
        if (roundResult === 'lose') {
            this.updateLifePoints(this.lifePoints - 1); // Deduct only one life point per loss
            if(this.lifePoints <= 0) {
                this.isGameOver = true;
                this.endGame();
            }
        }
    }

    endGame() {
        this.isGameOver = true;
        this.isRoundActive = false;

        // Clear any existing timers
        if (this.roundTimer) {
            this.roundTimer.remove();
        }

        // Clear existing UI elements
        this.clearRoundDisplay();

        // Display final score text
        const finalScoreText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height * 0.4,
            `Final Score: ${this.score}`,
            {
                font: '32px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Optionally, display a game over message
        const gameOverText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height * 0.2, 
            'Game Over', 
            {
                font: 'bold 48px Arial',
                fill: '#ff0000',
            }
        ).setOrigin(0.5);

        // Main Menu button - Ensure it's always created
        const mainMenuButton = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height * 0.6, 
            'Return to Main Menu', 
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
                align: 'center'
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('MainMenuScene');   
        })
        .on('pointerover', () => {
            mainMenuButton.setStyle({ fill: '#fff00' });
        })
        .on('pointerout', () => {
            mainMenuButton.setStyle({ fill: '#ffffff' });
        });

        // Disable all game button but keep them visible
        [this.rockButton, this.paperButton, this.scissorsButton].forEach(button => {
            if (button && button.input) {
                button.disableInteractive();
                button.setAlpha(0.5); // Visual feedback that buttons are disabled
            }
        });
    }

    resizeScene() {
        // Resize or reposition elements for responsive design
        const { width, height } = this.scale.gameSize;
        this.cameras.resize(width, height);
    }
}

export { GameplayStageScene };