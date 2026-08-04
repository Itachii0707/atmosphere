'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const DynamicWeatherMap = dynamic(
  () => import('../../components/WeatherMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-neo-blue border-4 border-black shadow-brutal-lg">
        <div className="flex flex-col items-center gap-4 p-8 bg-neo-yellow border-4 border-black shadow-brutal-sm animate-pulse">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="font-black font-heading text-xl">LOADING MAP ENGINE...</p>
        </div>
      </div>
    )
  }
);

export default function MapPage() {
  return (
    <main className="min-h-screen bg-neo-cyan dark:bg-zinc-800 p-4 md:p-8 pt-6 pb-24 md:pb-8 flex flex-col transition-colors duration-500">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col gap-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-neo-yellow border-4 border-black shadow-brutal-sm flex items-center justify-center -rotate-6">
              <span className="font-black text-2xl font-heading text-black">M</span>
            </div>
            <div>
              <h1 className="text-3xl font-black font-heading tracking-tight text-black dark:text-white uppercase">Interactive Map</h1>
              <p className="text-sm font-bold text-black/70 dark:text-white/70">Weather radar and temperature heatmaps</p>
            </div>
          </div>
        </header>

        {/* Map Container */}
        <div className="flex-1 w-full relative min-h-[500px]">
          <DynamicWeatherMap />
        </div>

      </div>
    </main>
  );
}
