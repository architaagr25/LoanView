"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ArrowLeft, ArrowRight, FileCheck2, FileText, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { formatDate, formatFileSize } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

const ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png"];

interface UploadStepProps {
  profile: Profile | null;
  onUploaded: () => void;
  onBack: () => void;
  onContinue: () => void;
}

export function UploadStep({ profile, onUploaded, onBack, onContinue }: UploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const existing = profile?.salarySlip;

  /**
   * Type and size are checked here as well as on the server.
   *
   * Not for security — the server verifies the file's actual bytes, which is
   * the only check that means anything. This is so a 40 MB file is refused
   * instantly instead of after being uploaded and then rejected.
   */
  function accept(candidate: File): void {
    setError(null);

    if (!ACCEPTED_MIME.includes(candidate.type)) {
      setError("Only PDF, JPG and PNG files are accepted.");
      return;
    }

    if (candidate.size > MAX_UPLOAD_BYTES) {
      setError(
        `That file is ${formatFileSize(candidate.size)}. The limit is ${formatFileSize(MAX_UPLOAD_BYTES)}.`,
      );
      return;
    }

    setFile(candidate);
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0];
    if (chosen) accept(chosen);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) accept(dropped);
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("salarySlip", file);
      await api.upload("/borrower/salary-slip", form);
      setFile(null);
      onUploaded();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed. Please try again.");
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Salary slip"
        description="Upload a recent payslip as proof of income."
        icon={<FileText className="size-4.5" aria-hidden="true" />}
      />
      <CardBody className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        {existing && !file && (
          <Alert tone="success" title="Salary slip on file">
            <p>
              {existing.originalName} · {formatFileSize(existing.sizeBytes)} · uploaded{" "}
              {formatDate(existing.uploadedAt)}
            </p>
            <p className="mt-1 text-emerald-800/80">
              Upload a different file below to replace it, or continue.
            </p>
          </Alert>
        )}

        {file ? (
          <div className="flex items-center gap-3 rounded-xl bg-brand-50/60 p-4 ring-1 ring-brand-200 ring-inset">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
              <FileCheck2 className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)} · ready to upload</p>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              disabled={uploading}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:opacity-50"
              aria-label="Remove selected file"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
              dragging ? "border-brand-400 bg-brand-50/60" : "border-slate-200 bg-slate-50/50",
            )}
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-card">
              <Upload className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-slate-900">
              Drag a file here, or choose one
            </p>
            <p className="mt-1 text-xs text-slate-500">
              PDF, JPG or PNG · up to {formatFileSize(MAX_UPLOAD_BYTES)}
            </p>

            {/* A button that forwards to a hidden input, rather than the native
                file control, which cannot be styled to match anything else. */}
            <div className="mt-4">
              <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                Choose file
              </Button>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_UPLOAD_TYPES}
              onChange={handleSelect}
              className="sr-only"
              aria-label="Salary slip file"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="ghost" onClick={onBack} disabled={uploading}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Button>

          <div className="flex gap-2">
            {existing && !file && (
              <Button type="button" onClick={onContinue}>
                Continue
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            )}
            {file && (
              <Button type="button" onClick={handleUpload} loading={uploading}>
                {uploading ? "Uploading" : existing ? "Replace and continue" : "Upload and continue"}
                {!uploading && <ArrowRight className="size-4" aria-hidden="true" />}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
