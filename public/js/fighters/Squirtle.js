class Squirtle extends Fighter {
  constructor(scene, x, y) {
    super(scene, x, y, {
      name: 'Squirtle',
      color: 0x4488dd,
      hp: 105,
      speed: 170,
      jumpForce: -360,
      weight: 1.1,
      punchDamage: 7,
      kickDamage: 9,
      special1Damage: 14,
      special1Cooldown: 3000,
      special2Damage: 0,
      special2Cooldown: 6000
    });
    this.isWithdrawn = false;
    this.withdrawTimer = 0;
  }

  buildVisual() {
    const g = this.scene.add.graphics();

    // Shell (back)
    g.fillStyle(0x886633);
    g.fillEllipse(2, -4, 36, 36);
    g.fillStyle(0xaa8844);
    g.fillEllipse(2, -4, 28, 28);
    g.lineStyle(1.5, 0x886633);
    g.beginPath();
    g.moveTo(2, -18);
    g.lineTo(2, 10);
    g.strokePath();
    g.beginPath();
    g.moveTo(-10, -4);
    g.lineTo(14, -4);
    g.strokePath();

    // Body
    g.fillStyle(0x4488dd);
    g.fillEllipse(0, 0, 32, 38);

    // Cream belly
    g.fillStyle(0xeeddaa);
    g.fillEllipse(0, 4, 20, 24);

    // Head
    g.fillStyle(0x4488dd);
    g.fillEllipse(0, -26, 30, 26);

    // Eyes
    g.fillStyle(0xffffff);
    g.fillEllipse(-7, -28, 8, 9);
    g.fillEllipse(7, -28, 8, 9);
    g.fillStyle(0x662222);
    g.fillCircle(-7, -28, 3);
    g.fillCircle(7, -28, 3);
    g.fillStyle(0xffffff);
    g.fillCircle(-6, -29, 1.2);
    g.fillCircle(8, -29, 1.2);

    // Mouth
    g.lineStyle(1.5, 0x3366aa);
    g.beginPath();
    g.arc(0, -22, 6, 0, Math.PI, false);
    g.strokePath();

    // Tail (curled)
    g.fillStyle(0x4488dd);
    g.beginPath();
    g.moveTo(16, 2);
    g.lineTo(24, -2);
    g.lineTo(28, -8);
    g.lineTo(26, -14);
    g.lineTo(22, -10);
    g.lineTo(22, -4);
    g.lineTo(16, 0);
    g.closePath();
    g.fillPath();

    // Feet
    g.fillStyle(0x4488dd);
    g.fillEllipse(-8, 18, 14, 8);
    g.fillEllipse(8, 18, 14, 8);

    // Arms
    this.leftArm = this.scene.add.graphics();
    this.leftArm.fillStyle(0x4488dd);
    this.leftArm.fillEllipse(0, 0, 10, 16);
    this.leftArm.x = -18;
    this.leftArm.y = -8;

    this.rightArm = this.scene.add.graphics();
    this.rightArm.fillStyle(0x4488dd);
    this.rightArm.fillEllipse(0, 0, 10, 16);
    this.rightArm.x = 18;
    this.rightArm.y = -8;

    // Withdrawn shell (hidden by default)
    this.shellGraphics = this.scene.add.graphics();
    this.shellGraphics.fillStyle(0x886633);
    this.shellGraphics.fillEllipse(0, -5, 42, 42);
    this.shellGraphics.fillStyle(0xaa8844);
    this.shellGraphics.fillEllipse(0, -5, 34, 34);
    this.shellGraphics.lineStyle(2, 0x886633);
    this.shellGraphics.beginPath();
    this.shellGraphics.moveTo(0, -22);
    this.shellGraphics.lineTo(0, 12);
    this.shellGraphics.strokePath();
    this.shellGraphics.beginPath();
    this.shellGraphics.moveTo(-15, -5);
    this.shellGraphics.lineTo(15, -5);
    this.shellGraphics.strokePath();
    this.shellGraphics.setVisible(false);

    this.mainGraphics = g;
    this.container.add([g, this.leftArm, this.rightArm, this.shellGraphics]);
  }

  playAttackAnimation(type) {
    if (type === 'punch') {
      this.scene.tweens.add({
        targets: this.rightArm,
        x: this.facingRight ? 30 : 6,
        y: -6,
        duration: 60,
        yoyo: true,
        hold: 100,
        ease: 'Power2'
      });
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 8 : -8,
        duration: 80,
        yoyo: true,
        hold: 100
      });
    } else if (type === 'kick') {
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 22 : -22,
        duration: 80,
        yoyo: true,
        hold: 150,
        ease: 'Back.easeOut'
      });
    }
  }

  special1() {
    // Water Gun - ranged water stream
    if (this.attackActive) return;
    this.state = 'special1';
    this.attackActive = true;
    this.attackTimer = 400;
    this.currentAttack = 'special1';
    this.special1Cooldown = this.special1MaxCooldown;
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;

    // Water stream particles
    for (let i = 0; i < 7; i++) {
      this.scene.time.delayedCall(i * 40, () => {
        if (!this.scene || !this.scene.sys.isActive()) return;
        const spread = (Math.random() - 0.5) * 8;
        const colors = [0x4488ff, 0x66aaff, 0x88ccff];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 7 + i;
        const proj = this.createProjectile(
          dir * 22, -26 + spread,
          dir * (290 + i * 10), spread,
          size, size * 0.7, color,
          Math.floor(this.special1Damage / 3), 1000
        );
        proj.setAlpha(0.85);

        // Water droplet trail
        const trailEvent = this.scene.time.addEvent({
          delay: 40,
          callback: () => {
            if (proj.active && this.scene && this.scene.sys.isActive()) {
              const drop = this.scene.add.circle(
                proj.x + (Math.random()-0.5)*4,
                proj.y + (Math.random()-0.5)*4,
                1.5 + Math.random()*2, 0x88ccff, 0.5
              );
              drop.setDepth(14);
              this.scene.tweens.add({
                targets: drop,
                alpha: 0, y: drop.y + 8, scaleX: 0.2, scaleY: 0.2,
                duration: 150,
                onComplete: () => drop.destroy()
              });
            } else {
              trailEvent.destroy();
            }
          },
          loop: true
        });
        proj.on('destroy', () => trailEvent.destroy());
      });
    }

    // Mouth water flash
    const flash = this.scene.add.circle(
      this.physBody.x + dir * 14, this.physBody.y - 24, 8, 0x66aaff, 0.6
    );
    flash.setDepth(20);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0, scaleX: 1.8, scaleY: 1.8,
      duration: 250,
      onComplete: () => flash.destroy()
    });

    if (this.scene.effects) {
      this.scene.effects.waterSpark(this.physBody.x + dir * 20, this.physBody.y - 26);
    }
  }

  special2() {
    // Withdraw - shell defense, blocks 80% damage for 2s
    if (this.attackActive || this.isWithdrawn) return;
    this.state = 'special2';
    this.special2Cooldown = this.special2MaxCooldown;
    this.isWithdrawn = true;
    this.withdrawTimer = 2000;

    // Show shell, hide body
    this.mainGraphics.setVisible(false);
    this.leftArm.setVisible(false);
    this.rightArm.setVisible(false);
    this.shellGraphics.setVisible(true);

    this.physBody.body.setVelocityX(0);

    // Shell spin animation
    this.scene.tweens.add({
      targets: this.shellGraphics,
      angle: 360,
      duration: 500,
      repeat: 3,
      onComplete: () => {
        if (this.shellGraphics) this.shellGraphics.setAngle(0);
      }
    });

    // Defensive shimmer effect
    const shimmer = this.scene.add.circle(this.physBody.x, this.physBody.y - 5, 24, 0x88ccff, 0.3);
    shimmer.setDepth(20);
    this.scene.tweens.add({
      targets: shimmer,
      alpha: 0, scaleX: 2, scaleY: 2,
      duration: 400,
      onComplete: () => shimmer.destroy()
    });
  }

  update(inputs, time, delta) {
    if (this.isWithdrawn) {
      this.withdrawTimer -= delta;
      if (this.withdrawTimer <= 0) {
        this.exitWithdraw();
      }
    }
    super.update(inputs, time, delta);
  }

  exitWithdraw() {
    this.isWithdrawn = false;
    this.mainGraphics.setVisible(true);
    this.leftArm.setVisible(true);
    this.rightArm.setVisible(true);
    this.shellGraphics.setVisible(false);
    this.state = 'idle';
  }

  takeDamage(amount, knockbackForce, direction) {
    if (this.isWithdrawn) {
      super.takeDamage(amount * 0.2, knockbackForce * 0.2, direction);
      return;
    }
    super.takeDamage(amount, knockbackForce, direction);
  }

  resetVisual() {
    this.container.setAngle(0);
    if (this.rightArm) { this.rightArm.x = 18; this.rightArm.y = -8; }
    if (this.leftArm) { this.leftArm.x = -18; this.leftArm.y = -8; }
    if (this.isWithdrawn) this.exitWithdraw();
  }
}
