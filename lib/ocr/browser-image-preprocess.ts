type PreprocessedImage = {
  image: Blob | File | HTMLCanvasElement;
  width?: number;
  height?: number;
  enhanced: boolean;
};

const maxOcrWidth = 1800;
const contrast = 1.42;
const brightness = 8;

async function blobFromCanvas(canvas: HTMLCanvasElement, type = "image/png", quality = 0.94) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function enhanceCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;

  try {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    for (let index = 0; index < pixels.length; index += 4) {
      const gray = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
      const enhanced = Math.max(0, Math.min(255, (gray - 128) * contrast + 128 + brightness));
      const sharpened = enhanced > 188 ? 255 : enhanced < 58 ? 0 : enhanced;
      pixels[index] = sharpened;
      pixels[index + 1] = sharpened;
      pixels[index + 2] = sharpened;
    }

    context.putImageData(imageData, 0, 0);
    return true;
  } catch {
    return false;
  }
}

async function imageBitmapFromSource(source: Blob | File) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(source);
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image."));
    };
    image.src = url;
  });
}

export async function preprocessImageForOcr(source: Blob | File | HTMLCanvasElement): Promise<PreprocessedImage> {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return { image: source, enhanced: false };

    if (source instanceof HTMLCanvasElement) {
      const scale = source.width > maxOcrWidth ? maxOcrWidth / source.width : 1;
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
    } else {
      const image = await imageBitmapFromSource(source);
      const width = "width" in image ? image.width : maxOcrWidth;
      const height = "height" in image ? image.height : maxOcrWidth;
      const scale = width > maxOcrWidth ? maxOcrWidth / width : 1;
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    const enhanced = enhanceCanvas(canvas);
    const blob = await blobFromCanvas(canvas);

    return {
      image: blob || canvas,
      width: canvas.width,
      height: canvas.height,
      enhanced,
    };
  } catch {
    return { image: source, enhanced: false };
  }
}

