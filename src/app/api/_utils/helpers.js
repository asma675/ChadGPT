import { NextResponse } from "next/server";

export function parseOrderBy(orderBy, allowed = ["updatedAt", "createdAt", "name", "priority"]) {
  if (!orderBy) return [{ updatedAt: "desc" }];
  const parts = String(orderBy).split(",").map((s) => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    const desc = p.startsWith("-");
    const key = desc ? p.slice(1) : p;
    if (!allowed.includes(key)) continue;
    out.push({ [key]: desc ? "desc" : "asc" });
  }
  return out.length ? out : [{ updatedAt: "desc" }];
}

export function json(data, init = {}) {
  return NextResponse.json(data, init);
}

export function badRequest(message, extra = {}) {
  return json({ error: message, ...extra }, { status: 400 });
}
