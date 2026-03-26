"use client";

import { useCallback } from "react";
import { translations } from "@/lib/translations";

interface ResultPreviewProps {
  original: string | null;
  result: string;
  fileName: string;
  onReset: () => void;
  t: typeof translations.en;
}

export default function ResultPreview({
  original,
  result,
  fileName,
  onReset,
  t,
}: ResultPreviewProps) {
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = result;
    link.download = `removed-bg-${fileName.replace(/\.[^.]+$/, ".png")}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result, fileName]);

  return (
    <div className="space-y-6">
      {/* Image Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Original */}
        <div className="space-y-2">
          <p className="text-sm text-cyber-muted font-medium">{t.preview}</p>
          <div className="relative rounded-lg overflow-hidden border border-cyber-border">
            {original && (
              <img
                src={original}
                alt="Original"
                className="w-full h-auto object-contain bg-cyber-panel"
              />
            )}
          </div>
        </div>

        {/* Result */}
        <div className="space-y-2">
          <p className="text-sm text-cyber-muted font-medium">
            {t.subtitle}
          </p>
          <div className="relative rounded-lg overflow-hidden border border-cyber-border checkerboard">
            {result && (
              <img
                src={result}
                alt="Result"
                className="w-full h-auto object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 cyber-btn flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {t.download}
        </button>

        <button
          onClick={onReset}
          className="px-6 py-3 rounded-lg border border-cyber-border text-cyber-text-dim hover:border-cyber-accent/50 hover:text-cyber-accent transition-all"
        >
          {t.newImage}
        </button>
      </div>
    </div>
  );
}
