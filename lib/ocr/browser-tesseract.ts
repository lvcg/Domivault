"use client";

import { createWorker } from "tesseract.js";
import { preprocessImageForOcr } from "@/lib/ocr/browser-image-preprocess";
import { isPdfFile, renderPdfToCanvases } from "@/lib/ocr/browser-pdf-render";
import { analyzeOcrDocument, extractOcrFields, sanitizeOcrText, type OcrDocumentAnalysis, type OcrExtractedFields } from "@/lib/ocr/text-cleanup";

type LegacyWorkerHooks = {
  loadLanguage?: (language: string) => Promise<unknown>;
  initialize?: (language: string) => Promise<unknown>;
  setParameters?: (parameters: Record<string, string>) => Promise<unknown>;
  recognize: (image: File | Blob | HTMLCanvasElement) => Promise<{ data: { confidence?: number; text: string } }>;
  terminate?: () => Promise<unknown>;
};

export type BrowserOcrResult = {
  text: string;
  extracted: OcrExtractedFields;
  analysis: OcrDocumentAnalysis;
  pageCount: number;
};

export type BrowserOcrProgress = {
  progress: number;
  pageNumber: number;
  pageCount: number;
};

async function createOcrWorker(
  onProgress?: (progress: BrowserOcrProgress) => void,
  pageCount = 1,
  pageNumber = 1,
  pageSegmentationMode = "4",
) {
  const worker = await createWorker("eng", undefined, {
    logger: (message) => {
      if (typeof message.progress === "number") {
        const pageOffset = pageNumber - 1;
        const progress = Math.round(((pageOffset + message.progress) / pageCount) * 100);
        onProgress?.({ progress, pageNumber, pageCount });
      }
    },
  }) as unknown as LegacyWorkerHooks;

  if (typeof worker.loadLanguage === "function") await worker.loadLanguage("eng");
  if (typeof worker.initialize === "function") await worker.initialize("eng");

  if (typeof worker.setParameters === "function") {
    await worker.setParameters({
      preserve_interword_spaces: "1",
      tessedit_ocr_engine_mode: "1",
      tessedit_pageseg_mode: pageSegmentationMode,
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$.,:/#@&%()+- ",
    });
  }

  return worker;
}

async function recognizeWithMode(
  image: File | Blob | HTMLCanvasElement,
  onProgress: ((progress: BrowserOcrProgress) => void) | undefined,
  pageCount: number,
  pageNumber: number,
  pageSegmentationMode: "4" | "11",
) {
  const worker = await createOcrWorker(onProgress, pageCount, pageNumber, pageSegmentationMode);

  try {
    const result = await worker.recognize(image);
    return sanitizeOcrText(result.data.text);
  } finally {
    await worker.terminate?.();
  }
}

async function recognizeSources(
  sources: Array<File | Blob | HTMLCanvasElement>,
  onProgress?: (progress: BrowserOcrProgress) => void,
) {
  const pageCount = sources.length || 1;
  const pages: string[] = [];

  for (let index = 0; index < sources.length; index += 1) {
    const pageNumber = index + 1;
    const preprocessed = await preprocessImageForOcr(sources[index]);
    const psm4Text = await recognizeWithMode(preprocessed.image, onProgress, pageCount, pageNumber, "4");
    let cleanText = psm4Text;

    if (cleanText.length < 16) {
      const sparseText = await recognizeWithMode(preprocessed.image, onProgress, pageCount, pageNumber, "11");
      if (sparseText.length > cleanText.length) cleanText = sparseText;
    }

    if (cleanText) pages.push(cleanText);
  }

  const text = sanitizeOcrText(pages.join("\n\n"));
  onProgress?.({ progress: 100, pageNumber: pageCount, pageCount });

  return {
    text,
    extracted: extractOcrFields(text),
    analysis: analyzeOcrDocument(text),
    pageCount,
  };
}

export async function extractBrowserOcr(
  source: File | Blob | HTMLCanvasElement,
  onProgress?: (progress: BrowserOcrProgress) => void,
): Promise<BrowserOcrResult> {
  if (source instanceof File && isPdfFile(source)) {
    const pages = await renderPdfToCanvases(source);
    if (!pages.length) return { text: "", extracted: {}, analysis: analyzeOcrDocument(""), pageCount: 0 };
    return recognizeSources(pages.map((page) => page.canvas), onProgress);
  }

  if (source instanceof Blob && isPdfFile(source)) {
    const pages = await renderPdfToCanvases(source);
    if (!pages.length) return { text: "", extracted: {}, analysis: analyzeOcrDocument(""), pageCount: 0 };
    return recognizeSources(pages.map((page) => page.canvas), onProgress);
  }

  return recognizeSources([source], onProgress);
}
