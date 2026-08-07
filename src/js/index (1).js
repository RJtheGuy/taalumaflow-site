/**
 * index.js — Application entry point
 * Wires all modules to DOM element IDs.
 */
import { initParticles }                                   from './particles.js';
import { initTheme, toggleTheme }                          from './theme.js';
import { initInlineChat, initFloatChat }                   from './chat.js';
import { initNavScroll, initMobileNav, initScrollReveal,
         initCounters, initChartPeriods, initContactForm } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {

  initTheme();
  window.toggleTheme = toggleTheme;

  initParticles('bg-canvas');
  initNavScroll('nav');
  initMobileNav({ drawerId: 'mnd', overlayId: 'mno', openBtnId: 'mnob' });
  initScrollReveal('.rv');

  initCounters([
    { id: 'cnt-1', target: 10, duration: 1200 },
    { id: 'cnt-2', target: 94, duration: 1800 },
    { id: 'cnt-3', target: 9,  duration: 1400 },
  ]);

  initChartPeriods('.cp-btn');
  initContactForm('contact-form', 'fbtn');

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
