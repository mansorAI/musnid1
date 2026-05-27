import { Settings } from "lucide-react";
import { createOrganization } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessTypeLabels } from "@/lib/demo-data";
import { getCurrentOrganization } from "@/lib/dashboard-data";
import type { BusinessType } from "@/types";

const businessTypes = Object.entries(businessTypeLabels) as [BusinessType, string][];

export default async function SettingsPage() {
  const organization = await getCurrentOrganization();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section className="space-y-4 lg:col-span-2">
        <p className="text-sm text-muted-foreground">الإعداد</p>
        <h1 className="text-2xl font-bold">بيانات النشاط وربط WhatsApp</h1>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>النشاط الحالي</CardTitle>
          <Settings className="size-5 text-primary" />
        </CardHeader>
        <CardContent className="space-y-4">
          {organization ? (
            <>
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">اسم النشاط</p>
                <p className="mt-1 text-xl font-semibold">{organization.name}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">المدينة</p>
                  <p className="mt-1 font-medium">{organization.city ?? "غير محددة"}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">رقم WhatsApp</p>
                  <p className="mt-1 font-medium" dir="ltr">
                    {organization.whatsapp_number ?? "غير مربوط"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-warning/30 bg-warning/10 p-4 text-sm leading-7">
              لا يوجد نشاط حقيقي مربوط في هذه البيئة. املأ النموذج بعد إعداد Supabase
              وتسجيل الدخول لإنشاء أول منظمة.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إنشاء النشاط</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم النشاط</Label>
              <Input id="name" name="name" placeholder="مثال: عيادة النخبة" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_type">نوع النشاط</Label>
              <Select name="business_type" defaultValue="services">
                <SelectTrigger id="business_type" className="w-full">
                  <SelectValue placeholder="اختر نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">المدينة</Label>
              <Input id="city" name="city" placeholder="الرياض" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">رقم WhatsApp</Label>
              <Input id="whatsapp_number" name="whatsapp_number" dir="ltr" placeholder="+9665..." />
            </div>
            <Button type="submit" className="w-full">
              حفظ النشاط
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
