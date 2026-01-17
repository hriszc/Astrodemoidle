import React from 'react';
import { useStore } from '@nanostores/react';
import { $player, $derivedStats, allocatePoint, setAutoHeal, equipModule, MODULES, type ModuleType } from '../store/playerStore';
import { useTranslation } from '../i18n/translations';
import clsx from 'clsx';

export const PlayerPanel = () => {
  const player = useStore($player);
  const stats = useStore($derivedStats);
  const t = useTranslation();

  const xpPercent = (player.xp / player.maxXp) * 100;

  // Translation helpers for Modules
  const getModInfo = (key: ModuleType) => {
    switch(key) {
        case 'none': return { name: t.mod_none, desc: t.mod_none_desc };
        case 'vampirism': return { name: t.mod_vamp, desc: `${t.mod_vamp_desc} (+${Math.floor(player.intelligence * 0.2)} from INT)` };
        case 'overclock': return { name: t.mod_clock, desc: `${t.mod_clock_desc} (+${(player.intelligence * 1).toFixed(0)}% from INT)` };
        case 'plating': return { name: t.mod_plate, desc: `${t.mod_plate_desc} (+${Math.floor(player.intelligence * 0.5)} from INT)` };
        default: return { name: key, desc: '' };
    }
  };

  return (
    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 backdrop-blur-sm space-y-4">
       {/* Level & XP */}
       <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center border-2 border-indigo-500 font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]">
               {player.level}
           </div>
           <div className="flex-1">
               <div className="flex justify-between text-xs mb-1">
                   <span className="text-gray-300">{t.experience}</span>
                   <span className="text-gray-500">{Math.floor(player.xp)} / {player.maxXp}</span>
               </div>
               <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500" style={{ width: `${xpPercent}%` }}></div>
               </div>
           </div>
       </div>

       {/* Stats Section */}
       <div>
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.attributes}</h3>
             {player.statPoints > 0 && (
                 <span className="text-xs text-yellow-400 font-bold animate-pulse">{player.statPoints} {t.ptsAvailable}</span>
             )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
             <StatRow 
                label="STR" 
                value={player.strength} 
                sub={`Dmg: ${stats.damage}`} 
                canUpgrade={player.statPoints > 0}
                onUpgrade={() => allocatePoint('strength')}
             />
             <StatRow 
                label="DEX" 
                value={player.dexterity} 
                sub={`CD: ${stats.attackCooldown.toFixed(2)}s`}
                canUpgrade={player.statPoints > 0}
                onUpgrade={() => allocatePoint('dexterity')}
             />
             <StatRow 
                label="VIT" 
                value={player.vitality} 
                sub={`HP: ${stats.maxHp}`}
                canUpgrade={player.statPoints > 0}
                onUpgrade={() => allocatePoint('vitality')}
             />
             <StatRow 
                label="INT" 
                value={player.intelligence} 
                sub="Skill Power"
                canUpgrade={player.statPoints > 0}
                onUpgrade={() => allocatePoint('intelligence')}
             />
          </div>
       </div>

       {/* Modules Section */}
       <div className="border-t border-gray-800 pt-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.combatModules}</h3>
          <div className="grid grid-cols-1 gap-2">
             {(Object.keys(MODULES) as ModuleType[]).map((key) => {
                 if (key === 'none') return null;
                 const info = getModInfo(key);
                 const isActive = player.activeModule === key;
                 return (
                    <button 
                        key={key}
                        onClick={() => equipModule(isActive ? 'none' : key)}
                        className={clsx(
                            "text-left p-2 rounded border text-xs transition-all relative overflow-hidden",
                            isActive 
                                ? "bg-cyan-900/40 border-cyan-500 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.2)]" 
                                : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750 hover:border-gray-600"
                        )}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold">{info.name}</span>
                            {isActive && <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1 rounded">{t.active}</span>}
                        </div>
                        <div className="text-[10px] opacity-70 mt-1">{info.desc}</div>
                    </button>
                 )
             })}
          </div>
       </div>

       {/* Tactics Section */}
       <div className="border-t border-gray-800 pt-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.tactics}</h3>
          <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">{t.autoHeal}</span>
              <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="90" 
                    step="10" 
                    value={player.autoHealThreshold}
                    onChange={(e) => setAutoHeal(parseInt(e.target.value))}
                    className="w-20 accent-green-500"
                  />
                  <span className={player.autoHealThreshold > 0 ? "text-green-400" : "text-gray-600"}>
                      {player.autoHealThreshold > 0 ? `<${player.autoHealThreshold}%` : t.off}
                  </span>
              </div>
          </div>
          <div className="text-[10px] text-gray-600 mt-1">{t.autoHealDesc}</div>
       </div>
    </div>
  );
};

const StatRow = ({ label, value, sub, canUpgrade, onUpgrade }: any) => (
    <div className="bg-gray-800/50 p-2 rounded flex justify-between items-center group">
        <div>
            <div className="font-bold text-gray-300">{label}</div>
            <div className="text-[10px] text-gray-500">{sub}</div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-lg font-mono text-white">{value}</span>
            <button 
                onClick={onUpgrade}
                disabled={!canUpgrade}
                className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold transition-all ${
                    canUpgrade 
                    ? 'bg-yellow-600 hover:bg-yellow-500 active:scale-95 shadow-sm' 
                    : 'bg-gray-700 opacity-0 group-hover:opacity-20 pointer-events-none'
                }`}
            >
                +
            </button>
        </div>
    </div>
);