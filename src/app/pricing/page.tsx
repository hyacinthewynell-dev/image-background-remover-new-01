"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Language, translations } from "@/lib/translations";
import LanguageSelector from "@/components/LanguageSelector";

const STORAGE_KEY = 'bg-remover-lang';

const plans = [
  {
    name: 'starter',
    display_name: 'Starter',
    credits: 10,
    price_usd: 4.99,
    price_per_credit: '$0.50/积分',
    description: '高清图片，支持 JPG/PNG/WebP',
    popular: false,
  },
  {
    name: 'pro',
    display_name: 'Pro',
    credits: 30,
    price_usd: 12.99,
    price_per_credit: '$0.43/积分',
    description: '高清图片，支持 JPG/PNG/WebP',
    popular: true,
  },
  {
    name: 'power',
    display_name: 'Power',
    credits: 80,
    price_usd: 29.99,
    price_per_credit: '$0.37/积分',
    description: '高清图片，支持 JPG/PNG/WebP',
    popular: false,
  },
];

interface SelectedPlan {
  name: string;
  display_name: string;
  credits: number;
  price_usd: number;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [lang, setLang] = useState<Language>("en");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null);
  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLang && translations[savedLang]) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const getText = (zh: string, en: string) => lang === 'zh-CN' ? zh : en;

  const handlePurchase = (plan: typeof plans[0]) => {
    if (!session) {
      signIn("google");
      return;
    }
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const confirmPurchase = () => {
    if (selectedPlan) {
      router.push(`/dashboard?plan=${selectedPlan.name}`);
      setShowModal(false);
    }
  };

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

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <h2 className="text-4xl font-bold mb-4">{t.purchaseCredits}</h2>
        <p className="text-cyber-muted text-lg">
          {getText('每次图片处理消耗1个积分', 'Each image processing uses 1 credit')}
        </p>
      </div>

      {/* Free Account Card */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="cyber-panel p-8 border-2 border-green-500/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">{getText('注册账户', 'Sign Up')}</h3>
              <p className="text-cyber-muted">{getText('新用户注册账户赠送3积分', 'Get 3 credits free when you sign up')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400">3</div>
              <div className="text-cyber-muted">{getText('积分', 'Credits')}</div>
              <div className="text-green-400 font-bold">{getText('免费', 'FREE')}</div>
            </div>
          </div>
          {!session && (
            <button
              onClick={() => signIn("google")}
              className="mt-6 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              {getText('立即注册', 'Sign Up Now')}
            </button>
          )}
        </div>
      </div>

      {/* Paid Plans */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold mb-8 text-center">
          {getText('购买积分包', 'Purchase Credits')}
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`cyber-panel p-8 relative ${plan.popular ? 'border-2 border-cyber-accent' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyber-accent text-white text-sm rounded-full font-medium">
                  {getText('最受欢迎', 'Most Popular')}
                </div>
              )}
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold mb-2">{plan.display_name}</h4>
                <div className="text-4xl font-bold text-cyber-accent">${plan.price_usd}</div>
                <div className="text-cyber-muted mt-1">{plan.credits} {getText('积分', 'Credits')}</div>
                <div className="text-sm text-cyber-muted mt-1">{plan.price_per_credit}</div>
              </div>
              <p className="text-center text-cyber-muted mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{getText('永久有效', 'Lifetime access')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{getText('高清输出', 'High quality output')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{getText('无水印', 'No watermark')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>{getText('优先处理', 'Priority processing')}</span>
                </li>
              </ul>
              <button
                onClick={() => handlePurchase(plan)}
                className="w-full py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
              >
                {getText('购买', 'Purchase')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cyber-panel rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">{getText('确认购买', 'Confirm Purchase')}</h3>
            <div className="cyber-panel p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-cyber-muted">{getText('套餐', 'Plan')}</span>
                <span className="font-bold">{selectedPlan.display_name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-cyber-muted">{getText('积分数量', 'Credits')}</span>
                <span className="font-bold">{selectedPlan.credits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-muted">{getText('价格', 'Price')}</span>
                <span className="text-2xl font-bold text-cyber-accent">${selectedPlan.price_usd}</span>
              </div>
            </div>
            <p className="text-cyber-muted text-sm mb-6">
              {getText('点击确认后将跳转到支付页面', 'Click confirm to proceed to payment')}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-cyber-border rounded-lg hover:bg-cyber-border/50 transition-colors"
              >
                {getText('取消', 'Cancel')}
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 py-3 bg-cyber-accent hover:bg-cyber-accent/80 text-white rounded-lg font-medium transition-colors"
              >
                {getText('确认', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold mb-8 text-center">FAQ</h3>
        <div className="space-y-4">
          <div className="cyber-panel p-6">
            <h4 className="font-bold mb-2">{getText('积分会过期吗？', 'Do credits expire?')}</h4>
            <p className="text-cyber-muted">{getText('一次性购买的积分永久有效，没有过期时间。', 'One-time purchased credits are valid forever with no expiration.')}</p>
          </div>
          <div className="cyber-panel p-6">
            <h4 className="font-bold mb-2">{getText('如何购买？', 'How to purchase?')}</h4>
            <p className="text-cyber-muted">{getText('登录后选择套餐，使用信用卡或 PayPal 支付。支付完成后积分立即到账。', 'Sign in, choose a plan, and pay with credit card or PayPal. Credits are credited instantly.')}</p>
          </div>
          <div className="cyber-panel p-6">
            <h4 className="font-bold mb-2">{getText('支持哪些支付方式？', 'What payment methods are supported?')}</h4>
            <p className="text-cyber-muted">{getText('目前支持信用卡支付，PayPal 支付即将推出。', 'We currently support credit card payments. PayPal coming soon.')}</p>
          </div>
          <div className="cyber-panel p-6">
            <h4 className="font-bold mb-2">{getText('可以退款吗？', 'Can I get a refund?')}</h4>
            <p className="text-cyber-muted">{getText('未使用的积分可在7天内申请退款。', 'Unused credits can be refunded within 7 days.')}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyber-border py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-cyber-muted text-sm">
          {t.footer}
        </div>
      </footer>
    </div>
  );
}
