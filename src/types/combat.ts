export enum Vocation {
  KNIGHT = 'KNIGHT',
  PALADIN = 'PALADIN',
  SORCERER = 'SORCERER',
  DRUID = 'DRUID'
}

export enum PlayerStance {
  OPEN_FIELD = 'OPEN_FIELD',
  WALL_BACK = 'WALL_BACK',
  CORNER_TRAP = 'CORNER_TRAP'
}

export enum WeaponType {
  SWORD = 'SWORD',
  AXE = 'AXE',
  CLUB = 'CLUB',
  DISTANCE = 'DISTANCE',
  MAGIC_WAND_ROD = 'MAGIC_WAND_ROD'
}


export enum EquipmentSlot {
  HELMET = 'HELMET',
  ARMOR = 'ARMOR',
  LEGS = 'LEGS',
  BOOTS = 'BOOTS',
  WEAPON = 'WEAPON',
  SHIELD = 'SHIELD',
  AMULET = 'AMULET',
  RING = 'RING'
}

export type ImbuementType = 'VOID' | 'VAMPIRISM' | 'STRIKE' | 'EPIPHANY' | 'PRECISION' | 'SLASH' | 'CHOP' | 'BASH' | 'PROTECTION';

export interface IImbuement {
  id: string;
  name: string;
  tier: 1 | 2 | 3;
  type: ImbuementType;
  element?: DamageType;
  value: number; // e.g. 0.25 for 25% Void or Vampirism
}

export interface IEquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  vocations: Vocation[];
  armor?: number;
  defense?: number;
  baseAttack?: number;
  damageElement?: DamageType;
  bonusSkill?: Record<string, number>; // e.g., { SWORD: 4, MAGIC: 2, HP: 100 }
  bonusProtections?: Record<string, number>; // e.g., { PHYSICAL: 0.05, FIRE: -0.05 }
  elementalConversion?: Record<string, number>; // e.g., { FIRE: 0.5 } for 50% physical to fire
  imbuementSlots: number;
  forgeTier?: number;
}

export interface IEquippedItem {
  item: IEquipmentItem;
  activeImbuements: IImbuement[];
}

export type GemStatType = 'DAMAGE_PERCENT' | 'HEAL_PERCENT' | 'CRIT_CHANCE' | 'CRIT_DAMAGE' | 'LEECH_LIFE' | 'LEECH_MANA' | 'FLAT_HP' | 'FLAT_MANA';

export interface IGemState {
  id: string;
  name: string;
  statType: GemStatType;
  value: number; // e.g. 2 for 2%
}

export interface IGearSetup {
  helmet?: IEquippedItem;
  armor?: IEquippedItem;
  legs?: IEquippedItem;
  boots?: IEquippedItem;
  weapon?: IEquippedItem;
  shield?: IEquippedItem;
  amulet?: IEquippedItem;
  ring?: IEquippedItem;
}

export enum DamageType {
  PHYSICAL = 'PHYSICAL',
  EARTH = 'EARTH',
  FIRE = 'FIRE',
  ICE = 'ICE',
  ENERGY = 'ENERGY',
  HOLY = 'HOLY',
  DEATH = 'DEATH'
}

export interface ICompiledModifiers {
  flatSkills: Record<'SWORD' | 'AXE' | 'CLUB' | 'DISTANCE' | 'MAGIC' | 'HP' | 'MANA', number>;
  flatResistances: Record<DamageType, number>;
  spellUpgrades: Record<string, { damageMultiplier: number; cooldownReduction: number; manaReduction: number }>;
  avatarActive: boolean;
  harmonyBonusMitigation: number;
}

export interface ICombatSnapshot {
  tick: number; // Incrementos de 100ms em uma janela macro de 20000ms
  dpsReal: number;
  hpsReal: number; // Healing Per Second (Life Leech + Spells)
  mpsReal: number; // Mana Per Second (Mana Leech)
  activeBoxCount: number;
  screenQueueCount: number;
  playerCurrentMana: number;
}

export interface ITemporalBuff {
  name: string;
  bonusSkill: number;
  expiresAtTickMs: number;
}

export interface IConditionEffect {
  type: 'POISON' | 'CURSE' | 'BURN' | 'BLEED' | 'HEAL';
  damagePerTick: number;
  tickIntervalMs: number;
  expiresAtTickMs: number;
  damageType?: DamageType;
}

export interface IPlayerAttributes {
  vocation: Vocation;
  level: number;
  baseSkill: number; 
  equipmentBonusSkill: number;
  combatBuffBonusSkill: number;
  maxHpBonus?: number;
  maxManaBonus?: number;
  critChance: number; 
  critMultiplier: number; 
  forgeOnslaughtChance: number; 
  forgeRuptureChance: number; 
  forgeRuseChance: number;
  forgeMomentumChance: number;
  lifeLeechPercent: number; 
  manaLeechPercent: number;
  promotionScrollPoints: number; 
  stance: PlayerStance;
  harmonyActive: boolean;
  weaponProficiencyLevel: number; 
  weapon?: any;
  gear?: IGearSetup;
  temporaryModifiers?: any;
  activeBuffs?: ITemporalBuff[];
  activeConditions?: IConditionEffect[];
  globalDamageMultiplier?: number;
  globalMitigationMultiplier?: number;
  globalHealingMultiplier?: number;
  totalArmor?: number;
  totalDefense?: number;
  elementalProtections?: Record<string, number>;
  criticalDamageMultiplier?: number;
  elementalConversion?: Record<string, number>;
  wastePerTick?: number;
  lootMultiplier?: number;
}

export type CharmType = 'NONE' | 'WOUND' | 'FREEZE' | 'ZAP' | 'CURSE' | 'POISON' | 'ENFLAME' | 'DIVINE' | 'VAMPIRIC' | 'VOID' | 'PARRY' | 'DODGE' | 'LOW_BLOW';
export type CombatType = 'MELEE' | 'RANGED' | 'RUNNER';

export interface IMonsterAI {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  armor: number;
  defense?: number;
  elementalModifiers: Record<DamageType, number>; 
  combatType: CombatType;
  behaviorState: string;
  fleeHpPercent?: number; 
  activeCharm: CharmType | null | any;
  baseDamagePerTurn?: number;
  damageElement?: DamageType;
  level?: number;
  activeConditions?: IConditionEffect[];
}

export interface IScreenState {
  activeBox: (IMonsterAI | null | 'BLOCKED')[]; 
  screenQueue: IMonsterAI[]; 
  deadMonstersCount: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  totalHpLeeched: number;
  totalManaLeeched: number;
  totalDamageTaken: number;
  totalHealingDone: number;
  totalManaSpent: number;
  totalPotionsUsed: number;
  totalRunesUsed: number;
}

export interface IPartySynergy {
  exposeFlaw: boolean;
  sapStrength: boolean;
  sioHeal: number;
  divineDazzle: boolean;
}

export interface ISpellDefinition {
  id?: string;
  name: string;
  group: 'COMBAT' | 'SUPPORT' | 'HEALING';
  manaCost: number;
  cooldownMs: number;
  baseMinCoef: number;
  baseMaxCoef: number;
  damageType: DamageType | 'HEAL';
  aoeRange: 'SINGLE_TARGET' | 'FRONTAL_CLEAVE' | 'BOX' | 'WIDE' | 'WAVE';
  wheelBonusPct: number; 
}

export enum Quadrant {
  NORTH_EAST = 'NE',
  SOUTH_EAST = 'SE',
  SOUTH_WEST = 'SW',
  NORTH_WEST = 'NW'
}

export enum NodeType {
  DEDO = 'DEDO',             
  PERK = 'PERK',             
  CONVICTION = 'CONVICTION' 
}

export interface IModifierEffect {
  targetSkill?: 'SWORD' | 'AXE' | 'CLUB' | 'DISTANCE' | 'MAGIC' | 'HP' | 'MANA' | 'HOLY_RES' | 'DEATH_RES' | 'PHYS_RES';
  targetSpell?: string; 
  effectType: 'FLAT_ADD' | 'PERCENT_MULT' | 'COOLDOWN_REDUCTION' | 'MANA_COST_REDUCTION';
  value: number; 
}

export interface IWheelNode {
  id: string;
  name: string;
  quadrant: Quadrant;
  tier: 1 | 2 | 3;
  nodeType: NodeType;
  maxPoints: number;
  currentPoints: number;
  effects: IModifierEffect[];
  parentNodes: string[]; 
  uiPosition?: { angle: number; radius: number; };
}

export interface IWheelState {
  nodes: Map<string, IWheelNode>;
  totalPointsAllocated: number;
  pointsAllocatedPerQuadrant: Record<Quadrant, number>;
}

export interface ICompiledModifiers {
  flatMods: Record<string, number>;
  percentMods: Record<string, number>;
  spellMods: Record<string, Record<string, number>>;
}

// UI specific types preserved
export interface ISlottedGem {
  tier: 'none' | 'lesser' | 'regular' | 'greater';
  basicMod1: string;
  basicMod2: string;
  supremeMod: string;
}

export interface ICharacterSetup {
  attributes: IPlayerAttributes;
  wheelNodes: IWheelNode[]; // from new wheel
  proficiencies: Record<string, number>; // simplified
  extraBuffs: {
    podiumOfRenownBonus?: number; 
    activeTitle?: string;
    questBuffs?: { type: string; value: number }[];
    scrollsPoints?: number; 
  };
  slottedGems?: Record<number, ISlottedGem>; 
}

export interface ITimelineEvent {
  tick: number; 
  type: string;
  source: 'PLAYER' | 'MONSTER' | 'SYSTEM';
  description: string;
  value: number;
}

export interface ITimelineTick {
  timeMs: number;
  dps: number;
}

export interface ISimulationResult {
  totalDamageDealt: number;
  totalHpLeeched: number;
  totalManaLeeched: number;
  combatLog: string[];
  timelineData: ITimelineTick[];
}

export interface ISimulationReport {
  timeToClearMs: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  dps: number;
  hps: number;
  netManaFlowPerSecond: number;
  netHPFlowPerSecond: number;
  dangerAlert: boolean;
  estimatedXPHour: number;
  estimatedGoldHour: number;
  events: ITimelineEvent[];
}

export interface IRotationAction {
  tick: number; 
  type: 'SPELL' | 'POTION';
  name: string;
}
