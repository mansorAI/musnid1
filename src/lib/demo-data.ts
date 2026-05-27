import type { BusinessType, SubscriptionTier } from "@/types";

export const businessTypeLabels: Record<BusinessType, string> = {
  restaurant: "مطعم",
  cafe: "مقهى",
  clinic: "عيادة",
  salon: "صالون",
  retail: "متجر",
  real_estate: "عقار",
  services: "خدمات",
  other: "نشاط آخر",
};

export const tierLabels: Record<SubscriptionTier, string> = {
  starter: "البداية",
  growth: "النمو",
  business: "الأعمال",
};

export const dashboardStats = [
  { label: "محادثات اليوم", value: "128", delta: "+18%" },
  { label: "طلبات مكتملة", value: "46", delta: "+9%" },
  { label: "متوسط الرد", value: "22ث", delta: "-31%" },
  { label: "رضا العملاء", value: "94%", delta: "+4%" },
];

export const recentConversations = [
  {
    name: "نورة العتيبي",
    phone: "+966 55 124 8890",
    status: "حجز جديد",
    summary: "طلبت موعدًا مساء الخميس وتم اقتراح 3 أوقات متاحة.",
    time: "قبل 4 دقائق",
  },
  {
    name: "فهد المالكي",
    phone: "+966 50 661 3020",
    status: "استفسار",
    summary: "يسأل عن سياسة الإلغاء وخيارات الدفع قبل تأكيد الطلب.",
    time: "قبل 11 دقيقة",
  },
  {
    name: "سارة الحربي",
    phone: "+966 56 778 1142",
    status: "بانتظار موظف",
    summary: "المحادثة تحتاج تدخلًا بشريًا بسبب طلب خصم خاص.",
    time: "قبل 22 دقيقة",
  },
];

export const automationRules = [
  { name: "ترحيب العملاء الجدد", enabled: true, trigger: "أول رسالة واردة" },
  { name: "تأكيد الحجز", enabled: true, trigger: "اختيار موعد متاح" },
  { name: "تصعيد الشكاوى", enabled: false, trigger: "كلمات حساسة" },
];

export const plans = [
  {
    name: "البداية",
    price: "149",
    description: "للنشاط الصغير الذي يحتاج ردودًا ذكية وأساسية.",
    features: ["500 محادثة شهريًا", "قاعدة معرفة واحدة", "تقارير يومية"],
  },
  {
    name: "النمو",
    price: "349",
    description: "للفرق التي تدير طلبات وحجوزات يومية بكثافة.",
    features: ["3,000 محادثة شهريًا", "أتمتة متقدمة", "تكاملات دفع وحجز"],
  },
  {
    name: "الأعمال",
    price: "899",
    description: "للشركات التي تحتاج صلاحيات وقياسات تشغيلية أوسع.",
    features: ["محادثات عالية الحجم", "SLA ودعم أولوية", "تقارير مخصصة"],
  },
];
