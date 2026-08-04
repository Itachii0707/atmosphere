'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface ShortcutItem {
  key: string;
  description: string;
  color: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: '/', description: 'Focus search bar', color: 'bg-neo-yellow' },
  { key: 'G', description: 'Detect my location', color: 'bg-neo-cyan' },
  { key: 'T', description: 'Toggle dark/light theme', color: 'bg-neo-pink' },
  { key: 'U', description: 'Toggle °C / °F unit', color: 'bg-neo-purple' },
  { key: 'R', description: 'Refresh weather data', color: 'bg-neo-mint' },
  { key: 'K', description: 'Open API key settings', color: 'bg-neo-orange' },
  { key: 'B', description: 'Bookmark current city', color: 'bg-neo-yellow' },
  { key: '?', description: 'Show / hide this cheat sheet', color: 'bg-white' },
  { key: 'Esc', description: 'Close any open modal/overlay', color: 'bg-zinc-200' },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="shortcuts-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-neo-yellow border-4 border-black shadow-brutal-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black text-neo-yellow">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                <h2 className="text-xl font-black font-heading tracking-tight">KEYBOARD SHORTCUTS</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-neo-yellow text-black border-2 border-neo-yellow flex items-center justify-center hover:bg-white transition-colors font-black cursor-pointer"
                aria-label="Close shortcuts"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcuts grid */}
            <div className="p-4 grid grid-cols-1 gap-2">
              {SHORTCUTS.map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <kbd
                    className={`min-w-[48px] px-2 py-1 border-2 border-black ${s.color} text-black font-black text-sm text-center shadow-brutal-sm font-mono`}
                  >
                    {s.key}
                  </kbd>
                  <span className="text-sm font-bold text-black">{s.description}</span>
                </motion.div>
              ))}
            </div>

            <div className="px-4 pb-4 text-[10px] font-black text-black/50 uppercase tracking-widest">
              Press ? or Esc to dismiss
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
