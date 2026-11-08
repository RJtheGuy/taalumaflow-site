import { initTheme, toggleTheme } from '/src/js/theme.js?v=24af8bd8';
import { initParticles } from '/src/js/particles.js?v=24af8bd8';
import { initNavScroll, initMobileNav } from '/src/js/ui.js?v=24af8bd8';
import { initChangelog } from '/src/js/changelog.js?v=24af8bd8';

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
