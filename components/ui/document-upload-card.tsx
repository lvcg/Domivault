"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, FilePenLine, FileScan, Loader2, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { usePlanTier } from "@/hooks/use-plan-tier";
import type { VaultDocument, VaultDocumentType } from "@/types/homey";
import { getVaultDocumentMimeType, getVaultDocumentValidationError } from "@/lib/documents/file-limits";
import { formatTimestamp } from "@/lib/utils";
import { extractBrowserOcr } from "@/lib/ocr/browser-tesseract";
import { isPdfFile } from "@/lib/ocr/browser-pdf-render";

type LinkedTable = "expense" | "appliance" | "maintenance_task" | "service_event";

type OcrResult = {
  text: string;
  status: VaultDocument["ocrStatus"];
  extracted?: Record<string, string | number | boolean>;
  message: string;
};

type VaultDocumentRow = {
  id: string;
  document_type: VaultDocumentType;
  name: string;
  storage_bucket: string;
  storage_path: string;
  ocr_text: string | null;
  ocr_status: VaultDocument["ocrStatus"] | null;
  metadata: { linkedTo?: string } | null;
  created_at: string;
};

type DocumentUploadCardProps = {
  title: string;
  description: string;
  type: VaultDocumentType;
  linkedId?: string;
  linkedTable?: LinkedTable;
  locked?: boolean;
  onDocumentSaved?: (document: VaultDocument, ocr: OcrResult) => void;
  onOcrExtracted?: (ocr: OcrResult) => void;
};

const bucket = "receipts";

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120);
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function linkedColumn(table?: LinkedTable) {
  if (table === "expense") return "expense_id";
  if (table === "appliance") return "appliance_id";
  if (table === "maintenance_task") return "maintenance_task_id";
  if (table === "service_event") return "service_event_id";
  return null;
}

function mapDocument(row: VaultDocumentRow, signedUrl?: string): VaultDocument {
  return {
    id: row.id,
    name: row.name,
    type: row.document_type,
    url: signedUrl || row.storage_path,
    storagePath: row.storage_path,
    storageBucket: row.storage_bucket,
    linkedTo: row.metadata?.linkedTo || "Document vault",
    uploadedAt: row.created_at,
    ocrText: row.ocr_text || undefined,
    ocrStatus: row.ocr_status || "pending",
  };
}

export function DocumentUploadCard({
  title,
  description,
  type,
  linkedId,
  linkedTable,
  locked = false,
  onDocumentSaved,
  onOcrExtracted,
}: DocumentUploadCardProps) {
  const supabase = useMemo(() => createClient(), []);
  const { isPlus, isLoading: isPlanLoading } = usePlanTier();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [notice, setNotice] = useState("Upload or scan a document to attach it to this record.");
  const [isBusy, setIsBusy] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    const isLocked = locked || !isPlus;

    if (!supabase || isLocked) {
      setNotice(isLocked ? "Document storage is available on DomiVault Plus." : "Add Supabase env keys and login to upload documents.");
      return;
    }

    const client = supabase;
    let isMounted = true;

    async function loadDocuments() {
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        if (isMounted) setNotice("Login to upload and sync documents to your secure vault.");
        return;
      }

      let query = client
        .from("vault_documents")
        .select("id,document_type,name,storage_bucket,storage_path,ocr_text,ocr_status,metadata,created_at")
        .eq("user_id", userId)
        .eq("document_type", type)
        .order("created_at", { ascending: false });

      const column = linkedColumn(linkedTable);
      if (column && isUuid(linkedId)) {
        query = query.eq(column, linkedId);
      } else {
        query = query.eq("metadata->>linkedTo", title);
      }

      const { data, error } = await query;
      if (!isMounted) return;

      if (error) {
        console.error("Document load failed:", error);
        setNotice("Could not load documents. Try refreshing the page.");
        return;
      }

      const rows = (data || []) as VaultDocumentRow[];
      const withUrls = await Promise.all(rows.map(async (row) => {
        const { data: signed } = await client.storage.from(row.storage_bucket || bucket).createSignedUrl(row.storage_path, 60 * 10);
        return mapDocument(row, signed?.signedUrl);
      }));

      setDocuments(withUrls);
      setNotice(withUrls.length ? `${withUrls.length} document${withUrls.length === 1 ? "" : "s"} loaded from your vault.` : "No documents attached yet.");
    }

    loadDocuments();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isPlus, linkedId, linkedTable, locked, supabase, title, type]);

  const runOcr = async (file: File): Promise<OcrResult> => {
    if (isPdfFile(file)) {
      const result = await extractBrowserOcr(file);

      return {
        text: result.text,
        status: result.text ? "processed" : "unavailable",
        extracted: result.extracted,
        message: result.text
          ? `PDF OCR extracted and cleaned text from ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}.`
          : "PDF OCR completed but no readable text was detected.",
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch("/api/documents/ocr", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return {
        text: "",
        status: "failed",
        message: `OCR failed with status ${response.status}.`,
      };
    }

    return response.json() as Promise<OcrResult>;
  };

  const saveFile = async (file: File, source: "upload" | "scan") => {
    if (locked || !isPlus) {
      setNotice("Document storage is a DomiVault Plus feature.");
      return;
    }

    if (!supabase) {
      setNotice("Add Supabase env keys before uploading documents.");
      return;
    }

    const validationError = getVaultDocumentValidationError(file);
    if (validationError) {
      setNotice(validationError);
      return;
    }

    setIsBusy(true);
    setNotice(source === "scan" ? "Saving scanned document..." : "Uploading document...");

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      setIsBusy(false);
      setNotice("Login to upload documents to your secure vault.");
      return;
    }

    const storagePath = `${userId}/${type}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const contentType = getVaultDocumentMimeType(file);
    const upload = await supabase.storage.from(bucket).upload(storagePath, file, {
      cacheControl: "3600",
      contentType,
      upsert: false,
    });

    if (upload.error) {
      console.error("Document upload failed:", upload.error);
      setIsBusy(false);
      setNotice("Upload failed. Check the file type and try again.");
      return;
    }

    let ocr: OcrResult = {
      text: "",
      status: "pending",
      message: "OCR pending.",
    };

    try {
      ocr = await runOcr(file);
      onOcrExtracted?.(ocr);
    } catch (error) {
      console.error("Document OCR failed:", error);
      ocr = {
        text: "",
        status: "failed",
        message: "OCR failed.",
      };
    }

    const column = linkedColumn(linkedTable);
    const linkedValue = column && isUuid(linkedId) ? { [column]: linkedId } : {};
    const metadata = {
      linkedTo: title,
      originalName: file.name,
      source,
      size: file.size,
      mimeType: contentType,
      extracted: ocr.extracted || {},
    };

    const { data, error } = await supabase
      .from("vault_documents")
      .insert({
        user_id: userId,
        document_type: type,
        name: file.name,
        storage_bucket: bucket,
        storage_path: storagePath,
        ocr_text: ocr.text || null,
        ocr_status: ocr.status || "pending",
        metadata,
        ...linkedValue,
      })
      .select("id,document_type,name,storage_bucket,storage_path,ocr_text,ocr_status,metadata,created_at")
      .single();

    if (error) {
      await supabase.storage.from(bucket).remove([storagePath]);
      console.error("Document metadata save failed:", error);
      setIsBusy(false);
      setNotice("Document metadata was not saved. Try again shortly.");
      return;
    }

    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 60 * 10);
    const document = mapDocument(data as VaultDocumentRow, signed?.signedUrl);
    setDocuments((current) => [document, ...current]);
    onDocumentSaved?.(document, ocr);
    setNotice(`${file.name} saved to your vault. ${ocr.message}`);
    setIsBusy(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await saveFile(file, "upload");
  };

  const startCamera = async () => {
    if (locked || !isPlus) {
      setNotice("Document scanning is a DomiVault Plus feature.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice("Camera scanning is not available in this browser. Use Upload instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 0);
      setNotice("Camera ready. Center the document, then capture.");
    } catch (error) {
      console.error("Camera scan start failed:", error);
      setNotice("Camera permission was not granted or the camera is unavailable.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraOpen(false);
  };

  const captureScan = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) {
      setNotice("Could not capture scan. Try again.");
      return;
    }

    stopCamera();
    await saveFile(new File([blob], `${safeFileName(title.toLowerCase())}-scan-${Date.now()}.jpg`, { type: "image/jpeg" }), "scan");
  };

  const renameDocument = async (document: VaultDocument) => {
    if (locked || !isPlus || !supabase) return;
    const nextName = window.prompt("Update document name", document.name);
    if (!nextName?.trim()) return;

    const { error } = await supabase.from("vault_documents").update({ name: nextName.trim() }).eq("id", document.id);
    if (error) {
      console.error("Document rename failed:", error);
      setNotice("Could not rename document. Try again shortly.");
      return;
    }

    setDocuments((current) => current.map((item) => (item.id === document.id ? { ...item, name: nextName.trim() } : item)));
    setNotice(`${nextName.trim()} updated.`);
  };

  const deleteDocument = async (document: VaultDocument) => {
    if (locked || !isPlus || !supabase) return;
    const storagePath = document.storagePath || document.url;

    setIsBusy(true);
    const { error: removeError } = await supabase.storage.from(document.storageBucket || bucket).remove([storagePath]);
    if (removeError) {
      console.error("Document storage delete failed:", removeError);
      setIsBusy(false);
      setNotice("Could not delete the storage file. Try again shortly.");
      return;
    }

    const { error } = await supabase.from("vault_documents").delete().eq("id", document.id);
    setIsBusy(false);

    if (error) {
      console.error("Document metadata delete failed:", error);
      setNotice("File was removed, but the document record could not be deleted.");
      return;
    }

    setDocuments((current) => current.filter((item) => item.id !== document.id));
    setNotice(`${document.name} deleted from storage and document vault.`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
      <input ref={fileInputRef} onChange={handleFileChange} className="hidden" type="file" accept="image/*,.pdf,.txt,.csv,.json" />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={locked || !isPlus || isBusy || isPlanLoading} onClick={() => fileInputRef.current?.click()} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
          <button disabled={locked || !isPlus || isBusy || isPlanLoading} onClick={startCamera} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50">
            <FileScan className="h-4 w-4" />
            Scan
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{notice}</p>

      {isCameraOpen && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <video ref={videoRef} className="aspect-video w-full rounded-xl bg-slate-950 object-cover" autoPlay muted playsInline />
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button onClick={stopCamera} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button onClick={captureScan} type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
              <Camera className="h-4 w-4" />
              Capture scan
            </button>
          </div>
        </div>
      )}

      {documents.length > 0 && (
        <div className="mt-4 grid gap-2">
          {documents.map((document) => (
            <div key={document.id} className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center">
              <div>
                <a href={document.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-white">{document.name}</a>
                <p className="text-xs text-slate-500">{formatTimestamp(document.uploadedAt)} · OCR {document.ocrStatus || "pending"}</p>
                {document.ocrText && <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{document.ocrText}</p>}
              </div>
              <div className="flex gap-2">
                <button disabled={isBusy} onClick={() => renameDocument(document)} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-50 dark:border-white/10 dark:text-slate-200">
                  <FilePenLine className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button disabled={isBusy} onClick={() => deleteDocument(document)} type="button" className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 text-xs font-semibold text-rose-700 disabled:opacity-50 dark:border-rose-400/20 dark:text-rose-200">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
