"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, getTransactions, getPlans, getUserCredits } from "@/lib/supabase";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyber-muted">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-cyber-muted">
              Welcome back, {session.user?.name || "User"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ""}
                className="w-12 h-12 rounded-full"
              />
            )}
          </div>
        </div>

        {/* Credits Card */}
        <div className="cyber-panel p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Credits</h2>
              <p className="text-cyber-muted text-sm">
                Credits are used for image processing
              </p>
            </div>
            <div className="text-5xl font-bold text-cyber-accent">
              {credits}
            </div>
          </div>
          
          {credits === 0 && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">
                You have no credits remaining. Please purchase more to continue using the service.
              </p>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <h2 className="text-2xl font-bold mb-6">Purchase Credits</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.filter(p => !p.is_subscription).map((plan) => (
            <div key={plan.id} className="cyber-panel p-6">
              <h3 className="text-xl font-bold mb-2">{plan.display_name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price_usd}</span>
              </div>
              <div className="mb-6 text-cyber-muted">
                <p>{plan.credits} credits</p>
              </div>
              <button
                onClick={() => router.push(`/dashboard/checkout?plan=${plan.name}`)}
                className="w-full py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
              >
                Purchase
              </button>
            </div>
          ))}
        </div>

        {/* Transaction History */}
        <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
        <div className="cyber-panel overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-cyber-muted">
              No transactions yet
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
