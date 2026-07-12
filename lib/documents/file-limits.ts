export const ocrImageMaxBytes = 10 * 1024 * 1024;
export const ocrPdfMaxBytes = 10 * 1024 * 1024;
export const ocrTextMaxBytes = 5 * 1024 * 1024;
export const vaultDocumentMaxBytes = 10 * 1024 * 1024;

export const ocrImageTypes = new Set(["image/bmp", "image/gif", "image/jpeg", "image/png", "image/tiff", "image/webp"]);
export const ocrTextTypes = new Set([
  "application/json",
  "application/xml",
  "text/csv",
  "text/markdown",
  "text/plain",
  "text/xml",
]);
export const vaultDocumentTypes = new Set([
  ...ocrImageTypes,
  ...ocrTextTypes,
  "application/pdf",
  "image/jpg",
  "image/pjpeg",
]);

const extensionMimeTypes: Record<string, string> = {
  bmp: "image/bmp",
  csv: "text/csv",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  json: "application/json",
  md: "text/markdown",
  pdf: "application/pdf",
  png: "image/png",
  tif: "image/tiff",
  tiff: "image/tiff",
  txt: "text/plain",
  webp: "image/webp",
  xml: "text/xml",
};

export function getVaultDocumentMimeType(file: File) {
  const browserType = file.type.toLowerCase();
  if (browserType) return browserType;

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? extensionMimeTypes[extension] || "" : "";
}

export function isOcrImageFile(file: File) {
  return ocrImageTypes.has(getVaultDocumentMimeType(file)) || Boolean(file.name.match(/\.(bmp|gif|jpe?g|png|tiff?|webp)$/i));
}

export function isOcrTextFile(file: File) {
  return ocrTextTypes.has(getVaultDocumentMimeType(file)) || Boolean(file.name.match(/\.(csv|json|md|txt|xml)$/i));
}

export function isOcrPdfFile(file: File) {
  return getVaultDocumentMimeType(file) === "application/pdf" || Boolean(file.name.match(/\.pdf$/i));
}

export function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return `${Number.isInteger(megabytes) ? megabytes : megabytes.toFixed(1)} MB`;
}

export function getOcrFileLimitError(file: File) {
  if (isOcrTextFile(file) && file.size > ocrTextMaxBytes) {
    return `Text documents must be ${formatFileSize(ocrTextMaxBytes)} or smaller for OCR.`;
  }

  if (isOcrImageFile(file) && file.size > ocrImageMaxBytes) {
    return `Images must be ${formatFileSize(ocrImageMaxBytes)} or smaller for OCR.`;
  }

  if (isOcrPdfFile(file) && file.size > ocrPdfMaxBytes) {
    return `PDFs must be ${formatFileSize(ocrPdfMaxBytes)} or smaller for OCR.`;
  }

  return null;
}

export function getVaultDocumentValidationError(file: File) {
  const mimeType = getVaultDocumentMimeType(file);

  if (!vaultDocumentTypes.has(mimeType)) {
    return "Unsupported file type. Upload an image, PDF, CSV, JSON, markdown, text, or XML document.";
  }

  if (file.size > vaultDocumentMaxBytes) {
    return `Documents must be ${formatFileSize(vaultDocumentMaxBytes)} or smaller.`;
  }

  return getOcrFileLimitError(file);
}
