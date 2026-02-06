class Bulbasaur extends Fighter {
  constructor(scene, x, y) {
    super(scene, x, y, {
      name: 'Bulbasaur',
      color: 0x44aa88,
      hp: 120,
      speed: 150,
      jumpForce: -340,
      weight: 1.3,
      punchDamage: 9,
      kickDamage: 12,
      special1Damage: 13,
      special1Cooldown: 3000,
      special2Damage: 10,
      special2Cooldown: 2500
    });
  }

  buildVisual() {
    const g = this.scene.add.graphics();

    // Body (quadruped, wider)
    g.fillStyle(0x44aa88);
    g.fillEllipse(0, 2, 44, 34);

    // Darker patches
    g.fillStyle(0x339977);
    g.fillEllipse(-10, -2, 12, 10);
    g.fillEllipse(8, 4, 10, 8);

    // Bulb on back
    g.fillStyle(0x228855);
    g.fillEllipse(0, -18, 28, 22);
    // Bulb leaves
    g.fillStyle(0x33bb66);
    g.beginPath();
    g.moveTo(-8, -28);
    g.lineTo(0, -38);
    g.lineTo(8, -28);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(-12, -24);
    g.lineTo(-6, -36);
    g.lineTo(0, -24);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(0, -24);
    g.lineTo(6, -36);
    g.lineTo(12, -24);
    g.closePath();
    g.fillPath();

    // Head
    g.fillStyle(0x44aa88);
    g.fillEllipse(0, -6, 36, 28);

    // Mouth
    g.fillStyle(0x339977);
    g.beginPath();
    g.moveTo(-10, -1);
    g.lineTo(0, 3);
    g.lineTo(10, -1);
    g.closePath();
    g.fillPath();

    // Eyes
    g.fillStyle(0xcc2222);
    g.fillEllipse(-9, -12, 8, 9);
    g.fillEllipse(9, -12, 8, 9);
    g.fillStyle(0x111111);
    g.fillCircle(-9, -12, 3);
    g.fillCircle(9, -12, 3);
    g.fillStyle(0xffffff);
    g.fillCircle(-8, -13, 1.5);
    g.fillCircle(10, -13, 1.5);

    // Legs
    g.fillStyle(0x44aa88);
    g.fillEllipse(-14, 18, 12, 10);
    g.fillEllipse(14, 18, 12, 10);
    g.fillEllipse(-10, 18, 10, 10);
    g.fillEllipse(10, 18, 10, 10);

    // Claws
    g.fillStyle(0x338866);
    g.fillCircle(-17, 21, 2);
    g.fillCircle(-14, 22, 2);
    g.fillCircle(14, 22, 2);
    g.fillCircle(17, 21, 2);

    // Front legs as arms for attacks
    this.leftArm = this.scene.add.graphics();
    this.leftArm.fillStyle(0x44aa88);
    this.leftArm.fillEllipse(0, 0, 10, 14);
    this.leftArm.x = -18;
    this.leftArm.y = 0;

    this.rightArm = this.scene.add.graphics();
    this.rightArm.fillStyle(0x44aa88);
    this.rightArm.fillEllipse(0, 0, 10, 14);
    this.rightArm.x = 18;
    this.rightArm.y = 0;

    this.container.add([g, this.leftArm, this.rightArm]);
  }

  playAttackAnimation(type) {
    if (type === 'punch') {
      // Lunge forward with front leg
      this.scene.tweens.add({
        targets: this.rightArm,
        x: this.facingRight ? 30 : 6,
        y: -5,
        duration: 80,
        yoyo: true,
        hold: 100,
        ease: 'Power2'
      });
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 8 : -8,
        duration: 100,
        yoyo: true,
        hold: 80
      });
    } else if (type === 'kick') {
      // Full body tackle
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 18 : -18,
        duration: 80,
        yoyo: true,
        hold: 150,
        ease: 'Back.easeOut'
      });
    }
  }

  special1() {
    // Vine Whip - long range vine lash
    if (this.attackActive) return;
    this.state = 'special1';
    this.attackActive = true;
    this.attackTimer = 400;
    this.currentAttack = 'special1';
    this.special1Cooldown = this.special1MaxCooldown;
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;

    // Animate vine extending outward
    const vine = this.scene.add.graphics();
    vine.setDepth(15);
    const startX = this.physBody.x + dir * 20;
    const startY = this.physBody.y - 18;
    const vineLength = 100;

    let progress = 0;
    const vineTimer = this.scene.time.addEvent({
      delay: 16,
      callback: () => {
        progress += 0.12;
        if (progress >= 1) {
          vineTimer.destroy();
          this.scene.time.delayedCall(150, () => vine.destroy());
          return;
        }
        vine.clear();
        // Thick vine
        vine.lineStyle(5, 0x33bb66);
        vine.beginPath();
        vine.moveTo(startX, startY);
        const endX = startX + dir * vineLength * progress;
        const midX = startX + dir * vineLength * progress * 0.5;
        const midY = startY - 20 * Math.sin(progress * Math.PI);
        vine.lineTo(midX, midY);
        vine.lineTo(endX, startY);
        vine.strokePath();
        // Vine tip (wider at end)
        vine.fillStyle(0x44dd66);
        vine.fillCircle(endX, startY, 6);
        // Leaf at tip
        vine.fillStyle(0x33bb66);
        vine.fillEllipse(endX + dir * 4, startY - 3, 8, 4);
        vine.fillEllipse(endX + dir * 4, startY + 3, 8, 4);
      },
      loop: true
    });

    // Long range hitbox
    this.activateAttackBox(dir * 55, -15, 80, 25);

    if (this.scene.effects) {
      this.scene.effects.leafSpark(this.physBody.x + dir * 20, this.physBody.y - 18);
    }
  }

  special2() {
    // Razor Leaf - fast spinning leaf projectiles
    if (this.attackActive) return;
    this.state = 'special2';
    this.attackActive = true;
    this.attackTimer = 250;
    this.currentAttack = 'special2';
    this.special2Cooldown = this.special2MaxCooldown;
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;

    // Create 3 leaf projectiles spread
    for (let i = -1; i <= 1; i++) {
      const leafColor = [0x33aa44, 0x44cc44, 0x55dd55][i + 1];
      const proj = this.createProjectile(
        dir * 20, -18 + i * 8,
        dir * 300, i * 40,
        10, 5, leafColor,
        Math.floor(this.special2Damage / 2), 1200
      );

      // Spin the leaf
      this.scene.tweens.add({
        targets: proj,
        angle: 360 * 3,
        duration: 1200,
        repeat: 0
      });

      // Leaf trail
      const trailEvent = this.scene.time.addEvent({
        delay: 50,
        callback: () => {
          if (proj.active && this.scene && this.scene.sys.isActive()) {
            const trail = this.scene.add.ellipse(proj.x, proj.y, 6, 3, leafColor, 0.3);
            trail.setDepth(14);
            trail.setRotation(proj.angle);
            this.scene.tweens.add({
              targets: trail,
              alpha: 0, scaleX: 0.2, scaleY: 0.2,
              duration: 150,
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

    // Bulb glow
    const glow = this.scene.add.circle(this.physBody.x, this.physBody.y - 25, 14, 0x44dd44, 0.4);
    glow.setDepth(20);
    this.scene.tweens.add({
      targets: glow,
      alpha: 0, scaleX: 2, scaleY: 2,
      duration: 300,
      onComplete: () => glow.destroy()
    });

    if (this.scene.effects) {
      this.scene.effects.leafSpark(this.physBody.x + dir * 15, this.physBody.y - 18);
    }
  }

  resetVisual() {
    this.container.setAngle(0);
    if (this.rightArm) { this.rightArm.x = 18; this.rightArm.y = 0; }
    if (this.leftArm) { this.leftArm.x = -18; this.leftArm.y = 0; }
  }
}
