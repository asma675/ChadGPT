import { badRequest, json } from "../_utils/helpers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function readFileText(fileUrl) {
  try {
    let url = String(fileUrl || "");

    // If we got /api/files/:id, resolve to persisted blob URL.
    const m = url.match(/\/api\/files\/([^/?#]+)/);
    if (m) {
      const rec = await prisma.uploadedFile.findUnique({ where: { id: m[1] } });
      if (!rec?.url) return null;
      url = rec.url;
    }

    // Only fetch remote/public URLs.
    if (!/^https?:\/\//i.test(url)) return null;

    const r = await fetch(url);
    if (!r.ok) return null;

    // best-effort text decode
    return await r.text();
  } catch {
    return null;
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.prompt) return badRequest("prompt is required");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return badRequest("OPENAI_API_KEY is not set on the server");

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  let prompt = String(body.prompt);

  // If the client provided uploaded files, inline their text into the prompt.
  const fileUrls = Array.isArray(body.file_urls) ? body.file_urls : [];
  if (fileUrls.length) {
    const chunks = [];
    for (const u of fileUrls.slice(0, 5)) {
      const text = await readFileText(u);
      if (text) chunks.push(`--- FILE: ${u} ---\n${text.slice(0, 12000)}\n`);
    }
    if (chunks.length) {
      prompt = `${prompt}\n\n### ATTACHED FILES\n${chunks.join("\n")}`;
    }
  }

  const r = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    return json({ error: "OpenAI request failed", detail: errText }, { status: 500 });
  }

  const data = await r.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return json({ text });
}
