import { badRequest, json } from "../_utils/helpers";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/images/generations";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.prompt) return badRequest("prompt is required");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return badRequest("OPENAI_API_KEY is not set on the server");

  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

  const r = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt: String(body.prompt),
      size: "1024x1024",
    }),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    return json({ error: "OpenAI image request failed", detail: errText }, { status: 500 });
  }

  const data = await r.json();

  // Compatible with multiple response formats:
  // - { data: [{ b64_json: "..." }] }
  // - { data: [{ url: "https://..." }] }
  const first = data?.data?.[0] || {};
  if (first.b64_json) {
    const url = `data:image/png;base64,${first.b64_json}`;
    return json({ url });
  }
  if (first.url) return json({ url: first.url });

  return json({ error: "No image returned" }, { status: 500 });
}
