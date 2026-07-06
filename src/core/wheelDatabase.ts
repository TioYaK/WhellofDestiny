import { IWheelNode, Quadrant, NodeType } from '../types/combat';

export function getVocationDefaultWheelNodes(vocation: string): IWheelNode[] {
  const v = vocation.toUpperCase();
  switch (v) {
    case 'KNIGHT':   return buildKnightWheel();
    case 'PALADIN':  return buildPaladinWheel();
    case 'SORCERER': return buildSorcererWheel();
    case 'DRUID':    return buildDruidWheel();
    default:         return buildKnightWheel();
  }
}

// ────────────────────────── GEOMETRY HELPERS ──────────────────────────────────
const Q = Quadrant;
const N = NodeType;

function baseAngle(q: Quadrant): number {
  return { [Q.NORTH_EAST]: 315, [Q.NORTH_WEST]: 225, [Q.SOUTH_WEST]: 135, [Q.SOUTH_EAST]: 45 }[q];
}
function cwOf(q: Quadrant): Quadrant {
  return { [Q.NORTH_EAST]: Q.SOUTH_EAST, [Q.SOUTH_EAST]: Q.SOUTH_WEST, [Q.SOUTH_WEST]: Q.NORTH_WEST, [Q.NORTH_WEST]: Q.NORTH_EAST }[q];
}
function ccwOf(q: Quadrant): Quadrant {
  return { [Q.NORTH_EAST]: Q.NORTH_WEST, [Q.NORTH_WEST]: Q.SOUTH_WEST, [Q.SOUTH_WEST]: Q.SOUTH_EAST, [Q.SOUTH_EAST]: Q.NORTH_EAST }[q];
}

type QDef = {
  t1:  { name: string; effects: any[] };
  t2L: { name: string; effects: any[] };
  t2R: { name: string; effects: any[] };
  t3L: { name: string; effects: any[] };
  t3C: { name: string; effects: any[] };
  t3R: { name: string; effects: any[] };
  t4L: { name: string; effects: any[] };
  t4R: { name: string; effects: any[] };
  t5:  { name: string; effects: any[] };
};

function buildWheel(defs: Record<Quadrant, QDef>): IWheelNode[] {
  const nodes: IWheelNode[] = [];

  Object.entries(defs).forEach(([q, d]) => {
    const quad = q as Quadrant;
    const cw   = cwOf(quad);
    const ccw  = ccwOf(quad);
    const ba   = baseAngle(quad);

    const t1Id  = `${quad}_t1`;
    const t2L   = `${quad}_t2_L`;
    const t2R   = `${quad}_t2_R`;
    const t3L   = `${quad}_t3_L`;
    const t3C   = `${quad}_t3_C`;
    const t3R   = `${quad}_t3_R`;
    const t4L   = `${quad}_t4_L`;
    const t4R   = `${quad}_t4_R`;
    const t5    = `${quad}_t5`;

    const push = (id: string, name: string, tier: 1|2|3, nodeType: NodeType, maxPts: number, effects: any[], parents: string[], angle: number, radius: number) => {
      nodes.push({ id, name, quadrant: quad, tier, nodeType, maxPoints: maxPts, currentPoints: 0, effects, parentNodes: parents, uiPosition: { angle, radius } });
    };

    // T1 — Root Dedication
    push(t1Id, d.t1.name, 1, N.DEDO, 50, d.t1.effects, [], ba, 45);
    // T2 — Conviction Bifurcation
    push(t2L, d.t2L.name, 2, N.PERK, 75, d.t2L.effects, [t1Id, `${ccw}_t2_R`], ba - 22.5, 90);
    push(t2R, d.t2R.name, 2, N.PERK, 75, d.t2R.effects, [t1Id, `${cw}_t2_L`],  ba + 22.5, 90);
    // T3 — Wide Arc (Lateral ring bridges)
    push(t3L, d.t3L.name, 1, N.DEDO, 100, d.t3L.effects, [t2L, t3C, `${ccw}_t3_R`], ba - 30, 135);
    push(t3C, d.t3C.name, 3, N.CONVICTION, 100, d.t3C.effects, [t2L, t2R, t3L, t3R], ba, 135);
    push(t3R, d.t3R.name, 1, N.DEDO, 100, d.t3R.effects, [t2R, t3C, `${cw}_t3_L`],  ba + 30, 135);
    // T4 — Convergence
    push(t4L, d.t4L.name, 2, N.PERK, 150, d.t4L.effects, [t3L, t3C, `${ccw}_t4_R`, t4R], ba - 15, 180);
    push(t4R, d.t4R.name, 2, N.PERK, 150, d.t4R.effects, [t3R, t3C, `${cw}_t4_L`,  t4L], ba + 15, 180);
    // T5 — Crown
    push(t5, d.t5.name, 3, N.CONVICTION, 200, d.t5.effects, [t4L, t4R], ba, 225);
  });

  return nodes;
}


// ═══════════════════════════════════════════════════════════════════════════════
// KNIGHT WHEEL
// NE = Avatar of Steel (Offensive / Damage)
// NW = Battle Mastermind (Defense / HP)
// SW = Wound Cleansing (Healing / Recovery)
// SE = Battle Instinct (Sustain / Leech)
// ═══════════════════════════════════════════════════════════════════════════════
function buildKnightWheel(): IWheelNode[] {
  return buildWheel({
    [Q.NORTH_EAST]: {
      t1:  { name: 'NE Dedication — +HP',          effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',   value: 1 }] },
      t2L: { name: 'Augmented Berserk',             effects: [{ effectType:'SPELL_AUG', targetSpell:'Berserk',      value: 0.06 }] },
      t2R: { name: 'Augmented Annihilation',        effects: [{ effectType:'SPELL_AUG', targetSpell:'Annihilation', value: 0.06 }] },
      t3L: { name: 'NE Dedication — +Sword Skill', effects: [{ effectType:'FLAT_ADD', targetSkill:'SWORD', value: 1 }] },
      t3C: { name: 'Avatar of Steel Boost',         effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'NE Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',   value: 2 }] },
      t4L: { name: 'Avatar of Steel (Stage 2)',      effects: [{ effectType:'PERCENT_MULT', value: 0.08 }] },
      t4R: { name: '+Life Leech (0.75%)',            effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_LIFE', value: 0.0075 }] },
      t5:  { name: 'Avatar of Steel (Crown)',        effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
    [Q.NORTH_WEST]: {
      t1:  { name: 'NW Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',  value: 1 }] },
      t2L: { name: '+Capacity',                     effects: [{ effectType:'FLAT_ADD', targetSkill:'CAP', value: 200 }] },
      t2R: { name: '+Axe/Club Skill',               effects: [{ effectType:'FLAT_ADD', targetSkill:'AXE', value: 3 }] },
      t3L: { name: 'NW Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',  value: 2 }] },
      t3C: { name: 'Mitigation Multiplier',         effects: [{ effectType:'PERCENT_MULT', value: 0.03 }] },
      t3R: { name: 'NW Dedication — +Sword Skill', effects: [{ effectType:'FLAT_ADD', targetSkill:'SWORD', value: 1 }] },
      t4L: { name: 'Vessel Resonance NW',           effects: [{ effectType:'PERCENT_MULT', value: 0.06 }] },
      t4R: { name: '+Capacity (150)',               effects: [{ effectType:'FLAT_ADD', targetSkill:'CAP', value: 150 }] },
      t5:  { name: 'Gift of Life — Knight',         effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
    [Q.SOUTH_WEST]: {
      t1:  { name: 'SW Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t2L: { name: 'Augmented Wound Cleansing',     effects: [{ effectType:'SPELL_AUG', targetSpell:'Wound Cleansing',         value: 0.06 }] },
      t2R: { name: 'Augmented Int. Wound Cleansing',effects: [{ effectType:'SPELL_AUG', targetSpell:'Intense Wound Cleansing', value: 0.06 }] },
      t3L: { name: 'SW Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t3C: { name: 'Healing Boost',                 effects: [{ effectType:'PERCENT_MULT', value: 0.04 }] },
      t3R: { name: 'SW Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',   value: 1 }] },
      t4L: { name: '+Mana Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t4R: { name: 'Augmented Exura Med Ico',       effects: [{ effectType:'SPELL_AUG', targetSpell:'Exura Med Ico', value: 0.08 }] },
      t5:  { name: 'Battle Instinct — Knight',      effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
    [Q.SOUTH_EAST]: {
      t1:  { name: 'SE Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',  value: 1 }] },
      t2L: { name: '+Life Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_LIFE', value: 0.0075 }] },
      t2R: { name: 'Augmented Exori',               effects: [{ effectType:'SPELL_AUG', targetSpell:'Exori', value: 0.06 }] },
      t3L: { name: 'SE Dedication — +Sword Skill', effects: [{ effectType:'FLAT_ADD', targetSkill:'SWORD', value: 1 }] },
      t3C: { name: 'Vessel Resonance SE',           effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'SE Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',   value: 2 }] },
      t4L: { name: 'Augmented Exori Gran',          effects: [{ effectType:'SPELL_AUG', targetSpell:'Exori Gran', value: 0.06 }] },
      t4R: { name: '+Mana Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t5:  { name: 'Avatar of Steel — Alt',         effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// PALADIN WHEEL
// NE = Divine Emblem (Holy / Damage)
// NW = Battle Mastermind (Distance / Arrow)
// SW = Salvation (Healing)
// SE = Sharpshooter (Sustain)
// ═══════════════════════════════════════════════════════════════════════════════
function buildPaladinWheel(): IWheelNode[] {
  return buildWheel({
    [Q.NORTH_EAST]: {
      t1:  { name: 'NE Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',       value: 1 }] },
      t2L: { name: 'Augmented Divine Caldera',      effects: [{ effectType:'SPELL_AUG', targetSpell:'Divine Caldera', value: 0.06 }] },
      t2R: { name: '+Distance Skill',               effects: [{ effectType:'FLAT_ADD', targetSkill:'DISTANCE', value: 3 }] },
      t3L: { name: 'NE Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',       value: 2 }] },
      t3C: { name: 'Avatar of Light Boost',         effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'NE Dedication — +Distance',    effects: [{ effectType:'FLAT_ADD', targetSkill:'DISTANCE',  value: 1 }] },
      t4L: { name: 'Vessel Resonance NE',           effects: [{ effectType:'PERCENT_MULT', value: 0.06 }] },
      t4R: { name: '+Life Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_LIFE', value: 0.0075 }] },
      t5:  { name: 'Avatar of Light (Crown)',       effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
    [Q.NORTH_WEST]: {
      t1:  { name: 'NW Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',       value: 1 }] },
      t2L: { name: '+Capacity',                     effects: [{ effectType:'FLAT_ADD', targetSkill:'CAP',      value: 200 }] },
      t2R: { name: 'Augmented Divine Missile',      effects: [{ effectType:'SPELL_AUG', targetSpell:'Divine Missile', value: 0.06 }] },
      t3L: { name: 'NW Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',       value: 2 }] },
      t3C: { name: 'Mitigation Multiplier',         effects: [{ effectType:'PERCENT_MULT', value: 0.03 }] },
      t3R: { name: 'NW Dedication — +Distance',    effects: [{ effectType:'FLAT_ADD', targetSkill:'DISTANCE',  value: 1 }] },
      t4L: { name: 'Augmented Eternal Winter',      effects: [{ effectType:'SPELL_AUG', targetSpell:'Eternal Winter', value: 0.06 }] },
      t4R: { name: 'Vessel Resonance NW',           effects: [{ effectType:'PERCENT_MULT', value: 0.06 }] },
      t5:  { name: 'Gift of Life — Paladin',        effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
    [Q.SOUTH_WEST]: {
      t1:  { name: 'SW Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',     value: 2 }] },
      t2L: { name: 'Augmented Exura Gran San',      effects: [{ effectType:'SPELL_AUG', targetSpell:'Exura Gran San', value: 0.06 }] },
      t2R: { name: 'Augmented Salvation',           effects: [{ effectType:'SPELL_AUG', targetSpell:'Salvation',     value: 0.06 }] },
      t3L: { name: 'SW Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',     value: 2 }] },
      t3C: { name: 'Healing Boost',                 effects: [{ effectType:'PERCENT_MULT', value: 0.04 }] },
      t3R: { name: 'SW Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',       value: 1 }] },
      t4L: { name: '+Mana Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t4R: { name: 'Augmented Exura San',           effects: [{ effectType:'SPELL_AUG', targetSpell:'Exura San', value: 0.08 }] },
      t5:  { name: 'Divine Empowerment (Crown)',    effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
    [Q.SOUTH_EAST]: {
      t1:  { name: 'SE Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',       value: 1 }] },
      t2L: { name: '+Life Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_LIFE', value: 0.0075 }] },
      t2R: { name: 'Augmented Divine Dazzle',       effects: [{ effectType:'SPELL_AUG', targetSpell:'Divine Dazzle', value: 0.06 }] },
      t3L: { name: 'SE Dedication — +Distance',    effects: [{ effectType:'FLAT_ADD', targetSkill:'DISTANCE',  value: 1 }] },
      t3C: { name: 'Vessel Resonance SE',           effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'SE Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',       value: 2 }] },
      t4L: { name: '+Mana Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t4R: { name: 'Augmented Swift Aim',           effects: [{ effectType:'SPELL_AUG', targetSpell:'Swift Aim', value: 0.08 }] },
      t5:  { name: 'Battle Instinct — Paladin',     effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// SORCERER WHEEL
// NE = Energy / Firestorm (Damage)
// NW = Magic Level / Mana
// SW = Magic Shield / Sustain
// SE = Vessel Resonance / Critical
// ═══════════════════════════════════════════════════════════════════════════════
function buildSorcererWheel(): IWheelNode[] {
  return buildWheel({
    [Q.NORTH_EAST]: {
      t1:  { name: 'NE Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t2L: { name: 'Augmented Energy Wave',         effects: [{ effectType:'SPELL_AUG', targetSpell:'Energy Wave',         value: 0.06 }] },
      t2R: { name: 'Augmented Exevo Gran Mas Vis',  effects: [{ effectType:'SPELL_AUG', targetSpell:'Exevo Gran Mas Vis',  value: 0.06 }] },
      t3L: { name: 'NE Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t3C: { name: 'Avatar of Storm Boost',         effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'NE Dedication — +Magic Lvl',   effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t4L: { name: 'Vessel Resonance NE',           effects: [{ effectType:'PERCENT_MULT', value: 0.06 }] },
      t4R: { name: 'Augmented Fire Wave',           effects: [{ effectType:'SPELL_AUG', targetSpell:'Fire Wave', value: 0.06 }] },
      t5:  { name: 'Avatar of Storm (Crown)',       effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
    [Q.NORTH_WEST]: {
      t1:  { name: 'NW Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t2L: { name: '+Magic Level Boost',            effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t2R: { name: '+Capacity',                     effects: [{ effectType:'FLAT_ADD', targetSkill:'CAP',   value: 200 }] },
      t3L: { name: 'NW Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t3C: { name: 'Mitigation Multiplier',         effects: [{ effectType:'PERCENT_MULT', value: 0.03 }] },
      t3R: { name: 'NW Dedication — +Magic Lvl',   effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t4L: { name: 'Augmented Exevo Gran Mas Flam', effects: [{ effectType:'SPELL_AUG', targetSpell:'Exevo Gran Mas Flam', value: 0.06 }] },
      t4R: { name: 'Vessel Resonance NW',           effects: [{ effectType:'PERCENT_MULT', value: 0.06 }] },
      t5:  { name: 'Gift of Life — Sorcerer',       effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
    [Q.SOUTH_WEST]: {
      t1:  { name: 'SW Dedication — +HP',           effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',   value: 1 }] },
      t2L: { name: 'Augmented Exura Vita',          effects: [{ effectType:'SPELL_AUG', targetSpell:'Exura Vita', value: 0.06 }] },
      t2R: { name: 'Augmented Magic Shield',        effects: [{ effectType:'SPELL_AUG', targetSpell:'Magic Shield', value: 0.06 }] },
      t3L: { name: 'SW Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t3C: { name: 'Healing Boost',                 effects: [{ effectType:'PERCENT_MULT', value: 0.04 }] },
      t3R: { name: 'SW Dedication — +Magic Lvl',   effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t4L: { name: '+Mana Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t4R: { name: 'Augmented Thunderstorm Rune',   effects: [{ effectType:'SPELL_AUG', targetSpell:'Thunderstorm Rune', value: 0.08 }] },
      t5:  { name: 'Divine Empowerment — Sorc',     effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
    [Q.SOUTH_EAST]: {
      t1:  { name: 'SE Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t2L: { name: 'Augmented Exori Vis',           effects: [{ effectType:'SPELL_AUG', targetSpell:'Exori Vis', value: 0.06 }] },
      t2R: { name: '+0.75% Life Leech',             effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_LIFE', value: 0.0075 }] },
      t3L: { name: 'SE Dedication — +Magic Lvl',   effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t3C: { name: 'Vessel Resonance SE',           effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'SE Dedication — +Mana',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t4L: { name: '+Mana Leech (0.75%)',           effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t4R: { name: 'Augmented Sudden Death Rune',   effects: [{ effectType:'SPELL_AUG', targetSpell:'Sudden Death Rune', value: 0.08 }] },
      t5:  { name: 'Battle Instinct — Sorc',        effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// DRUID WHEEL
// NE = Heal Friend / Ice Wave / Vessel Resonance (as described by user)
// NW = Gift of Life / Nature's Embrace
// SW = Terra / Earth damage
// SE = Strong Ice Wave / Mana / Leech
// ═══════════════════════════════════════════════════════════════════════════════
function buildDruidWheel(): IWheelNode[] {
  return buildWheel({
    [Q.NORTH_EAST]: {
      // Per user: "NE Druid: 0% Mitigation Multiplier, Augmented Strong Ice Wave +6%, +0 Capacity,
      //   Vessel Resonance Top Right, +0.75% Life Leech, +1 Magic Skill Boost,
      //   Augmented Heal Friend +4/+6%, Vessel Resonance Top Right"
      t1:  { name: 'NE Dedication — +Mana',              effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t2L: { name: 'Augmented Strong Ice Wave (+6%)',     effects: [{ effectType:'SPELL_AUG', targetSpell:'Ice Wave', value: 0.06 }] },
      t2R: { name: 'Vessel Resonance (Top Right)',        effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3L: { name: 'NE Dedication — +Capacity',          effects: [{ effectType:'FLAT_ADD', targetSkill:'CAP',   value: 3 }] },
      t3C: { name: '+0.75% Life Leech',                  effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_LIFE', value: 0.0075 }] },
      t3R: { name: 'NE Dedication — +Mana',              effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA',  value: 2 }] },
      t4L: { name: '+1 Magic Skill Boost',               effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t4R: { name: 'Augmented Heal Friend (+4/+6%)',      effects: [{ effectType:'SPELL_AUG', targetSpell:'Exura Sio', value: 0.06 }] },
      t5:  { name: 'Vessel Resonance (Crown NE)',         effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
    [Q.NORTH_WEST]: {
      t1:  { name: 'NW Dedication — +HP',                effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',   value: 1 }] },
      t2L: { name: 'Augmented Nature\'s Embrace',        effects: [{ effectType:'SPELL_AUG', targetSpell:"Nature's Embrace", value: 0.06 }] },
      t2R: { name: '+Magic Level Boost',                 effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t3L: { name: 'NW Dedication — +HP',                effects: [{ effectType:'FLAT_ADD', targetSkill:'HP',   value: 2 }] },
      t3C: { name: 'Mitigation Multiplier',              effects: [{ effectType:'PERCENT_MULT', value: 0.03 }] },
      t3R: { name: 'NW Dedication — +Mana',              effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t4L: { name: 'Vessel Resonance NW',                effects: [{ effectType:'PERCENT_MULT', value: 0.06 }] },
      t4R: { name: 'Augmented Exura Vita (Druid)',        effects: [{ effectType:'SPELL_AUG', targetSpell:'Exura Vita', value: 0.06 }] },
      t5:  { name: 'Gift of Life — Druid (Crown)',        effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
    [Q.SOUTH_WEST]: {
      t1:  { name: 'SW Dedication — +Mana',              effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t2L: { name: 'Augmented Terra Wave',               effects: [{ effectType:'SPELL_AUG', targetSpell:'Terra Wave', value: 0.06 }] },
      t2R: { name: 'Augmented Exevo Gran Mas Tera',       effects: [{ effectType:'SPELL_AUG', targetSpell:'Exevo Gran Mas Tera', value: 0.06 }] },
      t3L: { name: 'SW Dedication — +Mana',              effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t3C: { name: 'Damage Boost (Earth)',               effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'SW Dedication — +Magic Lvl',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t4L: { name: '+Mana Leech (0.75%)',                effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t4R: { name: 'Vessel Resonance SW',                effects: [{ effectType:'PERCENT_MULT', value: 0.06 }] },
      t5:  { name: 'Avatar of Nature (Crown SW)',         effects: [{ effectType:'PERCENT_MULT', value: 0.15 }] },
    },
    [Q.SOUTH_EAST]: {
      t1:  { name: 'SE Dedication — +Mana',              effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t2L: { name: 'Augmented Ice Wave',                 effects: [{ effectType:'SPELL_AUG', targetSpell:'Ice Wave', value: 0.08 }] },
      t2R: { name: '+0.75% Life Leech',                  effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_LIFE', value: 0.0075 }] },
      t3L: { name: 'SE Dedication — +Magic Lvl',         effects: [{ effectType:'FLAT_ADD', targetSkill:'MAGIC', value: 1 }] },
      t3C: { name: 'Vessel Resonance SE',                effects: [{ effectType:'PERCENT_MULT', value: 0.05 }] },
      t3R: { name: 'SE Dedication — +Mana',              effects: [{ effectType:'FLAT_ADD', targetSkill:'MANA', value: 2 }] },
      t4L: { name: 'Augmented Exevo Gran Mas Frigo',      effects: [{ effectType:'SPELL_AUG', targetSpell:'Exevo Gran Mas Frigo', value: 0.06 }] },
      t4R: { name: '+Mana Leech (0.75%)',                effects: [{ effectType:'FLAT_ADD', targetSkill:'LEECH_MANA', value: 0.0075 }] },
      t5:  { name: 'Battle Instinct — Druid',            effects: [{ effectType:'PERCENT_MULT', value: 0.12 }] },
    },
  });
}
