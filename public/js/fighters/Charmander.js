class Charmander extends Fighter {
  constructor(scene, x, y) {
    super(scene, x, y, {
      name: 'Charmander',
      color: 0xff6622,
      hp: 100,
      speed: 180,
      jumpForce: -380,
      weight: 1.0,
      punchDamage: 8,
      kickDamage: 10,
      special1Damage: 16,
      special1Cooldown: 4000,
      special2Damage: 12,
      special2Cooldown: 3000
    });
    this.flameFlicker = 0;
  }

  buildVisual() {
    const g = this.scene.add.graphics();

    // Tail
    g.fillStyle(0xff6622);
    g.beginPath();
    g.moveTo(16, 5);
    g.lineTo(28, 0);
    g.lineTo(30, -8);
    g.lineTo(26, -2);
    g.lineTo(18, 0);
    g.closePath();
    g.fillPath();

    // Tail flame
    this.tailFlame = this.scene.add.graphics();
    this.drawTailFlame(0);

    // Body
    g.fillStyle(0xff6622);
    g.fillEllipse(0, -2, 34, 42);

    // Cream belly
    g.fillStyle(0xffeeaa);
    g.fillEllipse(0, 3, 22, 28);

    // Head
    g.fillStyle(0xff6622);
    g.fillEllipse(0, -28, 32, 28);

    // Eyes
    g.fillStyle(0x2244cc);
    g.fillCircle(-7, -30, 4);
    g.fillCircle(7, -30, 4);
    g.fillStyle(0x111111);
    g.fillCircle(-7, -30, 2.5);
    g.fillCircle(7, -30, 2.5);
    g.fillStyle(0xffffff);
    g.fillCircle(-6, -31, 1.2);
    g.fillCircle(8, -31, 1.2);

    // Nostrils
    g.fillStyle(0xdd5511);
    g.fillCircle(-3, -24, 1);
    g.fillCircle(3, -24, 1);

    // Mouth
    g.lineStyle(1.5, 0xdd5511);
    g.beginPath();
    g.moveTo(-5, -22);
    g.lineTo(0, -20);
    g.lineTo(5, -22);
    g.strokePath();

    // Feet with claws
    g.fillStyle(0xff6622);
    g.fillEllipse(-8, 20, 14, 8);
    g.fillEllipse(8, 20, 14, 8);
    g.fillStyle(0xffeecc);
    g.fillCircle(-12, 21, 2);
    g.fillCircle(-8, 22, 2);
    g.fillCircle(8, 22, 2);
    g.fillCircle(12, 21, 2);

    // Arms
    this.leftArm = this.scene.add.graphics();
    this.leftArm.fillStyle(0xff6622);
    this.leftArm.fillEllipse(0, 0, 10, 16);
    this.leftArm.fillStyle(0xffeecc);
    this.leftArm.fillCircle(-1, 7, 2);
    this.leftArm.x = -18;
    this.leftArm.y = -10;

    this.rightArm = this.scene.add.graphics();
    this.rightArm.fillStyle(0xff6622);
    this.rightArm.fillEllipse(0, 0, 10, 16);
    this.rightArm.fillStyle(0xffeecc);
    this.rightArm.fillCircle(1, 7, 2);
    this.rightArm.x = 18;
    this.rightArm.y = -10;

    this.container.add([this.tailFlame, g, this.leftArm, this.rightArm]);
  }

  drawTailFlame(offset) {
    this.tailFlame.clear();
    const flicker = Math.sin(offset) * 3;
    this.tailFlame.fillStyle(0xff4400, 0.8);
    this.tailFlame.fillCircle(30, -10 + flicker, 7);
    this.tailFlame.fillStyle(0xffaa00);
    this.tailFlame.fillCircle(30, -8 + flicker, 4);
    this.tailFlame.fillStyle(0xffdd44);
    this.tailFlame.fillCircle(30, -7 + flicker, 2);
  }

  updateVisual() {
    this.flameFlicker += 0.15;
    this.drawTailFlame(this.flameFlicker);
  }

  playAttackAnimation(type) {
    if (type === 'punch') {
      this.scene.tweens.add({
        targets: this.rightArm,
        x: this.facingRight ? 32 : 4,
        y: -8,
        duration: 60,
        yoyo: true,
        hold: 120,
        ease: 'Power2'
      });
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 10 : -10,
        duration: 80,
        yoyo: true,
        hold: 100
      });
    } else if (type === 'kick') {
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 25 : -25,
        duration: 80,
        yoyo: true,
        hold: 150,
        ease: 'Back.easeOut'
      });
    }
  }

  special1() {
    // Flamethrower - medium range fire stream
    if (this.attackActive) return;
    this.state = 'special1';
    this.attackActive = true;
    this.attackTimer = 500;
    this.currentAttack = 'special1';
    this.special1Cooldown = this.special1MaxCooldown;
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;

    // Create fire stream with multiple particles
    for (let i = 0; i < 6; i++) {
      this.scene.time.delayedCall(i * 50, () => {
        if (!this.scene || !this.scene.sys.isActive()) return;
        const spread = (Math.random() - 0.5) * 15;
        const colors = [0xff4400, 0xff6600, 0xff8800, 0xffaa00];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 10 + i * 2;
        const proj = this.createProjectile(
          dir * 25, -22 + spread,
          dir * (260 + i * 20), spread * 2,
          size, size * 0.7, color,
          Math.floor(this.special1Damage / 3), 800
        );
        proj.setAlpha(0.9 - i * 0.08);

        // Fire glow trail
        const trailEvent = this.scene.time.addEvent({
          delay: 40,
          callback: () => {
            if (proj.active && this.scene && this.scene.sys.isActive()) {
              const ember = this.scene.add.circle(
                proj.x + (Math.random()-0.5)*6,
                proj.y + (Math.random()-0.5)*6,
                2 + Math.random()*3, 0xff6600, 0.6
              );
              ember.setDepth(14);
              this.scene.tweens.add({
                targets: ember,
                alpha: 0, y: ember.y - 8, scaleX: 0.1, scaleY: 0.1,
                duration: 150,
                onComplete: () => ember.destroy()
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

    // Mouth fire flash
    const flash = this.scene.add.circle(
      this.physBody.x + dir * 16, this.physBody.y - 22, 10, 0xff6600, 0.7
    );
    flash.setDepth(20);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0, scaleX: 2, scaleY: 2,
      duration: 300,
      onComplete: () => flash.destroy()
    });

    if (this.scene.effects) {
      this.scene.effects.fireSpark(this.physBody.x + dir * 20, this.physBody.y - 22);
    }
  }

  special2() {
    // Ember - arcing fire projectile
    if (this.attackActive) return;
    this.state = 'special2';
    this.attackActive = true;
    this.attackTimer = 300;
    this.currentAttack = 'special2';
    this.special2Cooldown = this.special2MaxCooldown;
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;
    const proj = this.createProjectile(
      dir * 20, -30,
      dir * 220, -180,
      12, 12, 0xff6600,
      this.special2Damage, 2000
    );
    proj.body.setAllowGravity(true);

    // Fire trail effect
    const trailEvent = this.scene.time.addEvent({
      delay: 35,
      callback: () => {
        if (proj.active && this.scene && this.scene.sys.isActive()) {
          const colors = [0xff4400, 0xff8800, 0xffaa00];
          const trail = this.scene.add.circle(
            proj.x + (Math.random()-0.5)*4,
            proj.y + (Math.random()-0.5)*4,
            3 + Math.random()*3,
            colors[Math.floor(Math.random()*colors.length)], 0.6
          );
          trail.setDepth(14);
          this.scene.tweens.add({
            targets: trail,
            alpha: 0, y: trail.y - 10, scaleX: 0.1, scaleY: 0.1,
            duration: 200,
            onComplete: () => trail.destroy()
          });
        } else {
          trailEvent.destroy();
        }
      },
      loop: true
    });
    proj.on('destroy', () => trailEvent.destroy());
  }

  resetVisual() {
    this.container.setAngle(0);
    if (this.rightArm) { this.rightArm.x = 18; this.rightArm.y = -10; }
    if (this.leftArm) { this.leftArm.x = -18; this.leftArm.y = -10; }
  }
}
