/**
 * chat.js — RAG-first chatbot, no paid API required.
 *
 * Flow:
 *   1. Search local knowledge base (rag-kb.js) — keyword match
 *   2. If good match found → return directly (zero API cost)
 *   3. If no match → call Cloudflare Workers AI (free tier)
 *      or fall back to a helpful "contact us" message
 */
import { searchKB } from './rag-kb.js';

const FALLBACK = `Non ho una risposta specifica per questa domanda. / I don't have a specific answer for that. Please contact us directly:\n\n📧 talumaflow@gmail.com\n📱 +39 328 9741517`;

// Your Cloudflare Workers AI endpoint (set up once — see docs/DEPLOYMENT.md)
// Leave empty to use KB-only mode with no external API calls
const CF_WORKER_URL = '';

function timeStr() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function appendMsg(container, role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const safe = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>');
  div.innerHTML = `<div class="msg-bubble">${safe}</div><div class="msg-time">${timeStr()}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
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

async function getAnswer(query, history) {
  // Step 1 — search local knowledge base first (free, instant)
  const kbAnswer = searchKB(query);
  if (kbAnswer) return kbAnswer;

  // Step 2 — call Cloudflare Workers AI if configured (free tier)
  if (CF_WORKER_URL) {
    try {
      const res = await fetch(CF_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.answer || FALLBACK;
      }
    } catch { /* fall through */ }
  }

  // Step 3 — graceful fallback
  return FALLBACK;
}

/* ── Inline section chat ─────────────────────────────────── */
let inlineHistory = [];

export function initInlineChat({ inputId, sendBtnId, messagesId, typingId }) {
  const input   = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);
  const msgs    = document.getElementById(messagesId);
  const typing  = document.getElementById(typingId);
  if (!input || !msgs) return;

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = ''; sendBtn.disabled = true;
    appendMsg(msgs, 'user', text);
    if (typing) typing.style.display = 'flex';
    const reply = await getAnswer(text, inlineHistory);
    if (typing) typing.style.display = 'none';
    inlineHistory.push({ role: 'user', content: text });
    inlineHistory.push({ role: 'assistant', content: reply });
    appendMsg(msgs, 'bot', reply);
    sendBtn.disabled = false; input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

/* ── Floating bubble chat ────────────────────────────────── */
let floatHistory = [];

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
    if (open) setTimeout(() => input.focus(), 300);
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = ''; sendBtn.disabled = true;
    appendMsg(msgs, 'user', text);
    const typingEl = showTyping(msgs);
    const reply = await getAnswer(text, floatHistory);
    msgs.removeChild(typingEl);
    floatHistory.push({ role: 'user', content: text });
    floatHistory.push({ role: 'assistant', content: reply });
    appendMsg(msgs, 'bot', reply);
    sendBtn.disabled = false; input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}