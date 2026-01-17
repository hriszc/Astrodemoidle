import { map } from 'nanostores';
import { $prestige } from './prestigeStore';

export type Resources = {
  stardust: number;
  energy: number;
  essence: number; // New resource from combat
};

export type Buildings = {
  solarCollector: number;
  autoMiner: number;
  quantumFabricator: number;
};

export const INITIAL_RESOURCES: Resources = {
  stardust: 0,
  energy: 0,
  essence: 0,
};

export const INITIAL_BUILDINGS: Buildings = {
  solarCollector: 0,
  autoMiner: 0,
  quantumFabricator: 0,
};

// Store definitions
export const $resources = map<Resources>(INITIAL_RESOURCES);
export const $buildings = map<Buildings>(INITIAL_BUILDINGS);
export const $production = map<Resources>(INITIAL_RESOURCES); // Current production rates

// Building Config
export const BUILDING_COSTS = {
  solarCollector: { stardust: 15, energy: 0, essence: 0 },
  autoMiner: { stardust: 50, energy: 0, essence: 0 },
  quantumFabricator: { stardust: 1000, energy: 500, essence: 10 },
};

export const BUILDING_OUTPUTS = {
  solarCollector: { energy: 1, stardust: 0, essence: 0 },
  autoMiner: { energy: -0.5, stardust: 2, essence: 0 }, // Consumes energy
  quantumFabricator: { energy: -10, stardust: 50, essence: 0.1 },
};

const COST_SCALING = 1.15;

// Helper to calculate cost based on current count
export const getBuildingCost = (type: keyof Buildings, count: number) => {
  const base = BUILDING_COSTS[type];
  return {
    stardust: Math.floor(base.stardust * Math.pow(COST_SCALING, count)),
    energy: Math.floor(base.energy * Math.pow(COST_SCALING, count)),
    essence: Math.floor(base.essence * Math.pow(COST_SCALING, count)),
  };
};

// Actions
import { upgradeGear as playerUpgradeGear, $player } from './playerStore';

export const clickMine = () => {
  const current = $resources.get();
  $resources.setKey('stardust', current.stardust + 1);
};

export const GEAR_COSTS = {
  weapon: (tier: number) => ({ stardust: 100 * Math.pow(1.5, tier), essence: 5 * Math.pow(1.5, tier) }),
  armor: (tier: number) => ({ stardust: 100 * Math.pow(1.5, tier), essence: 5 * Math.pow(1.5, tier) }),
};

export const tryUpgradeGear = (type: 'weapon' | 'armor') => {
  const p = $player.get();
  const currentTier = type === 'weapon' ? p.weaponTier : p.armorTier;
  const cost = GEAR_COSTS[type](currentTier);
  const res = $resources.get();

  if (res.stardust >= cost.stardust && res.essence >= cost.essence) {
    $resources.set({
      ...res,
      stardust: res.stardust - cost.stardust,
      essence: res.essence - cost.essence
    });
    playerUpgradeGear(type);
  }
};

export const buyBuilding = (type: keyof Buildings) => {
  const buildings = $buildings.get();
  const resources = $resources.get();
  const cost = getBuildingCost(type, buildings[type]);

  if (
    resources.stardust >= cost.stardust && 
    resources.energy >= cost.energy &&
    resources.essence >= cost.essence
  ) {
    $resources.set({
      stardust: resources.stardust - cost.stardust,
      energy: resources.energy - cost.energy,
      essence: resources.essence - cost.essence
    });
    $buildings.setKey(type, buildings[type] + 1);
    recalculateProduction();
  }
};

const recalculateProduction = () => {
  const buildings = $buildings.get();
  let stardustProd = 0;
  let energyProd = 0;
  let essenceProd = 0;

  // Solar Collector
  stardustProd += buildings.solarCollector * BUILDING_OUTPUTS.solarCollector.stardust;
  energyProd += buildings.solarCollector * BUILDING_OUTPUTS.solarCollector.energy;

  // Auto Miner 
  stardustProd += buildings.autoMiner * BUILDING_OUTPUTS.autoMiner.stardust;
  energyProd += buildings.autoMiner * BUILDING_OUTPUTS.autoMiner.energy;

  // Quantum Fab
  stardustProd += buildings.quantumFabricator * BUILDING_OUTPUTS.quantumFabricator.stardust;
  energyProd += buildings.quantumFabricator * BUILDING_OUTPUTS.quantumFabricator.energy;
  essenceProd += buildings.quantumFabricator * BUILDING_OUTPUTS.quantumFabricator.essence;

  $production.set({ stardust: stardustProd, energy: energyProd, essence: essenceProd });
};

// Game Loop Tick for Resources
export const resourceTick = (deltaTimeSec: number) => {
  const prod = $production.get();
  const current = $resources.get();
  const prestigeState = $prestige.get();

  let timeMult = 1;
  if (prestigeState.artifacts.time_dilation) {
      timeMult = 1.5;
  }

  const effectiveDt = deltaTimeSec * timeMult;

  let newStardust = current.stardust + (prod.stardust * effectiveDt);
  let newEnergy = current.energy + (prod.energy * effectiveDt);
  let newEssence = current.essence + (prod.essence * effectiveDt);

  $resources.set({
    stardust: newStardust,
    energy: newEnergy,
    essence: newEssence
  });
};

export const resetResources = () => {
    $resources.set(INITIAL_RESOURCES);
    $buildings.set(INITIAL_BUILDINGS);
    $production.set(INITIAL_RESOURCES);
};