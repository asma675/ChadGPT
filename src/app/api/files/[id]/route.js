import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req, { params }) {
  const rec = await prisma.uploadedFile.findUnique({ where: { id: params.id } });
  if (!rec) return new NextResponse("Not found", { status: 404 });

  // Send the browser straight to the persisted Blob URL.
  return NextResponse.redirect(rec.url, { status: 302 });
}
