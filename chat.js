/**
 * ui.js
 * General UI utilities:
 *  - Scroll-based nav styling
 *  - Mobile nav drawer open/close
 *  - Scroll reveal (IntersectionObserver)
 *  - Animated counters
 *  - Chart period toggle
 *  - Contact form handling
 */

/* ── Nav scroll state ───────────────────────────────────── */
export function initNavScroll(navId = 'nav') {
  const nav = document.getElementById(navId);
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Mobile nav ─────────────────────────────────────────── */
export function initMobileNav({ drawerId, overlayId, openBtnId }) {
  const drawer  = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  const openBtn = document.getElementById(openBtnId);
  if (!drawer || !overlay) return;

  function open()  {
    drawer.classList.add('open');
    overlay.classList.add('vis');
  }
  function close() {
    drawer.classList.remove('open');
    overlay.classList.remove('vis');
  }

  if (openBtn) openBtn.addEventListener('click', open);
  overlay.addEventListener('click', close);

  // Close on any nav link click
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ── Scroll reveal ──────────────────────────────────────── */
export function initScrollReveal(selector = '.rv') {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}

/* ── Animated counters ──────────────────────────────────── */
/**
 * Animate a numeric counter element from 0 to target.
 * @param {string} id      - element id
 * @param {number} target  - final value
 * @param {number} duration - ms
 */
function animateCount(id, target, duration) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(p * target);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/**
 * Trigger all hero counters when the hero section enters the viewport.
 * @param {Array<{id, target, duration}>} counters
 * @param {string} triggerSelector - element to observe
 */
export function initCounters(counters, triggerSelector = '#hero') {
  const trigger = document.querySelector(triggerSelector);
  if (!trigger) return;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      counters.forEach(c => animateCount(c.id, c.target, c.duration));
      io.disconnect();
    }
  }, { threshold: 0.5 });
  io.observe(trigger);
}

/* ── Chart period toggle ────────────────────────────────── */
export function initChartPeriods(selector = '.cp-btn') {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', function () {
      this.closest('.chart-period')
        ?.querySelectorAll(selector)
        .forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

/* ── Contact form ───────────────────────────────────────── */
/**
 * Handle contact form submit — shows success state then resets.
 * Wire to a real email service (Formspree / EmailJS) in production.
 * See docs/DEPLOYMENT.md.
 *
 * @param {string} formId
 * @param {string} btnId
 */
export function initContactForm(formId = 'contact-form', btnId = 'fbtn') {
  const form = document.getElementById(formId);
  const btn  = document.getElementById(btnId);
  if (!form || !btn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    btn.textContent = 'Message sent ✓';
    btn.style.background = 'linear-gradient(135deg,#166534,#22c55e)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Send →';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 4000);
  });
}
