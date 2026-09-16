import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../utils/toast';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' | 'warn' }>;
      const { message, type } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts(prev => [...prev, { id, message, type }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    };

    window.addEventListener('navix-toast', handleToastEvent);
    return () => {
      window.removeEventListener('navix-toast', handleToastEvent);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          let Icon = Info;
          let borderClass = 'border-blue-500 bg-[#161b22] text-neutral-100';
          let iconColor = 'text-blue-400';
          
          if (toast.type === 'success') {
            Icon = CheckCircle;
            borderClass = 'border-green-500 bg-[#0f1c15] text-green-100';
            iconColor = 'text-green-400';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            borderClass = 'border-red-500 bg-[#1c1114] text-red-100';
            iconColor = 'text-red-400';
          } else if (toast.type === 'warn') {
            Icon = AlertTriangle;
            borderClass = 'border-yellow-500 bg-[#1c1a11] text-yellow-100';
            iconColor = 'text-yellow-400';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-xl ${borderClass} font-sans`}
            >
              <Icon size={18} className={`${iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 text-xs font-medium leading-relaxed">
                {toast.message}
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
