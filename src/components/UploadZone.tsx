"use client";

import { useCallback, useState } from "react";
import { translations, Language } from "@/lib/translations";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  t: typeof translations.en;
}

export default function UploadZone({ onFileSelect, t }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
        ${isDragOver
          ? "border-cyber-accent bg-cyber-accent/10"
          : "border-cyber-border hover:border-cyber-accent/50 hover:bg-cyber-panel/50"
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* Upload Icon */}
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyber-accent-dark/20 to-cyber-accent/20 border border-cyber-border flex items-center justify-center">
          <svg
            className="w-10 h-10 text-cyber-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-2">
        <p className="text-lg font-medium text-cyber-text">
          {isDragOver ? "Drop image here" : t.dragDrop}
        </p>
        <p className="text-cyber-muted text-sm">
          {t.or}{" "}
          <span className="text-cyber-accent hover:underline">{t.browseFiles}</span>
        </p>
      </div>

      {/* Supported formats */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-cyber-muted">
        <span className="px-2 py-1 bg-cyber-panel rounded border border-cyber-border">
          PNG
        </span>
        <span className="px-2 py-1 bg-cyber-panel rounded border border-cyber-border">
          JPG
        </span>
        <span className="px-2 py-1 bg-cyber-panel rounded border border-cyber-border">
          WebP
        </span>
        <span className="text-cyber-border">|</span>
        <span>{t.maxSize}</span>
      </div>
    </div>
  );
}
