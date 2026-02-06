class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d1a4e, 0x2d1a4e, 1);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 40, 'ONLINE BATTLE', {
      fontSize: '32px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // State
    this.lobbyState = 'menu'; // menu, creating, waiting, joining
    this.roomCodeInput = '';

    // Connect to server
    networkManager.connect();

    // Create Room button
    this.createButton(width / 2, 140, 'CREATE ROOM', () => {
      this.lobbyState = 'creating';
      networkManager.createRoom();
      this.updateUI();
    });

    // Join Room button
    this.createButton(width / 2, 200, 'JOIN ROOM', () => {
      this.lobbyState = 'joining';
      this.roomCodeInput = '';
      this.updateUI();
    });

    // Back button
    this.createButton(width / 2, 400, 'BACK', () => {
      networkManager.disconnect();
      this.scene.start('MenuScene');
    });

    // Status area
    this.statusText = this.add.text(width / 2, 280, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.roomCodeDisplay = this.add.text(width / 2, 320, '', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
      letterSpacing: 8
    }).setOrigin(0.5);

    this.inputHint = this.add.text(width / 2, 360, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#888888'
    }).setOrigin(0.5);

    // Waiting dots animation
    this.dotCount = 0;
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.dotCount = (this.dotCount + 1) % 4;
        this.updateUI();
      },
      loop: true
    });

    // Network event handlers
    networkManager.on('room_created', (data) => {
      this.lobbyState = 'waiting';
      this.roomCode = data.code;
      networkManager.roomCode = data.code;
      networkManager.playerNumber = 1;
      this.updateUI();
    });

    networkManager.on('room_joined', (data) => {
      networkManager.playerNumber = data.playerNumber;
      this.cleanupHandlers();
      this.scene.start('CharSelectScene', { mode: 'online' });
    });

    networkManager.on('opponent_joined', () => {
      this.cleanupHandlers();
      this.scene.start('CharSelectScene', { mode: 'online' });
    });

    networkManager.on('room_error', (data) => {
      this.lobbyState = 'menu';
      this.statusText.setText(data.message).setColor('#ff4444');
      this.time.delayedCall(2000, () => {
        this.statusText.setText('').setColor('#ffffff');
      });
    });

    // Keyboard input for room code
    this.input.keyboard.on('keydown', (event) => {
      if (this.lobbyState !== 'joining') return;

      if (event.key === 'Backspace') {
        this.roomCodeInput = this.roomCodeInput.slice(0, -1);
      } else if (event.key === 'Enter' && this.roomCodeInput.length === 6) {
        networkManager.joinRoom(this.roomCodeInput);
        this.statusText.setText('Joining...').setColor('#aaaaff');
      } else if (event.key.length === 1 && this.roomCodeInput.length < 6) {
        const char = event.key.toUpperCase();
        if (/[A-Z0-9]/.test(char)) {
          this.roomCodeInput += char;
        }
      }
      this.updateUI();
    });
  }

  updateUI() {
    const dots = '.'.repeat(this.dotCount);

    switch (this.lobbyState) {
      case 'creating':
        this.statusText.setText('Creating room' + dots);
        this.roomCodeDisplay.setText('');
        this.inputHint.setText('');
        break;
      case 'waiting':
        this.statusText.setText('Waiting for opponent' + dots);
        this.roomCodeDisplay.setText(this.roomCode || '');
        this.inputHint.setText('Share this code with your opponent');
        break;
      case 'joining':
        this.statusText.setText('Enter room code:');
        this.roomCodeDisplay.setText(this.roomCodeInput + '_'.repeat(6 - this.roomCodeInput.length));
        this.inputHint.setText('Type the 6-character room code, then press Enter');
        break;
      default:
        this.statusText.setText('');
        this.roomCodeDisplay.setText('');
        this.inputHint.setText('');
    }
  }

  cleanupHandlers() {
    networkManager.off('room_created');
    networkManager.off('room_joined');
    networkManager.off('opponent_joined');
    networkManager.off('room_error');
  }

  createButton(x, y, text, callback) {
    const btnWidth = 200;
    const btnHeight = 40;

    const bg = this.add.graphics();
    bg.fillStyle(0x334466, 0.8);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(2, 0x5577aa);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 8);

    const label = this.add.text(x, y, text, {
      fontSize: '16px',
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
