import { useGameLoop } from '../hooks/useGameLoop';
import {
  useConsumable,
  equipWeapon,
  equipArmor,
  sellItem,
  craftItem,
  getPlayerStats,
  unequipWeapon,
  unequipArmor,
  prestigeReset,
  canPrestige,
  calculatePrestigePoints,
} from '../hooks/useGameState';
import { ITEM_DATABASE, RECIPE_DATABASE, MONSTER_DATABASE } from '../data/staticDb';
import { useRef, useEffect, useState, ReactNode } from 'react';

export function GameDashboard() {
  const {
    player,
    currentLogs,
    activeMonsterKey,
    isInitialized,
    isTabActive,
    setActiveMonsterKey,
    manualAction,
    clearLogs,
  } = useGameLoop();

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentLogs]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            TERMINAL HERO
          </div>
          <div className="text-lg text-cyan-300 animate-pulse font-light tracking-widest">
            ► INICIALIZANDO SISTEMA
          </div>
        </div>
      </div>
    );
  }

  const activeMonster = activeMonsterKey ? MONSTER_DATABASE[activeMonsterKey] : null;
  const stats = getPlayerStats(player);

  const ProgressBar = ({ current, max, color = 'cyan' }: { current: number; max: number; color?: string }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const colorClasses = {
      cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
      yellow: 'bg-gradient-to-r from-amber-500 to-amber-400',
      red: 'bg-gradient-to-r from-red-500 to-red-400',
    };
    return (
      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden shadow-sm">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const Button = ({
    children,
    onClick,
    disabled = false,
    size = 'sm',
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: 'xs' | 'sm' | 'md';
  }) => {
    const sizeClasses = { xs: 'px-2 py-1 text-xs', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClasses[size]} bg-cyan-600/80 hover:bg-cyan-500 text-white rounded font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col">
      {/* Header Minimalista */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/60 border-b border-cyan-500/20 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <span className="text-cyan-300 font-bold text-sm tracking-wider">TERMINAL HERO</span>
            <span className="text-slate-500 text-xs">Lv {player.level}</span>
            <span className="text-amber-300 text-xs">⚔ {stats.battles_won}W</span>
            {player.prestige_level > 0 && (
              <span className="text-yellow-400 text-xs font-bold">✦ Prestige {player.prestige_level}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {!isTabActive && <span className="text-red-400 animate-pulse">⦿ Paused</span>}
            <span>Gold: {player.gold}</span>
            {canPrestige(player) && (
              <Button
                size="xs"
                onClick={() => {
                  const result = prestigeReset(player);
                  if (result.success) {
                    manualAction(() => result.updatedState!);
                    alert(result.message);
                  }
                }}
              >
                ✦ Prestige
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-3 p-3">
        {/* Coluna Esquerda: Stats */}
        <div className="lg:w-64 space-y-2 flex flex-col overflow-y-auto">
          {/* HP e XP */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-slate-400 mb-1">HP</div>
            <div className="text-sm font-bold text-red-400 mb-1">{player.hp}/{player.max_hp}</div>
            <ProgressBar current={player.hp} max={player.max_hp} color="red" />
            <div className="text-xs text-slate-400 mt-2 mb-1">XP</div>
            <div className="text-sm font-bold text-cyan-400 mb-1">{player.exp}/{player.exp_to_next_level}</div>
            <ProgressBar current={player.exp} max={player.exp_to_next_level} color="cyan" />
          </div>

          {/* Stats */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm text-xs space-y-1">
            <div className="flex justify-between"><span className="text-slate-400">ATK</span><span className="text-cyan-300 font-bold">{player.attack}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">DEF</span><span className="text-cyan-300 font-bold">{player.defense}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">SPD</span><span className="text-cyan-300 font-bold">{player.speed}</span></div>
          </div>

          {/* Equipamento */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm text-xs space-y-2">
            <div className="font-bold text-cyan-300 text-xs uppercase tracking-wider">Equipamento</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{player.equipped_weapon ? '⚔' : '∅'}</span>
                <span className="text-slate-300 text-xs truncate flex-1 ml-2">
                  {player.equipped_weapon ? ITEM_DATABASE[player.equipped_weapon]?.name : 'Desarmado'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{player.equipped_armor ? '🛡' : '∅'}</span>
                <span className="text-slate-300 text-xs truncate flex-1 ml-2">
                  {player.equipped_armor ? ITEM_DATABASE[player.equipped_armor]?.name : 'Sem armadura'}
                </span>
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm text-xs space-y-1">
            <div className="flex justify-between"><span className="text-slate-400">Vitórias</span><span className="text-emerald-400 font-bold">{stats.battles_won}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Derrotas</span><span className="text-red-400 font-bold">{stats.battles_lost}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Monstros</span><span className="text-cyan-300 font-bold">{stats.monsters_total_defeated}</span></div>
          </div>
        </div>

        {/* Coluna Central: Combate */}
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {/* Seleção de Monstro */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Monstros</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(MONSTER_DATABASE).map(([key, monster]) => (
                <button
                  key={key}
                  onClick={() => setActiveMonsterKey(key)}
                  className={`p-2 rounded text-xs font-semibold transition-all ${
                    activeMonsterKey === key
                      ? 'bg-cyan-600 text-white border border-cyan-400'
                      : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {monster.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info Monstro */}
          {activeMonster && (
            <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm text-xs">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-cyan-300 font-bold">{activeMonster.name}</div>
                  <div className="text-slate-400">HP {activeMonster.max_hp}</div>
                </div>
                <Button onClick={() => setActiveMonsterKey(null)} size="xs">Parar</Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900/70 p-2 rounded text-center">
                  <span className="text-slate-400 block text-xs">ATK</span>
                  <span className="text-cyan-300 font-bold">{activeMonster.attack}</span>
                </div>
                <div className="bg-slate-900/70 p-2 rounded text-center">
                  <span className="text-slate-400 block text-xs">DEF</span>
                  <span className="text-cyan-300 font-bold">{activeMonster.defense}</span>
                </div>
                <div className="bg-slate-900/70 p-2 rounded text-center">
                  <span className="text-slate-400 block text-xs">SPD</span>
                  <span className="text-cyan-300 font-bold">{activeMonster.speed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Battle Log */}
          <div className="flex-1 bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Battle Log</span>
              <Button size="xs" onClick={clearLogs}>Limpar</Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono">
              {currentLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-4">Selecione um inimigo...</div>
              ) : (
                currentLogs.map((log, idx) => {
                  const logClass = log.includes('derrotado') || log.includes('novo')
                    ? 'text-emerald-400'
                    : log.includes('dano')
                    ? 'text-amber-300'
                    : 'text-slate-300';
                  return (
                    <div key={idx} className={logClass}>
                      {log.length > 80 ? log.substring(0, 77) + '...' : log}
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Coluna Direita: Inventário */}
        <div className="lg:w-56 flex flex-col gap-2 min-h-0 overflow-y-auto">
          {/* Inventário */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm flex-1 flex flex-col min-h-0">
            <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Inventário</div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {Object.keys(player.inventory).length === 0 ? (
                <div className="text-xs text-slate-500 italic">Vazio</div>
              ) : (
                Object.entries(player.inventory).map(([itemKey, quantity]) => {
                  const itemData = ITEM_DATABASE[itemKey];
                  return (
                    <div key={itemKey} className="flex items-center justify-between gap-1 p-1 rounded bg-slate-900/50 text-xs">
                      <span className="text-cyan-300 truncate flex-1">{itemData?.name}</span>
                      <span className="text-slate-400">×{quantity}</span>
                      <div className="flex gap-1">
                        {itemData?.item_type === 'consumivel' && (
                          <button
                            onClick={() =>
                              manualAction((state) => {
                                const result = useConsumable(state, itemKey);
                                return result.updatedState || state;
                              })
                            }
                            className="px-1 py-0.5 bg-emerald-600/70 hover:bg-emerald-500 text-xs rounded"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() =>
                            manualAction((state) => {
                              const result = sellItem(state, itemKey, 1);
                              return result.updatedState || state;
                            })
                          }
                          className="px-1 py-0.5 bg-amber-600/70 hover:bg-amber-500 text-xs rounded"
                        >
                          $
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Crafting */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm flex-1 flex flex-col min-h-0">
            <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Crafting</div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {player.learned_recipes.length === 0 ? (
                <div className="text-xs text-slate-500 italic">Nenhuma receita</div>
              ) : (
                player.learned_recipes.map((recipeKey) => {
                  const recipe = RECIPE_DATABASE[recipeKey];
                  if (!recipe) return null;

                  const canCraft = Object.entries(recipe.required_materials).every(
                    ([materialKey, needed]) => (player.inventory[materialKey] || 0) >= needed
                  );

                  return (
                    <div key={recipeKey} className="text-xs bg-slate-900/50 p-1 rounded">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-cyan-300 truncate font-semibold">{recipe.name}</span>
                        <Button
                          size="xs"
                          disabled={!canCraft}
                          onClick={() =>
                            manualAction((state) => {
                              const result = craftItem(state, recipeKey);
                              return result.updatedState || state;
                            })
                          }
                        >
                          ⚙
                        </Button>
                      </div>
                      <div className="space-y-0.5 text-slate-400">
                        {Object.entries(recipe.required_materials).map(([materialKey, needed]) => {
                          const currentQty = player.inventory[materialKey] || 0;
                          const hasEnough = currentQty >= needed;
                          return (
                            <div key={materialKey} className={hasEnough ? 'text-emerald-400' : 'text-red-400'}>
                              {ITEM_DATABASE[materialKey]?.name}: {currentQty}/{needed}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
