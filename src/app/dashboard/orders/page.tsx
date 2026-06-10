import { getCurrentBusiness } from "@/lib/dashboard-data";
import { createClient } from "@/lib/supabase/server";
import { issueOrderInvoice, rejectOrder, sendOrderMessage } from "./actions";

export default async function OrdersPage() {
  const business = await getCurrentBusiness();
  if (!business) return null;
  const supabase = await createClient() as any;
  await supabase.rpc("expire_overdue_zone_orders");
  const { data: orders = [] } = await supabase.from("customer_interactions").select("*,interaction_items(*),order_messages(*)").eq("business_id", business.id).eq("type", "order").eq("status", "pending_payment").order("created_at", { ascending: false });

  return (
    <main className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">طلبات بانتظار الدفع</h1>
        <p className="mt-1 text-sm text-surface-500">تواصل مع العميل، ثم أصدر الفاتورة بعد استلام المبلغ أو ارفض الطلب.</p>
      </div>
      {!orders.length ? <div className="glass-card p-8 text-center text-surface-500">لا توجد طلبات معلقة حالياً.</div> : (
        <div className="grid gap-5">
          {orders.map((order: any) => (
            <section key={order.id} className="glass-card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-surface-900 dark:text-white">{order.metadata?.customer_name ?? "عميل زون"}</p>
                  <p className="text-xs text-amber-600">تنتهي المهلة: {order.payment_expires_at ? new Date(order.payment_expires_at).toLocaleString("ar-SA") : "غير محددة"}</p>
                </div>
                <p className="text-xl font-extrabold text-primary-600">{Number(order.total_amount).toFixed(2)} ر.س</p>
              </div>
              <div className="space-y-2">{(order.interaction_items ?? []).map((item: any) => <div key={item.id} className="rounded-xl bg-surface-50 p-3 text-sm dark:bg-surface-800">{Number(item.qty)} × {item.name}</div>)}</div>
              <div className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-surface-200 p-3 dark:border-surface-700">
                {(order.order_messages ?? []).map((msg: any) => <p key={msg.id} className={`rounded-lg p-2 text-sm ${msg.sender_role === "business" ? "bg-primary-50 text-primary-800" : "bg-surface-100 dark:bg-surface-800"}`}>{msg.message}</p>)}
              </div>
              <form action={sendOrderMessage} className="flex gap-2">
                <input type="hidden" name="interaction_id" value={order.id} />
                <input name="message" required placeholder="أرسل رقم الحساب أو تعليمات الدفع" className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800" />
                <button className="btn-primary px-5">إرسال</button>
              </form>
              <div className="flex flex-wrap gap-2">
                <form action={issueOrderInvoice} className="flex flex-1 gap-2">
                  <input type="hidden" name="interaction_id" value={order.id} />
                  <select name="payment_method" defaultValue="bank_transfer" className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-3 dark:border-surface-700 dark:bg-surface-800">
                    <option value="bank_transfer">تحويل بنكي</option><option value="cash">نقدي</option><option value="card">بطاقة</option><option value="other">أخرى</option>
                  </select>
                  <button className="btn-primary px-4">إصدار فاتورة وإتمام الطلب</button>
                </form>
                <form action={rejectOrder}><input type="hidden" name="interaction_id" value={order.id} /><button className="rounded-xl border border-red-300 px-5 py-3 font-bold text-red-600">رفض الطلب</button></form>
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
