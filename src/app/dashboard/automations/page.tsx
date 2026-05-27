import { Bot } from "lucide-react";
import { createAutomation } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAutomations } from "@/lib/dashboard-data";

export default async function AutomationsPage() {
  const automations = await getAutomations();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4 lg:col-span-2">
        <p className="text-sm text-muted-foreground">الأتمتة</p>
        <h1 className="text-2xl font-bold">قواعد الرد والتصعيد</h1>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>القواعد الحالية</CardTitle>
          <Bot className="size-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-4">
          {automations.map((automation) => (
            <article key={automation.id} className="rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{automation.name}</h2>
                <span
                  className={
                    automation.enabled
                      ? "rounded-md bg-success/10 px-2 py-1 text-xs text-success"
                      : "rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  }
                >
                  {automation.enabled ? "مفعلة" : "متوقفة"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{automation.trigger}</p>
              <p className="mt-3 leading-7">{automation.response}</p>
            </article>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إضافة قاعدة</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAutomation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم القاعدة</Label>
              <Input id="name" name="name" placeholder="مثال: تأكيد الحجز" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trigger">المحفز</Label>
              <Input id="trigger" name="trigger" placeholder="مثال: عند اختيار موعد" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="response">الرد</Label>
              <textarea
                id="response"
                name="response"
                className="min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="اكتب نص الرد أو تعليمات المساعد."
              />
            </div>
            <Button type="submit" className="w-full">
              حفظ القاعدة
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
