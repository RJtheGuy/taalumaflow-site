/**
 * index.js
 * Application entry point.
 * Imports all modules and wires them to DOM elements.
 * This is the only script tag needed in index.html.
 */

import { initParticles }   from './particles.js';
import { initTheme, toggleTheme } from './theme.js';
import { initInlineChat, initFloatChat } from './chat.js';
import {
  initNavScroll,
  initMobileNav,
  initScrollReveal,
  initCounters,
  initChartPeriods,
  initContactForm,
} from './ui.js';

/* ── Bootstrap ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Theme — must run first to avoid flash of wrong theme
  initTheme();
  window.toggleTheme = toggleTheme; // expose for inline onclick

  // Background
  initParticles('bg-canvas');

  // Nav
  initNavScroll('nav');
  initMobileNav({ drawerId: 'mnd', overlayId: 'mno', openBtnId: 'mnob' });

  // Scroll reveal
  initScrollReveal('.rv');

  // Hero counters
  initCounters([
    { id: 'cnt-1', target: 10,  duration: 1200 },
    { id: 'cnt-2', target: 94,  duration: 1800 },
    { id: 'cnt-3', target: 9,   duration: 1400 },
  ]);

  // Analytics chart period toggle
  initChartPeriods('.cp-btn');

  // Contact form
  initContactForm('contact-form', 'fbtn');

  // Inline section chat
  initInlineChat({
    inputId:    'chat-input',
    sendBtnId:  'chat-send-btn',
    messagesId: 'chat-msgs',
    typingId:   'chat-typing',
  });

  // Floating bubble chat
  initFloatChat({
    panelId:    'float-chat-panel',
    btnId:      'float-chat-btn',
    inputId:    'cfp-input',
    sendBtnId:  'cfp-send-btn',
    messagesId: 'cfp-msgs',
  });
});
