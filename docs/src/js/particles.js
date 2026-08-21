
export function initParticles(canvasId = 'bg-canvas') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const mouse = { x: -999, y: -999 };
  let mx = 0.5, my = 0.5; // normalized 0-1
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
    const n = Math.min(Math.floor(W * H / 10000), 150);
    for (let i = 0; i < n; i++) pts.push(new Particle());
  }

  function drawAurora() {
    const blobs = [
      {
        x: W * (0.15 + mx * 0.25 + Math.sin(time * 0.5) * 0.08),
        y: H * (0.2  + my * 0.2  + Math.cos(time * 0.4) * 0.08),
        r: W * 0.5, col: [37, 99, 235], a: 0.08,
      },
      {
        x: W * (0.75 + Math.cos(time * 0.38) * 0.1 - mx * 0.1),
        y: H * (0.3  + Math.sin(time * 0.3)  * 0.1),
        r: W * 0.42, col: [155, 93, 229], a: 0.07,
      },
      {
        x: W * (0.5  + Math.sin(time * 0.28) * 0.18),
        y: H * (0.72 + Math.cos(time * 0.24) * 0.1 + my * 0.08),
        r: W * 0.38, col: [6, 200, 255], a: 0.05,
      },
      // 4th subtle blob for depth
      {
        x: W * (0.4  + Math.cos(time * 0.18) * 0.15 + mx * 0.08),
        y: H * (0.55 + Math.sin(time * 0.22) * 0.12),
        r: W * 0.3, col: [124, 58, 237], a: 0.04,
      },
    ];

    for (const b of blobs) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(${b.col},${b.a})`);
      g.addColorStop(0.5, `rgba(${b.col},${b.a * 0.4})`);
      g.addColorStop(1, `rgba(${b.col},0)`);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  function drawParticles() {
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      // Connections
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(79,142,247,${(1 - d / 120) * 0.12})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      // Mouse repulsion
      const dmx = p.x - mouse.x, dmy = p.y - mouse.y;
      const dm = Math.sqrt(dmx * dmx + dmy * dmy);
      if (dm < 130) {
        p.vx += (dmx / dm) * 0.015; p.vy += (dmy / dm) * 0.015;
        const spd = Math.sqrt(p.vx ** 2 + p.vy ** 2);
        if (spd > 1.3) { p.vx /= spd; p.vy /= spd; }
      }
      p.update(); p.draw();
    }
  }

  function frame() {
    time += 0.007;
    ctx.clearRect(0, 0, W, H);
    drawAurora();
    drawParticles();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', init);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mx = e.clientX / W; my = e.clientY / H;
  });

  init(); frame();
}
