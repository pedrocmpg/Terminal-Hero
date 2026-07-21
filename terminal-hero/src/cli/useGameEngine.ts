import { useEffect, useRef, useState } from "react";
import { GameEngine, EngineSnapshot } from "../engine/gameEngine";
import { PlayerState } from "../hooks/useGameState";

export interface GameEngineBinding {
    player: PlayerState;
    logs: string[];
    activeMonsterKey: string | null;
    setActiveMonsterKey: (key: string | null) => void;
    manualAction: (action: (state: PlayerState) => PlayerState) => void;
    clearLogs: () => void;
}

export function useGameEngine(): GameEngineBinding {
    const engineRef = useRef<GameEngine | null>(null);
    if (!engineRef.current) {
        engineRef.current = new GameEngine();
    }
    const engine = engineRef.current;

    const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => engine.getSnapshot());

    useEffect(() => {
        const unsubscribe = engine.subscribe(setSnapshot);
        engine.start();
        return () => {
            unsubscribe();
            engine.stop();
        };
    }, [engine]);

    return {
        player: snapshot.player,
        logs: snapshot.logs,
        activeMonsterKey: snapshot.activeMonsterKey,
        setActiveMonsterKey: (key) => engine.setActiveMonsterKey(key),
        manualAction: (action) => engine.manualAction(action),
        clearLogs: () => engine.clearLogs(),
    };
}
