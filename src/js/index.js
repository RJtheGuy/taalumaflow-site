/**
 * index.js — Application entry point
 * ─────────────────────────────────────────────────────────────
 * Imports all modules and wires them to DOM element IDs.
 * This is the single <script type="module"> tag in index.html.
 * ─────────────────────────────────────────────────────────────
 */
import { initParticles }                                    from './particles.js';
import { initTheme, toggleTheme }                           from './theme.js';
import { initInlineChat, initFloatChat }                    from './chat.js';
import { initNavScroll, initMobileNav, initScrollReveal,
         initCounters, initChartPeriods, initContactForm }  from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

  // Theme — run first to avoid flash of wrong theme
  initTheme();
  window.toggleTheme = toggleTheme; // expose for nav button onclick

  // Animated background canvas
  initParticles('bg-canvas');

  // Navigation
  initNavScroll('nav');
  initMobileNav({ drawerId: 'mnd', overlayId: 'mno', openBtnId: 'mnob' });

  // Scroll-triggered fade-ins
  initScrollReveal('.rv');

  // Hero animated counters
  initCounters([
    { id: 'cnt-1', target: 10, duration: 1200 },
    { id: 'cnt-2', target: 94, duration: 1800 },
    { id: 'cnt-3', target: 9,  duration: 1400 },
  ]);

  // Analytics chart period toggle
  initChartPeriods('.cp-btn');

  // Contact form
  initContactForm('contact-form', 'fbtn');

  // AI chat — inline demo section
  initInlineChat({
    inputId:    'chat-input',
    sendBtnId:  'chat-send-btn',
    messagesId: 'chat-msgs',
    typingId:   'chat-typing',
  });

  // AI chat — floating bottom-right bubble
  initFloatChat({
    panelId:    'float-chat-panel',
    btnId:      'float-chat-btn',
    inputId:    'cfp-input',
    sendBtnId:  'cfp-send-btn',
    messagesId: 'cfp-msgs',
  });
});
