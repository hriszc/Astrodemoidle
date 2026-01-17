import React, { useEffect, useRef } from 'react';
import { resourceTick } from '../store/gameStore';
import { combatTick } from '../store/combatStore';
import { loadGame, saveGame, resetGame } from '../store/persistence';
import { ResourcePanel } from './ResourcePanel';
import { BuildingPanel } from './BuildingPanel';
import { CombatPanel } from './CombatPanel';
import { PlayerPanel } from './PlayerPanel';
import { PrestigePanel } from './PrestigePanel';
import { useTranslation } from '../i18n/translations';
import { toggleLanguage, $settings } from '../store/settingsStore';
import { useStore } from '@nanostores/react';

export default function GameManager() {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const t = useTranslation();
  const settings = useStore($settings);

  useEffect(() => {
    loadGame();

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = (time - previousTimeRef.current) / 1000;
        const cappedDelta = Math.min(deltaTime, 1.0);
        resourceTick(cappedDelta);
        combatTick(cappedDelta);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    const saveInterval = setInterval(saveGame, 10000);

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(saveInterval);
      saveGame(); 
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 font-sans select-none pb-20 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
      {/* Header */}
      <header className="md:col-span-12 text-center mb-4 relative">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {t.title}
        </h1>
        <p className="text-gray-500 text-xs tracking-widest uppercase">{t.subtitle}</p>
        
        {/* Lang Switch */}
        <button 
          onClick={toggleLanguage}
          className="absolute right-0 top-0 text-xs px-2 py-1 rounded border border-gray-700 hover:bg-gray-800 text-gray-400"
        >
          {settings.lang === 'zh' ? 'EN' : '中文'}
        </button>
      </header>

      {/* LEFT COLUMN: BASE MANAGEMENT (Production) */}
      <div className="md:col-span-4 flex flex-col gap-6">
          <ResourcePanel />
          <div className="flex-1 min-h-[300px]">
             <BuildingPanel />
          </div>
          <PrestigePanel />
      </div>

      {/* RIGHT COLUMN: COMBAT & CHARACTER */}
      <div className="md:col-span-8 flex flex-col gap-6">
          <div className="h-[400px]">
             <CombatPanel />
          </div>
          <PlayerPanel />
      </div>
      
      {/* Footer */}
      <div className="md:col-span-12 mt-8 text-center text-xs text-gray-600 flex flex-col items-center gap-2">
        <span>{t.autoSave}</span>
        <button 
          onClick={resetGame}
          className="text-red-900/50 hover:text-red-500 underline"
        >
          {t.resetSave}
        </button>
      </div>
    </div>
  );
}
