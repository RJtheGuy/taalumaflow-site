/**
 * chat.js
 * Chat UI wired to:
 *   1. Backend /api/public/chat/ (if BACKEND_URL configured)
 *   2. Semantic engine chat-engine.js (Transformers.js, browser)
 *   3. Keyword KB fallback (instant, while model loads)
 *
 * After 2 user exchanges, inserts qualifying questions.
 * After qualifying, renders a pre-filled contact CTA.
 */
import { PUBLIC_API, IS_BACKEND_CONFIGURED } from './config.js';
import { initEngine, answer as engineAnswer }  from './chat-engine.js';

/* ── Text formatting ─────────────────────────────────────── */
function fmt(raw) {
  return raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[•\-\*]\s+(.+)$/gm, '<span class="cb-line">• $1</span>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<span class="cb-line">$1. $2</span>')
    .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
}

function timeStr() {
  return new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
}

function appendMsg(container, role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const html = role === 'bot' ? fmt(text) :
    text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  div.innerHTML = `<div class="msg-bubble">${html}</div><div class="msg-time">${timeStr()}</div>`;
  container.appendChild(div);
  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
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

/* ── Backend chat call ───────────────────────────────────── */
async function backendChat(query) {
  const res = await fetch(PUBLIC_API.chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Backend ${res.status}`);
  const data = await res.json();
  return data.answer || null;
}

/* ── Qualifying flow ─────────────────────────────────────── */
const QUALIFYING = [
  "How many orders do you process per week, roughly?",
  "What channel do your clients use — WhatsApp, email, or phone?",
  "What system do you use now — spreadsheet, ERP, or something else?",
];

function renderQualifyingCTA(container, answers) {
  const [orders, channel, system] = answers;
  const subject = encodeURIComponent(
    `TaalumaFlow demo — ${orders || '?'} orders/week via ${channel || 'WhatsApp'}`
  );
  const body = encodeURIComponent(
    `Hi TaalumaFlow,\n\nI process ~${orders || '?'} orders/week.\nChannel: ${channel || '?'}\nCurrent system: ${system || '?'}\n\nI'd like to see a demo.\n\nBest regards`
  );
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.innerHTML = `<div class="msg-bubble qualifying-cta">
    <div style="font-weight:700;margin-bottom:8px">Sounds like a great fit! 🎯</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.5">
      TaalumaMail could automate most of that. I've pre-filled a demo request for you:
    </div>
    <a href="mailto:talumaflow@gmail.com?subject=${subject}&body=${body}"
       style="display:inline-block;padding:9px 18px;border-radius:8px;
              background:linear-gradient(135deg,var(--blue2),var(--blue));
              color:#fff;font-size:12px;font-weight:600;text-decoration:none">
       📧 Send demo request →
    </a>
    <div style="font-size:10px;color:var(--text3);margin-top:8px">
      Or WhatsApp: <a href="https://wa.me/393289741517" style="color:var(--blue)">+39 328 9741517</a>
    </div>
  </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/* ── Core send handler ───────────────────────────────────── */
function createHandler(msgs, typingEl, input, sendBtn) {
  let exchangeCount = 0;
  let qualifyingStep = -1; // -1 = not started
  const qualifyingAnswers = [];
  let statusMsg = null;

  function updateStatus(text) {
    if (!text) { statusMsg?.remove(); statusMsg = null; return; }
    if (!statusMsg) {
      statusMsg = appendMsg(msgs, 'bot',
        `<span style="color:var(--text3);font-size:12px">⏳ ${text}</span>`);
    } else {
      statusMsg.querySelector('.msg-bubble').innerHTML =
        `<span style="color:var(--text3);font-size:12px">⏳ ${text}</span>`;
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  return async function send() {
    const text = input.value.trim();
    if (!text || sendBtn.disabled) return;
    input.value = ''; sendBtn.disabled = true;
    appendMsg(msgs, 'user', text);
    exchangeCount++;

    // If in qualifying flow — collect answer, ask next question or show CTA
    if (qualifyingStep >= 0) {
      qualifyingAnswers.push(text);
      if (qualifyingStep < QUALIFYING.length - 1) {
        qualifyingStep++;
        setTimeout(() => {
          appendMsg(msgs, 'bot', QUALIFYING[qualifyingStep]);
          sendBtn.disabled = false; input.focus();
        }, 500);
        return;
      } else {
        // All questions answered — show CTA
        setTimeout(() => {
          renderQualifyingCTA(msgs, qualifyingAnswers);
          sendBtn.disabled = false; input.focus();
        }, 500);
        return;
      }
    }

    // Normal answer flow
    const engineReady = initEngine(updateStatus);
    const dots = typingEl
      ? (typingEl.style.display = 'flex', typingEl)
      : showTyping(msgs);

    let reply;
    try {
      if (IS_BACKEND_CONFIGURED) {
        reply = await backendChat(text);
      }
      if (!reply) {
        await engineReady;
        reply = await engineAnswer(text);
      }
    } catch {
      await engineReady;
      reply = await engineAnswer(text);
    }

    if (typingEl) typingEl.style.display = 'none';
    else { try { msgs.removeChild(dots); } catch {} }

    appendMsg(msgs, 'bot', reply);

    // After 2 exchanges trigger qualifying flow
    if (exchangeCount === 2) {
      qualifyingStep = 0;
      setTimeout(() => {
        appendMsg(msgs, 'bot',
          `Before I answer more — mind if I ask a couple of quick questions? It'll help me give you a much more specific answer. 😊\n\n${QUALIFYING[0]}`
        );
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
  const send = createHandler(msgs, typing, input, sendBtn);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

/* ── Floating bubble chat ────────────────────────────────── */
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
    if (open) { setTimeout(() => input.focus(), 300); initEngine(null); }
  });

  const send = createHandler(msgs, null, input, sendBtn);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}
