"use client";

import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { formatFileSize } from "@/lib/format";
import { Spinner } from "./ui/Spinner";

interface DocumentLinkProps {
  fileId: string;
  name: string;
  sizeBytes: number;
}

/**
 * Opens an uploaded document in a new tab.
 *
 * A plain link cannot work: the file endpoint requires an Authorization header,
 * and a browser navigation sends none. The bytes are fetched with the header
 * attached and handed to an object URL instead.
 */
export function DocumentLink({ fileId, name, sizeBytes }: DocumentLinkProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setLoading(true);
    setError(null);

    try {
      const blob = await api.blob(`/files/${fileId}`);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");

      // The tab keeps its own reference once opened, so the URL can be released.
      // Without this the blob is held in memory until the page is closed.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open the document");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="group flex w-full items-center gap-3 rounded-xl bg-slate-50 p-3 text-left ring-1 ring-slate-200 ring-inset transition-colors hover:bg-white hover:ring-brand-300 disabled:opacity-60"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-card group-hover:text-brand-600">
          {loading ? <Spinner className="size-4" /> : <FileText className="size-4" aria-hidden="true" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-800">{name}</span>
          <span className="block text-xs text-slate-500">{formatFileSize(sizeBytes)}</span>
        </span>
        <ExternalLink
          className="size-4 shrink-0 text-slate-400 group-hover:text-brand-600"
          aria-hidden="true"
        />
      </button>
      {error && <p className="mt-1.5 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
