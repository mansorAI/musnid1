import type { EmployeeActionType } from "@/types/database";

export const ACTION_LABEL: Record<EmployeeActionType, string> = {
  clock_in:        "دخول الكاشير",
  clock_out:       "خروج الكاشير",
  invoice_created: "إصدار فاتورة",
  invoice_deleted: "حذف فاتورة",
  product_added:   "إضافة منتج",
  product_updated: "تعديل منتج",
  product_deleted: "حذف منتج",
};
