import React, { useState } from 'react';
import { Mail, ChevronLeft, Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ForgotPasswordProps {
  onBack?: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleBack = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    }
  };

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

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050000] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600/20 blur-xl pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-red-600/20 blur-xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[150px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center"
      >
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-red-500/20 shadow-[0_0_30px_rgba(255,0,0,0.15)] mb-4">
            <div className="absolute inset-2 rounded-full border border-red-500/10" />
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="z-10 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]">
              <path d="M6 22L6 2 M6 2L18 22 M18 22L18 2" stroke="url(#redGradFP)" strokeWidth="4" strokeLinejoin="miter" strokeLinecap="square"/>
              <defs>
                <linearGradient id="redGradFP" x1="6" y1="2" x2="18" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff4b4b"/>
                  <stop offset="1" stopColor="#990000"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h2 className="mt-2 text-center text-2xl font-medium tracking-wide text-white">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Enter your email to receive recovery instructions
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0"
      >
        {!isSuccess ? (
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 focus:ring-offset-[#050000] shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  'SEND INSTRUCTIONS'
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={handleBack} 
                className="text-sm text-neutral-400 hover:text-white inline-flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-green-400 mb-2">Instructions Sent</h3>
              <p className="text-sm text-neutral-300">
                If an account exists with {email}, you will receive a password reset link shortly.
              </p>
            </div>
            <button 
              type="button"
              onClick={handleBack} 
              className="inline-flex items-center justify-center px-6 py-3 border border-red-900/30 rounded-xl text-sm font-medium text-white hover:bg-[#111] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Return to Login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
