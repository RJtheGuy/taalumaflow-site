from workers import WorkerEntrypoint, Request, Response
import json

SYSTEM_PROMPT = """You are the TaalumaFlow AI Assistant.
Answer questions accurately using ONLY the provided context. If the query cannot be answered using the context, state kindly that you don't have that specific information and instruct the user to contact us:
- Email: taalumaflow@gmail.com
- WhatsApp: +39 328 9741517

Keep answers clear, helpful, and formatted cleanly using basic HTML or plain text.
"""

class Default(WorkerEntrypoint):
    async def fetch(self, request: Request) -> Response:
        # Handle CORS preflight options request
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
            # Parse request JSON payload from frontend
            body = await request.json()
            user_prompt = body.get("prompt", "")
            context = body.get("context", "")

            full_system = f"{SYSTEM_PROMPT}\nContext:\n{context}"

            # Get the Ollama URL bound to Cloudflare environment configuration
            ollama_url = getattr(self.env, "OLLAMA_URL", "http://your-ollama-ip:11434")

            # Call Ollama REST API
            import js
            payload = json.dumps({
                "model": "llama3",
                "prompt": user_prompt,
                "system": full_system,
                "stream": False
            })

            headers = js.Headers.new()
            headers.set("Content-Type", "application/json")

            req_options = js.Object.new()
            req_options.method = "POST"
            req_options.headers = headers
            req_options.body = payload

            res = await js.fetch(f"{ollama_url}/api/generate", req_options)
            res_text = await res.text()
            data = json.loads(res_text)

            output_text = data.get("response", "No response generated from model.")

            return Response(
                json.dumps({"response": output_text}),
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