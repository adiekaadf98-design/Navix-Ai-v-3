import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, 
  Cpu, Sparkles, Code2, LineChart, FileText, Music, ImageIcon, 
  Zap, CheckCircle2, LockKeyhole, Terminal, Layers, Globe, Activity,
  Server, RefreshCw, BarChart2, Video, UserPlus, Check, Trash2, X, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { isDeveloperEmail } from '../../services/auth';
import { PaymentModal } from '../PaymentModal';
import { LiveSkillsConstellation } from './LiveSkillsConstellation';
import { ForgotPassword } from './ForgotPassword';

// Google Icon
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// GitHub Icon
const GitHubIcon = () => (
  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// Apple Icon
const AppleIcon = () => (
  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

export function LandingLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'google' | 'github' | 'apple' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'ultra' | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login, loginOAuth, loginDemo, loginDeveloper, isLoading, error, clearError, user } = useAuthStore();

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  const handlePlanClick = (plan: 'starter' | 'pro' | 'ultra') => {
    setSelectedPlan(plan);
  };

  // 1. Firebase Google Login
  const handleFirebaseGoogleLogin = async () => {
    setActiveProvider('google');
    clearError();
    try {
      await loginOAuth('google');
    } catch (err: any) {
      console.error('Firebase Google login error:', err);
    } finally {
      setActiveProvider(null);
    }
  };

  // 2. Email / Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    if (!password || !password.trim()) {
      return;
    }
    clearError();
    await login(email.trim(), password);
  };

  // 3. GitHub & Apple Provider Login
  const handleDirectProviderLogin = async (provider: 'github' | 'apple') => {
    setActiveProvider(provider);
    clearError();
    try {
      await loginOAuth(provider);
    } catch (err) {
      console.error(`Error during ${provider} login:`, err);
    } finally {
      setActiveProvider(null);
    }
  };

  // 4. Demo Login
  const handleDemoLogin = async () => {
    clearError();
    await loginDemo();
  };

  return (
    <div className="w-full h-screen overflow-y-auto bg-[#0a0a0a] text-white font-sans overflow-x-hidden selection:bg-red-500 selection:text-white custom-scrollbar">
      {/* Background Subtle Glow Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[500px] bg-red-900/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 sm:space-y-24">
        
        {/* SECTION 1: HEADER & LOGIN BOX */}
        <section className="flex flex-col items-center pt-4 sm:pt-8">
          
          {/* Logo Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-semibold mb-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          >
            <Cpu size={14} className="text-red-400 animate-pulse" />
            <span>NAVIX AI • AUTONOMOUS INTELLIGENCE SYSTEM v1.0</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-center text-white max-w-2xl leading-tight"
          >
            NAVIX <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">AI</span>
          </motion.h1>

          <p className="mt-3 text-sm sm:text-base text-neutral-400 text-center max-w-md">
            Sistem Operasi Kecerdasan Buatan Multi-Engine Terintegrasi
          </p>

          {/* LOGIN CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-md mt-8 p-6 sm:p-8 rounded-2xl bg-[#111111]/90 border border-neutral-800/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-white tracking-wide">Masuk ke NAVIX AI</h2>
              <p className="text-xs text-neutral-400 mt-1">Otentikasi Aman Firebase & Akun Multi-Engine</p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2">
                <LockKeyhole size={16} className="shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  <button onClick={clearError} className="block text-[10px] text-red-300 underline mt-1 cursor-pointer">Tutup</button>
                </div>
              </div>
            )}

            {/* 1. TOMBOL UTAMA: GOOGLE (FIREBASE AUTH) */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleFirebaseGoogleLogin}
                disabled={isLoading || activeProvider !== null}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-neutral-100 active:scale-[0.98] text-neutral-900 font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
              >
                {activeProvider === 'google' ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-neutral-700" />
                    <span>Menghubungkan Akun Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Masuk dengan Akun Google</span>
                  </>
                )}
              </button>

              {/* Opsi Provider Pendukung: GitHub & Apple */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDirectProviderLogin('github')}
                  disabled={isLoading || activeProvider !== null}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  <GitHubIcon />
                  <span>GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectProviderLogin('apple')}
                  disabled={isLoading || activeProvider !== null}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  <AppleIcon />
                  <span>Apple ID</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <span className="relative bg-[#111111] px-3 text-xs font-mono text-neutral-500 uppercase">
                atau gunakan email
              </span>
            </div>

            {/* 2. FORM LOGIN EMAIL & PASSWORD */}
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-black/60 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-[11px] text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="w-full bg-black/60 border border-neutral-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || activeProvider !== null}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading && activeProvider === null ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memproses Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* 3. FOOTER: DEMO & DEVELOPER ACCESS */}
            <div className="mt-6 pt-5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles size={14} className="text-cyan-400" />
                <span>Masuk Mode Demo</span>
              </button>

              <button
                type="button"
                onClick={handleFirebaseGoogleLogin}
                disabled={isLoading}
                className="text-red-400/80 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer font-mono text-[11px]"
              >
                <Zap size={13} className="text-amber-400" />
                <span>Akses Developer (Google)</span>
              </button>
            </div>

          </motion.div>
        </section>

        {/* SECTION PRICING: PAKET LANGGANAN */}
        <section className="space-y-6 border-t border-neutral-800/60 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Pricing Plans</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Pilih Paket Langganan NAVIX AI</h2>
            <p className="text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
              Dapatkan akses ke model AI berkualitas tinggi, akurasi maksimal, dan kuota yang menyesuaikan dengan tingkat kebutuhan komputasi Anda setiap hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* TIER 1: $5 */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-neutral-800 flex flex-col h-full hover:border-neutral-600 transition-colors">
              <div className="mb-4">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Starter Plan</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$5</span>
                  <span className="text-xs text-neutral-500">/ bulan</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mb-6">Cocok untuk penggunaan pribadi dan tugas ringan sehari-hari.</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>±100x Query Akurasi Tinggi / hari</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Generasi Gambar (Standard Speed)</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Akses Standar ke Ekosistem GitHub</span>
                </li>
              </ul>
              
              <button 
                onClick={() => handlePlanClick('starter')}
                className="w-full py-2.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-white text-xs font-bold transition-colors"
              >
                Pilih Starter
              </button>
            </div>

            {/* TIER 2: $10 (POPULAR) */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-red-900/20 to-[#111111] border border-red-500/30 flex flex-col h-full relative transform md:-translate-y-2 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Paling Laris
              </div>
              <div className="mb-4">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Pro Plan</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$10</span>
                  <span className="text-xs text-neutral-500">/ bulan</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mb-6">Untuk profesional yang membutuhkan kecepatan dan akurasi ekstra.</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                  <span className="font-semibold text-white">±500x Query Akurasi Tinggi / hari</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                  <span>Generasi Gambar (Fast GPU)</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                  <span>Prioritas Analisis Finansial & Trading</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                  <span>Cloud Storage Terenkripsi 5GB</span>
                </li>
              </ul>
              
              <button 
                onClick={() => handlePlanClick('pro')}
                className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-900/20"
              >
                Mulai Langganan Pro
              </button>
            </div>

            {/* TIER 3: $30 */}
            <div className="p-6 rounded-2xl bg-[#111111] border border-neutral-800 flex flex-col h-full hover:border-neutral-600 transition-colors">
              <div className="mb-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ultra Plan</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$30</span>
                  <span className="text-xs text-neutral-500">/ bulan</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 mb-6">Akses AI tanpa batas dengan performa setingkat Enterprise.</p>
              
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                  <span className="font-semibold text-white">Unlimited Query Akurasi Maksimal</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                  <span>Prioritas Rendering (Server Tier-1)</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                  <span>Akses Fitur Eksperimental (Beta)</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-neutral-300">
                  <CheckCircle2 size={16} className="text-amber-500 shrink-0" />
                  <span>Dukungan Premium 24/7 (Developer)</span>
                </li>
              </ul>
              
              <button 
                onClick={() => handlePlanClick('ultra')}
                className="w-full py-2.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-white text-xs font-bold transition-colors"
              >
                Pilih Ultra
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: APA ITU NAVIX AI */}
        <section className="space-y-6 border-t border-neutral-800/60 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Tentang Platform</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Apa Itu NAVIX AI?</h2>
            <p className="text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
              NAVIX AI adalah Sistem Operasi AI Otonom generasi baru yang menggabungkan kecerdasan buatan Navix Neural Engine, ekosistem koding 50.000+ repositori GitHub open-source, studio pembuatan media visual & audio, serta mesin analisis finansial kuantitatif dalam satu platform terpadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Cpu size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Sistem Otonom</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Menjalankan agen perencanaan bertingkat (Thinking Engine) yang secara otomatis menganalisis kompleksitas instruksi sebelum mengeksekusinya.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-amber-500/30 space-y-3 relative overflow-hidden shadow-lg shadow-amber-950/10">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Code2 size={20} />
                </div>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE 50.000+
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>50.000+ Skills GitHub</span>
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mt-1 mb-3">
                  Terhubung langsung dengan matriks repositori open-source GitHub resmi dengan interkoneksi neural graf aktif.
                </p>
              </div>

              {/* Dynamic Live Skills Constellation with Connecting Dots */}
              <LiveSkillsConstellation />
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Keamanan & Performa</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Didukung oleh Security Shield terintegrasi, arsitektur High-Availability dengan auto-failover, dan verifikasi fakta otomatis tanpa simulasi palsu.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: KINERJA & KEMAMPUAN UTAMA */}
        <section className="space-y-6 border-t border-neutral-800/60 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Arsitektur Performa</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Kinerja Utama NAVIX AI</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111111] border border-neutral-800 flex items-start gap-3">
              <RefreshCw size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">High-Availability Cluster</h4>
                <p className="text-xs text-neutral-400 mt-1">Infrastruktur cloud terdistribusi dengan pemulihan otomatis untuk menjamin kestabilan 24/7.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-neutral-800 flex items-start gap-3">
              <Zap size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Sub-Second Latency</h4>
                <p className="text-xs text-neutral-400 mt-1">Respon instan dengan mesin Navix Flash & Navix Pro Neural.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-neutral-800 flex items-start gap-3">
              <Activity size={20} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Thinking Engine</h4>
                <p className="text-xs text-neutral-400 mt-1">Klasifikasi tugas dan tingkat effort adaptif untuk solusi mendalam.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-neutral-800 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">Verification Engine</h4>
                <p className="text-xs text-neutral-400 mt-1">Pemeriksaan akurasi kode dan fakta hasil eksekusi secara riil.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: EKOSISTEM ENGINE */}
        <section className="space-y-6 border-t border-neutral-800/60 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Core Engine Matrix</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Ekosistem Engine Dalam NAVIX AI</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800/80">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
                <Layers size={16} />
                <span>AIRouter Engine</span>
              </div>
              <p className="text-xs text-neutral-400">Menentukan model AI terbaik (Flash, Pro, Lite) sesuai jenis tugas dan ukuran file lampiran.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800/80">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                <Shield size={16} />
                <span>SecurityShield</span>
              </div>
              <p className="text-xs text-neutral-400">Melindungi aplikasi dari serangan malicious prompt, spamming, dan kebocoran kredensial.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800/80">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                <Terminal size={16} />
                <span>TaskEngine & Sandbox</span>
              </div>
              <p className="text-xs text-neutral-400">Menjalankan simulasi laboratorium sains, pembuatan dokumen PDF, dan koding langsung di Live Studio Canvas.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800/80">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <LineChart size={16} />
                <span>Trading Engine Pro</span>
              </div>
              <p className="text-xs text-neutral-400">Mengambil harga riil XAUUSD, Forex, dan Crypto serta mengkalkulasi sinyal ritel profesional SMC & Pine Script v5.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800/80">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-2">
                <ImageIcon size={16} />
                <span>Creative Media Studio</span>
              </div>
              <p className="text-xs text-neutral-400">Generasi & penyuntingan gambar Nano Banana 2, pembuatan video animasi FX, dan komposisi musik WAV.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800/80">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
                <Server size={16} />
                <span>Monitoring & Log</span>
              </div>
              <p className="text-xs text-neutral-400">Mencatat metrik latensi, throughput komputasi, serta kesehatan sistem secara real-time.</p>
            </div>
          </div>
        </section>

        {/* SECTION 5: FUNGSI AI & MULTIMEDIA RIIL */}
        <section className="space-y-6 border-t border-neutral-800/60 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Fitur Multimedia Riil</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Kemampuan AI & Multimedia Available</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <ImageIcon size={18} className="text-red-400" />
                <span>AI Image & Photo Editing</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Pembuatan gambar baru fotorealistik dengan SynthID watermark, penyuntingan foto (Invert, Grayscale, Blur, Blend), serta shortcut gaya seperti Navix Me, Figurine, dan Hairstyle.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <Video size={18} className="text-amber-400" />
                <span>AI Video FX & Animation</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mengubah gambar diam menjadi animasi gerakan halus (Animate Zoom/Pan), memotong video, membalikkan putaran (Reverse), dan memberikan filter visual menggunakan FFmpeg engine.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <Music size={18} className="text-emerald-400" />
                <span>Audio & Song Synthesis</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Membuat komposisi musik WAV dari lirik atau deskripsi genre lagu pengguna, serta fitur pembacaan suara sintetis (Text-to-Speech) responsif.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111111] border border-neutral-800 space-y-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <FileText size={18} className="text-cyan-400" />
                <span>Document & PDF Repair</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Menulis artikel terstruktur, membetulkan tata bahasa / kosakata, dan meregenerasi file PDF yang diunggah ke dalam format dokumen yang rapi di Document Editor.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 6: TRADING & FINANCIAL ECOSYSTEM */}
        <section className="space-y-6 border-t border-neutral-800/60 pt-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Financial Analytics</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Trading & Analysis Ecosystem</h2>
          </div>

          <div className="p-6 rounded-2xl bg-[#111111] border border-neutral-800 space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold text-base">
              <BarChart2 size={20} />
              <span>Sinyal & Algoritma Trading Ritel GitHub</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              NAVIX AI terhubung ke API Binance, Yahoo Finance, dan TradingView untuk menyajikan analisis pasar riil instrumen <strong className="text-white">Gold (XAUUSD)</strong>, <strong className="text-white">Crypto (BTCUSDT, ETHUSDT)</strong>, dan <strong className="text-white">Forex (EURUSD, GBPUSD)</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs">
                <span className="text-emerald-400 font-bold block mb-1">Smart Money Concepts</span>
                <span className="text-neutral-400 text-[11px]">Deteksi Fair Value Gap (FVG) & Breaker Block otomatis.</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs">
                <span className="text-amber-400 font-bold block mb-1">Entry & Risk Management</span>
                <span className="text-neutral-400 text-[11px]">Kalkulasi Stop Loss & Take Profit dengan rasio R:R ≥ 1:2.</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs">
                <span className="text-cyan-400 font-bold block mb-1">TradingView Pine Script v5</span>
                <span className="text-neutral-400 text-[11px]">Hasilkan skrip indikator kustom asli siap ditempel di TradingView.</span>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-neutral-800/80 pt-8 pb-12 text-center text-xs text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-2 font-mono text-neutral-400">
            <Cpu size={14} className="text-red-500" />
            <span>NAVIX AI — Autonomous Intelligence System</span>
          </div>
          <p>© 2026 NAVIX AI. Hak Cipta Dilindungi. Seluruh fungsi dan ekosistem berjalan secara nyata.</p>
        </footer>

      </div>
      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
