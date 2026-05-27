import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCustomers } from "@/lib/dashboard-data";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-muted-foreground">إدارة العملاء</p>
        <h1 className="text-2xl font-bold">سجل العملاء والمحادثات</h1>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>العملاء</CardTitle>
          <Users className="size-5 text-primary" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>رقم الجوال</TableHead>
                <TableHead>الوسوم</TableHead>
                <TableHead>آخر ظهور</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell dir="ltr" className="text-right">
                    {customer.phone}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-accent px-2 py-1 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.last_seen_at ? "اليوم" : "غير متاح"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
