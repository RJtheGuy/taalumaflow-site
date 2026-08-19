/**
 * rag-kb.js — TaalumaFlow knowledge base
 *
 * Each entry has:
 *   questions  — used by the semantic engine (all-MiniLM-L6-v2)
 *   keywords   — used by the fast keyword fallback
 *   answer     — what the bot says
 *
 * Tone: professional data science company, direct and honest,
 * never sounds like a generic chatbot or a sales script.
 */
export const KB = [
  {
    questions: [
      'what services do you offer', 'what do you do', 'what can you build',
      'what products do you have', 'what solutions', 'tell me about your services',
      'what do you offer', 'cosa fate', 'cosa offrite', 'prodotti', 'servizi',
    ],
    keywords: ['services', 'offer', 'solutions', 'products', 'what do you do',
               'what tools', 'tools', 'capabilities', 'cosa fate'],
    answer: `TaalumaFlow builds six AI products for businesses:\n\n**TaalumaMail** — reads WhatsApp/email orders and generates invoices automatically\n**Custom AI Chatbots** — trained on your products, FAQs, and ordering process\n**Data Dashboards** — live analytics and forecasting from your existing data\n**TaalumaERP** — lightweight ERP for small distributors\n**Process Automation** — document OCR, email routing, data entry\n**Custom AI Solutions** — NLP, forecasting, classification built by data scientists\n\nAll run on your own hardware. Which one is most relevant to your business?`,
  },
  {
    questions: [
      'what technology do you use', 'what tech stack', 'what tools do you use',
      'what ai model', 'how is it built', 'which llm', 'ollama mistral python django',
      'how does the ai work', 'what framework',
    ],
    keywords: ['technology', 'tech stack', 'tools you use', 'ai model', 'llm',
               'ollama', 'mistral', 'python', 'framework', 'built with', 'how built'],
    answer: `Our stack is deliberately practical:\n\n**AI model:** Mistral 7B via Ollama — runs locally on your hardware, no cloud API\n**Backend:** Python / Django — fast, maintainable, production-tested\n**Data science:** scikit-learn, pandas, custom ML pipelines\n**Infrastructure:** Docker Compose — one command deploys everything\n**Database:** PostgreSQL + Redis\n\nWe chose tools that work under real conditions — not just in clean demo environments.`,
  },
  {
    questions: [
      'what is taalumamail', 'how does order extraction work',
      'automatic invoice from whatsapp', 'whatsapp to invoice',
      'email order processing', 'fattura automatica', 'ordine automatico',
      'how does taalumamail work', 'order pipeline',
    ],
    keywords: ['taalumamail', 'mail', 'order', 'ordine', 'whatsapp',
               'fattura', 'invoice', 'preventivo', 'extraction', 'pdf'],
    answer: `TaalumaMail is our flagship product ✉️\n\nYour clients send orders by WhatsApp or email — in any format, even informal Italian. TaalumaMail:\n\n• Reads the message and extracts every item, quantity, and price\n• Generates a Fattura or Preventivo PDF automatically\n• Sends it back to the client — zero manual input required\n• Runs entirely on your server — no data leaves your network\n• Connects to Odoo, SAP, or any ERP\n\nAverage time: message → invoice in under 10 seconds.`,
  },
  {
    questions: [
      'tell me about your chatbot', 'can you build a chatbot for me',
      'custom ai chatbot', 'chatbot for my website', 'whatsapp chatbot',
      'ai assistant for business', 'virtual assistant',
    ],
    keywords: ['chatbot', 'chat bot', 'bot', 'assistant', 'virtual assistant',
               'ai assistant', 'conversational'],
    answer: `We build custom AI chatbots trained on your specific business context 🤖\n\nNot a generic assistant — one that knows your products, prices, FAQs, and ordering process.\n\n• Works in Italian, English, or mixed language\n• Deploys on your website, WhatsApp Business, Slack, or Teams\n• Handles questions, qualifies leads, takes simple orders\n\nThis demo you're using right now is exactly what we deliver to clients.`,
  },
  {
    questions: [
      'data dashboards', 'business analytics', 'sales analytics',
      'inventory forecasting', 'kpi dashboard', 'data visualization',
      'business intelligence', 'can you build a dashboard',
    ],
    keywords: ['dashboard', 'analytics', 'data', 'kpi', 'report',
               'forecast', 'visualization', 'charts'],
    answer: `We build interactive dashboards on your actual business data 📊\n\nWe connect to your ERP exports, spreadsheets, or databases and deliver:\n\n• Sales by product, customer, and region\n• Inventory forecasting with ML models\n• Custom KPIs your team actually tracks\n• Anomaly detection on order patterns\n\nWe handle the data science. You get clear answers — not raw numbers.`,
  },
  {
    questions: [
      'how much does it cost', 'what is the pricing', 'how much do you charge',
      'quanto costa', 'prezzo', 'what are your rates', 'is it expensive',
    ],
    keywords: ['price', 'cost', 'pricing', 'quanto costa', 'budget',
               'how much', 'rates', 'fees'],
    answer: `Pricing is scoped per project — we don't do generic quotes because the cost depends on your actual data and setup.\n\nTypical ranges:\n• TaalumaMail deployment: from €2,000 one-time\n• Custom chatbot: from €1,500\n• Dashboard project: from €1,200\n• Custom AI solution: scoped per project\n\nThe best way to get a real number is a 30-minute call where we look at your setup.\n\n📧 talumaflow@gmail.com · 📱 +39 328 9741517`,
  },
  {
    questions: [
      'is my data safe', 'data privacy', 'gdpr compliance', 'on premise',
      'do you store my data', 'where does data go', 'cloud or local',
      'data security', 'sicurezza dati',
    ],
    keywords: ['privacy', 'gdpr', 'data security', 'cloud', 'on premise',
               'on-premise', 'secure', 'my data', 'data protection'],
    answer: `Data privacy is central to how we build 🔒\n\nEverything runs on your own hardware. The AI model runs locally via Ollama — your client orders, customer names, and pricing data never leave your network.\n\n• No OpenAI. No AWS. No third-party AI service.\n• GDPR-compliant by design\n• You own the model, the data, and the server\n\nThis is our biggest differentiator versus SaaS alternatives.`,
  },
  {
    questions: [
      'where are you located', 'where is talumaflow based', 'are you in italy',
      'milan based', 'dove siete', 'dove sei', 'what country',
    ],
    keywords: ['location', 'located', 'where are you', 'milan', 'italy',
               'country', 'office', 'dove siete'],
    answer: `We're based in Milan, Italy 🇮🇹\n\nRemote-first — we work with clients across Italy and internationally. Most of our work happens over video call and async, so location is rarely a barrier.\n\n📧 talumaflow@gmail.com\n📱 +39 328 9741517`,
  },
  {
    questions: [
      'who are you', 'tell me about talumaflow', 'what is talumaflow',
      'about your company', 'who built this', 'team background',
      'chi siete', 'cosa è talumaflow',
    ],
    keywords: ['who are you', 'about', 'talumaflow', 'team', 'founders',
               'data scientist', 'background', 'company'],
    answer: `TaalumaFlow is a small team of data scientists based in Milan.\n\nWe got frustrated watching AI demos that look impressive in presentations but fall apart when they meet real business data — messy spreadsheets, inconsistent WhatsApp messages, mixed Italian and English.\n\nSo we build tools that actually work in production:\n• Honest about what AI can and can't do\n• No 6-month enterprise integrations\n• If it won't help your specific problem, we say so before charging\n\nWhat problem are you trying to solve?`,
  },
  {
    questions: [
      'how do i get started', 'what is the first step', 'how to begin',
      'how does engagement work', 'come iniziare', 'next steps',
    ],
    keywords: ['get started', 'how to start', 'first step', 'begin',
               'onboarding', 'how does it work', 'come iniziare'],
    answer: `Getting started is straightforward:\n\n1. **30-minute call** — we map your current process and tell you honestly whether AI helps\n2. **Prototype in 2 weeks** — built on your actual data, not a demo dataset\n3. **You decide** — see real output before committing to anything\n\nNo sales pitch. No commitment. Just an honest conversation.\n\n📧 talumaflow@gmail.com · 📱 +39 328 9741517`,
  },
  {
    questions: [
      'how do i contact you', 'can i book a call', 'request a demo',
      'get in touch', 'reach you', 'speak to someone', 'contattarvi',
    ],
    keywords: ['contact', 'reach you', 'get in touch', 'call', 'demo request',
               'book a call', 'speak to', 'contattarvi'],
    answer: `Let's talk 📞\n\n📧 talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517\n🌍 www.talumaflow.com\n📸 @talumaflow\n\nWe always start with a free 30-minute call — no pitch, just an honest look at whether AI actually helps your process.`,
  },
  {
    questions: [
      'taalumaerp', 'lightweight erp', 'inventory management system',
      'erp for small business', 'gestionale', 'magazzino',
    ],
    keywords: ['erp', 'taalumaerp', 'gestionale', 'inventory', 'stock', 'warehouse'],
    answer: `TaalumaERP is our lightweight ERP for small distributors 🏗\n\nBuilt for businesses that outgrew spreadsheets but don't need SAP's complexity or cost:\n\n• Inventory and stock management\n• Customer and order history\n• Pre-wired to TaalumaMail — orders flow in automatically\n• Italian fiscal compliance built in\n\nCurrently in beta. Visit taalumaerp.com or contact us for early access.`,
  },
];