'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Car, Eye, Wind, CloudRain, Snowflake } from 'lucide-react';

interface DriveSafeProps {
  windKph: number;
  conditionCode: number;
  visibilityKm: number;
  tempC: number;
}

interface DrivingCondition {
  level: 'safe' | 'caution' | 'danger';
  icon: React.ReactNode;
  headline: string;
  detail: string;
}

function getDrivingCondition(
  windKph: number,
  conditionCode: number,
  visibilityKm: number,
  tempC: number
): DrivingCondition {
  const isRainy = [
    1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195,
    1198, 1201, 1240, 1243, 1246
  ].includes(conditionCode);
  const isSnow = [
    1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258,
    1279, 1282
  ].includes(conditionCode);
  const isThunder = [1087, 1273, 1276, 1279, 1282].includes(conditionCode);
  const isFoggy = [1030, 1135, 1147].includes(conditionCode);
  const isBlizzard = windKph > 60 && isSnow;
  const isIcy = tempC <= 0 && (isRainy || isSnow);

  // Danger conditions
  if (isThunder || isBlizzard || isIcy || (isSnow && windKph > 50)) {
    return {
      level: 'danger',
      icon: <AlertTriangle className="w-6 h-6" />,
      headline: '🚨 DO NOT DRIVE',
      detail: isThunder
        ? 'Active thunderstorms make driving extremely hazardous. Stay indoors.'
        : isIcy
        ? `Road surface may be icy at ${Math.round(tempC)}°C. Avoid driving if possible.`
        : 'Blizzard conditions — near-zero visibility. Stay home.',
    };
  }

  // Caution conditions
  if (
    windKph > 50 ||
    (isRainy && windKph > 30) ||
    isFoggy ||
    visibilityKm < 2 ||
    isSnow
  ) {
    return {
      level: 'caution',
      icon: <Car className="w-6 h-6" />,
      headline: '⚠️ DRIVE WITH CAUTION',
      detail: isFoggy
        ? `Fog detected — visibility is ${visibilityKm} km. Use low-beam headlights.`
        : isSnow
        ? 'Snow on roads. Reduce speed and maintain safe following distance.'
        : windKph > 50
        ? `Strong gusts at ${Math.round(windKph)} km/h. Expect steering drift, especially on bridges.`
        : `Rain + wind combo. Braking distances increase on wet roads.`,
    };
  }

  // Safe conditions
  return {
    level: 'safe',
    icon: <Car className="w-6 h-6" />,
    headline: '✅ SAFE TO DRIVE',
    detail: `Conditions look good with ${visibilityKm} km visibility. Stay alert and drive safe!`,
  };
}

const bgMap = {
  safe: 'bg-neo-mint border-black dark:border-white',
  caution: 'bg-neo-yellow border-black dark:border-white',
  danger: 'bg-neo-pink border-black dark:border-white',
};

const textMap = {
  safe: 'text-black',
  caution: 'text-black',
  danger: 'text-black',
};

export default function DriveSafeAdvisory({ windKph, conditionCode, visibilityKm, tempC }: DriveSafeProps) {
  const condition = getDrivingCondition(windKph, conditionCode, visibilityKm, tempC);

  return (
    <motion.div
      key={condition.level}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className={`neo-card p-5 flex flex-col gap-3 ${bgMap[condition.level]}`}
    >
      <h3 className="text-lg font-black font-heading border-b-2 border-black pb-2 flex items-center gap-2 text-black">
        <Car className="w-5 h-5" /> DRIVE SAFE ADVISORY
      </h3>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-black text-white shadow-brutal-sm flex-shrink-0 mt-0.5">
          {condition.icon}
        </div>
        <div>
          <p className="font-black text-base leading-tight text-black">{condition.headline}</p>
          <p className="text-sm font-bold text-black/70 mt-1">{condition.detail}</p>
        </div>
      </div>

      {/* Road condition indicators */}
      <div className="grid grid-cols-3 gap-2 border-t-2 border-black pt-3">
        <div className="text-center">
          <Eye className="w-4 h-4 mx-auto text-black" />
          <p className="text-xs font-black text-black mt-0.5">VISIBILITY</p>
          <p className="text-sm font-black text-black">{visibilityKm} km</p>
        </div>
        <div className="text-center">
          <Wind className="w-4 h-4 mx-auto text-black" />
          <p className="text-xs font-black text-black mt-0.5">WIND</p>
          <p className="text-sm font-black text-black">{Math.round(windKph)} km/h</p>
        </div>
        <div className="text-center">
          <CloudRain className="w-4 h-4 mx-auto text-black" />
          <p className="text-xs font-black text-black mt-0.5">ROAD</p>
          <p className="text-sm font-black text-black">
            {conditionCode === 1000 ? 'Dry' : 'Wet'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
