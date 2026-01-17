import { map } from 'nanostores';

export type ArtifactId = 'time_dilation' | 'matter_conversion' | 'void_shield';

export type PrestigeState = {
  darkMatter: number;
  totalDarkMatter: number;
  artifacts: Record<ArtifactId, boolean>;
  timesPrestiged: number;
};

const INITIAL_PRESTIGE: PrestigeState = {
  darkMatter: 0,
  totalDarkMatter: 0,
  artifacts: {
    time_dilation: false,
    matter_conversion: false,
    void_shield: false,
  },
  timesPrestiged: 0,
};

export const $prestige = map<PrestigeState>(INITIAL_PRESTIGE);

export const ARTIFACTS: Record<ArtifactId, { name: string, cost: number, desc: string }> = {
  time_dilation: { 
    name: "Time Dilation", 
    cost: 1, 
    desc: "Global Speed x1.5 (Production & Combat)." 
  },
  matter_conversion: { 
    name: "Matter Conversion", 
    cost: 3, 
    desc: "Killing enemies grants Stardust based on their Max HP." 
  },
  void_shield: { 
    name: "Void Shield", 
    cost: 5, 
    desc: "Overflow Healing generates a temporary Shield (Max +50% HP)." 
  }
};

export const prestige = () => {
  // Logic will be handled in a unified reset function in gameStore or persistence
  // Here we just calculate gains
  const s = $prestige.get();
  // Simple formula: 1 Dark Matter per prestige for MVP
  // In reality: based on lifetime earnings or max stage
  const gain = 1 + Math.floor(s.timesPrestiged * 0.5); 
  
  $prestige.set({
    ...s,
    darkMatter: s.darkMatter + gain,
    totalDarkMatter: s.totalDarkMatter + gain,
    timesPrestiged: s.timesPrestiged + 1
  });
};

export const buyArtifact = (id: ArtifactId) => {
  const s = $prestige.get();
  const art = ARTIFACTS[id];
  if (!s.artifacts[id] && s.darkMatter >= art.cost) {
    $prestige.setKey('darkMatter', s.darkMatter - art.cost);
    $prestige.setKey('artifacts', { ...s.artifacts, [id]: true });
  }
};
