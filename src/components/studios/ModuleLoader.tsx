import React from 'react';
import { motion } from 'motion/react';

interface ModuleLoaderProps {
  moduleName?: string;
}

export const ModuleLoader: React.FC<ModuleLoaderProps> = ({ moduleName }) => {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center bg-[#07080b] select-none p-6">
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer subtle pulsating aura */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute w-20 h-20 rounded-full bg-red-600/30 blur-xl"
        />

        {/* Outer glowing track */}
        <div className="w-12 h-12 rounded-full border-2 border-neutral-800" />

        {/* Spinning red arc matching Navix brand */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
          className="absolute w-12 h-12 rounded-full border-2 border-transparent border-t-red-500 border-r-rose-500"
        />

        {/* Center dot */}
        <div className="absolute w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
      </div>

      {/* Typography from the video: MEMUAT MODUL NAVIX AI... */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="flex flex-col items-center gap-1.5 text-center"
      >
        <span className="text-xs font-mono font-bold tracking-[0.25em] text-neutral-300 uppercase">
          MEMUAT MODUL NAVIX AI...
        </span>
        {moduleName && (
          <span className="text-[11px] font-mono text-red-400/80 tracking-wider">
            [{moduleName}]
          </span>
        )}
      </motion.div>
    </div>
  );
};
