import { prisma } from "@/lib/prisma";
import { badRequest, json, parseOrderBy } from "../_utils/helpers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderBy = searchParams.get("orderBy") || "-priority,-updatedAt";
  const limit = Number(searchParams.get("limit") || 200);

  const items = await prisma.knowledgeBase.findMany({
    orderBy: parseOrderBy(orderBy, ["priority","updatedAt","createdAt","name"]),
    take: Math.min(Math.max(limit, 1), 500),
  });
  return json(items);
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");
  const { name, description, content, active, priority } = body;
  if (!name || !content) return badRequest("name and content are required");

  const created = await prisma.knowledgeBase.create({
    data: {
      name: String(name),
      description: description ? String(description) : null,
      content: String(content),
      active: active ?? true,
      priority: Number.isFinite(priority) ? Number(priority) : 1,
    },
  });
  return json(created);
}
