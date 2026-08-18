/**
 * chat.js
 * ─────────────────────────────────────────────────────────────
 * Chat UI — wires DOM to the semantic engine (chat-engine.js).
 * Same UX pattern as TaalumaERP's React chatbot:
 *   - Typing indicator while answering
 *   - Formatted responses (bold, bullets, line breaks)
 *   - Conversation history preserved
 *   - Model loads lazily on first message
 * ─────────────────────────────────────────────────────────────
 */
import { initEngine, answer as engineAnswer } from './chat-engine.js';

/* ── Text formatting (mirrors TaalumaERP's bubble rendering) ── */
function formatText(raw) {
  return raw
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^•\s+(.+)$/gm, '<span class="cb-line">• $1</span>')
    .replace(/^\*\s+(.+)$/gm, '<span class="cb-line">• $1</span>')
    .replace(/^-\s+(.+)$/gm,  '<span class="cb-line">• $1</span>')
    .replace(/^(\d+)\.\s+(.+)$/gm, '<span class="cb-line">$1. $2</span>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g,   '<br>');
}

function timeStr() {
  return new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
}

function appendMsg(container, role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const html = role === 'bot' ? formatText(text) :
    text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  div.innerHTML = `<div class="msg-bubble">${html}</div>
                   <div class="msg-time">${timeStr()}</div>`;
  container.appendChild(div);
  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
  return div;
}

function showTypingDots(container) {
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

/* ── Shared send handler ─────────────────────────────────────── */
function createSendHandler(msgs, typingEl, input, sendBtn) {
  // Show engine status in first bot message if model still loading
  let statusMsg = null;

  function updateStatus(text) {
    if (!text) {
      statusMsg?.remove();
      statusMsg = null;
      return;
    }
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
    input.value = '';
    sendBtn.disabled = true;

    appendMsg(msgs, 'user', text);

    // Start loading the model if not yet loaded (first message only)
    const engineReady = initEngine(updateStatus);

    // Show typing dots
    const dots = typingEl
      ? (typingEl.style.display = 'flex', typingEl)
      : showTypingDots(msgs);

    // Wait for engine + answer
    await engineReady;
    const reply = await engineAnswer(text);

    // Remove typing indicator
    if (typingEl) {
      typingEl.style.display = 'none';
    } else {
      try { msgs.removeChild(dots); } catch {}
    }

    appendMsg(msgs, 'bot', reply);
    sendBtn.disabled = false;
    input.focus();
  };
}

/* ── Inline section chat ─────────────────────────────────────── */
export function initInlineChat({ inputId, sendBtnId, messagesId, typingId }) {
  const input   = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);
  const msgs    = document.getElementById(messagesId);
  const typing  = document.getElementById(typingId);
  if (!input || !msgs) return;

  const send = createSendHandler(msgs, typing, input, sendBtn);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

/* ── Floating bubble chat ────────────────────────────────────── */
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
    if (open) {
      setTimeout(() => input.focus(), 300);
      // Pre-warm the engine as soon as chat opens
      initEngine(null);
    }
  });

  const send = createSendHandler(msgs, null, input, sendBtn);
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}
