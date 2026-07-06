import { TibiaClockEngine } from './TibiaClockEngine';
import { IPlayerAttributes, IMonsterAI, ISpellDefinition, IPartySynergy } from '../types/combat';


export interface IRotationAction {
  tickMs: number;
  type: 'SPELL' | 'AUTO_ATTACK';
  name: string;
}

export interface IOptimizerResult {
  timeline: IRotationAction[];
  dpsTimeline?: {timeMs: number, dps: number}[];
  vitalsTimeline: { tickMs: number; hp: number; mana: number; maxHp: number; maxMana: number }[];
  totalDamageDealt: number;
  totalDamageReceived: number;
  netManaFlow: number;
  netHpFlow: number;
  timeToClearMs: number;
  validRotation: boolean;
  fitnessScore: number;
  economy?: {
    potionsUsedPerHour: number;
    potionCostPerHour: number;
    runesUsedPerHour: number;
    runeCostPerHour: number;
    estimatedLootPerHour: number;
    balancePerHour: number;
  };
}

export class TibiaRotationOptimizer {
  
  /**
   * The Predictive Brain: Forward Look-Ahead Greedy Tree Search
   * Simulates 20,000ms (200 ticks of 100ms) to build an optimal action timeline.
   */
  public static findOptimalSequence(
    player: IPlayerAttributes,
    initialQueue: IMonsterAI[],
    availableSpells: ISpellDefinition[],
    spellPriority: string[],
    partySynergy?: IPartySynergy,
    lureTime: number = 0
  ): IOptimizerResult {
    
    // Apply Party Synergy static buffs
    if (partySynergy) {
      if (partySynergy.exposeFlaw) player.globalDamageMultiplier = (player.globalDamageMultiplier || 1.0) + 0.05;
      if (partySynergy.divineDazzle) player.globalDamageMultiplier = (player.globalDamageMultiplier || 1.0) + 0.02; // Small dmg boost
      if (partySynergy.sapStrength) player.globalMitigationMultiplier = (player.globalMitigationMultiplier || 0.0) + 0.10;
    }

    // Isolate engine state for simulation
    const simQueue = initialQueue.map(m => ({ ...m })) as IMonsterAI[];
    const engine = new TibiaClockEngine(player, simQueue);
    
    const durationMs = 20000;
    const totalTicks = Math.floor(durationMs / 100);
    
    // Sort and map spells for heuristic based on user-defined priority
    const combatSpells = availableSpells
      .filter(s => s.group === 'COMBAT')
      .sort((a, b) => {
        const idxA = spellPriority.indexOf(a.name.toLowerCase());
        const idxB = spellPriority.indexOf(b.name.toLowerCase());
        // If spell isn't in priority list, push it to the bottom
        const rankA = idxA === -1 ? 999 : idxA;
        const rankB = idxB === -1 ? 999 : idxB;
        return rankA - rankB;
      });

    const healingSpells = availableSpells
      .filter(s => s.damageType === 'HEAL')
      .sort((a, b) => b.baseMaxCoef - a.baseMaxCoef); // Healing remains coefficient-based priority

    // Engine now owns HP/Mana state — read from it directly
    const vitals = engine.getPlayerVitals();
    let currentMana = vitals.maxMana;
    let currentHp   = vitals.maxHp;
    const initialMana = vitals.maxMana;
    let initialHp   = vitals.maxHp;
    
    let spellsCasted = 0;
    const timeline: any[] = [];
    const dpsTimeline: any[] = [];
    const vitalsTimeline: any[] = [];
    let lastSecondDamageDealt = 0;
    let damageSinceLastSecond = 0;

    // Simulate tick by tick
    for (let tick = 0; tick < totalTicks; tick++) {
      const currentTickMs = tick * 100;
      (engine as any).currentTickMs = currentTickMs;
      
      (engine as any).validateTemporalBuffs();
      (engine as any).processConditions(); // Ativando DoT para a Inteligência Artificial prever o dano!

      if (currentTickMs > 0 && currentTickMs % 500 === 0) {
        (engine as any).processQueueMigration();
      }
      
      // Inject Druid Sio Heal every 1000ms (1 second GCD)
      if (currentTickMs > 0 && currentTickMs % 1000 === 0 && partySynergy?.sioHeal && partySynergy.sioHeal > 0) {
         engine.playerCurrentHp = Math.min(engine.playerMaxHp, engine.playerCurrentHp + partySynergy.sioHeal);
         const state = engine.getScreenState();
         state.totalHealingDone += partySynergy.sioHeal;
         (engine as any).log(`[Party] Druid Sio: +${partySynergy.sioHeal} HP`);
      }

      (engine as any).cleanupDeadMonsters();
      
      const state = engine.getScreenState();
      
      // Update our simulated current HP/Mana based on engine flow since last tick
      // Since engine doesn't track current player HP natively, we track delta
      // using totalHpLeeched and totalDamageReceived.
      // We will do an approximation for this tick.
      
      const hasTargets = state.activeBox.some(m => m !== null && m !== 'BLOCKED') || state.screenQueue.length > 0;
      
      if (!hasTargets) {
        // All monsters dead
        break;
      }

      // Player death check
      if (engine.isPlayerDead()) {
        timeline.push({ tickMs: currentTickMs, type: 'SPELL', name: '💀 PLAYER DEATH' });
        break;
      }

      // 0. Attempt Auto-Potion
      // Se HP estiver abaixo de 80% ou Mana estiver abaixo de 50%, tenta usar potion.
      const vitalsBeforePotion = engine.getPlayerVitals();
      if ((vitalsBeforePotion.hp / vitalsBeforePotion.maxHp < 0.8) || (vitalsBeforePotion.mana / vitalsBeforePotion.maxMana < 0.5)) {
        engine.attemptUsePotion();
      }

      // 1. Attempt Auto-Attack
      const aaSuccess = engine.attemptAutoAttack(player.weapon?.damageElement || 'PHYSICAL');
      if (aaSuccess) {
        timeline.push({ tickMs: currentTickMs, type: 'AUTO_ATTACK', name: 'Auto Attack' });
      }

      // 2. Healing Priority — usar HP real do engine
      const vitalsNow = engine.getPlayerVitals();
      currentHp   = vitalsNow.hp;
      currentMana = vitalsNow.mana;
      const estHpRatio = vitalsNow.hp / vitalsNow.maxHp;
      if (estHpRatio < 0.80) {
        for (const healSpell of healingSpells) {
          if (currentMana >= healSpell.manaCost) {
            const casted = engine.attemptCastSpell(healSpell);
            if (casted) {
              currentMana -= healSpell.manaCost;
              timeline.push({ tickMs: currentTickMs, type: 'SPELL', name: healSpell.name });
              break;
            }
          }
        }
      }

      // 3. Combat Priority (Greedy Decision)
      let castedCombat = false;
      for (const combatSpell of combatSpells) {
        if (currentMana >= combatSpell.manaCost) {
          const casted = engine.attemptCastSpell(combatSpell);
          if (casted) {
            currentMana -= combatSpell.manaCost;
            spellsCasted++;
            castedCombat = true;
            timeline.push({ tickMs: currentTickMs, type: 'SPELL', name: combatSpell.name });
            break;
          }
        }
      }
      
      // Filler Injection (If no vocation spells available, try an AoE Rune if available)
      // Usually runes are in combatSpells but may be filtered or treated differently. 
      // The greedy sort already handles injecting lower tier spells (like Exori or Runes) if top tiers are on CD.

      // DPS Timeline Logic
      const damageDiff = engine.getScreenState().totalDamageDealt - lastSecondDamageDealt;
      damageSinceLastSecond += damageDiff;
      lastSecondDamageDealt = engine.getScreenState().totalDamageDealt;

      if (currentTickMs > 0 && currentTickMs % 1000 === 0) {
        dpsTimeline.push({
          timeMs: currentTickMs,
          dps: damageSinceLastSecond
        });
        
        const currentVits = engine.getPlayerVitals();
        vitalsTimeline.push({
          tickMs: currentTickMs,
          hp: currentVits.hp,
          mana: currentVits.mana,
          maxHp: currentVits.maxHp,
          maxMana: currentVits.maxMana
        });
        
        damageSinceLastSecond = 0; // Reset for next window
      }
    }

    const finalState  = engine.getScreenState();
    const finalVitals = engine.getPlayerVitals();
    const netManaFlow = finalState.totalManaLeeched - (initialMana - finalVitals.mana);
    const netHpFlow   = finalState.totalHpLeeched - finalState.totalDamageReceived;
    
    // Evaluate Fitness
    // Evaluate Fitness
    const timeToClearMs = finalState.deadMonstersCount === initialQueue.length ? (engine as any).currentTickMs : 20000;
    const fitnessScore = this.evaluateFitness(
      finalState.totalDamageDealt,
      netManaFlow,
      netHpFlow,
      timeToClearMs,
      spellsCasted
    );
    
    // --- Economy Analyzer (1 Hour Extrapolation) ---
    const lureTimeMs = lureTime * 1000;
    const runsPerHour = 3600000 / (durationMs + lureTimeMs);
    // Potion: Use the actual potions consumed by the Engine simulation
    const potionsUsedPerHour = finalState.totalPotionsUsed * runsPerHour;
    let potionCostPerUnit = 350; // default (Ultimate Mana Potion - old cost)
    if (player.vocation === 'KNIGHT') potionCostPerUnit = 625; // Supreme Health Potion
    else if (player.vocation === 'PALADIN') potionCostPerUnit = 438; // Ultimate Spirit Potion
    else potionCostPerUnit = 438; // Ultimate Mana Potion

    const potionCostPerHour = potionsUsedPerHour * potionCostPerUnit;
    
    // Runes: Assume Avalanches/GFBs cost ~57gp each
    const runesUsedPerHour = finalState.totalRunesUsed * runsPerHour;
    const runeCostPerHour = runesUsedPerHour * 57;
    
    // Estimated Loot: Basic approximation based on damage dealt (1 dmg = 0.5 gp for high level hunts)
    const lootMultiplier = player.lootMultiplier || 0.5;
    const estimatedLootPerHour = finalState.totalDamageDealt * runsPerHour * lootMultiplier;
    const balancePerHour = estimatedLootPerHour - potionCostPerHour - runeCostPerHour;

    return {
      timeline,
      dpsTimeline,
      vitalsTimeline,
      totalDamageDealt: finalState.totalDamageDealt,
      totalDamageReceived: finalState.totalDamageReceived,
      netManaFlow,
      netHpFlow,
      timeToClearMs,
      validRotation: currentMana > 0 && spellsCasted > 0,
      fitnessScore,
      economy: {
        potionsUsedPerHour,
        potionCostPerHour,
        runesUsedPerHour,
        runeCostPerHour,
        estimatedLootPerHour,
        balancePerHour
      }
    };
  }

  /**
   * FITNESS FUNCTION (Pillars Scoring)
   * Calculates a weighted score based on DPS, Resource Flow, and Overheal penalties.
   */
  private static evaluateFitness(
    totalDamage: number,
    netManaFlow: number,
    netHpFlow: number,
    timeToClear: number,
    spellsCasted: number
  ): number {
    let score = 0;

    // Pillar 1: High positive weight for total damage (EV)
    score += totalDamage * 1.5;

    // Pillar 2: Net Resource Flow
    // If mana flow is heavily negative, it means bankruptcy risk
    if (netManaFlow < -1000) {
      score -= Math.abs(netManaFlow) * 5.0; // Severe penalty for extreme mana burn
    } else {
      score += netManaFlow * 2.0; // Reward sustainable rotations
    }

    // Reward faster clears
    score += (20000 - timeToClear) * 2;

    // Pillar 3: Overheal Penalty (implicitly handled by estHpRatio constraint in loop)
    // Here we can penalize extreme waste of GCDs (e.g., lots of spells but low damage)
    if (spellsCasted > 0) {
      const dmgPerSpell = totalDamage / spellsCasted;
      if (dmgPerSpell < 100) {
        score -= 5000; // Penalty for spamming extremely weak fillers
      }
    }

    return score;
  }
}
