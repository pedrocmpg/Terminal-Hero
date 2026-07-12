import { MONSTER_DATABASE } from "../data/staticDb";

export interface PlayerState {
    name: string;
    hp: number;
    max_hp: number;
    attack: number;
    defense: number;
    speed: number;
    exp: number;
    level: number;
    gold: number;
    inventory: Record<string, number>;
    last_saved_at: number;
    equipped_items: {
    weapon: string | null;
    armor: string | null;
    };
}

const initialPlayerState: PlayerState = {
    name: "Hero",
    hp: 100,
    max_hp: 100,
    attack: 5,
    defense: 0,
    speed: 1,
    exp: 0,
    level: 1,
    gold: 0,
    inventory: {
        "basic_potion": 3
    },
    equipped_items: {
        weapon: null,
        armor: null
    },
    last_saved_at: Date.now(),
};

export function calculateLevelUp(currentPlayerState: PlayerState): PlayerState {
    let tempState = { ...currentPlayerState };
    while (tempState.exp >= tempState.level * 100) {
        const expNeeded = tempState.level * 100;
        const newLevel = tempState.level + 1;
        const newExp = tempState.exp - expNeeded;

        const newMaxHp = tempState.max_hp + 10;
        const newAttack = tempState.attack + 5;
        const newDefense = tempState.defense + 2;
        const newSpeed = tempState.speed + 2;

        tempState = {
            ...tempState,
            level: newLevel,
            max_hp: newMaxHp,
            hp: newMaxHp,
            attack: newAttack,
            defense: newDefense,
            speed: newSpeed,
            exp: newExp
        };
    }
    return tempState;
}

export function saveGame(state: PlayerState): void {
    const stateToSave = { ...state, last_saved_at: Date.now() };
    localStorage.setItem("terminal_hero_save", JSON.stringify(stateToSave));
}

export function loadGame(): PlayerState {
    const savedState = localStorage.getItem("terminal_hero_save");
    if (savedState) {
        return JSON.parse(savedState) as PlayerState;
    }
    return initialPlayerState;
}

export function processOfflineProgress(savedState: PlayerState): PlayerState {
    const currentTime = Date.now();
    const timeElapsed = currentTime - savedState.last_saved_at;

    
}


export function monsterBattle(
    playerState: PlayerState, 
    monsterId: string, 
    isOffline: boolean = false
): { updatedPlayerState: PlayerState; battleLog: string[] } {
    
    const monster = MONSTER_DATABASE[monsterId];
    if (!monster) {
        throw new Error(`Monster with ID ${monsterId} not found.`);
    }

    let battleLog: string[] = [];
    let playerHp = playerState.hp;
    let monsterHp = monster.max_hp;


    let isPlayerTurn = playerState.speed >= monster.speed;

    while (playerHp > 0 && monsterHp > 0) {
        if (isPlayerTurn) {

            const playerDamage = Math.max(playerState.attack - monster.defense, 1);
            monsterHp -= playerDamage;

            if (!isOffline) {
                battleLog.push(`Player attacks ${monster.name} for ${playerDamage} damage.`);
            }
        } else {

            const monsterDamage = Math.max(monster.attack - playerState.defense, 1);
            playerHp -= monsterDamage;
            
            if (!isOffline) {
                battleLog.push(`${monster.name} attacks Player for ${monsterDamage} damage.`);
            }
        }

        isPlayerTurn = !isPlayerTurn;
    }


    let updatedPlayerState = { ...playerState };

    if (playerHp > 0) {

        const expGained = Math.floor(Math.random() * (monster.exp_range[1] - monster.exp_range[0] + 1)) + monster.exp_range[0];
        const goldGained = Math.floor(Math.random() * (monster.gold_range[1] - monster.gold_range[0] + 1)) + monster.gold_range[0];
        
        updatedPlayerState.exp += expGained;
        updatedPlayerState.gold += goldGained;
        

        updatedPlayerState.hp = updatedPlayerState.max_hp;

        battleLog.push(`Player defeated ${monster.name}! Gained ${expGained} EXP.`);

        updatedPlayerState = calculateLevelUp(updatedPlayerState);
    } else {

        updatedPlayerState.hp = Math.floor(updatedPlayerState.max_hp / 2);
        battleLog.push(`Player was defeated by ${monster.name}. Revived with 50% HP.`);
    }

    return { updatedPlayerState, battleLog };
}