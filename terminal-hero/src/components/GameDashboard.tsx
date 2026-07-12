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

  // Auto-scroll para o final do log
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentLogs]);

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center font-mono">
        <div className="text-green-400 text-xl animate-pulse">
          &gt; INICIALIZANDO SISTEMA...
        </div>
      </div>
    );
  }

  const activeMonster = activeMonsterKey ? MONSTER_DATABASE[activeMonsterKey] : null;
  const stats = getPlayerStats(player);

  // Renderizar barra de progresso (rectângular, sem arredondamento)
  const renderProgressBar = (current: number, max: number, height: string = 'h-4'): string => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    const barWidth = Math.floor(percentage / 5);
    return '█'.repeat(barWidth) + '░'.repeat(20 - barWidth);
  };

  return (
    <div className="h-screen w-screen bg-black text-green-400 font-mono overflow-hidden p-1">
      {/* Grid Principal: 3 colunas no desktop, 1 no mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 h-full">
        
        {/* ==================== COLUNA 1 (ESQUERDA): STATUS DO JOGADOR ==================== */}
        <div className="md:col-span-1 flex flex-col border border-green-500/50 bg-black/30">
          {/* Header */}
          <div className="border-b border-green-500/50 px-2 py-1 bg-black/50">
            <div className="text-fuchsia-500 font-bold text-xs">
              &gt; PLAYER_STATUS
            </div>
          </div>

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 text-xs">
            
            {/* Identidade */}
            <div className="space-y-0.5">
              <div className="text-green-400">
                <span className="text-fuchsia-500">NOME:</span> {player.name}
              </div>
              <div className="text-green-400">
                <span className="text-fuchsia-500">LEVEL:</span> {player.level}
              </div>
              <div className="text-green-400">
                <span className="text-fuchsia-500">OURO:</span> {player.gold}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-green-500/20 my-1"></div>

            {/* Atributos */}
            <div className="space-y-0.5">
              <div className="text-fuchsia-500 font-bold">≡ ATRIBUTOS</div>
              <div className="text-green-400">
                <span className="text-green-500">ATK:</span> {player.attack} ({player.base_attack})
              </div>
              <div className="text-green-400">
                <span className="text-green-500">DEF:</span> {player.defense} ({player.base_defense})
              </div>
              <div className="text-green-400">
                <span className="text-green-500">SPD:</span> {player.speed}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-green-500/20 my-1"></div>

            {/* HP Bar */}
            <div className="space-y-0.5">
              <div className="text-fuchsia-500 font-bold">≡ VITALIDADE</div>
              <div className="text-red-500 font-mono text-xs">
                [{renderProgressBar(player.hp, player.max_hp)}]
              </div>
              <div className="text-center text-green-400 text-xs">
                {player.hp}/{player.max_hp} HP
              </div>
            </div>

            {/* EXP Bar */}
            <div className="space-y-0.5">
              <div className="text-fuchsia-500 font-bold">≡ EXPERIÊNCIA</div>
              <div className="text-yellow-400 font-mono text-xs">
                [{renderProgressBar(player.exp, player.exp_to_next_level)}]
              </div>
              <div className="text-center text-green-400 text-xs">
                {player.exp}/{player.exp_to_next_level} XP
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-green-500/20 my-1"></div>

            {/* Estatísticas de Combate */}
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
              <div className="text-green-400">
                <span className="text-green-500">EXP TOT:</span> {stats.experience_total}
              </div>
            </div>

            {/* Equipamento Atual */}
            <div className="space-y-0.5">
              <div className="text-fuchsia-500 font-bold">≡ EQUIPAMENTO</div>
              <div className="text-yellow-400 text-xs">
                ⚔ {player.equipped_weapon ? ITEM_DATABASE[player.equipped_weapon]?.name : 'Desarmado'}
              </div>
              <div className="text-yellow-400 text-xs">
                🛡 {player.equipped_armor ? ITEM_DATABASE[player.equipped_armor]?.name : 'Sem armadura'}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== COLUNA 2 (CENTRO): COMBATE ==================== */}
        <div className="md:col-span-1 flex flex-col border border-green-500/50 bg-black/30">
          {/* Header */}
          <div className="border-b border-green-500/50 px-2 py-1 bg-black/50">
            <div className="text-fuchsia-500 font-bold text-xs">
              &gt; COMBATE_ATIVO
            </div>
          </div>

          {/* Seletor de Monstros */}
          <div className="px-2 py-2 border-b border-green-500/20">
            <div className="text-green-400 font-bold text-xs mb-1">Selecione Alvo:</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(MONSTER_DATABASE).map(([key, monster]) => (
                <button
                  key={key}
                  onClick={() => setActiveMonsterKey(key)}
                  className={`px-2 py-1 text-xs font-mono border transition ${
                    activeMonsterKey === key
                      ? 'bg-green-400 text-black border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                      : 'bg-black text-green-400 border-green-500/50 hover:border-green-400 hover:shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                  }`}
                >
                  {monster.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info do Monstro Ativo */}
          {activeMonster && (
            <div className="px-2 py-2 border-b border-green-500/20 text-xs space-y-1">
              <div className="text-fuchsia-500 font-bold">≡ INIMIGO ATIVO</div>
              <div className="text-yellow-400 font-bold">{activeMonster.name}</div>
              <div className="text-green-400">
                <span className="text-green-500">HP:</span> {activeMonster.max_hp} |
                <span className="text-green-500"> ATK:</span> {activeMonster.attack} |
                <span className="text-green-500"> DEF:</span> {activeMonster.defense}
              </div>
            </div>
          )}

          {/* Terminal de Logs */}
          <div className="flex-1 overflow-y-auto border-t border-green-500/20 p-2 bg-black/70 space-y-0">
            {currentLogs.length === 0 ? (
              <div className="text-green-300 text-xs italic">
                &gt; Selecione um inimigo para começar a batalha...
              </div>
            ) : (
              currentLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="text-green-400 text-xs font-mono leading-tight whitespace-pre-wrap break-words"
                >
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Ação Parar Combate */}
          <div className="px-2 py-2 border-t border-green-500/20">
            <button
              onClick={() => setActiveMonsterKey(null)}
              className="w-full px-2 py-1 text-xs font-mono bg-black text-red-500 border border-red-500/50 hover:border-red-500 hover:bg-red-500/10 transition shadow-[0_0_8px_rgba(239,68,68,0.2)]"
            >
              PARAR COMBATE
            </button>
          </div>
        </div>

        {/* ==================== COLUNA 3 (DIREITA): INVENTÁRIO, EQUIPAMENTO, CRAFTING ==================== */}
        <div className="md:col-span-1 flex flex-col border border-green-500/50 bg-black/30">
          {/* Header */}
          <div className="border-b border-green-500/50 px-2 py-1 bg-black/50">
            <div className="text-fuchsia-500 font-bold text-xs">
              &gt; INVENTORY_SYSTEM
            </div>
          </div>

          {/* Conteúdo com Abas Virtuais */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 text-xs">
            
            {/* ========== INVENTÁRIO ========== */}
            <div className="space-y-1">
              <div className="text-fuchsia-500 font-bold">≡ INVENTÁRIO ({Object.keys(player.inventory).length})</div>
              <div className="border border-green-500/20 p-1 bg-black/50 max-h-32 overflow-y-auto space-y-0.5">
                {Object.keys(player.inventory).length === 0 ? (
                  <div className="text-green-300 italic">Vazio</div>
                ) : (
                  Object.entries(player.inventory).map(([itemKey, quantity]) => {
                    const itemData = ITEM_DATABASE[itemKey];
                    return (
                      <div key={itemKey} className="flex justify-between items-center gap-1">
                        <div className="flex-1 min-w-0">
                          <span className="text-green-400">{itemData?.name || itemKey}</span>
                          <span className="text-yellow-400 ml-1">x{quantity}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {itemData?.item_type === 'consumivel' && (
                            <button
                              onClick={() =>
                                manualAction((state) => {
                                  const result = useConsumable(state, itemKey);
                                  return result.updatedState || state;
                                })
                              }
                              className="px-1 py-0 bg-black text-green-400 border border-green-500/30 hover:border-green-400 text-xs whitespace-nowrap"
                            >
                              USAR
                            </button>
                          )}
                          <button
                            onClick={() =>
                              manualAction((state) => {
                                const result = sellItem(state, itemKey, 1);
                                return result.updatedState || state;
                              })
                            }
                            className="px-1 py-0 bg-black text-green-400 border border-green-500/30 hover:border-red-500 hover:text-red-500 text-xs whitespace-nowrap"
                          >
                            VND
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-green-500/20"></div>

            {/* ========== EQUIPAMENTOS ========== */}
            <div className="space-y-1">
              <div className="text-fuchsia-500 font-bold">≡ EQUIPAMENTOS</div>
              <div className="border border-green-500/20 p-1 bg-black/50 space-y-0.5 text-xs">
                <div>
                  <span className="text-green-500">⚔ ARMA:</span>{' '}
                  {player.equipped_weapon ? (
                    <span className="text-yellow-400">{ITEM_DATABASE[player.equipped_weapon]?.name}</span>
                  ) : (
                    <span className="text-green-300">Desarmado</span>
                  )}
                </div>
                <div>
                  <span className="text-green-500">🛡 ARMADURA:</span>{' '}
                  {player.equipped_armor ? (
                    <span className="text-yellow-400">{ITEM_DATABASE[player.equipped_armor]?.name}</span>
                  ) : (
                    <span className="text-green-300">Sem armadura</span>
                  )}
                </div>
              </div>

              {/* Equipáveis */}
              <div className="space-y-0.5">
                {Object.entries(player.inventory).map(([itemKey]) => {
                  const itemData = ITEM_DATABASE[itemKey];
                  if (itemData?.item_type === 'arma') {
                    return (
                      <button
                        key={itemKey}
                        onClick={() =>
                          manualAction((state) => {
                            const result = equipWeapon(state, itemKey);
                            return result.updatedState || state;
                          })
                        }
                        className="block w-full text-left px-1 py-0.5 text-xs bg-black text-green-400 border border-green-500/30 hover:border-green-400 hover:bg-green-500/10"
                      >
                        ⚔ {itemData.name}
                      </button>
                    );
                  }
                  if (itemData?.item_type === 'armadura') {
                    return (
                      <button
                        key={itemKey}
                        onClick={() =>
                          manualAction((state) => {
                            const result = equipArmor(state, itemKey);
                            return result.updatedState || state;
                          })
                        }
                        className="block w-full text-left px-1 py-0.5 text-xs bg-black text-green-400 border border-green-500/30 hover:border-green-400 hover:bg-green-500/10"
                      >
                        🛡 {itemData.name}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-green-500/20"></div>

            {/* ========== CRAFTING ========== */}
            <div className="space-y-1">
              <div className="text-fuchsia-500 font-bold">≡ CRAFTING ({player.learned_recipes.length})</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {player.learned_recipes.length === 0 ? (
                  <div className="text-green-300 text-xs italic">Nenhuma receita aprendida</div>
                ) : (
                  player.learned_recipes.map((recipeKey) => {
                    const recipe = RECIPE_DATABASE[recipeKey];
                    if (!recipe) return null;

                    const canCraft = Object.entries(recipe.required_materials).every(
                      ([materialKey, needed]) => {
                        return (player.inventory[materialKey] || 0) >= needed;
                      }
                    );

                    return (
                      <div key={recipeKey} className="text-xs border border-green-500/20 p-1 bg-black/50 space-y-0.5">
                        <div className="text-yellow-400 font-bold">{recipe.name}</div>
                        <div className="text-green-300 space-y-0">
                          {Object.entries(recipe.required_materials)
                            .map(([materialKey, needed]) => {
                              const currentQty = player.inventory[materialKey] || 0;
                              const material = ITEM_DATABASE[materialKey];
                              const hasEnough = currentQty >= needed;
                              return (
                                <div
                                  key={materialKey}
                                  className={hasEnough ? 'text-green-400' : 'text-red-500'}
                                >
                                  {material?.name}: {currentQty}/{needed}
                                </div>
                              );
                            })}
                        </div>
                        <button
                          onClick={() =>
                            manualAction((state) => {
                              const result = craftItem(state, recipeKey);
                              return result.updatedState || state;
                            })
                          }
                          disabled={!canCraft}
                          className={`w-full px-1 py-0.5 text-xs font-mono border transition ${
                            canCraft
                              ? 'bg-black text-green-400 border-green-500/50 hover:border-green-400 hover:bg-green-500/10'
                              : 'bg-black text-green-500/30 border-green-500/10 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          FABRICAR
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
