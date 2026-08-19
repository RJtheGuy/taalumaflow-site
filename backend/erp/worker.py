from workers import WorkerEntrypoint, Request, Response
import json
import js

# Hardcoded Knowledge Base Content
KNOWLEDGE_BASE = """
TAALUMAFLOW COMPREHENSIVE KNOWLEDGE BASE:

1. GETTING STARTED & PROCESS:
- Free 30-minute consultation call to evaluate current workflow.
- 2-week working prototype built using your actual business data.
- See real output before making any commitment.

2. PRODUCTS & SERVICES:
- TaalumaMail: Reads orders from WhatsApp/Email, extracts line items/prices, generates invoice/estimate PDFs, and integrates with ERPs (Odoo, SAP). Processes messages in under 10 seconds. Runs on-premise.
- Custom AI Chatbots: Trained on specific business data, FAQs, and ordering flows. Deploys to websites, WhatsApp Business, and Slack in English/Italian.
- Analytics & Dashboards: Custom KPI dashboards, sales trend analysis, and inventory forecasting.

3. PRICING STRUCTURE:
- TaalumaMail: From €2,000 (one-time).
- Custom Chatbot: From €1,500.
- Dashboard Analytics: From €1,200.

4. PRIVACY & SECURITY:
- 100% On-Premise/Local Hardware via Ollama. Data never leaves your network.
- Fully GDPR-compliant by design. You own the server, data, and models.

5. TEAM & LOCATION:
- Team of Data Scientists based in Milan, Italy.
- Focused on production-ready AI tools without hype or overselling.

6. CONTACT DETAILS:
- Email: talumaflow@gmail.com
- WhatsApp: +39 328 9741517
- Web: www.talumaflow.com | Socials: @talumaflow
"""

SYSTEM_PROMPT = f"""You are the official TaalumaFlow AI Assistant.
Your task is to provide accurate, helpful, and concise answers based strictly on the Knowledge Base provided below.

=== KNOWLEDGE BASE ===
{KNOWLEDGE_BASE}
======================

Instructions:
- Use the Knowledge Base above alongside any dynamic context provided per request.
- If the user asks something outside this information, politely inform them that you don't have those specific details and instruct them to reach out via Email (taalumaflow@gmail.com) or WhatsApp (+39 328 9741517).
- Keep responses friendly, clear, and easy to read.
"""


class Default(WorkerEntrypoint):
    async def fetch(self, request: Request) -> Response:
        if request.method == "OPTIONS":
            return Response(
                None,
                status=204,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            )

        if request.method != "POST":
            return Response("Method Not Allowed", status=405)

        try:
            body = await request.json()
            user_prompt = body.get("prompt", body.get("query", ""))
            dynamic_context = body.get("context", "")

            # Combine system prompt with any extra dynamic context from the request
            full_system = SYSTEM_PROMPT
            if dynamic_context:
                full_system += f"\n\n=== ADDITIONAL CONTEXT ===\n{dynamic_context}"

            raw_url = getattr(self.env, "OLLAMA_URL", "http://localhost:8000")
            base_url = raw_url.strip().strip("[]").strip("()").rstrip("/")

            payload = json.dumps({
                "query": user_prompt,
                "system_prompt": full_system,
                "context": dynamic_context
            })

            headers = js.Headers.new()
            headers.set("Content-Type", "application/json")

            req_options = js.Object.new()
            req_options.method = "POST"
            req_options.headers = headers
            req_options.body = payload

            django_endpoint = f"{base_url}/api/public/chat/"

            res = await js.fetch(django_endpoint, req_options)
            res_text = await res.text()

            if res.status != 200:
                return Response(
                    json.dumps({"error": f"Upstream error ({res.status}): {res_text}"}),
                    status=502,
                    headers={
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                )

            return Response(
                res_text,
                status=200,
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            )

        except Exception as err:
            return Response(
                json.dumps({"error": str(err)}),
                status=500,
                headers={
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            )