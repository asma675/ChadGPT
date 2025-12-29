import { prisma } from "@/lib/prisma";
import { badRequest, json } from "../../_utils/helpers";

export async function GET(_req, { params }) {
  const item = await prisma.sessionPresence.findUnique({ where: { id: params.id } });
  if (!item) return json({ error: "Not found" }, { status: 404 });
  return json(item);
}

export async function PATCH(req, { params }) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");

  const updated = await prisma.sessionPresence.update({
    where: { id: params.id },
    data: {
      last_seen: body.last_seen ? new Date(body.last_seen) : undefined,
      is_typing: body.is_typing ?? undefined,
      user_name: body.user_name ?? undefined,
    },
  }).catch(() => null);

  if (!updated) return json({ error: "Not found" }, { status: 404 });
  return json(updated);
}

export async function DELETE(_req, { params }) {
  await prisma.sessionPresence.delete({ where: { id: params.id } }).catch(() => null);
  return json({ ok: true });
}
