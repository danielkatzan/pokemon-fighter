class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d1a4e, 0x2d1a4e, 1);
    bg.fillRect(0, 0, width, height);

    // Animated background particles
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 1 + Math.random() * 3;
      const star = this.add.circle(x, y, size, 0xffffff, 0.3 + Math.random() * 0.4);
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1
      });
    }

    // Title
    const title = this.add.text(width / 2, 80, 'POKEMON\nFIGHTER', {
      fontSize: '52px',
      fontFamily: 'Arial Black, Arial',
      color: '#ffcc00',
      stroke: '#cc8800',
      strokeThickness: 6,
      align: 'center',
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 10, fill: true }
    }).setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      y: 85,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, 140, '- Battle Arena -', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaacc',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Character silhouettes
    this.drawCharacterSilhouettes();

    // Buttons
    this.createButton(width / 2, 240, 'VS COMPUTER', () => {
      this.scene.start('CharSelectScene', { mode: 'vs_cpu' });
    });

    this.createButton(width / 2, 300, 'LOCAL 2 PLAYER', () => {
      this.scene.start('CharSelectScene', { mode: 'local_2p' });
    });

    this.createButton(width / 2, 360, 'ONLINE BATTLE', () => {
      this.scene.start('LobbyScene');
    });

    // Controls hint
    this.add.text(width / 2, 420, 'P1: WASD + F/G + Q/E  |  P2: Arrows + K/L + I/O', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#666688'
    }).setOrigin(0.5);
  }

  drawCharacterSilhouettes() {
    const colors = [0xffdd00, 0xff6622, 0x44aa88, 0x4488dd];
    const positions = [120, 280, 520, 680];

    colors.forEach((color, i) => {
      const x = positions[i];
      const silhouette = this.add.circle(x, 190, 18, color, 0.15);
      this.tweens.add({
        targets: silhouette,
        y: 195,
        alpha: 0.25,
        duration: 1500 + i * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  createButton(x, y, text, callback) {
    const btnWidth = 220;
    const btnHeight = 44;

    const bg = this.add.graphics();
    bg.fillStyle(0x334466, 0.8);
    bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);
    bg.lineStyle(2, 0x5577aa);
    bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);

    const label = this.add.text(x, y, text, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);

    // Interactive zone
    const zone = this.add.zone(x, y, btnWidth, btnHeight).setInteractive({ useHandCursor: true });

    zone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x446688, 0.9);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);
      bg.lineStyle(2, 0x77aadd);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);
      label.setColor('#ffcc00');
    });

    zone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x334466, 0.8);
      bg.fillRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);
      bg.lineStyle(2, 0x5577aa);
      bg.strokeRoundedRect(x - btnWidth / 2, y - btnHeight / 2, btnWidth, btnHeight, 10);
      label.setColor('#ffffff');
    });

    zone.on('pointerdown', callback);
  }
}
