import json
import os
from datetime import datetime


class SaveSystem:
    """Handles save/load operations for player state persistence."""

    SAVE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saves")

    def save_game(self, player, filename=None):
        """Serialize player state to JSON file.

        Args:
            player: Player instance to save
            filename: Optional filename (auto-generated if None)

        Returns:
            str: filename written
        """
        # Ensure saves directory exists
        os.makedirs(self.SAVE_DIR, exist_ok=True)

        # Generate filename if not provided
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"savegame_{timestamp}.json"

        # Serialize player data
        save_data = {
            "name": player.name,
            "level": player.level,
            "hp": player.hp,
            "max_hp": player.max_hp,
            "base_attack": player.base_attack,
            "base_defense": player.base_defense,
            "attack": player.attack,
            "defense": player.defense,
            "exp": player.exp,
            "exp_to_next_level": player.exp_to_next_level,
            "gold": player.gold,
            "inventory": dict(player.inventory.items),
            "equipped_weapon": player.equipped_weapon,
            "equipped_armor": player.equipped_armor,
            "abilities": [a.ability_key for a in player.abilities],
            "learned_recipes": player.learned_recipes,
        }

        filepath = os.path.join(self.SAVE_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(save_data, f, indent=2, ensure_ascii=False)

        return filename

    def validate_save_data(self, save_data):
        """Validate loaded save data for integrity.

        Args:
            save_data: dict loaded from JSON save file

        Returns:
            tuple: (is_valid: bool, warnings: list[str])
        """
        from models import ITEM_DATABASE

        warnings = []

        # Check stat bounds
        stat_bounds = {
            "hp": (1, 1000),
            "max_hp": (1, 1000),
            "attack": (1, 200),
            "defense": (0, 200),
            "base_attack": (1, 200),
            "base_defense": (0, 200),
            "level": (1, 100),
            "exp": (0, 10000),
            "exp_to_next_level": (50, 10000),
            "gold": (0, 100000),
        }

        for stat, (min_val, max_val) in stat_bounds.items():
            value = save_data.get(stat)
            if value is None:
                warnings.append(f"Missing stat: {stat}")
            elif not isinstance(value, int):
                warnings.append(f"Stat '{stat}' is not an integer: {value}")
            elif value < min_val or value > max_val:
                warnings.append(f"Stat '{stat}' out of bounds: {value} (expected {min_val}-{max_val})")

        # Check inventory items exist in ITEM_DATABASE
        inventory = save_data.get("inventory", {})
        for item_key in inventory:
            if item_key not in ITEM_DATABASE:
                warnings.append(f"Unknown item in inventory: '{item_key}'")

        # Check equipped items
        equipped_weapon = save_data.get("equipped_weapon")
        if equipped_weapon is not None:
            if equipped_weapon not in ITEM_DATABASE:
                warnings.append(f"Equipped weapon '{equipped_weapon}' not in ITEM_DATABASE")
            elif equipped_weapon not in inventory:
                warnings.append(f"Equipped weapon '{equipped_weapon}' not in inventory")

        equipped_armor = save_data.get("equipped_armor")
        if equipped_armor is not None:
            if equipped_armor not in ITEM_DATABASE:
                warnings.append(f"Equipped armor '{equipped_armor}' not in ITEM_DATABASE")
            elif equipped_armor not in inventory:
                warnings.append(f"Equipped armor '{equipped_armor}' not in inventory")

        is_valid = len(warnings) == 0

        if not is_valid:
            print("\u26a0\ufe0f Save data validation warnings:")
            for w in warnings:
                print(f"  - {w}")

        return (is_valid, warnings)

    def list_saves(self):
        """List available save files with metadata.

        Returns:
            list of tuples: (filename, level, name, timestamp)
            Sorted by timestamp (newest first)
        """
        if not os.path.exists(self.SAVE_DIR):
            return []

        saves = []
        for filename in os.listdir(self.SAVE_DIR):
            if filename.endswith(".json") and filename.startswith("savegame_"):
                filepath = os.path.join(self.SAVE_DIR, filename)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    # Parse timestamp from filename: savegame_YYYYMMDD_HHMMSS.json
                    timestamp_str = filename.replace("savegame_", "").replace(".json", "")
                    timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
                    saves.append((
                        filename,
                        data.get("level", 1),
                        data.get("name", "Unknown"),
                        timestamp
                    ))
                except (json.JSONDecodeError, KeyError, ValueError):
                    continue

        # Sort by timestamp, newest first
        saves.sort(key=lambda x: x[3], reverse=True)
        return saves

    def load_game(self, filename):
        """Deserialize JSON file to Player object.

        Args:
            filename: Save filename to load

        Returns:
            Player instance with all state restored

        Raises:
            FileNotFoundError: if save file doesn't exist
            json.JSONDecodeError: if file is corrupted
        """
        from models import Player, Ability, ABILITY_DATABASE

        filepath = os.path.join(self.SAVE_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            save_data = json.load(f)

        # Create player with base stats
        player = Player(
            name=save_data["name"],
            hp=save_data["hp"],
            attack=save_data["base_attack"],
            defense=save_data["base_defense"],
            level=save_data["level"],
        )

        # Restore all attributes
        player.max_hp = save_data["max_hp"]
        player.hp = save_data["hp"]
        player.base_attack = save_data["base_attack"]
        player.base_defense = save_data["base_defense"]
        player.attack = save_data["attack"]
        player.defense = save_data["defense"]
        player.exp = save_data["exp"]
        player.exp_to_next_level = save_data["exp_to_next_level"]
        player.gold = save_data["gold"]

        # Restore inventory
        player.inventory.clear()
        for item_key, quantity in save_data["inventory"].items():
            player.inventory.items[item_key] = quantity

        # Restore equipment
        player.equipped_weapon = save_data["equipped_weapon"]
        player.equipped_armor = save_data["equipped_armor"]

        # Restore abilities
        player.abilities = []
        for ability_key in save_data.get("abilities", []):
            if ability_key in ABILITY_DATABASE:
                player.abilities.append(Ability(ability_key))

        # Restore learned recipes
        player.learned_recipes = save_data.get("learned_recipes", [])

        # Trim inventory if it exceeds capacity (version compatibility)
        self.trim_inventory_overflow(player)

        return player

    def trim_inventory_overflow(self, player, max_slots=50):
        """Trim excess inventory items using FIFO removal (oldest first).

        If inventory has more than max_slots unique item types,
        removes the excess oldest items (by dict insertion order in Python 3.7+).

        Args:
            player: Player instance with inventory to trim
            max_slots: Maximum unique item slots (default 50)

        Returns:
            int: number of item types removed
        """
        current_items = dict(player.inventory.items)
        num_items = len(current_items)

        if num_items <= max_slots:
            return 0

        excess = num_items - max_slots

        # Remove oldest items (first in dict order = oldest acquired)
        items_to_remove = list(current_items.keys())[:excess]

        for item_key in items_to_remove:
            del player.inventory.items[item_key]

        print(f"Inventory trimmed: {excess} items removed due to version compatibility")
        return excess
