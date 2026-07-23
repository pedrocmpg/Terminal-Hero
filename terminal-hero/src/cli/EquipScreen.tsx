import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { PlayerState, equipWeapon, equipArmor, unequipWeapon, unequipArmor } from "../hooks/useGameState";
import { ITEM_DATABASE } from "../data/staticDb";

interface EquipScreenProps {
    player: PlayerState;
    manualAction: (action: (state: PlayerState) => PlayerState) => void;
    onClose: () => void;
}

export function EquipScreen({ player, manualAction, onClose }: EquipScreenProps) {
    const equipableKeys = Object.keys(player.inventory).filter((key) => {
        const type = ITEM_DATABASE[key]?.item_type;
        return type === "arma" || type === "armadura";
    });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [message, setMessage] = useState<string | null>(null);

    const clampedIndex = equipableKeys.length === 0 ? 0 : Math.min(selectedIndex, equipableKeys.length - 1);
    const selectedKey = equipableKeys[clampedIndex];
    const selectedItem = selectedKey ? ITEM_DATABASE[selectedKey] : null;

    useInput((input, key) => {
        if (input === "q" || key.escape) {
            onClose();
            return;
        }
        if (key.upArrow) {
            setSelectedIndex((idx) => (equipableKeys.length === 0 ? 0 : (idx - 1 + equipableKeys.length) % equipableKeys.length));
            return;
        }
        if (key.downArrow) {
            setSelectedIndex((idx) => (equipableKeys.length === 0 ? 0 : (idx + 1) % equipableKeys.length));
            return;
        }

        if (key.return) {
            if (!selectedKey || !selectedItem) return;
            manualAction((state) => {
                if (selectedItem.item_type === "arma") {
                    const result = equipWeapon(state, selectedKey);
                    setMessage(result.success ? `Equipou ${selectedItem.name}!` : result.error || "");
                    return result.updatedState || state;
                } else {
                    const result = equipArmor(state, selectedKey);
                    setMessage(result.success ? `Equipou ${selectedItem.name}!` : result.error || "");
                    return result.updatedState || state;
                }
            });
            return;
        }

        if (input === "w") {
            manualAction((state) => {
                const result = unequipWeapon(state);
                setMessage(result.success ? "Arma removida." : "Nenhuma arma equipada.");
                return result.updatedState || state;
            });
            return;
        }

        if (input === "a") {
            manualAction((state) => {
                const result = unequipArmor(state);
                setMessage(result.success ? "Armadura removida." : "Nenhuma armadura equipada.");
                return result.updatedState || state;
            });
            return;
        }
    });

    const equippedWeapon = player.equipped_weapon ? ITEM_DATABASE[player.equipped_weapon] : null;
    const equippedArmor = player.equipped_armor ? ITEM_DATABASE[player.equipped_armor] : null;

    return (
        <Box flexDirection="column" width={100}>
            <Box borderStyle="round" borderColor="blue" paddingX={1} justifyContent="space-between">
                <Text bold color="blue">
                    EQUIPAMENTO
                </Text>
                <Text dimColor>Nível {player.level}</Text>
            </Box>

            <Box flexDirection="row" marginTop={1}>
                <Box flexDirection="column" width={45} borderStyle="single" borderColor="gray" paddingX={1}>
                    <Text bold>Itens equipáveis</Text>
                    {equipableKeys.length === 0 ? (
                        <Text dimColor>Nenhuma arma ou armadura no inventário.</Text>
                    ) : (
                        equipableKeys.map((key, idx) => {
                            const item = ITEM_DATABASE[key];
                            const qty = player.inventory[key];
                            const isEquipped = key === player.equipped_weapon || key === player.equipped_armor;
                            const isSelected = idx === clampedIndex;
                            const prefix = isSelected ? "> " : "  ";
                            const color = isSelected ? "cyan" : isEquipped ? "green" : "white";
                            return (
                                <Text key={key} color={color}>
                                    {prefix}
                                    {item.name} x{qty}
                                    {isEquipped ? " [equipado]" : ""}
                                </Text>
                            );
                        })
                    )}

                    <Box marginTop={1} flexDirection="column">
                        <Text bold>Equipado agora</Text>
                        <Text>Arma: {equippedWeapon ? equippedWeapon.name : "-"}</Text>
                        <Text>Armadura: {equippedArmor ? equippedArmor.name : "-"}</Text>
                    </Box>
                </Box>

                <Box flexDirection="column" width={55} borderStyle="single" borderColor="gray" paddingX={1} marginLeft={1}>
                    <Text bold>Detalhes</Text>
                    {selectedItem ? (
                        <>
                            <Text>{selectedItem.name}</Text>
                            <Text dimColor>Tipo: {selectedItem.item_type === "arma" ? "Arma" : "Armadura"}</Text>
                            {selectedItem.damage_bonus ? <Text color="red">+{selectedItem.damage_bonus} ATK</Text> : null}
                            {selectedItem.defense_bonus ? <Text color="cyan">+{selectedItem.defense_bonus} DEF</Text> : null}
                            <Box marginTop={1}>
                                <Text dimColor>Aperte [Enter] para equipar.</Text>
                            </Box>
                        </>
                    ) : (
                        <Text dimColor>Nenhum item selecionado.</Text>
                    )}
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>Status atual</Text>
                        <Text>ATK {player.attack} (base {player.base_attack})</Text>
                        <Text>DEF {player.defense} (base {player.base_defense})</Text>
                    </Box>
                </Box>
            </Box>

            <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1} justifyContent="space-between">
                <Text dimColor>[↑↓] navegar  [Enter] equipar  [w] remover arma  [a] remover armadura  [q/Esc] voltar</Text>
            </Box>

            {message && (
                <Box paddingX={1}>
                    <Text color="yellow">{message}</Text>
                </Box>
            )}
        </Box>
    );
}
