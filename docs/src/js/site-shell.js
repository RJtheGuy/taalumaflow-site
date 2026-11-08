import { initTheme, toggleTheme } from '/src/js/theme.js';
import { initParticles } from '/src/js/particles.js';
import { initNavScroll, initMobileNav } from '/src/js/ui.js';
import { initChangelog } from '/src/js/changelog.js';

window.toggleTheme = toggleTheme;

function boot() {
  initTheme();
  initParticles('bg-canvas');
  initNavScroll('nav');
  initMobileNav({ drawerId: 'mnd', overlayId: 'mno', openBtnId: 'mnob' });
  initChangelog();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
