import { BACKEND_URL } from './config.js?v=24af8bd8';

try {
  const dnt = [navigator.doNotTrack, window.doNotTrack, navigator.msDoNotTrack];
  if (!dnt.some(v => v === '1' || v === 'yes') && location.hostname === 'talumaflow.com') {
    let referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch (e) {}
    fetch(`${BACKEND_URL}/api/public/pv/`, {
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname, referrer }),
    }).catch(() => {});
  }
} catch (e) {}
