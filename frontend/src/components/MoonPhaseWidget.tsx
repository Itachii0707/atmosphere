'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MoonPhaseProps {
  dateEpoch?: number; // optional – defaults to today
}

type PhaseInfo = {
  name: string;
  emoji: string;
  illumination: number; // 0-100%
  tip: string;
};

function getMoonPhase(timestamp?: number): PhaseInfo {
  // Known new moon: Jan 6 2000 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const synodicPeriod = 29.53058867 * 24 * 60 * 60 * 1000; // ms
  const now = timestamp ? timestamp * 1000 : Date.now();
  const elapsed = ((now - knownNewMoon) % synodicPeriod + synodicPeriod) % synodicPeriod;
  const fraction = elapsed / synodicPeriod; // 0 to 1

  const illumination = Math.round(
    50 * (1 - Math.cos(2 * Math.PI * fraction))
  );

  let name: string;
  let emoji: string;
  let tip: string;

  if (fraction < 0.03 || fraction >= 0.97) {
    name = 'New Moon'; emoji = '🌑';
    tip = 'The moon is invisible tonight. Perfect for stargazing!';
  } else if (fraction < 0.22) {
    name = 'Waxing Crescent'; emoji = '🌒';
    tip = 'A thin crescent moon is visible in the evening sky.';
  } else if (fraction < 0.28) {
    name = 'First Quarter'; emoji = '🌓';
    tip = 'Half the moon is visible. Good conditions for photography.';
  } else if (fraction < 0.47) {
    name = 'Waxing Gibbous'; emoji = '🌔';
    tip = 'The moon is growing brighter each night.';
  } else if (fraction < 0.53) {
    name = 'Full Moon'; emoji = '🌕';
    tip = 'Bright full moon tonight! Expect better visibility outdoors.';
  } else if (fraction < 0.72) {
    name = 'Waning Gibbous'; emoji = '🌖';
    tip = 'The moon is starting to fade after its peak.';
  } else if (fraction < 0.78) {
    name = 'Last Quarter'; emoji = '🌗';
    tip = 'The moon is half-lit, rising later in the night.';
  } else {
    name = 'Waning Crescent'; emoji = '🌘';
    tip = 'The moon is barely visible — a new cycle begins soon.';
  }

  return { name, emoji, illumination, tip };
}

// 7-day lunar strip
function getLunarStrip(): PhaseInfo[] {
  const strip: PhaseInfo[] = [];
  const today = Date.now();
  for (let i = 0; i < 7; i++) {
    const epochMs = today + i * 24 * 60 * 60 * 1000;
    strip.push(getMoonPhase(epochMs / 1000));
  }
  return strip;
}

export default function MoonPhaseWidget({ dateEpoch }: MoonPhaseProps) {
  const phase = getMoonPhase(dateEpoch);
  const strip = getLunarStrip();
  const days = ['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIndex = new Date().getDay(); // 0=Sun

  return (
    <div className="neo-card bg-black text-white p-5 flex flex-col gap-4">
      <h3 className="text-lg font-black font-heading border-b-2 border-white pb-2 flex items-center gap-2">
        🌙 MOON PHASE
      </h3>

      {/* Main Phase Display */}
      <div className="flex items-center gap-5">
        {/* Animated Moon SVG */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-6xl select-none"
          aria-label={phase.name}
        >
          {phase.emoji}
        </motion.div>
        <div>
          <p className="text-xl font-black leading-tight">{phase.name}</p>
          <p className="text-sm font-bold text-zinc-300 mt-1">{phase.illumination}% Illuminated</p>
          {/* Illumination bar */}
          <div className="w-32 h-3 border-2 border-white bg-zinc-800 mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${phase.illumination}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-neo-yellow"
            />
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs font-bold text-zinc-400 italic border-l-4 border-neo-yellow pl-2">
        {phase.tip}
      </p>

      {/* 7-Day Lunar Strip */}
      <div className="border-t-2 border-zinc-700 pt-3">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2">7-DAY LUNAR CALENDAR</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {strip.map((p, i) => {
            const dayLabel = i === 0 ? 'Today' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(todayIndex + i) % 7];
            return (
              <div
                key={i}
                className={`flex flex-col items-center gap-1 min-w-[44px] px-1 py-1.5 border ${
                  i === 0
                    ? 'border-neo-yellow bg-zinc-800 text-neo-yellow'
                    : 'border-zinc-700 text-zinc-400'
                }`}
              >
                <span className="text-[10px] font-black">{dayLabel}</span>
                <span className="text-xl">{p.emoji}</span>
                <span className="text-[9px] font-bold">{p.illumination}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
