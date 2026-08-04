'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, MapPin, Sun, Moon, Settings, Star, RefreshCw, Trash2, 
  Wind, Droplets, Eye, Compass, Sunset, AlertTriangle, ShieldCheck, Thermometer,
  Gauge, Cloud, Snowflake, CloudRain, SunMedium, Clock, Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getStoredApiKey, getStoredUnit, setStoredUnit, getStoredTheme, setStoredTheme,
  getStoredRecents, addStoredRecent, removeStoredRecent, getStoredBookmarks, toggleStoredBookmark 
} from '../utils/storage';
import SettingsModal from '../components/SettingsModal';
import Skeleton from '../components/Skeleton';
import WeatherChart from '../components/WeatherChart';
import SplashScreen from '../components/SplashScreen';
import PackingSuggestions from '../components/PackingSuggestions';
import DriveSafeAdvisory from '../components/DriveSafeAdvisory';
import MoonPhaseWidget from '../components/MoonPhaseWidget';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import BottomNav from '../components/BottomNav';

// TypeScript Interfaces for weather response
interface LocationData {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  localtime: string;
  localtime_epoch: number;
}

interface AirQualityData {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  us_epa_index: number;
  label: string;
  desc: string;
  color: string;
}

interface AstroData {
  sunrise: string;
  sunset: string;
}

interface CurrentData {
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  condition_text: string;
  condition_icon: string;
  condition_code: number;
  is_day: number;
  humidity: number;
  wind_kph: number;
  wind_degree: number;
  wind_dir: string;
  visibility_km: number;
  pressure_mb: number;
  uv: number;
  air_quality: AirQualityData;
  astro: AstroData;
}

interface HourlyForecast {
  time: string;
  time_epoch: number;
  temp_c: number;
  temp_f: number;
  condition_text: string;
  condition_icon: string;
  is_day: number;
  chance_of_rain: number;
  chance_of_snow: number;
}

interface DailyForecast {
  date: string;
  date_epoch: number;
  temp_max_c: number;
  temp_max_f: number;
  temp_min_c: number;
  temp_min_f: number;
  avg_temp_c: number;
  avg_temp_f: number;
  condition_text: string;
  condition_icon: string;
  uv: number;
  max_wind_kph: number;
  avg_humidity: number;
  chance_of_rain: number;
  sunrise: string;
  sunset: string;
}

interface WeatherPayload {
  location: LocationData;
  current: CurrentData;
  hourly: HourlyForecast[];
  forecast: DailyForecast[];
}

export default function Home() {
  // App states
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Preference states
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [recents, setRecents] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [customKeySet, setCustomKeySet] = useState(false);
  
  // Modals & triggers
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [splashDone, setSplashDone] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Sync settings and parameters on mount
  useEffect(() => {
    setUnit(getStoredUnit());
    setRecents(getStoredRecents());
    setBookmarks(getStoredBookmarks());
    setCustomKeySet(!!getStoredApiKey());

    // Theme initialization
    const storedTheme = getStoredTheme();
    const isDark = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Keyboard shortcuts listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (isInput && e.key !== 'Escape') return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'g':
        case 'G':
          if (!isInput) {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (p) => fetchWeather(`${p.coords.latitude},${p.coords.longitude}`),
                (err) => setErrorMsg('Geolocation failed: ' + err.message)
              );
            }
          }
          break;
        case 't':
        case 'T':
          if (!isInput) toggleTheme();
          break;
        case 'u':
        case 'U':
          if (!isInput) toggleUnit();
          break;
        case 'r':
        case 'R':
          if (!isInput && weatherData) fetchWeather(weatherData.location.name);
          break;
        case 'k':
        case 'K':
          if (!isInput) setIsSettingsOpen(true);
          break;
        case 'b':
        case 'B':
          if (!isInput) toggleBookmark();
          break;
        case '?':
          setShowShortcuts(prev => !prev);
          break;
        case 'Escape':
          setShowShortcuts(false);
          setIsSettingsOpen(false);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, theme, unit]);

  // Theme toggle helper
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Temp unit toggle helper
  const toggleUnit = () => {
    const nextUnit = unit === 'C' ? 'F' : 'C';
    setUnit(nextUnit);
    setStoredUnit(nextUnit);
  };

  // 2. Fetch weather payload
  const fetchWeather = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const clientKey = getStoredApiKey() || '';
      // We call our FastAPI backend server.
      // Uses NEXT_PUBLIC_API_URL env var for production, falls back to localhost for dev.
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      let url = `${API_BASE}/api/weather?q=${encodeURIComponent(query)}`;
      if (clientKey) {
        url += `&key=${encodeURIComponent(clientKey)}`;
      }


      let response;
      try {
        response = await fetch(url);
      } catch (networkError) {
        // If the FastAPI server is completely offline/down, we can fallback to calling WeatherAPI directly from browser!
        console.warn("FastAPI backend seems offline. Attempting client-side direct API fallback...");
        if (clientKey) {
          const directUrl = `https://api.weatherapi.com/v1/forecast.json?key=${encodeURIComponent(clientKey)}&q=${encodeURIComponent(query)}&days=3&aqi=yes`;
          const directRes = await fetch(directUrl);
          if (!directRes.ok) {
            const errData = await directRes.json();
            throw new Error(errData.error?.message || "Direct API call failed.");
          }
          const rawData = await directRes.json();
          // Normalize payload in client side
          const normalized = clientSideNormalize(rawData);
          setWeatherData(normalized);
          addRecentSearch(normalized.location.name);
          setLastUpdated(new Date().toLocaleTimeString());
          setIsLoading(false);
          return;
        } else {
          throw new Error("Cannot connect to backend server, and no local API Key is set in Settings.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch weather data.");
      }

      const data: WeatherPayload = await response.json();
      setWeatherData(data);
      addRecentSearch(data.location.name);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to append searches
  const addRecentSearch = (name: string) => {
    const updated = addStoredRecent(name);
    setRecents(updated);
  };

  // Helper to remove individual searches
  const removeRecent = (city: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeStoredRecent(city);
    setRecents(updated);
  };

  // Bookmark toggler
  const toggleBookmark = () => {
    if (!weatherData) return;
    const name = weatherData.location.name;
    const { updated } = toggleStoredBookmark(name);
    setBookmarks(updated);
  };

  // Load default/current location weather on mount
  useEffect(() => {
    const loadDefaultWeather = async () => {
      // 1. Try last search in recents
      const storedRecents = getStoredRecents();
      if (storedRecents.length > 0) {
        fetchWeather(storedRecents[0]);
        return;
      }

      // 2. Try geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latLon = `${position.coords.latitude},${position.coords.longitude}`;
            fetchWeather(latLon);
          },
          (geoErr) => {
            console.warn("Geolocation permission denied or failed:", geoErr.message);
            // 3. Fallback to Tokyo as default beautiful demo location
            fetchWeather("Tokyo");
          },
          { timeout: 5000 }
        );
      } else {
        fetchWeather("Tokyo");
      }
    };
    
    // Timeout to ensure local states (customKeySet) loaded
    const t = setTimeout(loadDefaultWeather, 200);
    return () => clearTimeout(t);
  }, [fetchWeather]);

  // Handle Search Input Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery);
    }
  };

  // Trigger search from tags (recents or bookmarks)
  const handleTagClick = (city: string) => {
    setSearchQuery(city);
    fetchWeather(city);
  };

  // Reload current city weather
  const handleRefresh = () => {
    if (weatherData) {
      fetchWeather(weatherData.location.name);
    }
  };

  // Identify active particle overlay based on code
  const getWeatherEffect = (code: number, isDay: number) => {
    if (!isDay) return 'night';
    // Rain codes
    if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246, 1273, 1276].includes(code)) return 'rain';
    // Snow codes
    if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258, 1279, 1282].includes(code)) return 'snow';
    // Cloudy codes
    if ([1003, 1006, 1009, 1030, 1135, 1147].includes(code)) return 'cloudy';
    // Default Clear
    return 'sunny';
  };

  const weatherEffect = weatherData 
    ? getWeatherEffect(weatherData.current.condition_code, weatherData.current.is_day) 
    : 'sunny';

  // Get background gradients based on weather types
  const getBrutalGradient = (effect: string) => {
    switch (effect) {
      case 'rain':
        return 'from-slate-700 to-indigo-900 dark:from-slate-900 dark:to-zinc-950';
      case 'snow':
        return 'from-cyan-100 to-blue-200 dark:from-zinc-900 dark:to-slate-950';
      case 'cloudy':
        return 'from-zinc-200 to-zinc-400 dark:from-zinc-800 dark:to-zinc-950';
      case 'night':
        return 'from-purple-950 to-zinc-950';
      case 'sunny':
      default:
        return 'from-sky-300 to-amber-200 dark:from-zinc-900 dark:to-zinc-950';
    }
  };

  const gradientClasses = getBrutalGradient(weatherEffect);

  return (
    <>
    {/* Animated Splash Screen — shows on first load */}
    <SplashScreen onComplete={() => setSplashDone(true)} />
    <div className={`relative min-h-screen w-full flex flex-col font-sans overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 bg-gradient-to-br ${gradientClasses}`}>
      
      {/* Particle Overlays for Atmosphere visuals */}
      <WeatherParticles effect={weatherEffect} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
        
        {/* HEADER BAR */}
        <header className="neo-card-lg bg-neo-yellow dark:bg-zinc-900 text-black dark:text-white p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-512.png"
              alt="Atmosphere Logo"
              className="w-12 h-12 border-3 border-black dark:border-white shadow-brutal-sm dark:shadow-brutal-sm-dark object-cover"
            />

            <div>
              <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tighter leading-none">
                ATMOSPHERE
              </h1>
              <p className="text-xs font-bold tracking-widest text-zinc-800 dark:text-zinc-300">
                NEUBRUTALIST WEATHER DASHBOARD
              </p>
            </div>
          </div>

          {/* Quick Config Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Geolocation Button */}
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (p) => fetchWeather(`${p.coords.latitude},${p.coords.longitude}`),
                    (e) => setErrorMsg("Geolocation failed: " + e.message)
                  );
                }
              }}
              className="neo-btn bg-neo-cyan"
              title="Detect location"
            >
              <MapPin className="w-5 h-5 text-black" />
              <span className="hidden sm:inline">LOCATE</span>
            </button>

            {/* C/F Unit Toggle */}
            <button 
              onClick={toggleUnit}
              className="neo-btn bg-neo-purple"
              title="Toggle temp unit"
            >
              <Thermometer className="w-5 h-5 text-black" />
              <span className="font-black">°{unit}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="neo-btn bg-neo-pink"
              title="Toggle light/dark theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-black" /> : <Moon className="w-5 h-5 text-black" />}
            </button>

            {/* World Clock Link */}
            <Link href="/time" className="neo-btn bg-neo-cyan hidden sm:flex" title="World Clock (Time Page)">
              <Clock className="w-5 h-5 text-black" />
              <span className="hidden md:inline">TIME</span>
            </Link>

            {/* Keyboard Shortcuts hint */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="neo-btn bg-zinc-100 dark:bg-zinc-700"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="w-5 h-5 text-black dark:text-white" />
            </button>

            {/* Settings Modal Toggle */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`neo-btn bg-white dark:bg-zinc-800 ${customKeySet ? 'border-neo-mint border-3 animate-pulse' : ''}`}
              title="Open settings (K)"
            >
              <Settings className="w-5 h-5 text-black dark:text-white" />
            </button>
          </div>
        </header>

        {/* SEARCH BAR PANEL */}
        <section className="neo-card bg-white dark:bg-zinc-900 p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, airport code, or lat,lon... (press / to focus)"
                className="w-full neo-input pl-10 text-black dark:text-white"
              />
            </div>
            <button type="submit" className="neo-btn bg-neo-mint sm:px-8">
              SEARCH WEATHER
            </button>
          </form>
          <p className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-widest">
            Press <kbd className="px-1 bg-black text-white text-[10px]">?</kbd> for keyboard shortcuts
          </p>
        </section>

        {/* ERROR MESSAGE PANEL */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="neo-card bg-neo-pink text-black p-4 flex items-center justify-between font-bold"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button 
                onClick={() => setErrorMsg(null)} 
                className="border border-black px-2 py-0.5 text-xs hover:bg-white transition-all cursor-pointer"
              >
                DISMISS
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN WEATHER BOARD */}
        <main className="w-full">
          {isLoading ? (
            <Skeleton />
          ) : weatherData ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Current Weather Card */}
                <div className="lg:col-span-2 neo-card-lg bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between gap-6 relative overflow-hidden">
                  
                  {/* Weather Info Header */}
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-3xl md:text-4xl font-black font-heading leading-tight uppercase text-black dark:text-white">
                          {weatherData.location.name}
                        </h2>
                        <button
                          onClick={toggleBookmark}
                          className="p-1 hover:scale-125 transition-transform"
                          title={bookmarks.includes(weatherData.location.name) ? "Remove Bookmark" : "Add Bookmark"}
                        >
                          <Star 
                            className={`w-6 h-6 border-black ${
                              bookmarks.includes(weatherData.location.name) 
                                ? 'fill-neo-yellow text-black' 
                                : 'text-zinc-400 dark:text-zinc-500'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                        {weatherData.location.region ? `${weatherData.location.region}, ` : ''}{weatherData.location.country}
                      </p>
                    </div>

                    {/* Animated condition icon */}
                    <div className="border-3 border-black dark:border-white p-2 bg-neo-yellow shadow-brutal-sm dark:shadow-brutal-sm-dark">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https:${weatherData.current.condition_icon}`} 
                        alt={weatherData.current.condition_text} 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  </div>

                  {/* Temperature Info Display */}
                  <div className="flex items-baseline gap-4 z-10">
                    <span className="text-7xl md:text-8xl font-black tracking-tighter text-black dark:text-white">
                      {unit === 'C' ? Math.round(weatherData.current.temp_c) : Math.round(weatherData.current.temp_f)}°
                    </span>
                    <span className="text-lg md:text-xl font-black px-2 py-1 bg-neo-purple text-black border-2 border-black uppercase">
                      {weatherData.current.condition_text}
                    </span>
                  </div>

                  {/* Neubrutalist Advice / Weather Notice Warning */}
                  <div className="border-2 border-black dark:border-white bg-neo-mint/20 dark:bg-neo-mint/10 p-3 text-sm font-bold flex gap-2 items-center text-black dark:text-zinc-200">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-neo-orange" />
                    <span>
                      {getWeatherAlertText(
                        weatherData.current.condition_code,
                        weatherData.current.temp_c,
                        weatherData.current.uv,
                        weatherData.current.air_quality.us_epa_index
                      )}
                    </span>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 z-10">
                    {/* Feels Like */}
                    <div className="border-2 border-black dark:border-white p-3 bg-amber-50/50 dark:bg-zinc-800/40">
                      <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase">FEELS LIKE</p>
                      <p className="text-xl font-black text-black dark:text-white">
                        {unit === 'C' ? Math.round(weatherData.current.feelslike_c) : Math.round(weatherData.current.feelslike_f)}°{unit}
                      </p>
                    </div>

                    {/* Humidity */}
                    <div className="border-2 border-black dark:border-white p-3 bg-amber-50/50 dark:bg-zinc-800/40">
                      <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase">HUMIDITY</p>
                      <p className="text-xl font-black text-black dark:text-white flex items-center gap-1">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        {weatherData.current.humidity}%
                      </p>
                    </div>

                    {/* Wind Speed / Direction */}
                    <div className="border-2 border-black dark:border-white p-3 bg-amber-50/50 dark:bg-zinc-800/40">
                      <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase">WIND</p>
                      <p className="text-lg font-black text-black dark:text-white flex items-center gap-1 flex-wrap">
                        <Wind className="w-4 h-4 text-zinc-600" />
                        <span>{weatherData.current.wind_kph} km/h</span>
                        <span className="text-xs px-1 bg-black text-white dark:bg-white dark:text-black font-black font-mono">
                          {weatherData.current.wind_dir}
                        </span>
                      </p>
                    </div>

                    {/* UV Index */}
                    <div className="border-2 border-black dark:border-white p-3 bg-amber-50/50 dark:bg-zinc-800/40">
                      <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase">UV INDEX</p>
                      <p className="text-xl font-black text-black dark:text-white flex items-center gap-1">
                        <SunMedium className="w-4 h-4 text-yellow-500" />
                        {weatherData.current.uv}
                      </p>
                    </div>

                    {/* Pressure */}
                    <div className="border-2 border-black dark:border-white p-3 bg-amber-50/50 dark:bg-zinc-800/40">
                      <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase">PRESSURE</p>
                      <p className="text-xl font-black text-black dark:text-white flex items-center gap-1">
                        <Compass className="w-4 h-4 text-teal-600" />
                        {weatherData.current.pressure_mb} hPa
                      </p>
                    </div>

                    {/* Visibility */}
                    <div className="border-2 border-black dark:border-white p-3 bg-amber-50/50 dark:bg-zinc-800/40">
                      <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase">VISIBILITY</p>
                      <p className="text-xl font-black text-black dark:text-white flex items-center gap-1">
                        <Eye className="w-4 h-4 text-sky-600" />
                        {weatherData.current.visibility_km} km
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Air Quality & Bookmarks Sidebar */}
                <div className="space-y-6">
                  
                  {/* Air Quality Panel */}
                  <div className="neo-card bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
                    <h3 className="text-xl font-black font-heading border-b-2 border-black dark:border-white pb-2 flex items-center gap-2 text-black dark:text-white">
                      <Gauge className="w-5 h-5 text-neo-mint" /> AIR QUALITY
                    </h3>
                    
                    {/* Index Display Box */}
                    <div 
                      className="border-2 border-black p-4 font-black flex flex-col items-center text-center shadow-brutal-sm"
                      style={{ backgroundColor: weatherData.current.air_quality.color, color: '#000000' }}
                    >
                      <span className="text-3xl">{weatherData.current.air_quality.label}</span>
                      <span className="text-xs font-bold tracking-wider mt-1 uppercase opacity-80">
                        EPA INDEX: {weatherData.current.air_quality.us_epa_index} / 6
                      </span>
                    </div>

                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      {weatherData.current.air_quality.desc}
                    </p>

                    {/* Raw Pollutants stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="flex justify-between border-b border-black/10 dark:border-white/10 py-1 text-black dark:text-white">
                        <span>PM2.5:</span>
                        <span>{Math.round(weatherData.current.air_quality.pm2_5 || 0)} μg/m³</span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 dark:border-white/10 py-1 text-black dark:text-white">
                        <span>PM10:</span>
                        <span>{Math.round(weatherData.current.air_quality.pm10 || 0)} μg/m³</span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 dark:border-white/10 py-1 text-black dark:text-white">
                        <span>NO2:</span>
                        <span>{Math.round(weatherData.current.air_quality.no2 || 0)} μg/m³</span>
                      </div>
                      <div className="flex justify-between border-b border-black/10 dark:border-white/10 py-1 text-black dark:text-white">
                        <span>O3:</span>
                        <span>{Math.round(weatherData.current.air_quality.o3 || 0)} μg/m³</span>
                      </div>
                    </div>
                  </div>

                  {/* Bookmarks & Search History Panel */}
                  <div className="neo-card bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
                    <h3 className="text-xl font-black font-heading border-b-2 border-black dark:border-white pb-2 flex items-center gap-2 text-black dark:text-white">
                      <Star className="w-5 h-5 text-neo-yellow" /> BOOKMARKED CITIES
                    </h3>
                    
                    {bookmarks.length === 0 ? (
                      <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 italic text-center py-4">
                        No bookmarked cities. Click the star icon to save!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {bookmarks.map((city, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleTagClick(city)}
                            className="neo-btn bg-neo-yellow px-3 py-1 text-sm text-black"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}

                    <h3 className="text-xl font-black font-heading border-b-2 border-black dark:border-white pb-2 flex items-center gap-2 pt-2 text-black dark:text-white">
                      <RefreshCw className="w-5 h-5 text-neo-purple" /> SEARCH HISTORY
                    </h3>

                    {recents.length === 0 ? (
                      <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 italic text-center py-2">
                        Your search history is empty.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {recents.map((city, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleTagClick(city)}
                            className="flex justify-between items-center border-2 border-black dark:border-white p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group text-black dark:text-white"
                          >
                            <span className="font-bold text-sm">{city}</span>
                            <button
                              onClick={(e) => removeRecent(city, e)}
                              className="text-zinc-400 hover:text-neo-pink transition-colors p-1"
                              title={`Remove ${city} from history`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sunrise & Sunset Astro Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="neo-card bg-neo-orange p-6 text-black flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider opacity-80">SUNRISE TIME</h4>
                    <p className="text-3xl font-black font-heading">{weatherData.current.astro.sunrise}</p>
                  </div>
                  <SunMedium className="w-12 h-12 text-black" />
                </div>

                <div className="neo-card bg-neo-purple p-6 text-black flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider opacity-80">SUNSET TIME</h4>
                    <p className="text-3xl font-black font-heading">{weatherData.current.astro.sunset}</p>
                  </div>
                  <Sunset className="w-12 h-12 text-black" />
                </div>
              </div>

              {/* Hourly Forecast Block */}
              <div className="neo-card bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
                <h3 className="text-xl font-black font-heading border-b-2 border-black dark:border-white pb-2 text-black dark:text-white">
                  HOURLY WEATHER TREND (24 HOURS)
                </h3>
                
                {/* Horizontal Scrolling Lists */}
                <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x">
                  {weatherData.hourly.map((hour, idx) => {
                    const timeString = (() => {
                      try {
                        return new Date(hour.time_epoch * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } catch (e) {
                        return hour.time.split(' ')[1] || hour.time;
                      }
                    })();
                    
                    return (
                      <div 
                        key={idx} 
                        className="min-w-[110px] snap-center border-2 border-black dark:border-white p-3 text-center space-y-2 bg-amber-50/20 dark:bg-zinc-800/20 hover:scale-105 transition-transform text-black dark:text-white"
                      >
                        <p className="text-xs font-black text-zinc-500 dark:text-zinc-400">{timeString}</p>
                        <div className="mx-auto w-10 h-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`https:${hour.condition_icon}`} alt={hour.condition_text} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-lg font-black">
                          {unit === 'C' ? Math.round(hour.temp_c) : Math.round(hour.temp_f)}°
                        </p>
                        <span className="text-[10px] px-1 bg-neo-cyan text-black font-black uppercase">
                          {hour.chance_of_rain}% RAIN
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart.js Interactive Trend Section */}
              <div className="neo-card bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b-2 border-black dark:border-white pb-2 flex-wrap gap-2">
                  <h3 className="text-xl font-black font-heading text-black dark:text-white">
                    TEMPERATURE TREND CHART (12 HOURS)
                  </h3>
                  <span className="text-xs font-bold bg-neo-yellow text-black border border-black px-2 py-0.5">
                    INTERACTIVE CHART.JS
                  </span>
                </div>
                
                <WeatherChart 
                  hourly={weatherData.hourly} 
                  unit={unit} 
                  isDarkMode={theme === 'dark'} 
                />
              </div>

              {/* 7-Day / Multi-Day Forecast Grid */}
              <div className="neo-card bg-white dark:bg-zinc-900 p-6 flex flex-col gap-4">
                <h3 className="text-xl font-black font-heading border-b-2 border-black dark:border-white pb-2 text-black dark:text-white">
                  FORECAST DAYS
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {weatherData.forecast.map((day, idx) => {
                    const weekday = (() => {
                      try {
                        const dateObj = new Date(day.date_epoch * 1000);
                        return dateObj.toLocaleDateString([], { weekday: 'long' });
                      } catch (e) {
                        return day.date;
                      }
                    })();
                    
                    return (
                      <div 
                        key={idx} 
                        className="neo-card p-4 flex flex-col justify-between gap-4 hover:-translate-y-2 hover:shadow-brutal-lg dark:hover:shadow-brutal-lg-dark transition-all text-black dark:text-white bg-amber-50/20 dark:bg-zinc-800/20"
                      >
                        <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-2">
                          <div>
                            <p className="font-black text-lg uppercase leading-none">{weekday}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{day.date}</p>
                          </div>
                          <div className="w-10 h-10 border border-black dark:border-white p-0.5 bg-neo-yellow">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https:${day.condition_icon}`} alt={day.condition_text} className="w-full h-full object-contain" />
                          </div>
                        </div>

                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="text-3xl font-black">
                              {unit === 'C' ? Math.round(day.temp_max_c) : Math.round(day.temp_max_f)}°
                            </span>
                            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-2">
                              / {unit === 'C' ? Math.round(day.temp_min_c) : Math.round(day.temp_min_f)}°{unit}
                            </span>
                          </div>
                          <span className="text-[10px] px-1 bg-neo-purple text-black font-black uppercase">
                            UV {day.uv}
                          </span>
                        </div>

                        <div className="text-xs font-bold space-y-1 pt-2 border-t border-black/10 dark:border-white/10">
                          <p className="uppercase text-zinc-600 dark:text-zinc-400 leading-tight">
                            {day.condition_text}
                          </p>
                          <p className="text-blue-500">
                            🌧️ {day.chance_of_rain}% Chance of Rain
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ━━━ NEW ADVANCED WIDGETS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Smart Packing Suggestions */}
                <PackingSuggestions
                  tempC={weatherData.current.temp_c}
                  conditionCode={weatherData.current.condition_code}
                  windKph={weatherData.current.wind_kph}
                  humidity={weatherData.current.humidity}
                  uv={weatherData.current.uv}
                  isDay={weatherData.current.is_day}
                />

                {/* Drive Safe Advisory */}
                <DriveSafeAdvisory
                  windKph={weatherData.current.wind_kph}
                  conditionCode={weatherData.current.condition_code}
                  visibilityKm={weatherData.current.visibility_km}
                  tempC={weatherData.current.temp_c}
                />
              </div>

              {/* Moon Phase Widget */}
              <MoonPhaseWidget />

              {/* Refresh Info and Last Updated */}
              <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-800 dark:text-zinc-300 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 p-3 shadow-brutal-sm dark:shadow-brutal-sm-dark">
                <span>LAST SYNCED: {lastUpdated || 'JUST NOW'}</span>
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 hover:text-neo-blue transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> REFRESH WEATHER
                </button>
              </div>

            </div>
          ) : (
            <div className="neo-card bg-white dark:bg-zinc-900 p-8 text-center text-black dark:text-white space-y-4">
              <p className="text-lg font-bold">No weather data found.</p>
              <p className="text-sm">Please search a valid city or add an API key in the settings panel.</p>
            </div>
          )}
        </main>
      </div>

      {/* API Configuration Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onKeyChange={() => setCustomKeySet(!!getStoredApiKey())} 
      />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
    </>
  );
}

// Particle elements component
function WeatherParticles({ effect }: { effect: string }) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particle layouts
    const items = [];
    if (effect === 'rain') {
      for (let i = 0; i < 40; i++) {
        items.push({
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * -100}px`,
          delay: `${Math.random() * 2}s`,
          duration: `${0.8 + Math.random() * 0.6}s`,
        });
      }
    } else if (effect === 'snow') {
      for (let i = 0; i < 25; i++) {
        items.push({
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * -20}px`,
          delay: `${Math.random() * 4}s`,
          duration: `${2 + Math.random() * 2}s`,
          size: `${2 + Math.random() * 5}px`,
        });
      }
    } else if (effect === 'cloudy') {
      for (let i = 0; i < 4; i++) {
        items.push({
          left: `${Math.random() * -100}px`,
          top: `${10 + Math.random() * 150}px`,
          delay: `${Math.random() * 5}s`,
          duration: `${15 + Math.random() * 25}s`,
          size: `${120 + Math.random() * 150}px`,
        });
      }
    }
    setParticles(items);
  }, [effect]);

  if (effect === 'sunny' || effect === 'night') return null;

  return (
    <div className="weather-particles">
      {particles.map((p, idx) => {
        if (effect === 'rain') {
          return (
            <div 
              key={idx}
              className="rain-particle"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          );
        } else if (effect === 'snow') {
          return (
            <div 
              key={idx}
              className="snow-particle"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: p.size,
                height: p.size,
              }}
            />
          );
        } else if (effect === 'cloudy') {
          return (
            <div 
              key={idx}
              className="cloud-particle"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
                width: p.size,
                height: p.size,
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

// Custom user alerts builder
function getWeatherAlertText(code: number, tempC: number, uv: number, epaAqi: number): string {
  if (tempC > 35) return "⚠️ HIGH TEMPERATURE ALERT: Stay hydrated and avoid direct sunlight!";
  if (tempC < 5) return "🥶 COLD TEMPERATURE WARNING: Wrap up warm in layers!";
  
  // Rain
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
    return "☔ PRECIPITATION NOTICE: Rain is active or expected. Take an umbrella!";
  }
  // Snow
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)) {
    return "❄️ SNOW ADVISORY: Snowfall is active. Slippery roads and sidewalks!";
  }
  
  if (uv >= 8) return "☀️ EXTREME UV WARNING: Wear sunglasses, sunscreen SPF 30+, and a hat!";
  if (epaAqi >= 3) return "😷 POOR AIR QUALITY: Consider wearing a face mask or avoiding prolonged outdoor activities.";
  
  return "✨ ATMOSPHERE SYNCED: Have a wonderful day!";
}

// Client Side Fallback Normalization (matching FastAPI response structure)
function clientSideNormalize(data: any): WeatherPayload {
  const location = data.location || {};
  const current = data.current || {};
  const forecast = data.forecast?.forecastday || [];
  
  const aqi_data = current.air_quality || {};
  const epa_index = aqi_data["us-epa-index"] || 0;
  
  // EPA Label calculations
  const mapping: { [key: number]: [string, string, string] } = {
    1: ["Good", "Satisfactory air quality.", "#86efac"],
    2: ["Moderate", "Acceptable air quality.", "#fef08a"],
    3: ["Sensitive", "Health effects for sensitive groups.", "#fed7aa"],
    4: ["Unhealthy", "Everyone may experience effects.", "#fca5a5"],
    5: ["Very Unhealthy", "Health alert warnings.", "#d8b4fe"],
    6: ["Hazardous", "Emergency health conditions.", "#fda4af"]
  };
  const [aqi_label, aqi_desc, aqi_color] = mapping[epa_index] || ["Unknown", "No air quality data.", "#e5e7eb"];
  
  const local_epoch = location.localtime_epoch || 0;
  const hourly_pool: any[] = [];
  forecast.forEach((day: any) => {
    hourly_pool.push(...(day.hour || []));
  });

  const upcoming_hours = hourly_pool
    .filter((hr: any) => hr.time_epoch >= (local_epoch - 3600))
    .slice(0, 24)
    .map((hr: any) => ({
      time: hr.time,
      time_epoch: hr.time_epoch,
      temp_c: hr.temp_c,
      temp_f: hr.temp_f,
      condition_text: hr.condition?.text,
      condition_icon: hr.condition?.icon,
      is_day: hr.is_day,
      chance_of_rain: hr.chance_of_rain || 0,
      chance_of_snow: hr.chance_of_snow || 0
    }));

  const daily_forecast = forecast.map((day: any) => ({
    date: day.date,
    date_epoch: day.date_epoch,
    temp_max_c: day.day?.maxtemp_c,
    temp_max_f: day.day?.maxtemp_f,
    temp_min_c: day.day?.mintemp_c,
    temp_min_f: day.day?.mintemp_f,
    avg_temp_c: day.day?.avgtemp_c,
    avg_temp_f: day.day?.avgtemp_f,
    condition_text: day.day?.condition?.text,
    condition_icon: day.day?.condition?.icon,
    uv: day.day?.uv,
    max_wind_kph: day.day?.maxwind_kph,
    avg_humidity: day.day?.avghumidity,
    chance_of_rain: day.day?.daily_chance_of_rain || 0,
    sunrise: day.astro?.sunrise,
    sunset: day.astro?.sunset
  }));

  return {
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      timezone: location.tz_id,
      localtime: location.localtime,
      localtime_epoch: local_epoch
    },
    current: {
      temp_c: current.temp_c,
      temp_f: current.temp_f,
      feelslike_c: current.feelslike_c,
      feelslike_f: current.feelslike_f,
      condition_text: current.condition?.text,
      condition_icon: current.condition?.icon,
      condition_code: current.condition?.code,
      is_day: current.is_day,
      humidity: current.humidity,
      wind_kph: current.wind_kph,
      wind_degree: current.wind_degree,
      wind_dir: current.wind_dir,
      visibility_km: current.vis_km,
      pressure_mb: current.pressure_mb,
      uv: current.uv,
      air_quality: {
        co: aqi_data.co,
        no2: aqi_data.no2,
        o3: aqi_data.o3,
        so2: aqi_data.so2,
        pm2_5: aqi_data.pm2_5,
        pm10: aqi_data.pm10,
        us_epa_index: epa_index,
        label: aqi_label,
        desc: aqi_desc,
        color: aqi_color
      },
      astro: {
        sunrise: forecast[0]?.astro?.sunrise || "N/A",
        sunset: forecast[0]?.astro?.sunset || "N/A"
      }
    },
    hourly: upcoming_hours,
    forecast: daily_forecast
  };
}
