/**
 * chat.js — RAG-first chatbot
 * 1. Searches local KB instantly (zero cost)
 * 2. Falls back to a helpful contact message
 * No external API needed.
 */
import { searchKB } from './rag-kb.js';

const FALLBACK = `I don't have a specific answer for that — but we'd love to help!\n\n📧 talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517\n\nOr scroll down and fill in the contact form — we respond within a few hours.`;

/* ── Render helpers ──────────────────────────────────────── */
function timeStr() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Convert plain text answer into chat-friendly HTML.
 * Handles: newlines → <br>, bold via **text**, preserves emojis.
 */
function formatAnswer(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function appendMsg(container, role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const content = role === 'bot' ? formatAnswer(text) :
    text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  div.innerHTML = `<div class="msg-bubble">${content}</div><div class="msg-time">${timeStr()}</div>`;
  container.appendChild(div);
  // Smooth scroll to bottom
  requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

function showTyping(container) {
  const el = document.createElement('div');
  el.className = 'msg bot';
  el.innerHTML = `<div class="msg-bubble" style="display:flex;gap:5px;padding:12px 14px">
    <span style="animation:typeDot 1.2s infinite;display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--text3)"></span>
    <span style="animation:typeDot 1.2s .2s infinite;display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--text3)"></span>
    <span style="animation:typeDot 1.2s .4s infinite;display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--text3)"></span>
  </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

async function getAnswer(query) {
  // Small artificial delay so it feels like the bot is thinking
  await new Promise(r => setTimeout(r, 600 + Math.random() * 500));
  return searchKB(query) || FALLBACK;
}

/* ── Inline section chat ─────────────────────────────────── */
export function initInlineChat({ inputId, sendBtnId, messagesId, typingId }) {
  const input   = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);
  const msgs    = document.getElementById(messagesId);
  const typing  = document.getElementById(typingId);
  if (!input || !msgs) return;

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;
    appendMsg(msgs, 'user', text);
    if (typing) typing.style.display = 'flex';

    const reply = await getAnswer(text);

    if (typing) typing.style.display = 'none';
    appendMsg(msgs, 'bot', reply);
    sendBtn.disabled = false;
    input.focus();
  }

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
    if (open) setTimeout(() => input.focus(), 300);
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;
    appendMsg(msgs, 'user', text);
    const typingEl = showTyping(msgs);

    const reply = await getAnswer(text);

    msgs.removeChild(typingEl);
    appendMsg(msgs, 'bot', reply);
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}
