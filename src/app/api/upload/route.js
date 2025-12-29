import { json, badRequest } from "../_utils/helpers";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req) {
  const form = await req.formData().catch(() => null);
  if (!form) return badRequest("Expected multipart/form-data");

  const file = form.get("file");
  if (!file) return badRequest("file is required");

  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);

  const safeName = String(file.name || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");

  // Store file in Vercel Blob (public) and persist metadata in DB.
  const blob = await put(safeName, buf, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  const rec = await prisma.uploadedFile.create({
    data: {
      filename: safeName,
      contentType: file.type || null,
      size: typeof file.size === "number" ? file.size : null,
      url: blob.url,
    },
  });

  // Keep existing client contract: file_url points to /api/files/:id
  return json({ file_url: `/api/files/${rec.id}` });
}
