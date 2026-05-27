import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "مُسنِد | بوتات WhatsApp ذكية للأعمال",
  description:
    "منصة SaaS سعودية لإدارة بوتات WhatsApp ذكية للحجوزات والطلبات وخدمة العملاء.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
