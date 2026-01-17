import React from 'react';
import { useStore } from '@nanostores/react';
import { $resources, $production, clickMine } from '../store/gameStore';
import { useTranslation } from '../i18n/translations';
import clsx from 'clsx';

export const ResourcePanel = () => {
  const resources = useStore($resources);
  const production = useStore($production);
  const t = useTranslation();

  return (
    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
      <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{t.storageBay}</h2>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        <ResourceItem 
          label="Stardust" 
          value={resources.stardust} 
          rate={production.stardust} 
          color="text-purple-400"
        />
        <ResourceItem 
          label="Energy" 
          value={resources.energy} 
          rate={production.energy} 
          color="text-yellow-400"
          warn={resources.energy < 0}
        />
        <ResourceItem 
          label="Essence" 
          value={resources.essence} 
          rate={production.essence} 
          color="text-cyan-400"
        />
      </div>

      <button 
        onClick={clickMine}
        className="w-full py-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg border border-indigo-500/50 shadow-lg hover:brightness-110 active:scale-95 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center justify-center gap-3">
            <span className="text-2xl group-hover:rotate-12 transition-transform">☄️</span>
            <span className="font-bold text-white">{t.harvestStardust}</span>
        </div>
      </button>
    </div>
  );
};

const ResourceItem = ({ label, value, rate, color, warn }: any) => (
  <div className="bg-gray-950/50 p-2 rounded border border-gray-800 flex flex-col items-center">
    <span className="text-gray-500 text-[10px] uppercase">{label}</span>
    <span className={clsx("text-lg font-mono font-bold", warn ? "text-red-500" : color)}>
      {Math.floor(value).toLocaleString()}
    </span>
    <span className="text-[10px] text-gray-600">
      {rate > 0 ? '+' : ''}{rate.toFixed(1)}/s
    </span>
  </div>
);