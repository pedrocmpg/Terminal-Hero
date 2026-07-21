import {
    PlayerState,
    saveGame,
    loadGame,
    processOfflineProgress,
    processCombatTurn,
} from "../hooks/useGameState";
import { MONSTER_DATABASE } from "../data/staticDb";

const TICK_MS = 1000;
const SAVE_INTERVAL_MS = 10000;
const MAX_LOGS = 50;

export interface EngineSnapshot {
    player: PlayerState;
    logs: string[];
    activeMonsterKey: string | null;
}

type Listener = (snapshot: EngineSnapshot) => void;

export class GameEngine {
    private player: PlayerState;
    private logs: string[] = [];
    private activeMonsterKey: string | null = "slime";
    private intervalHandle: ReturnType<typeof setInterval> | null = null;
    private lastSaveAt = 0;
    private listeners = new Set<Listener>();

    constructor() {
        const savedState = loadGame();
        this.player = processOfflineProgress(savedState);
        this.lastSaveAt = Date.now();
    }

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        listener(this.getSnapshot());
        return () => this.listeners.delete(listener);
    }

    getSnapshot(): EngineSnapshot {
        return {
            player: this.player,
            logs: this.logs,
            activeMonsterKey: this.activeMonsterKey,
        };
    }

    start(): void {
        if (this.intervalHandle) return;
        this.intervalHandle = setInterval(() => this.tick(), TICK_MS);
    }

    stop(): void {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
            this.intervalHandle = null;
        }
    }

    setActiveMonsterKey(key: string | null): void {
        this.activeMonsterKey = key;
        this.notify();
    }

    clearLogs(): void {
        this.logs = [];
        this.notify();
    }

    manualAction(action: (state: PlayerState) => PlayerState): void {
        this.player = action(this.player);
        saveGame(this.player);
        this.notify();
    }

    private tick(): void {
        this.player = { ...this.player, playtime_seconds: this.player.playtime_seconds + 1 };

        if (this.activeMonsterKey && MONSTER_DATABASE[this.activeMonsterKey]) {
            const result = processCombatTurn(this.player, this.activeMonsterKey);
            this.player = result.updatedPlayerState;
            this.logs = [...this.logs, ...result.battleLog].slice(-MAX_LOGS);
            // Mantém o mesmo monstro selecionado; ignora a troca aleatória sugerida pela lógica de combate.
        } else if (this.logs.length === 0) {
            this.logs = ["> Selecione um monstro para começar..."];
        }

        const now = Date.now();
        if (now - this.lastSaveAt > SAVE_INTERVAL_MS) {
            saveGame(this.player);
            this.lastSaveAt = now;
        }

        this.notify();
    }

    private notify(): void {
        const snapshot = this.getSnapshot();
        for (const listener of this.listeners) {
            listener(snapshot);
        }
    }
}
