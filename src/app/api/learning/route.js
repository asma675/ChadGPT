import { prisma } from "@/lib/prisma";
import { badRequest, json, parseOrderBy } from "../_utils/helpers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderBy = searchParams.get("orderBy") || "-updatedAt";
  const limit = Number(searchParams.get("limit") || 200);

  const items = await prisma.learning.findMany({
    orderBy: parseOrderBy(orderBy, ["updatedAt","createdAt"]),
    take: Math.min(Math.max(limit, 1), 500),
  });
  return json(items);
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");
  const { fact } = body;
  if (!fact || !String(fact).trim()) return badRequest("fact is required");
  const created = await prisma.learning.create({ data: { fact: String(fact) } });
  return json(created);
}
