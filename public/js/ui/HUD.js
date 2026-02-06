class HUD {
  constructor(scene) {
    this.scene = scene;
    this.elements = [];
  }

  create(fighter1, fighter2) {
    this.fighter1 = fighter1;
    this.fighter2 = fighter2;

    // Health bar backgrounds
    this.p1BarBg = this.scene.add.rectangle(25, 20, 310, 24, 0x333333).setOrigin(0, 0).setDepth(150);
    this.p2BarBg = this.scene.add.rectangle(465, 20, 310, 24, 0x333333).setOrigin(0, 0).setDepth(150);

    // Health bars
    this.p1Bar = this.scene.add.rectangle(27, 22, 306, 20, 0x44cc44).setOrigin(0, 0).setDepth(151);
    this.p2Bar = this.scene.add.rectangle(467, 22, 306, 20, 0x44cc44).setOrigin(0, 0).setDepth(151);

    // Health bar borders
    this.p1Border = this.scene.add.rectangle(25, 20, 310, 24).setOrigin(0, 0).setDepth(152).setStrokeStyle(2, 0xffffff);
    this.p2Border = this.scene.add.rectangle(465, 20, 310, 24).setOrigin(0, 0).setDepth(152).setStrokeStyle(2, 0xffffff);

    // Names
    this.p1Name = this.scene.add.text(27, 6, fighter1.name.toUpperCase(), {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setDepth(152);

    this.p2Name = this.scene.add.text(773, 6, fighter2.name.toUpperCase(), {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(1, 0).setDepth(152);

    // HP text
    this.p1HpText = this.scene.add.text(180, 23, '', {
      fontSize: '13px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(153);

    this.p2HpText = this.scene.add.text(620, 23, '', {
      fontSize: '13px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5, 0).setDepth(153);

    // Timer
    this.timerBg = this.scene.add.circle(400, 32, 28, 0x222244).setDepth(150);
    this.timerBorder = this.scene.add.circle(400, 32, 28).setDepth(151).setStrokeStyle(3, 0xffcc00);
    this.timerText = this.scene.add.text(400, 32, '90', {
      fontSize: '22px', fontFamily: 'Arial Black', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(152);

    // Round indicators
    this.roundDots1 = [];
    this.roundDots2 = [];
    for (let i = 0; i < 3; i++) {
      const d1 = this.scene.add.circle(340 - i * 18, 32, 6, 0x444444).setDepth(151).setStrokeStyle(1, 0x888888);
      const d2 = this.scene.add.circle(460 + i * 18, 32, 6, 0x444444).setDepth(151).setStrokeStyle(1, 0x888888);
      this.roundDots1.push(d1);
      this.roundDots2.push(d2);
    }

    // Cooldown indicators for P1
    this.p1Sp1Cd = this.createCooldownIcon(30, 50, 'Q', fighter1.color || 0xffcc00);
    this.p1Sp2Cd = this.createCooldownIcon(56, 50, 'E', fighter1.color || 0xffcc00);

    // Cooldown indicators for P2
    this.p2Sp1Cd = this.createCooldownIcon(744, 50, 'I', fighter2.color || 0x4488ff);
    this.p2Sp2Cd = this.createCooldownIcon(770, 50, 'O', fighter2.color || 0x4488ff);

    this.elements = [
      this.p1BarBg, this.p2BarBg, this.p1Bar, this.p2Bar,
      this.p1Border, this.p2Border, this.p1Name, this.p2Name,
      this.p1HpText, this.p2HpText,
      this.timerBg, this.timerBorder, this.timerText,
      ...this.roundDots1, ...this.roundDots2
    ];
  }

  createCooldownIcon(x, y, label, color) {
    const bg = this.scene.add.circle(x, y, 10, 0x333333).setDepth(150);
    const fill = this.scene.add.circle(x, y, 9, color).setDepth(151).setAlpha(0.8);
    const border = this.scene.add.circle(x, y, 10).setDepth(152).setStrokeStyle(1, 0xffffff);
    const text = this.scene.add.text(x, y, label, {
      fontSize: '10px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(153);

    this.elements.push(bg, fill, border, text);
    return { bg, fill, border, text };
  }

  updateCooldownIcon(icon, currentCd, maxCd) {
    if (currentCd > 0) {
      const ratio = currentCd / maxCd;
      icon.fill.setAlpha(0.2);
      icon.fill.setScale(1 - ratio * 0.5);
    } else {
      icon.fill.setAlpha(0.8);
      icon.fill.setScale(1);
    }
  }

  update(timer) {
    if (!this.fighter1 || !this.fighter2) return;

    // Update health bars
    const p1Ratio = Math.max(0, this.fighter1.hp / this.fighter1.maxHp);
    const p2Ratio = Math.max(0, this.fighter2.hp / this.fighter2.maxHp);

    this.p1Bar.setDisplaySize(306 * p1Ratio, 20);
    this.p2Bar.setDisplaySize(306 * p2Ratio, 20);

    // Color gradient
    this.p1Bar.setFillStyle(this.getHealthColor(p1Ratio));
    this.p2Bar.setFillStyle(this.getHealthColor(p2Ratio));

    // HP text
    this.p1HpText.setText(`${Math.ceil(this.fighter1.hp)}/${this.fighter1.maxHp}`);
    this.p2HpText.setText(`${Math.ceil(this.fighter2.hp)}/${this.fighter2.maxHp}`);

    // Timer
    if (timer !== undefined) {
      this.timerText.setText(Math.ceil(timer).toString());
      if (timer <= 10) {
        this.timerText.setColor('#ff4444');
      }
    }

    // Cooldowns
    this.updateCooldownIcon(this.p1Sp1Cd, this.fighter1.special1Cooldown, this.fighter1.special1MaxCooldown);
    this.updateCooldownIcon(this.p1Sp2Cd, this.fighter1.special2Cooldown, this.fighter1.special2MaxCooldown);
    this.updateCooldownIcon(this.p2Sp1Cd, this.fighter2.special1Cooldown, this.fighter2.special1MaxCooldown);
    this.updateCooldownIcon(this.p2Sp2Cd, this.fighter2.special2Cooldown, this.fighter2.special2MaxCooldown);
  }

  getHealthColor(ratio) {
    if (ratio > 0.6) return 0x44cc44;
    if (ratio > 0.3) return 0xcccc44;
    return 0xcc4444;
  }

  setRoundWins(p1Wins, p2Wins) {
    for (let i = 0; i < p1Wins && i < 3; i++) {
      this.roundDots1[i].setFillStyle(0xffcc00);
    }
    for (let i = 0; i < p2Wins && i < 3; i++) {
      this.roundDots2[i].setFillStyle(0xffcc00);
    }
  }

  destroy() {
    this.elements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    // Destroy cooldown icon elements
    [this.p1Sp1Cd, this.p1Sp2Cd, this.p2Sp1Cd, this.p2Sp2Cd].forEach(icon => {
      if (icon) {
        if (icon.bg) icon.bg.destroy();
        if (icon.fill) icon.fill.destroy();
        if (icon.border) icon.border.destroy();
        if (icon.text) icon.text.destroy();
      }
    });
  }
}
