import { MONSTER_DATABASE, ITEM_DATABASE, ABILITY_DATABASE, RECIPE_DATABASE } from "../data/staticDb";

// ============ INTERFACES ============

export interface PlayerState {
    name: string;
    hp: number;
    max_hp: number;
    attack: number;
    base_attack: number;
    defense: number;
    base_defense: number;
    speed: number;
    exp: number;
    exp_to_next_level: number;
    level: number;
    gold: number;
    inventory: Record<string, number>;
    skills: string[];
    abilities: string[];
    absolute_skills: string[];
    learned_recipes: string[];
    equipped_weapon: string | null;
    equipped_armor: string | null;
    last_saved_at: number;
}

export interface ItemData {
    name: string;
    item_type: "consumivel" | "arma" | "armadura" | "material";
    value: number;
    damage_bonus?: number;
    defense_bonus?: number;
    effect_value?: number;
}

export interface MonsterData {
    name: string;
    max_hp: number;
    attack: number;
    defense: number;
    exp_range: [number, number];
    gold_range: [number, number];
    speed?: number;
}

export interface AbilityData {
    name: string;
    level_required: number;
    exp_cost: number;
    damage_multiplier: number;
    duration: number;
}

// ============ CONSTANTS ============

const PLAYER_STARTING_STATS = {
    hp: 100,
    attack: 10,
    defense: 5,
    speed: 1,
    level: 1,
};

const initialPlayerState: PlayerState = {
    name: "Hero",
    hp: PLAYER_STARTING_STATS.hp,
    max_hp: PLAYER_STARTING_STATS.hp,
    attack: PLAYER_STARTING_STATS.attack,
    base_attack: PLAYER_STARTING_STATS.attack,
    defense: PLAYER_STARTING_STATS.defense,
    base_defense: PLAYER_STARTING_STATS.defense,
    speed: PLAYER_STARTING_STATS.speed,
    exp: 0,
    exp_to_next_level: 100,
    level: PLAYER_STARTING_STATS.level,
    gold: 0,
    inventory: {
        "basic_potion": 3,
    },
    skills: [],
    abilities: [],
    absolute_skills: [],
    learned_recipes: ["basic_potion"],
    equipped_weapon: null,
    equipped_armor: null,
    last_saved_at: Date.now(),
};

// ============ INVENTORY MANAGEMENT ============

const MAX_INVENTORY_SLOTS = 50;

export function addItemToInventory(
    inventory: Record<string, number>,
    item_key: string,
    quantity: number = 1
): { success: boolean; error?: string; inventory?: Record<string, number> } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item '${item_key}' não existe no banco de dados!` };
    }

    const uniqueItems = Object.keys(inventory).length;
    const newItemsCount = item_key in inventory ? 0 : 1;

    if (uniqueItems + newItemsCount > MAX_INVENTORY_SLOTS) {
        return { success: false, error: "Inventário cheio! Máximo de 50 tipos de itens." };
    }

    const newInventory = { ...inventory };
    newInventory[item_key] = (newInventory[item_key] || 0) + quantity;

    return { success: true, inventory: newInventory };
}

export function removeItemFromInventory(
    inventory: Record<string, number>,
    item_key: string,
    quantity: number = 1
): { success: boolean; error?: string; inventory?: Record<string, number> } {
    if (!inventory[item_key] || inventory[item_key] < quantity) {
        return { success: false, error: `Não há quantidade suficiente de '${item_key}'.` };
    }

    const newInventory = { ...inventory };
    newInventory[item_key] -= quantity;

    if (newInventory[item_key] === 0) {
        delete newInventory[item_key];
    }

    return { success: true, inventory: newInventory };
}

export function hasItem(
    inventory: Record<string, number>,
    item_key: string,
    quantity: number = 1
): boolean {
    return (inventory[item_key] || 0) >= quantity;
}

export function getItemQuantity(
    inventory: Record<string, number>,
    item_key: string
): number {
    return inventory[item_key] || 0;
}

export function listInventoryItems(inventory: Record<string, number>): string[] {
    if (Object.keys(inventory).length === 0) {
        return ["Inventário vazio"];
    }

    return Object.entries(inventory).map(([item_key, quantity]) => {
        const itemData = ITEM_DATABASE[item_key];
        return `${itemData?.name || item_key} x${quantity}`;
    });
}

// ============ EQUIPMENT MANAGEMENT ============

export function equipWeapon(
    playerState: PlayerState,
    item_key: string
): { success: boolean; error?: string; updatedState?: PlayerState } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item '${item_key}' não existe!` };
    }

    const itemData = ITEM_DATABASE[item_key];
    if (itemData.item_type !== "arma") {
        return { success: false, error: `'${itemData.name}' não é uma arma!` };
    }

    if (!hasItem(playerState.inventory, item_key)) {
        return { success: false, error: `Você não possui '${itemData.name}'!` };
    }

    // Desquipa arma anterior se existir
    let updatedInventory = { ...playerState.inventory };
    if (playerState.equipped_weapon) {
        const result = addItemToInventory(updatedInventory, playerState.equipped_weapon, 1);
        if (result.success) {
            updatedInventory = result.inventory!;
        }
    }

    // Remove do inventário e equipa
    const removeResult = removeItemFromInventory(updatedInventory, item_key, 1);
    if (!removeResult.success) {
        return { success: false, error: removeResult.error };
    }

    const damageBonus = itemData.damage_bonus || 0;
    const updatedState: PlayerState = {
        ...playerState,
        inventory: removeResult.inventory!,
        equipped_weapon: item_key,
        attack: playerState.base_attack + damageBonus,
    };

    return { success: true, updatedState };
}

export function unequipWeapon(playerState: PlayerState): { success: boolean; updatedState?: PlayerState } {
    if (!playerState.equipped_weapon) {
        return { success: false };
    }

    const result = addItemToInventory(playerState.inventory, playerState.equipped_weapon, 1);
    if (!result.success) {
        return { success: false };
    }

    return {
        success: true,
        updatedState: {
            ...playerState,
            inventory: result.inventory!,
            equipped_weapon: null,
            attack: playerState.base_attack,
        },
    };
}

export function equipArmor(
    playerState: PlayerState,
    item_key: string
): { success: boolean; error?: string; updatedState?: PlayerState } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item '${item_key}' não existe!` };
    }

    const itemData = ITEM_DATABASE[item_key];
    if (itemData.item_type !== "armadura") {
        return { success: false, error: `'${itemData.name}' não é uma armadura!` };
    }

    if (!hasItem(playerState.inventory, item_key)) {
        return { success: false, error: `Você não possui '${itemData.name}'!` };
    }

    // Desquipa armadura anterior se existir
    let updatedInventory = { ...playerState.inventory };
    if (playerState.equipped_armor) {
        const result = addItemToInventory(updatedInventory, playerState.equipped_armor, 1);
        if (result.success) {
            updatedInventory = result.inventory!;
        }
    }

    // Remove do inventário e equipa
    const removeResult = removeItemFromInventory(updatedInventory, item_key, 1);
    if (!removeResult.success) {
        return { success: false, error: removeResult.error };
    }

    const defenseBonus = itemData.defense_bonus || 0;
    const updatedState: PlayerState = {
        ...playerState,
        inventory: removeResult.inventory!,
        equipped_armor: item_key,
        defense: playerState.base_defense + defenseBonus,
    };

    return { success: true, updatedState };
}

export function unequipArmor(playerState: PlayerState): { success: boolean; updatedState?: PlayerState } {
    if (!playerState.equipped_armor) {
        return { success: false };
    }

    const result = addItemToInventory(playerState.inventory, playerState.equipped_armor, 1);
    if (!result.success) {
        return { success: false };
    }

    return {
        success: true,
        updatedState: {
            ...playerState,
            inventory: result.inventory!,
            equipped_armor: null,
            defense: playerState.base_defense,
        },
    };
}

// ============ CONSUMABLES ============

export function useConsumable(
    playerState: PlayerState,
    item_key: string
): { success: boolean; error?: string; updatedState?: PlayerState; message?: string } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item '${item_key}' não existe!` };
    }

    const itemData = ITEM_DATABASE[item_key];
    if (itemData.item_type !== "consumivel") {
        return { success: false, error: `'${itemData.name}' não é um consumível!` };
    }

    if (!hasItem(playerState.inventory, item_key)) {
        return { success: false, error: `Você não possui '${itemData.name}'!` };
    }

    const result = removeItemFromInventory(playerState.inventory, item_key, 1);
    if (!result.success) {
        return { success: false, error: result.error };
    }

    let updatedState = { ...playerState, inventory: result.inventory! };
    let message = "";

    // Aplicar efeito dinamicamente baseado em item_type
    const effectValue = itemData.effect_value || 0;

    // Todos os consumíveis curam por padrão
    updatedState.hp = Math.min(updatedState.hp + effectValue, updatedState.max_hp);
    message = `${playerState.name} usou ${itemData.name} e curou ${effectValue} de HP!`;

    return { success: true, updatedState, message };
}

// ============ LEVEL UP LOGIC ============

export function calculateLevelUp(currentPlayerState: PlayerState): PlayerState {
    let tempState = { ...currentPlayerState };

    while (tempState.exp >= tempState.exp_to_next_level) {
        const expNeeded = tempState.exp_to_next_level;
        const newLevel = tempState.level + 1;
        const newExp = tempState.exp - expNeeded;

        // Incrementar stats base (não modificados por equipamento)
        const newMaxHp = tempState.max_hp + 10;
        const newBaseAttack = tempState.base_attack + 2;
        const newBaseDefense = tempState.base_defense + 2;
        const newSpeed = tempState.speed + 1;

        // Recalcular attack e defense com modificadores de equipamento
        const weaponBonus = tempState.equipped_weapon
            ? (ITEM_DATABASE[tempState.equipped_weapon]?.damage_bonus || 0)
            : 0;
        const armorBonus = tempState.equipped_armor
            ? (ITEM_DATABASE[tempState.equipped_armor]?.defense_bonus || 0)
            : 0;

        const newAttack = newBaseAttack + weaponBonus;
        const newDefense = newBaseDefense + armorBonus;

        tempState = {
            ...tempState,
            level: newLevel,
            max_hp: newMaxHp,
            hp: newMaxHp,
            base_attack: newBaseAttack,
            attack: newAttack,
            base_defense: newBaseDefense,
            defense: newDefense,
            speed: newSpeed,
            exp: newExp,
            exp_to_next_level: tempState.exp_to_next_level + 50,
        };
    }

    return tempState;
}

// ============ EXPERIENCE ============

export function gainExp(playerState: PlayerState, amount: number): PlayerState {
    const updatedState = {
        ...playerState,
        exp: playerState.exp + amount,
    };
    return calculateLevelUp(updatedState);
}

export function gainGold(playerState: PlayerState, amount: number): PlayerState {
    return {
        ...playerState,
        gold: playerState.gold + amount,
    };
}

export function spendGold(
    playerState: PlayerState,
    amount: number
): { success: boolean; error?: string; updatedState?: PlayerState } {
    if (playerState.gold < amount) {
        return { success: false, error: "Ouro insuficiente!" };
    }

    return {
        success: true,
        updatedState: {
            ...playerState,
            gold: playerState.gold - amount,
        },
    };
}

// ============ PERSISTENCE ============

export function saveGame(state: PlayerState): void {
    const stateToSave = { ...state, last_saved_at: Date.now() };
    localStorage.setItem("terminal_hero_save", JSON.stringify(stateToSave));
}

export function loadGame(): PlayerState {
    const savedState = localStorage.getItem("terminal_hero_save");
    if (savedState) {
        try {
            return JSON.parse(savedState) as PlayerState;
        } catch {
            console.warn("Erro ao carregar save, usando estado inicial");
            return initialPlayerState;
        }
    }
    return initialPlayerState;
}

export function processOfflineProgress(savedState: PlayerState): PlayerState {
    const currentTime = Date.now();
    const timeElapsedMs = currentTime - savedState.last_saved_at;
    const timeElapsedSeconds = timeElapsedMs / 1000;
    const timeElapsedMinutes = timeElapsedSeconds / 60;

    // Configuráveis baseado em game balance
    const XP_PER_MINUTE = 2; // 2 XP por minuto offline
    const GOLD_PER_MINUTE = 1; // 1 gold por minuto offline
    const MAX_OFFLINE_TIME_MINUTES = 7 * 24 * 60; // 7 dias máximo

    // Limita o tempo considerado (evita exploits)
    const effectiveMinutes = Math.min(timeElapsedMinutes, MAX_OFFLINE_TIME_MINUTES);

    // Cálculo direto (sem loops)
    const xpGained = Math.floor(effectiveMinutes * XP_PER_MINUTE);
    const goldGained = Math.floor(effectiveMinutes * GOLD_PER_MINUTE);

    // Aplicar ganhos
    let updatedState = gainExp(
        gainGold(savedState, goldGained),
        xpGained
    );

    // Atualizar timestamp
    updatedState.last_saved_at = currentTime;

    return updatedState;
}

// ============ BATTLE LOGIC ============

export function monsterBattle(
    playerState: PlayerState,
    monsterKey: string,
    isOffline: boolean = false
): { updatedPlayerState: PlayerState; battleLog: string[] } {
    const monster = MONSTER_DATABASE[monsterKey];
    if (!monster) {
        throw new Error(`Monster with key ${monsterKey} not found.`);
    }

    let battleLog: string[] = [];
    let playerHp = playerState.hp;
    let monsterHp = monster.max_hp;

    // Determinar quem ataca primeiro baseado em speed
    // Quanto maior o speed, mais provável atacar primeiro
    const playerSpeed = playerState.speed;
    const monsterSpeed = monster.speed || 1;

    let isPlayerTurn = playerSpeed >= monsterSpeed;

    if (!isOffline) {
        battleLog.push(
            `Player (SPD: ${playerSpeed}) vs ${monster.name} (SPD: ${monsterSpeed})`
        );
        battleLog.push(`${isPlayerTurn ? "Player" : monster.name} attacks first!`);
    }

    while (playerHp > 0 && monsterHp > 0) {
        if (isPlayerTurn) {
            const playerDamage = Math.max(playerState.attack - monster.defense, 1);
            monsterHp -= playerDamage;

            if (!isOffline) {
                battleLog.push(
                    `Player attacks ${monster.name} for ${playerDamage} damage. (Monster HP: ${Math.max(monsterHp, 0)})`
                );
            }
        } else {
            const monsterDamage = Math.max(monster.attack - playerState.defense, 1);
            playerHp -= monsterDamage;

            if (!isOffline) {
                battleLog.push(
                    `${monster.name} attacks Player for ${monsterDamage} damage. (Player HP: ${Math.max(playerHp, 0)})`
                );
            }
        }

        isPlayerTurn = !isPlayerTurn;
    }

    let updatedPlayerState = { ...playerState };

    if (playerHp > 0) {
        const [minExp, maxExp] = monster.exp_range;
        const [minGold, maxGold] = monster.gold_range;
        const expGained = Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp;
        const goldGained = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;

        updatedPlayerState = gainExp(updatedPlayerState, expGained);
        updatedPlayerState = gainGold(updatedPlayerState, goldGained);
        updatedPlayerState.hp = updatedPlayerState.max_hp;

        if (!isOffline) {
            battleLog.push(`Player defeated ${monster.name}! Gained ${expGained} EXP and ${goldGained} gold.`);
        }
    } else {
        updatedPlayerState.hp = Math.floor(updatedPlayerState.max_hp / 2);
        if (!isOffline) {
            battleLog.push(`Player was defeated by ${monster.name}. Revived with 50% HP.`);
        }
    }

    return { updatedPlayerState, battleLog };
}

// ============ ABILITY MANAGEMENT ============

export function getAbilityInfo(ability_key: string): { success: boolean; data?: AbilityData; error?: string } {
    const ability = ABILITY_DATABASE[ability_key];
    if (!ability) {
        return { success: false, error: `Ability '${ability_key}' não existe!` };
    }
    return { success: true, data: ability };
}

export function canUseAbility(playerState: PlayerState, ability_key: string): boolean {
    const ability = ABILITY_DATABASE[ability_key];
    if (!ability) return false;

    return playerState.level >= ability.level_required && playerState.exp >= ability.exp_cost;
}

// ============ RECIPE MANAGEMENT ============

export function getRecipeInfo(recipe_key: string): { success: boolean; data?: any; error?: string } {
    const recipe = RECIPE_DATABASE[recipe_key];
    if (!recipe) {
        return { success: false, error: `Receita '${recipe_key}' não existe!` };
    }
    return { success: true, data: recipe };
}

export function canLearnRecipe(playerState: PlayerState, recipe_key: string): boolean {
    const recipe = RECIPE_DATABASE[recipe_key];
    if (!recipe) return false;

    return playerState.level >= recipe.level_required;
}

export function learnRecipe(playerState: PlayerState, recipe_key: string): { success: boolean; error?: string; updatedState?: PlayerState } {
    if (playerState.learned_recipes.includes(recipe_key)) {
        return { success: false, error: "Receita já aprendida!" };
    }

    if (!canLearnRecipe(playerState, recipe_key)) {
        return { success: false, error: "Nível insuficiente para aprender esta receita!" };
    }

    return {
        success: true,
        updatedState: {
            ...playerState,
            learned_recipes: [...playerState.learned_recipes, recipe_key],
        },
    };
}