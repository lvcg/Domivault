"use client";

export type RenderedPdfPage = {
  canvas: HTMLCanvasElement;
  pageNumber: number;
};

const maxPdfPages = 6;
const targetWidth = 1800;

let isPdfWorkerConfigured = false;

async function loadPdfJs() {
  const pdfjsLib = await import("pdfjs-dist");

  if (isPdfWorkerConfigured) return pdfjsLib;

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
  isPdfWorkerConfigured = true;
  return pdfjsLib;
}

export function isPdfFile(file: File | Blob) {
  return file.type === "application/pdf" || (file instanceof File && /\.pdf$/i.test(file.name));
}

export async function renderPdfToCanvases(file: File | Blob): Promise<RenderedPdfPage[]> {
  const pdfjsLib = await loadPdfJs();

  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const pageCount = Math.min(pdf.numPages, maxPdfPages);
  const pages: RenderedPdfPage[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(2.5, Math.max(1, targetWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) continue;

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    pages.push({ canvas, pageNumber });
  }

  await (pdf as { destroy?: () => Promise<void> | void }).destroy?.();
  return pages;
}
