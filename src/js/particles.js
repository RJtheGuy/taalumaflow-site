/**
 * particles.js
 * Animated background canvas — floating dots with mouse repulsion
 * and connection lines. Self-initialises on DOMContentLoaded.
 */

export function initParticles(canvasId = 'bg-canvas') {
  const c = document.getElementById(canvasId);
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts = [];
  const mouse = { x: -999, y: -999 };

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.25;
    this.vy = (Math.random() - 0.5) * 0.25;
    this.r  = Math.random() * 1.4 + 0.3;
    this.a  = Math.random() * 0.5 + 0.1;
    const rnd = Math.random();
    this.col = rnd > 0.6 ? '155,93,229' : rnd > 0.3 ? '79,142,247' : '220,228,255';
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.col},${this.a})`;
    ctx.fill();
  };

  function init() {
    resize();
    pts = [];
    const n = Math.min(Math.floor(W * H / 14000), 120);
    for (let i = 0; i < n; i++) pts.push(new Particle());
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      // Draw connections
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(79,142,247,${(1 - d / 110) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      // Mouse repulsion
      const mx = p.x - mouse.x, my = p.y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < 100) {
        p.vx += (mx / md) * 0.012;
        p.vy += (my / md) * 0.012;
        const spd = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        if (spd > 1) { p.vx /= spd; p.vy /= spd; }
      }
      p.update();
      p.draw();
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  init();
  frame();
}
