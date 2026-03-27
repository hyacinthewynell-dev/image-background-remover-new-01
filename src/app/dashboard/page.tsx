"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, getTransactions, getPlans, getUserCredits } from "@/lib/supabase";
import { Language, translations } from "@/lib/translations";
import LanguageSelector from "@/components/LanguageSelector";

const STORAGE_KEY = 'bg-remover-lang';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>("en");

  const t = translations[lang];

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session]);

  async function loadData() {
    if (!session?.user?.id) return;
    
    const user = await getUser(
      session.user.id,
      session.user.email || "",
      session.user.name,
      session.user.image
    );
    
    if (user) {
      setCredits(user.credits);
    }
    
    const txns = await getTransactions(session.user.id);
    setTransactions(txns);
    
    const planList = await getPlans();
    setPlans(planList);
    
    setLoading(false);
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="text-cyber-muted">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      {/* Header */}
      <header className="border-b border-cyber-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-accent-dark to-cyber-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">BG</span>
            </div>
            <h1 className="text-lg font-semibold text-cyber-text">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLang={lang} onChange={setLang} />
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm border border-cyber-border rounded-lg hover:bg-cyber-border/50 transition-colors"
            >
              <a
                href="/pricing"
                className="px-4 py-2 text-sm border border-cyber-border rounded-lg hover:bg-cyber-border/50 transition-colors"
              >
                Pricing
              </a>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm border border-cyber-border rounded-lg hover:bg-cyber-border/50 transition-colors"
              >
                Sign Out
              </button>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome */}
        <div className="flex items-center gap-4 mb-8">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || ""}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {t.welcome}, {session.user?.name || "User"}
            </h2>
            <p className="text-cyber-muted">{session.user?.email}</p>
          </div>
        </div>

        {/* Credits Card */}
        <div className="cyber-panel p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">{t.yourCredits}</h3>
              <p className="text-cyber-muted text-sm">{t.creditsDesc}</p>
            </div>
            <div className="text-5xl font-bold text-cyber-accent">{credits}</div>
          </div>
          
          {credits === 0 && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{t.noCredits}</p>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <h3 className="text-2xl font-bold mb-6">{t.purchaseCredits}</h3>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.filter(p => !p.is_subscription).map((plan) => (
            <div key={plan.id} className="cyber-panel p-6">
              <h4 className="text-xl font-bold mb-2">{plan.display_name}</h4>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price_usd}</span>
              </div>
              <div className="mb-6 text-cyber-muted">
                <p>{plan.credits} credits</p>
              </div>
              <button
                onClick={() => router.push(`/dashboard?plan=${plan.name}`)}
                className="w-full py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
              >
                {t.purchase}
              </button>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <h3 className="text-2xl font-bold mb-6">{t.transactionHistory}</h3>
        <div className="cyber-panel overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-cyber-muted">
              {t.noTransactions}
            </div>
          ) : (
            <div className="divide-y divide-cyber-border">
              {transactions.map((txn) => (
                <div key={txn.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{txn.description}</p>
                    <p className="text-sm text-cyber-muted">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${txn.credits_delta > 0 ? "text-green-400" : "text-red-400"}`}>
                    {txn.credits_delta > 0 ? "+" : ""}{txn.credits_delta}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
