import { create } from 'zustand';
import { Vocation, EquipmentSlot, IGearSetup, CharmType, IGemState, IPartySynergy } from '../types/combat';
import { Quadrant, TibiaWheelManager } from '../core/TibiaWheelManager';
import { getVocationDefaultWheelNodes } from '../core/wheelDatabase';

interface IBoxSlot {
  monsterId: string;
  charm: CharmType;
}

interface EngineState {
  // Character Basics
  vocation: Vocation;
  level: number;
  baseSkills: {
    sword: number;
    axe: number;
    club: number;
    distance: number;
    magic: number;
  };
  
  // Paperdoll
  activeGear: IGearSetup;
  
  // Hunt Setup
  activeBoxConfig: IBoxSlot[];
  partySynergy: IPartySynergy;
  lureTime: number;
  setLureTime: (s: number) => void;
  
  // Wheel of Destiny
  wheelManager: TibiaWheelManager;
  gemSockets: Partial<Record<Quadrant, IGemState>>;
  setGemSocket: (quadrant: Quadrant, gem: IGemState | null) => void;
  
  // Simulation Outputs
  simulationLogs: any[];
  aiUpgrades: any[];
  dpsTimeline: any[];
  setDpsTimeline: (tl: any[]) => void;
  vitalsTimeline: any[];
  setVitalsTimeline: (tl: any[]) => void;
  huntReport?: {
    potionsUsedPerHour: number;
    potionCostPerHour: number;
    runesUsedPerHour: number;
    runeCostPerHour: number;
    estimatedLootPerHour: number;
    balancePerHour: number;
  };
  setHuntReport: (report: any) => void;
  
  // Spell Rotation
  spellPriority: string[];
  setSpellPriority: (spells: string[]) => void;
  reorderSpell: (currentIndex: number, direction: 'UP' | 'DOWN') => void;
  
  // Actions
  setVocation: (voc: Vocation) => void;
  setLevel: (level: number) => void;
  setBaseSkill: (skill: keyof EngineState['baseSkills'], value: number) => void;
  setGearSlot: (slot: EquipmentSlot, item: any | undefined) => void;
  setImbuement: (slot: EquipmentSlot, index: number, imbuement: any | undefined) => void;
  updateBoxConfig: (index: number, update: Partial<IBoxSlot>) => void;
  addBoxMob: (monsterId: string) => void;
  removeBoxMob: (index: number) => void;
  setPartySynergy: (synergy: Partial<EngineState['partySynergy']>) => void;
  setSimulationLogs: (logs: any[]) => void;
  setAiUpgrades: (upgrades: any[]) => void;
  forceUpdateWheel: () => void;
}

export const useEngineStore = create<EngineState>((set, get) => ({
  vocation: Vocation.KNIGHT,
  level: 300,
  baseSkills: {
    sword: 120,
    axe: 10,
    club: 10,
    distance: 10,
    magic: 12,
  },
  
  activeGear: {},
  
  activeBoxConfig: [],
  partySynergy: { exposeFlaw: false, sapStrength: false, sioHeal: 0, divineDazzle: false },
  
  lureTime: 10,
  setLureTime: (s: number) => set({ lureTime: s }),
  
  wheelManager: new TibiaWheelManager(1000, 0, getVocationDefaultWheelNodes(Vocation.KNIGHT)),
  
  simulationLogs: [],
  aiUpgrades: [],
  dpsTimeline: [],
  setDpsTimeline: (timeline) => set({ dpsTimeline: timeline }),
  vitalsTimeline: [],
  setVitalsTimeline: (timeline) => set({ vitalsTimeline: timeline }),
  huntReport: undefined,
  setHuntReport: (report) => set({ huntReport: report }),
  gemSockets: {},
  setGemSocket: (quadrant, gem) => set(state => {
    const newSockets = { ...state.gemSockets };
    if (gem) newSockets[quadrant] = gem;
    else delete newSockets[quadrant];
    return { gemSockets: newSockets };
  }),
  spellPriority: ['exori gran', 'exori mas', 'exori', 'exori min'],

  setSpellPriority: (spells) => set({ spellPriority: spells }),
  reorderSpell: (index, dir) => set(state => {
    if (dir === 'UP' && index > 0) {
      const arr = [...state.spellPriority];
      const temp = arr[index - 1];
      arr[index - 1] = arr[index];
      arr[index] = temp;
      return { spellPriority: arr };
    }
    if (dir === 'DOWN' && index < state.spellPriority.length - 1) {
      const arr = [...state.spellPriority];
      const temp = arr[index + 1];
      arr[index + 1] = arr[index];
      arr[index] = temp;
      return { spellPriority: arr };
    }
    return state;
  }),
  
  setPartySynergy: (synergy) => set(state => ({ partySynergy: { ...state.partySynergy, ...synergy } })),
  setSimulationLogs: (logs) => set({ simulationLogs: logs }),
  setAiUpgrades: (upgrades) => set({ aiUpgrades: upgrades }),
  
  setVocation: (voc) => set({
    vocation: voc,
    // Rebuild wheel manager on voc change
    wheelManager: new TibiaWheelManager(get().level, 0, getVocationDefaultWheelNodes(voc))
  }),
  
  setLevel: (level) => set(state => {
    // Update internal wheel manager level when level changes and force reference update
    const wheel = state.wheelManager;
    (wheel as any).playerLevel = level;
    const newWheel = Object.assign(Object.create(Object.getPrototypeOf(wheel)), wheel);
    return { level, wheelManager: newWheel };
  }),
  
  setBaseSkill: (skill, value) => set(state => ({
    baseSkills: { ...state.baseSkills, [skill]: value }
  })),
  
  setGearSlot: (slot, item) => set(state => {
    const newGear = { ...state.activeGear };
    if (!item) {
      delete newGear[slot.toLowerCase() as keyof IGearSetup];
      
    } else {
      newGear[slot.toLowerCase() as keyof IGearSetup] = { item, activeImbuements: [] };
      
    }
    return { activeGear: newGear };
  }),
  
  setImbuement: (slot, index, imbuement) => set(state => {
    const newGear = { ...state.activeGear };
    const eq = newGear[slot.toLowerCase() as keyof IGearSetup];
    if (eq) {
      const newImbs = [...eq.activeImbuements];
      newImbs[index] = imbuement;
      newGear[slot.toLowerCase() as keyof IGearSetup] = { ...eq, activeImbuements: newImbs };
      
      
      
    }
    return { activeGear: newGear };
  }),
  
  updateBoxConfig: (index, update) => set(state => {
    const newBox = [...state.activeBoxConfig];
    newBox[index] = { ...newBox[index], ...update };
    
        return { activeBoxConfig: newBox };
  }),
  
  addBoxMob: (monsterId) => set(state => {
    if (state.activeBoxConfig.length >= 8) return state;
    const newBox = [...state.activeBoxConfig, { monsterId, charm: 'NONE' as CharmType }];
    
        return { activeBoxConfig: newBox };
  }),
  
  removeBoxMob: (index) => set(state => {
    const newBox = [...state.activeBoxConfig];
    newBox.splice(index, 1);
    
        return { activeBoxConfig: newBox };
  }),
  
  forceUpdateWheel: () => set(state => ({ wheelManager: Object.assign(Object.create(Object.getPrototypeOf(state.wheelManager)), state.wheelManager) }))
}));
