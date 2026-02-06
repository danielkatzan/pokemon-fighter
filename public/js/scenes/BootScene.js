class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // No external assets to load - everything is drawn with Graphics API
    // Show loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const loadingText = this.add.text(width / 2, height / 2 - 30, 'Loading...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(width / 2, height / 2 + 10, 300, 20, 0x333333);
    const bar = this.add.rectangle(width / 2 - 148, height / 2 + 10, 0, 16, 0x44cc44).setOrigin(0, 0.5);

    // Simulate loading for smooth transition
    this.tweens.add({
      targets: bar,
      displayWidth: 296,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.scene.start('MenuScene');
      }
    });
  }

  create() {
    // Transition handled in preload tween
  }
}
