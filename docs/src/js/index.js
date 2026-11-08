
import { initParticles }                                   from './particles.js?v=24af8bd8';
import { initTheme, toggleTheme }                          from './theme.js?v=24af8bd8';
import { initInlineChat, initFloatChat }                   from './chat.js?v=24af8bd8';
import { initNavScroll, initMobileNav, initScrollReveal,
         initCounters, initChartPeriods, initContactForm } from './ui.js?v=24af8bd8';
import { initExtractionDemo, initCSVDashboard }            from './demo.js?v=24af8bd8';
import { initAnalyticsWidget } from './analytics.js?v=24af8bd8';
import { initChangelog } from './changelog.js?v=24af8bd8';
import { initErpCapture } from './erp-capture.js?v=24af8bd8';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  window.toggleTheme = toggleTheme;

  initParticles('bg-canvas');

  initNavScroll('nav');
  initMobileNav({ drawerId: 'mnd', overlayId: 'mno', openBtnId: 'mnob' });

  initScrollReveal('.rv');
  initCounters([
    { id: 'cnt-1', target: 10, duration: 1200 },
    { id: 'cnt-2', target: 40, duration: 1800 },
    { id: 'cnt-3', target: 3,  duration: 1400 },
  ]);

  initChartPeriods('.cp-btn');

  initContactForm('contact-form', 'fbtn');

  initExtractionDemo();
  initCSVDashboard();
  initAnalyticsWidget();
  initChangelog();
  initErpCapture();
  
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