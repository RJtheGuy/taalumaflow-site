/**
 * chat.js
 * AI chat functionality — powers both the inline section demo
 * and the floating bottom-right bubble.
 *
 * Production note:
 *   The Anthropic API is called directly from the browser here
 *   for demo purposes. Before going live, proxy this through
 *   your backend (e.g. Django endpoint at /api/chat/) so the
 *   API key is never exposed client-side.
 *
 *   See docs/DEPLOYMENT.md for the proxy setup.
 */

import { SYSTEM_PROMPT } from './chatPrompt.js';

/* ── Shared helpers ─────────────────────────────────────── */

function timeStr() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Append a message bubble to a container.
 * @param {HTMLElement} container
 * @param {'bot'|'user'} role
 * @param {string} text
 */
function appendMsg(container, role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
  div.innerHTML = `<div class="msg-bubble">${safe}</div><div class="msg-time">${timeStr()}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/**
 * Show a typing indicator in a container.
 * Returns the element so the caller can remove it.
 */
function showTyping(container) {
  const el = document.createElement('div');
  el.className = 'msg bot typing-indicator';
  el.innerHTML = `
    <div class="msg-bubble" style="display:flex;gap:5px;padding:12px 14px">
      <span class="t-dot"></span>
      <span class="t-dot" style="animation-delay:.2s"></span>
      <span class="t-dot" style="animation-delay:.4s"></span>
    </div>`;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
  return el;
}

/**
 * Call the Anthropic messages API.
 * @param {Array<{role:string,content:string}>} messages
 * @returns {Promise<string>}
 */
async function callAI(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (!data.content?.[0]?.text) throw new Error('Empty response');
  return data.content[0].text;
}

const FALLBACK_MSG =
  'Mi dispiace, si è verificato un errore. / Something went wrong — please try again or email talumaflow@gmail.com';

/* ── Inline section chat ────────────────────────────────── */

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
    input.value = '';
    sendBtn.disabled = true;

    appendMsg(msgs, 'user', text);
    inlineHistory.push({ role: 'user', content: text });

    if (typing) typing.style.display = 'flex';
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const reply = await callAI(inlineHistory);
      if (typing) typing.style.display = 'none';
      inlineHistory.push({ role: 'assistant', content: reply });
      appendMsg(msgs, 'bot', reply);
    } catch {
      if (typing) typing.style.display = 'none';
      appendMsg(msgs, 'bot', FALLBACK_MSG);
    }
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}

/* ── Floating bubble chat ───────────────────────────────── */

let floatHistory = [];
let floatOpen = false;

export function initFloatChat({ panelId, btnId, inputId, sendBtnId, messagesId }) {
  const panel   = document.getElementById(panelId);
  const btn     = document.getElementById(btnId);
  const input   = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendBtnId);
  const msgs    = document.getElementById(messagesId);
  if (!panel || !btn || !input || !msgs) return;

  // Toggle open/closed
  btn.addEventListener('click', () => {
    floatOpen = !floatOpen;
    panel.classList.toggle('open', floatOpen);
    btn.classList.toggle('open', floatOpen);
    if (floatOpen) setTimeout(() => input.focus(), 300);
  });

  async function send() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendBtn.disabled = true;

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
      appendMsg(msgs, 'bot', FALLBACK_MSG);
    }
    sendBtn.disabled = false;
    input.focus();
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
}
