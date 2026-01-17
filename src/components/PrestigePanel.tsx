import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { $prestige, prestige, buyArtifact, ARTIFACTS, type ArtifactId } from '../store/prestigeStore';
import { $combat, resetCombat } from '../store/combatStore';
import { resetResources } from '../store/gameStore';
import { resetPlayer } from '../store/playerStore';
import { useTranslation } from '../i18n/translations';
import clsx from 'clsx';

export const PrestigePanel = () => {
  const prestigeState = useStore($prestige);
  const combat = useStore($combat);
  const t = useTranslation();
  
  // Can prestige if stage >= 1000
  const PRESTIGE_REQ = 1000;
  const canPrestige = combat.maxUnlockedStage >= PRESTIGE_REQ;

  const handlePrestige = () => {
    if (confirm(`WARNING: Initiating Warp Jump.\n\nReq: Sector ${PRESTIGE_REQ}\n\nThis will reset:\n- Resources\n- Buildings\n- Player Level/Stats\n- Combat Stage\n\nYou will KEEP:\n- Essence\n- Artifacts\n\nAnd GAIN:\n+ Dark Matter\n\nProceed?`)) {
        prestige(); // Gain DM
        resetResources(); // Clear Res/Builds
        resetPlayer(); // Clear Stats
        resetCombat(); // Reset Stage
        window.location.reload(); 
    }
  };

  const getArtInfo = (key: ArtifactId) => {
    switch(key) {
        case 'time_dilation': return { name: t.art_time, desc: t.art_time_desc };
        case 'matter_conversion': return { name: t.art_matter, desc: t.art_matter_desc };
        case 'void_shield': return { name: t.art_void, desc: t.art_void_desc };
        default: return { name: key, desc: '' };
    }
  };

  return (
    <div className="bg-black/60 p-4 rounded-xl border border-purple-900/50 backdrop-blur-sm relative overflow-hidden">
       <div className="absolute inset-0 bg-[url('/warp-bg.svg')] opacity-10 pointer-events-none"></div>
       
       <h2 className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
           <span>🌀</span> {t.warpCore}
       </h2>

       {/* Status */}
       <div className="flex justify-between items-center mb-6 bg-purple-900/20 p-3 rounded-lg border border-purple-800/50">
           <div>
               <div className="text-[10px] text-purple-300 uppercase">{t.darkMatter}</div>
               <div className="text-2xl font-mono text-white font-bold">{prestigeState.darkMatter}</div>
           </div>
           
           {canPrestige ? (
               <button 
                onClick={handlePrestige}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse"
               >
                   {t.initiateWarp}
               </button>
           ) : (
               <div className="text-right">
                   <div className="text-[10px] text-gray-500">{t.chargeLevel}</div>
                   <div className="text-xs text-gray-400 font-mono">
                       {combat.maxUnlockedStage} / {PRESTIGE_REQ}
                   </div>
                   <div className="text-[10px] text-red-400 animate-pulse font-bold mt-1">
                       🔒 {t.reachTarget} {PRESTIGE_REQ}
                   </div>
               </div>
           )}
       </div>

       {/* Artifacts Shop */}
       <div className="space-y-2">
           <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-2">{t.artifacts}</h3>
           {Object.keys(ARTIFACTS).map(key => {
               const id = key as ArtifactId;
               const art = ARTIFACTS[id];
               const info = getArtInfo(id);
               const owned = prestigeState.artifacts[id];
               const canBuy = !owned && prestigeState.darkMatter >= art.cost;

               return (
                   <div key={id} className={clsx("p-3 rounded border flex justify-between items-center transition-all", 
                       owned ? "bg-purple-900/40 border-purple-500" : "bg-gray-900/50 border-gray-800"
                   )}>
                       <div>
                           <div className={clsx("font-bold text-sm", owned ? "text-purple-300" : "text-gray-300")}>{info.name}</div>
                           <div className="text-[10px] text-gray-500 max-w-[150px]">{info.desc}</div>
                       </div>
                       
                       {owned ? (
                           <span className="text-[10px] bg-purple-950 text-purple-400 px-2 py-1 rounded border border-purple-800">{t.active}</span>
                       ) : (
                           <button 
                            onClick={() => buyArtifact(id)}
                            disabled={!canBuy}
                            className={clsx("px-3 py-1 rounded text-xs font-bold", 
                                canBuy ? "bg-purple-700 text-white hover:bg-purple-600" : "bg-gray-800 text-gray-600 cursor-not-allowed"
                            )}
                           >
                               {t.buy} ({art.cost} DM)
                           </button>
                       )}
                   </div>
               )
           })}
       </div>
    </div>
  );
};