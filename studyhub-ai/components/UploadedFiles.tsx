"use client";
import { useEffect, useState } from "react";
import { FolderOpen, Download, RefreshCw, FileText, Loader2 } from "lucide-react";

interface NoteFile {
  name: string;
  path: string;
  url: string;
  size: number;
  createdAt: string;
}

interface UploadedFilesProps {
  refreshTrigger?: number;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadedFiles({ refreshTrigger }: UploadedFilesProps) {
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/list-notes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFiles(data.files ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [refreshTrigger]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-slate-300">Supabase Notes Bucket</span>
          {files.length > 0 && (
            <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full">
              {files.length} files
            </span>
          )}
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 transition-all"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {loading && files.length === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && files.length === 0 && !error && (
        <div className="text-center py-8 text-slate-500">
          <FolderOpen size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No files uploaded yet</p>
          <p className="text-xs mt-1">Upload a note above to see it here</p>
        </div>
      )}

      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.path}
            className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition-all group"
          >
            <FileText size={16} className="text-violet-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 truncate">{file.name}</p>
              <p className="text-xs text-slate-600">
                {formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-violet-300 transition-all"
            >
              <Download size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
