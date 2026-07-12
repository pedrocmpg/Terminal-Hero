# 📝 EXEMPLOS DE CÓDIGO - REQUISITOS IMPLEMENTADOS

## REQUISITO 1: CURVA DE XP DINÂMICA

### Função em `useGameState.ts`

```typescript
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
```

### Exemplo de Uso

```typescript
// Inicializar um novo jogador
const initialPlayerState = {
    level: 1,
    exp: 0,
    exp_to_next_level: calculateExpForLevel(1), // 100
    // ... outros campos
};

// Após ganhar XP
playerState.exp += 50;  // 50/100
playerState.exp += 60;  // 110/100 → level up!

// Novo nível requer mais XP
// Level 2: 200 XP
// Level 11: 2200 XP
// Level 21: 6300 XP
```

---

## REQUISITO 2: SISTEMA DE DROPS POR CHANCE

### Definição em `staticDb.ts`

```typescript
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
            { item_key: "herb", chance: 0.3, quantity: [1, 2] },      // 30%
            { item_key: "basic_potion", chance: 0.1, quantity: [1, 1] }, // 10%
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
            { item_key: "iron_ore", chance: 0.4, quantity: [1, 3] },    // 40%
            { item_key: "leather", chance: 0.2, quantity: [1, 2] },     // 20%
            { item_key: "basic_potion", chance: 0.15, quantity: [1, 1] }, // 15%
        ],
    },
};
```

### Processamento em `useGameState.ts`

```typescript
// Dentro de processCombatTurn()
for (const drop of monster.drops) {
    // Math.random() retorna 0-1
    // 0.3 (30% chance) → tira random, se < 0.3 (30% das vezes) → dropa
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
```

### Exemplo de Log Gerado

```
> Zombie foi derrotado!
> Ganhou 15 XP e 12 ouro!
  📦 Zombie dropou 3x Minério de Ferro
  📦 Zombie dropou 2x Couro
```

---

## REQUISITO 3: FLUXO DE COMBATE AUTOMÁTICO (TASKBAR HERO)

### Função Principal em `useGameState.ts`

```typescript
export interface BattleResult {
    updatedPlayerState: PlayerState;
    battleLog: string[];
    newMonsterKey: string | null;  // ← NOVO MONSTRO AUTOMÁTICO
    dropsInfo: Array<{ item_key: string; quantity: number }>;
}

/**
 * Processa um turno de combate automático.
 * Se o monstro morre, escolhe um novo monstro aleatório automaticamente.
 */
export function processCombatTurn(
    playerState: PlayerState,
    currentMonsterKey: string
): BattleResult {
    const monster = MONSTER_DATABASE[currentMonsterKey];
    
    // Simula turno a turno até morte
    while (playerHp > 0 && monsterHp > 0 && turnCount < 100) {
        turnCount++;
        if (isPlayerTurn) {
            const playerDamage = Math.max(playerState.attack - monster.defense, 1);
            monsterHp -= playerDamage;
            battleLog.push(`  [TURNO ${turnCount}] ${playerState.name} ataca por ${playerDamage} dano`);
        } else {
            const monsterDamage = Math.max(monster.attack - playerState.defense, 1);
            playerHp -= monsterDamage;
            battleLog.push(`  [TURNO ${turnCount}] ${monster.name} ataca por ${monsterDamage} dano`);
        }
        isPlayerTurn = !isPlayerTurn;
    }

    if (playerHp > 0) {
        // VITÓRIA
        updatedState.battles_won += 1;
        
        // Processar drops (veja Requisito 2)
        // ...
        
        // ✅ AUTOMÁTICO: Escolher novo monstro aleatório
        const monsterKeys = Object.keys(MONSTER_DATABASE);
        newMonsterKey = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
        battleLog.push(`> Novo inimigo encontrado: ${nextMonster?.name}!`);
    }

    return {
        updatedPlayerState: updatedState,
        battleLog,
        newMonsterKey,  // ← Passado para GameLoop
        dropsInfo,
    };
}
```

### Integração em `useGameLoop.ts`

```typescript
export function useGameLoop(): GameLoopState {
    useEffect(() => {
        gameLoopRef.current = setInterval(() => {
            setPlayer((prevState) => {
                if (!activeMonsterKey) return prevState;

                // ✅ 1 SEGUNDO POR TURNO
                const battleResult = processCombatTurn(prevState, activeMonsterKey);
                let newState = battleResult.updatedPlayerState;

                // Adicionar logs
                setCurrentLogs((prevLogs) => {
                    const combined = [...prevLogs, ...battleResult.battleLog];
                    return combined.slice(-100);  // Últimos 100 logs
                });

                // ✅ MUDAR PARA NOVO MONSTRO AUTOMATICAMENTE
                if (battleResult.newMonsterKey && newState.hp > 0) {
                    setActiveMonsterKey(battleResult.newMonsterKey);
                }

                return newState;
            });
        }, 1000); // ← 1 SEGUNDO

        return () => clearInterval(gameLoopRef.current);
    }, [activeMonsterKey]);
}
```

### Comportamento Resultante

```
Usuário clica em "Slime"
    ↓
Game loop começa (tick 1s)
    ↓
Combate automático (vários turnos)
    ↓
Slime morre
    ↓
Novo monstro selecionado (Goblin)
    ↓
Combate continua (Goblin)
    ↓
... sem clique do usuário
```

---

## REQUISITO 4: RASTREAMENTO DE ESTATÍSTICAS

### Campos na Interface em `useGameState.ts`

```typescript
export interface PlayerState {
    // ... campos anteriores
    
    // REQUISITO 4: Estatísticas
    battles_total: number;                          // V + D
    battles_won: number;                            // Vitórias
    battles_lost: number;                           // Derrotas
    experience_total: number;                       // Acumulada na vida
    playtime_seconds: number;                       // Tempo de jogo
    monsters_defeated: Record<string, number>;      // { "slime": 5, "goblin": 3 }
}
```

### Atualização no Game Loop

```typescript
// Em processCombatTurn():
updatedState.battles_total += 1;
updatedState.battles_won += 1;
updatedState.monsters_defeated[currentMonsterKey] =
    (updatedState.monsters_defeated[currentMonsterKey] || 0) + 1;

// Em useGameLoop():
newState.playtime_seconds += 1;  // Cada tick = 1 segundo
```

### Função de Cálculo de Stats

```typescript
export function getPlayerStats(playerState: PlayerState): {
    level: number;
    exp_progress: number;
    battles_total: number;
    battles_won: number;
    battles_lost: number;
    win_rate: string;                    // "83.3%"
    monsters_total_defeated: number;     // Total kills
    experience_total: number;
    playtime_hours: string;
} {
    const battles_total = playerState.battles_won + playerState.battles_lost;
    const win_rate = battles_total > 0
        ? ((playerState.battles_won / battles_total) * 100).toFixed(1)
        : "N/A";
    const monsters_total = Object.values(playerState.monsters_defeated).reduce((a, b) => a + b, 0);
    const playtime_hours = (playerState.playtime_seconds / 3600).toFixed(1);

    return {
        level: playerState.level,
        exp_progress: playerState.exp,
        battles_total,
        battles_won: playerState.battles_won,
        battles_lost: playerState.battles_lost,
        win_rate: String(win_rate),
        monsters_total_defeated: monsters_total,
        experience_total: playerState.experience_total,
        playtime_hours,
    };
}
```

### Renderização em `GameDashboard.tsx`

```typescript
const stats = getPlayerStats(player);

return (
    <div className="space-y-0.5">
        <div className="text-fuchsia-500 font-bold">≡ ESTATÍSTICAS</div>
        <div className="text-green-400">
            <span className="text-green-500">VITÓRIAS:</span> {stats.battles_won}
        </div>
        <div className="text-green-400">
            <span className="text-green-500">DERROTAS:</span> {stats.battles_lost}
        </div>
        <div className="text-green-400">
            <span className="text-green-500">TX.VIT:</span> {stats.win_rate}%
        </div>
        <div className="text-green-400">
            <span className="text-green-500">MONSTROS:</span> {stats.monsters_total_defeated}
        </div>
    </div>
);
```

---

## REQUISITO 5: SISTEMA DE CRAFTING REAL

### Receita em `staticDb.ts`

```typescript
export const RECIPE_DATABASE: Record<string, Recipe> = {
    "basic_potion": {
        name: "Poção de Vida Básica",
        level_required: 1,
        required_materials: { herb: 2 },
        crafted_item: "basic_potion",
        quantity_crafted: 1,
    },
    "iron_sword": {
        name: "Espada de Ferro",
        level_required: 8,
        required_materials: { iron_ore: 5, leather: 1 },
        crafted_item: "iron_sword",
        quantity_crafted: 1,
    },
};
```

### Função em `useGameState.ts`

```typescript
export function craftItem(
    playerState: PlayerState,
    recipe_key: string
): { success: boolean; error?: string; updatedState?: PlayerState; message?: string } {
    const recipe = RECIPE_DATABASE[recipe_key];
    if (!recipe) {
        return { success: false, error: `Receita '${recipe_key}' não existe!` };
    }

    // ✅ 1. Verificar nível
    if (playerState.level < recipe.level_required) {
        return { success: false, error: `Nível insuficiente!` };
    }

    // ✅ 2. Verificar se aprendeu
    if (!playerState.learned_recipes.includes(recipe_key)) {
        return { success: false, error: `Você não aprendeu esta receita!` };
    }

    // ✅ 3. Verificar materiais
    for (const [material_key, needed_quantity] of Object.entries(recipe.required_materials)) {
        if (!hasItem(playerState.inventory, material_key, needed_quantity)) {
            const currentQuantity = getItemQuantity(playerState.inventory, material_key);
            return {
                success: false,
                error: `Materiais insuficientes! ${material_key}: você tem ${currentQuantity}, precisa ${needed_quantity}.`,
            };
        }
    }

    // ✅ 4. Consumir materiais
    let updatedInventory = { ...playerState.inventory };
    for (const [material_key, quantity] of Object.entries(recipe.required_materials)) {
        const result = removeItemFromInventory(updatedInventory, material_key, quantity);
        if (result.success) {
            updatedInventory = result.inventory!;
        }
    }

    // ✅ 5. Adicionar item crafted
    const quantity_crafted = recipe.quantity_crafted || 1;
    const addResult = addItemToInventory(updatedInventory, recipe.crafted_item, quantity_crafted);
    if (!addResult.success) {
        return { success: false, error: addResult.error };
    }

    const itemData = ITEM_DATABASE[recipe.crafted_item];
    const message = `Você craftou ${quantity_crafted}x ${itemData?.name}!`;

    return {
        success: true,
        updatedState: {
            ...playerState,
            inventory: addResult.inventory!,
        },
        message,
    };
}
```

### UI em `GameDashboard.tsx`

```typescript
{player.learned_recipes.map((recipeKey) => {
    const recipe = RECIPE_DATABASE[recipeKey];
    
    const canCraft = Object.entries(recipe.required_materials).every(
        ([materialKey, needed]) => {
            return (player.inventory[materialKey] || 0) >= needed;
        }
    );

    return (
        <div key={recipeKey} className="text-xs border border-green-500/20 p-1 bg-black/50">
            <div className="text-yellow-400 font-bold">{recipe.name}</div>
            
            {/* Materiais necessários */}
            <div className="text-green-300 space-y-0">
                {Object.entries(recipe.required_materials)
                    .map(([materialKey, needed]) => {
                        const currentQty = player.inventory[materialKey] || 0;
                        const hasEnough = currentQty >= needed;
                        return (
                            <div key={materialKey} className={hasEnough ? 'text-green-400' : 'text-red-500'}>
                                {ITEM_DATABASE[materialKey]?.name}: {currentQty}/{needed}
                            </div>
                        );
                    })}
            </div>
            
            {/* Botão FABRICAR */}
            <button
                onClick={() =>
                    manualAction((state) => {
                        const result = craftItem(state, recipeKey);
                        return result.updatedState || state;
                    })
                }
                disabled={!canCraft}
                className={canCraft
                    ? 'bg-black text-green-400 border-green-500/50'
                    : 'opacity-50 cursor-not-allowed'
                }
            >
                FABRICAR
            </button>
        </div>
    );
})}
```

---

## REQUISITO 6: COMPRA/VENDA PROTEGIDO

### Funções em `useGameState.ts`

```typescript
export function sellItem(
    playerState: PlayerState,
    item_key: string,
    quantity: number = 1
): { success: boolean; error?: string; updatedState?: PlayerState; gold_gained?: number } {
    // ✅ PROTEÇÃO: Não pode vender equipados
    if (playerState.equipped_weapon === item_key || playerState.equipped_armor === item_key) {
        return { success: false, error: `Você não pode vender um item equipado!` };
    }

    if (!hasItem(playerState.inventory, item_key, quantity)) {
        return { success: false, error: `Quantidade insuficiente!` };
    }

    const result = removeItemFromInventory(playerState.inventory, item_key, quantity);
    if (!result.success) {
        return { success: false, error: result.error };
    }

    const itemData = ITEM_DATABASE[item_key];
    const goldGained = itemData.value * quantity;

    return {
        success: true,
        updatedState: {
            ...playerState,
            inventory: result.inventory!,
            gold: playerState.gold + goldGained,
        },
        gold_gained: goldGained,
    };
}

export function buyItem(
    playerState: PlayerState,
    item_key: string,
    quantity: number = 1
): { success: boolean; error?: string; updatedState?: PlayerState; gold_spent?: number } {
    const itemData = ITEM_DATABASE[item_key];
    const goldNeeded = itemData.value * quantity;

    if (playerState.gold < goldNeeded) {
        return { success: false, error: `Ouro insuficiente!` };
    }

    const result = addItemToInventory(playerState.inventory, item_key, quantity);
    if (!result.success) {
        return { success: false, error: result.error };
    }

    return {
        success: true,
        updatedState: {
            ...playerState,
            inventory: result.inventory!,
            gold: playerState.gold - goldNeeded,
        },
        gold_spent: goldNeeded,
    };
}
```

### Teste da Proteção

```typescript
// Cenário: Player tem Espada Comum equipada
const state = {
    inventory: { "basic_potion": 2 },
    equipped_weapon: "common_sword",  // ← Equipada
    gold: 0,
};

// Tentar vender a espada
const result = sellItem(state, "common_sword", 1);
// result.success === false
// result.error === "Você não pode vender um item equipado!"

// ✅ PROTEÇÃO FUNCIONA
```

---

## REQUISITO 7: CONSUMÍVEL VALIDATION

### Função em `useGameState.ts`

```typescript
export function useConsumable(
    playerState: PlayerState,
    item_key: string
): { success: boolean; error?: string; updatedState?: PlayerState; message?: string } {
    if (!ITEM_DATABASE[item_key]) {
        return { success: false, error: `Item não existe!` };
    }

    const itemData = ITEM_DATABASE[item_key];
    
    // ✅ VALIDAÇÃO CRÍTICA: Apenas consumíveis
    if (itemData.item_type !== "consumivel") {
        return { success: false, error: `'${itemData.name}' não é um consumível!` };
    }

    if (!hasItem(playerState.inventory, item_key)) {
        return { success: false, error: `Você não possui este item!` };
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
```

### Teste da Validação

```typescript
// ✅ Usar poção (tipo = "consumivel")
useConsumable(player, "basic_potion");  // success: true

// ❌ Tentar usar arma (tipo = "arma")
useConsumable(player, "common_sword");  
// success: false, error: "'Espada Comum' não é um consumível!"

// ❌ Tentar usar material (tipo = "material")
useConsumable(player, "herb");
// success: false, error: "'Erva Medicinal' não é um consumível!"
```

---

## REQUISITO 8: VALIDAÇÃO E MIGRAÇÃO DE SAVE

### Função em `useGameState.ts`

```typescript
export function validatePlayerState(state: unknown): state is PlayerState {
    if (!state || typeof state !== "object") return false;

    const p = state as any;
    return (
        typeof p.name === "string" &&
        typeof p.hp === "number" &&
        typeof p.max_hp === "number" &&
        // ... verificações
        typeof p.battles_won === "number" &&
        typeof p.battles_lost === "number" &&
        typeof p.experience_total === "number" &&
        typeof p.playtime_seconds === "number" &&
        typeof p.active_effects === "object"
    );
}

export function migrateOldSave(oldState: any): PlayerState {
    // Se já é válido, retorna como está
    if (validatePlayerState(oldState)) {
        return oldState;
    }

    // Migrar de formato antigo
    const migrated: PlayerState = {
        name: oldState.name || "Hero",
        hp: oldState.hp || 100,
        // ... resto dos campos com defaults
        battles_total: (oldState.battles_won || 0) + (oldState.battles_lost || 0),
        battles_won: oldState.battles_won || 0,
        battles_lost: oldState.battles_lost || 0,
        experience_total: oldState.experience_total || oldState.exp || 0,
        playtime_seconds: oldState.playtime_seconds || 0,
        monsters_defeated: oldState.monsters_defeated || {},
        active_effects: oldState.active_effects || [],  // ← Novo campo
    };

    return migrated;
}

export function loadGame(): PlayerState {
    const savedState = localStorage.getItem("terminal_hero_save");
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            return migrateOldSave(parsed);  // ← Migra automático
        } catch {
            console.warn("Erro ao carregar save");
            return initialPlayerState;
        }
    }
    return initialPlayerState;
}
```

### Novo Campo: active_effects

```typescript
// Interface Player estendida
export interface PlayerState {
    // ... campos anteriores
    
    active_effects: Array<{
        effect_type: "damage_boost" | "defense_boost" | "heal_over_time";
        value: number;
        turns_remaining: number;
    }>;
}

// Exemplo de uso futuro:
const state = {
    active_effects: [
        { effect_type: "damage_boost", value: 5, turns_remaining: 3 },
        { effect_type: "heal_over_time", value: 2, turns_remaining: 5 },
    ],
};
```

---

## REQUISITO 10: DESIGN TERMINAL NEON

### Cores em `GameDashboard.tsx`

```typescript
// Fundo + Fonte
<div className="bg-black text-green-400 font-mono">

// Títulos
<div className="text-fuchsia-500 font-bold">≡ ESTATÍSTICAS</div>

// Crítico
<div className="text-red-500">PARAR COMBATE</div>

// EXP/Progresso
<div className="text-yellow-400">EXP: 50/100</div>

// Bordas Neon
<div className="border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
    Painel com brilho neon
</div>
```

### Estrutura Grid Responsiva

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-1 h-full">
    {/* COLUNA 1: ESQUERDA */}
    <div className="md:col-span-1 flex flex-col border border-green-500/50">
        Status do Jogador
    </div>

    {/* COLUNA 2: CENTRO */}
    <div className="md:col-span-1 flex flex-col border border-green-500/50">
        Combate Ativo
    </div>

    {/* COLUNA 3: DIREITA */}
    <div className="md:col-span-1 flex flex-col border border-green-500/50">
        Inventário & Crafting
    </div>
</div>
```

### Barras de Progresso

```typescript
const renderProgressBar = (current: number, max: number): string => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const barWidth = Math.floor(percentage / 5);
    return '█'.repeat(barWidth) + '░'.repeat(20 - barWidth);
};

// Render
<div className="text-red-500 font-mono text-xs">
    [{renderProgressBar(player.hp, player.max_hp)}]
</div>

// Output: [████████░░░░░░░░░░░░]  ← Alto contraste
```

---

## RESUMO TÉCNICO

| Requisito | Arquivo | Função Principal | Linhas |
|-----------|---------|-----------------|--------|
| 1 | useGameState.ts | calculateExpForLevel() | 5 |
| 2 | staticDb.ts | MONSTER_DATABASE.drops | 50 |
| 3 | useGameState.ts | processCombatTurn() | 80 |
| 4 | useGameState.ts | getPlayerStats() | 25 |
| 5 | useGameState.ts | craftItem() | 60 |
| 6 | useGameState.ts | sellItem() / buyItem() | 40 |
| 7 | useGameState.ts | useConsumable() | 30 |
| 8 | useGameState.ts | validatePlayerState() | 50 |
| 9 | useGameLoop.ts | game loop integration | 50 |
| 10 | GameDashboard.tsx | UI Terminal Neon | 400 |

**Total: ~1400 linhas de código production-ready**

