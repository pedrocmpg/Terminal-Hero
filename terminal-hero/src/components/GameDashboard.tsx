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
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="relative">
            <div className="text-8xl font-black tracking-tighter">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                TERMINAL
              </span>
            </div>
            <div className="text-7xl font-black tracking-tighter mt-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                HERO
              </span>
            </div>
          </div>
          <div className="text-lg text-cyan-300 animate-pulse font-light tracking-widest">
            ► INICIALIZANDO SISTEMA
          </div>
          <div className="w-48 h-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full mx-auto" style={{
            animation: 'shimmer 2s infinite'
          }} />
        </div>
      </div>
    );
  }

  const activeMonster = activeMonsterKey ? MONSTER_DATABASE[activeMonsterKey] : null;
  const stats = getPlayerStats(player);

  const ProgressBar = ({ current, max, color = 'cyan', label }: { current: number; max: number; color?: string; label?: string }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const colorClasses = {
      cyan: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      yellow: 'bg-gradient-to-r from-amber-500 to-orange-500',
      red: 'bg-gradient-to-r from-red-500 to-pink-500',
      emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      purple: 'bg-gradient-to-r from-purple-500 to-pink-500',
    };
    return (
      <div className="w-full">
        {label && <div className="stat-label mb-2">{label}</div>}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-300 shadow-lg`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 mt-1 text-right">{Math.floor(current)} / {Math.floor(max)}</div>
      </div>
    );
  };

  const Button = ({
    children,
    onClick,
    disabled = false,
    size = 'sm',
    variant = 'primary',
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: 'xs' | 'sm' | 'md';
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
  }) => {
    const sizeClasses = { xs: 'px-2 py-1 text-xs', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      danger: 'px-3 py-1.5 text-xs bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-none rounded-lg font-semibold transition-all duration-150',
      success: 'px-3 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-none rounded-lg font-semibold transition-all duration-150',
    };
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClasses[size]} ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-slate-100 font-sans overflow-hidden flex flex-col">
      {/* Premium Header */}
      <div className="border-b border-cyan-500/20 px-6 py-4 backdrop-blur-md" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)'
      }}>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tighter">
                TERMINAL HERO
              </div>
              <div className="text-xs text-slate-400 mt-1">RPG Idle · Prestige System</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />

            {/* Player Info */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="stat-label">Level</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{player.level}</div>
              </div>
              <div className="text-center">
                <div className="stat-label">Victories</div>
                <div className="text-2xl font-bold text-amber-400">{stats.battles_won}W</div>
              </div>
              <div className="text-center">
                <div className="stat-label">Gold</div>
                <div className="text-2xl font-bold text-yellow-400">₹{player.gold.toLocaleString()}</div>
              </div>

              {player.prestige_level > 0 && (
                <div className="text-center px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/30">
                  <div className="stat-label">Prestige</div>
                  <div className="text-2xl font-bold text-yellow-400">✦ {player.prestige_level}</div>
                </div>
              )}

              {!isTabActive && (
                <div className="px-3 py-2 rounded-lg bg-red-600/20 border border-red-500/30">
                  <div className="text-xs text-red-400 animate-pulse font-bold">⦿ PAUSED</div>
                </div>
              )}

              {canPrestige(player) && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => {
                    const result = prestigeReset(player);
                    if (result.success) {
                      manualAction(() => result.updatedState!);
                      alert(result.message);
                    }
                  }}
                >
                  ✦ PRESTIGE
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-6">
        {/* LEFT COLUMN: Player Stats */}
        <div className="lg:w-72 flex flex-col gap-4 overflow-y-auto pr-2">
          {/* HP Card */}
          <div className="card-glass p-4">
            <div className="stat-label mb-3">Life Force</div>
            <div className="flex items-baseline gap-2 mb-3">
              <div className="stat-value text-2xl">{Math.floor(player.hp)}</div>
              <div className="text-slate-400 text-sm">/ {Math.floor(player.max_hp)}</div>
            </div>
            <ProgressBar current={player.hp} max={player.max_hp} color="red" />
          </div>

          {/* XP Card */}
          <div className="card-glass p-4">
            <div className="stat-label mb-3">Experience Progress</div>
            <div className="flex items-baseline gap-2 mb-3">
              <div className="stat-value text-2xl">{Math.floor(player.exp)}</div>
              <div className="text-slate-400 text-sm">/ {Math.floor(player.exp_to_next_level)}</div>
            </div>
            <ProgressBar current={player.exp} max={player.exp_to_next_level} color="cyan" />
            <div className="text-xs text-slate-400 mt-3">Level up in {Math.floor(player.exp_to_next_level - player.exp)} XP</div>
          </div>

          {/* Stats Grid */}
          <div className="card-glass p-4">
            <div className="stat-label mb-4">Core Attributes</div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/50">
                <div className="stat-label mb-2">Attack</div>
                <div className="stat-value text-xl">{player.attack}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/50">
                <div className="stat-label mb-2">Defense</div>
                <div className="stat-value text-xl">{player.defense}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/50">
                <div className="stat-label mb-2">Speed</div>
                <div className="stat-value text-xl">{player.speed}</div>
              </div>
            </div>
          </div>

          {/* Equipment Card */}
          <div className="card-glass p-4">
            <div className="stat-label mb-4">Equipment</div>
            <div className="space-y-3">
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <div className="stat-label mb-2">Weapon {player.equipped_weapon ? '⚔' : ''}</div>
                <div className="text-sm font-semibold text-cyan-300 truncate">
                  {player.equipped_weapon ? ITEM_DATABASE[player.equipped_weapon]?.name : 'Unarmed'}
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                <div className="stat-label mb-2">Armor {player.equipped_armor ? '🛡' : ''}</div>
                <div className="text-sm font-semibold text-cyan-300 truncate">
                  {player.equipped_armor ? ITEM_DATABASE[player.equipped_armor]?.name : 'No Armor'}
                </div>
              </div>
            </div>
          </div>

          {/* Battle Stats */}
          <div className="card-glass p-4">
            <div className="stat-label mb-4">Battle Stats</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                <span className="text-slate-400 text-sm">Victories</span>
                <span className="badge badge-success">{stats.battles_won}W</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                <span className="text-slate-400 text-sm">Defeats</span>
                <span className="badge badge-danger">{stats.battles_lost}L</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
                <span className="text-slate-400 text-sm">Monsters Defeated</span>
                <span className="badge badge-accent">{stats.monsters_total_defeated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Combat Arena */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Monster Selection */}
          <div className="card-glass p-4">
            <div className="stat-label mb-4">Select Your Opponent</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(MONSTER_DATABASE).map(([key, monster]) => (
                <button
                  key={key}
                  onClick={() => setActiveMonsterKey(key)}
                  className={`relative p-3 rounded-lg text-xs font-bold transition-all ${
                    activeMonsterKey === key
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg border border-cyan-400/50'
                      : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-cyan-500/30 hover:bg-slate-700/70'
                  }`}
                >
                  <div className="truncate">{monster.name}</div>
                  <div className="text-xs opacity-75 mt-1">❤ {Math.floor(monster.max_hp)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Monster Info */}
          {activeMonster && (
            <div className="card-glass p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-2xl font-bold text-cyan-300 glow-text">{activeMonster.name}</div>
                  <div className="text-slate-400 text-sm mt-1">Current Enemy</div>
                </div>
                <Button onClick={() => setActiveMonsterKey(null)} size="sm" variant="secondary">Stop Fight</Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-lg p-3 text-center border border-red-500/30">
                  <div className="stat-label mb-2">HP</div>
                  <div className="stat-value text-xl text-red-400">{Math.floor(activeMonster.max_hp)}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-600/20 to-blue-900/20 rounded-lg p-3 text-center border border-cyan-500/30">
                  <div className="stat-label mb-2">Attack</div>
                  <div className="stat-value text-xl text-cyan-400">{activeMonster.attack}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-lg p-3 text-center border border-purple-500/30">
                  <div className="stat-label mb-2">Defense</div>
                  <div className="stat-value text-xl text-purple-400">{activeMonster.defense}</div>
                </div>
              </div>
            </div>
          )}

          {/* Battle Log */}
          <div className="flex-1 card-glass p-4 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="stat-label">Combat Log</div>
                <div className="text-xs text-slate-400 mt-1">Real-time battle events</div>
              </div>
              <Button size="xs" onClick={clearLogs} variant="secondary">Clear</Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-xs font-mono pr-2">
              {currentLogs.length === 0 ? (
                <div className="text-slate-500 italic text-center py-8 flex items-center justify-center h-full">
                  <div>
                    <div className="text-lg mb-2">⚔</div>
                    <p>Select an opponent to begin battle</p>
                  </div>
                </div>
              ) : (
                currentLogs.map((log, idx) => {
                  const logClass = log.includes('derrotado') || log.includes('novo')
                    ? 'text-emerald-400 font-semibold'
                    : log.includes('dano')
                    ? 'text-amber-300'
                    : log.includes('recebeu')
                    ? 'text-red-400'
                    : 'text-slate-300';
                  return (
                    <div key={idx} className={`${logClass} leading-relaxed`}>
                      {log.length > 85 ? log.substring(0, 82) + '…' : log}
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Inventory & Crafting */}
        <div className="lg:w-80 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2">
          {/* Inventory */}
          <div className="card-glass p-4 flex-1 flex flex-col min-h-0">
            <div className="stat-label mb-3">Inventory</div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {Object.keys(player.inventory).length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <div className="text-3xl mb-2">📦</div>
                  <p className="text-sm">Your inventory is empty</p>
                </div>
              ) : (
                Object.entries(player.inventory).map(([itemKey, quantity]) => {
                  const itemData = ITEM_DATABASE[itemKey];
                  return (
                    <div key={itemKey} className="flex items-center justify-between gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-cyan-300 truncate">{itemData?.name}</div>
                        <div className="text-xs text-slate-400">{itemData?.item_type}</div>
                      </div>
                      <div className="text-sm font-bold text-amber-400">×{quantity}</div>
                      <div className="flex gap-1">
                        {itemData?.item_type === 'consumivel' && (
                          <button
                            onClick={() =>
                              manualAction((state) => {
                                const result = useConsumable(state, itemKey);
                                return result.updatedState || state;
                              })
                            }
                            className="px-2 py-1 bg-emerald-600/70 hover:bg-emerald-500 text-xs rounded font-semibold transition-all"
                            title="Use Item"
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
                          className="px-2 py-1 bg-amber-600/70 hover:bg-amber-500 text-xs rounded font-semibold transition-all"
                          title="Sell Item"
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
          <div className="card-glass p-4 flex-1 flex flex-col min-h-0">
            <div className="stat-label mb-3">Crafting</div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {player.learned_recipes.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <div className="text-3xl mb-2">🔧</div>
                  <p className="text-sm">No recipes learned yet</p>
                </div>
              ) : (
                player.learned_recipes.map((recipeKey) => {
                  const recipe = RECIPE_DATABASE[recipeKey];
                  if (!recipe) return null;

                  const canCraft = Object.entries(recipe.required_materials).every(
                    ([materialKey, needed]) => (player.inventory[materialKey] || 0) >= needed
                  );

                  return (
                    <div key={recipeKey} className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="text-sm font-bold text-cyan-300">{recipe.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">⏱ {recipe.time_to_craft}s</div>
                        </div>
                        <Button
                          size="xs"
                          variant={canCraft ? 'primary' : 'secondary'}
                          disabled={!canCraft}
                          onClick={() =>
                            manualAction((state) => {
                              const result = craftItem(state, recipeKey);
                              return result.updatedState || state;
                            })
                          }
                        >
                          Craft
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {Object.entries(recipe.required_materials).map(([materialKey, needed]) => {
                          const currentQty = player.inventory[materialKey] || 0;
                          const hasEnough = currentQty >= needed;
                          return (
                            <div key={materialKey} className={`text-xs flex justify-between ${hasEnough ? 'text-emerald-400' : 'text-red-400'}`}>
                              <span>{ITEM_DATABASE[materialKey]?.name}</span>
                              <span>{currentQty}/{needed}</span>
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
