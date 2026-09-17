import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { initiateRealGoogleAuth } from '../../utils/oauthClient';

// Basic Apple Icon SVG
const AppleIcon = () => (
  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

// Basic Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// GitHub Icon SVG
const GitHubIcon = () => (
  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeProvider, setActiveProvider] = useState<'google' | 'github' | 'apple' | null>(null);
  const { login, loginOAuth, isLoading, isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, checkAuth]);

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }
    
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleDirectProviderLogin = async (provider: 'google' | 'github' | 'apple') => {
    setActiveProvider(provider);
    setError(null);
    try {
      const success = await loginOAuth(provider);
      setActiveProvider(null);
      if (success) {
        navigate('/');
      } else {
        setError(`${provider.toUpperCase()} login failed.`);
      }
    } catch (err: any) {
      console.error(`[OAuth Login Error]:`, err);
      setError(err?.message || `Login dengan ${provider} gagal.`);
      setActiveProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050000] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Edge glows */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600/20 blur-xl pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-red-600/20 blur-xl pointer-events-none" />
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center"
      >
        {/* NAVIX Logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative flex items-center justify-center w-28 h-28 rounded-full border border-red-500/20 shadow-[0_0_40px_rgba(255,0,0,0.15)] mb-4">
            <div className="absolute inset-2 rounded-full border border-red-500/10" />
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-10 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
              <path d="M6 22L6 2 M6 2L18 22 M18 22L18 2" stroke="url(#redGrad)" strokeWidth="4" strokeLinejoin="miter" strokeLinecap="square"/>
              <defs>
                <linearGradient id="redGrad" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff4b4b"/>
                  <stop offset="1" stopColor="#990000"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-[0.15em] text-white flex items-center">
            NAVIX<span className="font-light italic text-red-500 ml-2">AI</span>
          </h1>
          <p className="text-[9px] tracking-[0.3em] text-neutral-400 mt-2 uppercase font-medium">
            Intelligent <span className="text-red-600 mx-1">•</span> Powerful <span className="text-red-600 mx-1">•</span> Secure
          </p>
        </div>

        <h2 className="mt-4 text-center text-2xl font-medium tracking-wide text-white">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Login to continue your journey
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0"
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400 text-center">
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-red-600" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-red-900/30 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-red-600" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-3 bg-[#0a0a0a] border border-red-900/30 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-xs text-red-500 hover:text-red-400 font-medium transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-[#050000] shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <span className="tracking-wider">LOGIN</span>
                  <ChevronRight className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>
          </div>
          
          <div className="text-center text-xs text-neutral-600 mt-2">
            Demo Credentials: admin@navix.ai / admin
          </div>
        </form>

        <div className="relative mt-8 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-red-900/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-[#050000] text-neutral-500">OR</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => handleDirectProviderLogin('google')}
            disabled={isLoading || activeProvider !== null}
            className="w-full flex items-center justify-center py-3 px-4 border border-red-900/30 hover:border-red-500/60 rounded-xl bg-[#0a0a0a] hover:bg-[#111] text-sm font-medium text-neutral-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            {activeProvider === 'google' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-red-500 mr-2" />
                <span>Connecting Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span className="ml-3">Continue with Google</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDirectProviderLogin('github')}
            disabled={isLoading || activeProvider !== null}
            className="w-full flex items-center justify-center py-3 px-4 border border-neutral-800 hover:border-neutral-600 rounded-xl bg-[#0a0a0a] hover:bg-[#111] text-sm font-medium text-neutral-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {activeProvider === 'github' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white mr-2" />
                <span>Connecting GitHub...</span>
              </>
            ) : (
              <>
                <GitHubIcon />
                <span className="ml-3">Continue with GitHub</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleDirectProviderLogin('apple')}
            disabled={isLoading || activeProvider !== null}
            className="w-full flex items-center justify-center py-3 px-4 border border-neutral-800 hover:border-neutral-600 rounded-xl bg-[#0a0a0a] hover:bg-[#111] text-sm font-medium text-neutral-300 hover:text-white transition-all focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {activeProvider === 'apple' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white mr-2" />
                <span>Connecting Apple ID...</span>
              </>
            ) : (
              <>
                <AppleIcon />
                <span className="ml-3">Continue with Apple (iOS)</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center">
            <Shield className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-xs text-neutral-500">
              Your data is protected with 
            </p>
          </div>
          <p className="text-xs font-medium">
             <span className="text-red-500">NAVIX AI</span> <span className="text-neutral-400">Security Shield</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
