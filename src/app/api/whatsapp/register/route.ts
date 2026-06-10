import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/dashboard-data";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function POST(req: NextRequest) {
  const { phone_number } = await req.json() as { phone_number: string };

  if (!phone_number) {
    return NextResponse.json({ error: "رقم الهاتف مطلوب" }, { status: 400 });
  }

  const business = await getCurrentBusiness();
  if (!business) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const wabaId = process.env.META_WABA_ID!;
  const token  = process.env.META_ACCESS_TOKEN!;

  // فصل رمز الدولة عن الرقم (Meta تتطلب cc منفصل)
  const normalized = phone_number.replace(/\s|-/g, "");
  const e164 = normalized.startsWith("+") ? normalized : `+966${normalized.replace(/^0/, "")}`;
  const cc   = e164.slice(1, e164.length - 9);   // رمز الدولة بدون +
  const num  = e164.slice(1 + cc.length);         // الرقم بدون رمز الدولة

  // 1. تسجيل الرقم في WABA
  const addRes = await fetch(`${GRAPH}/${wabaId}/phone_numbers`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ cc, phone_number: num, verified_name: business.name, migrate_whatsapp: false }),
  });

  const addData = await addRes.json() as { id?: string; error?: { message: string } };

  if (!addRes.ok || !addData.id) {
    const msg = addData.error?.message ?? "فشل تسجيل الرقم في Meta";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const phoneNumberId = addData.id;

  // 2. طلب إرسال OTP للرقم
  const otpRes = await fetch(`${GRAPH}/${phoneNumberId}/request_code`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ code_method: "SMS", language: "ar" }),
  });

  if (!otpRes.ok) {
    const otpData = await otpRes.json() as { error?: { message: string } };
    return NextResponse.json({ error: otpData.error?.message ?? "فشل إرسال رمز التحقق" }, { status: 400 });
  }

  // 3. حفظ phone_number_id مؤقتاً مع حالة pending_otp
  const supabase = await createClient() as any;
  await supabase
    .from("businesses")
    .update({
      whatsapp_number:      phone_number,
      meta_phone_number_id: phoneNumberId,
      meta_waba_status:     "pending_otp",
    })
    .eq("id", business.id);

  return NextResponse.json({ phone_number_id: phoneNumberId });
}
