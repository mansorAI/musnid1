import { NextResponse } from "next/server";
import { getCurrentBusiness } from "@/lib/dashboard-data";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function GET() {
  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const wabaId = process.env.META_WABA_ID!;
  const token  = process.env.META_ACCESS_TOKEN!;

  const res  = await fetch(`${GRAPH}/${wabaId}/phone_numbers`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();

  return NextResponse.json(data);
}
