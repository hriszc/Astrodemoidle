import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $combat, type Enemy, setStage, toggleAutoProgress } from '../store/combatStore';
import { $player, $derivedStats } from '../store/playerStore';
import { useTranslation } from '../i18n/translations';
import clsx from 'clsx';

export const CombatPanel = () => {
  const combat = useStore($combat);
  const player = useStore($player);
  const stats = useStore($derivedStats);
  const t = useTranslation();

  return (
    <div className="bg-gray-900/90 rounded-xl border border-gray-700 overflow-hidden flex flex-col h-full relative">
      {/* Stage Header */}
      <div className="bg-black/40 p-2 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setStage(combat.stage - 1)}
                disabled={combat.stage <= 1}
                className="w-6 h-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-gray-400"
            >
                &lt;
            </button>
            <div className="flex flex-col items-center min-w-[80px]">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.sector} {combat.stage}</span>
                <span className="text-[10px] text-gray-600">Max: {combat.maxUnlockedStage}</span>
            </div>
            <button 
                onClick={() => setStage(combat.stage + 1)}
                disabled={combat.stage >= combat.maxUnlockedStage}
                className="w-6 h-6 flex items-center justify-center bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded text-gray-400"
            >
                &gt;
            </button>
        </div>

        <div className="flex items-center gap-3">
             <button 
                onClick={toggleAutoProgress}
                className={clsx(
                    "text-[10px] px-2 py-0.5 rounded border transition-colors",
                    combat.autoProgress 
                        ? "bg-green-900/50 border-green-700 text-green-400" 
                        : "bg-gray-800 border-gray-700 text-gray-500"
                )}
            >
                {t.autoNext}: {combat.autoProgress ? t.active : t.off}
            </button>
            <div className="flex gap-2 items-center">
                <span className={clsx("w-2 h-2 rounded-full animate-pulse", combat.status === 'FIGHTING' ? "bg-red-500" : "bg-yellow-500")}></span>
            </div>
        </div>
      </div>

      {/* Battle Area */}
      <div className="flex-1 p-6 relative flex flex-col justify-between bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-900 to-gray-950">
        
        {/* Enemy Section */}
        <div className="flex flex-col items-center justify-center min-h-[120px]">
            {combat.enemy ? (
                <EnemyUnit enemy={combat.enemy} cooldown={combat.enemyCooldown} />
            ) : (
                <div className="text-gray-600 text-sm animate-pulse">{t.scanning}</div>
            )}
        </div>

        {/* Player Section */}
        <div className="mt-8">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-bold">Player (Lvl {player.level})</span>
                <span className="text-gray-400">{Math.floor(player.currentHp)} / {stats.maxHp} HP</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-1">
                <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (player.currentHp / stats.maxHp) * 100)}%` }}
                ></div>
            </div>
            {/* Action Bar */}
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden w-1/2">
                <div 
                    className="h-full bg-white transition-all duration-75 ease-linear"
                    style={{ width: `${(1 - combat.playerCooldown / stats.attackCooldown) * 100}%` }}
                ></div>
            </div>
            
            {/* Active Module Indicator */}
            {player.activeModule !== 'none' && (
                <div className="mt-2 text-[10px] text-cyan-500 flex items-center gap-1">
                    <span>⚡ {t.moduleActive}:</span>
                    <span className="uppercase">{player.activeModule}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const EnemyUnit = ({ enemy, cooldown }: { enemy: Enemy, cooldown: number }) => {
    return (
        <div className="w-full max-w-[200px] flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="text-4xl mb-2 grayscale hue-rotate-15">👾</div>
            <h3 className="text-red-400 font-bold text-sm">{enemy.name}</h3>
            <div className="text-[10px] text-gray-500 mb-2">Lvl {enemy.level}</div>
            
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1">
                <div 
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                ></div>
            </div>
            
             <div className="w-2/3 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-yellow-600 transition-all duration-75 ease-linear"
                    style={{ width: `${(1 - cooldown / enemy.attackCooldown) * 100}%` }}
                ></div>
            </div>
        </div>
    );
};
