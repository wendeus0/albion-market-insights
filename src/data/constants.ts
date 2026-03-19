export const cities = [
  'Caerleon',
  'Bridgewatch',
  'Fort Sterling',
  'Lymhurst',
  'Martlock',
  'Thetford',
  'Black Market',
] as const;

export const tiers = ['T4', 'T5', 'T6', 'T7', 'T8'] as const;

export const qualities = ['Normal', 'Good', 'Outstanding', 'Excellent', 'Masterpiece'] as const;

export const ENCHANTMENT_LEVELS = ['@0', '@1', '@2', '@3'] as const;

/**
 * Política única de frescor dos dados
 * Todas as fontes de dados (cache, queries, polling) usam 15 minutos
 */
export const DATA_FRESHNESS_MS = 15 * 60 * 1000; // 15 minutos
export const CACHE_TTL_MS = DATA_FRESHNESS_MS; // Alias para clareza

export interface CatalogCategory {
  label: string;
  ids: string[];
}

export type CatalogCategoryKey =
  | 'swords'
  | 'axes'
  | 'spears'
  | 'daggers'
  | 'bows'
  | 'fire_staves'
  | 'frost_staves'
  | 'holy_staves'
  | 'arcane_staves'
  | 'cursed_staves'
  | 'plate'
  | 'leather'
  | 'cloth'
  | 'off_hands'
  | 'bags'
  | 'capes'
  | 'resources';

function genIds(types: string[]): string[] {
  return ['T4', 'T5', 'T6', 'T7', 'T8'].flatMap(tier =>
    types.flatMap(type =>
      ENCHANTMENT_LEVELS.map(level =>
        level === 0 ? `${tier}_${type}` : `${tier}_${type}@${level}`
      )
    )
  );
}

export const ITEM_CATALOG: Record<CatalogCategoryKey, CatalogCategory> = {
  swords: {
    label: 'Swords',
    ids: genIds([
      'MAIN_SWORD', '2H_SWORD', '2H_CLAYMORE', 'MAIN_LONGSWORD', '2H_DUAL_SWORD',
    ]),
  },
  axes: {
    label: 'Axes',
    ids: genIds([
      'MAIN_AXE', '2H_AXE', '2H_HALBERD', '2H_BATTLEAXE', 'MAIN_DUALAXE',
    ]),
  },
  spears: {
    label: 'Spears',
    ids: genIds([
      'MAIN_SPEAR', '2H_SPEAR', '2H_PIKE', '2H_LANCE', '2H_GLAIVE',
    ]),
  },
  daggers: {
    label: 'Daggers',
    ids: genIds([
      'MAIN_DAGGER', '2H_DAGGER', '2H_CLAWS', 'MAIN_DAGGERPAIR', 'MAIN_BLOODLETTER',
    ]),
  },
  bows: {
    label: 'Bows',
    ids: genIds([
      'MAIN_BOW', '2H_BOW', '2H_WARBOW', 'MAIN_CROSSBOW', '2H_LONGBOW',
    ]),
  },
  fire_staves: {
    label: 'Fire Staves',
    ids: genIds([
      'MAIN_FIRESTAFF', '2H_FIRESTAFF', '2H_INFERNOSTAFF', '2H_BLAZINGSTAFF', '2H_DRUIDSTAFF',
    ]),
  },
  frost_staves: {
    label: 'Frost Staves',
    ids: genIds([
      'MAIN_FROSTSTAFF', '2H_FROSTSTAFF', '2H_ICICLESTAFF', '2H_GLACIALSTAFF', '2H_PERMAFROST',
    ]),
  },
  holy_staves: {
    label: 'Holy Staves',
    ids: genIds([
      'MAIN_HOLYSTAFF', '2H_HOLYSTAFF', '2H_DIVINESTAFF', '2H_LIFETOUCH', '2H_HOLYBOOK',
    ]),
  },
  arcane_staves: {
    label: 'Arcane Staves',
    ids: genIds([
      'MAIN_ARCANESTAFF', '2H_ARCANESTAFF', '2H_ENIGMATICSTAFF', '2H_OCCULTSTAFF', '2H_SOULSCYTHE',
    ]),
  },
  cursed_staves: {
    label: 'Cursed Staves',
    ids: genIds([
      'MAIN_CURSEDSTAFF', '2H_CURSEDSTAFF', '2H_DEMONICSTAFF', '2H_SKULLS', '2H_GRAVECALLER',
    ]),
  },
  plate: {
    label: 'Plate Armor',
    ids: genIds([
      'ARMOR_PLATE_SET1', 'HEAD_PLATE_SET1', 'SHOES_PLATE_SET1',
      'ARMOR_PLATE_SET2', 'HEAD_PLATE_SET2', 'SHOES_PLATE_SET2',
      'ARMOR_PLATE_SET3', 'HEAD_PLATE_SET3', 'SHOES_PLATE_SET3',
    ]),
  },
  leather: {
    label: 'Leather Armor',
    ids: genIds([
      'ARMOR_LEATHER_SET1', 'HEAD_LEATHER_SET1', 'SHOES_LEATHER_SET1',
      'ARMOR_LEATHER_SET2', 'HEAD_LEATHER_SET2', 'SHOES_LEATHER_SET2',
      'ARMOR_LEATHER_SET3', 'HEAD_LEATHER_SET3', 'SHOES_LEATHER_SET3',
    ]),
  },
  cloth: {
    label: 'Cloth Armor',
    ids: genIds([
      'ARMOR_CLOTH_SET1', 'HEAD_CLOTH_SET1', 'SHOES_CLOTH_SET1',
      'ARMOR_CLOTH_SET2', 'HEAD_CLOTH_SET2', 'SHOES_CLOTH_SET2',
      'ARMOR_CLOTH_SET3', 'HEAD_CLOTH_SET3', 'SHOES_CLOTH_SET3',
    ]),
  },
  off_hands: {
    label: 'Off-hands',
    ids: genIds([
      'OFFHAND_SHIELD', 'OFFHAND_TORCH', 'OFFHAND_BOOK',
      'OFFHAND_TOTEM', 'OFFHAND_ORB', 'OFFHAND_HORN',
    ]),
  },
  bags: {
    label: 'Bags',
    ids: genIds(['BAG']),
  },
  capes: {
    label: 'Capes',
    ids: genIds(['CAPE']),
  },
  resources: {
    label: 'Resources',
    ids: ['T4_HIDE', 'T5_HIDE', 'T6_HIDE', 'T7_HIDE', 'T8_HIDE',
          'T4_ORE', 'T5_ORE', 'T6_ORE', 'T7_ORE', 'T8_ORE',
          'T4_FIBER', 'T5_FIBER', 'T6_FIBER', 'T7_FIBER', 'T8_FIBER',
          'T4_WOOD', 'T5_WOOD', 'T6_WOOD', 'T7_WOOD', 'T8_WOOD',
          'T4_ROCK', 'T5_ROCK', 'T6_ROCK', 'T7_ROCK', 'T8_ROCK'],
  },
};

export const ITEM_IDS: string[] = Object.values(ITEM_CATALOG).flatMap(c => c.ids);

const TYPE_LABELS: Record<string, string> = {
  'MAIN_SWORD': 'Broadsword',
  '2H_SWORD': 'Claymore',
  '2H_CLAYMORE': 'Great Claymore',
  'MAIN_LONGSWORD': 'Carving Sword',
  '2H_DUAL_SWORD': 'Dual Swords',
  'MAIN_AXE': 'Battleaxe',
  '2H_AXE': 'Greataxe',
  '2H_HALBERD': 'Halberd',
  '2H_BATTLEAXE': 'War Axe',
  'MAIN_DUALAXE': 'Dual Axes',
  'MAIN_SPEAR': 'Spear',
  '2H_SPEAR': 'Pike',
  '2H_PIKE': 'Heavy Pike',
  '2H_LANCE': 'Lance',
  '2H_GLAIVE': 'War Glaive',
  'MAIN_DAGGER': 'Dagger',
  '2H_DAGGER': 'Demonic Blades',
  '2H_CLAWS': 'Claws',
  'MAIN_DAGGERPAIR': 'Bridled Fury',
  'MAIN_BLOODLETTER': 'Bloodletter',
  'MAIN_BOW': 'Bow',
  '2H_BOW': 'Warbow',
  '2H_WARBOW': 'Longbow',
  'MAIN_CROSSBOW': 'Crossbow',
  '2H_LONGBOW': 'Carrioncaller',
  'MAIN_FIRESTAFF': 'Fire Staff',
  '2H_FIRESTAFF': 'Great Fire Staff',
  '2H_INFERNOSTAFF': 'Infernal Staff',
  '2H_BLAZINGSTAFF': 'Blazing Staff',
  '2H_DRUIDSTAFF': 'Druidic Staff',
  'MAIN_FROSTSTAFF': 'Frost Staff',
  '2H_FROSTSTAFF': 'Great Frost Staff',
  '2H_ICICLESTAFF': 'Icicle Staff',
  '2H_GLACIALSTAFF': 'Glacial Staff',
  '2H_PERMAFROST': 'Permafrost Prism',
  'MAIN_HOLYSTAFF': 'Holy Staff',
  '2H_HOLYSTAFF': 'Great Holy Staff',
  '2H_DIVINESTAFF': 'Divine Staff',
  '2H_LIFETOUCH': 'Life Touch Staff',
  '2H_HOLYBOOK': 'Fallen Staff',
  'MAIN_ARCANESTAFF': 'Arcane Staff',
  '2H_ARCANESTAFF': 'Great Arcane Staff',
  '2H_ENIGMATICSTAFF': 'Enigmatic Staff',
  '2H_OCCULTSTAFF': 'Occult Staff',
  '2H_SOULSCYTHE': 'Soulscythe',
  'MAIN_CURSEDSTAFF': 'Cursed Staff',
  '2H_CURSEDSTAFF': 'Great Cursed Staff',
  '2H_DEMONICSTAFF': 'Demonic Staff',
  '2H_SKULLS': 'Cursed Skull',
  '2H_GRAVECALLER': 'Gravecaller',
  'ARMOR_PLATE_SET1': 'Soldier Armor',
  'HEAD_PLATE_SET1': 'Soldier Helmet',
  'SHOES_PLATE_SET1': 'Soldier Boots',
  'ARMOR_PLATE_SET2': 'Knight Armor',
  'HEAD_PLATE_SET2': 'Knight Helmet',
  'SHOES_PLATE_SET2': 'Knight Boots',
  'ARMOR_PLATE_SET3': 'Guardian Armor',
  'HEAD_PLATE_SET3': 'Guardian Helmet',
  'SHOES_PLATE_SET3': 'Guardian Boots',
  'ARMOR_LEATHER_SET1': 'Leather Armor',
  'HEAD_LEATHER_SET1': 'Leather Hood',
  'SHOES_LEATHER_SET1': 'Leather Shoes',
  'ARMOR_LEATHER_SET2': 'Assassin Jacket',
  'HEAD_LEATHER_SET2': 'Assassin Hood',
  'SHOES_LEATHER_SET2': 'Assassin Shoes',
  'ARMOR_LEATHER_SET3': 'Royal Jacket',
  'HEAD_LEATHER_SET3': 'Royal Hood',
  'SHOES_LEATHER_SET3': 'Royal Shoes',
  'ARMOR_CLOTH_SET1': 'Cloth Robe',
  'HEAD_CLOTH_SET1': 'Cloth Cowl',
  'SHOES_CLOTH_SET1': 'Cloth Sandals',
  'ARMOR_CLOTH_SET2': 'Scholar Robe',
  'HEAD_CLOTH_SET2': 'Scholar Cowl',
  'SHOES_CLOTH_SET2': 'Scholar Sandals',
  'ARMOR_CLOTH_SET3': 'Mage Robe',
  'HEAD_CLOTH_SET3': 'Mage Cowl',
  'SHOES_CLOTH_SET3': 'Mage Sandals',
  'OFFHAND_SHIELD': 'Shield',
  'OFFHAND_TORCH': 'Torch',
  'OFFHAND_BOOK': 'Focus Tome',
  'OFFHAND_TOTEM': 'Totem',
  'OFFHAND_ORB': 'Arcane Orb',
  'OFFHAND_HORN': 'Horn',
  'BAG': 'Bag',
  'CAPE': 'Cape',
  'HIDE': 'Hide',
  'ORE': 'Ore',
  'FIBER': 'Fiber',
  'WOOD': 'Wood',
  'ROCK': 'Rock',
};

export const ITEM_NAMES: Record<string, string> = Object.fromEntries(
  ITEM_IDS.map(id => {
    const tier = id.match(/^(T\d)/)?.[1] ?? '';
    // Extrai o tipo e o nível de encantamento (se houver)
    const enchantMatch = id.match(/@([0-3])$/);
    const enchantLevel = enchantMatch ? parseInt(enchantMatch[1]) : 0;
    const type = id.replace(/^T\d_/, '').replace(/@[0-3]$/, '');
    const label = TYPE_LABELS[type];
    const enchantSuffix = enchantLevel > 0 ? ` .${enchantLevel}` : '';
    if (label) return [id, `${label} ${tier}${enchantSuffix}`];
    const fallback = type
      .replace(/_/g, ' ')
      .replace(/\b(\w)/g, (_, c: string) => c.toUpperCase());
    return [id, `${fallback} ${tier}${enchantSuffix}`];
  })
);
