// ============ INTERFACES ============

export interface Item {
    name: string;
    item_type: "consumivel" | "arma" | "armadura" | "material";
    value: number;
    damage_bonus?: number;
    defense_bonus?: number;
    effect_value?: number;
}

export interface Monster {
    name: string;
    max_hp: number;
    attack: number;
    defense: number;
    exp_range: [number, number];
    gold_range: [number, number];
    speed?: number;
    drops: Array<{
        item_key: string;
        chance: number; // 0.0-1.0 (e.g., 0.3 = 30%)
        quantity: [number, number]; // [min, max]
    }>;
}

export interface Ability {
    name: string;
    level_required: number;
    exp_cost: number;
    damage_multiplier: number;
    duration: number;
}

export interface Recipe {
    name: string;
    level_required: number;
    required_materials: Record<string, number>;
    crafted_item: string;
    quantity_crafted?: number;
}

// ============ ITEM DATABASE ============

export const ITEM_DATABASE: Record<string, Item> = {
    "basic_potion": {
        name: "Poção de Vida Básica",
        item_type: "consumivel",
        value: 30,
        effect_value: 50,
    },
    "common_sword": {
        name: "Espada Comum",
        item_type: "arma",
        value: 25,
        damage_bonus: 5,
    },
    "common_shield": {
        name: "Escudo Comum",
        item_type: "armadura",
        value: 25,
        defense_bonus: 3,
    },
    "common_bow": {
        name: "Arco Comum",
        item_type: "arma",
        value: 20,
        damage_bonus: 3,
    },
    "iron_sword": {
        name: "Espada de Ferro",
        item_type: "arma",
        value: 50,
        damage_bonus: 8,
    },
    "iron_armor": {
        name: "Armadura de Ferro",
        item_type: "armadura",
        value: 45,
        defense_bonus: 6,
    },
    "herb": {
        name: "Erva Medicinal",
        item_type: "material",
        value: 5,
    },
    "iron_ore": {
        name: "Minério de Ferro",
        item_type: "material",
        value: 10,
    },
    "leather": {
        name: "Couro",
        item_type: "material",
        value: 8,
    },
    "greater_potion": {
        name: "Poção de Vida Maior",
        item_type: "consumivel",
        value: 70,
        effect_value: 120,
    },
    "spider_silk": {
        name: "Seda de Aranha",
        item_type: "material",
        value: 12,
    },
    "troll_fang": {
        name: "Presa de Troll",
        item_type: "material",
        value: 18,
    },
    "wyvern_scale": {
        name: "Escama de Wyvern",
        item_type: "material",
        value: 30,
    },
    "dark_essence": {
        name: "Essência Sombria",
        item_type: "material",
        value: 40,
    },
    "mithril_ore": {
        name: "Minério de Mithril",
        item_type: "material",
        value: 55,
    },
    "steel_sword": {
        name: "Espada de Aço",
        item_type: "arma",
        value: 80,
        damage_bonus: 12,
    },
    "steel_armor": {
        name: "Armadura de Aço",
        item_type: "armadura",
        value: 75,
        defense_bonus: 10,
    },
    "hunter_bow": {
        name: "Arco de Caçador",
        item_type: "arma",
        value: 90,
        damage_bonus: 14,
    },
    "wyvern_blade": {
        name: "Lâmina de Wyvern",
        item_type: "arma",
        value: 140,
        damage_bonus: 20,
    },
    "wyvern_plate": {
        name: "Placa de Wyvern",
        item_type: "armadura",
        value: 130,
        defense_bonus: 16,
    },
    "shadow_dagger": {
        name: "Adaga Sombria",
        item_type: "arma",
        value: 180,
        damage_bonus: 26,
    },
    "mithril_armor": {
        name: "Armadura de Mithril",
        item_type: "armadura",
        value: 200,
        defense_bonus: 24,
    },
};

// ============ MONSTER DATABASE ============

export const MONSTER_DATABASE: Record<string, Monster> = {
    "slime": {
        name: "Slime",
        max_hp: 30,
        attack: 4,
        defense: 1,
        exp_range: [1, 10],
        gold_range: [1, 5],
        speed: 1,
        drops: [
            { item_key: "herb", chance: 0.3, quantity: [1, 2] },
            { item_key: "basic_potion", chance: 0.1, quantity: [1, 1] },
        ],
    },
    "rat": {
        name: "Rato Gigante",
        max_hp: 84,
        attack: 5,
        defense: 5,
        exp_range: [6, 11],
        gold_range: [2, 3],
        speed: 1,
        drops: [
            { item_key: "herb", chance: 0.35, quantity: [1, 2] },
            { item_key: "leather", chance: 0.15, quantity: [1, 1] },
        ],
    },
    "skeleton": {
        name: "Esqueleto",
        max_hp: 112,
        attack: 8,
        defense: 6,
        exp_range: [6, 11],
        gold_range: [3, 6],
        speed: 1,
        drops: [
            { item_key: "iron_ore", chance: 0.3, quantity: [1, 2] },
            { item_key: "basic_potion", chance: 0.1, quantity: [1, 1] },
        ],
    },
    "zombie": {
        name: "Zumbi",
        max_hp: 140,
        attack: 11,
        defense: 8,
        exp_range: [6, 11],
        gold_range: [5, 10],
        speed: 1,
        drops: [
            { item_key: "iron_ore", chance: 0.5, quantity: [2, 4] },
            { item_key: "leather", chance: 0.4, quantity: [1, 3] },
            { item_key: "herb", chance: 0.2, quantity: [1, 1] },
        ],
    },
    "goblin": {
        name: "Goblin",
        max_hp: 168,
        attack: 14,
        defense: 10,
        exp_range: [6, 11],
        gold_range: [6, 13],
        speed: 2,
        drops: [
            { item_key: "iron_ore", chance: 0.4, quantity: [1, 3] },
            { item_key: "leather", chance: 0.2, quantity: [1, 2] },
            { item_key: "basic_potion", chance: 0.15, quantity: [1, 1] },
        ],
    },
    "wolf": {
        name: "Lobo Selvagem",
        max_hp: 196,
        attack: 17,
        defense: 11,
        exp_range: [6, 11],
        gold_range: [8, 16],
        speed: 1,
        drops: [
            { item_key: "leather", chance: 0.5, quantity: [1, 3] },
            { item_key: "herb", chance: 0.2, quantity: [1, 2] },
        ],
    },
    "bandit": {
        name: "Bandido",
        max_hp: 280,
        attack: 26,
        defense: 16,
        exp_range: [11, 22],
        gold_range: [10, 21],
        speed: 2,
        drops: [
            { item_key: "iron_ore", chance: 0.35, quantity: [2, 4] },
            { item_key: "leather", chance: 0.35, quantity: [2, 3] },
            { item_key: "basic_potion", chance: 0.15, quantity: [1, 2] },
        ],
    },
    "orc": {
        name: "Orc",
        max_hp: 364,
        attack: 35,
        defense: 21,
        exp_range: [11, 22],
        gold_range: [13, 26],
        speed: 2,
        drops: [
            { item_key: "iron_ore", chance: 0.6, quantity: [2, 5] },
            { item_key: "leather", chance: 0.5, quantity: [2, 4] },
            { item_key: "herb", chance: 0.3, quantity: [1, 2] },
        ],
    },
    "ogre": {
        name: "Ogro",
        max_hp: 476,
        attack: 47,
        defense: 27,
        exp_range: [11, 22],
        gold_range: [16, 32],
        speed: 2,
        drops: [
            { item_key: "iron_ore", chance: 0.5, quantity: [3, 6] },
            { item_key: "spider_silk", chance: 0.2, quantity: [1, 2] },
            { item_key: "greater_potion", chance: 0.15, quantity: [1, 1] },
        ],
    },
    "harpy": {
        name: "Harpia",
        max_hp: 686,
        attack: 70,
        defense: 39,
        exp_range: [17, 33],
        gold_range: [20, 40],
        speed: 4,
        drops: [
            { item_key: "spider_silk", chance: 0.35, quantity: [1, 3] },
            { item_key: "greater_potion", chance: 0.2, quantity: [1, 1] },
        ],
    },
    "giant_spider": {
        name: "Aranha Gigante",
        max_hp: 896,
        attack: 92,
        defense: 51,
        exp_range: [17, 33],
        gold_range: [24, 48],
        speed: 3,
        drops: [
            { item_key: "spider_silk", chance: 0.5, quantity: [1, 3] },
            { item_key: "herb", chance: 0.3, quantity: [1, 2] },
            { item_key: "greater_potion", chance: 0.1, quantity: [1, 1] },
        ],
    },
    "troll": {
        name: "Troll",
        max_hp: 1344,
        attack: 140,
        defense: 77,
        exp_range: [22, 44],
        gold_range: [30, 61],
        speed: 4,
        drops: [
            { item_key: "troll_fang", chance: 0.5, quantity: [1, 2] },
            { item_key: "leather", chance: 0.4, quantity: [2, 4] },
            { item_key: "iron_ore", chance: 0.3, quantity: [2, 4] },
        ],
    },
    "golem": {
        name: "Golem de Pedra",
        max_hp: 1806,
        attack: 190,
        defense: 103,
        exp_range: [28, 56],
        gold_range: [36, 72],
        speed: 4,
        drops: [
            { item_key: "mithril_ore", chance: 0.3, quantity: [1, 2] },
            { item_key: "troll_fang", chance: 0.25, quantity: [1, 2] },
            { item_key: "greater_potion", chance: 0.2, quantity: [1, 2] },
        ],
    },
    "wyvern": {
        name: "Wyvern",
        max_hp: 2576,
        attack: 272,
        defense: 147,
        exp_range: [33, 67],
        gold_range: [44, 88],
        speed: 5,
        drops: [
            { item_key: "wyvern_scale", chance: 0.45, quantity: [1, 3] },
            { item_key: "mithril_ore", chance: 0.15, quantity: [1, 2] },
            { item_key: "greater_potion", chance: 0.2, quantity: [1, 1] },
        ],
    },
    "basilisk": {
        name: "Basilisco",
        max_hp: 3486,
        attack: 370,
        defense: 199,
        exp_range: [39, 78],
        gold_range: [52, 104],
        speed: 6,
        drops: [
            { item_key: "wyvern_scale", chance: 0.4, quantity: [2, 4] },
            { item_key: "dark_essence", chance: 0.2, quantity: [1, 2] },
            { item_key: "greater_potion", chance: 0.25, quantity: [1, 2] },
        ],
    },
    "minotaur": {
        name: "Minotauro",
        max_hp: 4536,
        attack: 482,
        defense: 259,
        exp_range: [44, 89],
        gold_range: [60, 120],
        speed: 7,
        drops: [
            { item_key: "mithril_ore", chance: 0.4, quantity: [2, 4] },
            { item_key: "dark_essence", chance: 0.25, quantity: [1, 3] },
            { item_key: "greater_potion", chance: 0.25, quantity: [1, 2] },
        ],
    },
    "shadow_reaper": {
        name: "Ceifador Sombrio",
        max_hp: 5726,
        attack: 610,
        defense: 327,
        exp_range: [50, 100],
        gold_range: [68, 136],
        speed: 8,
        drops: [
            { item_key: "dark_essence", chance: 0.5, quantity: [1, 3] },
            { item_key: "mithril_ore", chance: 0.25, quantity: [1, 3] },
            { item_key: "greater_potion", chance: 0.25, quantity: [1, 2] },
        ],
    },
    "demon_knight": {
        name: "Cavaleiro Demoníaco",
        max_hp: 6636,
        attack: 707,
        defense: 379,
        exp_range: [56, 111],
        gold_range: [74, 147],
        speed: 8,
        drops: [
            { item_key: "dark_essence", chance: 0.5, quantity: [2, 4] },
            { item_key: "mithril_ore", chance: 0.35, quantity: [2, 4] },
            { item_key: "greater_potion", chance: 0.3, quantity: [1, 2] },
        ],
    },
    "ancient_dragon": {
        name: "Dragão Ancião",
        max_hp: 7336,
        attack: 782,
        defense: 419,
        exp_range: [56, 111],
        gold_range: [78, 155],
        speed: 9,
        drops: [
            { item_key: "wyvern_scale", chance: 0.4, quantity: [3, 5] },
            { item_key: "dark_essence", chance: 0.4, quantity: [2, 4] },
            { item_key: "greater_potion", chance: 0.3, quantity: [1, 2] },
        ],
    },
    "death_lord": {
        name: "Senhor da Morte",
        max_hp: 7756,
        attack: 827,
        defense: 443,
        exp_range: [56, 111],
        gold_range: [80, 160],
        speed: 9,
        drops: [
            { item_key: "dark_essence", chance: 0.55, quantity: [3, 5] },
            { item_key: "mithril_ore", chance: 0.45, quantity: [3, 5] },
            { item_key: "greater_potion", chance: 0.35, quantity: [1, 3] },
        ],
    },
};

// ============ ABILITY DATABASE ============

export const ABILITY_DATABASE: Record<string, Ability> = {
    "fire_strike": {
        name: "Fire Strike",
        level_required: 5,
        exp_cost: 20,
        damage_multiplier: 1.5,
        duration: 0,
    },
    "power_defense": {
        name: "Power Defense",
        level_required: 10,
        exp_cost: 30,
        damage_multiplier: 0,
        duration: 2,
    },
};

// ============ RECIPE DATABASE ============

export const RECIPE_DATABASE: Record<string, Recipe> = {
    "basic_potion": {
        name: "Poção de Vida Básica",
        level_required: 1,
        required_materials: { herb: 2 },
        crafted_item: "basic_potion",
    },
    "common_sword": {
        name: "Espada Comum",
        level_required: 3,
        required_materials: { iron_ore: 3 },
        crafted_item: "common_sword",
    },
    "common_shield": {
        name: "Escudo Comum",
        level_required: 5,
        required_materials: { iron_ore: 2, leather: 2 },
        crafted_item: "common_shield",
    },
    "iron_sword": {
        name: "Espada de Ferro",
        level_required: 8,
        required_materials: { iron_ore: 5, leather: 1 },
        crafted_item: "iron_sword",
    },
    "iron_armor": {
        name: "Armadura de Ferro",
        level_required: 10,
        required_materials: { iron_ore: 6, leather: 3 },
        crafted_item: "iron_armor",
    },
    "greater_potion": {
        name: "Poção de Vida Maior",
        level_required: 20,
        required_materials: { herb: 4, spider_silk: 1 },
        crafted_item: "greater_potion",
    },
    "steel_sword": {
        name: "Espada de Aço",
        level_required: 38,
        required_materials: { iron_ore: 6, troll_fang: 2 },
        crafted_item: "steel_sword",
    },
    "steel_armor": {
        name: "Armadura de Aço",
        level_required: 38,
        required_materials: { iron_ore: 7, troll_fang: 2, leather: 2 },
        crafted_item: "steel_armor",
    },
    "hunter_bow": {
        name: "Arco de Caçador",
        level_required: 30,
        required_materials: { spider_silk: 4, troll_fang: 1, leather: 3 },
        crafted_item: "hunter_bow",
    },
    "wyvern_blade": {
        name: "Lâmina de Wyvern",
        level_required: 55,
        required_materials: { wyvern_scale: 4, mithril_ore: 2 },
        crafted_item: "wyvern_blade",
    },
    "wyvern_plate": {
        name: "Placa de Wyvern",
        level_required: 55,
        required_materials: { wyvern_scale: 5, mithril_ore: 2 },
        crafted_item: "wyvern_plate",
    },
    "shadow_dagger": {
        name: "Adaga Sombria",
        level_required: 65,
        required_materials: { dark_essence: 4, mithril_ore: 3 },
        crafted_item: "shadow_dagger",
    },
    "mithril_armor": {
        name: "Armadura de Mithril",
        level_required: 65,
        required_materials: { dark_essence: 4, mithril_ore: 4 },
        crafted_item: "mithril_armor",
    },
};