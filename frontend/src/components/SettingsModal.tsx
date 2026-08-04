import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, Info } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey, getStoredOwmApiKey, setStoredOwmApiKey, clearStoredOwmApiKey } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyChange: () => void;
}

export default function SettingsModal({ isOpen, onClose, onKeyChange }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [owmApiKey, setOwmApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showOwmKey, setShowOwmKey] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line
      setApiKey(getStoredApiKey() || '');
      // eslint-disable-next-line
      setOwmApiKey(getStoredOwmApiKey() || '');
      // eslint-disable-next-line
      setSavedMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (trimmed) {
      setStoredApiKey(trimmed);
    } else {
      clearStoredApiKey();
    }
    
    const trimmedOwm = owmApiKey.trim();
    if (trimmedOwm) {
      setStoredOwmApiKey(trimmedOwm);
    } else {
      clearStoredOwmApiKey();
    }
    
    setSavedMessage('Settings saved successfully! 🎉');
    onKeyChange();
    setTimeout(() => {
      setSavedMessage('');
    }, 3000);
  };

  const handleClear = () => {
    clearStoredApiKey();
    clearStoredOwmApiKey();
    setApiKey('');
    setOwmApiKey('');
    onKeyChange();
    setSavedMessage('Keys cleared. 🗑️');
    setTimeout(() => {
      setSavedMessage('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-amber-50 dark:bg-zinc-900 border-4 border-black dark:border-white p-6 shadow-brutal-lg dark:shadow-brutal-lg-dark animate-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-neo-pink text-black border-2 border-black font-bold flex items-center justify-center shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          aria-label="Close settings"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-6 border-b-4 border-black dark:border-white pb-3">
          <Key className="w-6 h-6 text-black dark:text-white" />
          <h2 className="text-2xl font-black font-heading text-black dark:text-white">API SETTINGS</h2>
        </div>

        {/* Info */}
        <div className="bg-neo-blue/20 dark:bg-neo-blue/10 border-2 border-black dark:border-white p-3 mb-6 flex gap-3 text-sm text-black dark:text-zinc-200">
          <Info className="w-5 h-5 flex-shrink-0 text-neo-blue" />
          <div>
            <p className="font-bold">Pure Client-Side Security:</p>
            <p>Your API key is stored locally in your browser&apos;s <code className="bg-white dark:bg-zinc-800 px-1 border border-black dark:border-zinc-700">localStorage</code>. It is sent only to WeatherAPI.com and never shared or logged.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-black text-sm tracking-wide text-black dark:text-white">
              WEATHERAPI.COM KEY (FORECASTS)
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste WeatherAPI key..."
                className="w-full neo-input pr-12 text-black dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-black dark:text-white hover:scale-110 transition-transform"
                title={showKey ? "Hide API Key" : "Show API Key"}
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Get a free one at{' '}
              <a 
                href="https://www.weatherapi.com" 
                target="_blank" 
                rel="noreferrer" 
                className="underline font-bold text-neo-blue dark:text-neo-cyan"
              >
                weatherapi.com
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-black text-sm tracking-wide text-black dark:text-white">
              OPENWEATHERMAP KEY (MAP TILES)
            </label>
            <div className="relative flex items-center">
              <input
                type={showOwmKey ? 'text' : 'password'}
                value={owmApiKey}
                onChange={(e) => setOwmApiKey(e.target.value)}
                placeholder="Paste OpenWeatherMap key..."
                className="w-full neo-input pr-12 text-black dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowOwmKey(!showOwmKey)}
                className="absolute right-3 text-black dark:text-white hover:scale-110 transition-transform"
                title={showOwmKey ? "Hide API Key" : "Show API Key"}
              >
                {showOwmKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Used for /map tiles. Default key used if left blank.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 neo-btn"
            >
              SAVE KEY
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="neo-btn bg-neo-pink text-black"
              >
                CLEAR
              </button>
            )}
          </div>
        </form>

        {/* Saved Status Notification */}
        {savedMessage && (
          <div className="mt-4 border-2 border-black dark:border-white bg-neo-mint/30 dark:bg-neo-mint/20 text-black dark:text-white p-3 font-bold text-sm text-center">
            {savedMessage}
          </div>
        )}
      </div>
    </div>
  );
}
