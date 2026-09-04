// High performance HTML5 Canvas engine for floating stars and celebratory confetti

export class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.confetti = [];
    this.isCelebrationActive = false;
    this.themeAccent = '#f59e0b';
    this.animId = null;
    this.lastTime = performance.now();

    this.resize();
    this.initStars(80);
    this.bindEvents();
    this.start();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initStars(Math.floor(this.width / 15));
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.animId) cancelAnimationFrame(this.animId);
      } else {
        this.lastTime = performance.now();
        this.start();
      }
    });
  }

  initStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        driftY: Math.random() * 0.2 - 0.1,
        driftX: Math.random() * 0.2 - 0.1
      });
    }
  }

  setTheme(accentColor) {
    this.themeAccent = accentColor;
  }

  startCelebration() {
    this.isCelebrationActive = true;
    this.confetti = [];
    // Initial celebration blast from both sides & center
    this.burst(this.width * 0.2, this.height * 0.4, 70);
    this.burst(this.width * 0.8, this.height * 0.4, 70);
    this.burst(this.width * 0.5, this.height * 0.3, 100);
  }

  stopCelebration() {
    this.isCelebrationActive = false;
    this.confetti = [];
  }

  burst(originX, originY, count = 50) {
    const defaultPalette = [
      this.themeAccent,
      '#f59e0b',
      '#ec4899',
      '#8b5cf6',
      '#38bdf8',
      '#10b981',
      '#fbbf24',
      '#ffffff'
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 8 + 3;
      const color = defaultPalette[Math.floor(Math.random() * defaultPalette.length)];

      this.confetti.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - Math.random() * 4,
        size: Math.random() * 7 + 4,
        color: color,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        life: 1,
        decay: Math.random() * 0.008 + 0.004,
        type: Math.random() > 0.4 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'star'),
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05
      });
    }
  }

  addStreamConfetti() {
    if (!this.isCelebrationActive) return;
    // Continuously drop gentle confetti ribbons from top
    if (this.confetti.length < 180 && Math.random() < 0.6) {
      const defaultPalette = [
        this.themeAccent,
        '#f59e0b',
        '#ec4899',
        '#8b5cf6',
        '#38bdf8',
        '#10b981',
        '#ffffff'
      ];
      this.confetti.push({
        x: Math.random() * this.width,
        y: -20,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2.5 + 1.5,
        size: Math.random() * 8 + 5,
        color: defaultPalette[Math.floor(Math.random() * defaultPalette.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        life: 1,
        decay: 0.002,
        type: Math.random() > 0.3 ? 'rect' : 'circle',
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.08 + 0.03
      });
    }
  }

  update(dt) {
    // Update stars
    for (let star of this.stars) {
      star.twinklePhase += star.twinkleSpeed;
      star.x += star.driftX;
      star.y += star.driftY;
      if (star.x < 0) star.x = this.width;
      if (star.x > this.width) star.x = 0;
      if (star.y < 0) star.y = this.height;
      if (star.y > this.height) star.y = 0;
    }

    // Update confetti
    this.addStreamConfetti();

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const p = this.confetti[i];
      p.x += p.vx + Math.sin(p.wobble) * 1.5;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.vx *= 0.99; // drag
      p.rotation += p.vRot;
      p.wobble += p.wobbleSpeed;
      p.life -= p.decay;

      if (p.y > this.height + 40 || p.life <= 0) {
        this.confetti.splice(i, 1);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw ambient floating stars
    for (let star of this.stars) {
      const alpha = star.alpha * (0.6 + 0.4 * Math.sin(star.twinklePhase));
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Subtle glow for larger stars
      if (star.size > 1.8) {
        this.ctx.fillStyle = `rgba(255, 235, 180, ${alpha * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Draw confetti particles
    for (let p of this.confetti) {
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.fillStyle = p.color;

      if (p.type === 'rect') {
        const aspect = Math.cos(p.wobble);
        this.ctx.fillRect(-p.size / 2, (-p.size * aspect) / 2, p.size, p.size * aspect);
      } else if (p.type === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Draw 5-pointed star
        this.drawStar(0, 0, 5, p.size, p.size / 2);
      }

      this.ctx.restore();
    }
  }

  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    this.ctx.lineTo(cx, cy - outerRadius);
    this.ctx.closePath();
    this.ctx.fill();
  }

  start() {
    const loop = (time) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;
      this.update(dt);
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }
}
