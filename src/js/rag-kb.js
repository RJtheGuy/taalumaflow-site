/**
 * rag-kb.js — TaalumaFlow knowledge base
 *
 * Same structure as TaalumaERP's engine.py KB.
 * Each entry has `questions` (used to build the semantic index)
 * and an `answer` (returned when a question matches).
 *
 * To expand: add more objects to KB. No code changes needed.
 */
export const KB = [
  {
    questions: [
      "how do I get started",
      "how to begin",
      "first step",
      "what do I do first",
      "come iniziare",
      "how does it work",
      "where do I start",
      "how to try it",
      "onboarding",
    ],
    answer: "Getting started is easy! 👋\n\n**1.** Book a free 30-minute call — we look at your current process and tell you honestly if AI can help\n**2.** We build a prototype using your actual data (2 weeks)\n**3.** You see real output before committing to anything\n\nNo obligation, no sales pitch — just an honest conversation.\n\n📧 talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517",
  },
  {
    questions: [
      "what is TaalumaMail",
      "tell me about TaalumaMail",
      "how does the order pipeline work",
      "automatic invoice from whatsapp",
      "order extraction",
      "fattura automatica",
      "preventivo automatico",
      "how do you process orders",
      "whatsapp order to invoice",
    ],
    answer: "**TaalumaMail** is our flagship product ✉️\n\nYour clients send orders by WhatsApp or email — in any format, even messy Italian. TaalumaMail:\n• Reads the message and extracts every item, quantity, and price\n• Generates a Fattura or Preventivo PDF automatically\n• Sends it back to the client — no manual input\n• Runs on YOUR server — no cloud, no data sharing\n• Connects to Odoo, SAP, or any ERP\n\n**Message → invoice in under 10 seconds.**",
  },
  {
    questions: [
      "what chatbots do you build",
      "custom chatbot",
      "AI assistant for my website",
      "chatbot for my business",
      "conversational AI",
      "virtual assistant",
      "chatbot WhatsApp",
    ],
    answer: "We build **custom AI chatbots** trained on your business 🤖\n\nNot a generic assistant — one that knows your products, prices, FAQs, and ordering process.\n\n• Works in Italian, English, or mixed\n• Deploys on your website, WhatsApp Business, Slack, or Teams\n• Handles questions, qualifies leads, processes simple orders\n\nThis demo you're using right now is an example of what we build!",
  },
  {
    questions: [
      "data dashboards",
      "analytics for my business",
      "sales reports",
      "business intelligence",
      "KPI dashboard",
      "data visualization",
      "forecast inventory",
      "sales trends",
    ],
    answer: "**Data Dashboards** — your data, made readable 📊\n\nWe connect to your existing data (ERP exports, spreadsheets, databases) and build dashboards that answer what your team actually asks:\n\n• Sales by product, customer, region\n• Inventory forecasting with ML models\n• Custom KPIs — no template defaults\n• Export-ready for presentations\n\nWe handle the data science. You get clear answers.",
  },
  {
    questions: [
      "TaalumaERP",
      "what is your ERP",
      "lightweight ERP",
      "gestionale",
      "inventory management system",
      "small distributor ERP",
      "replace spreadsheets",
    ],
    answer: "**TaalumaERP** is our lightweight ERP for small distributors 🏗\n\nBuilt for businesses who outgrew spreadsheets but don't need (or want to pay for) SAP:\n• Inventory and stock management\n• Customer and order history\n• Pre-wired to TaalumaMail — orders flow in automatically\n• Italian fiscal compliance built in\n\nCurrently in **beta** — contact us to join early access.",
  },
  {
    questions: [
      "process automation",
      "automate repetitive work",
      "document OCR",
      "email routing",
      "data entry automation",
      "workflow automation",
      "automazione processi",
    ],
    answer: "**Process Automation** ⚙️\n\nWe automate the repetitive work that slows your team down:\n• Document OCR and automatic classification\n• Data entry from emails, PDFs, and forms\n• Intelligent email routing\n• Scheduled report generation\n\nAI handles the variation and edge cases that rule-based systems miss.",
  },
  {
    questions: [
      "custom AI solution",
      "bespoke AI project",
      "machine learning model",
      "NLP",
      "text classification",
      "demand forecasting",
      "recommendation system",
      "fine-tuned model",
    ],
    answer: "**Custom AI Solutions** 🧠\n\nWhen your problem doesn't fit a standard product, we build it:\n• NLP and text classification pipelines\n• Demand forecasting models\n• Recommendation systems\n• Fine-tuned local AI models\n\nBuilt by data scientists. Delivered as running software — not a notebook.",
  },
  {
    questions: [
      "how much does it cost",
      "what is the price",
      "pricing",
      "quanto costa",
      "budget",
      "subscription fee",
      "is it expensive",
      "cost estimate",
    ],
    answer: "Pricing depends on the project scope 💰\n\nWe scope each engagement before quoting:\n• **TaalumaMail deployment:** from €2,000 one-time + optional monthly support\n• **Custom chatbot:** from €1,500 one-time\n• **Dashboard project:** from €1,200 depending on data complexity\n• **Custom AI:** scoped per project\n\nThe best way to get a real number is a 30-minute call:\n📧 talumaflow@gmail.com\n📱 +39 328 9741517",
  },
  {
    questions: [
      "is my data safe",
      "data privacy",
      "GDPR",
      "do you store my data",
      "cloud or on-premise",
      "where does data go",
      "sicurezza dei dati",
      "privacy",
    ],
    answer: "**Your data stays on your hardware** 🔒\n\nThis is our biggest differentiator:\n• The AI model runs locally using Ollama — no cloud API calls\n• Your client orders never leave your network\n• GDPR-compliant by design — you own everything\n• No subscription to an external AI service\n\nVs SaaS competitors: your data is never sent to OpenAI, AWS, or any third party.",
  },
  {
    questions: [
      "how do you deploy",
      "technical requirements",
      "what server do I need",
      "Docker",
      "self-hosted",
      "installation",
      "how to set up",
      "setup time",
    ],
    answer: "Deployment is intentionally simple ⚡\n\n• **One Docker Compose file** — `docker compose up -d`\n• Works on a workstation or a small server\n• No Kubernetes, no cloud subscriptions needed\n• We handle the setup and document everything\n\nTypical first deployment: **under 1 hour**.",
  },
  {
    questions: [
      "what ERP do you integrate with",
      "does it work with Odoo",
      "SAP integration",
      "connect to my existing system",
      "API",
      "webhook",
      "collegare al gestionale",
    ],
    answer: "We connect to whatever you already use 🔌\n\n• **Odoo, SAP, custom gestionale** — via a Python adapter\n• **Any HTTP endpoint** — via our webhook adapter\n• Structured order data is POSTed in real-time\n• No changes needed on your ERP side\n\nOne adapter class. Clean separation. No lock-in.",
  },
  {
    questions: [
      "who are you",
      "about TaalumaFlow",
      "who built this",
      "team background",
      "data scientists",
      "company info",
      "chi siete",
    ],
    answer: "We're a team of **data scientists** based in Milan, Italy 👋\n\nWe got frustrated watching AI demos that don't survive contact with real business data — so we build tools that actually work in production.\n\n• No buzzwords\n• No overselling\n• If AI won't help your specific problem, we say so before taking the work\n\nRemote-first. Serving clients across Italy and internationally.",
  },
  {
    questions: [
      "speak Italian",
      "parli italiano",
      "risposta in italiano",
      "posso scrivere in italiano",
      "assistenza in italiano",
    ],
    answer: "Certo, parliamo italiano! 🇮🇹\n\nSiamo basati a Milano e serviamo clienti in tutta Italia. Tutti i nostri prodotti supportano l'italiano di default.\n\nTaalumaMail estrae ordini in italiano, dialetti misti e messaggi WhatsApp informali senza problemi.\n\nScrivici quando vuoi:\n📧 talumaflow@gmail.com\n📱 +39 328 9741517",
  },
  {
    questions: [
      "how to contact you",
      "get in touch",
      "book a call",
      "demo request",
      "email address",
      "phone number",
      "come contattarvi",
      "prenota una chiamata",
    ],
    answer: "Let's talk! 📞\n\n📧 **Email:** talumaflow@gmail.com\n📱 **WhatsApp:** +39 328 9741517\n🌍 **Web:** www.talumaflow.com\n📸 **Social:** @talumaflow\n\nWe always start with a **free 30-minute call** — no pitch, just an honest look at whether AI actually helps your process.",
  },
  {
    questions: [
      "why choose TaalumaFlow",
      "what makes you different",
      "vs competitors",
      "advantages",
      "why not use ChatGPT",
      "why not SaaS",
      "perché scegliervi",
    ],
    answer: "Why TaalumaFlow? 🎯\n\nMost AI tools are built for enterprise IT teams. We build for the distributor processing 40 WhatsApp orders a day.\n\n✓ Everything runs on YOUR server — zero cloud dependency\n✓ Data scientists, not consultants — we know what AI actually can't do\n✓ One Docker file, not a 6-month integration project\n✓ If it won't work for your data, we tell you before charging you\n✓ Italian compliance built in from day one",
  },
];
