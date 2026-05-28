import { getConversations, getCurrentBusiness } from "@/lib/dashboard-data";
import { RealtimeConversations } from "./realtime-conversations";

export default async function ConversationsPage() {
  const [business, initialConversations] = await Promise.all([
    getCurrentBusiness(),
    getConversations(),
  ]);

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-surface-500 dark:text-surface-400">المحادثات</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">المحادثات النشطة</h1>
      </section>

      <RealtimeConversations
        initialConversations={initialConversations}
        businessId={business?.id ?? null}
      />
    </div>
  );
}
