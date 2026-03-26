"use client";

import { translations } from "@/lib/translations";

interface StatusMessageProps {
  status: "uploading" | "processing";
  fileName: string;
  t: typeof translations.en;
}

export default function StatusMessage({ status, fileName, t }: StatusMessageProps) {
  const isUploading = status === "uploading";

  return (
    <div className="py-16 text-center space-y-6">
      {/* Animated Icon */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full border-2 border-cyber-accent/30" />
        <div
          className="absolute inset-0 rounded-full border-2 border-cyber-accent"
          style={{
            animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
          }}
        />
        <div className="absolute inset-3 rounded-full bg-cyber-accent/20 flex items-center justify-center">
          <div className="text-2xl">
            {isUploading ? "📤" : "⚙️"}
          </div>
        </div>
      </div>

      {/* Status Text */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-cyber-text">
          {isUploading ? t.uploading : t.processing}
        </h3>
        <p className="text-sm text-cyber-muted truncate max-w-xs mx-auto">
          {fileName}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-xs mx-auto">
        <div className="h-1.5 bg-cyber-panel rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyber-accent-dark to-cyber-accent rounded-full"
            style={{
              width: isUploading ? "60%" : "100%",
              animation: isUploading
                ? "none"
                : "progress 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      <p className="text-xs text-cyber-muted">
        {isUploading
          ? "Please wait while we upload your image..."
          : "AI is processing your image. This usually takes 3-5 seconds."}
      </p>

      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes progress {
          0% {
            width: 0%;
            opacity: 1;
          }
          50% {
            width: 85%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
