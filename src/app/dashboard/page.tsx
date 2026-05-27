import { Bot, CheckCircle2, Clock3, MessageSquareText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats } from "@/lib/demo-data";
import { getAutomations, getDemoConversations } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const automations = await getAutomations();
  const conversations = getDemoConversations();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-muted-foreground">لوحة تحكم مُسنِد</p>
        <h1 className="text-2xl font-bold">نظرة تشغيلية مباشرة</h1>
      </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="rounded-md bg-success/10 px-2 py-1 text-sm font-medium text-success">
                  {stat.delta}
                </span>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>آخر المحادثات</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  نماذج بيانات مؤقتة حتى ربط جداول Supabase.
                </p>
              </div>
              <MessageSquareText className="size-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              {conversations.map((conversation) => (
                <article
                  key={conversation.phone}
                  className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{conversation.name}</h2>
                      <span className="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground">
                        {conversation.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{conversation.phone}</p>
                    <p className="leading-7">{conversation.summary}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{conversation.time}</span>
                </article>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>حالة المساعد</CardTitle>
                <Bot className="size-5 text-primary" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-primary px-4 py-5 text-primary-foreground">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="size-4" />
                    جاهز لاستقبال المحادثات
                  </div>
                  <p className="mt-3 text-3xl font-bold">87%</p>
                  <p className="mt-1 text-sm opacity-90">من الردود عولجت آليًا اليوم.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border p-3">
                    <Clock3 className="mb-2 size-4 text-warning" />
                    6 محادثات بانتظار مراجعة
                  </div>
                  <div className="rounded-md border p-3">
                    <CheckCircle2 className="mb-2 size-4 text-success" />
                    42 ردًا مؤكدًا
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الأتمتة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {automations.map((rule) => (
                  <div key={rule.name} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.trigger}</p>
                    </div>
                    <span
                      className={
                        rule.enabled
                          ? "rounded-md bg-success/10 px-2 py-1 text-xs text-success"
                          : "rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                      }
                    >
                      {rule.enabled ? "مفعلة" : "متوقفة"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
    </div>
  );
}
