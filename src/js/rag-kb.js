/**
 * rag-kb.js
 * TaalumaFlow knowledge base for the RAG chatbot.
 * Edit this file to update what the bot knows.
 * No embedding model needed — keyword search at this scale.
 */
export const KB = [
  {
    keywords: ['taalumamail', 'mail', 'order', 'ordine', 'whatsapp', 'email', 'fattura', 'invoice', 'preventivo', 'quote', 'extraction'],
    answer: `TaalumaMail is our AI order extraction pipeline. It reads WhatsApp messages and emails from your clients, extracts every item, quantity, and price, then generates a fattura or preventivo PDF automatically and sends it back — without any manual input. It runs entirely on your own hardware using a local AI model, so no data leaves your network. It connects to Odoo, SAP, or any ERP via a single adapter.`
  },
  {
    keywords: ['chatbot', 'chat', 'bot', 'assistant', 'conversational', 'ai chat'],
    answer: `We build custom AI chatbots trained on your specific business — your product catalog, FAQs, ordering flow, or customer support scripts. They work in Italian and English, and deploy on your website, WhatsApp Business API, or internal tools like Slack or Teams.`
  },
  {
    keywords: ['dashboard', 'analytics', 'data', 'kpi', 'report', 'forecast', 'insight', 'statistics'],
    answer: `We build interactive data dashboards on your actual business data — sales trends, customer analytics, inventory forecasting, custom KPIs. We handle the data science and modelling; you get clean, readable dashboards connected to your ERP exports, spreadsheets, or databases.`
  },
  {
    keywords: ['erp', 'taalumaerp', 'gestionale', 'inventory', 'stock', 'magazzino', 'customers', 'clienti'],
    answer: `TaalumaERP is our lightweight ERP for small distributors who outgrew spreadsheets but don't need SAP. It covers inventory, customer management, and order history. It's pre-wired to TaalumaMail's extraction pipeline and has Italian fiscal compliance built in. Currently in beta.`
  },
  {
    keywords: ['automation', 'automatization', 'process', 'workflow', 'ocr', 'document', 'routing', 'repetitive'],
    answer: `Our process automation service handles repetitive workflows — document OCR and classification, data entry, email routing, report generation. We use AI to handle the variation and exceptions that rule-based systems can't manage.`
  },
  {
    keywords: ['custom', 'bespoke', 'nlp', 'classification', 'forecasting', 'model', 'machine learning', 'ml'],
    answer: `We build custom AI solutions when a standard product doesn't fit. This includes NLP pipelines, text classification, demand forecasting, recommendation systems, and fine-tuned local models. Everything is delivered as running software, not just a notebook or report.`
  },
  {
    keywords: ['price', 'cost', 'pricing', 'quanto costa', 'prezzo', 'costo', 'budget', 'pay'],
    answer: `We scope each project before quoting — pricing depends on the complexity and scale of your data. The best way to get a realistic number is a 30-minute call where we look at your current process. Email us at talumaflow@gmail.com or WhatsApp +39 328 9741517.`
  },
  {
    keywords: ['on-premise', 'onprem', 'self-hosted', 'data', 'privacy', 'cloud', 'secure', 'security', 'dati', 'privacy'],
    answer: `Everything we build runs on your own hardware by default. The AI models run locally using Ollama — no data is sent to external cloud servers. This is especially important for clients handling sensitive order or customer data.`
  },
  {
    keywords: ['deploy', 'installation', 'setup', 'docker', 'server', 'how to start', 'come iniziare'],
    answer: `Deployment is a single Docker Compose file — no Kubernetes, no complex infrastructure. If you have a server or a capable workstation, we can get a working deployment running in under an hour. We handle the setup and provide documentation.`
  },
  {
    keywords: ['contact', 'contatto', 'call', 'meet', 'demo', 'speak', 'talk', 'appointment', 'appuntamento'],
    answer: `The best first step is a 30-minute call where we look at your current process and tell you honestly whether AI helps. Email: talumaflow@gmail.com — WhatsApp: +39 328 9741517 — Social: @talumaflow`
  },
  {
    keywords: ['location', 'where', 'italy', 'milan', 'milano', 'dove', 'remote'],
    answer: `We're based in Milan, Italy, and work remote-first. We serve clients across Italy and internationally.`
  },
  {
    keywords: ['odoo', 'sap', 'integration', 'connect', 'existing system', 'api', 'webhook'],
    answer: `TaalumaMail connects to any existing ERP — Odoo, SAP, custom gestionale — via a single Python adapter class. We also provide a webhook adapter that POSTs structured order data to any HTTP endpoint your system exposes.`
  },
];

/**
 * Search the knowledge base for the most relevant entry.
 * Returns the best matching answer string, or null if no match.
 */
export function searchKB(query) {
  const q = query.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const entry of KB) {
    const score = entry.keywords.filter(kw => q.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore > 0 ? best.answer : null;
}