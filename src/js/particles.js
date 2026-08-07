/**
 * particles.js — Enhanced animated background
 * Layer 1: Slow aurora gradient waves (CSS-driven, GPU accelerated)
 * Layer 2: Particle field with connections (canvas)
 * Both respond to mouse position.
 */
export function initParticles(canvasId = 'bg-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const mouse = { x: -999, y: -999 };
  let mouseNorm = { x: 0.5, y: 0.5 };
  let time = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r  = Math.random() * 1.6 + 0.4;
    this.a  = Math.random() * 0.6 + 0.1;
    const rnd = Math.random();
    this.col = rnd > 0.65 ? '155,93,229'
             : rnd > 0.35 ? '79,142,247'
             :               '6,200,255';
  }

  Particle.prototype.update = function () {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) this.x = W; if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H; if (this.y > H) this.y = 0;
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.col},${this.a})`;
    ctx.fill();
  };

  function init() {
    resize(); pts = [];
    const n = Math.min(Math.floor(W * H / 10000), 160);
    for (let i = 0; i < n; i++) pts.push(new Particle());
  }

  function drawAurora() {
    // Draw 3 slow-moving gradient blobs that shift with mouse and time
    const blobs = [
      {
        x: W * (0.2 + mouseNorm.x * 0.3 + Math.sin(time * 0.4) * 0.1),
        y: H * (0.2 + mouseNorm.y * 0.2 + Math.cos(time * 0.3) * 0.1),
        r: W * 0.45,
        color: [37, 99, 235],    // blue
        alpha: 0.07,
      },
      {
        x: W * (0.7 + Math.cos(time * 0.35) * 0.12 - mouseNorm.x * 0.15),
        y: H * (0.3 + Math.sin(time * 0.28) * 0.12),
        r: W * 0.4,
        color: [155, 93, 229],   // purple
        alpha: 0.06,
      },
      {
        x: W * (0.5 + Math.sin(time * 0.25) * 0.2),
        y: H * (0.7 + Math.cos(time * 0.22) * 0.1 + mouseNorm.y * 0.1),
        r: W * 0.35,
        color: [6, 200, 255],    // cyan
        alpha: 0.04,
      },
    ];

    for (const blob of blobs) {
      const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
      grad.addColorStop(0, `rgba(${blob.color.join(',')},${blob.alpha})`);
      grad.addColorStop(1, `rgba(${blob.color.join(',')},0)`);
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(79,142,247,${(1 - d / 120) * 0.12})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      // Mouse repulsion
      const mx = p.x - mouse.x, my = p.y - mouse.y;
      const md = Math.sqrt(mx * mx + my * my);
      if (md < 120) {
        p.vx += (mx / md) * 0.015; p.vy += (my / md) * 0.015;
        const spd = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        if (spd > 1.2) { p.vx /= spd; p.vy /= spd; }
      }
    }
  }

  function frame() {
    time += 0.008;
    ctx.clearRect(0, 0, W, H);
    drawAurora();
    drawConnections();
    pts.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouseNorm.x = e.clientX / W;
    mouseNorm.y = e.clientY / H;
  });

  init(); frame();
}