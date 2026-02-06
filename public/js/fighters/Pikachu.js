class Pikachu extends Fighter {
  constructor(scene, x, y) {
    super(scene, x, y, {
      name: 'Pikachu',
      color: 0xffdd00,
      hp: 90,
      speed: 220,
      jumpForce: -420,
      weight: 0.8,
      punchDamage: 6,
      kickDamage: 8,
      special1Damage: 14,
      special1Cooldown: 3000,
      special2Damage: 10,
      special2Cooldown: 2000
    });
  }

  buildVisual() {
    const g = this.scene.add.graphics();

    // Body
    g.fillStyle(0xffdd00);
    g.fillEllipse(0, -5, 36, 40);

    // Belly
    g.fillStyle(0xffee66);
    g.fillEllipse(0, 0, 24, 26);

    // Head
    g.fillStyle(0xffdd00);
    g.fillEllipse(0, -30, 34, 30);

    // Ears
    g.fillStyle(0xffdd00);
    g.fillTriangle(-12, -42, -8, -60, -4, -42);
    g.fillTriangle(4, -42, 8, -60, 12, -42);
    // Ear tips
    g.fillStyle(0x222222);
    g.fillTriangle(-11, -52, -8, -60, -5, -52);
    g.fillTriangle(5, -52, 8, -60, 11, -52);

    // Eyes
    g.fillStyle(0x222222);
    g.fillCircle(-7, -32, 4);
    g.fillCircle(7, -32, 4);
    g.fillStyle(0xffffff);
    g.fillCircle(-6, -33, 1.5);
    g.fillCircle(8, -33, 1.5);

    // Red cheeks
    g.fillStyle(0xff4444);
    g.fillCircle(-14, -26, 5);
    g.fillCircle(14, -26, 5);

    // Mouth
    g.lineStyle(1.5, 0x222222);
    g.beginPath();
    g.moveTo(-3, -25);
    g.lineTo(0, -23);
    g.lineTo(3, -25);
    g.strokePath();

    // Brown stripes on back
    g.fillStyle(0x996633);
    g.fillRect(-14, -10, 5, 3);
    g.fillRect(-14, -4, 5, 3);

    // Tail (lightning bolt shape)
    g.fillStyle(0xffdd00);
    g.beginPath();
    g.moveTo(18, -15);
    g.lineTo(28, -25);
    g.lineTo(24, -15);
    g.lineTo(32, -20);
    g.lineTo(26, -8);
    g.lineTo(30, -10);
    g.lineTo(18, 0);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, 0xccaa00);
    g.strokePath();

    // Feet
    g.fillStyle(0xffdd00);
    g.fillEllipse(-8, 18, 12, 8);
    g.fillEllipse(8, 18, 12, 8);

    // Arms (drawn as part of main graphics, separate arm graphics for animation)
    this.leftArm = this.scene.add.graphics();
    this.leftArm.fillStyle(0xffdd00);
    this.leftArm.fillEllipse(0, 0, 10, 14);
    this.leftArm.x = -18;
    this.leftArm.y = -12;

    this.rightArm = this.scene.add.graphics();
    this.rightArm.fillStyle(0xffdd00);
    this.rightArm.fillEllipse(0, 0, 10, 14);
    this.rightArm.x = 18;
    this.rightArm.y = -12;

    this.container.add([g, this.leftArm, this.rightArm]);
  }

  playAttackAnimation(type) {
    if (type === 'punch') {
      // Swing arm forward
      this.scene.tweens.add({
        targets: this.rightArm,
        x: this.facingRight ? 32 : 4,
        y: -10,
        duration: 60,
        yoyo: true,
        hold: 120,
        ease: 'Power2'
      });
      // Lean body forward
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 8 : -8,
        duration: 80,
        yoyo: true,
        hold: 100
      });
    } else if (type === 'kick') {
      // Rotate body for kick
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 20 : -20,
        duration: 80,
        yoyo: true,
        hold: 150,
        ease: 'Back.easeOut'
      });
    }
  }

  special1() {
    // Thunder Shock - ranged electric bolt
    if (this.attackActive) return;
    this.state = 'special1';
    this.attackActive = true;
    this.attackTimer = 350;
    this.currentAttack = 'special1';
    this.special1Cooldown = this.special1MaxCooldown;

    const dir = this.facingRight ? 1 : -1;
    this.physBody.body.setVelocityX(0);

    // Show charging effect on cheeks
    const cheekFlash = this.scene.add.circle(
      this.physBody.x + dir * 14, this.physBody.y - 26, 8, 0xffff00, 0.8
    );
    cheekFlash.setDepth(20);
    this.scene.tweens.add({
      targets: cheekFlash,
      alpha: 0, scaleX: 2, scaleY: 2,
      duration: 200,
      onComplete: () => cheekFlash.destroy()
    });

    // Create electric bolt projectile
    const bolt = this.createProjectile(
      dir * 30, -20, dir * 350, 0,
      18, 10, 0xffff00,
      this.special1Damage, 1500
    );

    // Bolt glow trail
    const trailEvent = this.scene.time.addEvent({
      delay: 30,
      callback: () => {
        if (bolt.active && this.scene && this.scene.sys.isActive()) {
          // Electric glow
          const glow = this.scene.add.circle(bolt.x, bolt.y, 8 + Math.random() * 4, 0xffff44, 0.3);
          glow.setDepth(14);
          this.scene.tweens.add({
            targets: glow,
            alpha: 0, scaleX: 0.2, scaleY: 0.2,
            duration: 150,
            onComplete: () => glow.destroy()
          });
          // Mini lightning
          if (Math.random() < 0.4) {
            const spark = this.scene.add.graphics().setDepth(14);
            spark.lineStyle(1, 0xffff88, 0.8);
            spark.beginPath();
            spark.moveTo(bolt.x, bolt.y);
            spark.lineTo(bolt.x + (Math.random()-0.5)*16, bolt.y + (Math.random()-0.5)*16);
            spark.strokePath();
            this.scene.tweens.add({
              targets: spark, alpha: 0, duration: 80,
              onComplete: () => spark.destroy()
            });
          }
        } else {
          trailEvent.destroy();
        }
      },
      loop: true
    });
    bolt.on('destroy', () => trailEvent.destroy());

    if (this.scene.effects) {
      this.scene.effects.electricSpark(this.physBody.x + dir * 25, this.physBody.y - 20);
    }
  }

  special2() {
    // Quick Attack - fast dash forward
    if (this.attackActive) return;
    this.state = 'special2';
    this.attackActive = true;
    this.attackTimer = 200;
    this.currentAttack = 'special2';
    this.special2Cooldown = this.special2MaxCooldown;

    const dir = this.facingRight ? 1 : -1;
    this.physBody.body.setVelocityX(dir * 450);

    this.activateAttackBox(dir * 20, -10, 45, 35);

    // Dash trail with afterimages
    if (this.scene.effects) {
      for (let i = 0; i < 4; i++) {
        this.scene.time.delayedCall(i * 40, () => {
          if (!this.scene || !this.scene.sys.isActive()) return;
          // Afterimage
          const ghost = this.scene.add.circle(
            this.physBody.x - dir * i * 15,
            this.physBody.y - 10,
            16, 0xffdd00, 0.4 - i * 0.08
          );
          ghost.setDepth(8);
          this.scene.tweens.add({
            targets: ghost,
            alpha: 0, scaleX: 0.3, scaleY: 0.3,
            duration: 200,
            onComplete: () => ghost.destroy()
          });
          // Speed lines
          const line = this.scene.add.graphics().setDepth(8);
          line.lineStyle(2, 0xffff88, 0.5);
          const ly = this.physBody.y - 20 + Math.random() * 25;
          line.beginPath();
          line.moveTo(this.physBody.x - dir * 10, ly);
          line.lineTo(this.physBody.x - dir * (30 + Math.random()*20), ly);
          line.strokePath();
          this.scene.tweens.add({
            targets: line, alpha: 0, duration: 150,
            onComplete: () => line.destroy()
          });
        });
      }
    }
  }

  resetVisual() {
    this.container.setAngle(0);
    if (this.rightArm) { this.rightArm.x = 18; this.rightArm.y = -12; }
    if (this.leftArm) { this.leftArm.x = -18; this.leftArm.y = -12; }
  }
}
