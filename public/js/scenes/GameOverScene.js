class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'vs_cpu';
    this.winner = data.winner || 1;
    this.winnerName = data.winnerName || 'Unknown';
    this.p1Character = data.p1Character;
    this.p2Character = data.p2Character;
    this.p1Wins = data.p1Wins || 0;
    this.p2Wins = data.p2Wins || 0;
    this.stats = data.stats || {};
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d1a4e, 0x2d1a4e, 1);
    bg.fillRect(0, 0, width, height);

    // Victory particles
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const colors = [0xffcc00, 0xff6644, 0x44cc66, 0x4488ff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = this.add.circle(x, -20, 2 + Math.random() * 4, color, 0.6);

      this.tweens.add({
        targets: particle,
        y: height + 20,
        x: x + (Math.random() - 0.5) * 100,
        duration: 3000 + Math.random() * 4000,
        delay: Math.random() * 2000,
        repeat: -1,
        onRepeat: () => {
          particle.y = -20;
          particle.x = Math.random() * width;
        }
      });
    }

    // Winner announcement
    const label = this.winner === 1
      ? (this.gameMode === 'vs_cpu' ? 'YOU WIN!' : 'PLAYER 1 WINS!')
      : (this.gameMode === 'vs_cpu' ? 'CPU WINS!' : 'PLAYER 2 WINS!');

    const winText = this.add.text(width / 2, 60, label, {
      fontSize: '42px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 10, fill: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: winText,
      scaleX: 1.05, scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Winner character name
    this.add.text(width / 2, 105, this.winnerName.toUpperCase(), {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, 140, `${this.p1Wins} - ${this.p2Wins}`, {
      fontSize: '28px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // Stats panel
    this.drawStatsPanel(width / 2, 230);

    // Status text for online rematch waiting
    this.rematchStatus = this.add.text(width / 2, 340, '', {
      fontSize: '13px', fontFamily: 'Arial', color: '#ffcc00'
    }).setOrigin(0.5);

    this.rematchRequested = false;

    // Buttons
    this.createButton(width / 2, 365, 'REMATCH', () => {
      if (this.gameMode === 'online') {
        if (this.rematchRequested) return;
        this.rematchRequested = true;
        networkManager.requestRematch();
        this.rematchStatus.setText('Waiting for opponent...');
      } else {
        this.scene.start('FightScene', {
          mode: this.gameMode,
          p1Character: this.p1Character,
          p2Character: this.p2Character
        });
      }
    });

    this.createButton(width / 2, 405, 'CHARACTER SELECT', () => {
      if (this.gameMode === 'online') {
        // Go back to char select but stay in the room
        this.cleanupOnlineHandlers();
        this.scene.start('CharSelectScene', { mode: 'online' });
      } else {
        this.scene.start('CharSelectScene', { mode: this.gameMode });
      }
    });

    this.createButton(width / 2, 440, 'MAIN MENU', () => {
      this.cleanupOnlineHandlers();
      if (this.gameMode === 'online') networkManager.disconnect();
      this.scene.start('MenuScene');
    });

    // Online event handlers
    if (this.gameMode === 'online') {
      networkManager.on('rematch_requested', () => {
        if (this.rematchRequested) {
          // Both want rematch - accept and start
          networkManager.acceptRematch();
        } else {
          this.rematchStatus.setText('Opponent wants a rematch!');
          // Auto-show that opponent requested, player can click Rematch to accept
          this.rematchRequested = true;
          networkManager.acceptRematch();
        }
      });

      networkManager.on('rematch_accepted', () => {
        this.cleanupOnlineHandlers();
        this.scene.start('CharSelectScene', { mode: 'online' });
      });

      networkManager.on('opponent_disconnected', () => {
        this.rematchStatus.setText('Opponent disconnected.');
        this.time.delayedCall(2000, () => {
          this.cleanupOnlineHandlers();
          networkManager.disconnect();
          this.scene.start('MenuScene');
        });
      });
    }
  }

  drawStatsPanel(x, y) {
    const panelWidth = 500;
    const panelHeight = 100;

    const panel = this.add.graphics();
    panel.fillStyle(0x222244, 0.7);
    panel.fillRoundedRect(x - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 8);
    panel.lineStyle(1, 0x5577aa);
    panel.strokeRoundedRect(x - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 8);

    const stats = this.stats;
    const leftX = x - 100;
    const rightX = x + 100;

    // Headers
    this.add.text(leftX, y - 40, this.p1Character, {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#ff6666',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(x, y - 40, 'STATS', {
      fontSize: '12px', fontFamily: 'Arial', color: '#888888'
    }).setOrigin(0.5);

    this.add.text(rightX, y - 40, this.p2Character, {
      fontSize: '13px', fontFamily: 'Arial Black', color: '#6666ff',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    // Stat rows
    const rows = [
      { label: 'Damage Dealt', p1: stats.p1DamageDealt || 0, p2: stats.p2DamageDealt || 0 },
      { label: 'Specials Used', p1: stats.p1SpecialsUsed || 0, p2: stats.p2SpecialsUsed || 0 },
      { label: 'Rounds', p1: '', p2: '', center: `${stats.rounds || 0} rounds` }
    ];

    rows.forEach((row, i) => {
      const ry = y - 16 + i * 24;
      this.add.text(leftX, ry, row.p1.toString(), {
        fontSize: '14px', fontFamily: 'Arial', color: '#ffffff'
      }).setOrigin(0.5);

      this.add.text(x, ry, row.center || row.label, {
        fontSize: '11px', fontFamily: 'Arial', color: '#aaaacc'
      }).setOrigin(0.5);

      this.add.text(rightX, ry, row.p2.toString(), {
        fontSize: '14px', fontFamily: 'Arial', color: '#ffffff'
      }).setOrigin(0.5);
    });
  }

  cleanupOnlineHandlers() {
    networkManager.off('rematch_requested');
    networkManager.off('rematch_accepted');
    networkManager.off('opponent_disconnected');
  }

  createButton(x, y, text, callback) {
    const btnWidth = 200;
    const btnHeight = 34;

    const bg = this.add.graphics();
    bg.fillStyle(0x334466, 0.8);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(2, 0x5577aa);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

    const label = this.add.text(x, y, text, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const zone = this.add.zone(x, y, btnWidth, btnHeight).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x446688, 0.9);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0x77aadd);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      label.setColor('#ffcc00');
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x334466, 0.8);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(2, 0x5577aa);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
      label.setColor('#ffffff');
    });

    zone.on('pointerdown', callback);
  }
}
