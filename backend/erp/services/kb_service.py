"""
Service layer for Knowledge Base search operations.
"""

_KB = [
    {
        'keywords': ['get started', 'start', 'begin', 'how do i', 'first step',
                     'come iniziare', 'onboard', 'try', 'how does it work'],
        'answer': "Great question! Here's how to get started:\n\n1. Book a free 30-minute call — we look at your current process honestly\n2. We build a prototype with your actual data (2 weeks)\n3. You see real output before committing\n\n📧 talumaflow@gmail.com\n📱 +39 328 9741517"
    },
    {
        'keywords': ['taalumamail', 'mail', 'order', 'ordine', 'whatsapp',
                     'fattura', 'invoice', 'preventivo', 'extraction', 'pdf'],
        'answer': "TaalumaMail reads WhatsApp/email orders, extracts every item and price, generates a fattura or preventivo PDF, and sends it back — automatically.\n\n• Runs on YOUR server — no cloud\n• Works with Italian, English, mixed messages\n• Connects to Odoo, SAP, or any ERP\n\nMessage → invoice in under 10 seconds."
    },
    {
        'keywords': ['chatbot', 'bot', 'assistant', 'conversational', 'ai chat'],
        'answer': "We build custom AI chatbots trained on your specific business — your products, FAQs, ordering flow.\n\n• Italian and English by default\n• Deploys on website, WhatsApp Business, Slack\n• This demo is an example of what we build!"
    },
    {
        'keywords': ['dashboard', 'analytics', 'data', 'kpi', 'report', 'forecast'],
        'answer': "We build dashboards on your actual data — sales trends, inventory forecasting, custom KPIs.\n\nWe handle the data science. You get clean, readable answers connected to your existing ERP or spreadsheets."
    },
    {
        'keywords': ['price', 'cost', 'pricing', 'quanto costa', 'budget', 'how much'],
        'answer': "Pricing is scoped per project:\n\n• TaalumaMail: from €2,000 one-time\n• Custom chatbot: from €1,500\n• Dashboard project: from €1,200\n\nBest way to get a real number: 30-minute call.\n📧 talumaflow@gmail.com"
    },
    {
        'keywords': ['privacy', 'data', 'gdpr', 'cloud', 'secure', 'on-premise', 'safe'],
        'answer': "Everything runs on YOUR hardware. The AI model runs locally via Ollama — your client orders never leave your network.\n\nGDPR-compliant by design. You own the data, the model, and the server."
    },
    {
        'keywords': ['contact', 'call', 'demo', 'speak', 'email', 'phone', 'whatsapp'],
        'answer': "Let's talk! 📞\n\n📧 talumaflow@gmail.com\n📱 WhatsApp: +39 328 9741517\n🌍 www.talumaflow.com\n📸 @talumaflow\n\nWe start with a free 30-min call — no pitch, just an honest look at whether AI helps your process."
    },
    {
        'keywords': ['who', 'team', 'about', 'data scientist', 'company', 'milan'],
        'answer': "We're data scientists based in Milan, Italy.\n\nWe got tired of AI demos that don't survive contact with real business data — so we build tools that actually work in production.\n\nNo buzzwords. No overselling. If AI won't help your problem, we say so."
    },
]

_FALLBACK = (
    "I don't have a specific answer for that one! 😊\n\n"
    "For anything detailed:\n📧 talumaflow@gmail.com\n📱 +39 328 9741517\n\n"
    "Or scroll down and fill the contact form — we respond within a few hours."
)


def search_knowledge_base(query: str) -> str:
    """Searches the knowledge base using keyword matches."""
    cleaned_query = query.strip().lower()
    if not cleaned_query:
        return _FALLBACK

    best_match = None
    highest_score = 0

    for entry in _KB:
        score = sum(1 for kw in entry['keywords'] if kw in cleaned_query)
        if score > highest_score:
            highest_score = score
            best_match = entry

    return best_match['answer'] if highest_score > 0 else _FALLBACK