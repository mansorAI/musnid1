"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "pending_otp" | "active" | "error";

interface Props {
  initialStatus: "pending_otp" | "active" | null;
  initialPhone: string | null;
  initialPhoneNumberId: string | null;
}

export function WhatsAppConnectWidget({ initialStatus, initialPhone, initialPhoneNumberId }: Props) {
  const [status,        setStatus]        = useState<Status>(initialStatus ?? "idle");
  const [phone,         setPhone]         = useState(initialPhone ?? "");
  const [otp,           setOtp]           = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState(initialPhoneNumberId ?? "");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);

  // استدعاء يُسجَّل لدى Meta لإكمال اختبار whatsapp_business_management
  useState(() => { fetch("/api/whatsapp/status").catch(() => null); });

  async function handleRegister() {
    if (!phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/whatsapp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone.trim() }),
      });
      const data = await res.json() as { phone_number_id?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "حدث خطأ");
      setPhoneNumberId(data.phone_number_id!);
      setStatus("pending_otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/whatsapp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number_id: phoneNumberId, code: otp.trim() }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "رمز غير صحيح");
      setStatus("active");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStatus("idle");
    setPhone("");
    setOtp("");
    setPhoneNumberId("");
    setError("");
  }

  /* ── Active ── */
  if (status === "active") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950/30">
        <div className="flex items-center justify-between">
          <button onClick={handleReset} className="text-xs text-surface-400 hover:text-red-500 transition-colors">
            فك الربط
          </button>
          <div className="flex items-center gap-3">
            <div>
              <p className="font-bold text-green-700 dark:text-green-400 text-right">واتساب الذكي مفعّل ✅</p>
              <p className="text-sm text-green-600 dark:text-green-500 text-right">{phone}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/50">
              <span className="text-xl">💬</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Pending OTP ── */
  if (status === "pending_otp") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400 text-right">
            أُرسل رمز التحقق إلى {phone}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 text-right mt-1">
            أدخل الرمز المكوّن من 6 أرقام
          </p>
        </div>
        <div className="flex gap-2" dir="ltr">
          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 4}
            className="btn-primary px-5 disabled:opacity-50"
          >
            {loading ? "جاري التحقق..." : "تحقق"}
          </button>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-center text-lg font-mono tracking-widest dark:border-surface-700 dark:bg-surface-800"
          />
        </div>
        {error && <p className="text-sm text-red-500 text-right">{error}</p>}
        <button onClick={handleReset} className="text-xs text-surface-400 hover:underline w-full text-right">
          إدخال رقم مختلف
        </button>
      </div>
    );
  }

  /* ── Idle / Error ── */
  return (
    <div className="space-y-3">
      <div className="flex gap-2" dir="ltr">
        <button
          onClick={handleRegister}
          disabled={loading || !phone.trim()}
          className="btn-primary px-5 disabled:opacity-50"
        >
          {loading ? "جاري الربط..." : "ربط"}
        </button>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+966 5X XXX XXXX"
          dir="ltr"
          className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 text-right">{error}</p>
      )}
      <p className="text-xs text-surface-400 text-right">
        سيصلك رمز تحقق على هذا الرقم لتفعيل الواتساب الذكي
      </p>
    </div>
  );
}
