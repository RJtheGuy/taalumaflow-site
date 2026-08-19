// chat-engine.js

import { KB } from './rag-kb.js';

/**
 * Initialize the local fallback engine
 */
export function initEngine(updateStatus) {
  if (updateStatus) {
    updateStatus("Local engine ready");
  }
  return Promise.resolve(true);
}

/**
 * Fallback answer generator if the backend worker is unreachable
 */
export async function answer(query) {
  const q = query.toLowerCase();
  
  // Search local knowledge base (rag-kb.js)
  const match = KB.find(entry =>
    entry.questions.some(qStr => qStr.toLowerCase().includes(q))
  );

  if (match) {
    return match.answer;
  }

  // Default fallback response if no match is found
  return "I'm having trouble connecting to the live AI server right now, but feel free to reach out to us directly at talumaflow@gmail.com or via WhatsApp at +39 328 9741517!";
}