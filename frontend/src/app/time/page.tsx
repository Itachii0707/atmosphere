'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, X, Clock, ArrowLeft, RefreshCw, Minus } from 'lucide-react';
import BottomNav from '../../components/BottomNav';

// ─── World Timezone Data ────────────────────────────────────────────────────
const WORLD_CITIES = [
  { city: 'New York', country: 'US', timezone: 'America/New_York', flag: '🇺🇸', color: 'bg-neo-blue' },
  { city: 'Los Angeles', country: 'US', timezone: 'America/Los_Angeles', flag: '🇺🇸', color: 'bg-neo-pink' },
  { city: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧', color: 'bg-neo-purple' },
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷', color: 'bg-neo-mint' },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪', color: 'bg-neo-orange' },
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪', color: 'bg-neo-yellow' },
  { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳', color: 'bg-neo-orange' },
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵', color: 'bg-neo-pink' },
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳', color: 'bg-neo-blue' },
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬', color: 'bg-neo-cyan' },
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺', color: 'bg-neo-mint' },
  { city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷', color: 'bg-neo-yellow' },
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦', color: 'bg-neo-purple' },
  { city: 'Chicago', country: 'US', timezone: 'America/Chicago', flag: '🇺🇸', color: 'bg-neo-cyan' },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷', color: 'bg-neo-pink' },
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', flag: '🇹🇷', color: 'bg-neo-orange' },
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬', color: 'bg-neo-yellow' },
  { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', flag: '🇲🇽', color: 'bg-neo-mint' },
  { city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', flag: '🇷🇺', color: 'bg-neo-blue' },
  { city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦', color: 'bg-neo-purple' },
];

const DEFAULT_ACTIVE = ['America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'];

// ─── Analog Clock Component ─────────────────────────────────────────────────
function AnalogClock({ timezone, size = 100 }: { timezone: string; size?: number }) {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return <div style={{ width: size, height: size }} className="rounded-full bg-black/10 dark:bg-white/10" />;

  const localTime = new Date(time.toLocaleString('en-US', { timeZone: timezone }));
  const hours = localTime.getHours() % 12;
  const minutes = localTime.getMinutes();
  const seconds = localTime.getSeconds();

  const hourDeg = (hours / 12) * 360 + (minutes / 60) * 30;
  const minuteDeg = (minutes / 60) * 360 + (seconds / 60) * 6;
  const secondDeg = (seconds / 60) * 360;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;

  return (
    <svg width={size} height={size} className="select-none" aria-label={`Analog clock for ${timezone}`}>
      {/* Clock face */}
      <circle cx={cx} cy={cy} r={r} className="fill-white dark:fill-zinc-900 stroke-black dark:stroke-white" strokeWidth="3" />

      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = ((i / 12) * 360 * Math.PI) / 180;
        const innerR = r - 8;
        const outerR = r - 2;
        return (
          <line
            key={i}
            x1={cx + innerR * Math.sin(angle)}
            y1={cy - innerR * Math.cos(angle)}
            x2={cx + outerR * Math.sin(angle)}
            y2={cy - outerR * Math.cos(angle)}
            className="stroke-black dark:stroke-white"
            strokeWidth={i % 3 === 0 ? 3 : 1.5}
          />
        );
      })}

      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r * 0.55) * Math.sin((hourDeg * Math.PI) / 180)}
        y2={cy - (r * 0.55) * Math.cos((hourDeg * Math.PI) / 180)}
        className="stroke-black dark:stroke-white"
        strokeWidth="4"
        strokeLinecap="square"
      />

      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r * 0.78) * Math.sin((minuteDeg * Math.PI) / 180)}
        y2={cy - (r * 0.78) * Math.cos((minuteDeg * Math.PI) / 180)}
        className="stroke-black dark:stroke-white"
        strokeWidth="3"
        strokeLinecap="square"
      />

      {/* Second hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + (r * 0.88) * Math.sin((secondDeg * Math.PI) / 180)}
        y2={cy - (r * 0.88) * Math.cos((secondDeg * Math.PI) / 180)}
        stroke="#facc15"
        strokeWidth="1.5"
        strokeLinecap="butt"
      />

      {/* Center dot */}
      <circle cx={cx} cy={cy} r="4" fill="#facc15" className="stroke-black dark:stroke-white" strokeWidth="1" />
    </svg>
  );
}

// ─── Digital Clock ──────────────────────────────────────────────────────────
function DigitalTime({ timezone }: { timezone: string }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [isDay, setIsDay] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    const update = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const dateStr = now.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const hour = parseInt(now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
      }));
      setTime(timeStr);
      setDate(dateStr);
      setIsDay(hour >= 6 && hour < 20);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  if (!mounted) {
    return (
      <div className="text-center invisible">
        <div className="text-3xl font-black font-mono">00:00:00</div>
        <div className="text-xs font-bold mt-1">Date</div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-black dark:text-white leading-none">
        {time}
      </div>
      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-1">
        {date}
      </div>
      <div className="mt-1">
        <span className={`text-[10px] px-1.5 py-0.5 font-black border border-black dark:border-white ${isDay ? 'bg-neo-yellow text-black' : 'bg-zinc-800 text-zinc-300'}`}>
          {isDay ? '☀ DAY' : '🌙 NIGHT'}
        </span>
      </div>
    </div>
  );
}

// ─── Clock Card ─────────────────────────────────────────────────────────────
function ClockCard({
  city,
  country,
  timezone,
  flag,
  color,
  onRemove,
}: {
  city: string;
  country: string;
  timezone: string;
  flag: string;
  color: string;
  onRemove: () => void;
}) {
  const [offset, setOffset] = useState('');

  useEffect(() => {
    const now = new Date();
    const localStr = now.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, hour12: false });
    const remoteStr = now.toLocaleString('en-US', { timeZone: timezone, hour12: false });
    const localDate = new Date(localStr);
    const remoteDate = new Date(remoteStr);
    const diffMin = Math.round((remoteDate.getTime() - localDate.getTime()) / 60000);
    if (diffMin === 0) {
      // eslint-disable-next-line
      setOffset('Local time');
    } else {
      const sign = diffMin > 0 ? '+' : '';
      const h = Math.floor(Math.abs(diffMin) / 60);
      const m = Math.abs(diffMin) % 60;
      // eslint-disable-next-line
      setOffset(`${sign}${diffMin < 0 ? '-' : ''}${h}h${m > 0 ? ` ${m}m` : ''}`);
    }
  }, [timezone]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -10 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      className="relative neo-card bg-white dark:bg-zinc-900 p-5 flex flex-col items-center gap-4 group"
    >
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute -top-3 -right-3 w-7 h-7 bg-neo-pink text-black border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400 cursor-pointer z-10"
        aria-label={`Remove ${city}`}
      >
        <X className="w-4 h-4" />
      </button>

      {/* City header */}
      <div className={`w-full ${color} border-2 border-black px-3 py-2 text-black text-center shadow-brutal-sm`}>
        <p className="text-lg font-black leading-none">{flag} {city}</p>
        <p className="text-xs font-bold opacity-70">{country}</p>
      </div>

      {/* Analog Clock */}
      <AnalogClock timezone={timezone} size={110} />

      {/* Digital time */}
      <DigitalTime timezone={timezone} />

      {/* Offset badge */}
      <span className="text-[10px] font-black bg-black text-white dark:bg-white dark:text-black px-2 py-0.5">
        {offset}
      </span>
    </motion.div>
  );
}

// ─── Timezone Difference Calculator ────────────────────────────────────────
function TimezoneConverter() {
  const [cityA, setCityA] = useState(WORLD_CITIES[0]);
  const [cityB, setCityB] = useState(WORLD_CITIES[7]);
  const [inputTime, setInputTime] = useState('12:00');
  const [result, setResult] = useState<string>('');

  const convert = () => {
    try {
      const [h, m] = inputTime.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);

      // Get UTC representation
      const utcMs = date.getTime() - date.getTimezoneOffset() * 60000;

      // Target city time
      const targetStr = new Date(utcMs).toLocaleTimeString('en-US', {
        timeZone: cityB.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const srcStr = new Date(utcMs).toLocaleTimeString('en-US', {
        timeZone: cityA.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // Get date labels for possible day difference
      const srcDate = new Date(utcMs).toLocaleDateString('en-US', { timeZone: cityA.timezone, weekday: 'short' });
      const tgtDate = new Date(utcMs).toLocaleDateString('en-US', { timeZone: cityB.timezone, weekday: 'short' });
      const dayNote = srcDate !== tgtDate ? ` (${tgtDate})` : '';

      setResult(`${srcStr} in ${cityA.city} = ${targetStr}${dayNote} in ${cityB.city}`);
    } catch (e) {
      setResult('Conversion error. Please check your inputs.');
    }
  };

  return (
    <div className="neo-card-lg bg-neo-purple p-6 flex flex-col gap-5">
      <h2 className="text-2xl font-black font-heading text-black border-b-4 border-black pb-2">
        ⏱ TIMEZONE CONVERTER
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* From city */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-black uppercase">FROM CITY</label>
          <select
            value={cityA.timezone}
            onChange={(e) => {
              const found = WORLD_CITIES.find(c => c.timezone === e.target.value);
              if (found) setCityA(found);
            }}
            className="neo-input text-black bg-white dark:bg-white"
          >
            {WORLD_CITIES.map(c => (
              <option key={c.timezone} value={c.timezone}>{c.flag} {c.city}</option>
            ))}
          </select>
        </div>

        {/* Time input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-black uppercase">TIME (24H)</label>
          <input
            type="time"
            value={inputTime}
            onChange={(e) => setInputTime(e.target.value)}
            className="neo-input text-black bg-white font-black text-lg tracking-wider"
          />
        </div>

        {/* To city */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black text-black uppercase">TO CITY</label>
          <select
            value={cityB.timezone}
            onChange={(e) => {
              const found = WORLD_CITIES.find(c => c.timezone === e.target.value);
              if (found) setCityB(found);
            }}
            className="neo-input text-black bg-white dark:bg-white"
          >
            {WORLD_CITIES.map(c => (
              <option key={c.timezone} value={c.timezone}>{c.flag} {c.city}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={convert} className="neo-btn bg-neo-yellow w-full md:w-auto md:self-start">
        CONVERT TIME ⇄
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border-4 border-black bg-white p-4 font-black text-black text-base md:text-lg shadow-brutal"
          >
            🕐 {result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Time Page ──────────────────────────────────────────────────────────
export default function TimePage() {
  const [activeTimezones, setActiveTimezones] = useState<string[]>(DEFAULT_ACTIVE);
  const [showPicker, setShowPicker] = useState(false);
  const [filter, setFilter] = useState('');

  const activeCities = WORLD_CITIES.filter(c => activeTimezones.includes(c.timezone));
  const availableCities = WORLD_CITIES.filter(
    c =>
      !activeTimezones.includes(c.timezone) &&
      (c.city.toLowerCase().includes(filter.toLowerCase()) ||
        c.country.toLowerCase().includes(filter.toLowerCase()))
  );

  const addCity = (tz: string) => {
    setActiveTimezones(prev => [...prev, tz]);
    setShowPicker(false);
    setFilter('');
  };

  const removeCity = (tz: string) => {
    setActiveTimezones(prev => prev.filter(t => t !== tz));
  };

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-zinc-950 pb-24 md:pb-8">
      {/* Page Header */}
      <header className="bg-neo-purple border-b-4 border-black p-4 md:p-6 flex items-center gap-4">
        <Link
          href="/"
          className="neo-btn bg-black text-neo-yellow"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">BACK</span>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-heading text-black tracking-tight flex items-center gap-2">
            <Clock className="w-8 h-8" /> WORLD CLOCK
          </h1>
          <p className="text-sm font-bold text-black/60">Live times across the globe</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
        {/* Timezone Converter */}
        <TimezoneConverter />

        {/* Clocks Grid Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-black font-heading text-black dark:text-white">
            LIVE WORLD CLOCKS
          </h2>
          <button
            onClick={() => setShowPicker(true)}
            className="neo-btn bg-neo-mint"
            disabled={activeTimezones.length >= WORLD_CITIES.length}
          >
            <Plus className="w-5 h-5" />
            ADD CITY
          </button>
        </div>

        {/* Clock Cards */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {activeCities.map((city) => (
              <ClockCard
                key={city.timezone}
                {...city}
                onRemove={() => removeCity(city.timezone)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* City Picker Modal */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
              onClick={() => setShowPicker(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-brutal-lg"
              >
                <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white bg-neo-cyan">
                  <h3 className="font-black text-xl text-black">ADD A CITY</h3>
                  <button onClick={() => setShowPicker(false)} className="neo-btn bg-black text-neo-cyan py-1 px-2">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Filter cities..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    autoFocus
                    className="w-full neo-input text-black dark:text-white"
                  />
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {availableCities.length === 0 ? (
                      <p className="text-center py-4 font-bold text-zinc-500">All cities added!</p>
                    ) : (
                      availableCities.map((city) => (
                        <button
                          key={city.timezone}
                          onClick={() => addCity(city.timezone)}
                          className={`w-full ${city.color} border-2 border-black text-black font-bold p-2 text-left flex items-center gap-2 shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer`}
                        >
                          <span>{city.flag}</span>
                          <span>{city.city}, {city.country}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
