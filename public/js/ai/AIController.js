class AIController {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.reactionDelay = difficulty === 'easy' ? 300 : difficulty === 'hard' ? 150 : 220;
    this.lastDecisionTime = 0;
    this.preferredDistance = 90; // Sweet spot — close enough to attack, not overlapping
    this.inputs = {
      left: false, right: false, up: false, down: false,
      punch: false, kick: false, sp1: false, sp2: false
    };
  }

  update(aiFighter, playerFighter, time, delta) {
    // Clear one-shot inputs
    this.inputs.punch = false;
    this.inputs.kick = false;
    this.inputs.sp1 = false;
    this.inputs.sp2 = false;

    // Wait for reaction delay
    if (time - this.lastDecisionTime < this.reactionDelay + Math.random() * 100) {
      return this.inputs;
    }
    this.lastDecisionTime = time;

    const ai = aiFighter;
    const player = playerFighter;

    const dx = player.physBody.x - ai.physBody.x;
    const distance = Math.abs(dx);
    const facingPlayer = (dx > 0 && ai.facingRight) || (dx < 0 && !ai.facingRight);
    const hpRatio = ai.hp / ai.maxHp;

    // Reset movement
    this.inputs.left = false;
    this.inputs.right = false;
    this.inputs.up = false;
    this.inputs.down = false;

    // Too close — back off first
    if (distance < 50) {
      this.tooCloseBehavior(ai, player, dx, hpRatio);
    } else if (distance < 100) {
      // Strike range — attack or hold position
      this.strikeRangeBehavior(ai, player, dx, facingPlayer, hpRatio);
    } else if (distance < 200) {
      // Medium range — use specials or close in
      this.mediumRangeBehavior(ai, player, dx, facingPlayer, hpRatio);
    } else {
      // Far range — approach
      this.farRangeBehavior(ai, player, dx, facingPlayer, hpRatio);
    }

    // Jump over projectiles
    if (this.shouldDodgeProjectile(ai, player)) {
      this.inputs.up = true;
    }

    return this.inputs;
  }

  tooCloseBehavior(ai, player, dx, hpRatio) {
    const rand = Math.random();

    // Back away most of the time
    if (rand < 0.55) {
      this.inputs.left = dx > 0;
      this.inputs.right = dx < 0;
    } else if (rand < 0.75) {
      // Quick attack then retreat
      this.inputs.punch = true;
    } else if (rand < 0.9) {
      this.inputs.kick = true;
    } else {
      // Jump away
      this.inputs.up = true;
      this.inputs.left = dx > 0;
      this.inputs.right = dx < 0;
    }
  }

  strikeRangeBehavior(ai, player, dx, facingPlayer, hpRatio) {
    const rand = Math.random();

    // Block if player is attacking
    if (player.attackActive && rand < 0.4) {
      this.inputs.left = dx > 0;
      this.inputs.right = dx < 0;
      return;
    }

    if (facingPlayer) {
      if (rand < 0.25) {
        this.inputs.punch = true;
      } else if (rand < 0.45) {
        this.inputs.kick = true;
      } else if (rand < 0.6 && ai.special1Cooldown <= 0) {
        this.inputs.sp1 = true;
      } else if (rand < 0.7 && ai.special2Cooldown <= 0) {
        this.inputs.sp2 = true;
      } else if (rand < 0.85) {
        // Hold position / wait — don't move
      } else {
        // Back off a bit
        this.inputs.left = dx > 0;
        this.inputs.right = dx < 0;
      }
    } else {
      // Turn to face
      this.inputs.left = dx < 0;
      this.inputs.right = dx > 0;
    }

    // Low HP — more defensive, back away more often
    if (hpRatio < 0.3 && Math.random() < 0.5) {
      this.inputs.left = dx > 0;
      this.inputs.right = dx < 0;
      this.inputs.punch = false;
      this.inputs.kick = false;
    }
  }

  mediumRangeBehavior(ai, player, dx, facingPlayer, hpRatio) {
    const rand = Math.random();

    if (rand < 0.35 && ai.special1Cooldown <= 0) {
      this.inputs.sp1 = true;
    } else if (rand < 0.5 && ai.special2Cooldown <= 0) {
      this.inputs.sp2 = true;
    } else if (rand < 0.7) {
      // Approach slowly toward preferred distance
      this.inputs.left = dx < 0;
      this.inputs.right = dx > 0;
    } else if (rand < 0.85) {
      // Hold position
    } else {
      // Jump approach
      this.inputs.up = true;
      this.inputs.left = dx < 0;
      this.inputs.right = dx > 0;
    }
  }

  farRangeBehavior(ai, player, dx, facingPlayer, hpRatio) {
    const rand = Math.random();

    if (rand < 0.25 && ai.special1Cooldown <= 0) {
      this.inputs.sp1 = true;
    } else if (rand < 0.4 && ai.special2Cooldown <= 0) {
      this.inputs.sp2 = true;
    } else if (rand < 0.8) {
      // Approach
      this.inputs.left = dx < 0;
      this.inputs.right = dx > 0;
    } else {
      // Hold / pause approach
      if (Math.random() < 0.3) {
        this.inputs.up = true;
      }
    }
  }

  shouldDodgeProjectile(ai, player) {
    for (const proj of player.projectiles) {
      const dx = proj.x - ai.physBody.x;
      const distance = Math.abs(dx);
      if (distance < 100 && distance > 20) {
        const movingTowards = (proj.body.velocity.x > 0 && dx < 0) ||
                              (proj.body.velocity.x < 0 && dx > 0);
        if (movingTowards && Math.random() < 0.6) {
          return true;
        }
      }
    }
    return false;
  }
}
