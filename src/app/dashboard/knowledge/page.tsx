import { BookOpenText } from "lucide-react";
import { createKnowledgeArticle } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getKnowledgeArticles } from "@/lib/dashboard-data";

export default async function KnowledgePage() {
  const articles = await getKnowledgeArticles();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-4 lg:col-span-2">
        <p className="text-sm text-muted-foreground">قاعدة المعرفة</p>
        <h1 className="text-2xl font-bold">المعلومات التي يعتمد عليها المساعد</h1>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>المقالات</CardTitle>
          <BookOpenText className="size-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-4">
          {articles.map((article) => (
            <article key={article.id} className="rounded-md border p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{article.title}</h2>
                <span className="rounded-md bg-success/10 px-2 py-1 text-xs text-success">
                  {article.enabled ? "مفعلة" : "متوقفة"}
                </span>
              </div>
              <p className="mt-3 leading-7 text-muted-foreground">{article.content}</p>
            </article>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إضافة معرفة</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createKnowledgeArticle} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان</Label>
              <Input id="title" name="title" placeholder="مثال: ساعات العمل" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">المحتوى</Label>
              <textarea
                id="content"
                name="content"
                className="min-h-32 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="اكتب إجابة واضحة ليستخدمها المساعد في الردود."
              />
            </div>
            <Button type="submit" className="w-full">
              حفظ
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
