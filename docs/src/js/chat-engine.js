/**
 * chat-engine.js
 * Semantic similarity engine using Transformers.js.
 * Same approach as TaalumaERP's engine.py — all-MiniLM-L6-v2.
 * Falls back to keyword search while model loads.
 */
import { KB } from './rag-kb.js';

const MODEL_ID  = 'Xenova/all-MiniLM-L6-v2';
const THRESHOLD = 0.32; // lowered from 0.38 — MiniLM scores are compressed

export const FALLBACK = (
  "I don't have a specific answer for that one! 😊\n\n" +
  "For anything detailed:\n📧 talumaflow@gmail.com\n📱 +39 328 9741517\n\n" +
  "Or scroll down and fill the contact form — we respond within a few hours."
);

let _pipeline  = null;
let _questions = [];
let _answers   = [];
let _embeds    = null;
let _ready     = false;
let _loading   = false;
let _initPromise = null;

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function buildIndex() {
  _questions = []; _answers = [];
  for (const entry of KB) {
    for (const q of entry.questions) {
      _questions.push(q);
      _answers.push(entry.answer);
    }
  }
}

async function buildEmbeds() {
  const out = await _pipeline(_questions, { pooling: 'mean', normalize: true });
  _embeds = new Float32Array(out.data.length);
  _embeds.set(out.data);
}

export function initEngine(onProgress) {
  // Return existing promise if already loading/loaded
  if (_initPromise) return _initPromise;
  if (_ready) return Promise.resolve();

  _loading = true;
  _initPromise = (async () => {
    try {
      onProgress?.('Loading semantic model…');
      const { pipeline } = await import(
        'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'
      );
      onProgress?.('Downloading model weights…');
      _pipeline = await pipeline('feature-extraction', MODEL_ID, {
        progress_callback: (p) => {
          if (p.status === 'downloading' && p.total) {
            const pct = Math.round((p.loaded / p.total) * 100);
            onProgress?.(`Model ${pct}%…`);
          }
        },
      });
      buildIndex();
      onProgress?.('Building index…');
      await buildEmbeds();
      _ready = true;
      onProgress?.(null); // signal complete
    } catch (err) {
      console.error('[Engine] init failed:', err);
      _initPromise = null; // allow retry
      onProgress?.(null);
    }
    _loading = false;
  })();

  return _initPromise;
}

export async function answer(query) {
  if (!_ready) return keywordFallback(query);

  const qOut = await _pipeline([query], { pooling: 'mean', normalize: true });
  const qVec = Array.from(qOut.data);
  const dim  = qVec.length;

  let best = -1, bestIdx = -1;
  for (let i = 0; i < _questions.length; i++) {
    const row   = Array.from(_embeds.subarray(i * dim, (i + 1) * dim));
    const score = dot(qVec, row);
    if (score > best) { best = score; bestIdx = i; }
  }

  if (best < THRESHOLD) {
    console.debug(`[Engine] low confidence ${best.toFixed(3)} for: ${query}`);
    return keywordFallback(query) || FALLBACK;
  }
  console.debug(`[Engine] matched score=${best.toFixed(3)} q=${_questions[bestIdx]}`);
  return _answers[bestIdx];
}

function keywordFallback(query) {
  const q = query.toLowerCase();
  let best = null, bestScore = 0;
  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.questions) {
      if (q.includes(kw.toLowerCase())) score += kw.split(' ').length;
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  return bestScore > 0 ? best.answer : null;
}
