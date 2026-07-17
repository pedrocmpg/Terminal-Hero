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
    learned_abilities: string[];
    equipped_weapon: string | null;
    equipped_armor: string | null;
    last_saved_at: number;
    // REQUISITO 4: Rastreamento Completo de Estatísticas
    battles_total: number;
    battles_won: number;
    battles_lost: number;
    experience_total: number;
    playtime_seconds: number;
    monsters_defeated: Record<string, number>;
    // REQUISITO 8: Validação de Save - Efeitos Ativos
    active_effects: Array<{
        effect_type: "damage_boost" | "defense_boost" | "heal_over_time";
        value: number;
        turns_remaining: number;
    }>;
    // Prestige System
    prestige_level: number;
    prestige_points: number;
    total_lifetime_exp: number;
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
    exp_to_next_level: calculateExpForLevel(1),
    level: PLAYER_STARTING_STATS.level,
    gold: 0,
    inventory: {
        "basic_potion": 3,
        "herb": 2,
    },
    skills: [],
    abilities: [],
    absolute_skills: [],
    learned_recipes: ["basic_potion"],
    learned_abilities: [],
    equipped_weapon: null,
    equipped_armor: null,
    last_saved_at: Date.now(),
    // REQUISITO 4
    battles_total: 0,
    battles_won: 0,
    battles_lost: 0,
    experience_total: 0,
    playtime_seconds: 0,
    monsters_defeated: {},
    // REQUISITO 8
    active_effects: [],
    // Prestige
    prestige_level: 0,
    prestige_points: 0,
    total_lifetime_exp: 0,
};

// ============ REQUISITO 1: CURVA DE XP DINÂMICA ============

/**
 * Calcula o XP necessário para alcançar um nível específico.
 * Levels 1-10: level * 100
 * Levels 11-20: level * 200
 * Levels 21-30: level * 300
 * Padrão: a cada 10 níveis, multiplica por 100 a mais
 */
export function calculateExpForLevel(level: number): number {
    const bracket = Math.floor((level - 1) / 10);
    const multiplier = (bracket + 1) * 100;
    return level * multiplier;
}

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

    let updatedInventory = { ...playerState.inventory };
    if (playerState.equipped_weapon) {
        const result = addItemToInventory(updatedInventory, playerState.equipped_weapon, 1);
        if (result.success) {
            updatedInventory = result.inventory!;
        }
    }

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

    let updatedInventory = { ...playerState.inventory };
    if (playerState.equipped_armor) {
        const result = addItemToInventory(updatedInventory, playerState.equipped_armor, 1);
        if (result.success) {
            updatedInventory = result.inventory!;
        }
    }

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

// ============ REQUISITO 7: CONSUMÁVEIS (VALIDAÇÃO) ============

export function useConsumable(
    playerState: PlayerState,
    item_key: string
): { success: boolean; error?: string; updatedState?: PlayerState; message?: string } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item '${item_key}' não existe!` };
    }

    const itemData = ITEM_DATABASE[item_key];
    // REQUISITO 7: Apenas consumíveis podem ser "usados"
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
    const effectValue = itemData.effect_value || 0;

    updatedState.hp = Math.min(updatedState.hp + effectValue, updatedState.max_hp);
    const message = `${playerState.name} usou ${itemData.name} e curou ${effectValue} de HP!`;

    return { success: true, updatedState, message };
}

// ============ REQUISITO 6: SISTEMA DE COMPRA E VENDA PROTEGIDO ============

export function sellItem(
    playerState: PlayerState,
    item_key: string,
    quantity: number = 1
): { success: boolean; error?: string; updatedState?: PlayerState; gold_gained?: number } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item '${item_key}' não existe!` };
    }

    if (!hasItem(playerState.inventory, item_key, quantity)) {
        return { success: false, error: `Você não possui ${quantity}x ${ITEM_DATABASE[item_key].name}!` };
    }

    // REQUISITO 6: Trava rígida - não pode vender items equipados
    if (playerState.equipped_weapon === item_key || playerState.equipped_armor === item_key) {
        return { success: false, error: `Você não pode vender um item equipado!` };
    }

    const result = removeItemFromInventory(playerState.inventory, item_key, quantity);
    if (!result.success) {
        return { success: false, error: result.error };
    }

    const itemData = ITEM_DATABASE[item_key];
    const goldGained = itemData.value * quantity;

    const updatedState: PlayerState = {
        ...playerState,
        inventory: result.inventory!,
        gold: playerState.gold + goldGained,
    };

    return { success: true, updatedState, gold_gained: goldGained };
}

export function buyItem(
    playerState: PlayerState,
    item_key: string,
    quantity: number = 1
): { success: boolean; error?: string; updatedState?: PlayerState; gold_spent?: number } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item '${item_key}' não existe!` };
    }

    const itemData = ITEM_DATABASE[item_key];
    const goldNeeded = itemData.value * quantity;

    if (playerState.gold < goldNeeded) {
        return { success: false, error: `Ouro insuficiente! Você precisa de ${goldNeeded} ouro.` };
    }

    const result = addItemToInventory(playerState.inventory, item_key, quantity);
    if (!result.success) {
        return { success: false, error: result.error };
    }

    const updatedState: PlayerState = {
        ...playerState,
        inventory: result.inventory!,
        gold: playerState.gold - goldNeeded,
    };

    return { success: true, updatedState, gold_spent: goldNeeded };
}

// ============ REQUISITO 5: SISTEMA DE CRAFTING REAL ============

export function craftItem(
    playerState: PlayerState,
    recipe_key: string
): { success: boolean; error?: string; updatedState?: PlayerState; message?: string } {
    const recipe = RECIPE_DATABASE[recipe_key];
    if (!recipe) {
        return { success: false, error: `Receita '${recipe_key}' não existe!` };
    }

    // Verificar nível
    if (playerState.level < recipe.level_required) {
        return { success: false, error: `Nível insuficiente! Você precisa ser nível ${recipe.level_required}.` };
    }

    // Verificar se conhece a receita
    if (!playerState.learned_recipes.includes(recipe_key)) {
        return { success: false, error: `Você não aprendeu esta receita!` };
    }

    // Verificar materiais
    for (const [material_key, needed_quantity] of Object.entries(recipe.required_materials)) {
        if (!hasItem(playerState.inventory, material_key, needed_quantity)) {
            const currentQuantity = getItemQuantity(playerState.inventory, material_key);
            return {
                success: false,
                error: `Materiais insuficientes! ${ITEM_DATABASE[material_key]?.name || material_key}: você tem ${currentQuantity}, precisa ${needed_quantity}.`,
            };
        }
    }

    // Consumir materiais
    let updatedInventory = { ...playerState.inventory };
    for (const [material_key, quantity] of Object.entries(recipe.required_materials)) {
        const result = removeItemFromInventory(updatedInventory, material_key, quantity);
        if (result.success) {
            updatedInventory = result.inventory!;
        }
    }

    // Adicionar item crafted
    const quantity_crafted = recipe.quantity_crafted || 1;
    const addResult = addItemToInventory(updatedInventory, recipe.crafted_item, quantity_crafted);
    if (!addResult.success) {
        return { success: false, error: addResult.error };
    }

    const itemData = ITEM_DATABASE[recipe.crafted_item];
    const message = `Você craftou ${quantity_crafted}x ${itemData?.name || recipe.crafted_item}!`;

    return {
        success: true,
        updatedState: {
            ...playerState,
            inventory: addResult.inventory!,
        },
        message,
    };
}

// ============ LEVEL UP LOGIC ============

export function calculateLevelUp(currentPlayerState: PlayerState): PlayerState {
    let tempState = { ...currentPlayerState };

    while (tempState.exp >= tempState.exp_to_next_level) {
        const expNeeded = tempState.exp_to_next_level;
        const newLevel = tempState.level + 1;
        const newExp = tempState.exp - expNeeded;

        const newMaxHp = tempState.max_hp + 10;
        const newBaseAttack = tempState.base_attack + 2;
        const newBaseDefense = tempState.base_defense + 2;
        const newSpeed = tempState.speed + 1;

        const weaponBonus = tempState.equipped_weapon
            ? (ITEM_DATABASE[tempState.equipped_weapon]?.damage_bonus || 0)
            : 0;
        const armorBonus = tempState.equipped_armor
            ? (ITEM_DATABASE[tempState.equipped_armor]?.defense_bonus || 0)
            : 0;

        const newAttack = newBaseAttack + weaponBonus;
        const newDefense = newBaseDefense + armorBonus;

        const nextLevelExp = calculateExpForLevel(newLevel);

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
            exp_to_next_level: nextLevelExp,
        };
    }

    return tempState;
}

// ============ EXPERIENCE ============

export function gainExp(playerState: PlayerState, amount: number): PlayerState {
    const updatedState = {
        ...playerState,
        exp: playerState.exp + amount,
        experience_total: playerState.experience_total + amount,
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
            const parsed = JSON.parse(savedState) as any;
            return migrateOldSave(parsed);
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
    const timeElapsedHours = timeElapsedMinutes / 60;

    const MAX_OFFLINE_TIME_MINUTES = 7 * 24 * 60; // 7 dias
    const effectiveMinutes = Math.min(timeElapsedMinutes, MAX_OFFLINE_TIME_MINUTES);

    // Escalar rewards baseado em prestige level
    const prestigeMultiplier = 1 + (savedState.prestige_level * 0.25);
    const XP_PER_MINUTE = 2 * prestigeMultiplier;
    const GOLD_PER_MINUTE = 1 * prestigeMultiplier;

    const xpGained = Math.floor(effectiveMinutes * XP_PER_MINUTE);
    const goldGained = Math.floor(effectiveMinutes * GOLD_PER_MINUTE);

    let updatedState = gainExp(gainGold(savedState, goldGained), xpGained);
    updatedState.last_saved_at = currentTime;
    updatedState.playtime_seconds += Math.floor(timeElapsedSeconds);

    // Log offline progress se foi mais de 1 minuto
    if (timeElapsedMinutes > 1) {
        console.log(`Offline progress: +${xpGained} XP, +${goldGained} Gold (${Math.round(timeElapsedMinutes)}m)`);
    }

    return updatedState;
}

// ============ REQUISITO 3: FLUXO DE COMBATE AUTOMÁTICO (TASKBAR HERO) ============

export interface BattleResult {
    updatedPlayerState: PlayerState;
    battleLog: string[];
    newMonsterKey: string | null;
    dropsInfo: Array<{ item_key: string; quantity: number }>;
}

/**
 * Processa um turno de combate automático entre herói e monstro.
 * Se o monstro morre, escolhe um novo monstro aleatório automaticamente.
 * REQUISITO 2: Processa drops com base nas chances exatas.
 * REQUISITO 4: Atualiza estatísticas completas.
 */
export function processCombatTurn(
    playerState: PlayerState,
    currentMonsterKey: string
): BattleResult {
    const monster = MONSTER_DATABASE[currentMonsterKey];
    if (!monster) {
        throw new Error(`Monster '${currentMonsterKey}' não encontrado.`);
    }

    let battleLog: string[] = [];
    let playerHp = playerState.hp;
    let monsterHp = monster.max_hp;
    let updatedState = { ...playerState };

    const playerSpeed = playerState.speed;
    const monsterSpeed = monster.speed || 1;
    let isPlayerTurn = playerSpeed >= monsterSpeed;

    battleLog.push(
        `> Combate iniciado: ${playerState.name} (SPD: ${playerSpeed}) vs ${monster.name} (SPD: ${monsterSpeed})`
    );

    // Simula até um máximo de 100 turnos para evitar loops infinitos
    let turnCount = 0;
    while (playerHp > 0 && monsterHp > 0 && turnCount < 100) {
        turnCount++;
        if (isPlayerTurn) {
            const playerDamage = Math.max(playerState.attack - monster.defense, 1);
            monsterHp -= playerDamage;
            battleLog.push(
                `  [TURNO ${turnCount}] ${playerState.name} ataca ${monster.name} por ${playerDamage} dano (HP: ${Math.max(monsterHp, 0)})`
            );
        } else {
            const monsterDamage = Math.max(monster.attack - playerState.defense, 1);
            playerHp -= monsterDamage;
            battleLog.push(
                `  [TURNO ${turnCount}] ${monster.name} ataca ${playerState.name} por ${monsterDamage} dano (HP: ${Math.max(playerHp, 0)})`
            );
        }

        isPlayerTurn = !isPlayerTurn;
    }

    let dropsInfo: Array<{ item_key: string; quantity: number }> = [];
    let newMonsterKey: string | null = null;

    if (playerHp > 0) {
        // ===== VITÓRIA =====
        const [minExp, maxExp] = monster.exp_range;
        const [minGold, maxGold] = monster.gold_range;
        const expGained = Math.floor(Math.random() * (maxExp - minExp + 1)) + minExp;
        const goldGained = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;

        updatedState = gainExp(updatedState, expGained);
        updatedState = gainGold(updatedState, goldGained);
        updatedState.hp = Math.min(playerHp, updatedState.max_hp);

        // REQUISITO 4: Atualizar estatísticas
        updatedState.battles_total += 1;
        updatedState.battles_won += 1;
        updatedState.monsters_defeated[currentMonsterKey] =
            (updatedState.monsters_defeated[currentMonsterKey] || 0) + 1;

        battleLog.push(`> ${monster.name} foi derrotado!`);
        battleLog.push(`> Ganhou ${expGained} XP e ${goldGained} ouro!`);

        // REQUISITO 2: Processar drops com chances exatas
        for (const drop of monster.drops) {
            if (Math.random() * 100 < drop.chance * 100) {
                const quantity =
                    Math.floor(Math.random() * (drop.quantity[1] - drop.quantity[0] + 1)) +
                    drop.quantity[0];
                const result = addItemToInventory(updatedState.inventory, drop.item_key, quantity);
                if (result.success) {
                    updatedState.inventory = result.inventory!;
                    const itemName = ITEM_DATABASE[drop.item_key]?.name || drop.item_key;
                    battleLog.push(`  📦 ${monster.name} dropou ${quantity}x ${itemName}`);
                    dropsInfo.push({ item_key: drop.item_key, quantity });
                }
            }
        }

        // Escolher novo monstro aleatório automaticamente
        const monsterKeys = Object.keys(MONSTER_DATABASE);
        newMonsterKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
        const nextMonster = MONSTER_DATABASE[newMonsterKey];
        battleLog.push(`> Novo inimigo encontrado: ${nextMonster?.name}!`);
    } else {
        // ===== DERROTA =====
        updatedState.hp = Math.floor(updatedState.max_hp / 2);
        updatedState.battles_total += 1;
        updatedState.battles_lost += 1;

        battleLog.push(
            `> ${playerState.name} foi derrotado por ${monster.name}!`
        );
        battleLog.push(`> Revivido com 50% de HP (${updatedState.hp} HP).`);
    }

    return {
        updatedPlayerState: updatedState,
        battleLog,
        newMonsterKey,
        dropsInfo,
    };
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

export function learnAbility(
    playerState: PlayerState,
    ability_key: string
): { success: boolean; error?: string; updatedState?: PlayerState } {
    const ability = ABILITY_DATABASE[ability_key];
    if (!ability) {
        return { success: false, error: `Habilidade '${ability_key}' não existe!` };
    }

    if (playerState.learned_abilities.includes(ability_key)) {
        return { success: false, error: "Habilidade já aprendida!" };
    }

    if (playerState.level < ability.level_required) {
        return { success: false, error: `Nível insuficiente! Você precisa ser nível ${ability.level_required}.` };
    }

    return {
        success: true,
        updatedState: {
            ...playerState,
            learned_abilities: [...playerState.learned_abilities, ability_key],
        },
    };
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

export function learnRecipe(
    playerState: PlayerState,
    recipe_key: string
): { success: boolean; error?: string; updatedState?: PlayerState } {
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

// ============ REQUISITO 8: VALIDATION & REQUISITO 4: STATISTICS ============

/**
 * Valida se um PlayerState está bem formado
 */
export function validatePlayerState(state: unknown): state is PlayerState {
    if (!state || typeof state !== "object") return false;

    const p = state as any;
    return (
        typeof p.name === "string" &&
        typeof p.hp === "number" &&
        typeof p.max_hp === "number" &&
        typeof p.attack === "number" &&
        typeof p.base_attack === "number" &&
        typeof p.defense === "number" &&
        typeof p.base_defense === "number" &&
        typeof p.speed === "number" &&
        typeof p.exp === "number" &&
        typeof p.level === "number" &&
        typeof p.gold === "number" &&
        typeof p.battles_won === "number" &&
        typeof p.battles_lost === "number" &&
        typeof p.experience_total === "number" &&
        typeof p.playtime_seconds === "number" &&
        typeof p.active_effects === "object"
    );
}

/**
 * Migra um save antigo para o novo formato
 */
export function migrateOldSave(oldState: any): PlayerState {
    if (validatePlayerState(oldState)) {
        return oldState;
    }

    const migrated: PlayerState = {
        name: oldState.name || "Hero",
        hp: oldState.hp || 100,
        max_hp: oldState.max_hp || 100,
        attack: oldState.attack || 10,
        base_attack: oldState.base_attack || oldState.attack || 10,
        defense: oldState.defense || 5,
        base_defense: oldState.base_defense || oldState.defense || 5,
        speed: oldState.speed || 1,
        exp: oldState.exp || 0,
        exp_to_next_level: oldState.exp_to_next_level || calculateExpForLevel(oldState.level || 1),
        level: oldState.level || 1,
        gold: oldState.gold || 0,
        inventory: oldState.inventory || {},
        skills: oldState.skills || [],
        abilities: oldState.abilities || [],
        absolute_skills: oldState.absolute_skills || [],
        learned_recipes: oldState.learned_recipes || ["basic_potion"],
        learned_abilities: oldState.learned_abilities || [],
        equipped_weapon: oldState.equipped_weapon || null,
        equipped_armor: oldState.equipped_armor || null,
        last_saved_at: oldState.last_saved_at || Date.now(),
        battles_total: (oldState.battles_won || 0) + (oldState.battles_lost || 0),
        battles_won: oldState.battles_won || 0,
        battles_lost: oldState.battles_lost || 0,
        experience_total: oldState.experience_total || oldState.exp || 0,
        playtime_seconds: oldState.playtime_seconds || 0,
        monsters_defeated: oldState.monsters_defeated || {},
        active_effects: oldState.active_effects || [],
        prestige_level: oldState.prestige_level || 0,
        prestige_points: oldState.prestige_points || 0,
        total_lifetime_exp: oldState.total_lifetime_exp || 0,
    };

    return migrated;
}

// ============ PRESTIGE SYSTEM ============

export function calculatePrestigePoints(playerState: PlayerState): number {
    return Math.floor(Math.sqrt(playerState.total_lifetime_exp) / 10);
}

export function canPrestige(playerState: PlayerState): boolean {
    return playerState.level >= 10 + (playerState.prestige_level * 5);
}

export function prestigeReset(playerState: PlayerState): { success: boolean; updatedState?: PlayerState; message?: string } {
    if (!canPrestige(playerState)) {
        return {
            success: false,
            message: `Você precisa do nível ${10 + (playerState.prestige_level * 5)} para prestigiar.`
        };
    }

    const prestigePointsGained = calculatePrestigePoints(playerState);
    const prestigeBonus = 1 + (playerState.prestige_level * 0.1);

    const resetState: PlayerState = {
        ...playerState,
        hp: PLAYER_STARTING_STATS.hp,
        max_hp: PLAYER_STARTING_STATS.hp,
        attack: Math.ceil(PLAYER_STARTING_STATS.attack * prestigeBonus),
        base_attack: Math.ceil(PLAYER_STARTING_STATS.attack * prestigeBonus),
        defense: Math.ceil(PLAYER_STARTING_STATS.defense * prestigeBonus),
        base_defense: Math.ceil(PLAYER_STARTING_STATS.defense * prestigeBonus),
        speed: PLAYER_STARTING_STATS.speed,
        exp: 0,
        exp_to_next_level: calculateExpForLevel(1),
        level: 1,
        gold: 0,
        inventory: { "basic_potion": 3, "herb": 2 },
        prestige_level: playerState.prestige_level + 1,
        prestige_points: playerState.prestige_points + prestigePointsGained,
        total_lifetime_exp: playerState.total_lifetime_exp + playerState.experience_total,
        battles_total: 0,
        battles_won: 0,
        battles_lost: 0,
        experience_total: 0,
        playtime_seconds: 0,
        monsters_defeated: {},
        active_effects: [],
    };

    return {
        success: true,
        updatedState: resetState,
        message: `Prestigiou! Nível ${resetState.prestige_level} com +${prestigePointsGained} pontos. Ganhou ${Math.round((prestigeBonus - 1) * 100)}% de bônus de ATK/DEF!`
    };
}

/**
 * REQUISITO 4: Retorna estatísticas gerais do jogador
 */
export function getPlayerStats(playerState: PlayerState): {
    level: number;
    exp_progress: number;
    battles_total: number;
    battles_won: number;
    battles_lost: number;
    win_rate: string;
    monsters_total_defeated: number;
    experience_total: number;
    playtime_hours: string;
} {
    const win_rate =
        playerState.battles_total > 0
            ? ((playerState.battles_won / playerState.battles_total) * 100).toFixed(1)
            : "N/A";
    const monsters_total = Object.values(playerState.monsters_defeated).reduce((a, b) => a + b, 0);
    const playtime_hours = (playerState.playtime_seconds / 3600).toFixed(1);

    return {
        level: playerState.level,
        exp_progress: playerState.exp,
        battles_total: playerState.battles_total,
        battles_won: playerState.battles_won,
        battles_lost: playerState.battles_lost,
        win_rate: String(win_rate),
        monsters_total_defeated: monsters_total,
        experience_total: playerState.experience_total,
        playtime_hours,
    };
}

/**
 * Retorna um relatório completo do jogador
 */
export function getPlayerReport(playerState: PlayerState): string {
    const stats = getPlayerStats(playerState);
    const lines = [
        `=== RELATÓRIO DO JOGADOR ===`,
        `Nome: ${playerState.name}`,
        `Nível: ${stats.level}`,
        `HP: ${playerState.hp}/${playerState.max_hp}`,
        `ATK: ${playerState.attack} (base: ${playerState.base_attack})`,
        `DEF: ${playerState.defense} (base: ${playerState.base_defense})`,
        `Speed: ${playerState.speed}`,
        ``,
        `Ouro: ${playerState.gold}`,
        `EXP Total: ${stats.experience_total}`,
        `EXP Atual: ${stats.exp_progress}/${playerState.exp_to_next_level}`,
        ``,
        `Batalhas: ${stats.battles_total} (${stats.battles_won}V / ${stats.battles_lost}D)`,
        `Taxa de Vitória: ${stats.win_rate}%`,
        `Monstros Derrotados: ${stats.monsters_total_defeated}`,
        `Tempo de Jogo: ${stats.playtime_hours}h`,
        ``,
        `Receitas Aprendidas: ${playerState.learned_recipes.length}`,
        `Habilidades Aprendidas: ${playerState.learned_abilities.length}`,
        `Itens no Inventário: ${Object.keys(playerState.inventory).length}`,
    ];

    return lines.join("\n");
}

export { initialPlayerState };
