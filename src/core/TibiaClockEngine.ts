import { IPlayerAttributes, IMonsterAI, IScreenState, DamageType, ISpellDefinition } from '../types/combat';
// TIBIA NEXUS ENGINE v2.0 - STRICT PRODUCTION-READY CORE
// ============================================================================

// --- MODULE 1: COMPREHENSIVE TYPES & DATA SCHEMAS ---

export enum Vocation {
  KNIGHT = 'KNIGHT',
  PALADIN = 'PALADIN',
  SORCERER = 'SORCERER',
  DRUID = 'DRUID'
}

export enum PlayerStance {
  OPEN_FIELD = 'OPEN_FIELD',   // Max 8 Mobs
  WALL_BACK = 'WALL_BACK',     // Max 5 Mobs
  CORNER_TRAP = 'CORNER_TRAP'  // Max 3 Mobs
}

export enum WeaponType {
  SWORD = 'SWORD',
  AXE = 'AXE',
  CLUB = 'CLUB',
  DISTANCE = 'DISTANCE',
  MAGIC_WAND_ROD = 'MAGIC_WAND_ROD'
}

export type CharmType = 'WOUND' | 'FREEZE' | 'ZAP' | 'VAMPIRIC' | 'VOID';
export type CombatType = 'MELEE' | 'RANGED' | 'RUNNER';

// --- MODULE 2, 3, 4: CLOCK ENGINE, TACTICAL ARENA & ARITHMETIC PIPELINE ---

export class TibiaClockEngine {
  public currentTickMs: number = 0;
  private readonly TICK_RATE_MS = 100; // Granularity de ticks de 100ms
  
  // MODULE 2: CONCURRENT EVENT CLOCK
  private nextAutoAttackAvailableAt: number = 0;
  private nextCombatSpellAvailableAt: number = 0;
  private nextSupportSpellAvailableAt: number = 0;
  private nextPotionAvailableAt: number = 0;
  private spellCooldowns = new Map<string, number>();

  // State
  private player: IPlayerAttributes;
  private screenState: IScreenState;
  
  // Simulation Events (for reporting)
  public combatLog: string[] = [];

  // Live player vitals — variáveis vivas durante a simulação
  public playerCurrentHp: number = 0;
  public playerMaxHp: number = 0;
  public playerCurrentMana: number = 0;
  public playerMaxMana: number = 0;

  constructor(player: IPlayerAttributes, initialQueue: IMonsterAI[]) {
    this.player = player;

    // HP/Mana real baseado na vocação (fórmula oficial CipSoft)
    const levelsAfterRook = Math.max(0, player.level - 8);
    let hpPerLevel = 5, manaPerLevel = 5;
    switch (player.vocation) {
      case 'KNIGHT':   hpPerLevel = 15; manaPerLevel = 5;  break;
      case 'PALADIN':  hpPerLevel = 10; manaPerLevel = 15; break;
      case 'SORCERER':
      case 'DRUID':    hpPerLevel = 5;  manaPerLevel = 30; break;
    }
    this.playerMaxHp     = 150 + (levelsAfterRook * hpPerLevel)  + (player.maxHpBonus  || 0);
    this.playerMaxMana   = 90  + (levelsAfterRook * manaPerLevel) + (player.maxManaBonus || 0);
    this.playerCurrentHp   = this.playerMaxHp;
    this.playerCurrentMana = this.playerMaxMana;

    this.screenState = {
      activeBox: new Array(8).fill(null),
      screenQueue: initialQueue,
      deadMonstersCount: 0,
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      totalHpLeeched: 0,
      totalManaLeeched: 0,
      totalDamageTaken: 0,
      totalHealingDone: 0,
      totalManaSpent: 0,
      totalPotionsUsed: 0,
      totalRunesUsed: 0
    };
    this.initializeTacticalArena();
  }

  /**
   * MODULE 3: TACTICAL ARENA MATRIX
   * Inicialização de Box: Desativa fisicamente os índices proibidos na 'activeBox'.
   */
  private initializeTacticalArena(): void {
    const box = this.screenState.activeBox;
    for (let i = 0; i < 8; i++) box[i] = null;
    
    // OPEN_FIELD: 0 a 7 disponíveis (Nenhuma ação necessária, tudo null)
    
    // WALL_BACK: força índices 5, 6 e 7 como bloqueados
    if (this.player.stance === PlayerStance.WALL_BACK) {
      box[5] = 'BLOCKED';
      box[6] = 'BLOCKED';
      box[7] = 'BLOCKED';
    } 
    // CORNER_TRAP: força índices 3 a 7 como bloqueados
    else if (this.player.stance === PlayerStance.CORNER_TRAP) {
      box[3] = 'BLOCKED';
      box[4] = 'BLOCKED';
      box[5] = 'BLOCKED';
      box[6] = 'BLOCKED';
      box[7] = 'BLOCKED';
    }
  }

  /**
   * MODULE 3: PROCESSAMENTO DE FILA E IA (DYNAMIC RESPAWN ALGORITHM)
   * A cada tick de 2000ms, as criaturas 'MELEE' verificam slots livres na activeBox.
   */
  
  private processQueueMigration(): void {
    const queue = this.screenState.screenQueue;
    const box = this.screenState.activeBox;

    // Aplica restrições de Stance na activeBox
    if (this.player.stance === 'WALL_BACK') {
      box[5] = box[6] = box[7] = 'BLOCKED';
    } else if (this.player.stance === 'CORNER_TRAP') {
      box[3] = box[4] = box[5] = box[6] = box[7] = 'BLOCKED';
    }

    for (let i = queue.length - 1; i >= 0; i--) {
      const mob = queue[i];
      if (mob.combatType === 'MELEE') {
        const emptySlotIndex = box.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
          box[emptySlotIndex] = mob; 
          queue.splice(i, 1);
          this.log(`[Arena] ${mob.name} avançou para o slot da box ${emptySlotIndex}.`);
        }
      }
    }

    // Monster Attacks
    this.processMonsterAttacks();
  }

  private processMonsterAttacks(): void {
    const box   = this.screenState.activeBox;
    const queue = this.screenState.screenQueue;

    const playerArmor = this.player.totalArmor ?? 0;
    const playerArmorBlockEV = playerArmor * 0.75; // EV de random(armor/2, armor)

    const processMob = (mob: any) => {
      if (!mob || mob === 'BLOCKED' || mob.currentHp <= 0) return;
      let rawDmg = mob.baseDamagePerTurn || 100;

      // Harmony mitigation
      if (this.player.harmonyActive && this.player.stance !== 'OPEN_FIELD') {
        rawDmg *= 0.90;
      }

      // Charm DODGE e PARRY (10% EV)
      if (mob.activeCharm === 'DODGE') {
         rawDmg *= 0.90; // 10% de chance de anular completamente o dano
      }
      
      // Armor só bloqueia dano físico
      let finalDmg = rawDmg;
      if (!mob.damageElement || mob.damageElement === 'PHYSICAL') {
        finalDmg = Math.max(0, rawDmg - playerArmorBlockEV);
      }
      
      // Charm PARRY (Reflete o dano mitigado, ignoraremos o loop e apenas mitigaremos com 10% chance)
      if (mob.activeCharm === 'PARRY') {
         // Parry reflete o dano total mas você ainda sofre o dano que sofreria. Wait.
         // No Tibia, Parry reflete o dano natural do bicho. Mas ele DEFENDE? Não, Parry original apenas causa dano.
         // O Dodge é o que previne dano.
         mob.currentHp -= mob.baseDamagePerTurn * 0.10; // EV de reflect damage
      }

      // Elemental Protections (Items + Imbuements)
      if (mob.damageElement && this.player.elementalProtections && this.player.elementalProtections[mob.damageElement]) {
         finalDmg *= Math.max(0, 1.0 - this.player.elementalProtections[mob.damageElement]);
      }

      // --- OFFICIAL TIBIA MITIGATION FORMULA ---
      // Mitigation depends on Stance, Vocation, and Total Defense.
      let stanceMultiplier = 0.5;
      if (this.player.stance === 'WALL_BACK' || this.player.stance === 'CORNER_TRAP') stanceMultiplier = 1.0;
      
      let vocMultiplier = this.player.vocation === 'KNIGHT' ? 1.0 : this.player.vocation === 'PALADIN' ? 0.5 : 0;
      const totalDefense = this.player.totalDefense || 0;
      
      const computedMitigation = (totalDefense / 100) * stanceMultiplier * vocMultiplier * 0.08; 
      const totalMitigation = (this.player.globalMitigationMultiplier || 0.0) + computedMitigation;
      
      finalDmg *= Math.max(0, 1.0 - totalMitigation);

      // Forge Ruse (perfect dodge)
      if (this.player.forgeRuseChance && this.player.forgeRuseChance > 0) {
         // Appling EV of Ruse (X% chance to take 0 damage = X% damage reduction)
         finalDmg *= Math.max(0, 1.0 - this.player.forgeRuseChance);
      }

      this.playerCurrentHp -= finalDmg;
      this.screenState.totalDamageReceived += finalDmg;
      this.log(`[Monster] ${mob.name}: ${Math.round(finalDmg)} dmg → Player HP ${Math.round(this.playerCurrentHp)}/${this.playerMaxHp}`);
    };

    box.forEach(processMob);
    queue.forEach((mob: any) => { if (mob.combatType === 'RANGED') processMob(mob); });
  }


  
  /**
   * RULE 4: Retroactive Temporal Buff Validation
   * Checks expiresAtTickMs for active buffs every 100ms and nullifies them immediately before combat calculations.
   */
  private validateTemporalBuffs(): void {
    if (this.player.activeBuffs && this.player.activeBuffs.length > 0) {
      let originalLen = this.player.activeBuffs.length;
      let removedSkill = 0;
      this.player.activeBuffs = this.player.activeBuffs.filter(buff => {
        if (buff.expiresAtTickMs <= this.currentTickMs) {
          removedSkill += buff.bonusSkill;
          this.log(`[System] Buff expirou temporalmente: ${buff.name}`);
          return false;
        }
        return true;
      });
      if (removedSkill > 0) {
        this.player.combatBuffBonusSkill -= removedSkill;
      }
    }
  }

  /**
   * MODULE 5: DAMAGE OVER TIME (DoT) ENGINE
   * Avalia a cada 100ms se alguma condicao de Poison, Curse, etc deve causar dano.
   */
  private processConditions(): void {
    const processEntityConditions = (entity: { activeConditions?: any[], currentHp: number, name: string }) => {
      if (!entity.activeConditions) return;
      let expiredIndexes: number[] = [];
      
      entity.activeConditions.forEach((cond, idx) => {
        if (this.currentTickMs > cond.expiresAtTickMs) {
          expiredIndexes.push(idx);
          return;
        }
        
        // Verifica se é o tick exato do DoT
        if (this.currentTickMs > 0 && this.currentTickMs % cond.tickIntervalMs === 0) {
          if (cond.type === 'HEAL') {
            entity.currentHp += cond.damagePerTick;
            this.log(`[DoT Engine] ${entity.name} curou ${cond.damagePerTick} de ${cond.type}`);
          } else {
            const dmg = cond.damagePerTick;
            entity.currentHp -= dmg;
            this.log(`[DoT Engine] ${entity.name} tomou ${dmg} de ${cond.type} (DoT)`);
            
            // Atribui dano causado ao Player se aplicou num Monstro
            if ((entity as any).id) {
              this.screenState.totalDamageDealt += dmg;
            } else {
              this.screenState.totalDamageReceived += dmg;
            }
          }
        }
      });
      
      // Limpeza das expiradas
      for (let i = expiredIndexes.length - 1; i >= 0; i--) {
        entity.activeConditions.splice(expiredIndexes[i], 1);
      }
    };

    processEntityConditions(this.player as any);
    
    this.screenState.activeBox.forEach(mob => {
      if (mob !== null && mob !== 'BLOCKED') processEntityConditions(mob);
    });
    
    this.screenState.screenQueue.forEach(mob => {
      processEntityConditions(mob);
    });
  }

  public timelineData: {timeMs: number, dps: number}[] = [];

  /**
   * ENGINE LOOP
   */
  public runSimulation(durationMs: number): void {
    const totalTicks = Math.floor(durationMs / this.TICK_RATE_MS);
    
    // DPS Tracking
    let damageSinceLastSecond = 0;
    let lastSecondDamageDealt = 0;

    for (let tick = 0; tick < totalTicks; tick++) {
      this.currentTickMs = tick * this.TICK_RATE_MS;
      this.validateTemporalBuffs();
      this.processConditions();
      
      // Processamento de Fila (Movement Tick 500ms)
      if (this.currentTickMs > 0 && this.currentTickMs % 500 === 0) {
        this.processQueueMigration();
      }

      this.cleanupDeadMonsters();

      // Timeline Logic: Capture total damage over the last 1 second window
      const damageDiff = this.screenState.totalDamageDealt - lastSecondDamageDealt;
      damageSinceLastSecond += damageDiff;
      lastSecondDamageDealt = this.screenState.totalDamageDealt;

      if (this.currentTickMs > 0 && this.currentTickMs % 1000 === 0) {
        this.timelineData.push({
          timeMs: this.currentTickMs,
          dps: damageSinceLastSecond
        });
        damageSinceLastSecond = 0; // Reset for next window
      }

      // Forge Momentum (2000ms check)
      if (this.currentTickMs > 0 && this.currentTickMs % 2000 === 0) {
        if (this.player.forgeMomentumChance && this.player.forgeMomentumChance > 0 && Math.random() < this.player.forgeMomentumChance) {
          // Reduce all current cooldowns by 2000ms
          for (let [spellName, readyAt] of this.spellCooldowns.entries()) {
            if (readyAt > this.currentTickMs) {
              this.spellCooldowns.set(spellName, readyAt - 2000);
            }
          }
          this.log(`[Momentum] Triggered! All spell cooldowns reduced by 2s.`);
        }
      }
    }
  }

  /**
   * MODULE 2: CONCURRENT EVENT CLOCK (GCDs paralelos)
   */
  public attemptUsePotion(): boolean {
    if (this.currentTickMs < this.nextPotionAvailableAt) return false;

    let healHp = 0;
    let healMana = 0;
    let potionName = '';

    switch (this.player.vocation) {
      case 'KNIGHT':
        potionName = 'Supreme Health Potion';
        healHp = 1000;
        break;
      case 'PALADIN':
        potionName = 'Ultimate Spirit Potion';
        healHp = 500;
        healMana = 200;
        break;
      case 'SORCERER':
      case 'DRUID':
        potionName = 'Ultimate Mana Potion';
        healMana = 500;
        break;
    }

    if (healHp > 0 || healMana > 0) {
      this.playerCurrentHp = Math.min(this.playerMaxHp, this.playerCurrentHp + healHp);
      this.playerCurrentMana = Math.min(this.playerMaxMana, this.playerCurrentMana + healMana);
      this.screenState.totalHealingDone += healHp; // Potions count as healing
      
      this.nextPotionAvailableAt = this.currentTickMs + 1000;
      this.screenState.totalPotionsUsed++;
      this.log(`Drank ${potionName} (+${healHp} HP, +${healMana} Mana)`);
      return true;
    }
    return false;
  }

  public attemptCastSpell(spell: ISpellDefinition): boolean {
    const now = this.currentTickMs;

    // Checagem de Cooldown Individual (ex: Exori Gran 4000ms)
    const spellCdReadyAt = this.spellCooldowns.get(spell.name) || 0;
    if (now < spellCdReadyAt) return false;

    // Checagem de GCD Específico por Grupo
    if (spell.group === 'COMBAT') {
      if (now < this.nextCombatSpellAvailableAt) return false;
      this.nextCombatSpellAvailableAt = now + 2000; // Bloqueia grupo de combate por 2000ms
    } else if (spell.group === 'SUPPORT' || spell.group === 'HEALING') {
      if (now < this.nextSupportSpellAvailableAt) return false;
      this.nextSupportSpellAvailableAt = now + 1000; // Bloqueia suporte/cura por 1000ms (paralelo ao combate)
    }

    // Trava o cooldown individual
    this.spellCooldowns.set(spell.name, now + spell.cooldownMs);

    // Deduzir mana real
    if (spell.manaCost > 0) {
      if (this.playerCurrentMana < spell.manaCost) return false;
      this.playerCurrentMana -= spell.manaCost;
    this.screenState.totalManaSpent += spell.manaCost;
    if (spell.manaCost === 0 && spell.damageType !== DamageType.PHYSICAL && spell.damageType !== ("HEALING" as any)) { this.screenState.totalRunesUsed++; }
    }

    this.log(`[Cast] ${spell.name} | Mana ${Math.round(this.playerCurrentMana)}/${this.playerMaxMana}`);
    this.executeSpellEffect(spell);
    return true;
  }

  /**
   * Auto Attack Clock (Intervalo rígido: 2000ms)
   */

  public attemptAutoAttack(weaponElement: DamageType = DamageType.PHYSICAL): boolean {
    if (this.currentTickMs < this.nextAutoAttackAvailableAt) return false;

    const hasTargets = this.screenState.activeBox.some(m => m !== null && m !== 'BLOCKED');
    if (!hasTargets) return false;

    let target = this.screenState.activeBox.find(m => m !== null && m !== 'BLOCKED' && m.currentHp > 0) as IMonsterAI;
    if (!target) return false;

    let baseDmg = 500;
    if (this.player.vocation === 'KNIGHT' || this.player.vocation === 'PALADIN') {
      const wepAtk = this.player.weapon?.baseAttack || 50;
      const skill = (this.player as any).baseSkill + this.player.weaponProficiencyLevel;
      baseDmg = 0.085 * (skill * wepAtk) + (this.player.level / 5);
    } else {
      baseDmg = (this.player.level / 5) + (((this.player as any).baseSkill || 10) * 2); 
    }
    
    baseDmg *= (this.player.globalDamageMultiplier || 1.0);
    let evDmg = baseDmg;

    let isCrit = false;
    let critChance = (this.player as any).critChance || 0;
    if (critChance > 0 && Math.random() < critChance) {
      isCrit = true;
      evDmg *= (this.player.criticalDamageMultiplier || 1.5);
    }
    
    let isOnslaught = false;
    if (this.player.forgeOnslaughtChance && this.player.forgeOnslaughtChance > 0 && Math.random() < this.player.forgeOnslaughtChance) {
      isOnslaught = true;
      evDmg *= 1.6;
    }

    const isDiamondArrow = this.player.vocation === 'PALADIN' && (this.player.weapon?.weaponType === 'BOW' || this.player.weapon?.weaponType === 'CROSSBOW');
    const targetsToHit = isDiamondArrow 
      ? this.screenState.activeBox.filter(m => m !== null && m !== 'BLOCKED' && m.currentHp > 0)
      : [target];

    let totalLeechHp = 0;
    let totalLeechMana = 0;

    targetsToHit.forEach((t: any, index: number) => {
      let finalDmg = 0;
      if (this.player.elementalConversion) {
        let convertedTotal = 0;
        Object.entries(this.player.elementalConversion).forEach(([element, pct]) => {
           const convertedAmount = evDmg * (pct as number);
           const res = t.elementalModifiers[element as DamageType] ?? 1.0;
           finalDmg += convertedAmount * res;
           convertedTotal += (pct as number);
        });
        const remainingPct = Math.max(0, 1.0 - convertedTotal);
        if (remainingPct > 0) {
           const physRes = t.elementalModifiers['PHYSICAL'] ?? 1.0;
           finalDmg += (evDmg * remainingPct) * physRes;
        }
      } else {
        const res = t.elementalModifiers[weaponElement] ?? 1.0;
        finalDmg = evDmg * res;
      }

      t.currentHp -= finalDmg;
      this.screenState.totalDamageDealt += finalDmg;

      const leechFactor = index === 0 ? 1 : 0.1;
      const lifeLeech = (this.player as any).lifeLeechPercent || 0;
      const manaLeech = (this.player as any).manaLeechPercent || 0;

      if (lifeLeech > 0) totalLeechHp += (finalDmg * lifeLeech) * leechFactor;
      if (manaLeech > 0) totalLeechMana += (finalDmg * manaLeech) * leechFactor;

      // this.processCharms(t, weaponElement);
    });

    if (totalLeechHp > 0) {
      this.playerCurrentHp = Math.min(this.playerMaxHp, this.playerCurrentHp + totalLeechHp);
      this.screenState.totalHpLeeched += totalLeechHp;
    }
    if (totalLeechMana > 0) {
      this.playerCurrentMana = Math.min(this.playerMaxMana, this.playerCurrentMana + totalLeechMana);
      this.screenState.totalManaLeeched += totalLeechMana;
    }

    this.nextAutoAttackAvailableAt = this.currentTickMs + 2000;
    return true;
  }


  /**
   * Determinação Dinâmica de Alvos
   */
  private executeSpellEffect(spell: ISpellDefinition): void {
    if (spell.damageType === 'HEAL') {
      // Cálculo genérico apenas para demonstração de cura
      const healBase = (this.player.level / 5) + (this.player.baseSkill * spell.baseMaxCoef);
      this.log(`[Heal] Player curou ${Math.round(healBase)} HP.`);
      return;
    }

    let targets: IMonsterAI[] = [];
    const boxTargets = this.screenState.activeBox.filter(t => t !== null && t !== 'BLOCKED') as IMonsterAI[];
    
    // MODULE 3: TRUE COMBAT GEOMETRY
    if (spell.aoeRange === 'SINGLE_TARGET') {
      if (boxTargets.length > 0) targets = [boxTargets[0]];
    } else if (spell.aoeRange === 'FRONTAL_CLEAVE') {
      targets = boxTargets.slice(0, 3); // Max 3 targets
    } else if ((spell.aoeRange as string) === 'WAVE') {
      targets = boxTargets.slice(0, 5); // Max 5 targets for Terra/Ice waves
    } else if (spell.aoeRange === 'BOX') {
      targets = [...boxTargets]; // Max 8 targets (implied by box size)
    } else if (spell.aoeRange === 'WIDE') {
      // Wide hits Box + Screen (e.g. Divine Caldera, GFBs, UEs)
      targets = [...boxTargets, ...this.screenState.screenQueue];
    }

    const totalTargets = targets.length;
    let targetCapMultiplier = 1.0;
    if (totalTargets > 5) {
      targetCapMultiplier = Math.max(0.40, 1.0 - ((totalTargets - 5) * 0.10));
    }

    targets.forEach((mob, index) => {
      this.calculateAttackOutput(this.player, spell, mob, index, targetCapMultiplier, false);
    });
  }

  /**
   * MODULE 4: THE ARITHMETIC COMBAT PIPELINE (ORDEM DE MUTACÃO DE DANO)
   * Sequência rigorosa de transformações lineares sem inversão de ordem.
   */
  
  
  /**
   * MODULE 4: ARITHMETIC COMBAT PIPELINE — Fórmula CipSoft-Inspired
   *
   * MELEE AUTO-ATTACK:
   *   min = (skill × weaponAtk / 18) + level/3
   *   max = (skill × weaponAtk / 9)  + level/3
   *   EV  = (min + max) / 2
   *   → EK lv300 skill100 atk50: ~(278+100 + 556+100)/2 ≈ 517 por auto ✓
   *
   * SPELL DAMAGE = base_auto × spell.baseMaxCoef (coef já inclui a diferença de magnitude)
   *
   * ARMOR MITIGATION = target.armor × 0.75  (EV do random(armor/2, armor) da CipSoft)
   *   → Só se aplica em auto-attacks físicos. Spells NÃO sofrem armor.
   *
   * HEALING = (skill × coef × 2.5) + (level / 4)
   */
  private calculateAttackOutput(
    player: IPlayerAttributes,
    spell: ISpellDefinition,
    target: IMonsterAI,
    targetIndex: number,
    targetCapMultiplier: number,
    isAutoAttack: boolean
  ): void {
    const totalSkill   = player.baseSkill + player.equipmentBonusSkill + player.combatBuffBonusSkill;
    const weaponAttack = (player.weapon as any)?.baseAttack ?? 50;
    const levelBonus   = player.level / 3;

    // HEAL branch
    if (spell.damageType === 'HEAL') {
      const healMin = (totalSkill * spell.baseMinCoef * 2.5) + (player.level / 4);
      const healMax = (totalSkill * spell.baseMaxCoef * 2.5) + (player.level / 4);
      let healEV  = Math.round((healMin + healMax) / 2.0);
      healEV *= (this.player.globalHealingMultiplier || 1.0);
      this.playerCurrentHp = Math.min(this.playerMaxHp, this.playerCurrentHp + healEV);
      this.log(`[Heal] ${spell.name}: +${healEV} HP → ${Math.round(this.playerCurrentHp)}/${this.playerMaxHp}`);
      return;
    }

    // ── BASE DAMAGE (EV auto-attack scale) ──
    const minBase = (totalSkill * weaponAttack / 18) + levelBonus;
    const maxBase = (totalSkill * weaponAttack / 9)  + levelBonus;
    let evDmg = ((minBase + maxBase) / 2.0) * spell.baseMaxCoef;

    // Target Cap Falloff
    evDmg *= targetCapMultiplier;

    // Armor mitigation — apenas auto-attack físico
    if (isAutoAttack && spell.damageType === DamageType.PHYSICAL) {
      evDmg = Math.max(0, evDmg - (target.armor * 0.75));
    }

    // Elemental modifier
    const elementMod = target.elementalModifiers[spell.damageType as DamageType] ?? 1.0;
    evDmg *= elementMod;

    // Low Blow Charm
    let effectiveCritChance = player.critChance;
    if (target.activeCharm === 'LOW_BLOW') {
       effectiveCritChance += 0.08;
    }

    // Forge procs (EV isolado por proc)
    evDmg *= 1.0 + (player.forgeOnslaughtChance * 0.60);
    evDmg *= 1.0 + (effectiveCritChance * ((player.critMultiplier || 1.25) - 1.0));
    evDmg *= 1.0 + (player.forgeRuptureChance * 0.20);

    // Wheel bonus
    evDmg *= (1.0 + spell.wheelBonusPct);

    // Proficiency bonus
    evDmg *= 1.0 + (player.weaponProficiencyLevel * 0.02);

    // Global Damage Multiplier (Wheel/Gems)
    evDmg *= (this.player.globalDamageMultiplier || 1.0);

    // CHARMS OFENSIVOS (10% chance = EV de 0.10 multiplicador da ocorrência)
    if (target.activeCharm && target.activeCharm !== 'NONE' && target.activeCharm !== 'DODGE' && target.activeCharm !== 'PARRY' && target.activeCharm !== 'LOW_BLOW') {
      const charmElements: Record<string, DamageType> = {
         'WOUND': DamageType.PHYSICAL,
         'FREEZE': DamageType.ICE,
         'ZAP': DamageType.ENERGY,
         'CURSE': DamageType.DEATH,
         'POISON': DamageType.EARTH,
         'ENFLAME': DamageType.FIRE,
         'DIVINE': DamageType.HOLY
      };
      
      const charmEl = charmElements[target.activeCharm as string];
      if (charmEl) {
         // O Charm trigger ocorre quando se dá dano
         const charmResist = target.elementalModifiers[charmEl] ?? 1.0;
         const charmEvDamage = target.maxHp * 0.05 * 0.10 * charmResist;
         evDmg += charmEvDamage;
      }
    }

    const finalDamage   = Math.round(evDmg);
    const clampedDamage = Math.min(finalDamage, Math.max(0, target.currentHp));
    target.currentHp   -= finalDamage;
    this.screenState.totalDamageDealt += finalDamage;

    // Leech (10% eficácia no 2º+ alvo em AoE)
    const leechEfficacy = targetIndex > 0 ? 0.10 : 1.0;
    
    let effectiveLifeLeech = player.lifeLeechPercent;
    let effectiveManaLeech = player.manaLeechPercent;
    
    if (target.activeCharm === 'VAMPIRIC') effectiveLifeLeech += 0.04;
    if (target.activeCharm === 'VOID') effectiveManaLeech += 0.04;

    if (effectiveLifeLeech > 0) {
      const leeched = clampedDamage * effectiveLifeLeech * leechEfficacy;
      this.screenState.totalHpLeeched += leeched;
      this.playerCurrentHp = Math.min(this.playerMaxHp, this.playerCurrentHp + leeched);
    }
    if (effectiveManaLeech > 0) {
      const leeched = clampedDamage * effectiveManaLeech * leechEfficacy;
      this.screenState.totalManaLeeched += leeched;
      this.playerCurrentMana = Math.min(this.playerMaxMana, this.playerCurrentMana + leeched);
    }

    this.log(`[Combat] ${spell.name} em ${target.name}[${targetIndex}]: ${finalDamage} (${spell.damageType} ×${elementMod}) | HP restante: ${Math.round(target.currentHp)}`);
  }



  /**
   * Gerencia varredura de mortes em tempo real
   */
  private cleanupDeadMonsters(): void {
    const box = this.screenState.activeBox;
    for (let i = 0; i < box.length; i++) {
      const slot = box[i];
      if (slot !== null && slot !== 'BLOCKED') {
        if (slot.currentHp <= 0) {
          this.log(`[Kill] ${slot.name} (Box Slot ${i}) morreu.`);
          box[i] = null;
          this.screenState.deadMonstersCount++;
        } else if (slot.fleeHpPercent && (slot.currentHp / slot.maxHp) <= slot.fleeHpPercent) {
          // FLEEING BEHAVIOR
          this.log(`[AI] ${slot.name} (Box Slot ${i}) is fleeing at low HP!`);
          slot.behaviorState = 'FLEEING';
          slot.combatType = 'RANGED'; // Forces it to act as ranged from now on
          this.screenState.screenQueue.push(slot); // Move to queue
          box[i] = null; // Leaves the box
        }
      }
    }

    const queue = this.screenState.screenQueue;
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i].currentHp <= 0) {
        this.log(`[Kill] ${queue[i].name} (Screen Queue) morreu.`);
        queue.splice(i, 1);
        this.screenState.deadMonstersCount++;
      }
    }
  }

  private log(message: string): void {
    const timestamp = (this.currentTickMs / 1000).toFixed(1);
    this.combatLog.push(`[${timestamp}s] ${message}`);
  }

  /** Retorna true se o player morreu durante a simulação */
  public isPlayerDead(): boolean {
    return this.playerCurrentHp <= 0;
  }

  /** Retorna os vitals atuais do player */
  public getPlayerVitals() {
    return {
      hp: this.playerCurrentHp,
      maxHp: this.playerMaxHp,
      mana: this.playerCurrentMana,
      maxMana: this.playerMaxMana
    };
  }

  public getScreenState(): IScreenState {
    return this.screenState;
  }
}
