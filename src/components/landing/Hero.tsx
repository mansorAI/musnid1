import { ArrowLeft, MessageSquare, Play, Sparkles, Users, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center gradient-bg-subtle overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 dark:bg-primary-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-400/10 dark:bg-accent-500/5 rounded-full blur-3xl animate-float delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-300/5 rounded-full blur-3xl" />
      </div>

      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-right order-2 lg:order-1">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                منصة سحابية لإدارة محادثات واتساب
              </div>
            </div>

            <h1 className="section-title !text-4xl md:!text-5xl lg:!text-6xl mb-6 animate-fade-in-up text-surface-900 dark:text-white">
              أدِ محادثاتك على{" "}
              <span className="gradient-text">واتساب</span>
              <br />
              باحترافية مطلقة
            </h1>

            <p className="section-subtitle mx-auto lg:mx-0 mb-8 animate-fade-in-up delay-200">
              مُسند يساعدك على إدارة محادثات العملاء، أتمتة الردود، وبناء قاعدة معرفية من لوحة
              تحكم واحدة بسيطة. وفّر وقتك وحسّن جودة خدمتك.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-300">
              <Link href="/sign-in" className="btn-primary text-lg">
                ابدأ مجاناً
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="btn-secondary group">
                <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                شاهد كيف يعمل
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 justify-center lg:justify-start animate-fade-in-up delay-400">
              {[
                { icon: Users, label: "+2,000 عميل نشط", color: "accent" },
                { icon: Zap, label: "توفير 60% من الوقت", color: "primary" },
                { icon: Shield, label: "أمان متقدم", color: "accent" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      color === "accent"
                        ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"
                        : "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 animate-fade-in delay-200">
            <div className="relative">
              <div className="absolute inset-0 gradient-bg rounded-3xl blur-2xl opacity-20 scale-95" />
              <div className="relative glass-card p-4 md:p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-200/50 dark:border-surface-700/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-surface-900 dark:text-white">لوحة تحكم مُسند</div>
                      <div className="text-xs text-surface-500">محادثات نشطة</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-accent-400" />
                    <div className="w-3 h-3 rounded-full bg-primary-400" />
                    <div className="w-3 h-3 rounded-full bg-surface-300 dark:bg-surface-600" />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "أحمد المطعم", msg: "أريد حجز طاولة لـ5 أشخاص", time: "الآن", unread: 3, color: "primary" },
                    { name: "عيادة النور", msg: "موعد غدًا الساعة 10", time: "5 دقائق", unread: 1, color: "accent" },
                    { name: "متجر الأناقة", msg: "هل المتجر متاح التوصيل؟", time: "12 دقيقة", unread: 0, color: "primary" },
                    { name: "صالون فينوس", msg: "شكراً لكم، تم التأكيد", time: "30 دقيقة", unread: 0, color: "accent" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/80 dark:bg-surface-800/50 hover:bg-surface-100/80 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          item.color === "primary" ? "gradient-bg" : "bg-gradient-to-l from-accent-500 to-accent-600"
                        }`}
                      >
                        {item.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-bold text-surface-900 dark:text-white truncate">{item.name}</span>
                          <span className="text-xs text-surface-400 shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{item.msg}</p>
                      </div>
                      {item.unread > 0 && (
                        <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {item.unread}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-surface-200/50 dark:border-surface-700/30 grid grid-cols-3 gap-3">
                  {[
                    { label: "محادثات", value: "128" },
                    { label: "مكتملة", value: "94" },
                    { label: "متوسط الرد", value: "3د" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-2 rounded-lg bg-surface-50/80 dark:bg-surface-800/50">
                      <div className="text-lg font-extrabold text-primary-600 dark:text-primary-400">{stat.value}</div>
                      <div className="text-[10px] text-surface-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
