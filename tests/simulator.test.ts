import * as assert from 'assert';
import {
  TibiaCombatSimulatorEngine,
  ProgressionManager,
  GeometryManager,
  PipelineManager,
  RotationOptimizer,
  StateSerializer,
  ICharacterSetup,
  IScreenState,
  IWheelNode,
  IMonsterAI,
  IRotationAction
} from '../src/index';

function runTests() {
  console.log('==================================================');
  console.log('   STARTING TIBIA NEXUS COMBAT ENGINE TEST SUITE');
  console.log('==================================================\n');

  testWheelOfDestinyDAG();
  testWeaponProficiencyAndBuffs();
  testGeometryAndHarmony();
  testBestiaryAIAndRepositioning();
  testDamagePipelineLeechAndMitigation();
  testCombatEngineGCDsAndCooldowns();
  testRotationOptimizerAndTelemetry();
  testStateSerialization();

  console.log('\n==================================================');
  console.log('   ALL TIBIA NEXUS ENGINE TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');
}

/**
 * Test Module 2: Wheel of Destiny DAG validation and pruning
 */
function testWheelOfDestinyDAG() {
  console.log('Testing Module 2: Wheel of Destiny Graph validation...');

  const baseNode: IWheelNode = {
    id: 'base_node',
    name: 'Base Stat Node',
    quadrant: 1,
    pointsAllocated: 10,
    maxPoints: 10,
    prerequisites: [],
    perkType: 'PASSIVE_STAT',
    effects: [{ type: 'SKILL_FLAT', target: 'Sword', value: 5 }]
  };

  const childNode: IWheelNode = {
    id: 'child_node',
    name: 'Advanced Conviction Node',
    quadrant: 1,
    pointsAllocated: 5,
    maxPoints: 5,
    prerequisites: ['base_node'],
    perkType: 'CONVICTION',
    effects: [{ type: 'DAMAGE_PCT', value: 2 }]
  };

  const grandChildNode: IWheelNode = {
    id: 'grandchild_node',
    name: 'Supreme Ultimate Node',
    quadrant: 1,
    pointsAllocated: 3,
    maxPoints: 5,
    prerequisites: ['child_node'],
    perkType: 'CONVICTION',
    effects: [{ type: 'HEALING_PCT', value: 3 }]
  };

  // Case A: Full allocation validation
  const nodes = [baseNode, childNode, grandChildNode];
  let validated = ProgressionManager.validateAndFixWheel(nodes, 100);
  
  assert.strictEqual(validated.find(n => n.id === 'base_node')?.pointsAllocated, 10);
  assert.strictEqual(validated.find(n => n.id === 'child_node')?.pointsAllocated, 5);
  assert.strictEqual(validated.find(n => n.id === 'grandchild_node')?.pointsAllocated, 3);
  console.log('  -> Case A: Full allocation is valid. Passed.');

  // Case B: Base node is reduced (violates prereq). Children should recursively reset.
  const modifiedNodes = nodes.map(n => n.id === 'base_node' ? { ...n, pointsAllocated: 5 } : n);
  validated = ProgressionManager.validateAndFixWheel(modifiedNodes, 100);

  assert.strictEqual(validated.find(n => n.id === 'base_node')?.pointsAllocated, 5, 'Base node should keep its 5 points');
  assert.strictEqual(validated.find(n => n.id === 'child_node')?.pointsAllocated, 0, 'Child node must reset because parent is not fully allocated');
  assert.strictEqual(validated.find(n => n.id === 'grandchild_node')?.pointsAllocated, 0, 'Grandchild node must reset because its parent is reset');
  console.log('  -> Case B: Prerequisite failure resets child nodes. Passed.');

  // Case C: Exceeding total points limit (e.g. limit is 12 points, total allocated is 18).
  // Pruning should reset the leaves first (grandchild, then child, then base).
  validated = ProgressionManager.validateAndFixWheel(nodes, 12);
  const totalAllocated = validated.reduce((sum, n) => sum + n.pointsAllocated, 0);
  assert.ok(totalAllocated <= 12, 'Pruning failed to keep points under limit');
  assert.strictEqual(validated.find(n => n.id === 'base_node')?.pointsAllocated, 10, 'Base node should remain');
  assert.strictEqual(validated.find(n => n.id === 'child_node')?.pointsAllocated, 0, 'Child node should have been pruned');
  assert.strictEqual(validated.find(n => n.id === 'grandchild_node')?.pointsAllocated, 0, 'Grandchild node should have been pruned');
  console.log('  -> Case C: Exceeding points limit successfully prunes leaf nodes. Passed.');
}

/**
 * Test Module 2: Weapon proficiency scaling and misc buffs consolidation
 */
function testWeaponProficiencyAndBuffs() {
  console.log('Testing Module 2: Weapon Proficiency and Buff consolidation...');

  const baseSetup: ICharacterSetup = {
    attributes: {
      level: 100,
      vocation: 'Knight',
      baseSkills: { Sword: 100, Axe: 10, Club: 10, Distance: 10, Magic: 5 },
      equipmentBonus: { Sword: 10, Axe: 0, Club: 0, Distance: 0, Magic: 0 },
      temporaryModifiers: {},
      weapon: {
        name: 'Slayer of Destruction',
        archetype: 'MELEE',
        skillType: 'Sword',
        baseAttack: 50,
        element: 'Physical',
        imbuements: []
      }
    },
    wheelNodes: [],
    proficiencies: {
      Sword: 5, // Tier 5 proficiency (+10% base attack multiplier)
      Axe: 0, Club: 0, Distance: 0, Magic: 0
    },
    extraBuffs: {
      podiumOfRenownBonus: 3, // +3 flat skill bonus
      activeTitle: 'Grandmaster', // +2 flat skill bonus
      questBuffs: [{ type: 'skill', value: 1 }] // +1 flat skill bonus
    }
  };

  const consolidated = ProgressionManager.getConsolidatedAttributes(baseSetup);

  // Weapon attack value should be scaled: 50 * (1 + 5 * 0.02) = 55
  assert.strictEqual(consolidated.weapon.baseAttack, 55, 'Weapon Proficiency multiplier not applied correctly');
  
  // Sword skill should be: 100 (base) + 3 (podium) + 2 (title) + 1 (quest) = 106
  assert.strictEqual(consolidated.baseSkills.Sword, 106, 'Flat skill bonuses failed to aggregate in baseSkills');
  
  // Total effective skill should be: 106 (consolidated base) + 10 (equipment bonus) = 116
  const effectiveSkill = PipelineManager.getEffectiveSkill(consolidated, 'Sword');
  assert.strictEqual(effectiveSkill, 116, 'Effective skill calculation failed');
  console.log('  -> Proficiency and Buffs consolidated successfully. Passed.');
}

/**
 * Test Module 3: Player Stance limits and Harmony System
 */
function testGeometryAndHarmony() {
  console.log('Testing Module 3: Stance geometry limits and Harmony system...');

  assert.strictEqual(GeometryManager.getMaxActiveBoxCapacity('OPEN_FIELD'), 8);
  assert.strictEqual(GeometryManager.getMaxActiveBoxCapacity('WALL_BACK'), 5);
  assert.strictEqual(GeometryManager.getMaxActiveBoxCapacity('CORNER_TRAP'), 3);

  // Harmony: active only when stance is WALL_BACK or CORNER_TRAP, and harmony is enabled
  assert.strictEqual(GeometryManager.isHarmonyEffectApplied('OPEN_FIELD', true), false);
  assert.strictEqual(GeometryManager.isHarmonyEffectApplied('WALL_BACK', false), false);
  assert.strictEqual(GeometryManager.isHarmonyEffectApplied('WALL_BACK', true), true);
  assert.strictEqual(GeometryManager.isHarmonyEffectApplied('CORNER_TRAP', true), true);

  // Harmony Damage Mitigation (-8%)
  const damage = 1000;
  assert.strictEqual(GeometryManager.applyHarmonyDamageReceived(damage, 'OPEN_FIELD', true), 1000);
  assert.strictEqual(GeometryManager.applyHarmonyDamageReceived(damage, 'WALL_BACK', true), 920);

  // Harmony Sustain Boost (+10%)
  const heal = 500;
  assert.strictEqual(GeometryManager.applyHarmonySustainBoost(heal, 'OPEN_FIELD', true), 500);
  assert.strictEqual(GeometryManager.applyHarmonySustainBoost(heal, 'CORNER_TRAP', true), 550);

  console.log('  -> Geometry capacities and Harmony mechanics. Passed.');
}

/**
 * Test Module 3: Bestiary AI movements, Runner escaping, and Screen Queue replenishments
 */
function testBestiaryAIAndRepositioning() {
  console.log('Testing Module 3: Bestiary AI (Runner escaping, Box replenishment)...');

  // Create a screen state with a runner and a melee mob
  const runnerMob: IMonsterAI = {
    id: 'runner_1',
    name: 'Orshabaal Minion',
    hp: 10, // 10% of Max HP (100) -> should flee!
    maxHp: 100,
    combatType: 'RUNNER',
    behaviorState: 'NORMAL',
    armor: 10,
    elementalModifiers: { Physical: 1.0, Fire: 1.0, Ice: 1.0, Energy: 1.0, Earth: 1.0, Holy: 1.0, Death: 1.0 },
    charm: 'NONE',
    baseDamagePerTurn: 50,
    damageElement: 'Physical'
  };

  const healthyMelee: IMonsterAI = {
    id: 'melee_1',
    name: 'Demon',
    hp: 8200,
    maxHp: 8200,
    combatType: 'MELEE',
    behaviorState: 'NORMAL',
    armor: 40,
    elementalModifiers: { Physical: 1.0, Fire: 0.0, Ice: 1.0, Energy: 1.0, Earth: 1.0, Holy: 1.2, Death: 0.8 },
    charm: 'WOUND',
    baseDamagePerTurn: 200,
    damageElement: 'Fire'
  };

  const rangedMob: IMonsterAI = {
    id: 'ranged_1',
    name: 'Warlock',
    hp: 3200,
    maxHp: 3200,
    combatType: 'RANGED',
    behaviorState: 'NORMAL',
    armor: 15,
    elementalModifiers: { Physical: 1.0, Fire: 1.0, Ice: 1.0, Energy: 1.0, Earth: 1.0, Holy: 1.0, Death: 1.0 },
    charm: 'NONE',
    baseDamagePerTurn: 150,
    damageElement: 'Energy'
  };

  // Stance CORNER_TRAP: capacity = 3. Active box currently has runnerMob.
  // ScreenQueue has healthyMelee and rangedMob.
  const state: IScreenState = {
    activeBox: [runnerMob],
    screenQueue: [healthyMelee, rangedMob],
    playerStance: 'CORNER_TRAP',
    harmonyActive: true,
    playerHP: 2000,
    playerMaxHP: 2000,
    playerMana: 1000,
    playerMaxMana: 1000,
    hazardLevel: 0
  };

  // In CORNER_TRAP stance, runner is trapped and CANNOT flee.
  let nextState = GeometryManager.processTurnEndGeometry(state);
  assert.strictEqual(nextState.activeBox.length, 2, 'Should have replenished activeBox with 1 MELEE');
  assert.ok(nextState.activeBox.some(m => m.id === 'runner_1'), 'Runner should still be in activeBox (trapped)');
  assert.ok(nextState.activeBox.some(m => m.id === 'melee_1'), 'healthyMelee should have entered activeBox');
  assert.ok(nextState.screenQueue.some(m => m.id === 'ranged_1'), 'Ranged mob should remain in screenQueue');
  console.log('  -> Case A: Runner is trapped in CORNER_TRAP. Replenish pulls MELEE. Passed.');

  // If player stance is WALL_BACK (capacity 5), runner can escape!
  const wallState: IScreenState = {
    ...state,
    playerStance: 'WALL_BACK',
    activeBox: [runnerMob],
    screenQueue: [healthyMelee, rangedMob]
  };

  nextState = GeometryManager.processTurnEndGeometry(wallState);
  // Runner escape should occur.
  // runnerMob: moves to screen queue with behaviorState = FLEEING.
  // healthyMelee: advances into activeBox.
  // activeBox size should be 1 (healthyMelee).
  assert.strictEqual(nextState.activeBox.length, 1, 'Only healthyMelee should remain in activeBox');
  assert.strictEqual(nextState.activeBox[0].id, 'melee_1', 'Demon should be in activeBox');
  assert.strictEqual(nextState.screenQueue.length, 2, 'Runner and Warlock should be in screenQueue');
  const queueRunner = nextState.screenQueue.find(m => m.id === 'runner_1');
  assert.strictEqual(queueRunner?.behaviorState, 'FLEEING', 'Runner behaviorState should be FLEEING');
  console.log('  -> Case B: Runner escapes in WALL_BACK. Replenish replaces it. Passed.');
}

/**
 * Test Module 4: Damage calculations, mitigation, crit/forge scaling, and leech returns
 */
function testDamagePipelineLeechAndMitigation() {
  console.log('Testing Module 4: Mathematical Damage & Leech Pipeline...');

  const player: ICharacterSetup['attributes'] = {
    level: 250,
    vocation: 'Knight',
    baseSkills: { Sword: 110, Axe: 10, Club: 10, Distance: 10, Magic: 10 },
    equipmentBonus: { Sword: 10, Axe: 0, Club: 0, Distance: 0, Magic: 0 },
    temporaryModifiers: { bloodRage: true }, // +35% physical skill and damage
    weapon: {
      name: 'Demonwing Axe',
      archetype: 'MELEE',
      skillType: 'Sword',
      baseAttack: 52,
      element: 'Physical',
      imbuements: [
        { type: 'CRIT', tier: 'POWERFUL', value: 0.25, chance: 0.10 }, // Powerful Strike
        { type: 'LIFE_LEECH', tier: 'POWERFUL', value: 0.25 }, // Powerful Vampirism
        { type: 'MANA_LEECH', tier: 'POWERFUL', value: 0.08 }  // Powerful Void
      ]
    }
  };

  const target: IMonsterAI = {
    id: 'mob_test',
    name: 'Grim Reaper',
    hp: 4000,
    maxHp: 4000,
    combatType: 'MELEE',
    behaviorState: 'NORMAL',
    armor: 60,
    elementalModifiers: { Physical: 1.0, Fire: 1.2, Ice: 0.5, Energy: 1.0, Earth: 1.0, Holy: 1.5, Death: 0.0 },
    charm: 'NONE',
    baseDamagePerTurn: 300,
    damageElement: 'Death'
  };

  const options = { deterministic: true };

  // 1. Skill evaluation with Blood Rage: (110 + 10) * 1.35 = 162
  const skill = PipelineManager.getEffectiveSkill(player, 'Sword');
  assert.strictEqual(skill, 162);

  // 2. Auto-attack base range calculation (expected values)
  const autoAtk = PipelineManager.calculateAutoAttackRaw(player, options);
  assert.strictEqual(autoAtk.element, 'Physical');
  // Formula: Max = 50 (dLevel) + 0.085 * Atk * Skill = 50 + 0.085 * 52 * 162 = 50 + 716.04 = 766
  // Blood Rage physical damage modifier: +35% damage. Max = Math.floor(766 * 1.35) = 1034
  // Avg = (0 + 1034) / 2 = 517
  assert.strictEqual(autoAtk.rawDamage, 517);

  // 3. Mitigation calculations
  // Physical armor absorbs 60 * 0.75 = 45.
  // Net damage: 517 - 45 = 472.
  // Vulnerability to Physical is 1.0. Hazard Level 0.
  const mitigated = PipelineManager.applyMitigation(autoAtk.rawDamage, 'Physical', target, 0, options);
  assert.strictEqual(mitigated, 472);

  // 4. Target density Leech penalty:
  // First target 100%, second 10%
  const dmgAppliedList = [1000, 1000];
  const leech = PipelineManager.calculateLeechReturn(dmgAppliedList, player.weapon, []);
  // Expected Life Leech: (1000 * 0.25 * 1.0) + (1000 * 0.25 * 0.10) = 250 + 25 = 275
  // Expected Mana Leech: (1000 * 0.08 * 1.0) + (1000 * 0.08 * 0.10) = 80 + 8 = 88
  assert.strictEqual(leech.lifeLeeched, 275);
  assert.strictEqual(leech.manaLeeched, 88);

  console.log('  -> Pipeline damage, mitigation, and leech metrics. Passed.');
}

/**
 * Test Module 1: Cooldowns and GCDs validation in the simulation engine
 */
function testCombatEngineGCDsAndCooldowns() {
  console.log('Testing Module 1: Clock ticks, individual cooldowns, and GCD windows...');

  const setup: ICharacterSetup = {
    attributes: {
      level: 150,
      vocation: 'Knight',
      baseSkills: { Sword: 90, Axe: 10, Club: 10, Distance: 10, Magic: 10 },
      equipmentBonus: { Sword: 0, Axe: 0, Club: 0, Distance: 0, Magic: 0 },
      temporaryModifiers: {},
      weapon: {
        name: 'Sword',
        archetype: 'MELEE',
        skillType: 'Sword',
        baseAttack: 40,
        element: 'Physical',
        imbuements: []
      }
    },
    wheelNodes: [],
    proficiencies: { Sword: 0, Axe: 0, Club: 0, Distance: 0, Magic: 0 },
    extraBuffs: {}
  };

  const initialScreenState: IScreenState = {
    activeBox: [],
    screenQueue: [],
    playerStance: 'OPEN_FIELD',
    harmonyActive: false,
    playerHP: 1000,
    playerMaxHP: 1000,
    playerMana: 2000,
    playerMaxMana: 2000,
    hazardLevel: 0
  };

  // Case A: Violation of Combat Spell GCD (casting two combat spells at the same tick)
  const invalidGCDRotation: IRotationAction[] = [
    { tick: 0, type: 'SPELL', name: 'Exori' },
    { tick: 10, type: 'SPELL', name: 'Exori Gran' } // 1.0s = 10 ticks after, but Combat GCD is 2.0s (20 ticks)!
  ];

  assert.throws(() => {
    TibiaCombatSimulatorEngine.runSimulation(setup, initialScreenState, invalidGCDRotation, 100);
  }, /GCD violation/, 'Failed to catch Combat GCD group violation');

  // Case B: Violation of individual cooldowns (casting Exori again after only 2.0s; cooldown is 4.0s)
  const invalidIndividualCooldownRotation: IRotationAction[] = [
    { tick: 0, type: 'SPELL', name: 'Exori' },
    { tick: 20, type: 'SPELL', name: 'Exori' } // 2.0s = 20 ticks later, but Exori cooldown is 40 ticks (4.0s)!
  ];

  assert.throws(() => {
    TibiaCombatSimulatorEngine.runSimulation(setup, initialScreenState, invalidIndividualCooldownRotation, 100);
  }, /on individual cooldown/, 'Failed to catch individual cooldown violation');

  // Case C: Valid rotation: Exori (0) -> Exori Gran (20) -> Exori (40).
  // Also casts healing spell Exura Med Ico at tick 0 and tick 10 (cooldown 10 ticks).
  const validRotation: IRotationAction[] = [
    { tick: 0, type: 'SPELL', name: 'Exori' },
    { tick: 0, type: 'SPELL', name: 'Exura Med Ico' },
    { tick: 10, type: 'SPELL', name: 'Exura Med Ico' },
    { tick: 20, type: 'SPELL', name: 'Exori Gran' },
    { tick: 40, type: 'SPELL', name: 'Exori' }
  ];

  // Should execute without throwing errors
  const report = TibiaCombatSimulatorEngine.runSimulation(setup, initialScreenState, validRotation, 50);
  assert.ok(report.events.length > 0, 'No events captured in simulation report');
  console.log('  -> GCDs and Cooldown restrictions correctly enforced. Passed.');
}

/**
 * Test Module 5: Heuristic 10-turn Rotation Optimizer and Telemetry Analysis
 */
function testRotationOptimizerAndTelemetry() {
  console.log('Testing Module 5: 10-turn Rotation Optimizer and Telemetry reporting...');

  const setup: ICharacterSetup = {
    attributes: {
      level: 300,
      vocation: 'Knight',
      baseSkills: { Sword: 110, Axe: 10, Club: 10, Distance: 10, Magic: 12 },
      equipmentBonus: { Sword: 8, Axe: 0, Club: 0, Distance: 0, Magic: 0 },
      temporaryModifiers: { bloodRage: true },
      weapon: {
        name: 'Soulcutter',
        archetype: 'MELEE',
        skillType: 'Sword',
        baseAttack: 53,
        element: 'Physical',
        imbuements: [
          { type: 'CRIT', tier: 'POWERFUL', value: 0.25, chance: 0.10 },
          { type: 'LIFE_LEECH', tier: 'POWERFUL', value: 0.25 },
          { type: 'MANA_LEECH', tier: 'POWERFUL', value: 0.08 }
        ]
      }
    },
    wheelNodes: [],
    proficiencies: { Sword: 3, Axe: 0, Club: 0, Distance: 0, Magic: 0 },
    extraBuffs: {}
  };

  // Set up a combat screen with 4 demons in active box and 2 warlocks in screen queue
  const demon: IMonsterAI = {
    id: 'd1', name: 'Demon', hp: 8200, maxHp: 8200, combatType: 'MELEE', behaviorState: 'NORMAL', armor: 40,
    elementalModifiers: { Physical: 1.0, Fire: 0.0, Ice: 1.0, Energy: 1.0, Earth: 1.0, Holy: 1.2, Death: 0.8 },
    charm: 'WOUND', baseDamagePerTurn: 180, damageElement: 'Fire'
  };

  const warlock: IMonsterAI = {
    id: 'w1', name: 'Warlock', hp: 3200, maxHp: 3200, combatType: 'RANGED', behaviorState: 'NORMAL', armor: 15,
    elementalModifiers: { Physical: 1.0, Fire: 1.0, Ice: 1.0, Energy: 1.0, Earth: 1.0, Holy: 1.0, Death: 1.0 },
    charm: 'NONE', baseDamagePerTurn: 120, damageElement: 'Energy'
  };

  const initialScreenState: IScreenState = {
    activeBox: [
      { ...demon, id: 'd1' },
      { ...demon, id: 'd2' },
      { ...demon, id: 'd3' },
      { ...demon, id: 'd4' }
    ],
    screenQueue: [
      { ...warlock, id: 'w1' },
      { ...warlock, id: 'w2' }
    ],
    playerStance: 'WALL_BACK', // capacity 5
    harmonyActive: true,
    playerHP: 4000,
    playerMaxHP: 5000,
    playerMana: 1000,
    playerMaxMana: 2000,
    hazardLevel: 2
  };

  const result = RotationOptimizer.optimizeRotation(setup, initialScreenState);

  assert.ok(result.rotation.length > 0, 'Optimizer failed to output any actions');
  assert.ok(result.report.dps > 0, 'Report DPS should be greater than 0');
  assert.ok(result.report.estimatedXPHour > 0, 'Report estimated XP should be greater than 0');
  
  console.log(`  -> Generated ${result.rotation.length} rotation actions.`);
  console.log(`  -> Simulation DPS: ${Math.round(result.report.dps)} | HPS: ${Math.round(result.report.hps)}`);
  console.log(`  -> Estimated XP/h: ${(result.report.estimatedXPHour / 1000000).toFixed(2)}M/h | Gold: ${Math.round(result.report.estimatedGoldHour / 1000)}k/h`);
  console.log('  -> Rotation Optimizer and Telemetry validation. Passed.');
}

/**
 * Test Module 5: Compressed URL-safe Base64 State Serialization
 */
function testStateSerialization() {
  console.log('Testing Module 5: State Serialization/Deserialization...');

  const originalState = {
    level: 300,
    vocation: 'Knight',
    stance: 'WALL_BACK',
    activeSpells: ['Exori Gran', 'Exori', 'Exori Min'],
    boxCapacity: 5
  };

  const serialized = StateSerializer.serialize(originalState);
  assert.strictEqual(typeof serialized, 'string', 'Serialized output must be a string');
  assert.ok(!serialized.includes('+') && !serialized.includes('/') && !serialized.includes('='), 'Serialized output contains non-URL-safe characters');

  const deserialized = StateSerializer.deserialize(serialized);
  assert.deepStrictEqual(deserialized, originalState, 'Deserialized state does not match original state');

  console.log(`  -> Serialized String: ${serialized}`);
  console.log('  -> State serialization and decompression. Passed.');
}

// Run tests
runTests();
