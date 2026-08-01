import { analyzeOcrDocument, sanitizeOcrText } from "./text-cleanup";

describe("OCR text cleanup", () => {
  it("normalizes noisy receipt text into structured document JSON", () => {
    const rawText = `
      H0ME DEPOT
      Receipt: 1234-ABCD
      Date: 7/21/26
      HVAC Fil-
      ter $10,00
      Tax $0 80
      Total S10,80
      Thank you
    `;

    const analysis = analyzeOcrDocument(rawText);

    expect(analysis).toEqual(expect.objectContaining({
      document_type: "Receipt",
      confidence_score: "High",
      raw_ocr_notes: "OCR text was cleaned and normalized for review.",
    }));
    expect(analysis.extracted_data).toEqual(expect.objectContaining({
      document_date: "2026-07-21",
      total_amount: "$10.80",
      sender_vendor_name: "H0ME DEPOT",
      invoice_number: "1234-ABCD",
    }));
    expect(analysis.extracted_data.line_items).toEqual([
      { description: "HVAC Filter", amount: "$10.00" },
    ]);
  });

  it("removes broken symbol clusters and rejoins hyphenated words", () => {
    expect(sanitizeOcrText("War- \nranty ###@@@ expires: 12/01/2027")).toBe("Warranty expires: 12/01/2027");
  });
});
