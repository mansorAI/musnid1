import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/dashboard-data";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function POST(req: NextRequest) {
  const { phone_number_id, code } = await req.json() as { phone_number_id: string; code: string };

  if (!phone_number_id || !code) {
    return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
  }

  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const token = process.env.META_ACCESS_TOKEN!;

  // التحقق من الكود مع Meta
  const verifyRes = await fetch(`${GRAPH}/${phone_number_id}/verify_code`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!verifyRes.ok) {
    const data = await verifyRes.json() as { error?: { message: string } };
    return NextResponse.json({ error: data.error?.message ?? "رمز التحقق غير صحيح" }, { status: 400 });
  }

  // تحديث الحالة إلى active
  const supabase = await createClient() as any;
  await supabase
    .from("businesses")
    .update({ meta_waba_status: "active" })
    .eq("id", business.id)
    .eq("meta_phone_number_id", phone_number_id);

  return NextResponse.json({ success: true });
}
