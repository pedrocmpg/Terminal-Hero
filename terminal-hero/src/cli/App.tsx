import React, { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { useGameEngine } from "./useGameEngine";
import { CraftScreen } from "./CraftScreen";
import { EquipScreen } from "./EquipScreen";
import {
    useConsumable,
    prestigeReset,
    canPrestige,
    getPlayerStats,
} from "../hooks/useGameState";
import { ITEM_DATABASE, MONSTER_DATABASE } from "../data/staticDb";

function Bar({ current, max, width = 20, color }: { current: number; max: number; width?: number; color: string }) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    const filled = Math.round(ratio * width);
    const bar = "█".repeat(filled) + "░".repeat(width - filled);
    return (
        <Text>
            <Text color={color}>{bar}</Text> {Math.floor(current)}/{Math.floor(max)}
        </Text>
    );
}

export function App() {
    const { exit } = useApp();
    const { player, logs, activeMonsterKey, setActiveMonsterKey, manualAction, clearLogs } = useGameEngine();
    const [message, setMessage] = useState<string | null>(null);
    const [screen, setScreen] = useState<"main" | "craft" | "equip">("main");

    const monsterKeys = Object.keys(MONSTER_DATABASE);
    const activeMonster = activeMonsterKey ? MONSTER_DATABASE[activeMonsterKey] : null;
    const stats = getPlayerStats(player);

    const flash = (msg: string) => setMessage(msg);

    useInput((input, key) => {
        if (screen !== "main") return;
        if (input === "q") {
            exit();
            return;
        }
        if (input === "m") {
            const idx = activeMonsterKey ? monsterKeys.indexOf(activeMonsterKey) : -1;
            const next = monsterKeys[(idx + 1) % monsterKeys.length];
            setActiveMonsterKey(next);
            flash(`Trocou para ${MONSTER_DATABASE[next].name}`);
            return;
        }
        if (input === "s") {
            setActiveMonsterKey(null);
            flash("Combate interrompido.");
            return;
        }
        if (input === "p") {
            const potionKey = Object.keys(player.inventory).find(
                (k) => ITEM_DATABASE[k]?.item_type === "consumivel"
            );
            if (!potionKey) {
                flash("Nenhum consumível disponível.");
                return;
            }
            manualAction((state) => {
                const result = useConsumable(state, potionKey);
                flash(result.message || result.error || "");
                return result.updatedState || state;
            });
            return;
        }
        if (input === "c") {
            setScreen("craft");
            return;
        }
        if (input === "e") {
            setScreen("equip");
            return;
        }
        if (input === "r") {
            if (!canPrestige(player)) {
                flash(`Nível insuficiente para prestigiar (precisa ${10 + player.prestige_level * 5}).`);
                return;
            }
            manualAction((state) => {
                const result = prestigeReset(state);
                flash(result.message || "");
                return result.updatedState || state;
            });
            return;
        }
        if (input === "l") {
            clearLogs();
        }
    });

    if (screen === "craft") {
        return <CraftScreen player={player} manualAction={manualAction} onClose={() => setScreen("main")} />;
    }

    if (screen === "equip") {
        return <EquipScreen player={player} manualAction={manualAction} onClose={() => setScreen("main")} />;
    }

    return (
        <Box flexDirection="column" width={100}>
            <Box borderStyle="round" borderColor="cyan" paddingX={1} justifyContent="space-between">
                <Text bold color="cyan">
                    TERMINAL HERO
                </Text>
                <Text>
                    Lv.{player.level} · {stats.win_rate}% WR · ✦{player.prestige_level} · ₹{player.gold}
                </Text>
            </Box>

            <Box flexDirection="row" marginTop={1}>
                <Box flexDirection="column" width={40} borderStyle="single" borderColor="gray" paddingX={1}>
                    <Text bold>Herói: {player.name}</Text>
                    <Text>HP: </Text>
                    <Bar current={player.hp} max={player.max_hp} color="red" />
                    <Text>XP: </Text>
                    <Bar current={player.exp} max={player.exp_to_next_level} color="cyan" />
                    <Text>ATK {player.attack}  DEF {player.defense}  SPD {player.speed}</Text>
                    <Text>Vitórias: {stats.battles_won}  Derrotas: {stats.battles_lost}</Text>
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>Equipado</Text>
                        <Text dimColor>
                            Arma: {player.equipped_weapon ? ITEM_DATABASE[player.equipped_weapon]?.name : "-"}
                        </Text>
                        <Text dimColor>
                            Armadura: {player.equipped_armor ? ITEM_DATABASE[player.equipped_armor]?.name : "-"}
                        </Text>
                    </Box>
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>Inventário</Text>
                        {Object.keys(player.inventory).length === 0 ? (
                            <Text dimColor>vazio</Text>
                        ) : (
                            Object.entries(player.inventory).map(([key, qty]) => (
                                <Text key={key}>
                                    {ITEM_DATABASE[key]?.name || key} x{qty}
                                </Text>
                            ))
                        )}
                    </Box>
                </Box>

                <Box flexDirection="column" width={60} borderStyle="single" borderColor="gray" paddingX={1} marginLeft={1}>
                    <Text bold>Combate</Text>
                    {activeMonster ? (
                        <>
                            <Text color="yellow">{activeMonster.name}</Text>
                            <Text dimColor>
                                HP {activeMonster.max_hp}  ATK {activeMonster.attack}  DEF {activeMonster.defense}
                            </Text>
                        </>
                    ) : (
                        <Text dimColor>Nenhum monstro selecionado</Text>
                    )}
                    <Box marginTop={1} flexDirection="column" height={12}>
                        <Text bold>Log</Text>
                        {logs.slice(-10).map((line, idx) => (
                            <Text key={idx} wrap="truncate-end">
                                {line}
                            </Text>
                        ))}
                    </Box>
                </Box>
            </Box>

            <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1} justifyContent="space-between">
                <Text dimColor>
                    [m] trocar monstro  [s] parar  [p] poção  [c] crafting  [e] equipar  [r] prestigiar  [l] limpar log  [q] sair
                </Text>
            </Box>

            {message && (
                <Box paddingX={1}>
                    <Text color="green">{message}</Text>
                </Box>
            )}
        </Box>
    );
}
