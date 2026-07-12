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
    "goblin": {
        name: "Goblin",
        max_hp: 55,
        attack: 12,
        defense: 4,
        exp_range: [5, 15],
        gold_range: [5, 10],
        speed: 2,
        drops: [
            { item_key: "iron_ore", chance: 0.4, quantity: [1, 3] },
            { item_key: "leather", chance: 0.2, quantity: [1, 2] },
            { item_key: "basic_potion", chance: 0.15, quantity: [1, 1] },
        ],
    },
    "zombie": {
        name: "Zombie",
        max_hp: 100,
        attack: 8,
        defense: 6,
        exp_range: [10, 20],
        gold_range: [10, 15],
        speed: 1,
        drops: [
            { item_key: "iron_ore", chance: 0.5, quantity: [2, 4] },
            { item_key: "leather", chance: 0.4, quantity: [1, 3] },
            { item_key: "herb", chance: 0.2, quantity: [1, 1] },
        ],
    },
    "orc": {
        name: "Orc",
        max_hp: 120,
        attack: 15,
        defense: 7,
        exp_range: [20, 35],
        gold_range: [15, 25],
        speed: 2,
        drops: [
            { item_key: "iron_ore", chance: 0.6, quantity: [2, 5] },
            { item_key: "leather", chance: 0.5, quantity: [2, 4] },
            { item_key: "herb", chance: 0.3, quantity: [1, 2] },
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
};