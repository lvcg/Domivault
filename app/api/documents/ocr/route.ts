import { NextResponse } from "next/server";
import { PSM, createWorker } from "tesseract.js";
import { requireVaultPlus } from "@/lib/auth/server-plan";
import { getOcrFileLimitError, isOcrImageFile, isOcrTextFile } from "@/lib/documents/file-limits";
import { extractOcrFields, sanitizeOcrText } from "@/lib/ocr/text-cleanup";

type OcrPayload = {
  text: string;
  status: "processed" | "unavailable" | "failed";
  extracted?: Record<string, string | number | boolean>;
  message: string;
};

async function extractWithTesseract(file: File): Promise<OcrPayload> {
  if (!isOcrImageFile(file)) {
    return {
      text: "",
      status: "unavailable",
      message: "Tesseract OCR currently supports uploaded images. Upload a receipt/warranty photo or camera scan for OCR.",
    };
  }

  const worker = await createWorker(process.env.TESSERACT_LANG || "eng");

  try {
    await worker.setParameters?.({
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.,:/#@&%()+- ",
    });

    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await worker.recognize(bytes);
    const text = sanitizeOcrText(result.data.text);

    return {
      text,
      status: text ? "processed" : "unavailable",
      extracted: text ? extractOcrFields(text) : undefined,
      message: text ? "Tesseract OCR text extracted and cleaned." : "Tesseract OCR completed but no text was detected.",
    };
  } finally {
    await worker.terminate();
  }
}

export async function POST(request: Request) {
  try {
    const plus = await requireVaultPlus();

    if (!plus.ok) {
      return NextResponse.json({ text: "", status: "failed", message: plus.message } satisfies OcrPayload, { status: plus.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ text: "", status: "failed", message: "No document file was provided." }, { status: 400 });
    }

    const fileLimitError = getOcrFileLimitError(file);
    if (fileLimitError) {
      return NextResponse.json({ text: "", status: "failed", message: fileLimitError } satisfies OcrPayload, { status: 413 });
    }

    if (isOcrTextFile(file)) {
      const text = sanitizeOcrText(await file.text());
      return NextResponse.json({
        text,
        status: text ? "processed" : "unavailable",
        extracted: text ? extractOcrFields(text) : undefined,
        message: text ? "Text extracted from document." : "The document did not contain readable text.",
      } satisfies OcrPayload);
    }

    const result = await extractWithTesseract(file);
    return NextResponse.json(result);
  } catch (error) {
    console.error("OCR request failed:", error);
    return NextResponse.json({
      text: "",
      status: "failed",
      message: "OCR failed. Try a smaller or clearer document.",
    } satisfies OcrPayload, { status: 500 });
  }
}
