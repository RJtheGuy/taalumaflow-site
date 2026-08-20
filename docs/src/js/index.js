/**
 * index.js — Application entry point
 * Single <script type="module"> tag in index.html
 */
import { initParticles }                                   from './particles.js';
import { initTheme, toggleTheme }                          from './theme.js';
import { initInlineChat, initFloatChat }                   from './chat.js';
import { initNavScroll, initMobileNav, initScrollReveal,
         initCounters, initChartPeriods, initContactForm } from './ui.js';
import { initExtractionDemo, initCSVDashboard }            from './demo.js';

document.addEventListener('DOMContentLoaded', () => {
  // Theme first — prevents flash of wrong mode
  initTheme();
  window.toggleTheme = toggleTheme;

  // Background
  initParticles('bg-canvas');

  // Navigation
  initNavScroll('nav');
  initMobileNav({ drawerId: 'mnd', overlayId: 'mno', openBtnId: 'mnob' });

  // Animations
  initScrollReveal('.rv');
  initCounters([
    { id: 'cnt-1', target: 10, duration: 1200 },
    { id: 'cnt-2', target: 94, duration: 1800 },
    { id: 'cnt-3', target: 9,  duration: 1400 },
  ]);

  // Analytics chart period toggle
  initChartPeriods('.cp-btn');

  // Contact form
  initContactForm('contact-form', 'fbtn');

  // Interactive demos
  initExtractionDemo();
  initCSVDashboard();

  // Chat
  initInlineChat({
    inputId:    'chat-input',
    sendBtnId:  'chat-send-btn',
    messagesId: 'chat-msgs',
    typingId:   'chat-typing',
  });
  initFloatChat({
    panelId:    'float-chat-panel',
    btnId:      'float-chat-btn',
    inputId:    'cfp-input',
    sendBtnId:  'cfp-send-btn',
    messagesId: 'cfp-msgs',
  });
});