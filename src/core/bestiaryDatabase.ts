
import { IMonsterAI } from '../types/combat';
import massiveMonsters from '../database/massive_monsters.json';

export const BESTIARY_DATABASE: Record<string, IBestiaryEntry> = massiveMonsters as any;

export interface IBestiaryEntry {
    name?: string;
    maxHp: number;
    armor: number;
    defense?: number;
    baseDamagePerTurn: number;
    damageElement: string;
    combatType: string;
    fleeHpPercent?: number;
    elementalModifiers: Record<string, number>;
}

// Inject Endgame Bosses manually
Object.assign(BESTIARY_DATABASE, {
  'king_zelos': {
    name: 'King Zelos',
    maxHp: 350000,
    armor: 120,
    baseDamagePerTurn: 6000,
    damageElement: 'DEATH',
    combatType: 'MELEE',
    elementalModifiers: { PHYSICAL: 0.9, DEATH: 0.0, ICE: 1.0, FIRE: 1.0, EARTH: 1.0, ENERGY: 1.0, HOLY: 1.1 }
  },
  'magma_bubble': {
    name: 'Magma Bubble',
    maxHp: 400000,
    armor: 150,
    baseDamagePerTurn: 7500,
    damageElement: 'FIRE',
    combatType: 'MELEE',
    elementalModifiers: { PHYSICAL: 0.8, DEATH: 1.0, ICE: 1.2, FIRE: 0.0, EARTH: 1.0, ENERGY: 1.0, HOLY: 1.0 }
  },
  'ferumbras_mortal_shell': {
    name: 'Ferumbras Mortal Shell',
    maxHp: 500000,
    armor: 180,
    baseDamagePerTurn: 9000,
    damageElement: 'ENERGY',
    combatType: 'MELEE',
    elementalModifiers: { PHYSICAL: 0.9, DEATH: 1.0, ICE: 1.0, FIRE: 1.0, EARTH: 1.0, ENERGY: 0.0, HOLY: 1.0 }
  }
});
