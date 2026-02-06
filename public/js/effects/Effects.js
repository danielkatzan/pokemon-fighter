class Effects {
  constructor(scene) {
    this.scene = scene;
  }

  screenShake(intensity = 5, duration = 100) {
    this.scene.cameras.main.shake(duration, intensity / 1000);
  }

  hitFlash(target) {
    if (!target || !target.container) return;
    const children = target.container.list;
    const origTints = [];
    children.forEach((child, i) => {
      if (child.setTint) {
        origTints[i] = child.tintTopLeft;
        child.setTint(0xffffff);
      }
    });
    this.scene.time.delayedCall(80, () => {
      children.forEach((child, i) => {
        if (child.setTint) {
          child.clearTint();
        }
      });
    });
  }

  hitSpark(x, y, color = 0xffff00, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 150;
      const size = 2 + Math.random() * 4;

      const particle = this.scene.add.circle(x, y, size, color);
      particle.setAlpha(1);
      particle.setDepth(100);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed * 0.3,
        y: y + Math.sin(angle) * speed * 0.3,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 200 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  electricSpark(x, y) {
    this.hitSpark(x, y, 0xffff00, 12);
    // Add lightning bolt lines
    for (let i = 0; i < 3; i++) {
      const graphics = this.scene.add.graphics();
      graphics.setDepth(100);
      graphics.lineStyle(2, 0xffff00, 1);
      graphics.beginPath();
      let px = x, py = y;
      graphics.moveTo(px, py);
      for (let j = 0; j < 4; j++) {
        px += (Math.random() - 0.5) * 30;
        py += (Math.random() - 0.5) * 30;
        graphics.lineTo(px, py);
      }
      graphics.strokePath();
      this.scene.tweens.add({
        targets: graphics,
        alpha: 0,
        duration: 150,
        onComplete: () => graphics.destroy()
      });
    }
  }

  fireSpark(x, y) {
    const colors = [0xff4400, 0xff8800, 0xffaa00, 0xff6600];
    for (let i = 0; i < 10; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const particle = this.scene.add.circle(x, y, 2 + Math.random() * 4, color);
      particle.setDepth(100);

      this.scene.tweens.add({
        targets: particle,
        x: x + (Math.random() - 0.5) * 60,
        y: y - 20 - Math.random() * 40,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  leafSpark(x, y) {
    const colors = [0x00cc44, 0x44dd44, 0x88ee44];
    for (let i = 0; i < 8; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const leaf = this.scene.add.ellipse(x, y, 6, 3, color);
      leaf.setDepth(100);
      leaf.setRotation(Math.random() * Math.PI);

      const angle = Math.random() * Math.PI * 2;
      this.scene.tweens.add({
        targets: leaf,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        rotation: leaf.rotation + Math.PI * 2,
        alpha: 0,
        duration: 400 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => leaf.destroy()
      });
    }
  }

  waterSpark(x, y) {
    const colors = [0x4488ff, 0x66aaff, 0x88ccff];
    for (let i = 0; i < 10; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const drop = this.scene.add.circle(x, y, 2 + Math.random() * 3, color);
      drop.setDepth(100);

      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 80 + Math.random() * 120;
      this.scene.tweens.add({
        targets: drop,
        x: x + Math.cos(angle) * speed * 0.4,
        y: y + Math.sin(angle) * speed * 0.4 + 30,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 300 + Math.random() * 200,
        ease: 'Power1',
        onComplete: () => drop.destroy()
      });
    }
  }

  fairySpark(x, y) {
    const colors = [0xff88cc, 0xffaadd, 0xffccee, 0xffaaff];
    for (let i = 0; i < 10; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const star = this.scene.add.star(x, y, 4, 2, 5, color);
      star.setDepth(100);
      star.setRotation(Math.random() * Math.PI);

      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 30;
      this.scene.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        rotation: star.rotation + Math.PI * 2,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 350 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => star.destroy()
      });
    }
  }

  dustLanding(x, y) {
    for (let i = 0; i < 6; i++) {
      const particle = this.scene.add.circle(x + (Math.random() - 0.5) * 20, y, 2 + Math.random() * 3, 0xccbb99);
      particle.setAlpha(0.6);
      particle.setDepth(5);

      this.scene.tweens.add({
        targets: particle,
        x: particle.x + (Math.random() - 0.5) * 40,
        y: particle.y - 5 - Math.random() * 15,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  koSlowMo(callback) {
    this.scene.time.timeScale = 0.3;
    this.scene.physics.world.timeScale = 3.33;
    this.screenShake(10, 400);

    // Use real setTimeout to avoid timeScale affecting the delay
    setTimeout(() => {
      if (this.scene && this.scene.time) {
        this.scene.time.timeScale = 1;
        this.scene.physics.world.timeScale = 1;
      }
      if (callback) callback();
    }, 600);
  }

  announcement(text, size = 48, duration = 1500) {
    const txt = this.scene.add.text(400, 200, text, {
      fontSize: `${size}px`,
      fontFamily: 'Arial Black, Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 5, fill: true }
    }).setOrigin(0.5).setDepth(200).setScale(0);

    this.scene.tweens.add({
      targets: txt,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: txt,
          alpha: 0,
          y: txt.y - 30,
          delay: duration - 400,
          duration: 400,
          onComplete: () => txt.destroy()
        });
      }
    });

    return txt;
  }

  dashTrail(fighter) {
    if (!fighter || !fighter.container) return;
    const ghost = this.scene.add.circle(fighter.container.x, fighter.container.y - 30, 15, fighter.color || 0xffffff);
    ghost.setAlpha(0.3);
    ghost.setDepth(1);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => ghost.destroy()
    });
  }
}
