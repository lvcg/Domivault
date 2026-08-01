export type OcrExtractedFields = {
  vendor?: string;
  amount?: string;
  date?: string;
  phone?: string;
  invoiceNumber?: string;
  warrantyExpires?: string;
};

export type OcrDocumentAnalysis = {
  document_type: "Receipt" | "Invoice" | "Warranty" | "Service Record" | "Form" | "Document";
  confidence_score: "High" | "Medium" | "Low";
  extracted_data: {
    document_date?: string;
    total_amount?: string;
    sender_vendor_name?: string;
    phone?: string;
    invoice_number?: string;
    warranty_expires?: string;
    line_items: Array<{ description: string; amount?: string }>;
    key_value_pairs: Record<string, string>;
  };
  raw_ocr_notes: string;
};

const brokenSymbolCluster = /(?:[^\w\s$.,:/#@&%()+-]){3,}/g;
const allowedLineCharacters = /[A-Za-z0-9$]/;

function symbolRatio(value: string) {
  if (!value.length) return 1;
  const symbols = value.replace(/[A-Za-z0-9\s$.,:/#@&%()+-]/g, "").length;
  return symbols / value.length;
}

function normalizeOcrLine(line: string) {
  return line
    .replace(/[|]{2,}/g, "|")
    .replace(/[\u201c\u201d]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2022\u00b7]/g, "-")
    .replace(/\bO(?=\d)/g, "0")
    .replace(/\bI(?=\d)/g, "1")
    .replace(/\b[l|](?=\d)/g, "1")
    .replace(/(?<=\d)O\b/g, "0")
    .replace(/\bS(?=\d{1,7}(?:[,.]\d{2})?\b)/g, "$$")
    .replace(/(?<=\d)[Oo](?=\d{2}\b)/g, "0")
    .replace(/(\$?\s?\d{1,5}),(\d{2})\b/g, "$1.$2")
    .replace(/(\$?\s?\d{1,5})\s+(\d{2})\b/g, "$1.$2")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([:.,])/g, "$1")
    .trim();
}

export function sanitizeOcrText(rawText: string) {
  const normalized = rawText
    .replace(/-\s*\r?\n\s*/g, "")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/(?:[#@&%()+-]){4,}/g, " ")
    .replace(brokenSymbolCluster, " ");

  const lines = normalized
    .split(/\n+/)
    .map(normalizeOcrLine)
    .filter((line) => line.length > 1)
    .filter((line) => allowedLineCharacters.test(line))
    .filter((line) => symbolRatio(line) < 0.35);

  return lines.join("\n").trim();
}

function normalizeDate(value: string) {
  const trimmed = value.trim();
  const numeric = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!numeric) return trimmed;
  const [, month, day, year] = numeric;
  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeMoney(value: string) {
  const cleaned = value.replace(/\s/g, "").replace(/,/g, ".");
  const match = cleaned.match(/\$?\d{1,7}(?:\.\d{2})?/);
  if (!match) return cleaned;
  const amount = match[0].startsWith("$") ? match[0] : `$${match[0]}`;
  return amount.includes(".") ? amount : `${amount}.00`;
}

export function extractOcrFields(text: string): OcrExtractedFields {
  const cleanText = sanitizeOcrText(text);
  const lines = cleanText.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const vendor = lines.find((line) => (
    /[A-Za-z]{3,}/.test(line)
    && !/(receipt|invoice|total|subtotal|amount|balance|paid|date|thank you|cashier)/i.test(line)
    && line.length <= 80
  ));
  const amountMatch = cleanText.match(/(?:grand\s+total|total|amount\s+due|amount|paid|balance)\D{0,16}(\$?\s?\d{1,5}(?:,\d{3})*(?:[,.]\d{2})?)/i);
  const priceMatches = [...cleanText.matchAll(/\$?\s?(\d{1,5}(?:,\d{3})*(?:[,.]\d{2}))\b/g)];
  const dateMatch = cleanText.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4})\b/i);
  const phoneMatch = cleanText.match(/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/);
  const invoiceMatch = cleanText.match(/\b(?:invoice|inv|receipt|order|serial|model)\s*(?:#|no\.?|number|:)?\s*([A-Z0-9-]{4,})\b/i);
  const warrantyMatch = cleanText.match(/\b(?:warranty|expires?|coverage)\D{0,24}(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/i);

  return {
    ...(vendor ? { vendor } : {}),
    ...(amountMatch ? { amount: normalizeMoney(amountMatch[1]) } : priceMatches.length ? { amount: normalizeMoney(priceMatches[priceMatches.length - 1][1]) } : {}),
    ...(dateMatch ? { date: normalizeDate(dateMatch[1]) } : {}),
    ...(phoneMatch ? { phone: phoneMatch[0] } : {}),
    ...(invoiceMatch ? { invoiceNumber: invoiceMatch[1] } : {}),
    ...(warrantyMatch ? { warrantyExpires: normalizeDate(warrantyMatch[1]) } : {}),
  };
}

function classifyDocument(text: string): OcrDocumentAnalysis["document_type"] {
  if (/warranty|coverage|serial|model/i.test(text)) return "Warranty";
  if (/invoice|amount due|balance due/i.test(text)) return "Invoice";
  if (/receipt|subtotal|cashier|thank you|paid/i.test(text)) return "Receipt";
  if (/service|repair|technician|labor/i.test(text)) return "Service Record";
  if (/form|application|signature/i.test(text)) return "Form";
  return "Document";
}

function extractKeyValuePairs(lines: string[]) {
  return lines.reduce<Record<string, string>>((pairs, line) => {
    const match = line.match(/^([A-Za-z][A-Za-z0-9 /#&()+-]{1,34})\s*[:|-]\s*(.{2,80})$/);
    if (match) pairs[match[1].trim().toLowerCase().replace(/\s+/g, "_")] = match[2].trim();
    return pairs;
  }, {});
}

function extractLineItems(lines: string[]) {
  return lines
    .map((line) => {
      const match = line.match(/^(.{3,70}?)\s+(\$?\s?\d{1,5}(?:[,.]\d{2})?)$/);
      if (!match || /(total|subtotal|tax|balance|amount|paid)/i.test(match[1])) return null;
      return { description: match[1].trim(), amount: normalizeMoney(match[2]) };
    })
    .filter((item): item is { description: string; amount: string } => Boolean(item))
    .slice(0, 12);
}

export function analyzeOcrDocument(rawText: string): OcrDocumentAnalysis {
  const text = sanitizeOcrText(rawText);
  const fields = extractOcrFields(text);
  const lines = text.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const foundFieldCount = [fields.date, fields.amount, fields.vendor, fields.invoiceNumber, fields.warrantyExpires].filter(Boolean).length;
  const confidenceScore: OcrDocumentAnalysis["confidence_score"] = text.length > 80 && foundFieldCount >= 3
    ? "High"
    : text.length > 30 && foundFieldCount >= 1
      ? "Medium"
      : "Low";

  return {
    document_type: classifyDocument(text),
    confidence_score: confidenceScore,
    extracted_data: {
      ...(fields.date ? { document_date: fields.date } : {}),
      ...(fields.amount ? { total_amount: fields.amount } : {}),
      ...(fields.vendor ? { sender_vendor_name: fields.vendor } : {}),
      ...(fields.phone ? { phone: fields.phone } : {}),
      ...(fields.invoiceNumber ? { invoice_number: fields.invoiceNumber } : {}),
      ...(fields.warrantyExpires ? { warranty_expires: fields.warrantyExpires } : {}),
      line_items: extractLineItems(lines),
      key_value_pairs: extractKeyValuePairs(lines),
    },
    raw_ocr_notes: confidenceScore === "Low"
      ? "OCR confidence is low. Review the extracted text against the original document."
      : "OCR text was cleaned and normalized for review.",
  };
}
