import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getApiKey(key: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .single();
  return data?.value ?? null;
}

function buildPrompt(action: string, content: string, question?: string): string {
  switch (action) {
    case "summarize":
      return `لخّص هذا المحتوى بشكل مختصر ومنظم بالعربية. استخدم عناوين ونقاط واضحة:\n\n${content}`;
    case "qa":
      return `بناءً على هذا النص فقط، أجب على السؤال التالي بدقة وإيجاز:\n\nالنص:\n${content}\n\nالسؤال: ${question ?? ""}`;
    case "flashcards":
      return `من هذا النص، استخرج 8 بطاقات مراجعة مفيدة. أرجع JSON فقط بهذا الشكل بدون أي نص إضافي:\n[{"q":"السؤال","a":"الجواب"}]\n\nالنص:\n${content}`;
    default:
      throw new Error("نوع طلب غير صالح");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, pdfBase64, text, question, model = "claude" } = body as {
      action: string;
      pdfBase64?: string;
      text?: string;
      question?: string;
      model?: "claude" | "gemini";
    };

    // Extract text from PDF if provided
    let content = text ?? "";
    if (pdfBase64) {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = Buffer.from(pdfBase64, "base64");
      const parsed = await pdfParse(buffer);
      content = parsed.text;
      if (!content.trim()) {
        return NextResponse.json(
          { error: "لم يتمكن النظام من استخراج نص من هذا الملف. قد يكون محمياً أو صوراً فقط." },
          { status: 422 }
        );
      }
    }

    if (!content.trim()) {
      return NextResponse.json({ error: "لا يوجد محتوى للمعالجة." }, { status: 400 });
    }

    // Limit content to avoid token overflow
    const truncated = content.slice(0, 15000);
    const prompt = buildPrompt(action, truncated, question);

    let result = "";

    if (model === "gemini") {
      const apiKey = await getApiKey("gemini_api_key");
      if (!apiKey) {
        return NextResponse.json({ error: "مفتاح Gemini غير مضبوط. اضبطه من لوحة الأدمن." }, { status: 503 });
      }
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await geminiModel.generateContent(prompt);
      result = response.response.text();
    } else {
      const apiKey = await getApiKey("claude_api_key");
      if (!apiKey) {
        return NextResponse.json({ error: "مفتاح Claude غير مضبوط. اضبطه من لوحة الأدمن." }, { status: 503 });
      }
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });
      result = (message.content[0] as { type: "text"; text: string }).text;
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI study error:", error);
    const msg = error instanceof Error ? error.message : "حدث خطأ أثناء المعالجة.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
