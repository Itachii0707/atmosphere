'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

import { Umbrella, Shirt, Glasses, Snowflake, Wind, Droplets, Thermometer, ShieldCheck } from 'lucide-react';


interface PackingProps {
  tempC: number;
  conditionCode: number;
  windKph: number;
  humidity: number;
  uv: number;
  isDay: number;
}

interface PackItem {
  icon: React.ReactNode;
  label: string;
  tip: string;
  color: string;
}

function getPackingList(
  tempC: number,
  conditionCode: number,
  windKph: number,
  humidity: number,
  uv: number,
  isDay: number
): PackItem[] {
  const items: PackItem[] = [];

  // Rain / wet conditions
  const isRainy = [
    1063, 1180, 1183, 1186, 1189, 1192, 1195,
    1240, 1243, 1246, 1273, 1276
  ].includes(conditionCode);
  const isSnowy = [
    1066, 1114, 1117, 1210, 1213, 1216, 1219,
    1222, 1225, 1255, 1258, 1279, 1282
  ].includes(conditionCode);
  const isThunder = [1087, 1273, 1276, 1279, 1282].includes(conditionCode);
  const isFoggy = [1030, 1135, 1147].includes(conditionCode);

  if (isRainy || isThunder) {
    items.push({
      icon: <Umbrella className="w-5 h-5" />,
      label: 'Umbrella',
      tip: 'Rain is expected. Take a waterproof umbrella!',
      color: 'bg-neo-blue',
    });
  }

  if (isSnowy) {
    items.push({
      icon: <Snowflake className="w-5 h-5" />,
      label: 'Winter Gear',
      tip: 'Snow is falling! Wear warm, waterproof layers.',
      color: 'bg-neo-cyan',
    });
  }

  if (tempC > 30 || uv >= 6) {
    items.push({
      icon: <Glasses className="w-5 h-5" />,

      label: 'Sunglasses',
      tip: `UV index is ${uv}. Protect your eyes with shades!`,
      color: 'bg-neo-yellow',
    });
  }

  if (tempC > 28) {
    items.push({
      icon: <ShieldCheck className="w-5 h-5" />,
      label: 'Sunscreen SPF30+',
      tip: `It's ${Math.round(tempC)}°C outside. Apply sunscreen before going out.`,
      color: 'bg-neo-orange',
    });
  }

  if (tempC < 15) {
    items.push({
      icon: <Shirt className="w-5 h-5" />,
      label: 'Jacket',
      tip: `It's ${Math.round(tempC)}°C — you'll need a warm jacket!`,
      color: 'bg-neo-purple',
    });
  }

  if (tempC < 5) {
    items.push({
      icon: <Thermometer className="w-5 h-5" />,
      label: 'Heavy Coat + Gloves',
      tip: 'Near-freezing temps! Layer up — coat, hat, and gloves.',
      color: 'bg-neo-pink',
    });
  }

  if (windKph > 40) {
    items.push({
      icon: <Wind className="w-5 h-5" />,
      label: 'Windbreaker',
      tip: `Winds at ${Math.round(windKph)} km/h. Wear a windbreaker or stay inside!`,
      color: 'bg-neo-mint',
    });
  }

  if (humidity > 80 && tempC > 25) {
    items.push({
      icon: <Droplets className="w-5 h-5" />,
      label: 'Hydration Bottle',
      tip: `Humidity is ${humidity}%. Stay hydrated — carry water!`,
      color: 'bg-neo-cyan',
    });
  }

  if (isFoggy) {
    items.push({
      icon: <ShieldCheck className="w-5 h-5" />,
      label: 'Reflective Gear',
      tip: 'Fog reduces visibility. Use reflective clothing if cycling.',
      color: 'bg-zinc-300',
    });
  }

  // All clear
  if (items.length === 0) {
    items.push({
      icon: <ShieldCheck className="w-5 h-5" />,
      label: "All Clear!",
      tip: "Conditions are great — enjoy your day outside!",
      color: 'bg-neo-mint',
    });
  }

  return items;
}

const containerVariants: Variants = {

  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};


export default function PackingSuggestions({ tempC, conditionCode, windKph, humidity, uv, isDay }: PackingProps) {
  const items = getPackingList(tempC, conditionCode, windKph, humidity, uv, isDay);

  return (
    <div className="neo-card bg-white dark:bg-zinc-900 p-5 flex flex-col gap-4">
      <h3 className="text-lg font-black font-heading border-b-2 border-black dark:border-white pb-2 text-black dark:text-white flex items-center gap-2">
        🎒 PACK YOUR BAG
      </h3>
      <motion.div
        key={conditionCode}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-3"
      >
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            title={item.tip}
            className={`flex items-center gap-2 px-3 py-2 border-2 border-black text-black font-bold text-sm cursor-default shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${item.color}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </motion.div>
        ))}
      </motion.div>
      <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 italic">
        {items[0]?.tip}
      </p>
    </div>
  );
}
