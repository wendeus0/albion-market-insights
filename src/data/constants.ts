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

export const ITEM_IDS: string[] = [
  // Swords (T4–T8)
  'T4_MAIN_SWORD', 'T4_2H_SWORD',
  'T5_MAIN_SWORD', 'T5_2H_SWORD',
  'T6_MAIN_SWORD', 'T6_2H_SWORD',
  'T7_MAIN_SWORD', 'T7_2H_SWORD',
  'T8_MAIN_SWORD', 'T8_2H_SWORD',
  // Axes (T4–T7)
  'T4_MAIN_AXE', 'T4_2H_AXE',
  'T5_MAIN_AXE', 'T5_2H_AXE',
  'T6_MAIN_AXE', 'T6_2H_AXE',
  'T7_MAIN_AXE', 'T7_2H_AXE',
  // Spears (T4–T7)
  'T4_MAIN_SPEAR', 'T5_MAIN_SPEAR', 'T6_MAIN_SPEAR', 'T7_MAIN_SPEAR',
  // Daggers (T4–T6)
  'T4_MAIN_DAGGER', 'T5_MAIN_DAGGER', 'T6_MAIN_DAGGER',
  // Bows (T4–T7)
  'T4_MAIN_BOW', 'T5_MAIN_BOW', 'T6_MAIN_BOW', 'T7_MAIN_BOW',
  // Fire Staves (T4–T6)
  'T4_MAIN_FIRESTAFF', 'T5_MAIN_FIRESTAFF', 'T6_MAIN_FIRESTAFF',
  // Holy Staves (T4–T5)
  'T4_MAIN_HOLYSTAFF', 'T5_MAIN_HOLYSTAFF',
  // Plate armor (T4–T6)
  'T4_ARMOR_PLATE_SET1', 'T4_HEAD_PLATE_SET1', 'T4_SHOES_PLATE_SET1',
  'T5_ARMOR_PLATE_SET1', 'T5_HEAD_PLATE_SET1', 'T5_SHOES_PLATE_SET1',
  'T6_ARMOR_PLATE_SET1', 'T6_HEAD_PLATE_SET1', 'T6_SHOES_PLATE_SET1',
  // Leather armor (T4–T6)
  'T4_ARMOR_LEATHER_SET1', 'T4_HEAD_LEATHER_SET1', 'T4_SHOES_LEATHER_SET1',
  'T5_ARMOR_LEATHER_SET1', 'T5_HEAD_LEATHER_SET1', 'T5_SHOES_LEATHER_SET1',
  'T6_ARMOR_LEATHER_SET1', 'T6_HEAD_LEATHER_SET1', 'T6_SHOES_LEATHER_SET1',
  // Cloth armor (T4–T5)
  'T4_ARMOR_CLOTH_SET1', 'T4_HEAD_CLOTH_SET1', 'T4_SHOES_CLOTH_SET1',
  'T5_ARMOR_CLOTH_SET1', 'T5_HEAD_CLOTH_SET1', 'T5_SHOES_CLOTH_SET1',
  // Bags (T4–T8)
  'T4_BAG', 'T5_BAG', 'T6_BAG', 'T7_BAG', 'T8_BAG',
  // Capes (T4–T6)
  'T4_CAPE', 'T5_CAPE', 'T6_CAPE',
];

export const ITEM_NAMES: Record<string, string> = {
  // Swords
  'T4_MAIN_SWORD': 'Broadsword T4', 'T4_2H_SWORD': 'Claymore T4',
  'T5_MAIN_SWORD': 'Broadsword T5', 'T5_2H_SWORD': 'Claymore T5',
  'T6_MAIN_SWORD': 'Broadsword T6', 'T6_2H_SWORD': 'Claymore T6',
  'T7_MAIN_SWORD': 'Broadsword T7', 'T7_2H_SWORD': 'Claymore T7',
  'T8_MAIN_SWORD': 'Broadsword T8', 'T8_2H_SWORD': 'Claymore T8',
  // Axes
  'T4_MAIN_AXE': 'Battleaxe T4', 'T4_2H_AXE': 'Greataxe T4',
  'T5_MAIN_AXE': 'Battleaxe T5', 'T5_2H_AXE': 'Greataxe T5',
  'T6_MAIN_AXE': 'Battleaxe T6', 'T6_2H_AXE': 'Greataxe T6',
  'T7_MAIN_AXE': 'Battleaxe T7', 'T7_2H_AXE': 'Greataxe T7',
  // Spears
  'T4_MAIN_SPEAR': 'Spear T4', 'T5_MAIN_SPEAR': 'Spear T5',
  'T6_MAIN_SPEAR': 'Spear T6', 'T7_MAIN_SPEAR': 'Spear T7',
  // Daggers
  'T4_MAIN_DAGGER': 'Dagger T4', 'T5_MAIN_DAGGER': 'Dagger T5', 'T6_MAIN_DAGGER': 'Dagger T6',
  // Bows
  'T4_MAIN_BOW': 'Bow T4', 'T5_MAIN_BOW': 'Bow T5',
  'T6_MAIN_BOW': 'Bow T6', 'T7_MAIN_BOW': 'Bow T7',
  // Staves
  'T4_MAIN_FIRESTAFF': 'Fire Staff T4', 'T5_MAIN_FIRESTAFF': 'Fire Staff T5', 'T6_MAIN_FIRESTAFF': 'Fire Staff T6',
  'T4_MAIN_HOLYSTAFF': 'Holy Staff T4', 'T5_MAIN_HOLYSTAFF': 'Holy Staff T5',
  // Plate armor
  'T4_ARMOR_PLATE_SET1': 'Plate Armor T4', 'T4_HEAD_PLATE_SET1': 'Plate Helm T4', 'T4_SHOES_PLATE_SET1': 'Plate Boots T4',
  'T5_ARMOR_PLATE_SET1': 'Plate Armor T5', 'T5_HEAD_PLATE_SET1': 'Plate Helm T5', 'T5_SHOES_PLATE_SET1': 'Plate Boots T5',
  'T6_ARMOR_PLATE_SET1': 'Plate Armor T6', 'T6_HEAD_PLATE_SET1': 'Plate Helm T6', 'T6_SHOES_PLATE_SET1': 'Plate Boots T6',
  // Leather armor
  'T4_ARMOR_LEATHER_SET1': 'Leather Armor T4', 'T4_HEAD_LEATHER_SET1': 'Leather Hood T4', 'T4_SHOES_LEATHER_SET1': 'Leather Shoes T4',
  'T5_ARMOR_LEATHER_SET1': 'Leather Armor T5', 'T5_HEAD_LEATHER_SET1': 'Leather Hood T5', 'T5_SHOES_LEATHER_SET1': 'Leather Shoes T5',
  'T6_ARMOR_LEATHER_SET1': 'Leather Armor T6', 'T6_HEAD_LEATHER_SET1': 'Leather Hood T6', 'T6_SHOES_LEATHER_SET1': 'Leather Shoes T6',
  // Cloth armor
  'T4_ARMOR_CLOTH_SET1': 'Cloth Robe T4', 'T4_HEAD_CLOTH_SET1': 'Cloth Cowl T4', 'T4_SHOES_CLOTH_SET1': 'Cloth Sandals T4',
  'T5_ARMOR_CLOTH_SET1': 'Cloth Robe T5', 'T5_HEAD_CLOTH_SET1': 'Cloth Cowl T5', 'T5_SHOES_CLOTH_SET1': 'Cloth Sandals T5',
  // Bags
  'T4_BAG': 'Bag T4', 'T5_BAG': 'Bag T5', 'T6_BAG': 'Bag T6', 'T7_BAG': 'Bag T7', 'T8_BAG': 'Bag T8',
  // Capes
  'T4_CAPE': 'Cape T4', 'T5_CAPE': 'Cape T5', 'T6_CAPE': 'Cape T6',
};
