export type OrderMode = "pickup" | "delivery";

export type MenuItemLite = {
  id: string;
  name: string;
  price: number;
  is_available?: boolean;
};

export type PaidAddon = {
  name: string;
  price: number;
  aliases?: string[];
};

export type OrderLine = {
  item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
};

export type AddonLine = {
  name: string;
  price: number;
};

export type RestaurantOrderDraft = {
  lines: OrderLine[];
  addons: AddonLine[];
  notes: string[];
  mode?: OrderMode;
  address?: string;
  step: "mode" | "address" | "notes" | "addon_confirm" | "confirm";
  pending_addon?: AddonLine;
};

export type BotTurnInput = {
  text: string;
  menu: MenuItemLite[];
  customerPhone: string;
  draft?: RestaurantOrderDraft | null;
  paidAddons?: PaidAddon[];
};

export type BotTurnResult = {
  handled: boolean;
  reply: string;
  draft: RestaurantOrderDraft | null;
  orderSummary?: string;
};

const YES_WORDS = ["نعم", "ايه", "اي", "اوافق", "موافق", "تمام", "اوكي", "ok", "yes", "yep"];
const NO_WORDS = ["لا", "لأ", "مو", "الغاء", "no"];
const PICKUP_WORDS = ["استلام", "استلم", "اجي", "اجيكم", "من الفرع", "استلام من الفرع"];
const DELIVERY_WORDS = ["توصيل", "وصل", "يوصل", "البيت", "الموقع", "عنوان"];
const ORDER_INTENT_WORDS = ["ابي", "ابغى", "اطلب", "طلب", "خذ", "جهز", "واحد", "اثنين", "حبة", "حبتين"];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, words: string[]) {
  const normalized = normalize(text);
  return words.some((word) => normalized.includes(normalize(word)));
}

function parseQuantity(text: string, itemName: string) {
  const normalized = normalize(text);
  const itemIndex = normalized.indexOf(normalize(itemName));
  const beforeItem = itemIndex > -1 ? normalized.slice(Math.max(0, itemIndex - 14), itemIndex) : normalized;
  const number = beforeItem.match(/\d+/)?.[0] ?? normalized.match(/\d+/)?.[0];

  if (number) return Math.max(1, parseInt(number, 10));
  if (includesAny(text, ["اثنين", "ثنتين", "حبتين", "٢"])) return 2;
  if (includesAny(text, ["ثلاث", "ثلاثه", "٣"])) return 3;
  return 1;
}

function findRequestedItems(text: string, menu: MenuItemLite[]) {
  const normalizedText = normalize(text);
  return menu
    .filter((item) => item.is_available !== false)
    .filter((item) => normalizedText.includes(normalize(item.name)))
    .map((item) => ({
      item_id: item.id,
      name: item.name,
      quantity: parseQuantity(text, item.name),
      unit_price: item.price,
    }));
}

function findPaidAddon(text: string, paidAddons: PaidAddon[] = []) {
  const normalizedText = normalize(text);
  return paidAddons.find((addon) => {
    const aliases = [addon.name, ...(addon.aliases ?? [])];
    return aliases.some((alias) => normalizedText.includes(normalize(alias)));
  });
}

function calculateTotal(draft: RestaurantOrderDraft) {
  const itemsTotal = draft.lines.reduce((sum, line) => sum + line.quantity * line.unit_price, 0);
  const addonsTotal = draft.addons.reduce((sum, addon) => sum + addon.price, 0);
  return itemsTotal + addonsTotal;
}

function formatItems(draft: RestaurantOrderDraft) {
  return draft.lines
    .map((line) => `- ${line.quantity > 1 ? `${line.quantity} x ` : ""}${line.name}`)
    .join("\n");
}

function formatAddons(draft: RestaurantOrderDraft) {
  return draft.addons.length
    ? draft.addons.map((addon) => `- ${addon.name} +${addon.price} ر.س`).join("\n")
    : "- لا يوجد";
}

function formatNotes(draft: RestaurantOrderDraft) {
  return draft.notes.length ? draft.notes.map((note) => `- ${note}`).join("\n") : "- لا يوجد";
}

export function formatRestaurantOrderSummary(draft: RestaurantOrderDraft, customerPhone: string) {
  const mode = draft.mode === "delivery" ? "توصيل" : "استلام";
  const address = draft.mode === "delivery" && draft.address ? `\nالعنوان:\n- ${draft.address}` : "";

  return [
    "طلب جديد:",
    `العميل: ${customerPhone}`,
    `طريقة الطلب: ${mode}`,
    "الأصناف:",
    formatItems(draft),
    "الإضافات:",
    formatAddons(draft),
    "الملاحظات:",
    formatNotes(draft),
    address.trim(),
    `الإجمالي: ${calculateTotal(draft)} ر.س`,
  ].filter(Boolean).join("\n");
}

function formatCustomerConfirmation(draft: RestaurantOrderDraft) {
  const mode = draft.mode === "delivery" ? "توصيل" : "استلام من الفرع";
  return [
    "ملخص طلبك:",
    formatItems(draft),
    draft.addons.length ? "الإضافات:" : "",
    draft.addons.length ? formatAddons(draft) : "",
    draft.notes.length ? "الملاحظات:" : "",
    draft.notes.length ? formatNotes(draft) : "",
    `طريقة الطلب: ${mode}`,
    draft.mode === "delivery" && draft.address ? `العنوان: ${draft.address}` : "",
    `الإجمالي: ${calculateTotal(draft)} ر.س`,
    "هل تؤكد الطلب؟",
  ].filter(Boolean).join("\n");
}

export function processRestaurantOrderTurn(input: BotTurnInput): BotTurnResult {
  const text = input.text.trim();
  const draft = input.draft
    ? { ...input.draft, lines: [...input.draft.lines], addons: [...input.draft.addons], notes: [...input.draft.notes] }
    : null;

  if (!draft) {
    const lines = findRequestedItems(text, input.menu);
    if (!lines.length) {
      return {
        handled: includesAny(text, ORDER_INTENT_WORDS),
        draft: null,
        reply: "حاضر. اكتب لي الأصناف التي ترغب بطلبها من القائمة، مثل: برجر دجاج وبيبسي.",
      };
    }

    const nextDraft: RestaurantOrderDraft = { lines, addons: [], notes: [], step: "mode" };
    return {
      handled: true,
      draft: nextDraft,
      reply: `تم اختيار:\n${formatItems(nextDraft)}\n\nتبغى استلام من الفرع أو توصيل؟`,
    };
  }

  if (draft.step === "mode") {
    if (includesAny(text, PICKUP_WORDS)) {
      draft.mode = "pickup";
      draft.step = "notes";
      return { handled: true, draft, reply: "تمام، استلام من الفرع. هل عندك ملاحظات على الطلب؟ مثل بدون كاتشب أو زيادة مايونيز." };
    }
    if (includesAny(text, DELIVERY_WORDS)) {
      draft.mode = "delivery";
      draft.step = "address";
      return { handled: true, draft, reply: "تمام، توصيل. أرسل موقعك أو اكتب العنوان بالتفصيل." };
    }
    return { handled: true, draft, reply: "اختر طريقة الطلب: استلام من الفرع أو توصيل؟" };
  }

  if (draft.step === "address") {
    draft.address = text;
    draft.step = "notes";
    return { handled: true, draft, reply: "وصل العنوان. هل عندك ملاحظات على الطلب؟ مثل بدون كاتشب أو زيادة مايونيز." };
  }

  if (draft.step === "notes") {
    if (!includesAny(text, NO_WORDS)) {
      const paidAddon = findPaidAddon(text, input.paidAddons);
      if (paidAddon) {
        draft.pending_addon = { name: paidAddon.name, price: paidAddon.price };
        draft.step = "addon_confirm";
        return {
          handled: true,
          draft,
          reply: `${paidAddon.name} عليها تكلفة ${paidAddon.price} ر.س. هل تريد إضافتها؟`,
        };
      }
      draft.notes.push(text);
    }

    draft.step = "confirm";
    return { handled: true, draft, reply: formatCustomerConfirmation(draft) };
  }

  if (draft.step === "addon_confirm") {
    if (draft.pending_addon && includesAny(text, YES_WORDS)) {
      draft.addons.push(draft.pending_addon);
    } else if (draft.pending_addon && !includesAny(text, NO_WORDS)) {
      return { handled: true, draft, reply: "هل تريد إضافة هذه الإضافة؟ اكتب نعم أو لا." };
    }
    delete draft.pending_addon;
    draft.step = "confirm";
    return { handled: true, draft, reply: formatCustomerConfirmation(draft) };
  }

  if (draft.step === "confirm") {
    if (includesAny(text, YES_WORDS)) {
      return {
        handled: true,
        draft: null,
        reply: "تم تأكيد طلبك. سيتم مراجعته من المطعم الآن.",
        orderSummary: formatRestaurantOrderSummary(draft, input.customerPhone),
      };
    }
    if (includesAny(text, NO_WORDS)) {
      return { handled: true, draft: null, reply: "تم إلغاء الطلب. تقدر تبدأ طلب جديد في أي وقت." };
    }
    return { handled: true, draft, reply: "هل تؤكد الطلب؟ اكتب نعم للتأكيد أو لا للإلغاء." };
  }

  return { handled: false, draft: null, reply: "" };
}
