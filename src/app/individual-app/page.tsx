import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function IndividualAppPage() {
  return (
    <main className="min-h-screen gradient-bg-subtle flex items-center justify-center px-4 py-10">
      <section className="glass-card w-full max-w-md p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          <Smartphone className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">
          لا يمكن دخول الأفراد من هنا
        </h1>
        <p className="mt-3 leading-7 text-surface-500 dark:text-surface-400">
          هذا الموقع مخصص للمنشآت ولوحة التحكم. لدخول حساب الأفراد، حمّل تطبيق مُسند واستخدمه من الجوال.
        </p>
        <Link href="/sign-in" className="btn-secondary mt-6 inline-flex w-full justify-center">
          العودة لتسجيل الدخول
        </Link>
      </section>
    </main>
  );
}
