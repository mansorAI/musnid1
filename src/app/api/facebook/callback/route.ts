import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/dashboard?fb_error=" + error, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // تبادل الـ code بـ access token مع Meta
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
    new URLSearchParams({
      client_id:     process.env.META_APP_ID!,
      client_secret: process.env.META_APP_SECRET!,
      redirect_uri:  "https://www.musnid.com/api/facebook/callback",
      code,
    }),
  );

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/dashboard?fb_error=token_failed", request.url));
  }

  // TODO: احفظ الـ access token في قاعدة البيانات مرتبطاً بالمنشأة
  // const { access_token } = await tokenRes.json();

  return NextResponse.redirect(new URL("/dashboard?fb_connected=1", request.url));
}
