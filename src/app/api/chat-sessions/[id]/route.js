import { prisma } from "@/lib/prisma";
import { badRequest, json } from "../../_utils/helpers";

export async function GET(_req, { params }) {
  const item = await prisma.chatSession.findUnique({ where: { id: params.id } });
  if (!item) return json({ error: "Not found" }, { status: 404 });
  return json(item);
}

export async function PATCH(req, { params }) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const updated = await prisma.chatSession.update({
    where: { id: params.id },
    data: {
      title: body.title ?? undefined,
      messages: body.messages ?? undefined,
      mode: body.mode ?? undefined,
      archived: body.archived ?? undefined,
    },
  }).catch((e) => null);

  if (!updated) return json({ error: "Not found" }, { status: 404 });
  return json(updated);
}

export async function DELETE(_req, { params }) {
  await prisma.chatSession.delete({ where: { id: params.id } }).catch(() => null);
  return json({ ok: true });
}
