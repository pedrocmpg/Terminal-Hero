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
    "common_arrow": {
        name: "Flecha Comum",
        item_type: "consumivel",
        value: 5,
        effect_value: 10,
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
    },
    "goblin": {
        name: "Goblin",
        max_hp: 55,
        attack: 12,
        defense: 4,
        exp_range: [5, 15],
        gold_range: [5, 10],
    },
    "zombie": {
        name: "Zombie",
        max_hp: 100,
        attack: 8,
        defense: 6,
        exp_range: [10, 20],
        gold_range: [10, 15],
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
};