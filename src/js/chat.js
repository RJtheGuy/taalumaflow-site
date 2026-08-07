/**
 * chat.js
 * ─────────────────────────────────────────────────────────────
 * Powers both the inline section demo and the floating bubble.
 *
 * PRODUCTION NOTE:
 *   The Anthropic API is called directly from the browser here
 *   for demo purposes. Before going live, proxy through your
 *   backend so the API key is not exposed client-side.
 *   See docs/DEPLOYMENT.md for the Django proxy setup.
 * ─────────────────────────────────────────────────────────────
 */
import { SYSTEM_PROMPT } from './chatPrompt.js';

const FALLBACK = 'Mi dispiace, si è verificato un errore. / Something went wrong — try again or email talumaflow@gmail.com';

/* ── Helpers ─────────────────────────────────────────────── */
function timeStr() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function appendMsg(container, role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
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

async function callAI(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, system: SYSTEM_PROMPT, messages }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (!data.content?.[0]?.text) throw new Error('Empty response');
  return data.content[0].text;
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
    inlineHistory.push({ role: 'user', content: text });
    if (typing) typing.style.display = 'flex';
    try {
      const reply = await callAI(inlineHistory);
      if (typing) typing.style.display = 'none';
      inlineHistory.push({ role: 'assistant', content: reply });
      appendMsg(msgs, 'bot', reply);
    } catch {
      if (typing) typing.style.display = 'none';
      appendMsg(msgs, 'bot', FALLBACK);
    }
    sendBtn.disabled = false; input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
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
    btn.setAttribute('aria-expanded', open);
    panel.setAttribute('aria-hidden', !open);
    if (open) setTimeout(() => input.focus(), 300);
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = ''; sendBtn.disabled = true;
    appendMsg(msgs, 'user', text);
    floatHistory.push({ role: 'user', content: text });
    const typingEl = showTyping(msgs);
    try {
      const reply = await callAI(floatHistory);
      msgs.removeChild(typingEl);
      floatHistory.push({ role: 'assistant', content: reply });
      appendMsg(msgs, 'bot', reply);
    } catch {
      msgs.removeChild(typingEl);
      appendMsg(msgs, 'bot', FALLBACK);
    }
    sendBtn.disabled = false; input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
}
