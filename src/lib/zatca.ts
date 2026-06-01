export type TaxMode = "none" | "inclusive" | "exclusive";

export type InvoiceSettings = {
  sellerName: string;
  vatNumber: string;
  taxMode: TaxMode;
  vatRate: number;
};

export type InvoiceLineInput = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceTotals = {
  subtotal: number;
  taxTotal: number;
  total: number;
};

const encoder = new TextEncoder();

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function tlv(tag: number, value: string) {
  const bytes = encoder.encode(value);
  return [tag, bytes.length, ...bytes];
}

export function calculateInvoiceTotals(
  lines: InvoiceLineInput[],
  settings: Pick<InvoiceSettings, "taxMode" | "vatRate">,
): InvoiceTotals {
  const gross = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const rate = settings.taxMode === "none" ? 0 : settings.vatRate;

  if (settings.taxMode === "inclusive" && rate > 0) {
    const subtotal = gross / (1 + rate);
    const taxTotal = gross - subtotal;
    return {
      subtotal: roundMoney(subtotal),
      taxTotal: roundMoney(taxTotal),
      total: roundMoney(gross),
    };
  }

  const taxTotal = settings.taxMode === "exclusive" ? gross * rate : 0;
  return {
    subtotal: roundMoney(gross),
    taxTotal: roundMoney(taxTotal),
    total: roundMoney(gross + taxTotal),
  };
}

export function splitLineTax(
  line: InvoiceLineInput,
  settings: Pick<InvoiceSettings, "taxMode" | "vatRate">,
) {
  return calculateInvoiceTotals([line], settings);
}

export function generateInvoiceNumber(sequence: number, date = new Date()) {
  return `INV-${date.getFullYear()}-${String(sequence).padStart(6, "0")}`;
}

export function generateZatcaQrPayload(input: {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  total: number;
  taxTotal: number;
}) {
  const bytes = [
    ...tlv(1, input.sellerName),
    ...tlv(2, input.vatNumber),
    ...tlv(3, input.timestamp),
    ...tlv(4, input.total.toFixed(2)),
    ...tlv(5, input.taxTotal.toFixed(2)),
  ];

  return Buffer.from(bytes).toString("base64");
}

export function getDefaultInvoiceSettings(sellerName = "مسند") {
  return {
    sellerName,
    vatNumber: "",
    taxMode: "exclusive" as TaxMode,
    vatRate: 0.15,
  };
}

export function parseInvoiceSettings(value: unknown, sellerName = "مسند"): InvoiceSettings {
  const defaults = getDefaultInvoiceSettings(sellerName);
  if (!value || typeof value !== "object") return defaults;

  const settings = value as Partial<InvoiceSettings>;
  return {
    sellerName: settings.sellerName || defaults.sellerName,
    vatNumber: settings.vatNumber || "",
    taxMode:
      settings.taxMode === "none" || settings.taxMode === "inclusive" || settings.taxMode === "exclusive"
        ? settings.taxMode
        : defaults.taxMode,
    vatRate: typeof settings.vatRate === "number" ? settings.vatRate : defaults.vatRate,
  };
}
