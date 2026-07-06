import { IPlayerAttributes, IMonsterAI, IEquippedItem, EquipmentSlot, DamageType, Vocation, PlayerStance, IPartySynergy } from '../types/combat';
import { TibiaRotationOptimizer } from './TibiaOptimizer';
import { BESTIARY_DATABASE } from './bestiaryDatabase';
import { SPELL_DATABASE, ISpellDefinition } from './spellDatabase';
import { ITEM_DATABASE } from './itemDatabase';
import { TibiaWheelManager } from './TibiaWheelManager';

export interface IEngineStateData {
  vocation: Vocation;
  level: number;
  baseSkills: { sword: number, axe: number, club: number, distance: number, magic: number };
  activeGear: any; // IGearSetup
  activeBoxConfig: any[]; // IBoxSlot[]
  wheelManager: TibiaWheelManager;
  spellPriority: string[];
  gemSockets?: any;
}

export class EngineBridge {

  private static compileGemModifiers(state: IEngineStateData) {
    const gemMods: { flatMods: Record<string, number>, percentMods: Record<string, number> } = {
      flatMods: {},
      percentMods: {}
    };
    
    if (!state.gemSockets) return gemMods;
    const wheelState = state.wheelManager.getWheelState();
    
    Object.entries(wheelState.pointsAllocatedPerQuadrant).forEach(([quad, points]) => {
      if (points >= 50) {
        const gem = state.gemSockets[quad];
        if (gem) {
          if (gem.statType === 'DAMAGE_PERCENT') gemMods.percentMods['DAMAGE'] = (gemMods.percentMods['DAMAGE'] || 0) + (gem.value / 100);
          if (gem.statType === 'HEAL_PERCENT') gemMods.percentMods['HEALING'] = (gemMods.percentMods['HEALING'] || 0) + (gem.value / 100);
          if (gem.statType === 'CRIT_CHANCE') gemMods.flatMods['CRIT_CHANCE'] = (gemMods.flatMods['CRIT_CHANCE'] || 0) + (gem.value / 100);
          if (gem.statType === 'CRIT_DAMAGE') gemMods.flatMods['CRIT_DAMAGE'] = (gemMods.flatMods['CRIT_DAMAGE'] || 0) + (gem.value / 100);
          if (gem.statType === 'LEECH_LIFE') gemMods.flatMods['LEECH_LIFE'] = (gemMods.flatMods['LEECH_LIFE'] || 0) + (gem.value / 100);
          if (gem.statType === 'LEECH_MANA') gemMods.flatMods['LEECH_MANA'] = (gemMods.flatMods['LEECH_MANA'] || 0) + (gem.value / 100);
          if (gem.statType === 'FLAT_HP') gemMods.flatMods['HP'] = (gemMods.flatMods['HP'] || 0) + gem.value;
          if (gem.statType === 'FLAT_MANA') gemMods.flatMods['MANA'] = (gemMods.flatMods['MANA'] || 0) + gem.value;
        }
      }
    });
    
    return gemMods;
  }

  private static getStance() {
    return PlayerStance.OPEN_FIELD;
  }

  public static buildPlayerAttributes(state: IEngineStateData): IPlayerAttributes {
    const { vocation, level, baseSkills, activeGear } = state;
    
    let baseSkill = 10;
    if (vocation === 'KNIGHT') baseSkill = baseSkills.sword;
    else if (vocation === 'PALADIN') baseSkill = baseSkills.distance;
    else baseSkill = baseSkills.magic;

    let eqBonusSkill = 0;
    let totalCritChance = 0;
    let totalCritMulti = 0;
    let totalLifeLeech = 0;
    let totalManaLeech = 0;
    let totalArmor = 0;
    let totalDefense = 0;
    let mainWeapon: any = undefined;
    let elementalProtections: Record<string, number> = {};
    let elementalConversion: Record<string, number> | undefined = undefined;

    Object.values(activeGear).forEach((eq: any) => {
      if (!eq) return;
      totalArmor += (eq.item.armor || 0);
      if (eq.item.slot === EquipmentSlot.WEAPON || eq.item.slot === EquipmentSlot.SHIELD) {
          totalDefense += (eq.item.defense || 0);
      }
      
      if (eq.item.bonusSkill) {
         Object.values(eq.item.bonusSkill).forEach((val: any) => eqBonusSkill += val);
      }

      if (eq.item.bonusProtections) {
         Object.entries(eq.item.bonusProtections).forEach(([elem, val]) => {
            elementalProtections[elem] = (elementalProtections[elem] || 0) + (val as number);
         });
      }
      
      if (eq.item.slot === EquipmentSlot.WEAPON) {
         mainWeapon = eq.item;
      }
      if (eq.item.elementalConversion) {
         elementalConversion = eq.item.elementalConversion;
      }

      eq.activeImbuements.forEach((imb: any) => {
         if (!imb) return;
         if (imb.type === 'VAMPIRISM') totalLifeLeech += imb.value;
         if (imb.type === 'VOID') totalManaLeech += imb.value;
         if (imb.type === 'STRIKE') {
            totalCritChance += 0.10; 
            totalCritMulti += imb.value;
         }
         if (imb.type === 'EPIPHANY') {
            eqBonusSkill += imb.value;
         }
         if (imb.type === 'PRECISION' || imb.type === 'SLASH' || imb.type === 'CHOP' || imb.type === 'BASH') {
            eqBonusSkill += imb.value;
         }
         if (imb.type === 'PROTECTION' && imb.element) {
            elementalProtections[imb.element] = (elementalProtections[imb.element] || 0) + imb.value;
         }
      });
    });

    return {
      vocation: vocation,
      level: level,
      baseSkill: baseSkill,
      equipmentBonusSkill: eqBonusSkill,
      combatBuffBonusSkill: 0, 
      critChance: totalCritChance,
      critMultiplier: totalCritMulti,
      forgeRuptureChance: 0,
      lifeLeechPercent: totalLifeLeech,
      manaLeechPercent: totalManaLeech,
      promotionScrollPoints: 0,
      stance: this.getStance(),
      harmonyActive: false,
      weaponProficiencyLevel: 0,
      activeBuffs: [], 
      weapon: mainWeapon,
      gear: activeGear,
      totalArmor,
      totalDefense,
      elementalProtections,
      elementalConversion,
      forgeOnslaughtChance: (activeGear.WEAPON?.item.forgeTier || 0) * 0.005,
      forgeRuseChance: ((activeGear.ARMOR?.item.forgeTier || 0) + (activeGear.SHIELD?.item.forgeTier || 0)) * 0.005,
      forgeMomentumChance: (activeGear.HELMET?.item.forgeTier || 0) * 0.02
    };
  }

  public static runSimulation(state: IEngineStateData, party: IPartySynergy) {
    const attrs = this.buildPlayerAttributes(state);
    
    // Wheel
    const wheelMods = state.wheelManager.compileActiveModifiers();
    const gemMods = this.compileGemModifiers(state);

    attrs.lifeLeechPercent += (wheelMods.flatMods['LEECH_LIFE'] || 0) + (gemMods.flatMods['LEECH_LIFE'] || 0);
    attrs.manaLeechPercent += (wheelMods.flatMods['LEECH_MANA'] || 0) + (gemMods.flatMods['LEECH_MANA'] || 0);
    attrs.critChance = (attrs.critChance || 0) + (wheelMods.flatMods['CRIT_CHANCE'] || 0) + (gemMods.flatMods['CRIT_CHANCE'] || 0);
    
    // Critical hit multiplier logic (base +50% in tibia is +0.5 to a 1.0 base, so 1.5)
    // If we have STRIKE, it adds 0.10, 0.25, or 0.50. So powerful strike = 2.0 multiplier.
    attrs.criticalDamageMultiplier = 1.0 + (attrs.critChance > 0 ? 0.5 : 0) + (attrs.critMultiplier || 0) + (wheelMods.flatMods['CRIT_DAMAGE'] || 0) + (gemMods.flatMods['CRIT_DAMAGE'] || 0);
    
    const initialQueue: any[] = state.activeBoxConfig.map((slot, index) => {
      const mobDef = BESTIARY_DATABASE[slot.monsterId] || BESTIARY_DATABASE['demon']!;
      return {
        id: `box_${index}_${slot.monsterId}`,
        name: mobDef.name || 'Unknown',
        maxHp: mobDef.maxHp || 1000,
        currentHp: mobDef.maxHp || 1000,
        armor: mobDef.armor || 10,
        elementalModifiers: mobDef.elementalModifiers || { PHYSICAL: 1.0, EARTH: 1.0, FIRE: 1.0, ENERGY: 1.0, ICE: 1.0, HOLY: 1.0, DEATH: 1.0, HEAL: 1.0 },
        combatType: mobDef.combatType || 'MELEE',
        behaviorState: 'NORMAL',
        activeCharm: slot.charm,
        baseDamagePerTurn: mobDef.baseDamagePerTurn || 1000,
        damageElement: mobDef.damageElement || 'PHYSICAL',
        activeConditions: []
      };
    });

    const availableSpells = (Object.values(SPELL_DATABASE) as ISpellDefinition[]).map((spell: ISpellDefinition) => {
      const clone = { ...spell };
      if (wheelMods.spellMods[spell.name]) {
        clone.wheelBonusPct = wheelMods.spellMods[spell.name].damageMultiplier || 0;
        clone.manaCost -= wheelMods.spellMods[spell.name].manaReduction || 0;
      }
      return clone;
    });

    return TibiaRotationOptimizer.findOptimalSequence(attrs, initialQueue, availableSpells, state.spellPriority, party, (state as any).lureTime || 0);
  }

  public static runAIAdvisor(state: IEngineStateData, party: IPartySynergy) {
    const currentAttrs = this.buildPlayerAttributes(state);
    
    const initialQueue: IMonsterAI[] = state.activeBoxConfig.map((slot, index) => {
      const mobDef = BESTIARY_DATABASE[slot.monsterId] || BESTIARY_DATABASE['demon']!;
      return {
        id: `box_${index}_${slot.monsterId}`,
        name: mobDef.name || 'Unknown',
        maxHp: mobDef.maxHp || 1000,
        currentHp: mobDef.maxHp || 1000,
        armor: mobDef.armor || 20,
        defense: mobDef.defense || 20,
        elementalModifiers: mobDef.elementalModifiers || { PHYSICAL:1, EARTH:1, FIRE:1, ICE:1, ENERGY:1, HOLY:1, DEATH:1 },
        combatType: mobDef.combatType || 'MELEE',
        behaviorState: 'NORMAL',
        activeCharm: slot.charm,
        baseDamagePerTurn: mobDef.baseDamagePerTurn || 1000,
        damageElement: mobDef.damageElement || DamageType.PHYSICAL,
        activeConditions: []
      } as IMonsterAI;
    });

    const availableSpells = (Object.values(SPELL_DATABASE) as ISpellDefinition[]).map((spell: ISpellDefinition) => ({ ...spell }));
    const baseline = TibiaRotationOptimizer.findOptimalSequence(currentAttrs, initialQueue, availableSpells, state.spellPriority, party);
    const baseDps = baseline.totalDamageDealt;

    const upgrades: any[] = [];
    Object.values(ITEM_DATABASE).forEach(item => {
      if (item.slot !== EquipmentSlot.ARMOR) return;
      if (item.vocations && !item.vocations.includes(state.vocation.toUpperCase() as Vocation)) return;
      
      const testAttrs = { ...currentAttrs };
      if (item.bonusSkill) {
         Object.entries(item.bonusSkill).forEach(([key, val]) => {
             testAttrs.equipmentBonusSkill += val as number;
         });
      }
      
      const testResult = TibiaRotationOptimizer.findOptimalSequence(testAttrs, initialQueue, availableSpells, state.spellPriority, party);
      const diff = testResult.totalDamageDealt - baseDps;
      
      if (diff > 0) {
        upgrades.push({ item: item.name, delta: diff, pct: (diff / baseDps) * 100 });
      }
    });

    upgrades.sort((a, b) => b.delta - a.delta);
    return upgrades;
  }
}
