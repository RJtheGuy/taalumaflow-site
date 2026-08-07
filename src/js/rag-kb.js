/**
 * rag-kb.js — TaalumaFlow knowledge base
 * Answers are formatted with line breaks for chat readability.
 * Add entries to KB array to expand knowledge — no code changes needed.
 */

export const KB = [
  {
    keywords: [
      'get started', 'start', 'inizia', 'begin', 'how do i', 'come posso',
      'first step', 'primo passo', 'onboard', 'sign up', 'try', 'prova',
      'how does it work', 'come funziona', 'what do i do', 'next step'
    ],
    answer: `Great question! Here's how to get started with TaalumaFlow:\n\n1️⃣ Book a free 30-minute call — we look at your current process and tell you honestly if AI helps\n2️⃣ We scope a prototype using your actual data (2 weeks)\n3️⃣ You see real output before committing to anything\n\nReach us anytime:\n📧 talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517`
  },
  {
    keywords: [
      'taalumamail', 'mail', 'order', 'ordine', 'whatsapp', 'fattura',
      'invoice', 'preventivo', 'quote', 'extraction', 'extract', 'automatic',
      'automatico', 'pipeline', 'pdf'
    ],
    answer: `TaalumaMail — our flagship product 📧\n\nYour clients send orders by WhatsApp or email. TaalumaMail:\n• Reads the message and extracts every item, quantity, and price\n• Generates a Fattura or Preventivo PDF automatically\n• Sends it back to the client — no manual input needed\n• Runs entirely on YOUR server (no cloud, no data sharing)\n• Connects to Odoo, SAP, or any ERP via one adapter\n\nAverage time: message → invoice in under 10 seconds.`
  },
  {
    keywords: [
      'chatbot', 'chat bot', 'bot', 'assistant', 'conversational',
      'ai chat', 'chatbots', 'virtual assistant', 'assistente'
    ],
    answer: `Custom AI Chatbots 🤖\n\nWe build chatbots trained on YOUR business:\n• Your product catalog, FAQs, and ordering flow\n• Works in Italian, English, or mixed\n• Deploys on your website, WhatsApp Business, Slack, or Teams\n• Remembers context across the conversation\n\nThis demo you're using right now is an example of what we build for clients!`
  },
  {
    keywords: [
      'dashboard', 'analytics', 'data', 'kpi', 'report', 'forecast',
      'insight', 'statistics', 'graph', 'chart', 'visualiz', 'dati', 'analisi'
    ],
    answer: `Data Dashboards 📊\n\nWe turn your raw business data into clear dashboards:\n• Sales trends and customer analytics\n• Inventory forecasting with ML models\n• Custom KPIs your team actually tracks\n• Connects to your ERP exports, spreadsheets, or databases\n\nWe handle the data science — you get the answers.`
  },
  {
    keywords: [
      'erp', 'taalumaerp', 'gestionale', 'inventory', 'stock',
      'magazzino', 'warehouse', 'beta'
    ],
    answer: `TaalumaERP (Beta) 🏗\n\nA lightweight ERP for small distributors who outgrew spreadsheets:\n• Inventory and stock management\n• Customer and order history\n• Pre-wired to TaalumaMail — orders flow in automatically\n• Italian fiscal compliance built in\n• No SAP complexity, no SAP price tag\n\nCurrently in beta — contact us to join early access.`
  },
  {
    keywords: [
      'automation', 'automate', 'automatizzare', 'process', 'workflow',
      'ocr', 'document', 'routing', 'repetitive', 'ripetitivo', 'manual work'
    ],
    answer: `Process Automation ⚙️\n\nWe automate the repetitive work that slows your team down:\n• Document OCR and automatic classification\n• Data entry from emails, PDFs, and forms\n• Intelligent email routing to the right person\n• Scheduled report generation\n\nAI handles the variation and edge cases that rule-based systems miss.`
  },
  {
    keywords: [
      'custom', 'bespoke', 'nlp', 'classification', 'forecasting',
      'machine learning', 'ml', 'model', 'solution', 'soluzione', 'specifico'
    ],
    answer: `Custom AI Solutions 🧠\n\nIf your problem doesn't fit a standard product, we build it:\n• NLP and text classification pipelines\n• Demand forecasting models\n• Recommendation systems\n• Fine-tuned local AI models\n\nBuilt by data scientists. Delivered as running software — not a notebook.`
  },
  {
    keywords: [
      'price', 'cost', 'pricing', 'quanto costa', 'prezzo', 'costo',
      'budget', 'pay', 'abbonamento', 'subscription', 'fee', 'tariff', 'expensive'
    ],
    answer: `Pricing 💰\n\nWe scope each project before quoting — cost depends on complexity and your data scale.\n\nTypical ranges:\n• Simple chatbot or dashboard: from €1,500 one-time\n• TaalumaMail deployment: from €2,000 + optional monthly support\n• Custom AI projects: scoped per project\n\nBook a free 30-min call and we'll give you a realistic number:\n📧 talumaflow@gmail.com\n📱 +39 328 9741517`
  },
  {
    keywords: [
      'on-premise', 'onprem', 'self-hosted', 'privacy', 'cloud',
      'secure', 'security', 'dati', 'gdpr', 'data protection', 'safe'
    ],
    answer: `Data Privacy & Security 🔒\n\nEverything runs on YOUR hardware by default:\n• The AI model runs locally (no OpenAI, no cloud API)\n• Your client orders never leave your network\n• GDPR-friendly by design\n• You own the data, the model, and the server\n\nThis is our biggest differentiator vs SaaS competitors.`
  },
  {
    keywords: [
      'docker', 'deploy', 'install', 'setup', 'server', 'self-host',
      'come installare', 'technical', 'tecnico', 'requirement', 'hosting'
    ],
    answer: `Technical Setup ⚡\n\nDeployment is intentionally simple:\n• One Docker Compose file — run: docker compose up -d\n• Works on a workstation or a small server\n• No Kubernetes, no cloud subscriptions\n• We handle the setup and document everything\n\nTypical first deployment: under 1 hour.`
  },
  {
    keywords: [
      'odoo', 'sap', 'integration', 'connect', 'existing', 'api',
      'webhook', 'gestionale', 'integrate', 'collegare', 'sync'
    ],
    answer: `ERP & System Integration 🔌\n\nWe connect to whatever you already use:\n• Odoo, SAP, custom gestionale via a Python adapter\n• Any HTTP endpoint via our webhook adapter\n• Structured order data POSTed in real-time\n• No changes needed on your ERP side\n\nOne adapter class. Clean separation. Zero lock-in.`
  },
  {
    keywords: [
      'contact', 'contatto', 'call', 'meet', 'demo', 'speak', 'talk',
      'reach', 'email', 'phone', 'telefono', 'appointment', 'book', 'prenota'
    ],
    answer: `Let's talk! 📞\n\n📧 Email: talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517\n🌍 Web: www.talumaflow.com\n📸 Social: @talumaflow\n\nWe always start with a free 30-minute call — no pitch, just an honest look at whether AI actually helps your process.`
  },
  {
    keywords: [
      'who', 'team', 'founder', 'company', 'about', 'chi siete', 'chi sei',
      'data scientist', 'background', 'experience', 'storia', 'history'
    ],
    answer: `About TaalumaFlow 👋\n\nWe're a team of data scientists based in Milan, Italy.\n\nWe got tired of seeing AI demos that don't survive contact with real business data — so we build tools that actually work in production:\n• No buzzwords\n• No overselling\n• If AI won't help your specific problem, we tell you before taking the work\n\nRemote-first. Serving clients across Italy and internationally.`
  },
  {
    keywords: [
      'italian', 'italiano', 'italy', 'milan', 'milano', 'language',
      'lingua', 'speak italian', 'parla italiano'
    ],
    answer: `Sì, parliamo italiano! 🇮🇹\n\nSiamo basati a Milano e serviamo clienti in tutta Italia.\n\nTutti i nostri prodotti supportano l'italiano di default — incluso TaalumaMail che estrae ordini in italiano, dialetti misti e messaggi WhatsApp informali.\n\nScrivici quando vuoi:\n📧 talumaflow@gmail.com\n📱 +39 328 9741517`
  },
  {
    keywords: [
      'difference', 'differenza', 'vs', 'compare', 'competitor', 'better',
      'why you', 'perché voi', 'unique', 'unico', 'advantage', 'vantaggio'
    ],
    answer: `Why TaalumaFlow? 🎯\n\nMost AI tools are built for enterprise IT teams.\nWe build for the distributor processing 40 WhatsApp orders a day.\n\nWhat makes us different:\n✓ Everything runs on YOUR server — zero cloud dependency\n✓ We're data scientists, not consultants — we know what AI can't do\n✓ One Docker file to deploy, not a 6-month integration project\n✓ If it won't work for your data, we tell you before charging you\n✓ Italian compliance built in from day one`
  },
];

/**
 * Search the KB for the most relevant answer.
 * Returns the answer string or null if no match found.
 */
export function searchKB(query) {
  const q = query.toLowerCase().trim();
  let best = null;
  let bestScore = 0;

  for (const entry of KB) {
    // Count how many keywords appear in the query
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.split(' ').length; // multi-word matches score higher
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  // Require at least one keyword match
  return bestScore > 0 ? best.answer : null;
}
