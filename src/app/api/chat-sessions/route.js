import { prisma } from "@/lib/prisma";
import { badRequest, json, parseOrderBy } from "../_utils/helpers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderBy = searchParams.get("orderBy") || "-updatedAt";
  const limit = Number(searchParams.get("limit") || 200);

  const sessions = await prisma.chatSession.findMany({
    orderBy: parseOrderBy(orderBy, ["updatedAt","createdAt","title"]),
    take: Math.min(Math.max(limit, 1), 500),
  });
  return json(sessions);
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");
  const { title, messages, mode, archived } = body;
  if (!messages) return badRequest("messages is required");

  const created = await prisma.chatSession.create({
    data: {
      title: title || null,
      messages,
      mode: mode || null,
      archived: Boolean(archived),
    },
  });
  return json(created);
}
