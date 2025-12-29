import { prisma } from "@/lib/prisma";
import { badRequest, json } from "../../_utils/helpers";

export async function GET(_req, { params }) {
  const item = await prisma.knowledgeBase.findUnique({ where: { id: params.id } });
  if (!item) return json({ error: "Not found" }, { status: 404 });
  return json(item);
}

export async function PATCH(req, { params }) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");
  const updated = await prisma.knowledgeBase.update({
    where: { id: params.id },
    data: {
      name: body.name ?? undefined,
      description: body.description ?? undefined,
      content: body.content ?? undefined,
      active: body.active ?? undefined,
      priority: body.priority ?? undefined,
    },
  }).catch(() => null);
  if (!updated) return json({ error: "Not found" }, { status: 404 });
  return json(updated);
}

export async function DELETE(_req, { params }) {
  await prisma.knowledgeBase.delete({ where: { id: params.id } }).catch(() => null);
  return json({ ok: true });
}
