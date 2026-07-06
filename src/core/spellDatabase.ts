import { DamageType } from '../types/combat';

export interface ISpellDefinition {
  name: string;
  manaCost: number;
  group: 'COMBAT' | 'HEALING' | 'SUPPORT';
  cooldownMs: number;
  baseMinCoef: number;
  baseMaxCoef: number;
  damageType: DamageType | 'HEAL';
  aoeRange: 'SINGLE_TARGET' | 'FRONTAL_CLEAVE' | 'WAVE' | 'BOX' | 'WIDE';
  wheelBonusPct: number;
}

export const SPELL_DATABASE: Record<string, ISpellDefinition> = {
  // ─── GENERAL RUNES ────────────────────────────────────────────────────────
  'Avalanche Rune':      { name: 'Avalanche Rune',      manaCost: 0,   group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.4, baseMaxCoef: 2.2, damageType: DamageType.ICE, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Great Fireball Rune': { name: 'Great Fireball Rune', manaCost: 0,   group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.4, baseMaxCoef: 2.2, damageType: DamageType.FIRE, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Thunderstorm Rune':   { name: 'Thunderstorm Rune',   manaCost: 0,   group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.4, baseMaxCoef: 2.2, damageType: DamageType.ENERGY, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Stone Shower Rune':   { name: 'Stone Shower Rune',   manaCost: 0,   group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.4, baseMaxCoef: 2.2, damageType: DamageType.EARTH, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Sudden Death Rune':   { name: 'Sudden Death Rune',   manaCost: 0,   group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 4.5, baseMaxCoef: 7.4, damageType: DamageType.DEATH, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },

  // ─── KNIGHT ──────────────────────────────────────────────────────────────
  'Exori':          { name: 'Exori',          manaCost: 115, group: 'COMBAT',  cooldownMs: 4000, baseMinCoef: 1.0, baseMaxCoef: 1.8, damageType: DamageType.PHYSICAL, aoeRange: 'BOX', wheelBonusPct: 0 },
  'Exori Gran':     { name: 'Exori Gran',     manaCost: 340, group: 'COMBAT',  cooldownMs: 4000, baseMinCoef: 2.0, baseMaxCoef: 3.2, damageType: DamageType.PHYSICAL, aoeRange: 'BOX', wheelBonusPct: 0 },
  'Exori Min':      { name: 'Exori Min',      manaCost: 200, group: 'COMBAT',  cooldownMs: 6000, baseMinCoef: 1.2, baseMaxCoef: 2.2, damageType: DamageType.PHYSICAL, aoeRange: 'FRONTAL_CLEAVE', wheelBonusPct: 0 },
  'Exori Mas':      { name: 'Exori Mas',      manaCost: 160, group: 'COMBAT',  cooldownMs: 8000, baseMinCoef: 0.8, baseMaxCoef: 1.4, damageType: DamageType.PHYSICAL, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Exori Ico':      { name: 'Exori Ico',      manaCost: 40,  group: 'COMBAT',  cooldownMs: 2000, baseMinCoef: 0.8, baseMaxCoef: 1.4, damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exori Con':      { name: 'Exori Con',      manaCost: 75,  group: 'COMBAT',  cooldownMs: 2000, baseMinCoef: 1.0, baseMaxCoef: 1.6, damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Berserk':        { name: 'Berserk',        manaCost: 115, group: 'COMBAT',  cooldownMs: 4000, baseMinCoef: 0.8, baseMaxCoef: 1.6, damageType: DamageType.PHYSICAL, aoeRange: 'BOX', wheelBonusPct: 0 },
  'Annihilation':   { name: 'Annihilation',   manaCost: 200, group: 'COMBAT',  cooldownMs: 6000, baseMinCoef: 3.0, baseMaxCoef: 5.0, damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exura Med Ico':  { name: 'Exura Med Ico',  manaCost: 90,  group: 'HEALING', cooldownMs: 1000, baseMinCoef: 1.5, baseMaxCoef: 2.5, damageType: 'HEAL',            aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Wound Cleansing':{ name: 'Wound Cleansing',manaCost: 170, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 3.0, baseMaxCoef: 5.0, damageType: 'HEAL',            aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Intense Wound Cleansing': { name: 'Intense Wound Cleansing', manaCost: 250, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 4.5, baseMaxCoef: 7.0, damageType: 'HEAL', aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Blood Rage':     { name: 'Blood Rage',     manaCost: 290, group: 'SUPPORT', cooldownMs: 30000,baseMinCoef: 0,   baseMaxCoef: 0,   damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Swift Foot':     { name: 'Swift Foot',     manaCost: 400, group: 'SUPPORT', cooldownMs: 30000,baseMinCoef: 0,   baseMaxCoef: 0,   damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },

  // ─── PALADIN ─────────────────────────────────────────────────────────────
  'Exevo Mas San':  { name: 'Exevo Mas San',  manaCost: 160, group: 'COMBAT',  cooldownMs: 4000, baseMinCoef: 1.0, baseMaxCoef: 2.0, damageType: DamageType.HOLY,     aoeRange: 'BOX', wheelBonusPct: 0 },
  'Exori San':      { name: 'Exori San',      manaCost: 20,  group: 'COMBAT',  cooldownMs: 2000, baseMinCoef: 0.8, baseMaxCoef: 1.5, damageType: DamageType.HOLY,     aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exori Gran Con': { name: 'Exori Gran Con', manaCost: 55,  group: 'COMBAT',  cooldownMs: 8000, baseMinCoef: 1.5, baseMaxCoef: 2.8, damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Divine Caldera': { name: 'Divine Caldera', manaCost: 160, group: 'COMBAT',  cooldownMs: 4000, baseMinCoef: 1.8, baseMaxCoef: 2.8, damageType: DamageType.HOLY,     aoeRange: 'BOX', wheelBonusPct: 0 },
  'Divine Dazzle':  { name: 'Divine Dazzle',  manaCost: 130, group: 'COMBAT',  cooldownMs: 4000, baseMinCoef: 1.2, baseMaxCoef: 2.0, damageType: DamageType.HOLY,     aoeRange: 'SINGLE_TARGET',wheelBonusPct: 0 },
  'Divine Missile': { name: 'Divine Missile', manaCost: 110, group: 'COMBAT',  cooldownMs: 2000, baseMinCoef: 1.2, baseMaxCoef: 2.0, damageType: DamageType.HOLY,     aoeRange: 'SINGLE_TARGET',wheelBonusPct: 0 },
  'Swift Aim':      { name: 'Swift Aim',      manaCost:  20, group: 'COMBAT',  cooldownMs: 2000, baseMinCoef: 0.8, baseMaxCoef: 1.3, damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET',wheelBonusPct: 0 },
  'Exura Gran San': { name: 'Exura Gran San', manaCost: 210, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 4.0, baseMaxCoef: 6.0, damageType: 'HEAL',            aoeRange: 'SINGLE_TARGET',wheelBonusPct: 0 },
  'Exura San':      { name: 'Exura San',      manaCost: 120, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 2.0, baseMaxCoef: 3.5, damageType: 'HEAL',            aoeRange: 'SINGLE_TARGET',wheelBonusPct: 0 },
  'Salvation':      { name: 'Salvation',      manaCost: 390, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 5.0, baseMaxCoef: 8.0, damageType: 'HEAL',            aoeRange: 'SINGLE_TARGET',wheelBonusPct: 0 },
  'Sharpshooter':   { name: 'Sharpshooter',   manaCost: 450, group: 'SUPPORT', cooldownMs: 60000,baseMinCoef: 0,   baseMaxCoef: 0,   damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET',wheelBonusPct: 0 },

  // ─── SORCERER ────────────────────────────────────────────────────────────
  'Exori Vis':           { name: 'Exori Vis',           manaCost: 20, group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.2, baseMaxCoef: 2.0, damageType: DamageType.ENERGY, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exevo Gran Mas Vis':  { name: 'Exevo Gran Mas Vis',  manaCost: 700, group: 'COMBAT', cooldownMs: 40000, baseMinCoef: 2.8, baseMaxCoef: 4.5, damageType: DamageType.ENERGY, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Exevo Gran Mas Flam': { name: 'Exevo Gran Mas Flam', manaCost: 700, group: 'COMBAT', cooldownMs: 40000, baseMinCoef: 2.8, baseMaxCoef: 4.5, damageType: DamageType.FIRE, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Energy Wave':         { name: 'Energy Wave',         manaCost: 530, group: 'COMBAT', cooldownMs: 4000, baseMinCoef: 1.6, baseMaxCoef: 2.6, damageType: DamageType.ENERGY, aoeRange: 'WAVE', wheelBonusPct: 0 },
  'Fire Wave':           { name: 'Fire Wave',           manaCost: 530, group: 'COMBAT', cooldownMs: 4000, baseMinCoef: 1.6, baseMaxCoef: 2.6, damageType: DamageType.FIRE, aoeRange: 'WAVE', wheelBonusPct: 0 },
  'Exura Vita':          { name: 'Exura Vita',          manaCost: 160, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 5.0, baseMaxCoef: 7.5, damageType: 'HEAL', aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Magic Shield':        { name: 'Magic Shield',        manaCost: 450, group: 'SUPPORT', cooldownMs: 14000,baseMinCoef: 0,   baseMaxCoef: 0,   damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Sorcerer Power Bolt Rune': { name: 'Sorcerer Power Bolt Rune', manaCost: 0, group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 2.2, baseMaxCoef: 3.5, damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },

  // ─── DRUID ───────────────────────────────────────────────────────────────
  'Exori Flam':          { name: 'Exori Flam',          manaCost: 20,  group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.2, baseMaxCoef: 2.0, damageType: DamageType.FIRE, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exori Frigo':         { name: 'Exori Frigo',         manaCost: 20,  group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.2, baseMaxCoef: 2.0, damageType: DamageType.ICE,  aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exori Tera':          { name: 'Exori Tera',          manaCost: 20,  group: 'COMBAT', cooldownMs: 2000, baseMinCoef: 1.2, baseMaxCoef: 2.0, damageType: DamageType.EARTH,aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exevo Gran Mas Frigo':{ name: 'Exevo Gran Mas Frigo',manaCost: 700, group: 'COMBAT', cooldownMs: 40000, baseMinCoef: 2.8, baseMaxCoef: 4.5, damageType: DamageType.ICE, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Exevo Gran Mas Tera': { name: 'Exevo Gran Mas Tera', manaCost: 700, group: 'COMBAT', cooldownMs: 40000, baseMinCoef: 2.8, baseMaxCoef: 4.5, damageType: DamageType.EARTH, aoeRange: 'WIDE', wheelBonusPct: 0 },
  'Ice Wave':            { name: 'Ice Wave',            manaCost: 530, group: 'COMBAT', cooldownMs: 4000, baseMinCoef: 1.6, baseMaxCoef: 2.6, damageType: DamageType.ICE, aoeRange: 'WAVE', wheelBonusPct: 0 },
  'Terra Wave':          { name: 'Terra Wave',          manaCost: 530, group: 'COMBAT', cooldownMs: 4000, baseMinCoef: 1.6, baseMaxCoef: 2.6, damageType: DamageType.EARTH, aoeRange: 'WAVE', wheelBonusPct: 0 },
  'Exura Vita Druid':    { name: 'Exura Vita',          manaCost: 160, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 5.0, baseMaxCoef: 7.5, damageType: 'HEAL', aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Exura Sio':           { name: 'Exura Sio',           manaCost: 120, group: 'HEALING', cooldownMs: 1000, baseMinCoef: 3.0, baseMaxCoef: 5.0, damageType: 'HEAL', aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Nature\'s Embrace':   { name: "Nature's Embrace",    manaCost: 390, group: 'HEALING', cooldownMs: 10000,baseMinCoef: 4.0, baseMaxCoef: 7.0, damageType: 'HEAL', aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Magic Shield Druid':  { name: 'Magic Shield',        manaCost: 450, group: 'SUPPORT', cooldownMs: 14000,baseMinCoef: 0,   baseMaxCoef: 0,   damageType: DamageType.PHYSICAL, aoeRange: 'SINGLE_TARGET', wheelBonusPct: 0 },
  'Eternal Winter':      { name: 'Eternal Winter',      manaCost: 600, group: 'COMBAT',  cooldownMs: 6000, baseMinCoef: 2.5, baseMaxCoef: 4.0, damageType: DamageType.ICE,      aoeRange: 'WIDE', wheelBonusPct: 0 },
};
