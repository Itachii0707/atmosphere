import React from 'react';

export default function Skeleton() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Search & Header Row Mockup */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="h-12 w-48 bg-zinc-300 dark:bg-zinc-700 border-2 border-black dark:border-white shadow-brutal-sm"></div>
        <div className="h-10 w-32 bg-zinc-300 dark:bg-zinc-700 border-2 border-black dark:border-white shadow-brutal-sm"></div>
      </div>

      {/* Main Board Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Card (current weather) */}
        <div className="lg:col-span-2 border-4 border-black dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-brutal dark:shadow-brutal-dark space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-zinc-300 dark:bg-zinc-700"></div>
              <div className="h-4 w-32 bg-zinc-300 dark:bg-zinc-700"></div>
            </div>
            <div className="h-16 w-16 bg-zinc-300 dark:bg-zinc-700 border-2 border-black dark:border-white"></div>
          </div>
          
          <div className="flex items-baseline gap-4">
            <div className="h-20 w-36 bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="h-6 w-24 bg-zinc-300 dark:bg-zinc-700"></div>
          </div>

          <div className="h-16 bg-zinc-200 dark:bg-zinc-800 border-2 border-black dark:border-white"></div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-2 border-black dark:border-white p-3 space-y-2 bg-zinc-50 dark:bg-zinc-900">
                <div className="h-3 w-16 bg-zinc-300 dark:bg-zinc-700"></div>
                <div className="h-5 w-20 bg-zinc-300 dark:bg-zinc-700"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cards (AQI & Bookmarks/Recents) */}
        <div className="space-y-6">
          {/* AQI Panel */}
          <div className="border-4 border-black dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-brutal dark:shadow-brutal-dark space-y-4">
            <div className="h-6 w-32 bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="h-16 bg-zinc-200 dark:bg-zinc-800 border-2 border-black dark:border-white"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-700"></div>
              <div className="h-4 w-3/4 bg-zinc-300 dark:bg-zinc-700"></div>
            </div>
          </div>

          {/* Bookmarks Panel */}
          <div className="border-4 border-black dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-brutal dark:shadow-brutal-dark space-y-4">
            <div className="h-6 w-40 bg-zinc-300 dark:bg-zinc-700"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-zinc-300 dark:bg-zinc-700 border-2 border-black dark:border-white"></div>
              <div className="h-8 w-24 bg-zinc-300 dark:bg-zinc-700 border-2 border-black dark:border-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Section Mockup */}
      <div className="border-4 border-black dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-brutal dark:shadow-brutal-dark space-y-4">
        <div className="h-6 w-48 bg-zinc-300 dark:bg-zinc-700"></div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[100px] border-2 border-black dark:border-white p-3 text-center space-y-2 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0">
              <div className="h-3 w-12 bg-zinc-300 dark:bg-zinc-700 mx-auto"></div>
              <div className="h-8 w-8 bg-zinc-300 dark:bg-zinc-700 mx-auto rounded-full"></div>
              <div className="h-5 w-10 bg-zinc-300 dark:bg-zinc-700 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section Mockup */}
      <div className="border-4 border-black dark:border-white bg-white dark:bg-zinc-950 p-6 shadow-brutal dark:shadow-brutal-dark space-y-4">
        <div className="h-6 w-60 bg-zinc-300 dark:bg-zinc-700"></div>
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white"></div>
      </div>
    </div>
  );
}
