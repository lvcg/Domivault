"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileImage, Loader2, RotateCcw, ScanLine, StopCircle } from "lucide-react";
import { extractBrowserOcr } from "@/lib/ocr/browser-tesseract";
import { extractOcrFields, sanitizeOcrText, type OcrExtractedFields } from "@/lib/ocr/text-cleanup";

type ScannerStatus = "isIdle" | "isCapturing" | "isProcessing" | "isSuccess" | "isError";

const statusLabel: Record<ScannerStatus, string> = {
  isIdle: "Ready to scan",
  isCapturing: "Camera active",
  isProcessing: "Reading document",
  isSuccess: "Text extracted",
  isError: "Scan failed",
};

export function ClientDocumentScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<ScannerStatus>("isIdle");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [extracted, setExtracted] = useState<OcrExtractedFields>({});
  const [error, setError] = useState("");

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (status !== "isCapturing" || !videoRef.current || !streamRef.current) return;

    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {
      setError("Camera preview could not start.");
      setStatus("isError");
    });
  }, [status]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus((current) => (current === "isCapturing" ? "isIdle" : current));
  };

  const resetScanner = () => {
    stopCamera();
    setStatus("isIdle");
    setProgress(0);
    setText("");
    setExtracted({});
    setError("");
  };

  const processImage = async (image: File | Blob | HTMLCanvasElement) => {
    setStatus("isProcessing");
    setProgress(0);
    setError("");

    try {
      const result = await extractBrowserOcr(image, ({ progress }) => setProgress(progress));
      setText(result.text);
      setExtracted(result.extracted);
      setProgress(100);
      setStatus("isSuccess");
    } catch {
      setError("We could not read text from this document. Try a sharper image with better lighting.");
      setStatus("isError");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImage(file);
    event.target.value = "";
  };

  const startCamera = async () => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera capture is not available in this browser.");
      setStatus("isError");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setStatus("isCapturing");
    } catch {
      setError("Camera permission was blocked or no camera was found.");
      setStatus("isError");
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError("Camera preview is not ready yet.");
      setStatus("isError");
      return;
    }

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Could not prepare the camera image for scanning.");
      setStatus("isError");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    stopCamera();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));

    if (!blob) {
      setError("Could not capture a photo from the camera.");
      setStatus("isError");
      return;
    }

    await processImage(blob);
  };

  const isBusy = status === "isCapturing" || status === "isProcessing";

  return (
    <section className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Document scanner</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Scan receipts, warranties, and service records</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Upload a receipt, warranty, or service document and DomiVault will pull out the important details for review.
          </p>
        </div>
        <div aria-live="polite" className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
          {statusLabel[status]}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
          <FileImage className="h-4 w-4" />
          Upload image
          <input
            aria-label="Upload document image"
            accept="image/png,image/jpeg,application/pdf"
            className="sr-only"
            disabled={isBusy}
            onChange={handleFileChange}
            type="file"
          />
        </label>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={isBusy}
          onClick={startCamera}
          type="button"
        >
          <Camera className="h-4 w-4" />
          Use camera
        </button>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          disabled={status !== "isCapturing"}
          onClick={capturePhoto}
          type="button"
        >
          <ScanLine className="h-4 w-4" />
          Capture
        </button>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          onClick={resetScanner}
          type="button"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {status === "isCapturing" && (
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 dark:border-white/10">
          <video aria-label="Camera preview" className="aspect-video w-full object-cover" muted playsInline ref={videoRef} />
          <button className="m-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950" onClick={stopCamera} type="button">
            <StopCircle className="h-4 w-4" />
            Stop camera
          </button>
        </div>
      )}

      {status === "isProcessing" && (
        <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10">
          <div className="flex items-center justify-between gap-3 text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing OCR
            </span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {status === "isError" && (
        <p role="alert" className="mt-5 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
          {error}
        </p>
      )}

      {(status === "isSuccess" || text) && (
        <div className="mt-5 grid gap-4">
          {Object.keys(extracted).length > 0 && (
            <div className="grid gap-2 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-400/20 dark:bg-emerald-400/10">
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">Detected fields</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(extracted).map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-white/70 px-3 py-2 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")}: </span>
                    {value}
                  </div>
                ))}
              </div>
            </div>
          )}
          <label className="grid gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Cleaned extracted text
            <textarea
              className="min-h-48 rounded-3xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:focus:ring-emerald-400/10"
              onChange={(event) => {
                const cleanText = sanitizeOcrText(event.target.value);
                setText(event.target.value);
                setExtracted(extractOcrFields(cleanText));
              }}
              value={text}
            />
          </label>
        </div>
      )}

      <canvas aria-hidden="true" className="hidden" ref={canvasRef} />
    </section>
  );
}
