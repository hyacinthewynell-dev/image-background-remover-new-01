"use client";

import { useState, useCallback } from "react";
import UploadZone from "@/components/UploadZone";
import ResultPreview from "@/components/ResultPreview";
import StatusMessage from "@/components/StatusMessage";
import LanguageSelector from "@/components/LanguageSelector";
import { Language, translations } from "@/lib/translations";

type Status = "idle" | "uploading" | "processing" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [lang, setLang] = useState<Language>("en");

  const t = translations[lang];

  const handleFileSelect = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus("uploading");
    setErrorMessage("");
    setResultImage(null);

    // Preview original
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload and process
    try {
      setStatus("processing");
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/remove", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Processing failed");
      }

      setResultImage(data.data.result);
      setStatus("success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(message);
      setStatus("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setOriginalImage(null);
    setResultImage(null);
    setFileName("");
    setErrorMessage("");
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-cyber-border py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-accent-dark to-cyber-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">BG</span>
            </div>
            <h1 className="text-lg font-semibold text-cyber-text">
              {t.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLang={lang} onChange={setLang} />
            <a
              href="https://github.com/hyacinthewynell-dev/image-background-remover-new-01"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-muted hover:text-cyber-accent text-sm transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-cyber-accent via-cyber-cyan to-cyber-accent bg-clip-text text-transparent">
                {t.subtitle}
              </span>
            </h2>
            <p className="text-cyber-muted">
              {t.subtitle}
            </p>
          </div>

          {/* Upload / Result Area */}
          <div className="cyber-panel p-6">
            {status === "idle" && (
              <UploadZone onFileSelect={handleFileSelect} t={t} />
            )}

            {(status === "uploading" || status === "processing") && (
              <StatusMessage
                status={status}
                fileName={fileName}
                t={t}
              />
            )}

            {status === "success" && resultImage && (
              <ResultPreview
                original={originalImage}
                result={resultImage}
                fileName={fileName}
                onReset={handleReset}
                t={t}
              />
            )}

            {status === "error" && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">❌</div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  {t.processingFailed}
                </h3>
                <p className="text-cyber-muted mb-6">{errorMessage}</p>
                <button
                  onClick={handleReset}
                  className="cyber-btn"
                >
                  {t.tryAgain}
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "⚡", text: t.feature1 },
              { icon: "🔒", text: t.feature2 },
              { icon: "📱", text: t.feature3 },
            ].map((f, i) => (
              <div key={i} className="cyber-panel p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm text-cyber-text-dim">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-4 px-6 text-center">
        <p className="text-cyber-muted text-sm">
          {t.footer}
        </p>
      </footer>
    </main>
  );
}
