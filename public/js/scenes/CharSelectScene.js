class CharSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharSelectScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'vs_cpu'; // vs_cpu, local_2p, online
    this.p1Selection = -1;
    this.p2Selection = -1;
    this.p1Ready = false;
    this.p2Ready = false;
    this.opponentSelected = null;
    this.countdownStarted = false;
    this.fightLaunched = false;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d1a4e, 0x2d1a4e, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 30, 'SELECT YOUR FIGHTER', {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Character data
    this.characters = [
      {
        name: 'Pikachu', color: 0xffdd00, type: 'Electric',
        stats: { speed: 5, power: 2, defense: 1 },
        desc: 'Glass cannon with lightning speed'
      },
      {
        name: 'Charmander', color: 0xff6622, type: 'Fire',
        stats: { speed: 3, power: 4, defense: 3 },
        desc: 'Balanced with high burst damage'
      },
      {
        name: 'Bulbasaur', color: 0x44aa88, type: 'Grass',
        stats: { speed: 2, power: 4, defense: 5 },
        desc: 'Tank with area control'
      },
      {
        name: 'Squirtle', color: 0x4488dd, type: 'Water',
        stats: { speed: 3, power: 3, defense: 4 },
        desc: 'Defensive and balanced'
      },
      {
        name: 'Togepi', color: 0xffccdd, type: 'Fairy',
        stats: { speed: 4, power: 3, defense: 3 },
        desc: 'Tricky with random Metronome'
      }
    ];

    // Character cards - center them based on count
    this.cards = [];
    const cardCount = this.characters.length;
    const cardSpacing = 140;
    const totalWidth = (cardCount - 1) * cardSpacing;
    const startX = (width - totalWidth) / 2;
    this.characters.forEach((char, i) => {
      this.createCharCard(startX + i * cardSpacing, 180, char, i);
    });

    // Player selection indicators
    this.p1Indicator = this.add.text(0, 0, 'P1', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#ff4444',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setVisible(false).setDepth(20);

    this.p2Indicator = this.add.text(0, 0, 'P2', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#4444ff',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setVisible(false).setDepth(20);

    // Stats preview area
    this.statsText = this.add.text(width / 2, 310, '', {
      fontSize: '14px', fontFamily: 'Arial', color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);

    // Ready indicators
    this.p1ReadyText = this.add.text(200, 370, '', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#44cc44',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    this.p2ReadyText = this.add.text(600, 370, '', {
      fontSize: '18px', fontFamily: 'Arial Black', color: '#44cc44',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);

    // Instructions
    const instructions = this.gameMode === 'local_2p'
      ? 'P1: A/D + Enter  |  P2: Arrows + Shift'
      : 'A/D to select, Enter to confirm';

    this.add.text(width / 2, 420, instructions, {
      fontSize: '12px', fontFamily: 'Arial', color: '#666688'
    }).setOrigin(0.5);

    // Back button
    this.createButton(70, 420, 'BACK', () => {
      if (this.gameMode === 'online') {
        this.cleanupOnlineHandlers();
        networkManager.disconnect();
      }
      this.scene.start('MenuScene');
    });

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      a: 'A', d: 'D', enter: 'ENTER',
      left: 'LEFT', right: 'RIGHT', shift: 'SHIFT'
    });

    // In online mode, each player uses a local "myCursor" — they only see their own selection
    this.myCursor = 0;
    this.p1Cursor = 0;
    this.p2Cursor = this.gameMode === 'local_2p' ? 1 : -1;
    this.inputCooldown = 0;
    this.p2InputCooldown = 0;

    // Online mode handlers
    if (this.gameMode === 'online') {
      networkManager.on('opponent_selected', (data) => {
        this.opponentSelected = data.character;
        const idx = this.characters.findIndex(c => c.name === data.character);
        if (networkManager.playerNumber === 1) {
          this.p2Selection = idx;
          this.p2Ready = true;
          this.p2ReadyText.setText('P2 READY!');
          this.updateP2Indicator(idx);
        } else {
          this.p1Selection = idx;
          this.p1Ready = true;
          this.p1ReadyText.setText('P1 READY!');
          this.updateP1Indicator(idx);
        }
      });

      networkManager.on('both_ready', () => {
        if (!this.countdownStarted) {
          this.countdownStarted = true;
          this.startCountdown();
        }
      });
    }

    this.updateSelection();
  }

  createCharCard(x, y, char, index) {
    const cardWidth = 120;
    const cardHeight = 160;

    const card = this.add.graphics();
    card.fillStyle(0x222244, 0.8);
    card.fillRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 8);
    card.lineStyle(2, char.color, 0.5);
    card.strokeRoundedRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 8);

    const avatar = this.add.circle(x, y - 35, 25, char.color, 0.8);
    avatar.setStrokeStyle(2, 0xffffff, 0.3);

    this.add.text(x, y + 10, char.name, {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(x, y + 28, char.type, {
      fontSize: '11px', fontFamily: 'Arial', color: '#aaaacc'
    }).setOrigin(0.5);

    this.drawStatBar(x - 40, y + 42, 'SPD', char.stats.speed, char.color);
    this.drawStatBar(x - 40, y + 54, 'PWR', char.stats.power, char.color);
    this.drawStatBar(x - 40, y + 66, 'DEF', char.stats.defense, char.color);

    const zone = this.add.zone(x, y, cardWidth, cardHeight).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      if (this.gameMode === 'online') {
        if (this.myReady()) return;
        this.myCursor = index;
        this.confirmMySelection(index);
      } else {
        if (!this.p1Ready) {
          this.p1Cursor = index;
          this.confirmP1(index);
        }
      }
    });
    zone.on('pointerover', () => {
      this.statsText.setText(`${char.name} - ${char.desc}`);
    });

    this.cards.push({ card, avatar, x, y, zone });
  }

  drawStatBar(x, y, label, value, color) {
    this.add.text(x, y, label, {
      fontSize: '8px', fontFamily: 'Arial', color: '#888888'
    });
    this.add.rectangle(x + 28, y + 4, 50, 6, 0x333333).setOrigin(0, 0.5);
    this.add.rectangle(x + 28, y + 4, value * 10, 6, color).setOrigin(0, 0.5).setAlpha(0.7);
  }

  update(time, delta) {
    this.inputCooldown = Math.max(0, this.inputCooldown - delta);
    this.p2InputCooldown = Math.max(0, this.p2InputCooldown - delta);

    if (this.gameMode === 'online') {
      // Online: each player controls myCursor with A/D or arrows, confirm with Enter
      if (!this.myReady() && this.inputCooldown <= 0) {
        if (this.keys.a.isDown || this.cursors.left.isDown) {
          this.myCursor = (this.myCursor - 1 + this.characters.length) % this.characters.length;
          this.inputCooldown = 200;
          this.updateSelection();
        } else if (this.keys.d.isDown || this.cursors.right.isDown) {
          this.myCursor = (this.myCursor + 1) % this.characters.length;
          this.inputCooldown = 200;
          this.updateSelection();
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
          this.confirmMySelection(this.myCursor);
          this.inputCooldown = 300;
        }
      }
    } else {
      // P1 controls
      if (!this.p1Ready && this.inputCooldown <= 0) {
        if (this.keys.a.isDown) {
          this.p1Cursor = (this.p1Cursor - 1 + this.characters.length) % this.characters.length;
          this.inputCooldown = 200;
          this.updateSelection();
        } else if (this.keys.d.isDown) {
          this.p1Cursor = (this.p1Cursor + 1) % this.characters.length;
          this.inputCooldown = 200;
          this.updateSelection();
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
          this.confirmP1(this.p1Cursor);
          this.inputCooldown = 300;
        }
      }

      // P2 controls (local_2p only)
      if (this.gameMode === 'local_2p' && !this.p2Ready && this.p2InputCooldown <= 0) {
        if (this.cursors.left.isDown) {
          this.p2Cursor = (this.p2Cursor - 1 + this.characters.length) % this.characters.length;
          this.p2InputCooldown = 200;
          this.updateSelection();
        } else if (this.cursors.right.isDown) {
          this.p2Cursor = (this.p2Cursor + 1) % this.characters.length;
          this.p2InputCooldown = 200;
          this.updateSelection();
        } else if (Phaser.Input.Keyboard.JustDown(this.keys.shift)) {
          this.confirmP2(this.p2Cursor);
          this.p2InputCooldown = 300;
        }
      }
    }
  }

  // Has the local player already confirmed?
  myReady() {
    if (networkManager.playerNumber === 1) return this.p1Ready;
    return this.p2Ready;
  }

  confirmMySelection(index) {
    if (this.myReady()) return; // Already confirmed

    const charName = this.characters[index].name;
    networkManager.selectCharacter(charName);
    networkManager.ready();

    if (networkManager.playerNumber === 1) {
      this.p1Selection = index;
      this.p1Ready = true;
      this.p1ReadyText.setText('P1 READY!');
      this.updateP1Indicator(index);
    } else {
      this.p2Selection = index;
      this.p2Ready = true;
      this.p2ReadyText.setText('P2 READY!');
      this.updateP2Indicator(index);
    }
    this.updateSelection();
  }

  confirmP1(index) {
    this.p1Selection = index;
    this.p1Ready = true;
    this.p1ReadyText.setText('P1 READY!');
    this.updateP1Indicator(index);
    this.updateSelection();

    if (this.gameMode === 'vs_cpu') {
      let aiChoice;
      do { aiChoice = Math.floor(Math.random() * this.characters.length); } while (aiChoice === index);
      this.p2Selection = aiChoice;
      this.p2Ready = true;
      this.p2ReadyText.setText('CPU READY!');
      this.updateP2Indicator(aiChoice);
      this.time.delayedCall(500, () => this.startCountdown());
    } else if (this.gameMode === 'local_2p') {
      if (this.p1Ready && this.p2Ready) {
        this.time.delayedCall(300, () => this.startCountdown());
      }
    }
  }

  confirmP2(index) {
    this.p2Selection = index;
    this.p2Ready = true;
    this.p2ReadyText.setText('P2 READY!');
    this.updateP2Indicator(index);
    this.updateSelection();
    if (this.p1Ready && this.p2Ready) {
      this.time.delayedCall(300, () => this.startCountdown());
    }
  }

  updateP1Indicator(index) {
    const card = this.cards[index];
    this.p1Indicator.setPosition(card.x - 20, card.y - 85);
    this.p1Indicator.setVisible(true);
  }

  updateP2Indicator(index) {
    const card = this.cards[index];
    this.p2Indicator.setPosition(card.x + 20, card.y - 85);
    this.p2Indicator.setVisible(true);
  }

  updateSelection() {
    this.cards.forEach((card, i) => {
      card.card.clear();

      let isHover = false;
      if (this.gameMode === 'online') {
        // In online, highlight the local player's cursor
        isHover = (i === this.myCursor && !this.myReady());
      } else {
        isHover = (i === this.p1Cursor && !this.p1Ready) ||
                  (this.gameMode === 'local_2p' && i === this.p2Cursor && !this.p2Ready);
      }
      const isSelected = (i === this.p1Selection && this.p1Ready) ||
                          (i === this.p2Selection && this.p2Ready);

      let borderColor = this.characters[i].color;
      let borderAlpha = 0.3;
      let fillAlpha = 0.6;

      if (isHover) { borderAlpha = 1; fillAlpha = 0.9; }
      if (isSelected) { borderAlpha = 1; fillAlpha = 0.95; }

      card.card.fillStyle(0x222244, fillAlpha);
      card.card.fillRoundedRect(card.x - 60, card.y - 80, 120, 160, 8);
      card.card.lineStyle(isHover || isSelected ? 3 : 2, borderColor, borderAlpha);
      card.card.strokeRoundedRect(card.x - 60, card.y - 80, 120, 160, 8);
    });

    // Update stats text for hover
    const cursorIdx = this.gameMode === 'online' ? this.myCursor : this.p1Cursor;
    if (cursorIdx >= 0 && cursorIdx < this.characters.length) {
      const char = this.characters[cursorIdx];
      this.statsText.setText(`${char.name} - ${char.desc}`);
    }
  }

  startCountdown() {
    if (this.fightLaunched) return;

    const countdown = this.add.text(400, 200, '3', {
      fontSize: '64px', fontFamily: 'Arial Black', color: '#ffcc00',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(100);

    let count = 3;
    this.time.addEvent({
      delay: 800,
      callback: () => {
        count--;
        if (count > 0) {
          countdown.setText(count.toString());
          this.tweens.add({
            targets: countdown,
            scaleX: 1.3, scaleY: 1.3,
            duration: 100,
            yoyo: true
          });
        } else {
          countdown.setText('FIGHT!');
          this.tweens.add({
            targets: countdown,
            scaleX: 1.5, scaleY: 1.5, alpha: 0,
            duration: 400,
            onComplete: () => {
              countdown.destroy();
              this.launchFight();
            }
          });
        }
      },
      repeat: 2
    });
  }

  cleanupOnlineHandlers() {
    networkManager.off('opponent_selected');
    networkManager.off('both_ready');
  }

  launchFight() {
    if (this.fightLaunched) return;
    this.fightLaunched = true;
    if (this.gameMode === 'online') this.cleanupOnlineHandlers();

    // Determine characters: P1's selection is always p1, P2's is always p2
    let p1Char, p2Char;
    if (this.gameMode === 'online') {
      if (networkManager.playerNumber === 1) {
        p1Char = this.characters[this.p1Selection].name;
        p2Char = this.opponentSelected || this.characters[this.p2Selection].name;
      } else {
        // I am P2: my selection is p2, opponent's is p1
        p1Char = this.opponentSelected || this.characters[this.p1Selection].name;
        p2Char = this.characters[this.p2Selection].name;
      }
    } else {
      p1Char = this.characters[this.p1Selection].name;
      p2Char = this.characters[this.p2Selection].name;
    }

    this.scene.start('FightScene', {
      mode: this.gameMode,
      p1Character: p1Char,
      p2Character: p2Char
    });
  }

  createButton(x, y, text, callback) {
    const btnWidth = 100;
    const btnHeight = 30;

    const bg = this.add.graphics();
    bg.fillStyle(0x334466, 0.8);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 6);
    bg.lineStyle(1, 0x5577aa);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 6);

    const label = this.add.text(x, y, text, {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffffff'
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, btnWidth, btnHeight).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => label.setColor('#ffcc00'));
    zone.on('pointerout', () => label.setColor('#ffffff'));
    zone.on('pointerdown', callback);
  }
}
