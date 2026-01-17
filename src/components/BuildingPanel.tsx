import React from 'react';
import { useStore } from '@nanostores/react';
import { $buildings, buyBuilding, getBuildingCost, type Buildings, $resources, tryUpgradeGear, GEAR_COSTS } from '../store/gameStore';
import { $player } from '../store/playerStore';
import { useTranslation } from '../i18n/translations';
import clsx from 'clsx';

export const BuildingPanel = () => {
  const buildings = useStore($buildings);
  const t = useTranslation();
  
  return (
    <div className="bg-gray-900/80 p-4 rounded-xl border border-gray-700 backdrop-blur-sm h-full flex flex-col gap-6 overflow-y-auto">
      
      {/* Infrastructure Section */}
      <div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">{t.infrastructure}</h2>
          <div className="space-y-2">
            <BuildingItem type="solarCollector" count={buildings.solarCollector} />
            <BuildingItem type="autoMiner" count={buildings.autoMiner} />
            <BuildingItem type="quantumFabricator" count={buildings.quantumFabricator} />
          </div>
      </div>

      {/* Armory Section */}
      <div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">{t.armory}</h2>
          <div className="space-y-2">
            <GearUpgradeItem type="weapon" />
            <GearUpgradeItem type="armor" />
          </div>
      </div>
      
    </div>
  );
};

const BuildingItem = ({ type, count }: { type: keyof Buildings, count: number }) => {
  const resources = useStore($resources);
  const cost = getBuildingCost(type, count);
  const t = useTranslation();
  
  const canAfford = 
    resources.stardust >= cost.stardust && 
    resources.energy >= cost.energy && 
    resources.essence >= cost.essence;
  
  const names: Record<keyof Buildings, string> = {
    solarCollector: t.solarCollector,
    autoMiner: t.autoMiner,
    quantumFabricator: t.quantumFabricator
  };

  const descriptions: Record<keyof Buildings, string> = {
    solarCollector: t.desc_solar,
    autoMiner: t.desc_miner,
    quantumFabricator: t.desc_fab
  };

  return (
    <button
      onClick={() => buyBuilding(type)}
      disabled={!canAfford}
      className={clsx(
        "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group",
        canAfford 
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600" 
          : "bg-gray-800/50 border-gray-800 opacity-60 cursor-not-allowed"
      )}
    >
      <div>
        <div className="flex items-center gap-2">
            <span className="font-bold text-gray-200 text-sm">{names[type]}</span>
            <span className="text-[10px] bg-gray-900 px-1.5 py-0.5 rounded text-gray-500">Lvl {count}</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">{descriptions[type]}</div>
      </div>
      
      <div className="text-right flex flex-col items-end text-[10px]">
         {cost.stardust > 0 && <span className={resources.stardust >= cost.stardust ? "text-purple-300" : "text-red-400"}>{cost.stardust.toLocaleString()} SD</span>}
         {cost.energy > 0 && <span className={resources.energy >= cost.energy ? "text-yellow-300" : "text-red-400"}>{cost.energy.toLocaleString()} EN</span>}
         {cost.essence > 0 && <span className={resources.essence >= cost.essence ? "text-cyan-300" : "text-red-400"}>{cost.essence.toLocaleString()} ES</span>}
      </div>
    </button>
  );
};

const GearUpgradeItem = ({ type }: { type: 'weapon' | 'armor' }) => {
    const player = useStore($player);
    const resources = useStore($resources);
    const t = useTranslation();
    
    const tier = type === 'weapon' ? player.weaponTier : player.armorTier;
    const cost = GEAR_COSTS[type](tier);
    
    const canAfford = resources.stardust >= cost.stardust && resources.essence >= cost.essence;
    
    const names = { weapon: t.plasmaCutter, armor: t.nanoSuit };
    const effects = { weapon: t.desc_weapon, armor: t.desc_armor };

    return (
        <button
          onClick={() => tryUpgradeGear(type)}
          disabled={!canAfford}
          className={clsx(
            "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group",
            canAfford 
              ? "bg-gray-900 border-indigo-900/50 hover:bg-indigo-900/20 hover:border-indigo-500/50" 
              : "bg-gray-900/30 border-gray-800 opacity-60 cursor-not-allowed"
          )}
        >
          <div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-300 text-sm">{names[type]}</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-900">Mk.{tier + 1}</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">{effects[type]}</div>
          </div>
          
          <div className="text-right flex flex-col items-end text-[10px]">
             <span className={resources.stardust >= cost.stardust ? "text-purple-300" : "text-red-400"}>
                 {Math.floor(cost.stardust).toLocaleString()} SD
             </span>
             <span className={resources.essence >= cost.essence ? "text-cyan-300" : "text-red-400"}>
                 {Math.floor(cost.essence).toLocaleString()} ES
             </span>
          </div>
        </button>
    );
};
