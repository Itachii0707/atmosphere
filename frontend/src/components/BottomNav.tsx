'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Map, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'HOME' },
  { href: '/time', icon: Clock, label: 'TIME' },
  { href: '/map', icon: Map, label: 'MAP' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-zinc-900 border-t-4 border-black dark:border-white flex items-stretch shadow-[0_-4px_0px_0px_#000000] dark:shadow-[0_-4px_0px_0px_#ffffff]"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-black transition-colors relative ${
              isActive
                ? 'bg-neo-yellow text-black'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-0 right-0 h-1 bg-black dark:bg-white" />
            )}
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
