import { map, computed } from 'nanostores';

export type ModuleType = 'none' | 'vampirism' | 'overclock' | 'plating';

export type PlayerStats = {
  level: number;
  xp: number;
  maxXp: number;
  statPoints: number; 
  
  // Base Attributes
  strength: number; 
  dexterity: number; 
  vitality: number; 
  intelligence: number; 

  // Gear Tiers
  weaponTier: number;
  armorTier: number;
  
  // Active Module
  activeModule: ModuleType;

  currentHp: number;
  autoHealThreshold: number; 
};

const INITIAL_PLAYER: PlayerStats = {
  level: 1,
  xp: 0,
  maxXp: 100,
  statPoints: 0,
  
  strength: 5,
  dexterity: 5,
  vitality: 10,
  intelligence: 1,

  weaponTier: 0,
  armorTier: 0,
  activeModule: 'none',

  currentHp: 100,
  autoHealThreshold: 0, 
};

export const $player = map<PlayerStats>(INITIAL_PLAYER);

// Module Definitions
export const MODULES: Record<ModuleType, { name: string, desc: string }> = {
  none: { name: 'Empty Slot', desc: 'No module installed.' },
  vampirism: { name: 'Vampiric Nanobots', desc: 'Heal 2 HP on hit. Max HP -30%.' },
  overclock: { name: 'Neural Overclock', desc: '+20% Atk Spd. Costs 1 Energy/s.' },
  plating: { name: 'Titanium Plating', desc: '+5 Defense. -10% Atk Spd.' },
};

// Computed Stats
export const $derivedStats = computed($player, p => {
  let maxHp = (p.vitality * 10) + (p.armorTier * 50);
  let damage = Math.floor((p.strength * 1.5) + (p.weaponTier * 5));
  let defense = Math.floor((p.armorTier * 1) + (p.vitality * 0.1));
  let attackCooldown = Math.max(0.2, 2.0 * Math.pow(0.96, p.dexterity));

  // Module Stats Container
  const modStats = {
      vampirismHeal: 2 + Math.floor(p.intelligence * 0.2),
      platingDefense: 5 + Math.floor(p.intelligence * 0.5),
      overclockSpeedBonus: 0.20 + (p.intelligence * 0.01) // 20% base + 1% per INT
  };

  // Module Logic
  if (p.activeModule === 'vampirism') {
      maxHp = Math.floor(maxHp * 0.7);
  }
  if (p.activeModule === 'plating') {
      defense += modStats.platingDefense;
      attackCooldown = attackCooldown * 1.1;
  }
  if (p.activeModule === 'overclock') {
      // Speed bonus means reducing cooldown.
      // 20% speed bonus = 1 / 1.2 duration = 0.833
      // Formula: cooldown / (1 + bonus)
      attackCooldown = attackCooldown / (1 + modStats.overclockSpeedBonus);
  }
  
  return {
    maxHp,
    damage,
    defense,
    attackCooldown,
    modStats
  };
});

// Actions
export const addXp = (amount: number) => {
  const p = $player.get();
  let newXp = p.xp + amount;
  let newLevel = p.level;
  let newMaxXp = p.maxXp;
  let newPoints = p.statPoints;

  while (newXp >= newMaxXp) {
    newXp -= newMaxXp;
    newLevel++;
    newPoints += 3; 
    newMaxXp = Math.floor(newMaxXp * 1.2);
    
    // Recalculate Max HP to heal fully
    // Max HP Formula must match derivedStats: (vitality * 10) + (armorTier * 50)
    // Note: p.vitality is the OLD vitality. If we add stat points later, it's fine.
    // We haven't spent points yet, so vitality is unchanged.
    const currentMaxHp = (p.vitality * 10) + (p.armorTier * 50);
    $player.setKey('currentHp', currentMaxHp); 
  }

  $player.setKey('xp', newXp);
  $player.setKey('level', newLevel);
  $player.setKey('maxXp', newMaxXp);
  $player.setKey('statPoints', newPoints);
};

export const allocatePoint = (stat: 'strength' | 'dexterity' | 'vitality' | 'intelligence') => {
  const p = $player.get();
  if (p.statPoints > 0) {
    $player.setKey(stat, p[stat] + 1);
    $player.setKey('statPoints', p.statPoints - 1);
  }
};

export const upgradeGear = (type: 'weapon' | 'armor') => {
  const p = $player.get();
  if (type === 'weapon') $player.setKey('weaponTier', p.weaponTier + 1);
  if (type === 'armor') $player.setKey('armorTier', p.armorTier + 1);
};

export const setAutoHeal = (val: number) => {
  $player.setKey('autoHealThreshold', val);
};

export const equipModule = (mod: ModuleType) => {
    $player.setKey('activeModule', mod);
};

export const healPlayer = (amount: number) => {
  const p = $player.get();
  const stats = $derivedStats.get(); // Nano stores computed is available here if we import it, but it might be stale? No, it's reactive.
  // Actually, using $derivedStats.get() inside an action is fine.
  $player.setKey('currentHp', Math.min(stats.maxHp, p.currentHp + amount));
};

export const takeDamage = (amount: number) => {
  const p = $player.get();
  const stats = $derivedStats.get();
  const actualDamage = Math.max(1, amount - stats.defense);
  $player.setKey('currentHp', Math.max(0, p.currentHp - actualDamage));
};

export const resetPlayer = () => {
    $player.set(INITIAL_PLAYER);
};
