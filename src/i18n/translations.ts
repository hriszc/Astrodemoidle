import { $settings, type Language } from '../store/settingsStore';
import { useStore } from '@nanostores/react';

const TRANSLATIONS = {
  en: {
    // Header
    title: "Cosmic Idle RPG",
    subtitle: "Base Management & Tactical Combat",
    resetSave: "Reset Save (Wipe Progress)",
    autoSave: "Game auto-saves every 10s.",
    
    // Resources
    storageBay: "Storage Bay",
    harvestStardust: "Harvest Stardust",
    
    // Buildings
    infrastructure: "Infrastructure",
    armory: "Armory",
    solarCollector: "Solar Collector",
    autoMiner: "Auto Miner",
    quantumFabricator: "Quantum Fab",
    plasmaCutter: "Plasma Cutter",
    nanoSuit: "Nano-Weave Suit",
    
    desc_solar: "+1 Energy/s",
    desc_miner: "+2 Stardust/s (-0.5 Energy)",
    desc_fab: "+50 Stardust, +0.1 Essence (-10 Energy)",
    desc_weapon: "+5 Base Dmg",
    desc_armor: "+1 Def, +50 MaxHP",
    
    // Combat
    sector: "Sector",
    scanning: "Scanning Sector...",
    autoNext: "Auto-Next",
    moduleActive: "Module Active",
    
    // Player
    experience: "Experience",
    attributes: "Attributes",
    combatModules: "Combat Modules",
    tactics: "Tactics",
    ptsAvailable: "pts available",
    
    mod_none: "Empty Slot",
    mod_none_desc: "No module installed.",
    mod_vamp: "Vampiric Nanobots",
    mod_vamp_desc: "Heal 2 HP on hit. Max HP -30%.",
    mod_clock: "Neural Overclock",
    mod_clock_desc: "+20% Atk Spd. Costs 1 Energy/s.",
    mod_plate: "Titanium Plating",
    mod_plate_desc: "+5 Defense. -10% Atk Spd.",
    
    autoHeal: "Auto-Heal",
    autoHealDesc: "Consumes 10 Energy to heal 10% HP",
    
    // Prestige
    warpCore: "Warp Core (Prestige)",
    darkMatter: "Dark Matter",
    chargeLevel: "Charge Level",
    reachTarget: "Reach Sector",
    initiateWarp: "INITIATE WARP JUMP",
    artifacts: "Artifacts",
    
    art_time: "Time Dilation",
    art_time_desc: "Global Speed x1.5 (Production & Combat).",
    art_matter: "Matter Conversion",
    art_matter_desc: "Killing enemies grants Stardust based on their Max HP.",
    art_void: "Void Shield",
    art_void_desc: "Overflow Healing generates a temporary Shield (Max +50% HP).",
    
    buy: "Buy",
    active: "ACTIVE",
    off: "OFF"
  },
  zh: {
    // Header
    title: "宇宙放置 RPG",
    subtitle: "基地建设 & 战术战斗",
    resetSave: "重置存档 (清除进度)",
    autoSave: "游戏每10秒自动保存",
    
    // Resources
    storageBay: "资源仓库",
    harvestStardust: "采集星尘",
    
    // Buildings
    infrastructure: "基础设施",
    armory: "军械库",
    solarCollector: "太阳能收集器",
    autoMiner: "自动采矿机",
    quantumFabricator: "量子制造机",
    plasmaCutter: "等离子切割器",
    nanoSuit: "纳米编织战甲",
    
    desc_solar: "+1 能量/秒",
    desc_miner: "+2 星尘/秒 (-0.5 能量)",
    desc_fab: "+50 星尘, +0.1 精华 (-10 能量)",
    desc_weapon: "+5 基础伤害",
    desc_armor: "+1 防御, +50 生命上限",
    
    // Combat
    sector: "星区",
    scanning: "正在扫描星区...",
    autoNext: "自动推进",
    moduleActive: "模组已激活",
    
    // Player
    experience: "经验值",
    attributes: "属性面板",
    combatModules: "战斗模组",
    tactics: "战术策略",
    ptsAvailable: "点数可用",
    
    mod_none: "空插槽",
    mod_none_desc: "未安装模组。",
    mod_vamp: "吸血纳米机器人",
    mod_vamp_desc: "攻击回复 2 HP。最大生命 -30%。",
    mod_clock: "神经超频",
    mod_clock_desc: "+20% 攻速。每秒消耗 1 能量。",
    mod_plate: "钛合金装甲板",
    mod_plate_desc: "+5 防御。-10% 攻速。",
    
    autoHeal: "自动治疗",
    autoHealDesc: "消耗 10 能量恢复 10% 生命",
    
    // Prestige
    warpCore: "折跃核心 (转生)",
    darkMatter: "暗物质",
    chargeLevel: "充能等级",
    reachTarget: "前往星区",
    initiateWarp: "启动折跃",
    artifacts: "上古神器",
    
    art_time: "时间膨胀",
    art_time_desc: "全局速度 x1.5 (生产 & 战斗)。",
    art_matter: "物质转化",
    art_matter_desc: "击杀敌人根据最大生命值奖励星尘。",
    art_void: "虚空护盾",
    art_void_desc: "溢出的治疗量转化为临时护盾 (最大 +50% HP)。",
    
    buy: "购买",
    active: "已激活",
    off: "关闭"
  }
};

export const useTranslation = () => {
  const settings = useStore($settings);
  return TRANSLATIONS[settings.lang];
};
