import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { PlayerState, craftItem, learnRecipe, canLearnRecipe } from "../hooks/useGameState";
import { ITEM_DATABASE, RECIPE_DATABASE } from "../data/staticDb";

interface CraftScreenProps {
    player: PlayerState;
    manualAction: (action: (state: PlayerState) => PlayerState) => void;
    onClose: () => void;
}

export function CraftScreen({ player, manualAction, onClose }: CraftScreenProps) {
    const recipeKeys = Object.keys(RECIPE_DATABASE);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [message, setMessage] = useState<string | null>(null);

    useInput((input, key) => {
        if (input === "q" || key.escape) {
            onClose();
            return;
        }
        if (key.upArrow) {
            setSelectedIndex((idx) => (idx - 1 + recipeKeys.length) % recipeKeys.length);
            return;
        }
        if (key.downArrow) {
            setSelectedIndex((idx) => (idx + 1) % recipeKeys.length);
            return;
        }

        const recipeKey = recipeKeys[selectedIndex];
        const recipe = RECIPE_DATABASE[recipeKey];
        const isLearned = player.learned_recipes.includes(recipeKey);

        if (key.return) {
            if (!isLearned) {
                setMessage("Você ainda não aprendeu esta receita. Aperte [a] para aprender.");
                return;
            }
            manualAction((state) => {
                const result = craftItem(state, recipeKey);
                setMessage(result.message || result.error || "");
                return result.updatedState || state;
            });
            return;
        }

        if (input === "a") {
            if (isLearned) {
                setMessage("Receita já aprendida.");
                return;
            }
            manualAction((state) => {
                const result = learnRecipe(state, recipeKey);
                setMessage(
                    result.success
                        ? `Receita aprendida: ${recipe.name}!`
                        : result.error || "Não foi possível aprender."
                );
                return result.updatedState || state;
            });
            return;
        }
    });

    return (
        <Box flexDirection="column" width={100}>
            <Box borderStyle="round" borderColor="magenta" paddingX={1} justifyContent="space-between">
                <Text bold color="magenta">
                    CRAFTING
                </Text>
                <Text dimColor>Nível {player.level}</Text>
            </Box>

            <Box flexDirection="row" marginTop={1}>
                <Box flexDirection="column" width={45} borderStyle="single" borderColor="gray" paddingX={1}>
                    <Text bold>Receitas</Text>
                    {recipeKeys.map((key, idx) => {
                        const recipe = RECIPE_DATABASE[key];
                        const isLearned = player.learned_recipes.includes(key);
                        const meetsLevel = canLearnRecipe(player, key) || isLearned;
                        const isSelected = idx === selectedIndex;
                        const prefix = isSelected ? "> " : "  ";
                        const status = isLearned ? "" : meetsLevel ? " [não aprendida]" : ` [precisa Lv.${recipe.level_required}]`;
                        const color = isSelected ? "cyan" : isLearned ? "white" : "gray";
                        return (
                            <Text key={key} color={color}>
                                {prefix}
                                {recipe.name}
                                {status}
                            </Text>
                        );
                    })}
                </Box>

                <Box flexDirection="column" width={55} borderStyle="single" borderColor="gray" paddingX={1} marginLeft={1}>
                    <Text bold>Detalhes</Text>
                    {(() => {
                        const recipeKey = recipeKeys[selectedIndex];
                        const recipe = RECIPE_DATABASE[recipeKey];
                        const isLearned = player.learned_recipes.includes(recipeKey);
                        const craftedItem = ITEM_DATABASE[recipe.crafted_item];
                        const canCraft =
                            isLearned &&
                            player.level >= recipe.level_required &&
                            Object.entries(recipe.required_materials).every(
                                ([mat, qty]) => (player.inventory[mat] || 0) >= qty
                            );

                        return (
                            <>
                                <Text>
                                    Produz: {craftedItem?.name || recipe.crafted_item} x{recipe.quantity_crafted || 1}
                                </Text>
                                <Text dimColor>Nível exigido: {recipe.level_required}</Text>
                                <Box marginTop={1} flexDirection="column">
                                    <Text bold>Materiais</Text>
                                    {Object.entries(recipe.required_materials).map(([mat, qty]) => {
                                        const have = player.inventory[mat] || 0;
                                        const enough = have >= qty;
                                        return (
                                            <Text key={mat} color={enough ? "green" : "red"}>
                                                {ITEM_DATABASE[mat]?.name || mat}: {have}/{qty}
                                            </Text>
                                        );
                                    })}
                                </Box>
                                <Box marginTop={1}>
                                    <Text color={canCraft ? "green" : "gray"}>
                                        {isLearned ? (canCraft ? "Pronta para craftar!" : "Faltam materiais.") : "Receita não aprendida."}
                                    </Text>
                                </Box>
                            </>
                        );
                    })()}
                </Box>
            </Box>

            <Box borderStyle="single" borderColor="gray" paddingX={1} marginTop={1} justifyContent="space-between">
                <Text dimColor>[↑↓] navegar  [Enter] craftar  [a] aprender receita  [q/Esc] voltar</Text>
            </Box>

            {message && (
                <Box paddingX={1}>
                    <Text color="yellow">{message}</Text>
                </Box>
            )}
        </Box>
    );
}
