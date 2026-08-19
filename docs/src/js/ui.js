/**
 * ui.js
 * ─────────────────────────────────────────────────────────────
 * General UI utilities:
 *   initNavScroll    — sticky nav background on scroll
 *   initMobileNav    — drawer open/close
 *   initScrollReveal — IntersectionObserver fade-in
 *   initCounters     — animated hero number counters
 *   initChartPeriods — period button toggle on analytics chart
 *   initContactForm  — form submit with success state
 * ─────────────────────────────────────────────────────────────
 */

export function initNavScroll(navId = 'nav') {
  const nav = document.getElementById(navId);
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

export function initMobileNav({ drawerId, overlayId, openBtnId }) {
  const drawer  = document.getElementById(drawerId);
  const overlay = document.getElementById(overlayId);
  const openBtn = document.getElementById(openBtnId);
  if (!drawer || !overlay) return;

  const open  = () => { drawer.classList.add('open');    overlay.classList.add('vis');    };
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('vis'); };

  if (openBtn) openBtn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

export function initScrollReveal(selector = '.rv') {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }),
    { threshold: 0.1 }
  );
  document.querySelectorAll(selector).forEach(el => io.observe(el));
}

export function initCounters(counters, triggerSelector = '#hero') {
  const trigger = document.querySelector(triggerSelector);
  if (!trigger) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    counters.forEach(({ id, target, duration }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(p * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    io.disconnect();
  }, { threshold: 0.5 });
  io.observe(trigger);
}

export function initChartPeriods(selector = '.cp-btn') {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', function () {
      this.closest('.chart-period')?.querySelectorAll(selector)
        .forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

export function initContactForm(formId = 'contact-form', btnId = 'fbtn') {
  const form = document.getElementById(formId);
  const btn  = document.getElementById(btnId);
  if (!form || !btn) return;

  // Formspree endpoint — replace with your actual form ID from formspree.io
  // Sign up free at formspree.io → New Form → copy the ID (e.g. xrgvkpqw)
  const FORMSPREE_ID = 'xpwzgnjv'; // ← update this with your real ID

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        btn.textContent = 'Message sent ✓';
        btn.style.background = 'linear-gradient(135deg,#166534,#22c55e)';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.background = '';
          btn.disabled = false;
          form.reset();
        }, 4000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      // Fallback — open email client
      btn.textContent = orig;
      btn.disabled = false;
      const data = new FormData(form);
      const subject = encodeURIComponent('Demo request — TaalumaFlow');
      const body = encodeURIComponent(
        `Name: ${data.get('cf-name')||''}\nCompany: ${data.get('cf-company')||''}\nEmail: ${data.get('cf-email')||''}\nInterested in: ${data.get('cf-product')||''}\n\nMessage:\n${data.get('cf-message')||''}`
      );
      window.open(`mailto:talumaflow@gmail.com?subject=${subject}&body=${body}`);
    }
  });
}
