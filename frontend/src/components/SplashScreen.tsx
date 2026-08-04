'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'logo' | 'tagline' | 'exit'>('logo');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 900);
    const t2 = setTimeout(() => setPhase('exit'), 2200);
    const t3 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const letters = 'ATMOSPHERE'.split('');

  return (
    <AnimatePresence>
      {phase !== 'exit' && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-neo-yellow overflow-hidden"
        >
          {/* Decorative background blocks - pure neubrutalism */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-black opacity-10" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-black opacity-10" />
          <div className="absolute top-1/4 right-8 w-20 h-20 bg-neo-pink border-4 border-black shadow-brutal" />
          <div className="absolute bottom-1/4 left-8 w-16 h-16 bg-neo-mint border-4 border-black shadow-brutal" />
          <div className="absolute top-12 right-1/3 w-10 h-10 bg-neo-purple border-3 border-black" />

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Animated Logo Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              className="w-24 h-24 border-4 border-black shadow-brutal-lg overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-512.png" alt="Atmosphere Logo" className="w-full h-full object-cover" />
            </motion.div>


            {/* Animated Letters — stagger in */}
            <div className="flex items-center gap-1 md:gap-2" aria-label="ATMOSPHERE">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 60, opacity: 0, rotate: (i % 2 === 0 ? -8 : 8) }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{
                    delay: 0.05 + i * 0.07,
                    type: 'spring',
                    stiffness: 300,
                    damping: 22,
                  }}
                  className="text-4xl md:text-6xl lg:text-7xl font-black font-heading text-black leading-none tracking-tight select-none"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Tagline */}
            <AnimatePresence>
              {phase === 'tagline' && (
                <motion.div
                  key="tagline"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center gap-3"
                >
                  <p className="text-sm md:text-base font-black tracking-widest text-black uppercase border-2 border-black bg-white px-4 py-1.5 shadow-brutal-sm">
                    NEUBRUTALIST WEATHER DASHBOARD
                  </p>
                  {/* Loading bar */}
                  <div className="w-64 h-4 border-2 border-black bg-white overflow-hidden shadow-brutal-sm">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.1, ease: 'easeInOut' }}
                      className="h-full bg-black"
                    />
                  </div>
                  <p className="text-xs font-bold text-black/60 tracking-widest animate-pulse">
                    SYNCING ATMOSPHERE...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom corner branding */}
          <div className="absolute bottom-6 right-6 text-xs font-black text-black/40 tracking-widest">
            WEATHER · AI · DESIGN
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
