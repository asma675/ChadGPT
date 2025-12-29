import { json } from "../_utils/helpers";

export async function GET() {
  // Minimal identity for features like presence. Replace with real auth later if desired.
  return json({
    email: "anonymous@local",
    full_name: "Anonymous User",
  });
}
