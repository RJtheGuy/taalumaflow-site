/**
 * chat.js — Friendly conversational chatbot
 * Routes: backend /api/public/chat/ → semantic engine → keyword KB
 * Qualifying questions only after 4 substantive exchanges, not 2
 * Greetings handled naturally without fallback
 */
import { PUBLIC_API, IS_BACKEND_CONFIGURED } from './config.js';
import { initEngine, answer as engineAnswer, FALLBACK } from './chat-engine.js';

/* ── Greetings — respond naturally, no fallback ──────────── */
const GREETINGS = new Set([
  'hi','hello','hey','ciao','salve','buongiorno','buonasera',
  'hola','bonjour','good morning','good afternoon','good evening',
  'sup','whats up',"what's up",'yo','howdy',
]);

const GREETING_REPLIES = [
  "Ciao! 👋 I'm the TaalumaFlow assistant. Ask me anything about our products — order automation, AI chatbots, data dashboards, or anything else. How can I help?",
  "Hello! 👋 Great to have you here. I can tell you about TaalumaMail, our chatbot solutions, data dashboards, pricing, or how to get started. What are you curious about?",
  "Hi there! 😊 I'm here to help you understand what TaalumaFlow does. We build AI automation tools for businesses — want to know more about a specific product?",
];

function isGreeting(text) {
  const q = text.toLowerCase().trim().replace(/[!?.]/g, '');
  return GREETINGS.has(q) || q.length < 4;
}

function randomGreeting() {
  return GREETING_REPLIES[Math.floor(Math.random() * GREETING_REPLIES.length)];
}

/* ── Formatting ──────────────────────────────────────────── */
function fmt(raw) {
  return raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/^[•\-\*]\s+(.+)$/gm,'<span class="cb-line">• $1</span>')
    .replace(/^(\d+)\.\s+(.+)$/gm,'<span class="cb-line">$1. $2</span>')
    .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
}

function timeStr() {
  return new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
}

function appendMsg(container, role, html) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const content = role === 'bot' ? html :
    html.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  div.innerHTML = `<div class="msg-bubble">${content}</div><div class="msg-time">${timeStr()}</div>`;
  container.appendChild(div);
  requestAnimationFrame(() => container.scrollTop = container.scrollHeight);
  return div;
}

function showTyping(container) {
  const el = document.createElement('div');
  el.className = 'msg bot';
  el.innerHTML = `<div class="msg-bubble msg-typing">
    <span class="td"></span>
    <span class="td" style="animation-delay:.2s"></span>
    <span class="td" style="animation-delay:.4s"></span>
  </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

/* ── Backend chat ────────────────────────────────────────── */
async function backendChat(query) {
  const res = await fetch(PUBLIC_API.chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const d = await res.json();
  return d.answer || null;
}

/* ── Qualifying flow — only after 4 real exchanges ───────── */
const QUALIFY_Q = [
  "To give you the most relevant answer — how many orders do you process per week, roughly?",
  "What channel do your clients use to send orders — WhatsApp, email, or phone?",
  "And what system do you use currently — spreadsheet, ERP, or something else?",
];

function renderCTA(container, answers) {
  const [orders, channel, system] = answers;
  const subject = encodeURIComponent(
    `TaalumaFlow demo — ~${orders||'?'} orders/week via ${channel||'WhatsApp'}`
  );
  const body = encodeURIComponent(
    `Hi TaalumaFlow,\n\nI process ~${orders||'?'} orders/week.\nChannel: ${channel||'?'}\nCurrent system: ${system||'?'}\n\nI'd like to see a demo.\n\nBest regards`
  );
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = `<div class="msg-bubble qualifying-cta">
    <strong style="display:block;margin-bottom:8px">Sounds like TaalumaMail could help! 🎯</strong>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.5">
      I've pre-filled a demo request based on what you've told me:
    </div>
    <a href="mailto:talumaflow@gmail.com?subject=${subject}&body=${body}"
       style="display:inline-block;padding:9px 18px;border-radius:8px;
              background:linear-gradient(135deg,var(--blue2),var(--blue));
              color:#fff;font-size:12px;font-weight:600;text-decoration:none;margin-bottom:8px">
      📧 Send demo request →
    </a>
    <div style="font-size:10px;color:var(--text3)">
      Or WhatsApp: <a href="https://wa.me/393289741517" style="color:var(--blue)">+39 328 9741517</a>
    </div>
  </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/* ── Core handler ────────────────────────────────────────── */
function makeHandler(msgs, typingEl, input, sendBtn) {
  let realExchanges = 0; // only counts non-greeting exchanges
  let qStep = -1;
  const qAnswers = [];

  // Pre-warm engine silently
  initEngine(null);

  return async function send() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;
    input.value = '';
    sendBtn.disabled = true;
    appendMsg(msgs, 'user', text);

    // ── Qualifying flow active ────────────────────────────
    if (qStep >= 0) {
      qAnswers.push(text);
      if (qStep < QUALIFY_Q.length - 1) {
        qStep++;
        setTimeout(() => {
          appendMsg(msgs, 'bot', fmt(QUALIFY_Q[qStep]));
          sendBtn.disabled = false; input.focus();
        }, 400);
        return;
      }
      setTimeout(() => {
        renderCTA(msgs, qAnswers);
        sendBtn.disabled = false; input.focus();
      }, 400);
      return;
    }

    // ── Handle greetings instantly ────────────────────────
    if (isGreeting(text)) {
      setTimeout(() => {
        appendMsg(msgs, 'bot', fmt(randomGreeting()));
        sendBtn.disabled = false; input.focus();
      }, 300);
      return;
    }

    realExchanges++;

    // ── Normal answer ─────────────────────────────────────
    const dots = typingEl
      ? (typingEl.style.display = 'flex', typingEl)
      : showTyping(msgs);

    let reply = null;

    // Try backend KB first
    if (IS_BACKEND_CONFIGURED) {
      try { reply = await backendChat(text); } catch { /* fall through */ }
    }

    // Try semantic engine
    if (!reply || reply === FALLBACK) {
      try {
        await initEngine(null);
        const r = await engineAnswer(text);
        if (r && r !== FALLBACK) reply = r;
      } catch { /* fall through */ }
    }

    if (!reply) reply = FALLBACK;

    if (typingEl) typingEl.style.display = 'none';
    else { try { msgs.removeChild(dots); } catch {} }

    appendMsg(msgs, 'bot', fmt(reply));

    // Trigger qualifying only after 4 real (non-greeting) exchanges
    if (realExchanges === 4) {
      qStep = 0;
      setTimeout(() => {
        appendMsg(msgs, 'bot', fmt(
          `I'd love to help you figure out if TaalumaMail is a good fit for your business. Mind if I ask a couple of quick questions? 😊\n\n${QUALIFY_Q[0]}`
        ));
        sendBtn.disabled = false; input.focus();
      }, 800);
      return;
    }

    sendBtn.disabled = false; input.focus();
  };
}

/* ── Inline chat ─────────────────────────────────────────── */
export function initInlineChat({ inputId, sendBtnId, messagesId, typingId }) {
  const input   = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);
  const msgs    = document.getElementById(messagesId);
  const typing  = document.getElementById(typingId);
  if (!input || !msgs) return;
  const send = makeHandler(msgs, typing, input, sendBtn);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

/* ── Float chat ──────────────────────────────────────────── */
export function initFloatChat({ panelId, btnId, inputId, sendBtnId, messagesId }) {
  const panel   = document.getElementById(panelId);
  const btn     = document.getElementById(btnId);
  const input   = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);
  const msgs    = document.getElementById(messagesId);
  if (!panel || !btn || !input || !msgs) return;

  btn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => input.focus(), 300);
  });

  const send = makeHandler(msgs, null, input, sendBtn);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}
