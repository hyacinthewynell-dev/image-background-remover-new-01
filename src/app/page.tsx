"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";
import ResultPreview from "@/components/ResultPreview";
import StatusMessage from "@/components/StatusMessage";
import LanguageSelector from "@/components/LanguageSelector";
import UserButton from "@/components/UserButton";
import { Language, translations } from "@/lib/translations";
import { getUserCredits, deductCredit } from "@/lib/supabase";

type Status = "idle" | "uploading" | "processing" | "success" | "error";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [lang, setLang] = useState<Language>("en");
  const [credits, setCredits] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (session?.user?.id) {
      loadCredits();
    }
  }, [session]);

  async function loadCredits() {
    if (!session?.user?.id) return;
    const c = await getUserCredits(session.user.id);
    setCredits(c);
  }

  const handleFileSelect = useCallback(async (file: File) => {
    if (!session) {
      signIn("google");
      return;
    }

    if (credits !== null && credits <= 0) {
      setShowUpgrade(true);
      return;
    }

    setFileName(file.name);
    setStatus("uploading");
    setErrorMessage("");
    setResultImage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

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

      if (session?.user?.id) {
        await deductCredit(session.user.id);
      }

      setResultImage(data.data.result);
      setStatus("success");
      setCredits((prev) => (prev !== null ? prev - 1 : null));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setErrorMessage(message);
      setStatus("error");
    }
  }, [session, credits]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setOriginalImage(null);
    setResultImage(null);
    setFileName("");
    setErrorMessage("");
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-cyber-border py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-accent-dark to-cyber-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">BG</span>
            </div>
            <h1 className="text-lg font-semibold text-cyber-text">{t.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLang={lang} onChange={setLang} />
            {session && credits !== null && (
              <div className="text-sm text-cyber-muted">
                Credits: <span className="text-cyber-accent font-bold">{credits}</span>
              </div>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {!session ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Sign in to use BG Remover</h2>
              <p className="text-cyber-muted mb-6">Create an account to get 3 free credits</p>
              <button
                onClick={() => signIn("google")}
                className="px-6 py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          ) : credits === 0 ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Credits Remaining</h2>
              <p className="text-cyber-muted mb-6">You have used all your credits. Please purchase more to continue.</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-6 py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
              >
                Purchase Credits
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">{t.title}</h2>
                <p className="text-cyber-muted">{t.subtitle}</p>
              </div>

              {(status === "uploading" || status === "processing") && (
                <StatusMessage status={status} fileName={fileName} t={t} />
              )}

              {status === "idle" && (
                <UploadZone onFileSelect={handleFileSelect} t={t} />
              )}

              {status === "error" && errorMessage && (
                <div className="text-center py-8">
                  <p className="text-red-400 mb-4">{errorMessage}</p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {resultImage && (
                <ResultPreview
                  originalImage={originalImage}
                  resultImage={resultImage}
                  fileName={fileName}
                  onReset={handleReset}
                />
              )}
            </>
          )}

          {showUpgrade && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-cyber-panel p-8 rounded-lg max-w-md mx-4">
                <h3 className="text-xl font-bold mb-4">No Credits Remaining</h3>
                <p className="text-cyber-muted mb-6">You need credits to process images. Please purchase more.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="flex-1 px-4 py-2 border border-cyber-border rounded-lg hover:bg-cyber-border/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 px-4 py-2 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
