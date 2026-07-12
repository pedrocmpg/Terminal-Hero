"""Terminal User Interface for Terminal-Hero."""

import os
from datetime import datetime
from models import ITEM_DATABASE, RECIPE_DATABASE


class TUI:
    """Handles all terminal rendering and user input for the game."""

    SEPARATOR = "=" * 40
    THIN_SEPARATOR = "-" * 40

    def clear_screen(self):
        """Clear the terminal screen."""
        os.system("cls" if os.name == "nt" else "clear")

    def render_main_menu(self):
        """Render the main menu on game startup.

        Clears screen and displays the Terminal-Hero title with options:
        [N]ew Game, [L]oad Game, [Q]uit.
        """
        self.clear_screen()

        print(self.SEPARATOR)
        print("         Terminal-Hero")
        print(self.SEPARATOR)
        print()
        print("  [N] New Game")
        print("  [L] Load Game")
        print("  [Q] Quit")
        print()
        print(self.THIN_SEPARATOR)

    def render_player_status(self, player):
        """Display formatted player status panel.

        Shows: name, level, HP/max_HP, attack, defense,
        exp/exp_to_next_level, gold, equipped_weapon, equipped_armor.
        """
        width = 40
        separator = self.SEPARATOR
        thin_sep = self.THIN_SEPARATOR

        # Resolve equipped item names
        weapon_name = "None"
        if player.equipped_weapon and player.equipped_weapon in ITEM_DATABASE:
            weapon_name = ITEM_DATABASE[player.equipped_weapon]["name"]

        armor_name = "None"
        if player.equipped_armor and player.equipped_armor in ITEM_DATABASE:
            armor_name = ITEM_DATABASE[player.equipped_armor]["name"]

        lines = [
            separator,
            f"{'[ ' + player.name + ' ]':^{width}}",
            separator,
            f"  Level:      {player.level}",
            f"  HP:         {player.hp}/{player.max_hp}",
            thin_sep,
            f"  Attack:     {player.attack}",
            f"  Defense:    {player.defense}",
            thin_sep,
            f"  EXP:        {player.exp}/{player.exp_to_next_level}",
            f"  Gold:       {player.gold}",
            thin_sep,
            f"  Weapon:     {weapon_name}",
            f"  Armor:      {armor_name}",
            separator,
        ]

        output = "\n".join(lines)
        print(output)
        return output

    def render_equipment_menu(self, player):
        """Display equipment menu showing equipped items and available equipment.

        Shows currently equipped weapon and armor with their bonuses,
        and lists available weapons and armor in the player's inventory.
        """
        separator = self.SEPARATOR
        thin_sep = self.THIN_SEPARATOR

        # Resolve currently equipped weapon info
        equipped_weapon_text = "None"
        if player.equipped_weapon and player.equipped_weapon in ITEM_DATABASE:
            item_data = ITEM_DATABASE[player.equipped_weapon]
            bonus = item_data.get("damage_bonus", 0)
            equipped_weapon_text = f"{item_data['name']} (+{bonus} ATK)"

        # Resolve currently equipped armor info
        equipped_armor_text = "None"
        if player.equipped_armor and player.equipped_armor in ITEM_DATABASE:
            item_data = ITEM_DATABASE[player.equipped_armor]
            bonus = item_data.get("defense_bonus", 0)
            equipped_armor_text = f"{item_data['name']} (+{bonus} DEF)"

        # Collect available weapons and armor from inventory
        available_weapons = []
        available_armor = []

        for item_key, quantity in player.inventory.items.items():
            if item_key not in ITEM_DATABASE:
                continue
            item_data = ITEM_DATABASE[item_key]
            if item_data["item_type"] == "arma":
                bonus = item_data.get("damage_bonus", 0)
                available_weapons.append(
                    f"  {item_data['name']} x{quantity} (+{bonus} ATK)"
                )
            elif item_data["item_type"] == "armadura":
                bonus = item_data.get("defense_bonus", 0)
                available_armor.append(
                    f"  {item_data['name']} x{quantity} (+{bonus} DEF)"
                )

        lines = [
            separator,
            "Equipment",
            separator,
            f"  Weapon: {equipped_weapon_text}",
            f"  Armor:  {equipped_armor_text}",
            thin_sep,
            "Available Weapons:",
        ]

        if available_weapons:
            lines.extend(available_weapons)
        else:
            lines.append("  (none)")

        lines.append("")
        lines.append("Available Armor:")

        if available_armor:
            lines.extend(available_armor)
        else:
            lines.append("  (none)")

        lines.append(separator)

        output = "\n".join(lines)
        print(output)
        return output

    def render_inventory(self, player):
        """Display navigable inventory item list.

        Shows items with format: [index] item_name x quantity [type_indicator]
        Type indicators: W=Weapon(arma), A=Armor(armadura), C=Consumable(consumivel), M=Material(material)
        Shows 'Inventário vazio' if no items.
        Shows navigation hint at bottom.
        """
        TYPE_INDICATORS = {
            "arma": "W",
            "armadura": "A",
            "consumivel": "C",
            "material": "M",
        }

        lines = [
            self.SEPARATOR,
            "         Inventário",
            self.SEPARATOR,
        ]

        if not player.inventory.items:
            lines.append("  Inventário vazio")
        else:
            for idx, (item_key, quantity) in enumerate(player.inventory.items.items()):
                item_data = ITEM_DATABASE.get(item_key, {})
                item_name = item_data.get("name", item_key)
                item_type = item_data.get("item_type", "")
                type_indicator = TYPE_INDICATORS.get(item_type, "?")
                lines.append(f"  [{idx}] {item_name} x{quantity} [{type_indicator}]")

        lines.append(self.THIN_SEPARATOR)
        lines.append("  [↑↓] Navegar  [Enter] Selecionar  [Q] Voltar")

        output = "\n".join(lines)
        print(output)
        return output

    def render_combat_state(self, player, monster, last_5_actions=None):
        """Display combat state with player/monster stats, actions, and combat log.

        Shows: Player HP and attack/defense, Monster name and HP,
        available actions ([A] Attack, [D] Defend, [I] Use Item),
        and the last 5 combat actions as a log.
        """
        if last_5_actions is None:
            last_5_actions = []

        width = 40
        separator = self.SEPARATOR
        thin_sep = self.THIN_SEPARATOR

        lines = [
            separator,
            f"{'[ COMBAT ]':^{width}}",
            separator,
            "",
            f"  {player.name:<20} vs  {monster.name}",
            thin_sep,
            f"  HP: {player.hp}/{player.max_hp}          HP: {monster.hp}/{monster.max_hp}",
            f"  ATK: {player.attack}  DEF: {player.defense}",
            thin_sep,
            "",
            "  Actions:",
            "    [A] Attack",
            "    [D] Defend",
            "    [I] Use Item",
            "",
            thin_sep,
            "  Combat Log:",
        ]

        if last_5_actions:
            for action in last_5_actions:
                lines.append(f"    > {action}")
        else:
            lines.append("    (no actions yet)")

        lines.append(separator)

        output = "\n".join(lines)
        print(output)
        return output

    def render_crafting_menu(self, player):
        """Display crafting menu with available and locked recipes.

        Shows recipes with level_required <= player.level as available
        (with material availability indicator ✓/✗), and recipes above
        player level as locked with the required level.
        """
        lines = [
            self.SEPARATOR,
            "           Crafting",
            self.SEPARATOR,
        ]

        for recipe_key, recipe in RECIPE_DATABASE.items():
            name = recipe["name"]
            level_required = recipe["level_required"]
            required_materials = recipe["required_materials"]

            if level_required <= player.level:
                # Check if player has all required materials
                has_all = all(
                    player.inventory.has_item(mat_key, qty)
                    for mat_key, qty in required_materials.items()
                )
                status = "\u2713" if has_all else "\u2717"
                materials_str = ", ".join(
                    f"{mat_key} x{qty}"
                    for mat_key, qty in required_materials.items()
                )
                lines.append(f"  [{status}] {name}")
                lines.append(f"      Materials: {materials_str}")
            else:
                lines.append(f"  [LOCKED] {name} (Level {level_required})")

        lines.append(self.SEPARATOR)

        output = "\n".join(lines)
        print(output)
        return output

    # ── Input Handler Methods ──

    def get_player_action(self, valid_actions, prompt=""):
        """Get player input, validate against valid_actions, re-prompt on invalid.

        All input is converted to lowercase for case-insensitive matching.
        Shows context-sensitive help on invalid input.

        Args:
            valid_actions: list of valid action strings (lowercase).
            prompt: optional prompt string to display.

        Returns:
            A valid action string (lowercase).
        """
        display_prompt = prompt if prompt else "> "
        while True:
            raw = input(display_prompt).strip().lower()
            if raw in valid_actions:
                return raw
            # Context-sensitive help: show valid options
            options_display = ", ".join(valid_actions)
            print(f"Invalid choice. Valid options: {options_display}")

    def get_menu_choice(self, valid_choices):
        """Get a menu choice from the player, re-prompting on invalid input.

        Args:
            valid_choices: list of valid choice strings (lowercase).

        Returns:
            A valid choice string (lowercase).
        """
        while True:
            raw = input("Choose an option: ").strip().lower()
            if raw in valid_choices:
                return raw
            options_display = ", ".join(valid_choices)
            print(f"Invalid choice. Valid options: {options_display}")

    def get_combat_action(self):
        """Get a combat action from the player.

        Valid combat actions: 'a' (Attack), 'd' (Defend), 'i' (Item), 's' (Skill/Ability).
        Shows combat-specific help on invalid input.

        Returns:
            A valid combat action string: 'a', 'd', 'i', or 's'.
        """
        valid = ["a", "d", "i", "s"]
        while True:
            raw = input("Action: ").strip().lower()
            if raw in valid:
                return raw
            print("Invalid choice. Valid options: [A]ttack, [D]efend, [I]tem, [S]kill")

    def render_welcome_back(self, player, filename):
        """Display welcome-back message when loading a saved game.

        Parses the timestamp from the save filename format
        "savegame_YYYYMMDD_HHMMSS.json" and displays a welcome message.

        Args:
            player: Player instance that was loaded.
            filename: Save filename (e.g., "savegame_20240115_123045.json").

        Returns:
            The formatted output string.
        """
        # Parse timestamp from filename: savegame_YYYYMMDD_HHMMSS.json
        timestamp_str = filename.replace("savegame_", "").replace(".json", "")
        timestamp = datetime.strptime(timestamp_str, "%Y%m%d_%H%M%S")
        formatted_date = timestamp.strftime("%Y-%m-%d %H:%M:%S")

        output = f"Welcome back, {player.name}! Level {player.level} - Last played {formatted_date}"
        print(output)
        return output
