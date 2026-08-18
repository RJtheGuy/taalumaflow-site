
// import { KB } from './rag-kb.js';

// const THRESHOLD = 0.40;
// const MODEL_ID  = 'Xenova/all-MiniLM-L6-v2';

// const FALLBACK = "I don't have a specific answer for that one! 😊\n\nFor anything detailed, reach us directly:\n\n📧 talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517\n\nWe respond within a few hours.";

// let pipeline  = null;   // Transformers.js feature-extraction pipeline
// let questions = [];     // flat list of all question strings
// let answers   = [];     // parallel array: answers[i] = answer for questions[i]
// let embeddings = null;  // Float32Array matrix: [n_questions × 384]
// let ready     = false;
// let loading   = false;

// function dot(a, b) {
//   let s = 0;
//   for (let i = 0; i < a.length; i++) s += a[i] * b[i];
//   return s;
// }

// function l2norm(v) {
//   let sum = 0;
//   for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
//   const mag = Math.sqrt(sum);
//   return v.map(x => x / mag);
// }

// // ── Build flat question/answer arrays from KB ─────────────────
// function buildIndex() {
//   questions = [];
//   answers   = [];
//   for (const entry of KB) {
//     for (const q of entry.questions) {
//       questions.push(q);
//       answers.push(entry.answer);
//     }
//   }
// }

// // ── Embed all questions at startup ────────────────────────────
// async function buildEmbeddings() {
//   const raw = await pipeline(questions, {
//     pooling: 'mean',
//     normalize: true,
//   });
//   // Store as flat Float32Array for fast dot products
//   const dim = raw.data.length / questions.length;
//   embeddings = new Float32Array(raw.data.length);
//   embeddings.set(raw.data);
//   return dim;
// }

// // ── Lazy init — loads on first message, not at page load ──────
// export async function initEngine(onProgress) {
//   if (ready || loading) return;
//   loading = true;

//   onProgress?.('Loading AI model…');

//   try {
//     // Dynamic import so the heavy library is only loaded when needed
//     const { pipeline: createPipeline } = await import(
//       'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'
//     );

//     onProgress?.('Initialising…');

//     pipeline = await createPipeline('feature-extraction', MODEL_ID, {
//       progress_callback: (p) => {
//         if (p.status === 'downloading') {
//           const pct = Math.round((p.loaded / p.total) * 100);
//           onProgress?.(`Loading model ${pct}%…`);
//         }
//       },
//     });

//     buildIndex();
//     onProgress?.('Indexing knowledge base…');
//     await buildEmbeddings();

//     ready = true;
//     loading = false;
//     onProgress?.(null); // signal complete
//   } catch (err) {
//     loading = false;
//     console.error('[ChatEngine] Init failed:', err);
//     onProgress?.(null);
//   }
// }

// // ── Answer a query ────────────────────────────────────────────
// export async function answer(query) {
//   if (!ready) {
//     // Fallback to keyword search if model not loaded
//     return keywordFallback(query);
//   }

//   const queryVec = await pipeline([query], { pooling: 'mean', normalize: true });
//   const qNorm    = l2norm(Array.from(queryVec.data));
//   const dim      = qNorm.length;

//   let bestScore = -1;
//   let bestIdx   = -1;

//   for (let i = 0; i < questions.length; i++) {
//     const row   = embeddings.subarray(i * dim, (i + 1) * dim);
//     const score = dot(qNorm, Array.from(row));
//     if (score > bestScore) {
//       bestScore = score;
//       bestIdx   = i;
//     }
//   }

//   if (bestScore < THRESHOLD) return FALLBACK;
//   return answers[bestIdx];
// }

// // ── Simple keyword fallback (used before model loads) ─────────
// function keywordFallback(query) {
//   const q = query.toLowerCase();
//   let best = null, bestScore = 0;

//   for (const entry of KB) {
//     let score = 0;
//     for (const kw of entry.questions) {
//       if (q.includes(kw.toLowerCase())) score += kw.split(' ').length;
//     }
//     if (score > bestScore) { bestScore = score; best = entry; }
//   }

//   return bestScore > 0 ? best.answer : FALLBACK;
// }


/**
 * chat-engine.js
 * ─────────────────────────────────────────────────────────────
 * Semantic similarity engine — mirrors TaalumaERP's engine.py
 * exactly but runs in the browser using Transformers.js.
 *
 * Model: all-MiniLM-L6-v2 (same as the Python version)
 * Method: cosine similarity via dot product on normalized vectors
 * Threshold: 0.40 — below this, return fallback
 *
 * The model (~25MB) loads once, stays in memory.
 * First message takes ~3s to load the model, after that instant.
 * ─────────────────────────────────────────────────────────────
 */
import { KB } from './rag-kb.js';

const THRESHOLD = 0.55;
const MODEL_ID  = 'Xenova/all-MiniLM-L6-v2';

const FALLBACK = "I don't have a specific answer for that one! 😊\n\nFor anything detailed, reach us directly:\n\n📧 taalumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517\n\nWe respond within a few hours.";

// ── State ─────────────────────────────────────────────────────
let pipeline  = null;   // Transformers.js feature-extraction pipeline
let questions = [];     // flat list of all question strings
let answers   = [];     // parallel array: answers[i] = answer for questions[i]
let embeddings = null;  // Float32Array matrix: [n_questions × 384]
let ready     = false;
let loading   = false;

// ── cosine similarity (dot product on L2-normalised vectors) ──
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function l2norm(v) {
  let sum = 0;
  for (let i = 0; i < v.length; i++) sum += v[i] * v[i];
  const mag = Math.sqrt(sum);
  return v.map(x => x / mag);
}

// ── Build flat question/answer arrays from KB ─────────────────
function buildIndex() {
  questions = [];
  answers   = [];
  for (const entry of KB) {
    for (const q of entry.questions) {
      questions.push(q);
      answers.push(entry.answer);
    }
  }
}

// ── Embed all questions at startup ────────────────────────────
async function buildEmbeddings() {
  const raw = await pipeline(questions, {
    pooling: 'mean',
    normalize: true,
  });
  // Store as flat Float32Array for fast dot products
  const dim = raw.data.length / questions.length;
  embeddings = new Float32Array(raw.data.length);
  embeddings.set(raw.data);
  return dim;
}

// ── Lazy init — loads on first message, not at page load ──────
export async function initEngine(onProgress) {
  if (ready || loading) return;
  loading = true;

  onProgress?.('Loading AI model…');

  try {
    // Dynamic import so the heavy library is only loaded when needed
    const { pipeline: createPipeline } = await import(
      'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'
    );

    onProgress?.('Initialising…');

    pipeline = await createPipeline('feature-extraction', MODEL_ID, {
      progress_callback: (p) => {
        if (p.status === 'downloading') {
          const pct = Math.round((p.loaded / p.total) * 100);
          onProgress?.(`Loading model ${pct}%…`);
        }
      },
    });

    buildIndex();
    onProgress?.('Indexing knowledge base…');
    await buildEmbeddings();

    ready = true;
    loading = false;
    onProgress?.(null); // signal complete
  } catch (err) {
    loading = false;
    console.error('[ChatEngine] Init failed:', err);
    onProgress?.(null);
  }
}

// ── Answer a query ────────────────────────────────────────────
export async function answer(query) {
  if (!ready) {
    // Fallback to keyword search if model not loaded
    return keywordFallback(query);
  }

  const queryVec = await pipeline([query], { pooling: 'mean', normalize: true });
  const qNorm    = l2norm(Array.from(queryVec.data));
  const dim      = qNorm.length;

  let bestScore = -1;
  let bestIdx   = -1;

  for (let i = 0; i < questions.length; i++) {
    const row   = embeddings.subarray(i * dim, (i + 1) * dim);
    const score = dot(qNorm, Array.from(row));
    if (score > bestScore) {
      bestScore = score;
      bestIdx   = i;
    }
  }

  if (bestScore < THRESHOLD) return FALLBACK;
  return answers[bestIdx];
}

// ── Simple keyword fallback (used before model loads) ─────────
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

  return bestScore > 0 ? best.answer : FALLBACK;
}