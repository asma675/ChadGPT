import { prisma } from "@/lib/prisma";
import { badRequest, json, parseOrderBy } from "../_utils/helpers";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderBy = searchParams.get("orderBy") || "-updatedAt";
  const limit = Number(searchParams.get("limit") || 200);

  const items = await prisma.dataVisualization.findMany({
    orderBy: parseOrderBy(orderBy, ["updatedAt","createdAt","name"]),
    take: Math.min(Math.max(limit, 1), 500),
  });
  return json(items);
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return badRequest("Invalid JSON body");
  const { name, description, chart_type, data, config, insights, source_file } = body;
  if (!name || !chart_type || !data || !config) return badRequest("name, chart_type, data, and config are required");

  const created = await prisma.dataVisualization.create({
    data: {
      name: String(name),
      description: description ? String(description) : null,
      chart_type: String(chart_type),
      data,
      config,
      insights: insights ? String(insights) : null,
      source_file: source_file ? String(source_file) : null,
    },
  });
  return json(created);
}
