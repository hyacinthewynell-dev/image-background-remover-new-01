"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import LanguageSelector from "@/components/LanguageSelector";
import UserButton from "@/components/UserButton";
import { getPlans } from "@/lib/supabase";

const STORAGE_KEY = 'bg-remover-lang';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [lang, setLang] = useState<Language>("en");
  const [plans, setPlans] = useState<any[]>([]);
  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
    loadPlans();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  async function loadPlans() {
    const planList = await getPlans();
    setPlans(planList);
  }

  const oneTimePlans = plans.filter(p => !p.is_subscription);
  const subscriptionPlans = plans.filter(p => p.is_subscription);

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text">
      {/* Header */}
      <header className="border-b border-cyber-border py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-accent-dark to-cyber-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">BG</span>
            </div>
            <h1 className="text-lg font-semibold text-cyber-text">{t.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLang={lang} onChange={setLang} />
            {session ? (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 text-sm border border-cyber-border rounded-lg hover:bg-cyber-border/50 transition-colors"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-2 text-sm bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{t.purchaseCredits}</h2>
          <p className="text-cyber-muted text-lg max-w-2xl mx-auto">
            {lang === 'zh-CN' 
              ? '选择适合您的积分套餐，每次图片处理消耗1个积分'
              : 'Choose a credit plan that works for you. Each image processing uses 1 credit'}
          </p>
        </div>

        {/* One-time Plans */}
        <h3 className="text-2xl font-bold mb-8 text-center">
          {lang === 'zh-CN' ? '一次性购买' : 'One-time Purchase'}
        </h3>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {oneTimePlans.map((plan) => (
            <div key={plan.id} className="cyber-panel p-8 relative">
              {plan.name === 'pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyber-accent text-white text-sm rounded-full">
                  {lang === 'zh-CN' ? '最受欢迎' : 'Most Popular'}
                </div>
              )}
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold mb-2">{plan.display_name}</h4>
                <div className="text-4xl font-bold text-cyber-accent">${plan.price_usd}</div>
                <p className="text-cyber-muted mt-2">{plan.credits} credits</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{lang === 'zh-CN' ? '永久有效' : 'Lifetime access'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{lang === 'zh-CN' ? '高清输出' : 'High quality output'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{lang === 'zh-CN' ? '无水印' : 'No watermark'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{lang === 'zh-CN' ? '优先处理' : 'Priority processing'}</span>
                </li>
              </ul>
              {session ? (
                <button
                  onClick={() => router.push(`/dashboard?plan=${plan.name}`)}
                  className="w-full py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
                >
                  {t.purchase}
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="w-full py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
                >
                  {t.signInGoogle}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-8 text-center">
            {lang === 'zh-CN' ? '常见问题' : 'FAQ'}
          </h3>
          <div className="space-y-4">
            <div className="cyber-panel p-6">
              <h4 className="font-bold mb-2">
                {lang === 'zh-CN' ? '积分会过期吗？' : 'Do credits expire?'}
              </h4>
              <p className="text-cyber-muted">
                {lang === 'zh-CN' 
                  ? '一次性购买的积分永久有效，没有过期时间。'
                  : 'One-time purchased credits are valid forever with no expiration.'}
              </p>
            </div>
            <div className="cyber-panel p-6">
              <h4 className="font-bold mb-2">
                {lang === 'zh-CN' ? '如何购买？' : 'How to purchase?'}
              </h4>
              <p className="text-cyber-muted">
                {lang === 'zh-CN'
                  ? '登录后选择套餐，使用信用卡或 PayPal 支付。支付完成后积分立即到账。'
                  : 'Sign in, choose a plan, and pay with credit card or PayPal. Credits are credited instantly.'}
              </p>
            </div>
            <div className="cyber-panel p-6">
              <h4 className="font-bold mb-2">
                {lang === 'zh-CN' ? '支持哪些支付方式？' : 'What payment methods are supported?'}
              </h4>
              <p className="text-cyber-muted">
                {lang === 'zh-CN'
                  ? '目前支持信用卡支付，PayPal 支付即将推出。'
                  : 'We currently support credit card payments. PayPal coming soon.'}
              </p>
            </div>
            <div className="cyber-panel p-6">
              <h4 className="font-bold mb-2">
                {lang === 'zh-CN' ? '可以退款吗？' : 'Can I get a refund?'}
              </h4>
              <p className="text-cyber-muted">
                {lang === 'zh-CN'
                  ? '未使用的积分可在7天内申请退款。'
                  : 'Unused credits can be refunded within 7 days.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-8 px-6 mt-16">
        <div className="max-w-6xl mx-auto text-center text-cyber-muted text-sm">
          {t.footer}
        </div>
      </footer>
    </div>
  );
}
