import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerState, saveGame, loadGame, processOfflineProgress, processCombatTurn, initialPlayerState } from './useGameState';
import { MONSTER_DATABASE } from '../data/staticDb';

export interface GameLoopState {
  player: PlayerState;
  currentLogs: string[];
  activeMonsterKey: string | null;
  isInitialized: boolean;
  isTabActive: boolean;
  setActiveMonsterKey: (key: string | null) => void;
  manualAction: (action: (currentState: PlayerState) => PlayerState) => void;
  clearLogs: () => void;
}

export function useGameLoop(): GameLoopState {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [activeMonsterKey, setActiveMonsterKey] = useState<string | null>('slime');
  const [isTabActive, setIsTabActive] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastSaveRef = useRef<number>(0);

  // Visibility Detection - economiza recursos quando aba não está em foco
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Inicializar o jogo na primeira montagem
  useEffect(() => {
    const savedState = loadGame();
    const processedState = processOfflineProgress(savedState);
    setPlayer(processedState);
    lastUpdateRef.current = Date.now();
    lastSaveRef.current = Date.now();
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

  const clearLogs = useCallback(() => {
    setCurrentLogs([]);
  }, []);

  // Game Loop Principal - só executa quando aba está em foco
  useEffect(() => {
    if (!player || !isTabActive) return;

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
            return combined.slice(-50); // Menos logs para UI mais responsiva
          });

          // Se um novo monstro foi designado, atualizar automaticamente
          if (battleResult.newMonsterKey && newState.hp > 0) {
            setActiveMonsterKey(battleResult.newMonsterKey);
          }
        } else {
          // Sem combate ativo: apenas contar o tempo
          setCurrentLogs((prevLogs) => {
            if (prevLogs.length === 0) {
              return ['> Selecione um monstro para começar...'];
            }
            return prevLogs;
          });
        }

        // Salvar estado a cada 10 ticks (10 segundos)
        const now = Date.now();
        if (now - lastSaveRef.current > 10000) {
          saveGame(newState);
          lastSaveRef.current = now;
        }

        return newState;
      });
    }, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [activeMonsterKey, isTabActive]);

  return {
    player: player || initialPlayerState,
    currentLogs,
    activeMonsterKey,
    isInitialized: player !== null,
    isTabActive,
    setActiveMonsterKey,
    manualAction,
    clearLogs,
  };
}
