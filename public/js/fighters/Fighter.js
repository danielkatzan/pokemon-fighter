class Fighter {
  constructor(scene, x, y, config) {
    this.scene = scene;
    this.name = config.name || 'Fighter';
    this.color = config.color || 0xffffff;

    // Stats
    this.maxHp = config.hp || 100;
    this.hp = this.maxHp;
    this.speed = config.speed || 180;
    this.jumpForce = config.jumpForce || -400;
    this.weight = config.weight || 1.0;
    this.punchDamage = config.punchDamage || 8;
    this.kickDamage = config.kickDamage || 10;

    // Special ability config
    this.special1Damage = config.special1Damage || 14;
    this.special1MaxCooldown = config.special1Cooldown || 3000;
    this.special1Cooldown = 0;
    this.special2Damage = config.special2Damage || 12;
    this.special2MaxCooldown = config.special2Cooldown || 3000;
    this.special2Cooldown = 0;

    // State
    this.state = 'idle';
    this.facingRight = true;
    this.isGrounded = true;
    this.wasGrounded = true;
    this.invincible = false;
    this.hitStun = 0;
    this.attackActive = false;
    this.attackTimer = 0;
    this.currentAttack = null;
    this.comboCount = 0;
    this.idleBob = 0;

    // Container for all graphics
    this.container = scene.add.container(x, y);
    this.container.setDepth(10);

    // Physics body (invisible rectangle for collision)
    this.physBody = scene.add.rectangle(0, 0, 40, 70, 0xff0000, 0);
    scene.physics.add.existing(this.physBody);
    this.physBody.body.setCollideWorldBounds(true);
    this.physBody.body.setBounce(0);
    // Don't call setOffset — default (0,0) is correct for center-origin rectangle
    this.physBody.x = x;
    this.physBody.y = y;
    this.physBody.setDepth(0);

    // Attack hitbox
    this.attackBox = scene.add.rectangle(0, 0, 1, 1, 0xff0000, 0);
    scene.physics.add.existing(this.attackBox, true);
    this.attackBox.body.enable = false;

    // Attack visual graphics (shown during attacks)
    this.atkVisual = scene.add.graphics();
    this.atkVisual.setDepth(12);
    this.atkVisual.setVisible(false);

    // Build visual (override in subclass)
    this.buildVisual();

    // Projectiles array
    this.projectiles = [];
  }

  buildVisual() {
    // Override in subclass
  }

  setFacing(right) {
    this.facingRight = right;
    this.container.setScale(right ? 1 : -1, 1);
  }

  update(inputs, time, delta) {
    // Idle bob animation (manual, not a tween, so it doesn't fight position sync)
    this.idleBob += delta * 0.005;

    if (this.hitStun > 0) {
      this.hitStun -= delta;
      this.syncContainerToBody();
      this.updateProjectiles(delta);
      return;
    }

    if (this.state === 'knocked_down') {
      this.syncContainerToBody();
      this.updateProjectiles(delta);
      return;
    }

    // Update cooldowns
    if (this.special1Cooldown > 0) this.special1Cooldown = Math.max(0, this.special1Cooldown - delta);
    if (this.special2Cooldown > 0) this.special2Cooldown = Math.max(0, this.special2Cooldown - delta);

    // Update attack timer
    if (this.attackActive) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.endAttack();
      } else {
        this.syncContainerToBody();
        this.updateProjectiles(delta);
        return;
      }
    }

    // Check grounded
    this.wasGrounded = this.isGrounded;
    this.isGrounded = this.physBody.body.blocked.down || this.physBody.body.touching.down;

    // Landing dust
    if (this.isGrounded && !this.wasGrounded && this.scene.effects) {
      this.scene.effects.dustLanding(this.physBody.x, this.physBody.y + 35);
    }

    // Movement — holding back = walk backward slowly + block
    const blocking = this.isBlocking(inputs);
    if (inputs.left) {
      const spd = blocking ? this.speed * 0.4 : this.speed;
      this.physBody.body.setVelocityX(-spd);
      if (this.isGrounded) this.state = blocking ? 'blocking' : 'walking';
    } else if (inputs.right) {
      const spd = blocking ? this.speed * 0.4 : this.speed;
      this.physBody.body.setVelocityX(spd);
      if (this.isGrounded) this.state = blocking ? 'blocking' : 'walking';
    } else {
      this.physBody.body.setVelocityX(0);
      if (this.isGrounded) this.state = 'idle';
    }

    // Jump
    if (inputs.up && this.isGrounded) {
      this.physBody.body.setVelocityY(this.jumpForce);
      this.state = 'jumping';
    }

    // Duck
    if (inputs.down && this.isGrounded && !blocking) {
      this.state = 'ducking';
      this.physBody.body.setVelocityX(0);
    }

    // Attacks
    if (inputs.punch && this.isGrounded) this.punch();
    else if (inputs.kick && this.isGrounded) this.kick();
    else if (inputs.sp1 && this.special1Cooldown <= 0) this.special1();
    else if (inputs.sp2 && this.special2Cooldown <= 0) this.special2();

    // Sync container to physics body
    this.syncContainerToBody();

    // Update visual based on state
    this.updateVisual();

    // Update projectiles
    this.updateProjectiles(delta);
  }

  syncContainerToBody() {
    this.container.x = this.physBody.x;
    // Add subtle idle bob only when idle/walking on ground
    const bob = (this.state === 'idle' || this.state === 'walking') && this.isGrounded
      ? Math.sin(this.idleBob) * 2 : 0;
    this.container.y = this.physBody.y + bob;
  }

  isBlocking(inputs) {
    if (this.facingRight && inputs.left && !inputs.right) return true;
    if (!this.facingRight && inputs.right && !inputs.left) return true;
    return false;
  }

  punch() {
    if (this.attackActive) return;
    this.state = 'punching';
    this.attackActive = true;
    this.attackTimer = 250;
    this.currentAttack = 'punch';
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;
    this.activateAttackBox(dir * 35, -10, 30, 20);
    this.showPunchVisual(dir);
    this.playAttackAnimation('punch');
  }

  kick() {
    if (this.attackActive) return;
    this.state = 'kicking';
    this.attackActive = true;
    this.attackTimer = 300;
    this.currentAttack = 'kick';
    this.physBody.body.setVelocityX(0);

    const dir = this.facingRight ? 1 : -1;
    this.activateAttackBox(dir * 38, 5, 35, 22);
    this.showKickVisual(dir);
    this.playAttackAnimation('kick');
  }

  showPunchVisual(dir) {
    // Draw a fist extending outward
    this.atkVisual.clear();
    this.atkVisual.setVisible(true);
    const x = this.physBody.x;
    const y = this.physBody.y;

    // Arm line
    this.atkVisual.lineStyle(5, this.color, 0.9);
    this.atkVisual.beginPath();
    this.atkVisual.moveTo(x + dir * 12, y - 12);
    this.atkVisual.lineTo(x + dir * 35, y - 10);
    this.atkVisual.strokePath();

    // Fist
    this.atkVisual.fillStyle(0xffeecc, 1);
    this.atkVisual.fillCircle(x + dir * 38, y - 10, 7);
    this.atkVisual.lineStyle(2, 0xddccaa);
    this.atkVisual.strokeCircle(x + dir * 38, y - 10, 7);

    // Impact swoosh lines
    this.atkVisual.lineStyle(2, 0xffffff, 0.7);
    for (let i = 0; i < 3; i++) {
      const sx = x + dir * (42 + i * 6);
      const sy = y - 14 + i * 5;
      this.atkVisual.beginPath();
      this.atkVisual.moveTo(sx, sy);
      this.atkVisual.lineTo(sx + dir * 8, sy);
      this.atkVisual.strokePath();
    }

    // Fade out
    this.scene.time.delayedCall(180, () => {
      this.atkVisual.setVisible(false);
      this.atkVisual.clear();
    });
  }

  showKickVisual(dir) {
    this.atkVisual.clear();
    this.atkVisual.setVisible(true);
    const x = this.physBody.x;
    const y = this.physBody.y;

    // Leg line
    this.atkVisual.lineStyle(6, this.color, 0.9);
    this.atkVisual.beginPath();
    this.atkVisual.moveTo(x + dir * 5, y + 5);
    this.atkVisual.lineTo(x + dir * 32, y + 5);
    this.atkVisual.strokePath();

    // Foot
    this.atkVisual.fillStyle(this.color, 1);
    this.atkVisual.fillEllipse(x + dir * 38, y + 5, 14, 8);
    this.atkVisual.lineStyle(2, 0xffffff, 0.5);
    this.atkVisual.strokeEllipse(x + dir * 38, y + 5, 14, 8);

    // Arc swoosh
    this.atkVisual.lineStyle(3, 0xffffff, 0.5);
    this.atkVisual.beginPath();
    this.atkVisual.arc(x + dir * 20, y + 5, 25, dir > 0 ? -0.8 : Math.PI - 0.8, dir > 0 ? 0.8 : Math.PI + 0.8);
    this.atkVisual.strokePath();

    // Impact lines
    this.atkVisual.lineStyle(2, 0xffff88, 0.6);
    for (let i = 0; i < 4; i++) {
      const angle = (dir > 0 ? -0.6 : Math.PI - 0.6) + i * 0.4;
      const sx = x + dir * 38 + Math.cos(angle) * 10;
      const sy = y + 5 + Math.sin(angle) * 10;
      this.atkVisual.beginPath();
      this.atkVisual.moveTo(sx, sy);
      this.atkVisual.lineTo(sx + Math.cos(angle) * 10, sy + Math.sin(angle) * 10);
      this.atkVisual.strokePath();
    }

    // Fade out
    this.scene.time.delayedCall(220, () => {
      this.atkVisual.setVisible(false);
      this.atkVisual.clear();
    });
  }

  special1() {
    // Override in subclass
  }

  special2() {
    // Override in subclass
  }

  activateAttackBox(offX, offY, w, h) {
    this.attackBox.x = this.physBody.x + offX;
    this.attackBox.y = this.physBody.y + offY;
    this.attackBox.setDisplaySize(w, h);
    this.attackBox.body.enable = true;
    this.attackBox.body.setSize(w, h);
    this.attackBox.body.updateFromGameObject();
    this.attackHit = false;
  }

  deactivateAttackBox() {
    this.attackBox.body.enable = false;
  }

  endAttack() {
    this.attackActive = false;
    this.currentAttack = null;
    this.state = 'idle';
    this.deactivateAttackBox();
    this.atkVisual.setVisible(false);
    this.atkVisual.clear();
    this.resetVisual();
  }

  getDamage() {
    switch (this.currentAttack) {
      case 'punch': return this.punchDamage;
      case 'kick': return this.kickDamage;
      case 'special1': return this.special1Damage;
      case 'special2': return this.special2Damage;
      default: return 5;
    }
  }

  getKnockback() {
    switch (this.currentAttack) {
      case 'punch': return 120;
      case 'kick': return 180;
      case 'special1': return 200;
      case 'special2': return 160;
      default: return 100;
    }
  }

  takeDamage(amount, knockbackForce, direction) {
    if (this.invincible) return;

    const wasBlocking = this.state === 'blocking';
    let actualDamage = amount;
    if (wasBlocking) {
      actualDamage = Math.floor(amount * 0.4);
      knockbackForce *= 0.3;
    }

    this.hp = Math.max(0, this.hp - actualDamage);

    // Apply knockback (reduced by weight)
    const kbX = direction * knockbackForce / this.weight;
    this.physBody.body.setVelocityX(kbX);
    if (!wasBlocking) {
      this.physBody.body.setVelocityY(-80);
    }

    // Hit stun
    this.hitStun = 100;
    this.state = 'hit';
    this.endAttack();

    // Effects
    if (this.scene.effects) {
      this.scene.effects.hitFlash(this);
      if (!wasBlocking) {
        this.scene.effects.screenShake(3, 80);
      }
    }

    if (this.hp <= 0) {
      this.knockDown();
    }
  }

  knockDown() {
    this.state = 'knocked_down';
    this.attackActive = false;
    this.deactivateAttackBox();

    this.physBody.body.setVelocityX(this.facingRight ? -150 : 150);
    this.physBody.body.setVelocityY(-200);

    this.invincible = true;
    this.scene.time.delayedCall(1000, () => {
      this.invincible = false;
    });
  }

  createProjectile(offX, offY, velX, velY, width, height, color, damage, lifetime = 2000) {
    const x = this.physBody.x + offX;
    const y = this.physBody.y + offY;

    const proj = this.scene.add.rectangle(x, y, width, height, color);
    proj.setDepth(15);
    this.scene.physics.add.existing(proj);
    proj.body.setAllowGravity(false);
    proj.body.setVelocity(velX, velY);
    proj.damage = damage;
    proj.owner = this;
    proj.lifetime = lifetime;
    proj.elapsed = 0;
    this.projectiles.push(proj);
    return proj;
  }

  updateProjectiles(delta) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.elapsed += delta;
      if (proj.elapsed > proj.lifetime || proj.x < -50 || proj.x > 850 || proj.y < -50 || proj.y > 500) {
        proj.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  playAttackAnimation(type) {
    // Override in subclass
  }

  updateVisual() {
    // Override in subclass
  }

  resetVisual() {
    // Override in subclass
  }

  reset(x, y) {
    this.hp = this.maxHp;
    this.state = 'idle';
    this.hitStun = 0;
    this.attackActive = false;
    this.invincible = false;
    this.special1Cooldown = 0;
    this.special2Cooldown = 0;
    this.physBody.x = x;
    this.physBody.y = y;
    this.physBody.body.setVelocity(0, 0);
    this.container.x = x;
    this.container.y = y;
    this.deactivateAttackBox();
    this.atkVisual.setVisible(false);
    this.atkVisual.clear();
    this.resetVisual();

    this.projectiles.forEach(p => p.destroy());
    this.projectiles = [];
  }

  destroy() {
    this.container.destroy();
    this.physBody.destroy();
    this.attackBox.destroy();
    this.atkVisual.destroy();
    this.projectiles.forEach(p => p.destroy());
    this.projectiles = [];
  }
}
