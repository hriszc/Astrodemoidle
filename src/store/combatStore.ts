import { map } from 'nanostores';
import { $player, $derivedStats, takeDamage as playerTakeDamage, addXp, healPlayer } from './playerStore';
import { $resources } from './gameStore';
import { $prestige } from './prestigeStore';

export type Enemy = {
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  damage: number;
  attackCooldown: number;
  xpReward: number;
  resourceReward: { stardust: number; essence: number };
};

export type CombatState = {
  status: 'IDLE' | 'FIGHTING' | 'RESPAWNING';
  enemy: Enemy | null;
  playerCooldown: number;
  enemyCooldown: number;
  stage: number;
  maxUnlockedStage: number;
  autoProgress: boolean;
};

const INITIAL_COMBAT: CombatState = {
  status: 'IDLE',
  enemy: null,
  playerCooldown: 0,
  enemyCooldown: 0,
  stage: 1,
  maxUnlockedStage: 1,
  autoProgress: true,
};

export const $combat = map<CombatState>(INITIAL_COMBAT);

// Actions
export const setStage = (stage: number) => {
  const s = $combat.get();
  if (stage >= 1 && stage <= s.maxUnlockedStage) {
    $combat.set({ ...s, stage, status: 'RESPAWNING', enemy: null });
  }
};

export const toggleAutoProgress = () => {
    const s = $combat.get();
    $combat.setKey('autoProgress', !s.autoProgress);
};

export const resetCombat = () => {
    $combat.set(INITIAL_COMBAT);
};

const generateEnemy = (stage: number): Enemy => {
  const scale = Math.pow(1.25, stage - 1);
  const hp = Math.floor(20 * scale);
  
  return {
    name: `Void Drone Mk.${stage}`,
    level: stage,
    currentHp: hp,
    maxHp: hp,
    damage: Math.floor(2 * scale),
    attackCooldown: Math.max(0.5, 2.5 - (stage * 0.05)),
    xpReward: Math.floor(5 * scale),
    resourceReward: { 
      stardust: Math.floor(10 * scale), 
      essence: Math.floor(1 + (stage * 0.5))
    }
  };
};

export const combatTick = (deltaTime: number) => {
  const state = $combat.get();
  
  if (state.status === 'IDLE' || state.status === 'RESPAWNING') {
     startCombat();
     return;
  }

  if (state.status === 'FIGHTING' && state.enemy) {
    const playerStats = $derivedStats.get();
    const playerStore = $player.get();
    const prestigeState = $prestige.get();
    
    // Check death
    if (playerStore.currentHp <= 0) {
      handlePlayerDeath();
      return;
    }

    // Module Effects: Overclock Drain
    if (playerStore.activeModule === 'overclock') {
       const res = $resources.get();
       if (res.energy >= deltaTime) {
           $resources.setKey('energy', res.energy - deltaTime);
       }
    }

    // Auto-Heal Strategy
    const hpPercent = (playerStore.currentHp / playerStats.maxHp) * 100;
    if (playerStore.autoHealThreshold > 0 && hpPercent < playerStore.autoHealThreshold) {
       const res = $resources.get();
       const HEAL_COST = 10;
       const HEAL_AMOUNT = playerStats.maxHp * 0.1;

       if (res.energy >= HEAL_COST) {
          $resources.setKey('energy', res.energy - HEAL_COST);
          healPlayer(HEAL_AMOUNT);
       }
    }

    // Cooldown Management
    let timeMult = 1;
    if (prestigeState.artifacts.time_dilation) {
        timeMult = 1.5;
    }
    const effectiveDt = deltaTime * timeMult;

    let pCd = Math.max(0, state.playerCooldown - effectiveDt);
    let eCd = Math.max(0, state.enemyCooldown - effectiveDt);

    // Player Attack
    if (pCd <= 0) {
      const dmg = playerStats.damage;
      const newEnemyHp = state.enemy.currentHp - dmg;
      
      $combat.setKey('enemy', { ...state.enemy, currentHp: newEnemyHp });
      pCd = playerStats.attackCooldown; // Reset CD

      // Module Effect: Vampirism
      if (playerStore.activeModule === 'vampirism') {
          healPlayer(playerStats.modStats.vampirismHeal);
      }

      if (newEnemyHp <= 0) {
        handleVictory();
        return;
      }
    }

    // Enemy Attack
    if (eCd <= 0) {
      const dmg = state.enemy.damage;
      playerTakeDamage(dmg);
      eCd = state.enemy.attackCooldown;
    }

    $combat.setKey('playerCooldown', pCd);
    $combat.setKey('enemyCooldown', eCd);
  }
};

const startCombat = () => {
  const state = $combat.get();
  const enemy = generateEnemy(state.stage);
  $combat.set({
    ...state,
    status: 'FIGHTING',
    enemy: enemy,
    playerCooldown: 0.5,
    enemyCooldown: 1.5,
  });
};

const handleVictory = () => {
  const state = $combat.get();
  if (!state.enemy) return;

  const prestigeState = $prestige.get();
  let bonusStardust = 0;
  if (prestigeState.artifacts.matter_conversion) {
      bonusStardust += Math.floor(state.enemy.maxHp * 0.5);
  }

  addXp(state.enemy.xpReward);
  
  const res = $resources.get();
  $resources.setKey('stardust', res.stardust + state.enemy.resourceReward.stardust + bonusStardust);
  $resources.setKey('essence', res.essence + state.enemy.resourceReward.essence);
  
  let nextStage = state.stage;
  let newMax = state.maxUnlockedStage;

  if (state.stage === state.maxUnlockedStage) {
      newMax = state.maxUnlockedStage + 1;
  }
  
  if (state.autoProgress && state.stage === state.maxUnlockedStage) {
     nextStage = newMax;
  } 

  $combat.set({
      ...state,
      status: 'RESPAWNING',
      enemy: null,
      maxUnlockedStage: newMax,
      stage: nextStage
  });
};

const handlePlayerDeath = () => {
  const state = $combat.get();
  const currentStage = Math.max(1, state.stage - 1);
  
  $player.setKey('currentHp', $derivedStats.get().maxHp);
  
  $combat.set({
    ...state,
    status: 'RESPAWNING',
    enemy: null,
    stage: currentStage
  });
};
