class Togepi extends Fighter {
  constructor(scene, x, y) {
    super(scene, x, y, {
      name: 'Togepi',
      color: 0xffccdd,
      hp: 95,
      speed: 190,
      jumpForce: -380,
      weight: 0.85,
      punchDamage: 6,
      kickDamage: 8,
      special1Damage: 15,
      special1Cooldown: 2800,
      special2Damage: 0,
      special2Cooldown: 7000
    });
    this.charmed = false;
    this.charmTimer = 0;
  }

  buildVisual() {
    const g = this.scene.add.graphics();

    // === EGGSHELL (lower half, wraps around body) ===
    // Shell back shadow
    g.fillStyle(0xe8ddd0);
    g.fillEllipse(0, 8, 44, 36);

    // Shell main (cream white egg shape)
    g.fillStyle(0xfff8ee);
    g.fillEllipse(0, 8, 42, 34);

    // Colored triangle pattern on shell — iconic Togepi markings
    // Row of triangles: red, blue, red, blue
    g.fillStyle(0xcc3333);
    g.fillTriangle(-15, 2, -10, 14, -5, 2);
    g.fillTriangle(7, 4, 12, 16, 17, 4);

    g.fillStyle(0x3355cc);
    g.fillTriangle(-5, 6, 0, 18, 5, 6);
    g.fillTriangle(-19, 8, -14, 18, -9, 8);

    // Small accent triangles
    g.fillStyle(0xcc3333, 0.7);
    g.fillTriangle(14, 10, 18, 20, 22, 10);
    g.fillStyle(0x3355cc, 0.7);
    g.fillTriangle(-2, 14, 2, 22, 6, 14);

    // Jagged shell top edge (zigzag where egg is cracked)
    g.fillStyle(0xfff8ee);
    g.beginPath();
    g.moveTo(-21, 0);
    g.lineTo(-17, -8);
    g.lineTo(-12, 2);
    g.lineTo(-7, -10);
    g.lineTo(-2, 1);
    g.lineTo(3, -9);
    g.lineTo(8, 2);
    g.lineTo(13, -8);
    g.lineTo(18, 1);
    g.lineTo(21, -4);
    g.lineTo(22, 4);
    g.lineTo(-22, 4);
    g.closePath();
    g.fillPath();

    // Zigzag edge outline for definition
    g.lineStyle(1.8, 0xccbbaa);
    g.beginPath();
    g.moveTo(-21, 0);
    g.lineTo(-17, -8);
    g.lineTo(-12, 2);
    g.lineTo(-7, -10);
    g.lineTo(-2, 1);
    g.lineTo(3, -9);
    g.lineTo(8, 2);
    g.lineTo(13, -8);
    g.lineTo(18, 1);
    g.lineTo(21, -4);
    g.strokePath();

    // Shell bottom outline
    g.lineStyle(1.5, 0xccbbaa);
    g.beginPath();
    g.arc(0, 8, 21, 0.3, Math.PI - 0.3, false);
    g.strokePath();

    // === BODY (round cream torso poking out of shell) ===
    g.fillStyle(0xffe8c8);
    g.fillEllipse(0, -8, 32, 22);

    // Lighter chest
    g.fillStyle(0xffeecc);
    g.fillEllipse(0, -6, 24, 16);

    // === HEAD (big round cute head) ===
    // Head shadow
    g.fillStyle(0xf0d8b0);
    g.fillEllipse(0, -26, 34, 28);

    // Head main
    g.fillStyle(0xffe8c8);
    g.fillEllipse(0, -27, 32, 26);

    // === CROWN (5 spikes in a fan) ===
    // Center spike (tallest)
    g.fillStyle(0xffe8c8);
    g.beginPath();
    g.moveTo(-4, -38);
    g.lineTo(0, -54);
    g.lineTo(4, -38);
    g.closePath();
    g.fillPath();

    // Inner-left spike
    g.beginPath();
    g.moveTo(-9, -36);
    g.lineTo(-8, -49);
    g.lineTo(-3, -36);
    g.closePath();
    g.fillPath();

    // Inner-right spike
    g.beginPath();
    g.moveTo(3, -36);
    g.lineTo(8, -49);
    g.lineTo(9, -36);
    g.closePath();
    g.fillPath();

    // Outer-left spike (shorter)
    g.beginPath();
    g.moveTo(-13, -33);
    g.lineTo(-14, -43);
    g.lineTo(-8, -34);
    g.closePath();
    g.fillPath();

    // Outer-right spike (shorter)
    g.beginPath();
    g.moveTo(8, -34);
    g.lineTo(14, -43);
    g.lineTo(13, -33);
    g.closePath();
    g.fillPath();

    // Crown spike tips — red and blue alternating
    g.fillStyle(0xcc3333);
    g.fillTriangle(-9, -43, -8, -49, -5, -43);
    g.fillTriangle(5, -43, 8, -49, 9, -43);

    g.fillStyle(0x3355cc);
    g.fillTriangle(-2, -47, 0, -54, 2, -47);
    g.fillTriangle(-14, -39, -14, -43, -11, -39);
    g.fillTriangle(11, -39, 14, -43, 14, -39);

    // Spike outlines for crispness
    g.lineStyle(1, 0xccbbaa);
    // Center
    g.beginPath(); g.moveTo(-4, -38); g.lineTo(0, -54); g.lineTo(4, -38); g.strokePath();
    // Inner left
    g.beginPath(); g.moveTo(-9, -36); g.lineTo(-8, -49); g.lineTo(-3, -36); g.strokePath();
    // Inner right
    g.beginPath(); g.moveTo(3, -36); g.lineTo(8, -49); g.lineTo(9, -36); g.strokePath();
    // Outer left
    g.beginPath(); g.moveTo(-13, -33); g.lineTo(-14, -43); g.lineTo(-8, -34); g.strokePath();
    // Outer right
    g.beginPath(); g.moveTo(8, -34); g.lineTo(14, -43); g.lineTo(13, -33); g.strokePath();

    // === FACE ===
    // Eyes (big, round, cute)
    g.fillStyle(0xffffff);
    g.fillEllipse(-7, -28, 10, 11);
    g.fillEllipse(7, -28, 10, 11);

    // Irises
    g.fillStyle(0x222222);
    g.fillCircle(-7, -28, 3.8);
    g.fillCircle(7, -28, 3.8);

    // Eye shine (two highlights per eye)
    g.fillStyle(0xffffff);
    g.fillCircle(-5.5, -29.5, 1.6);
    g.fillCircle(8.5, -29.5, 1.6);
    g.fillCircle(-7.5, -26.5, 0.8);
    g.fillCircle(6.5, -26.5, 0.8);

    // Happy smile
    g.lineStyle(1.8, 0xbb7755);
    g.beginPath();
    g.arc(0, -21, 5, 0.2, Math.PI - 0.2, false);
    g.strokePath();

    // Blush spots (rosy cheeks)
    g.fillStyle(0xffaaaa, 0.45);
    g.fillEllipse(-12, -23, 7, 5);
    g.fillEllipse(12, -23, 7, 5);

    // === FEET (tiny round stubs at shell bottom) ===
    g.fillStyle(0xffe8c8);
    g.fillEllipse(-10, 24, 12, 7);
    g.fillEllipse(10, 24, 12, 7);
    // Toe lines
    g.lineStyle(1, 0xddccbb);
    g.beginPath(); g.moveTo(-13, 24); g.lineTo(-12, 27); g.strokePath();
    g.beginPath(); g.moveTo(-10, 24); g.lineTo(-10, 27); g.strokePath();
    g.beginPath(); g.moveTo(10, 24); g.lineTo(10, 27); g.strokePath();
    g.beginPath(); g.moveTo(13, 24); g.lineTo(12, 27); g.strokePath();

    // === ARMS (separate graphics for animation) ===
    this.leftArm = this.scene.add.graphics();
    this.leftArm.fillStyle(0xffe8c8);
    this.leftArm.fillEllipse(0, 0, 10, 14);
    // Little hand nubs
    this.leftArm.fillStyle(0xffddb8);
    this.leftArm.fillCircle(-1, 6, 3);
    this.leftArm.x = -17;
    this.leftArm.y = -8;

    this.rightArm = this.scene.add.graphics();
    this.rightArm.fillStyle(0xffe8c8);
    this.rightArm.fillEllipse(0, 0, 10, 14);
    this.rightArm.fillStyle(0xffddb8);
    this.rightArm.fillCircle(1, 6, 3);
    this.rightArm.x = 17;
    this.rightArm.y = -8;

    // Charm shield (hidden by default)
    this.shieldGraphics = this.scene.add.graphics();
    this.shieldGraphics.setVisible(false);

    this.mainGraphics = g;
    this.container.add([g, this.leftArm, this.rightArm, this.shieldGraphics]);
  }

  playAttackAnimation(type) {
    if (type === 'punch') {
      this.scene.tweens.add({
        targets: this.rightArm,
        x: this.facingRight ? 28 : 4,
        y: -4,
        duration: 60,
        yoyo: true,
        hold: 100,
        ease: 'Power2'
      });
      this.scene.tweens.add({
        targets: this.container,
        angle: this.facingRight ? 6 : -6,
        duration: 80,
        yoyo: true,
        hold: 100
      });
    } else if (type === 'kick') {
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
    // Metronome - waves finger, fires a random-type projectile
    if (this.attackActive) return;
    this.state = 'special1';
    this.attackActive = true;
    this.attackTimer = 450;
    this.currentAttack = 'special1';
    this.special1Cooldown = this.special1MaxCooldown;
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;

    // Finger wag animation
    this.scene.tweens.add({
      targets: this.rightArm,
      x: this.facingRight ? 24 : 8,
      y: -18,
      duration: 80,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut'
    });

    // Sparkle charge on finger
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        if (!this.scene || !this.scene.sys.isActive()) return;
        const spark = this.scene.add.circle(
          this.physBody.x + dir * 20,
          this.physBody.y - 20 + (Math.random() - 0.5) * 10,
          2 + Math.random() * 3,
          0xffaaff, 0.8
        );
        spark.setDepth(20);
        this.scene.tweens.add({
          targets: spark,
          alpha: 0, scaleX: 0.2, scaleY: 0.2,
          y: spark.y - 10,
          duration: 200,
          onComplete: () => spark.destroy()
        });
      });
    }

    // Random projectile type
    const types = ['electric', 'fire', 'grass', 'water', 'fairy'];
    const chosen = types[Math.floor(Math.random() * types.length)];

    this.scene.time.delayedCall(250, () => {
      if (!this.scene || !this.scene.sys.isActive()) return;

      let color, trailColor, speed, size, effectFn;
      switch (chosen) {
        case 'electric':
          color = 0xffff00; trailColor = 0xffff88;
          speed = 340; size = 14;
          effectFn = 'electricSpark';
          break;
        case 'fire':
          color = 0xff6600; trailColor = 0xff4400;
          speed = 300; size = 16;
          effectFn = 'fireSpark';
          break;
        case 'grass':
          color = 0x44dd44; trailColor = 0x88ee44;
          speed = 320; size = 12;
          effectFn = 'leafSpark';
          break;
        case 'water':
          color = 0x4488ff; trailColor = 0x88ccff;
          speed = 310; size = 14;
          effectFn = 'waterSpark';
          break;
        case 'fairy':
          color = 0xff88dd; trailColor = 0xffaaee;
          speed = 290; size = 16;
          effectFn = 'fairySpark';
          break;
      }

      // Launch flash
      const flash = this.scene.add.circle(
        this.physBody.x + dir * 18, this.physBody.y - 16, 10, color, 0.7
      );
      flash.setDepth(20);
      this.scene.tweens.add({
        targets: flash,
        alpha: 0, scaleX: 2, scaleY: 2,
        duration: 200,
        onComplete: () => flash.destroy()
      });

      const proj = this.createProjectile(
        dir * 22, -16, dir * speed, 0,
        size, size * 0.8, color,
        this.special1Damage, 1500
      );

      // Trail particles
      const trailEvent = this.scene.time.addEvent({
        delay: 40,
        callback: () => {
          if (proj.active && this.scene && this.scene.sys.isActive()) {
            const p = this.scene.add.circle(
              proj.x + (Math.random() - 0.5) * 6,
              proj.y + (Math.random() - 0.5) * 6,
              1.5 + Math.random() * 2.5, trailColor, 0.6
            );
            p.setDepth(14);
            this.scene.tweens.add({
              targets: p,
              alpha: 0, scaleX: 0.2, scaleY: 0.2,
              duration: 180,
              onComplete: () => p.destroy()
            });

            // Fairy sparkle stars
            if (chosen === 'fairy' && Math.random() < 0.5) {
              const star = this.scene.add.star(
                proj.x + (Math.random() - 0.5) * 10,
                proj.y + (Math.random() - 0.5) * 10,
                4, 2, 5, 0xffccee, 0.7
              );
              star.setDepth(14);
              this.scene.tweens.add({
                targets: star,
                alpha: 0, rotation: Math.PI,
                scaleX: 0.1, scaleY: 0.1,
                duration: 250,
                onComplete: () => star.destroy()
              });
            }
          } else {
            trailEvent.destroy();
          }
        },
        loop: true
      });
      proj.on('destroy', () => trailEvent.destroy());

      // On-hit effect type
      proj.effectType = effectFn;

      if (this.scene.effects) {
        if (this.scene.effects[effectFn]) {
          this.scene.effects[effectFn](this.physBody.x + dir * 20, this.physBody.y - 16);
        } else {
          this.scene.effects.hitSpark(this.physBody.x + dir * 20, this.physBody.y - 16, color, 8);
        }
      }
    });
  }

  special2() {
    // Charm - fairy shield, blocks 70% damage for 2s
    if (this.attackActive || this.charmed) return;
    this.state = 'special2';
    this.special2Cooldown = this.special2MaxCooldown;
    this.charmed = true;
    this.charmTimer = 2000;
    this.physBody.body.setVelocityX(0);

    // Draw shield
    this.shieldGraphics.clear();
    this.shieldGraphics.setVisible(true);
    this.shieldGraphics.lineStyle(2, 0xff88cc, 0.6);
    this.shieldGraphics.strokeCircle(0, -8, 28);
    this.shieldGraphics.lineStyle(1, 0xffaadd, 0.3);
    this.shieldGraphics.strokeCircle(0, -8, 32);

    // Shield pulse animation
    this.scene.tweens.add({
      targets: this.shieldGraphics,
      alpha: { from: 1, to: 0.4 },
      duration: 400,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        if (this.shieldGraphics) {
          this.shieldGraphics.setVisible(false);
          this.shieldGraphics.clear();
        }
      }
    });

    // Burst of fairy sparkles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const sx = this.physBody.x + Math.cos(angle) * 24;
      const sy = this.physBody.y - 8 + Math.sin(angle) * 24;

      const star = this.scene.add.star(sx, sy, 4, 2, 5, 0xffaadd, 0.8);
      star.setDepth(20);
      this.scene.tweens.add({
        targets: star,
        x: sx + Math.cos(angle) * 20,
        y: sy + Math.sin(angle) * 20,
        alpha: 0,
        rotation: Math.PI,
        scaleX: 0.2, scaleY: 0.2,
        duration: 400 + Math.random() * 200,
        onComplete: () => star.destroy()
      });
    }

    // Hearts floating up
    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        if (!this.scene || !this.scene.sys.isActive()) return;
        const hx = this.physBody.x + (Math.random() - 0.5) * 30;
        const hy = this.physBody.y - 10;
        const heart = this.scene.add.text(hx, hy, '\u2665', {
          fontSize: '14px', color: '#ff88cc'
        }).setOrigin(0.5).setDepth(20);
        this.scene.tweens.add({
          targets: heart,
          y: hy - 40, alpha: 0,
          duration: 600,
          onComplete: () => heart.destroy()
        });
      });
    }

    if (this.scene.effects && this.scene.effects.fairySpark) {
      this.scene.effects.fairySpark(this.physBody.x, this.physBody.y - 10);
    }
  }

  update(inputs, time, delta) {
    if (this.charmed) {
      this.charmTimer -= delta;
      if (this.charmTimer <= 0) {
        this.exitCharm();
      }
    }
    super.update(inputs, time, delta);
  }

  exitCharm() {
    this.charmed = false;
    this.shieldGraphics.setVisible(false);
    this.shieldGraphics.clear();
    if (this.state === 'special2') this.state = 'idle';
  }

  takeDamage(amount, knockbackForce, direction) {
    if (this.charmed) {
      super.takeDamage(amount * 0.3, knockbackForce * 0.3, direction);
      return;
    }
    super.takeDamage(amount, knockbackForce, direction);
  }

  resetVisual() {
    this.container.setAngle(0);
    if (this.rightArm) { this.rightArm.x = 17; this.rightArm.y = -8; }
    if (this.leftArm) { this.leftArm.x = -17; this.leftArm.y = -8; }
    if (this.charmed) this.exitCharm();
  }
}
