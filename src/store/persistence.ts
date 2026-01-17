import { $resources, $buildings, INITIAL_RESOURCES, INITIAL_BUILDINGS } from './gameStore';
import { $player, type PlayerStats } from './playerStore';
import { $combat, type CombatState } from './combatStore';
import { $prestige, type PrestigeState } from './prestigeStore';

const SAVE_KEY = 'cosmic_idle_save_v2'; // Bump version

export const saveGame = () => {
  const data = {
    resources: $resources.get(),
    buildings: $buildings.get(),
    player: $player.get(),
    combatStage: $combat.get().stage, // Only save stage, reset combat state
    prestige: $prestige.get(),
    lastSave: Date.now()
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
};

export const loadGame = () => {
  if (typeof localStorage === 'undefined') return;
  const raw = localStorage.getItem(SAVE_KEY);
  
  if (raw) {
    try {
      const data = JSON.parse(raw);
      
      if (data.resources) $resources.set({ ...INITIAL_RESOURCES, ...data.resources });
      if (data.buildings) $buildings.set({ ...INITIAL_BUILDINGS, ...data.buildings });
      
      // Player load needs care to preserve derived/structure if schema changed
      if (data.player) {
         // simple merge for MVP
         $player.set({ ...$player.get(), ...data.player });
      }

      if (data.combatStage) {
        $combat.setKey('stage', data.combatStage);
        // Also ensure maxUnlockedStage is at least stage
        const c = $combat.get();
        if (data.combatStage > c.maxUnlockedStage) {
             $combat.setKey('maxUnlockedStage', data.combatStage);
        }
      }

      if (data.prestige) {
          $prestige.set({ ...$prestige.get(), ...data.prestige });
      }

      // Offline progress (Resource only for now)
      const now = Date.now();
      if (data.lastSave) {
        const secondsOffline = (now - data.lastSave) / 1000;
        if (secondsOffline > 0) {
           console.log(`Offline for ${secondsOffline}s`);
           // We can import resourceTick here if we move it out or just duplicate logic slightly
           // For now, let's skip complex offline calculation to avoid circular deps or complex imports
           // Just giving a small "Welcome Back" bonus could be nice?
        }
      }

    } catch (e) {
      console.error("Failed to load save", e);
    }
  }
};

export const resetGame = () => {
  if (confirm('Are you sure you want to wipe your save?')) {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }
};
