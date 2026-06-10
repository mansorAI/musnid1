import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split(".");
  const sig  = Buffer.from(encodedSig.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  const data = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
  const expectedSig = crypto.createHmac("sha256", appSecret).update(payload).digest();
  if (!crypto.timingSafeEqual(sig, expectedSig)) return null;
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const body          = await request.text();
    const params        = new URLSearchParams(body);
    const signedRequest = params.get("signed_request");

    if (!signedRequest) return NextResponse.json({ error: "missing signed_request" }, { status: 400 });

    const data = parseSignedRequest(signedRequest, process.env.META_APP_SECRET!);
    if (!data)  return NextResponse.json({ error: "invalid signature" }, { status: 403 });

    // TODO: ألغِ ربط حساب الفيسبوك للمستخدم data.user_id من قاعدة البيانات

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
