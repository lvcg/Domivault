export type OcrExtractedFields = {
  vendor?: string;
  amount?: string;
  date?: string;
  phone?: string;
  invoiceNumber?: string;
  warrantyExpires?: string;
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
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[•·]/g, "-")
    .replace(/\bO(?=\d)/g, "0")
    .replace(/\bI(?=\d)/g, "1")
    .replace(/(?<=\d)O\b/g, "0")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([:.,])/g, "$1")
    .trim();
}

export function sanitizeOcrText(rawText: string) {
  const normalized = rawText
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(brokenSymbolCluster, " ");

  const lines = normalized
    .split(/\n+/)
    .map(normalizeOcrLine)
    .filter((line) => line.length > 1)
    .filter((line) => allowedLineCharacters.test(line))
    .filter((line) => symbolRatio(line) < 0.35);

  return lines.join("\n").trim();
}

export function extractOcrFields(text: string): OcrExtractedFields {
  const cleanText = sanitizeOcrText(text);
  const lines = cleanText.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const vendor = lines.find((line) => (
    /[A-Za-z]{3,}/.test(line)
    && !/(receipt|invoice|total|subtotal|amount|balance|paid|date|thank you|cashier)/i.test(line)
    && line.length <= 80
  ));
  const amountMatch = cleanText.match(/(?:grand\s+total|total|amount\s+due|amount|paid|balance)\D{0,16}(\$?\s?\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/i);
  const priceMatches = [...cleanText.matchAll(/\$?\s?(\d{1,5}(?:,\d{3})*\.\d{2})\b/g)];
  const dateMatch = cleanText.match(/\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4})\b/i);
  const phoneMatch = cleanText.match(/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/);
  const invoiceMatch = cleanText.match(/\b(?:invoice|inv|receipt|order|serial|model)\s*(?:#|no\.?|number|:)?\s*([A-Z0-9-]{4,})\b/i);
  const warrantyMatch = cleanText.match(/\b(?:warranty|expires?|coverage)\D{0,24}(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/i);

  return {
    ...(vendor ? { vendor } : {}),
    ...(amountMatch ? { amount: amountMatch[1].replace(/\s/g, "") } : priceMatches.length ? { amount: priceMatches[priceMatches.length - 1][1] } : {}),
    ...(dateMatch ? { date: dateMatch[1] } : {}),
    ...(phoneMatch ? { phone: phoneMatch[0] } : {}),
    ...(invoiceMatch ? { invoiceNumber: invoiceMatch[1] } : {}),
    ...(warrantyMatch ? { warrantyExpires: warrantyMatch[1] } : {}),
  };
}

