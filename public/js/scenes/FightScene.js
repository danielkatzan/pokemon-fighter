class FightScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FightScene' });
  }

  init(data) {
    this.gameMode = data.mode || 'vs_cpu';
    this.p1Character = data.p1Character || 'Pikachu';
    this.p2Character = data.p2Character || 'Charmander';
    this.roundTime = 90;
    this.timer = this.roundTime;
    this.currentRound = 1;
    this.maxRounds = 3; // Best of 3 (first to 2 wins)
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.roundActive = false;
    this.frameCount = 0;
    this.p1DamageDealt = 0;
    this.p2DamageDealt = 0;
    this.p1SpecialsUsed = 0;
    this.p2SpecialsUsed = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Set world bounds
    this.physics.world.setBounds(0, 0, width, height);

    // Draw stage background
    this.drawStage();

    // Ground
    this.ground = this.add.rectangle(width / 2, height - 15, width, 30, 0x554433);
    this.physics.add.existing(this.ground, true); // Static

    // Create fighters
    this.fighter1 = this.createFighter(this.p1Character, 200, height - 65);
    this.fighter2 = this.createFighter(this.p2Character, 600, height - 65);
    this.fighter1.setFacing(true);
    this.fighter2.setFacing(false);

    // Physics: fighters stand on ground
    this.physics.add.collider(this.fighter1.physBody, this.ground);
    this.physics.add.collider(this.fighter2.physBody, this.ground);

    // Effects system
    this.effects = new Effects(this);

    // HUD
    this.hud = new HUD(this);
    this.hud.create(this.fighter1, this.fighter2);

    // Input
    this.setupInputs();

    // AI controller
    if (this.gameMode === 'vs_cpu') {
      this.aiController = new AIController('medium');
    }

    // Online mode
    if (this.gameMode === 'online') {
      this.setupNetworking();
    }

    // Start first round
    this.time.delayedCall(500, () => this.startRound());
  }

  drawStage() {
    const { width, height } = this.cameras.main;
    const bg = this.add.graphics();

    // Sky gradient
    bg.fillGradientStyle(0x4488cc, 0x4488cc, 0x88ccff, 0x88ccff, 1);
    bg.fillRect(0, 0, width, height - 30);

    // Clouds
    for (let i = 0; i < 5; i++) {
      const cx = 80 + i * 170 + Math.random() * 40;
      const cy = 30 + Math.random() * 60;
      bg.fillStyle(0xffffff, 0.4);
      bg.fillEllipse(cx, cy, 60 + Math.random() * 40, 20 + Math.random() * 15);
      bg.fillEllipse(cx + 20, cy - 8, 40, 20);
      bg.fillEllipse(cx - 15, cy + 5, 35, 15);
    }

    // Mountains (background)
    bg.fillStyle(0x557799, 0.5);
    bg.beginPath();
    bg.moveTo(0, height - 80);
    bg.lineTo(100, height - 160);
    bg.lineTo(200, height - 100);
    bg.lineTo(350, height - 190);
    bg.lineTo(500, height - 120);
    bg.lineTo(600, height - 170);
    bg.lineTo(750, height - 110);
    bg.lineTo(800, height - 150);
    bg.lineTo(800, height - 30);
    bg.lineTo(0, height - 30);
    bg.closePath();
    bg.fillPath();

    // Trees
    bg.fillStyle(0x336644, 0.4);
    for (let i = 0; i < 8; i++) {
      const tx = 30 + i * 105;
      const ty = height - 60;
      bg.fillTriangle(tx, ty, tx + 15, ty - 30, tx + 30, ty);
      bg.fillTriangle(tx + 3, ty - 15, tx + 15, ty - 40, tx + 27, ty - 15);
    }

    // Arena floor
    bg.fillStyle(0x665544);
    bg.fillRect(0, height - 30, width, 30);

    // Floor line details
    bg.lineStyle(1, 0x776655);
    for (let i = 0; i < width; i += 40) {
      bg.beginPath();
      bg.moveTo(i, height - 30);
      bg.lineTo(i + 20, height);
      bg.strokePath();
    }

    // Arena edges
    bg.fillStyle(0x887766);
    bg.fillRect(0, height - 32, width, 4);

    bg.setDepth(0);
  }

  createFighter(name, x, y) {
    switch (name) {
      case 'Pikachu': return new Pikachu(this, x, y);
      case 'Charmander': return new Charmander(this, x, y);
      case 'Bulbasaur': return new Bulbasaur(this, x, y);
      case 'Squirtle': return new Squirtle(this, x, y);
      case 'Togepi': return new Togepi(this, x, y);
      default: return new Pikachu(this, x, y);
    }
  }

  setupInputs() {
    // P1 keys
    this.p1Keys = this.input.keyboard.addKeys({
      up: 'W', down: 'S', left: 'A', right: 'D',
      punch: 'F', kick: 'G', sp1: 'Q', sp2: 'E'
    });

    // P2 keys (local)
    this.p2Keys = this.input.keyboard.addKeys({
      up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT',
      punch: 'K', kick: 'L', sp1: 'I', sp2: 'O'
    });

    // Track key-down events for one-shot actions
    this.p1Pressed = {};
    this.p2Pressed = {};
  }

  getP1Inputs() {
    const inputs = {
      left: this.p1Keys.left.isDown,
      right: this.p1Keys.right.isDown,
      up: this.p1Keys.up.isDown,
      down: this.p1Keys.down.isDown,
      punch: Phaser.Input.Keyboard.JustDown(this.p1Keys.punch),
      kick: Phaser.Input.Keyboard.JustDown(this.p1Keys.kick),
      sp1: Phaser.Input.Keyboard.JustDown(this.p1Keys.sp1),
      sp2: Phaser.Input.Keyboard.JustDown(this.p1Keys.sp2)
    };
    return inputs;
  }

  getP2Inputs() {
    const inputs = {
      left: this.p2Keys.left.isDown,
      right: this.p2Keys.right.isDown,
      up: this.p2Keys.up.isDown,
      down: this.p2Keys.down.isDown,
      punch: Phaser.Input.Keyboard.JustDown(this.p2Keys.punch),
      kick: Phaser.Input.Keyboard.JustDown(this.p2Keys.kick),
      sp1: Phaser.Input.Keyboard.JustDown(this.p2Keys.sp1),
      sp2: Phaser.Input.Keyboard.JustDown(this.p2Keys.sp2)
    };
    return inputs;
  }

  setupNetworking() {
    this.opponentInputs = {
      left: false, right: false, up: false, down: false,
      punch: false, kick: false, sp1: false, sp2: false
    };

    // Buffer one-shot inputs so they aren't lost between frames
    this.opponentOneShotBuffer = {
      punch: false, kick: false, sp1: false, sp2: false
    };

    networkManager.on('opponent_input', (data) => {
      // Continuous inputs (held keys) - overwrite directly
      this.opponentInputs.left = data.inputs.left;
      this.opponentInputs.right = data.inputs.right;
      this.opponentInputs.up = data.inputs.up;
      this.opponentInputs.down = data.inputs.down;

      // One-shot inputs - buffer them so they survive until consumed
      if (data.inputs.punch) this.opponentOneShotBuffer.punch = true;
      if (data.inputs.kick) this.opponentOneShotBuffer.kick = true;
      if (data.inputs.sp1) this.opponentOneShotBuffer.sp1 = true;
      if (data.inputs.sp2) this.opponentOneShotBuffer.sp2 = true;
    });

    networkManager.on('opponent_disconnected', () => {
      this.roundActive = false;
      this.effects.announcement('OPPONENT\nDISCONNECTED', 32, 3000);
      this.time.delayedCall(3000, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  consumeOpponentInputs() {
    // Merge buffered one-shot inputs into the current frame
    this.opponentInputs.punch = this.opponentOneShotBuffer.punch;
    this.opponentInputs.kick = this.opponentOneShotBuffer.kick;
    this.opponentInputs.sp1 = this.opponentOneShotBuffer.sp1;
    this.opponentInputs.sp2 = this.opponentOneShotBuffer.sp2;

    // Clear the buffer - each one-shot action fires only once
    this.opponentOneShotBuffer.punch = false;
    this.opponentOneShotBuffer.kick = false;
    this.opponentOneShotBuffer.sp1 = false;
    this.opponentOneShotBuffer.sp2 = false;

    return this.opponentInputs;
  }

  startRound() {
    // Reset fighters
    this.fighter1.reset(200, this.cameras.main.height - 65);
    this.fighter2.reset(600, this.cameras.main.height - 65);
    this.fighter1.setFacing(true);
    this.fighter2.setFacing(false);

    this.timer = this.roundTime;
    this.roundActive = false;

    // Round announcement
    this.effects.announcement(`ROUND ${this.currentRound}`, 42, 1200);
    this.time.delayedCall(1500, () => {
      this.effects.announcement('FIGHT!', 52, 800);
      this.time.delayedCall(300, () => {
        this.roundActive = true;
      });
    });
  }

  update(time, delta) {
    if (!this.roundActive) return;

    this.frameCount++;

    // Timer
    this.timer -= delta / 1000;
    if (this.timer <= 0) {
      this.timer = 0;
      this.endRound();
      return;
    }

    // Get inputs
    let p1Inputs, p2Inputs;

    if (this.gameMode === 'online') {
      const myInputs = this.getP1Inputs(); // Both players use WASD in online
      const theirInputs = this.consumeOpponentInputs();
      networkManager.sendInput(this.frameCount, myInputs);

      if (networkManager.playerNumber === 1) {
        p1Inputs = myInputs;
        p2Inputs = theirInputs;
      } else {
        p1Inputs = theirInputs;
        p2Inputs = myInputs;
      }
    } else if (this.gameMode === 'local_2p') {
      p1Inputs = this.getP1Inputs();
      p2Inputs = this.getP2Inputs();
    } else {
      // vs CPU
      p1Inputs = this.getP1Inputs();
      p2Inputs = this.aiController.update(this.fighter2, this.fighter1, time, delta);
    }

    // Update facing (face each other) — deadzone so they don't flip when overlapping
    const dx = this.fighter2.physBody.x - this.fighter1.physBody.x;
    if (Math.abs(dx) > 8) {
      // Only update facing when there's a clear gap
      this.fighter1.setFacing(dx > 0);
      this.fighter2.setFacing(dx < 0);
    }
    // When overlapping (|dx| <= 8), keep previous facing — avoids blocking lock

    // Push apart when too close — fighters can't overlap
    const minGap = 45;
    if (Math.abs(dx) < minGap) {
      const overlap = minGap - Math.abs(dx);
      const dir = dx >= 0 ? 1 : -1;
      // Hard push: immediately separate by half the overlap each
      this.fighter1.physBody.x -= dir * overlap * 0.5;
      this.fighter2.physBody.x += dir * overlap * 0.5;
      // Also kill any velocity pushing them together
      const v1 = this.fighter1.physBody.body.velocity.x;
      const v2 = this.fighter2.physBody.body.velocity.x;
      if (dir > 0 && v1 > 0) this.fighter1.physBody.body.velocity.x = 0;
      if (dir > 0 && v2 < 0) this.fighter2.physBody.body.velocity.x = 0;
      if (dir < 0 && v1 < 0) this.fighter1.physBody.body.velocity.x = 0;
      if (dir < 0 && v2 > 0) this.fighter2.physBody.body.velocity.x = 0;
    }

    // Update fighters
    this.fighter1.update(p1Inputs, time, delta);
    this.fighter2.update(p2Inputs, time, delta);

    // Check melee attack collisions
    this.checkAttackCollision(this.fighter1, this.fighter2);
    this.checkAttackCollision(this.fighter2, this.fighter1);

    // Check projectile collisions
    this.checkProjectileCollisions(this.fighter1, this.fighter2);
    this.checkProjectileCollisions(this.fighter2, this.fighter1);

    // Update HUD
    this.hud.update(this.timer);
    this.hud.setRoundWins(this.p1Wins, this.p2Wins);

    // Check KO
    if (this.fighter1.hp <= 0 || this.fighter2.hp <= 0) {
      this.endRound();
    }
  }

  checkAttackCollision(attacker, defender) {
    if (!attacker.attackActive || attacker.attackHit) return;
    if (defender.invincible) return;

    const atkBox = attacker.attackBox;
    if (!atkBox.body.enable) return;

    // Manual overlap check
    const aLeft = atkBox.x - atkBox.displayWidth / 2;
    const aRight = atkBox.x + atkBox.displayWidth / 2;
    const aTop = atkBox.y - atkBox.displayHeight / 2;
    const aBottom = atkBox.y + atkBox.displayHeight / 2;

    const dLeft = defender.physBody.x - 20;
    const dRight = defender.physBody.x + 20;
    const dTop = defender.physBody.y - 35;
    const dBottom = defender.physBody.y + 35;

    if (aLeft < dRight && aRight > dLeft && aTop < dBottom && aBottom > dTop) {
      // Hit!
      attacker.attackHit = true;
      const damage = attacker.getDamage();
      const knockback = attacker.getKnockback();
      const direction = attacker.facingRight ? 1 : -1;

      // Track stats
      if (attacker === this.fighter1) {
        this.p1DamageDealt += damage;
        if (attacker.currentAttack === 'special1' || attacker.currentAttack === 'special2') {
          this.p1SpecialsUsed++;
        }
      } else {
        this.p2DamageDealt += damage;
        if (attacker.currentAttack === 'special1' || attacker.currentAttack === 'special2') {
          this.p2SpecialsUsed++;
        }
      }

      defender.takeDamage(damage, knockback, direction);

      // Hit effects based on attack type
      const hitX = (attacker.physBody.x + defender.physBody.x) / 2;
      const hitY = (attacker.physBody.y + defender.physBody.y) / 2 - 10;

      if (attacker.currentAttack === 'special1' || attacker.currentAttack === 'special2') {
        // Type-specific effects
        if (attacker instanceof Pikachu) this.effects.electricSpark(hitX, hitY);
        else if (attacker instanceof Charmander) this.effects.fireSpark(hitX, hitY);
        else if (attacker instanceof Bulbasaur) this.effects.leafSpark(hitX, hitY);
        else if (attacker instanceof Squirtle) this.effects.waterSpark(hitX, hitY);
        else if (attacker instanceof Togepi) this.effects.fairySpark(hitX, hitY);
      } else {
        // Melee hit - big visible impact
        this.effects.hitSpark(hitX, hitY, 0xffffff, 10);
        this.effects.hitSpark(hitX, hitY, 0xffff44, 6);
        this.effects.screenShake(5, 80);

        // Impact flash circle
        const impactFlash = this.add.circle(hitX, hitY, 15, 0xffffff, 0.7).setDepth(100);
        this.tweens.add({
          targets: impactFlash,
          alpha: 0, scaleX: 2.5, scaleY: 2.5,
          duration: 150,
          onComplete: () => impactFlash.destroy()
        });
      }

      // Hitstop - use real setTimeout to avoid timeScale issues
      this.time.timeScale = 0.1;
      setTimeout(() => {
        if (this.time) this.time.timeScale = 1;
      }, 100);
    }
  }

  checkProjectileCollisions(shooter, target) {
    for (let i = shooter.projectiles.length - 1; i >= 0; i--) {
      const proj = shooter.projectiles[i];
      if (target.invincible) continue;

      const pLeft = proj.x - proj.displayWidth / 2;
      const pRight = proj.x + proj.displayWidth / 2;
      const pTop = proj.y - proj.displayHeight / 2;
      const pBottom = proj.y + proj.displayHeight / 2;

      const tLeft = target.physBody.x - 20;
      const tRight = target.physBody.x + 20;
      const tTop = target.physBody.y - 35;
      const tBottom = target.physBody.y + 35;

      if (pLeft < tRight && pRight > tLeft && pTop < tBottom && pBottom > tTop) {
        const direction = proj.body.velocity.x > 0 ? 1 : -1;

        // Track stats
        if (shooter === this.fighter1) {
          this.p1DamageDealt += proj.damage;
          this.p1SpecialsUsed++;
        } else {
          this.p2DamageDealt += proj.damage;
          this.p2SpecialsUsed++;
        }

        target.takeDamage(proj.damage, 120, direction);

        // Effect
        if (shooter instanceof Pikachu) this.effects.electricSpark(proj.x, proj.y);
        else if (shooter instanceof Charmander) this.effects.fireSpark(proj.x, proj.y);
        else if (shooter instanceof Bulbasaur) this.effects.leafSpark(proj.x, proj.y);
        else if (shooter instanceof Squirtle) this.effects.waterSpark(proj.x, proj.y);
        else if (shooter instanceof Togepi) {
          const fn = proj.effectType && this.effects[proj.effectType]
            ? proj.effectType : 'fairySpark';
          this.effects[fn](proj.x, proj.y);
        }

        proj.destroy();
        shooter.projectiles.splice(i, 1);
      }
    }
  }

  endRound() {
    this.roundActive = false;

    let winner;
    if (this.fighter1.hp <= 0 && this.fighter2.hp > 0) {
      winner = 2;
    } else if (this.fighter2.hp <= 0 && this.fighter1.hp > 0) {
      winner = 1;
    } else if (this.fighter1.hp > this.fighter2.hp) {
      winner = 1;
    } else if (this.fighter2.hp > this.fighter1.hp) {
      winner = 2;
    } else {
      winner = 0; // Draw
    }

    if (winner === 1) this.p1Wins++;
    else if (winner === 2) this.p2Wins++;

    // KO effect
    if (this.fighter1.hp <= 0 || this.fighter2.hp <= 0) {
      this.effects.koSlowMo(() => {
        this.showRoundResult(winner);
      });
      this.effects.announcement('K.O.!', 56, 1200);
    } else {
      this.effects.announcement('TIME!', 48, 1200);
      this.time.delayedCall(1500, () => this.showRoundResult(winner));
    }
  }

  showRoundResult(winner) {
    const winnerText = winner === 0 ? 'DRAW!' :
      winner === 1 ? `${this.fighter1.name.toUpperCase()} WINS!` :
      `${this.fighter2.name.toUpperCase()} WINS!`;

    this.effects.announcement(winnerText, 36, 1500);

    // Check match over
    this.time.delayedCall(2000, () => {
      if (this.p1Wins >= 2 || this.p2Wins >= 2) {
        this.endMatch();
      } else {
        this.currentRound++;
        this.startRound();
      }
    });
  }

  endMatch() {
    const matchWinner = this.p1Wins >= 2 ? 1 : 2;
    const winnerName = matchWinner === 1 ? this.fighter1.name : this.fighter2.name;

    this.time.delayedCall(500, () => {
      this.hud.destroy();
      this.scene.start('GameOverScene', {
        mode: this.gameMode,
        winner: matchWinner,
        winnerName: winnerName,
        p1Character: this.p1Character,
        p2Character: this.p2Character,
        p1Wins: this.p1Wins,
        p2Wins: this.p2Wins,
        stats: {
          p1DamageDealt: Math.round(this.p1DamageDealt),
          p2DamageDealt: Math.round(this.p2DamageDealt),
          p1SpecialsUsed: this.p1SpecialsUsed,
          p2SpecialsUsed: this.p2SpecialsUsed,
          rounds: this.currentRound,
          time: Math.round(this.roundTime - this.timer)
        }
      });
    });
  }

  shutdown() {
    // Clean up network handlers so they don't fire into a dead scene
    if (this.gameMode === 'online') {
      networkManager.off('opponent_input');
      networkManager.off('opponent_disconnected');
    }
    if (this.fighter1) this.fighter1.destroy();
    if (this.fighter2) this.fighter2.destroy();
    if (this.hud) this.hud.destroy();
  }
}
