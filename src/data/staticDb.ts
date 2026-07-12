export interface Item {
  id: string;
  name: string;
  item_type: string;
  value: number;
  effect_value: number;
  price: number;
}

export interface Monster {
  id: string;
  name: string;
  max_hp: number;
  attack: number;
  defense: number;
  speed: number;
  exp_range: [number, number];
  gold_range: [number, number];
}

export const ITEM_DATABASE: Record<string, Item> = {
    "basic_potion": {
        id: "basic_potion",
        name: "Pocão de Vida Básica",
        item_type: "consumivel",
        value: 30,
        effect_value: 50,
        price: 10
    }
}

export const MONSTER_DATABASE: Record<string, Monster> = {
    "slime_inferior": {
        id: "slime_inferior",
        name: "Slime Inferior",
        max_hp: 30,
        attack: 4,
        defense: 1,
        speed: 2,
        exp_range: [1, 10],
        gold_range: [1, 5]
    },
    "slime_superior": {
        id: "slime_superior",
        name: "Slime Superior",
        max_hp: 50,
        attack: 6,
        defense: 2,
        speed: 3,
        exp_range: [5, 15],
        gold_range: [3, 8]
    }
}