import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import Script from "next/script";
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
        <Script
          id="facebook-sdk"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                FB.init({
                  appId: '${process.env.NEXT_PUBLIC_META_APP_ID ?? "1362170689306733"}',
                  cookie: true,
                  xfbml: true,
                  version: 'v19.0'
                });
              };
              (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
              }(document, 'script', 'facebook-jssdk'));
            `,
          }}
        />
      </body>
    </html>
  );
}
