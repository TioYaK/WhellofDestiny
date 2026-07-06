import { IEquipmentItem, IImbuement, ImbuementType, EquipmentSlot } from '../types/combat';
import massiveItems from '../database/massive_items.json';

export const ITEM_DATABASE: Record<string, IEquipmentItem> = massiveItems as any;

export const IMBUEMENT_DATABASE: Record<string, IImbuement> = {
  'powerful_vampirism': {
    id: 'powerful_vampirism',
    name: 'Powerful Vampirism (Life Leech)',
    type: 'VAMPIRISM',
    tier: 3,
    value: 25 // 25% Life Leech
  },
  'powerful_void': {
    id: 'powerful_void',
    name: 'Powerful Void (Mana Leech)',
    type: 'VOID',
    tier: 3,
    value: 8 // 8% Mana Leech
  },
  'powerful_strike': {
    id: 'powerful_strike',
    name: 'Powerful Strike (Crit)',
    type: 'STRIKE',
    tier: 3,
    value: 50 // 50% extra crit damage
  },
  'powerful_epiphany': {
    id: 'powerful_epiphany',
    name: 'Powerful Epiphany (Magic Level)',
    type: 'EPIPHANY',
    tier: 3,
    value: 4
  },
  'powerful_precision': {
    id: 'powerful_precision',
    name: 'Powerful Precision (Distance)',
    type: 'PRECISION',
    tier: 3,
    value: 4
  },
  'powerful_slash': {
    id: 'powerful_slash',
    name: 'Powerful Slash (Sword)',
    type: 'SLASH',
    tier: 3,
    value: 4
  },
  'powerful_chop': {
    id: 'powerful_chop',
    name: 'Powerful Chop (Axe)',
    type: 'CHOP',
    tier: 3,
    value: 4
  },
  'powerful_bash': {
    id: 'powerful_bash',
    name: 'Powerful Bash (Club)',
    type: 'BASH',
    tier: 3,
    value: 4
  }
};
