import { IMonsterAI, DamageType, WeaponType, CharmType, CombatType, PlayerStance } from '../types/combat';

export interface IDatabaseItem {
  id: string;
  name: string;
  slot: 'HELMET' | 'ARMOR' | 'LEGS' | 'BOOTS' | 'AMULET' | 'RING' | 'WEAPON' | 'SHIELD';
  skillBonuses?: Partial<Record<WeaponType, number>>;
  protections?: {
    physical?: number;
    elemental?: Partial<Record<DamageType, number>>;
  };
  weaponAttrs?: {
    archetype: string;
    skillType: WeaponType;
    baseAttack: number;
    element: DamageType;
  };
}

export const TIBIA_ITEM_DATABASE: IDatabaseItem[] = [
  // --- WEAPONS ---
  // Swords
  {
    id: 'falcon_longsword',
    name: 'Falcon Longsword',
    slot: 'WEAPON',
    skillBonuses: { SWORD: 4 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.SWORD, baseAttack: 50, element: DamageType.EARTH }
  },
  {
    id: 'sanguine_razor',
    name: 'Sanguine Razor',
    slot: 'WEAPON',
    skillBonuses: { SWORD: 5 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.SWORD, baseAttack: 55, element: DamageType.DEATH }
  },
  {
    id: 'soulcutter',
    name: 'Soulcutter',
    slot: 'WEAPON',
    skillBonuses: { SWORD: 4 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.SWORD, baseAttack: 53, element: DamageType.ICE }
  },
  {
    id: 'tagralt_blade',
    name: 'Tagralt Blade',
    slot: 'WEAPON',
    skillBonuses: { SWORD: 3 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.SWORD, baseAttack: 48, element: DamageType.EARTH }
  },
  // Axes
  {
    id: 'falcon_battleaxe',
    name: 'Falcon Battleaxe',
    slot: 'WEAPON',
    skillBonuses: { AXE: 4 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.AXE, baseAttack: 50, element: DamageType.ENERGY }
  },
  {
    id: 'sanguine_hatchet',
    name: 'Sanguine Hatchet',
    slot: 'WEAPON',
    skillBonuses: { AXE: 5 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.AXE, baseAttack: 56, element: DamageType.DEATH }
  },
  {
    id: 'phantasmal_axe',
    name: 'Phantasmal Axe',
    slot: 'WEAPON',
    skillBonuses: { AXE: 3 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.AXE, baseAttack: 47, element: DamageType.FIRE }
  },
  {
    id: 'cobra_axe',
    name: 'Cobra Axe',
    slot: 'WEAPON',
    skillBonuses: { AXE: 3 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.AXE, baseAttack: 48, element: DamageType.ICE }
  },
  // Clubs
  {
    id: 'falcon_mace',
    name: 'Falcon Mace',
    slot: 'WEAPON',
    skillBonuses: { CLUB: 4 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.CLUB, baseAttack: 49, element: DamageType.ENERGY }
  },
  {
    id: 'sanguine_cudgel',
    name: 'Sanguine Cudgel',
    slot: 'WEAPON',
    skillBonuses: { CLUB: 5 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.CLUB, baseAttack: 56, element: DamageType.DEATH }
  },
  {
    id: 'soulmaimer',
    name: 'Soulmaimer',
    slot: 'WEAPON',
    skillBonuses: { CLUB: 4 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.CLUB, baseAttack: 54, element: DamageType.ICE }
  },
  {
    id: 'resizer',
    name: 'Resizer',
    slot: 'WEAPON',
    skillBonuses: { CLUB: 3 },
    weaponAttrs: { archetype: 'MELEE', skillType: WeaponType.CLUB, baseAttack: 48, element: DamageType.ICE }
  },
  // Distance
  {
    id: 'falcon_bow',
    name: 'Falcon Bow',
    slot: 'WEAPON',
    skillBonuses: { DISTANCE: 4 },
    protections: { elemental: { FIRE: 5 } },
    weaponAttrs: { archetype: 'DISTANCE', skillType: WeaponType.DISTANCE, baseAttack: 49, element: DamageType.PHYSICAL }
  },
  {
    id: 'soulbleeder',
    name: 'Soulbleeder',
    slot: 'WEAPON',
    skillBonuses: { DISTANCE: 5 },
    protections: { elemental: { HOLY: 5 } },
    weaponAttrs: { archetype: 'DISTANCE', skillType: WeaponType.DISTANCE, baseAttack: 53, element: DamageType.PHYSICAL }
  },
  // Wands/Rods
  {
    id: 'soultainter',
    name: 'Soultainter (Wand)',
    slot: 'WEAPON',
    skillBonuses: { MAGIC_WAND_ROD: 5 },
    weaponAttrs: { archetype: 'WAND_ROD', skillType: WeaponType.MAGIC_WAND_ROD, baseAttack: 42, element: DamageType.DEATH }
  },
  {
    id: 'sanguine_rod',
    name: 'Sanguine Rod',
    slot: 'WEAPON',
    skillBonuses: { MAGIC_WAND_ROD: 5 },
    weaponAttrs: { archetype: 'WAND_ROD', skillType: WeaponType.MAGIC_WAND_ROD, baseAttack: 43, element: DamageType.ICE }
  },

  // --- HELMETS ---
  { id: 'falcon_coif', name: 'Falcon Coif', slot: 'HELMET', skillBonuses: { SWORD: 3, AXE: 3, CLUB: 3 }, protections: { physical: 10, elemental: { FIRE: 5 } } },
  { id: 'cobra_hood', name: 'Cobra Hood', slot: 'HELMET', skillBonuses: { SWORD: 2 }, protections: { physical: 10 } },
  { id: 'galea_mortis', name: 'Galea Mortis', slot: 'HELMET', skillBonuses: { MAGIC_WAND_ROD: 2 }, protections: { physical: 3, elemental: { DEATH: 6 } } },
  { id: 'falcon_circlet', name: 'Falcon Circlet', slot: 'HELMET', skillBonuses: { MAGIC_WAND_ROD: 2 }, protections: { physical: 3, elemental: { FIRE: 5 } } },

  // --- ARMORS ---
  { id: 'falcon_plate', name: 'Falcon Plate', slot: 'ARMOR', skillBonuses: { SWORD: 4, AXE: 4, CLUB: 4 }, protections: { physical: 12, elemental: { FIRE: 3 } } },
  { id: 'soulshroud', name: 'Soulshroud', slot: 'ARMOR', skillBonuses: { MAGIC_WAND_ROD: 4 }, protections: { physical: 8, elemental: { ICE: 12 } } },
  { id: 'sanguine_coat', name: 'Sanguine Coat', slot: 'ARMOR', skillBonuses: { MAGIC_WAND_ROD: 4 }, protections: { physical: 9, elemental: { DEATH: 12 } } },

  // --- LEGS ---
  { id: 'falcon_greaves', name: 'Falcon Greaves', slot: 'LEGS', skillBonuses: { SWORD: 3, AXE: 3, CLUB: 3 }, protections: { physical: 7, elemental: { ICE: 10 } } },
  { id: 'soulbiter_legs', name: 'Soulbiter Legs', slot: 'LEGS', skillBonuses: { DISTANCE: 3 }, protections: { physical: 7 } },
  { id: 'sanguine_greaves', name: 'Sanguine Greaves', slot: 'LEGS', skillBonuses: { SWORD: 3, AXE: 3, CLUB: 3 }, protections: { physical: 8, elemental: { DEATH: 10 } } },

  // --- BOOTS ---
  { id: 'sanguine_galoshers', name: 'Sanguine Galoshers', slot: 'BOOTS', protections: { physical: 3, elemental: { DEATH: 5 } } },
  { id: 'soulwalker_boots', name: 'Soulwalker Boots', slot: 'BOOTS', protections: { physical: 3, elemental: { ICE: 5 } } },
  { id: 'pair_dreamwalkers', name: 'Pair of Dreamwalkers', slot: 'BOOTS', skillBonuses: { MAGIC_WAND_ROD: 1 }, protections: { elemental: { EARTH: 4 } } },

  // --- AMULETS ---
  { id: 'colar_blue_plasma', name: 'Collar of Blue Plasma', slot: 'AMULET', skillBonuses: { SWORD: 4, AXE: 4, CLUB: 4, DISTANCE: 4, MAGIC_WAND_ROD: 4 }, protections: { physical: 1 } },
  { id: 'rainbow_amulet', name: 'Rainbow Amulet', slot: 'AMULET', protections: { physical: 3, elemental: { FIRE: 3, ICE: 3, ENERGY: 3, EARTH: 3, HOLY: 3, DEATH: 3 } } },

  // --- RINGS ---
  { id: 'ring_blue_plasma', name: 'Ring of Blue Plasma', slot: 'RING', skillBonuses: { SWORD: 4, AXE: 4, CLUB: 4, DISTANCE: 4, MAGIC_WAND_ROD: 4 } },
  { id: 'ring_ending', name: 'Ring of Ending', slot: 'RING', protections: { physical: 3 } }
];

export const TIBIA_BESTIARY_DATABASE: Omit<IMonsterAI, 'id'>[] = [
  {
    name: 'Demon', currentHp: 8200, maxHp: 8200, armor: 40, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 180, damageElement: DamageType.FIRE, activeCharm: 'WOUND',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 0.0, ICE: 1.0, ENERGY: 1.0, EARTH: 1.0, HOLY: 1.2, DEATH: 0.8 }
  },
  {
    name: 'Grim Reaper', currentHp: 4000, maxHp: 4000, armor: 60, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 300, damageElement: DamageType.DEATH, activeCharm: 'HOLY',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 1.2, ICE: 0.5, ENERGY: 1.0, EARTH: 1.0, HOLY: 1.5, DEATH: 0.0 }
  },
  {
    name: 'Warlock', currentHp: 3200, maxHp: 3200, armor: 15, combatType: 'RANGED', behaviorState: 'NORMAL',
    baseDamagePerTurn: 150, damageElement: DamageType.ENERGY, activeCharm: 'NONE',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 1.0, ICE: 1.0, ENERGY: 1.0, EARTH: 1.0, HOLY: 1.0, DEATH: 1.0 }
  },
  {
    name: 'Cobra Assassin', currentHp: 4500, maxHp: 4500, armor: 50, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 450, damageElement: DamageType.EARTH, activeCharm: 'WOUND',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 1.1, ICE: 1.0, ENERGY: 0.8, EARTH: 0.0, HOLY: 1.0, DEATH: 0.9 }
  },
  {
    name: 'Cobra Vizier', currentHp: 4200, maxHp: 4200, armor: 30, combatType: 'RANGED', behaviorState: 'NORMAL',
    baseDamagePerTurn: 400, damageElement: DamageType.FIRE, activeCharm: 'FREEZE',
    elementalModifiers: { PHYSICAL: 0.9, FIRE: 0.0, ICE: 1.1, ENERGY: 1.0, EARTH: 1.0, HOLY: 1.0, DEATH: 1.0 }
  },
  {
    name: 'Werelion', currentHp: 4800, maxHp: 4800, armor: 55, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 480, damageElement: DamageType.HOLY, activeCharm: 'ZAP',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 1.0, ICE: 0.8, ENERGY: 1.0, EARTH: 1.1, HOLY: 0.0, DEATH: 1.05 }
  },
  {
    name: 'Flimsy Lost Soul', currentHp: 9500, maxHp: 9500, armor: 80, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 650, damageElement: DamageType.DEATH, activeCharm: 'HOLY',
    elementalModifiers: { PHYSICAL: 0.9, FIRE: 1.1, ICE: 0.9, ENERGY: 1.0, EARTH: 1.0, HOLY: 1.2, DEATH: 0.0 }
  },
  {
    name: 'Mean Lost Soul', currentHp: 11000, maxHp: 11000, armor: 90, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 720, damageElement: DamageType.DEATH, activeCharm: 'HOLY',
    elementalModifiers: { PHYSICAL: 0.9, FIRE: 1.1, ICE: 0.9, ENERGY: 1.0, EARTH: 1.0, HOLY: 1.2, DEATH: 0.0 }
  },
  {
    name: 'Gazer Spectre', currentHp: 3900, maxHp: 3900, armor: 35, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 380, damageElement: DamageType.FIRE, activeCharm: 'FREEZE',
    elementalModifiers: { PHYSICAL: 0.1, FIRE: 0.0, ICE: 1.2, ENERGY: 0.8, EARTH: 1.0, HOLY: 1.0, DEATH: 1.0 }
  },
  {
    name: 'Arachnophobica', currentHp: 6000, maxHp: 6000, armor: 60, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 500, damageElement: DamageType.PHYSICAL, activeCharm: 'WOUND',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 1.1, ICE: 1.0, ENERGY: 0.8, EARTH: 1.0, HOLY: 1.0, DEATH: 0.9 }
  },
  {
    name: 'Sphinx', currentHp: 9000, maxHp: 9000, armor: 75, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 550, damageElement: DamageType.HOLY, activeCharm: 'WOUND',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 0.9, ICE: 1.0, ENERGY: 1.0, EARTH: 1.1, HOLY: 0.0, DEATH: 1.0 }
  },
  {
    name: 'Crypt Warden', currentHp: 8500, maxHp: 8500, armor: 70, combatType: 'MELEE', behaviorState: 'NORMAL',
    baseDamagePerTurn: 520, damageElement: DamageType.EARTH, activeCharm: 'FREEZE',
    elementalModifiers: { PHYSICAL: 1.0, FIRE: 1.2, ICE: 0.9, ENERGY: 1.0, EARTH: 0.0, HOLY: 1.0, DEATH: 0.9 }
  }
];

export interface IHuntTemplate {
  name: string;
  location: string;
  recommendedStance: PlayerStance;
  hazardLevel: number;
  description: string;
  activeMonsters: Omit<IMonsterAI, 'id'>[];
  queueMonsters: Omit<IMonsterAI, 'id'>[];
}


export const TIBIA_HUNTS_DATABASE: IHuntTemplate[] = [
  {
    name: "Werelions Den",
    location: "Darashia",
    recommendedStance: PlayerStance.WALL_BACK,
    hazardLevel: 0,
    description: "Werelions Den. Great for mid-level Knights and Paladins. Mobs are weak to Death and Earth, but immune to Holy. Use wall positioning to block rear slots.",
    activeMonsters: [
      TIBIA_BESTIARY_DATABASE[5], // Werelion
      TIBIA_BESTIARY_DATABASE[5],
      TIBIA_BESTIARY_DATABASE[5]
    ],
    queueMonsters: [
      TIBIA_BESTIARY_DATABASE[5],
      TIBIA_BESTIARY_DATABASE[5],
      TIBIA_BESTIARY_DATABASE[5],
      TIBIA_BESTIARY_DATABASE[5]
    ]
  },
  {
    name: "Cobra Bastion",
    location: "Ankrahmun",
    recommendedStance: PlayerStance.WALL_BACK,
    hazardLevel: 2,
    description: "Cobra Bastion. Dangerous high-level hunt. Cobra Assassins close the box while Cobra Viziers shoot Fire from the periphery screen queue. Earth/Fire protections highly recommended.",
    activeMonsters: [
      TIBIA_BESTIARY_DATABASE[3], // Cobra Assassin
      TIBIA_BESTIARY_DATABASE[3],
      TIBIA_BESTIARY_DATABASE[3]
    ],
    queueMonsters: [
      TIBIA_BESTIARY_DATABASE[4], // Cobra Vizier (Ranged)
      TIBIA_BESTIARY_DATABASE[4],
      TIBIA_BESTIARY_DATABASE[3],
      TIBIA_BESTIARY_DATABASE[3],
      TIBIA_BESTIARY_DATABASE[3]
    ]
  },
  {
    name: "Haunted Temple Spectres",
    location: "Port Hope",
    recommendedStance: PlayerStance.CORNER_TRAP,
    hazardLevel: 1,
    description: "Gazer Spectre Cave. Monsters have massive 90% physical damage reduction. Sorcerers and Druids excel here, while Knights must utilize elemental weapons (Ice/Death).",
    activeMonsters: [
      TIBIA_BESTIARY_DATABASE[8], // Gazer Spectre
      TIBIA_BESTIARY_DATABASE[8]
    ],
    queueMonsters: [
      TIBIA_BESTIARY_DATABASE[9], // Arachnophobica
      TIBIA_BESTIARY_DATABASE[8],
      TIBIA_BESTIARY_DATABASE[8],
      TIBIA_BESTIARY_DATABASE[9]
    ]
  },
  {
    name: "Rotten Wasteland (Soul War)",
    location: "Rotten Wasteland",
    recommendedStance: PlayerStance.WALL_BACK,
    hazardLevel: 5,
    description: "Rotten Wasteland - Flimsy Lost Souls. Extreme end-game hunt with high hazard scaling. Monsters deal lethal Death damage, but are highly vulnerable to Holy (+20% damage).",
    activeMonsters: [
      TIBIA_BESTIARY_DATABASE[6], // Flimsy Lost Soul
      TIBIA_BESTIARY_DATABASE[6],
      TIBIA_BESTIARY_DATABASE[6]
    ],
    queueMonsters: [
      TIBIA_BESTIARY_DATABASE[7], // Mean Lost Soul
      TIBIA_BESTIARY_DATABASE[7],
      TIBIA_BESTIARY_DATABASE[6],
      TIBIA_BESTIARY_DATABASE[6],
      TIBIA_BESTIARY_DATABASE[9]  // Arachnophobica
    ]
  },
  {
    name: "Yalahar Demon Hell",
    location: "Yalahar",
    recommendedStance: PlayerStance.OPEN_FIELD,
    hazardLevel: 0,
    description: "Classic Demon hunt. Demons close in melee while Warlocks fire mana-draining energy spells from distance. Holy and Ice elements are effective against Demons.",
    activeMonsters: [
      TIBIA_BESTIARY_DATABASE[0] // Demon
    ],
    queueMonsters: [
      TIBIA_BESTIARY_DATABASE[2], // Warlock (Ranged)
      TIBIA_BESTIARY_DATABASE[0],
      TIBIA_BESTIARY_DATABASE[0]
    ]
  }
];
