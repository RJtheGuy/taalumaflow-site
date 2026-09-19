import { BACKEND_URL, IS_BACKEND_CONFIGURED } from './config.js';

export function initErpCapture() {
  const form   = document.getElementById('erp-capture-form');
  const input  = document.getElementById('erp-capture-email');
  const btn    = document.getElementById('erp-capture-btn');
  const status = document.getElementById('erp-capture-status');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email || !email.includes('@') || !email.includes('.')) {
      status.style.color = 'var(--red,#ef4444)';
      status.textContent = 'Enter a valid email address.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.textContent = '';

    try {
      if (!IS_BACKEND_CONFIGURED) throw new Error('no_backend');

      const res = await fetch(`${BACKEND_URL}/api/public/erp-waitlist/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      btn.textContent = '✓ Added';
      btn.style.background = 'var(--green)';
      status.style.color = 'var(--green)';
      status.textContent = "You're on the list — we'll email you about new features.";
      input.value = '';
      input.disabled = true;

    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Notify me';
      status.style.color = 'var(--red,#ef4444)';
      status.textContent = err.message === 'no_backend'
        ? 'Backend not connected — email us directly at talumaflow@gmail.com'
        : 'Something went wrong. Please try again.';
    }
  });
}