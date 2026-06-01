"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type FilterPeriod = "today" | "month" | "year";

const FILTERS: { key: FilterPeriod; label: string }[] = [
  { key: "year",  label: "السنة"  },
  { key: "month", label: "الشهر" },
  { key: "today", label: "اليوم"  },
];

interface Invoice {
  id: string;
  invoice_number: string;
  buyer_name: string | null;
  total_amount: number | string;
  vat_amount: number | string;
  issued_at: string;
  status: string;
}

interface Props {
  invoices: Invoice[];
}

function filterByPeriod(invoices: Invoice[], period: FilterPeriod): Invoice[] {
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const year  = today.slice(0, 4);
  if (period === "today") return invoices.filter((i) => i.issued_at.slice(0, 10) === today);
  if (period === "month") return invoices.filter((i) => i.issued_at.slice(0, 7) === month);
  return invoices.filter((i) => i.issued_at.slice(0, 4) === year);
}

function downloadCSV(invoices: Invoice[], label: string) {
  const headers = ["رقم الفاتورة", "التاريخ", "الوقت", "صافي المبيعات", "الضريبة", "الإجمالي", "الحالة"];
  const rows = invoices.map((inv) => {
    const d      = new Date(inv.issued_at);
    const date   = d.toLocaleDateString("en-CA");
    const time   = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const net    = (Number(inv.total_amount) - Number(inv.vat_amount)).toFixed(2);
    const status = inv.status === "reported" ? "مبلّغة" : inv.status === "issued" ? "صادرة" : inv.status;
    return [inv.invoice_number, date, time, net, Number(inv.vat_amount).toFixed(2), Number(inv.total_amount).toFixed(2), status];
  });

  const total    = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const vatTotal = invoices.reduce((s, i) => s + Number(i.vat_amount),   0);
  const netTotal = total - vatTotal;
  const summary  = ["المجموع", "", "", netTotal.toFixed(2), vatTotal.toFixed(2), total.toFixed(2), ""];

  const csv  = [headers, ...rows, [], summary].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `musnid-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SalesList({ invoices }: Props) {
  const [filter, setFilter] = useState<FilterPeriod>("today");

  const filtered    = useMemo(() => filterByPeriod(invoices, filter), [invoices, filter]);
  const vatAmount   = useMemo(() => filtered.reduce((s, i) => s + Number(i.vat_amount),   0), [filtered]);
  const totalAmount = useMemo(() => filtered.reduce((s, i) => s + Number(i.total_amount), 0), [filtered]);
  const netSales    = totalAmount - vatAmount;
  const filterLabel = FILTERS.find((f) => f.key === filter)!.label;

  const stats = [
    { label: "مبيعات",         value: netSales.toFixed(2),        color: "#14b8a6" },
    { label: "ضريبة",          value: vatAmount.toFixed(2),       color: "#f59e0b" },
    { label: "عدد الفواتير",   value: String(filtered.length),    color: "#7a5af8" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Stats cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-surface-700/50 bg-surface-800/40 p-3 dark:bg-surface-800/30"
            style={{ borderTopWidth: 2, borderTopColor: stat.color }}
          >
            <p className="text-right text-sm font-extrabold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="mt-1 text-right text-xs text-surface-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters + export ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => downloadCSV(filtered, filterLabel)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-surface-700 bg-surface-800 px-3 py-2 text-xs font-bold text-surface-400 transition-colors hover:bg-surface-700"
        >
          تصدير
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>

        <div className="flex flex-1 justify-end gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-1 rounded-xl border px-3 py-2 text-xs font-extrabold transition-all ${
                  active
                    ? "border-primary-500/60 bg-primary-500/20 text-primary-400"
                    : "border-surface-700 bg-surface-800 text-surface-400 hover:bg-surface-700"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Invoice list ── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-surface-700 p-8 text-center text-sm text-surface-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3 h-8 w-8 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          لا توجد فواتير في {filterLabel}
        </div>
      ) : (
        <div>
          <p className="mb-3 text-right text-xs font-semibold text-surface-500">
            {filterLabel} · {filtered.length} فاتورة
          </p>
          <div className="space-y-2">
            {filtered.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/sales/${invoice.id}`}
                className="flex items-center rounded-2xl border border-surface-700/50 bg-surface-800/30 p-4 transition-colors hover:bg-surface-800/60"
              >
                {/* Chevron far left */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>

                {/* Invoice info right-aligned */}
                <div className="flex-1 px-3 text-right">
                  <p className="text-sm font-extrabold text-surface-900 dark:text-white">
                    {invoice.invoice_number}
                  </p>
                  <p className="mt-1 text-xs text-surface-500">
                    {new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(
                      new Date(invoice.issued_at),
                    )}
                  </p>
                  {invoice.buyer_name && invoice.buyer_name !== "عميل نقدي" ? (
                    <p className="mt-0.5 text-xs text-surface-400">{invoice.buyer_name}</p>
                  ) : null}
                </div>

                {/* Amount + badge far right */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-extrabold" style={{ color: "#14b8a6" }}>
                    {Number(invoice.total_amount).toFixed(2)} ر.س
                  </p>
                  <span
                    className={`mt-1.5 inline-block rounded-lg px-2 py-0.5 text-xs font-bold ${
                      invoice.status === "rejected"
                        ? "bg-red-900/20 text-red-400"
                        : "bg-primary-900/30 text-primary-400"
                    }`}
                  >
                    {invoice.status === "issued" ? "صادرة" : invoice.status === "reported" ? "مبلّغة" : invoice.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
