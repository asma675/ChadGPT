import { prisma } from "@/lib/prisma";
import { badRequest, json, parseOrderBy } from "../_utils/helpers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderBy = searchParams.get("orderBy") || "-updatedAt";
  const limit = Number(searchParams.get("limit") || 200);
  const session_id = searchParams.get("session_id") || undefined;
  const user_email = searchParams.get("user_email") || undefined;
  const created_by = searchParams.get("created_by") || undefined; // compatibility
  const emailFilter = user_email || created_by;

  const where = {};
  if (session_id) where.session_id = session_id;
  if (emailFilter) where.user_email = emailFilter;

  const items = await prisma.sessionPresence.findMany({
    where,
    orderBy: parseOrderBy(orderBy, ["updatedAt","createdAt","last_seen"]),
    take: Math.min(Math.max(limit, 1), 500),
  });
  return json(items);
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");
  const { session_id, user_email, user_name, last_seen, is_typing } = body;
  if (!session_id || !user_email || !last_seen) return badRequest("session_id, user_email, last_seen are required");

  const created = await prisma.sessionPresence.create({
    data: {
      session_id: String(session_id),
      user_email: String(user_email),
      user_name: user_name ? String(user_name) : null,
      last_seen: new Date(last_seen),
      is_typing: Boolean(is_typing),
    },
  });
  return json(created);
}
