import { useGameLoop } from '../hooks/useGameLoop';
import {
  useConsumable,
  equipWeapon,
  equipArmor,
  sellItem,
  craftItem,
  getPlayerStats,
} from '../hooks/useGameState';
import { ITEM_DATABASE, RECIPE_DATABASE, MONSTER_DATABASE } from '../data/staticDb';
import { useRef, useEffect } from 'react';

export function GameDashboard() {
  const { player, currentLogs, activeMonsterKey, isInitialized, setActiveMonsterKey, manualAction } =
    useGameLoop();

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

  // Barra de progresso moderna
  const ProgressBar = ({ current, max, color = 'cyan' }: { current: number; max: number; color?: string }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const colorClasses = {
      cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
      yellow: 'bg-gradient-to-r from-amber-500 to-amber-400',
      red: 'bg-gradient-to-r from-red-500 to-red-400',
    };
    return (
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden shadow-lg">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-300 shadow-lg`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  // Card reutilizável
  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/30 rounded-xl p-5 backdrop-blur-sm hover:border-cyan-400/50 transition-all ${className}`}
    >
      {children}
    </div>
  );

  // Label estilizado
  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="text-xs font-bold tracking-widest text-cyan-300 uppercase mb-2">{children}</div>
  );

  // Stat Row
  const StatRow = ({ label, value, color = 'text-cyan-300' }: { label: string; value: string | number; color?: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-400 font-medium">{label}</span>
      <span className={`${color} font-bold text-sm`}>{value}</span>
    </div>
  );

  // Button estilizado
  const Button = ({
    children,
    onClick,
    disabled = false,
    size = 'md',
    variant = 'primary',
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
  }) => {
    const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
    const variantClasses = {
      primary: 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white shadow-lg shadow-cyan-500/30',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-cyan-300 border border-slate-600',
      danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white',
      success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white',
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-b border-cyan-500/20 backdrop-blur-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {player.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Level {player.level} • {stats.win_rate}% Win Rate</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-400">{player.gold}</div>
            <p className="text-xs text-slate-400">OURO</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6 h-[calc(100vh-100px)] overflow-y-auto">
        
        {/* ==================== COLUNA 1: PLAYER STATUS (ESQUERDA) ==================== */}
        <div className="lg:col-span-1 space-y-4">
          {/* Vitals Card */}
          <Card>
            <Label>Vitalidade</Label>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Vida</span>
                  <span className="text-red-400 font-bold">{player.hp}/{player.max_hp}</span>
                </div>
                <ProgressBar current={player.hp} max={player.max_hp} color="red" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Experiência</span>
                  <span className="text-amber-400 font-bold">{player.exp}/{player.exp_to_next_level}</span>
                </div>
                <ProgressBar current={player.exp} max={player.exp_to_next_level} color="yellow" />
              </div>
            </div>
          </Card>

          {/* Attributes Card */}
          <Card>
            <Label>Atributos</Label>
            <div className="space-y-0">
              <StatRow label="ATK" value={`${player.attack} (${player.base_attack})`} color="text-cyan-300" />
              <StatRow label="DEF" value={`${player.defense} (${player.base_defense})`} color="text-cyan-300" />
              <StatRow label="SPD" value={player.speed} color="text-cyan-300" />
            </div>
          </Card>

          {/* Equipment Card */}
          <Card>
            <Label>Equipamento</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚔</span>
                <div>
                  <p className="text-xs text-slate-400">Arma</p>
                  <p className="text-sm font-semibold text-cyan-300">
                    {player.equipped_weapon ? ITEM_DATABASE[player.equipped_weapon]?.name : 'Desarmado'}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-700/50 pt-2 flex items-center gap-2">
                <span className="text-lg">🛡</span>
                <div>
                  <p className="text-xs text-slate-400">Armadura</p>
                  <p className="text-sm font-semibold text-cyan-300">
                    {player.equipped_armor ? ITEM_DATABASE[player.equipped_armor]?.name : 'Sem armadura'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Card */}
          <Card>
            <Label>Estatísticas</Label>
            <div className="space-y-0">
              <StatRow label="Vitórias" value={stats.battles_won} color="text-emerald-400" />
              <StatRow label="Derrotas" value={stats.battles_lost} color="text-red-400" />
              <StatRow label="Monstros" value={stats.monsters_total_defeated} color="text-cyan-300" />
              <StatRow label="Tempo" value={`${Math.floor(stats.playtime_hours)}h`} color="text-slate-300" />
            </div>
          </Card>
        </div>

        {/* ==================== COLUNA 2-3: COMBATE (CENTRO) ==================== */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          {/* Monster Selector Card */}
          <Card>
            <Label>Selecione o Inimigo</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(MONSTER_DATABASE).map(([key, monster]) => (
                <button
                  key={key}
                  onClick={() => setActiveMonsterKey(key)}
                  className={`p-3 rounded-lg font-semibold text-sm transition-all transform ${
                    activeMonsterKey === key
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:shadow-md'
                  }`}
                >
                  {monster.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Active Monster Card */}
          {activeMonster && (
            <Card>
              <Label>Inimigo Ativo</Label>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-cyan-300">{activeMonster.name}</h3>
                  <p className="text-xs text-slate-400">Tier: {'★'.repeat(Math.min(5, Math.floor(activeMonster.max_hp / 30)))}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-400">{activeMonster.max_hp}</p>
                  <p className="text-xs text-slate-400">HP</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-xs text-slate-400">ATK</p>
                  <p className="font-bold text-cyan-300">{activeMonster.attack}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-xs text-slate-400">DEF</p>
                  <p className="font-bold text-cyan-300">{activeMonster.defense}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <p className="text-xs text-slate-400">SPD</p>
                  <p className="font-bold text-cyan-300">{activeMonster.speed}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Battle Log Card */}
          <Card className="flex-1 flex flex-col">
            <Label>Battle Log</Label>
            <div className="flex-1 overflow-y-auto space-y-1 bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
              {currentLogs.length === 0 ? (
                <div className="text-sm text-slate-500 italic text-center py-8">
                  Selecione um inimigo para começar a batalha...
                </div>
              ) : (
                currentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`text-xs font-mono leading-relaxed ${
                      log.includes('derrotado') || log.includes('novo')
                        ? 'text-emerald-400'
                        : log.includes('dano')
                        ? 'text-amber-300'
                        : 'text-slate-300'
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </Card>

          {/* Action Button */}
          <Button onClick={() => setActiveMonsterKey(null)} variant="danger" size="lg">
            ⊗ Parar Combate
          </Button>
        </div>

        {/* ==================== COLUNA 4: INVENTÁRIO (DIREITA) ==================== */}
        <div className="lg:col-span-1 space-y-4 flex flex-col">
          {/* Inventory Card */}
          <Card className="flex-1 flex flex-col">
            <Label>Inventário ({Object.keys(player.inventory).length}/50)</Label>
            <div className="flex-1 overflow-y-auto space-y-1">
              {Object.keys(player.inventory).length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-4">Vazio</div>
              ) : (
                Object.entries(player.inventory).map(([itemKey, quantity]) => {
                  const itemData = ITEM_DATABASE[itemKey];
                  return (
                    <div key={itemKey} className="flex items-center justify-between gap-2 p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-cyan-300 truncate">{itemData?.name}</p>
                        <p className="text-xs text-slate-400">×{quantity}</p>
                      </div>
                      <div className="flex gap-1">
                        {itemData?.item_type === 'consumivel' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() =>
                              manualAction((state) => {
                                const result = useConsumable(state, itemKey);
                                return result.updatedState || state;
                              })
                            }
                          >
                            ✓
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            manualAction((state) => {
                              const result = sellItem(state, itemKey, 1);
                              return result.updatedState || state;
                            })
                          }
                        >
                          $
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Equipment Slots */}
          <Card>
            <Label>Equipáveis</Label>
            <div className="space-y-2">
              {Object.entries(player.inventory)
                .filter(([itemKey]) => {
                  const itemData = ITEM_DATABASE[itemKey];
                  return itemData?.item_type === 'arma' || itemData?.item_type === 'armadura';
                })
                .map(([itemKey, quantity]) => {
                  const itemData = ITEM_DATABASE[itemKey];
                  return (
                    <Button
                      key={itemKey}
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        manualAction((state) => {
                          const result = itemData?.item_type === 'arma' ? equipWeapon(state, itemKey) : equipArmor(state, itemKey);
                          return result.updatedState || state;
                        })
                      }
                    >
                      {itemData?.item_type === 'arma' ? '⚔' : '🛡'} {itemData?.name}
                    </Button>
                  );
                })}
            </div>
          </Card>

          {/* Crafting */}
          <Card className="flex-1 flex flex-col">
            <Label>Crafting ({player.learned_recipes.length})</Label>
            <div className="flex-1 overflow-y-auto space-y-2">
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
                    <div key={recipeKey} className="bg-slate-700/50 rounded-lg p-2 space-y-1">
                      <p className="text-xs font-bold text-cyan-300">{recipe.name}</p>
                      <div className="text-xs text-slate-400 space-y-0.5">
                        {Object.entries(recipe.required_materials).map(([materialKey, needed]) => {
                          const currentQty = player.inventory[materialKey] || 0;
                          const hasEnough = currentQty >= needed;
                          return (
                            <p key={materialKey} className={hasEnough ? 'text-emerald-400' : 'text-red-400'}>
                              {ITEM_DATABASE[materialKey]?.name}: {currentQty}/{needed}
                            </p>
                          );
                        })}
                      </div>
                      <Button
                        size="sm"
                        variant={canCraft ? 'success' : 'secondary'}
                        disabled={!canCraft}
                        onClick={() =>
                          manualAction((state) => {
                            const result = craftItem(state, recipeKey);
                            return result.updatedState || state;
                          })
                        }
                      >
                        Fabricar
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
