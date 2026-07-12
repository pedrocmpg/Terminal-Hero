import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerState, saveGame, loadGame, processOfflineProgress, processCombatTurn, initialPlayerState } from './useGameState';
import { MONSTER_DATABASE } from '../data/staticDb';

export interface GameLoopState {
  player: PlayerState;
  currentLogs: string[];
  activeMonsterKey: string | null;
  isInitialized: boolean;
  setActiveMonsterKey: (key: string | null) => void;
  manualAction: (action: (currentState: PlayerState) => PlayerState) => void;
}

export function useGameLoop(): GameLoopState {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [activeMonsterKey, setActiveMonsterKey] = useState<string | null>('slime');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Inicializar o jogo na primeira montagem
  useEffect(() => {
    const savedState = loadGame();
    const processedState = processOfflineProgress(savedState);
    setPlayer(processedState);
    lastUpdateRef.current = Date.now();
  }, []);

  // Função para executar ações manuais (cliques de botão)
  const manualAction = useCallback((action: (currentState: PlayerState) => PlayerState) => {
    setPlayer((prevState) => {
      if (!prevState) return prevState;
      const newState = action(prevState);
      saveGame(newState);
      return newState;
    });
  }, []);

  // Game Loop Principal (1 segundo por tick)
  useEffect(() => {
    if (!player) return;

    gameLoopRef.current = setInterval(() => {
      setPlayer((prevState) => {
        if (!prevState) return prevState;

        let newState = { ...prevState };
        newState.playtime_seconds += 1;

        // Se houver um monstro ativo, executar combate automático
        if (activeMonsterKey && MONSTER_DATABASE[activeMonsterKey]) {
          const battleResult = processCombatTurn(newState, activeMonsterKey);
          newState = battleResult.updatedPlayerState;

          // Adicionar logs à fila
          setCurrentLogs((prevLogs) => {
            const combined = [...prevLogs, ...battleResult.battleLog];
            // Manter apenas os últimos 100 logs para performance
            return combined.slice(-100);
          });

          // Se um novo monstro foi designado, atualizar automaticamente
          if (battleResult.newMonsterKey && newState.hp > 0) {
            setActiveMonsterKey(battleResult.newMonsterKey);
          }
        } else {
          // Sem combate ativo: apenas contar o tempo
          setCurrentLogs((prevLogs) => {
            if (prevLogs.length === 0) {
              return ['> Sistema aguardando seleção de combate...'];
            }
            return prevLogs;
          });
        }

        // Salvar estado a cada 10 ticks (10 segundos)
        const now = Date.now();
        if (now - lastUpdateRef.current > 10000) {
          saveGame(newState);
          lastUpdateRef.current = now;
        }

        return newState;
      });
    }, 1000); // 1 segundo

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [activeMonsterKey]);

  return {
    player: player || initialPlayerState,
    currentLogs,
    activeMonsterKey,
    isInitialized: player !== null,
    setActiveMonsterKey,
    manualAction,
  };
}
