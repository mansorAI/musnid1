"use client";

import { useEffect, useState } from "react";
import { Clock3, MessageSquareText, Wifi } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ConversationItem = {
  id?: string;
  name: string;
  phone: string;
  status: string;
  summary: string;
  time: string;
};

type Props = {
  initialConversations: ConversationItem[];
  businessId: string | null;
};

function mapStatus(raw: string) {
  if (raw === "closed") return "مغلقة";
  if (raw === "escalated") return "بانتظار مراجعة";
  return "نشطة";
}

function statusClass(status: string) {
  if (status === "مغلقة") return "bg-surface-100 dark:bg-surface-800 text-surface-500";
  if (status === "بانتظار مراجعة") return "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
  return "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400";
}

export function RealtimeConversations({ initialConversations, businessId }: Props) {
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    const supabase = createClient();

    async function refetch() {
      const { data } = await supabase
        .from("conversations")
        .select("id,status,summary,last_message_at,customers(name,phone)")
        .eq("business_id", businessId!)
        .order("last_message_at", { ascending: false });

      if (!data) return;

      setConversations(
        data.map((conv) => {
          const customer = Array.isArray(conv.customers) ? conv.customers[0] : conv.customers;
          return {
            id: conv.id,
            name: (customer as { name?: string } | null)?.name ?? "عميل غير معروف",
            phone: (customer as { phone?: string } | null)?.phone ?? "",
            status: mapStatus(conv.status),
            summary: conv.summary ?? "لا يوجد ملخص.",
            time: conv.last_message_at
              ? new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(
                  new Date(conv.last_message_at),
                )
              : "",
          };
        }),
      );
    }

    const channel = supabase
      .channel("conversations-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations", filter: `business_id=eq.${businessId}` },
        () => void refetch(),
      )
      .subscribe((status) => setIsLive(status === "SUBSCRIBED"));

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [businessId]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">المحادثات</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
            {conversations.length > 0
              ? `${conversations.length} محادثة`
              : "لا توجد محادثات بعد"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {businessId && (
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${
              isLive
                ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"
                : "bg-surface-100 dark:bg-surface-800 text-surface-500"
            }`}>
              <Wifi className="w-3 h-3" />
              {isLive ? "متصل" : "جاري الاتصال..."}
            </div>
          )}
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <MessageSquareText className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <article
              key={conv.id ?? `${conv.phone}-${conv.time}`}
              className="grid gap-3 rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4 md:grid-cols-[1fr_auto]"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-surface-900 dark:text-white">{conv.name}</h3>
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${statusClass(conv.status)}`}>
                    {conv.status}
                  </span>
                </div>
                <p className="text-sm text-surface-500 dark:text-surface-400" dir="ltr">{conv.phone}</p>
                <p className="text-sm leading-6 text-surface-700 dark:text-surface-300">{conv.summary}</p>
              </div>
              <div className="flex items-start gap-1.5 text-sm text-surface-400">
                <Clock3 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {conv.time}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-surface-300 dark:border-surface-700 p-8 text-center">
            <MessageSquareText className="w-8 h-8 mx-auto mb-3 text-surface-300 dark:text-surface-600" />
            <p className="text-sm text-surface-500 dark:text-surface-400">
              لا توجد محادثات بعد. ستظهر هنا بعد ربط WhatsApp واستقبال أول رسالة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
