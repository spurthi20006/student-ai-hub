"use client";
import { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface NoteInputProps {
  value: string;
  onChange: (val: string) => void;
  onFileUploaded?: () => void;
}

const SAMPLE_NOTE = `Database Management System (DBMS) is software that manages the storage, retrieval, and organization of data. It provides an interface between the database and its users or programs.

Key Concepts:
- Normalization: The process of organizing data to minimize redundancy. Normal forms (1NF, 2NF, 3NF, BCNF) ensure data integrity.
- Indexing: A data structure technique that allows fast retrieval of records. Types include B-Tree, Hash, and Bitmap indexes.
- Transactions: A sequence of operations treated as a single logical unit. ACID properties (Atomicity, Consistency, Isolation, Durability) ensure reliability.
- SQL: Structured Query Language for managing relational databases. Includes DDL, DML, DCL, and TCL commands.
- ER Diagrams: Entity-Relationship diagrams represent data models showing entities, attributes, and relationships.

Applications: Used in banking (account management), e-commerce (inventory/orders), healthcare (patient records), and social media (user data).`;

export default function NoteInput({ value, onChange, onFileUploaded }: NoteInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-note", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadedFileName(file.name);
      setUploadStatus({ type: "success", message: `"${file.name}" saved to Supabase notes bucket ✓` });
      onFileUploaded?.();

      // For text files, read and paste into textarea
      if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        const text = await file.text();
        onChange(text);
      }
    } catch (err) {
      setUploadStatus({ type: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Textarea */}
      <div className="relative">
        <textarea
          id="note-input"
          className="w-full h-64 bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm leading-relaxed"
          placeholder="Paste your study notes here... (minimum 30 characters)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-600">
          {value.length} chars
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Load sample */}
        <button
          onClick={() => onChange(SAMPLE_NOTE)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm transition-all"
        >
          <FileText size={14} />
          Load Sample (DBMS)
        </button>

        {/* Upload file */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-violet-300 text-sm transition-all disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={14} className="animate-spin" /> Uploading...</>
          ) : (
            <><Upload size={14} /> Upload Note</>
          )}
        </button>

        {/* Clear */}
        {value && (
          <button
            onClick={() => { onChange(""); setUploadStatus(null); setUploadedFileName(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-sm transition-all"
          >
            <X size={14} /> Clear
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx,.md"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Upload status */}
      {uploadStatus && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
          uploadStatus.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            : "bg-red-500/10 border-red-500/20 text-red-300"
        }`}>
          {uploadStatus.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {uploadStatus.message}
        </div>
      )}

      <p className="text-xs text-slate-600">
        Supports .txt, .md, .pdf, .doc, .docx — files saved to Supabase <code className="text-violet-400">notes</code> bucket
      </p>
    </div>
  );
}
