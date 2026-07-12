"""Terminal-Hero: Main game loop and GameEngine orchestration."""
from engine import (
    CombatEngine,
    CraftingSystem,
    EncounterGenerator,
    EquipmentSystem,
    GameState,
    GameStateManager,
    InventorySystem,
    LootGenerator,
    ProgressionSystem,
    create_character,
)
from storage import SaveSystem
from tui import TUI


class GameEngine:
    """Orchestrates all game sub-systems and manages the main game loop.

    Initializes and coordinates: CombatEngine, ProgressionSystem,
    EquipmentSystem, InventorySystem, CraftingSystem, EncounterGenerator,
    LootGenerator, GameStateManager, SaveSystem, and TUI.
    """

    def __init__(self):
        # Sub-systems
        self.combat_engine = CombatEngine()
        self.progression = ProgressionSystem()
        self.equipment = EquipmentSystem()
        self.inventory_system = InventorySystem()
        self.crafting = CraftingSystem()
        self.encounter_generator = EncounterGenerator()
        self.loot_generator = LootGenerator()
        self.state_manager = GameStateManager()
        self.save_system = SaveSystem()
        self.tui = TUI()

        # Game state
        self.player = None
        self.current_monster = None
        self.combat_log = []
        self.running = False

    # ── Public Save/Load Methods ──

    def handle_save_game(self, player):
        """Save the current game state.

        Calls SaveSystem.save_game(player) to serialize and persist
        the player's current state to a JSON file.

        Args:
            player: Player instance to save.

        Returns:
            str: The filename of the saved game file.
        """
        filename = self.save_system.save_game(player)
        print(f"Game saved: {filename}")
        return filename

    def handle_load_game(self):
        """Load a saved game from available save files.

        Displays list of available saves, prompts user to select one,
        validates the loaded data, and returns the restored Player instance.

        Returns:
            Player instance if a save was successfully loaded, None otherwise.
        """
        saves = self.save_system.list_saves()

        if not saves:
            print("No save files found.")
            return None

        # Display available saves
        print("Available saves:")
        for idx, (filename, level, name, timestamp) in enumerate(saves):
            formatted_date = timestamp.strftime("%Y-%m-%d %H:%M:%S")
            print(f"  [{idx}] {name} (Level {level}) - {formatted_date}")

        # Get user selection
        choice = input("Select save number (or 'b' to go back): ").strip().lower()

        if choice == "b":
            return None

        try:
            index = int(choice)
        except ValueError:
            print("Invalid selection.")
            return None

        if index < 0 or index >= len(saves):
            print("Invalid selection.")
            return None

        # Load the selected save
        filename = saves[index][0]
        player = self.save_system.load_game(filename)

        # Validate loaded data by reading raw JSON
        import json
        import os

        filepath = os.path.join(self.save_system.SAVE_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        self.save_system.validate_save_data(raw_data)

        # Display welcome back message
        self.tui.render_welcome_back(player, filename)

        return player

    # ── Main Loop ──

    def main_loop(self):
        """Run the main game loop.

        While running: renders current state, gets input, processes action,
        and transitions state as needed.
        """
        self.running = True
        while self.running:
            state = self.state_manager.current_state

            if state == GameState.StartMenu:
                self._handle_start_menu()
            elif state == GameState.NewGame:
                self._handle_new_game()
            elif state == GameState.LoadGame:
                self._handle_load_game()
            elif state == GameState.Exploration:
                self._handle_exploration()
            elif state == GameState.Combat:
                self._handle_combat()
            elif state == GameState.Inventory:
                self._handle_inventory()
            elif state == GameState.Equipment:
                self._handle_equipment()
            elif state == GameState.Crafting:
                self._handle_crafting()
            elif state == GameState.Victory:
                self._handle_victory()
            elif state == GameState.GameOver:
                self._handle_game_over()

    # ── State Handlers ──

    def _handle_start_menu(self):
        """Render main menu and process menu choice."""
        self.tui.render_main_menu()
        choice = self.tui.get_menu_choice(["n", "l", "q"])

        if choice == "n":
            self.state_manager.transition_to(GameState.NewGame)
        elif choice == "l":
            self.state_manager.transition_to(GameState.LoadGame)
        elif choice == "q":
            self.running = False

    def _handle_new_game(self):
        """Prompt for character name and create a new player."""
        self.tui.clear_screen()
        print("=" * 40)
        print("       Create Your Character")
        print("=" * 40)
        print()

        name = input("Enter your character's name: ").strip()
        if not name:
            name = "Hero"

        self.player = create_character(name)
        print(f"\nWelcome, {self.player.name}! Your adventure begins...")
        input("\nPress Enter to continue...")
        self.state_manager.transition_to(GameState.Exploration)

    def _handle_load_game(self):
        """Display save files and load the selected one (state machine handler)."""
        self.tui.clear_screen()
        saves = self.save_system.list_saves()

        if not saves:
            print("No save files found.")
            input("\nPress Enter to return to menu...")
            self.state_manager.current_state = GameState.StartMenu
            return

        print("=" * 40)
        print("         Load Game")
        print("=" * 40)
        print()

        for idx, (filename, level, name, timestamp) in enumerate(saves):
            formatted_date = timestamp.strftime("%Y-%m-%d %H:%M")
            print(f"  [{idx + 1}] {name} (Level {level}) - {formatted_date}")
        print(f"  [Q] Back to menu")
        print()

        while True:
            choice = input("Select a save: ").strip().lower()
            if choice == "q":
                self.state_manager.current_state = GameState.StartMenu
                return
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(saves):
                    filename = saves[idx][0]
                    self.player = self.save_system.load_game(filename)
                    self.tui.render_welcome_back(self.player, filename)
                    input("\nPress Enter to continue...")
                    self.state_manager.transition_to(GameState.Exploration)
                    return
            except (ValueError, IndexError):
                pass
            print("Invalid choice. Try again.")

    def _handle_exploration(self):
        """Show exploration options and process player choice."""
        self.tui.clear_screen()
        self.tui.render_player_status(self.player)
        print()
        print("  [E] Encounter (Fight a monster)")
        print("  [I] Inventory")
        print("  [Q] Equipment")
        print("  [C] Crafting")
        print("  [S] Save Game")
        print("  [L] Load Game")
        print("  [X] Quit")
        print()

        choice = self.tui.get_player_action(
            ["e", "i", "q", "c", "s", "l", "x"],
            prompt="What do you want to do? "
        )

        if choice == "e":
            self.current_monster = self.encounter_generator.generate_monster(
                self.player.level
            )
            self.combat_log = []
            self.state_manager.transition_to(GameState.Combat)
        elif choice == "i":
            self.state_manager.transition_to(GameState.Inventory)
        elif choice == "q":
            self.state_manager.transition_to(GameState.Equipment)
        elif choice == "c":
            self.state_manager.transition_to(GameState.Crafting)
        elif choice == "s":
            filename = self.handle_save_game(self.player)
            input("Press Enter to continue...")
        elif choice == "l":
            loaded_player = self.handle_load_game()
            if loaded_player:
                self.player = loaded_player
            input("Press Enter to continue...")
        elif choice == "x":
            self._quit_with_save_prompt()

    def _handle_combat(self):
        """Run a single combat turn: render state, get action, execute turn."""
        self.tui.clear_screen()
        last_5 = self.combat_log[-5:] if self.combat_log else []
        self.tui.render_combat_state(self.player, self.current_monster, last_5)

        action = self.tui.get_combat_action()

        if action == "a":
            result = self.combat_engine.execute_combat_turn(
                self.player, "attack", self.current_monster
            )
            player_dmg = result.get("player_damage", 0)
            self.combat_log.append(
                f"{self.player.name} attacks for {player_dmg} damage!"
            )
        elif action == "d":
            result = self.combat_engine.execute_combat_turn(
                self.player, "defend", self.current_monster
            )
            self.combat_log.append(f"{self.player.name} defends!")
        elif action == "i":
            # Use consumable item from inventory
            self._combat_use_item()
            return
        elif action == "s":
            # Use ability
            self._combat_use_ability()
            return

        # Process monster turn result
        if result["result"] == "victory":
            self.state_manager.transition_to(GameState.Victory)
            return
        elif result["result"] == "game_over":
            self.state_manager.transition_to(GameState.GameOver)
            return

        # Monster attacked back
        monster_dmg = result.get("monster_damage", 0)
        if monster_dmg:
            self.combat_log.append(
                f"{self.current_monster.name} attacks for {monster_dmg} damage!"
            )

    def _combat_use_item(self):
        """Handle using a consumable item during combat."""
        from models import ITEM_DATABASE

        consumables = [
            (key, qty)
            for key, qty in self.player.inventory.items.items()
            if ITEM_DATABASE.get(key, {}).get("item_type") == "consumivel"
        ]

        if not consumables:
            self.combat_log.append("No consumable items available!")
            return

        print("\nConsumable items:")
        for idx, (key, qty) in enumerate(consumables):
            name = ITEM_DATABASE[key]["name"]
            print(f"  [{idx + 1}] {name} x{qty}")
        print("  [Q] Cancel")

        while True:
            choice = input("Choose item: ").strip().lower()
            if choice == "q":
                return
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(consumables):
                    item_key = consumables[idx][0]
                    result = self.combat_engine.execute_combat_turn(
                        self.player, f"use_item:{item_key}", self.current_monster
                    )
                    item_name = ITEM_DATABASE[item_key]["name"]
                    self.combat_log.append(f"{self.player.name} used {item_name}!")

                    if result["result"] == "victory":
                        self.state_manager.transition_to(GameState.Victory)
                    elif result["result"] == "game_over":
                        self.state_manager.transition_to(GameState.GameOver)
                    else:
                        monster_dmg = result.get("monster_damage", 0)
                        if monster_dmg:
                            self.combat_log.append(
                                f"{self.current_monster.name} attacks for {monster_dmg} damage!"
                            )
                    return
            except (ValueError, IndexError):
                pass
            print("Invalid choice.")

    def _combat_use_ability(self):
        """Handle using an ability during combat."""
        if not self.player.abilities:
            self.combat_log.append("No abilities available!")
            return

        print("\nAbilities:")
        usable = []
        for idx, ability in enumerate(self.player.abilities):
            can_use = ability.can_use(self.player)
            status = "" if can_use else " [NOT ENOUGH EXP]"
            print(f"  [{idx + 1}] {ability.name} (Cost: {ability.exp_cost} EXP){status}")
            usable.append((ability, can_use))
        print("  [Q] Cancel")

        while True:
            choice = input("Choose ability: ").strip().lower()
            if choice == "q":
                return
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(usable):
                    ability, can_use = usable[idx]
                    if not can_use:
                        print("Not enough EXP!")
                        continue
                    result = self.progression.use_ability(
                        self.player, ability.ability_key, self.current_monster
                    )
                    if result["type"] == "offensive":
                        self.combat_log.append(
                            f"{self.player.name} uses {result['ability']}! "
                            f"{result['damage']} damage!"
                        )
                    else:
                        self.combat_log.append(
                            f"{self.player.name} uses {result['ability']}! "
                            f"Defense boosted!"
                        )

                    # Check if monster died from ability
                    if not self.current_monster.is_alive():
                        self.player.gain_exp(self.current_monster.exp_reward)
                        self.player.gain_gold(self.current_monster.gold_reward)
                        self.state_manager.transition_to(GameState.Victory)
                    else:
                        # Monster attacks back
                        monster_dmg = self.combat_engine.monster_attack(
                            self.current_monster, self.player
                        )
                        self.combat_log.append(
                            f"{self.current_monster.name} attacks for {monster_dmg} damage!"
                        )
                        if self.player.hp <= 0:
                            self.state_manager.transition_to(GameState.GameOver)
                    return
            except (ValueError, IndexError):
                pass
            print("Invalid choice.")

    def _handle_inventory(self):
        """Display inventory and allow item interaction."""
        self.tui.clear_screen()
        self.tui.render_inventory(self.player)
        print()
        input("Press Enter to return...")
        self.state_manager.transition_to(GameState.Exploration)

    def _handle_equipment(self):
        """Display equipment menu and handle equip/unequip."""
        self.tui.clear_screen()
        self.tui.render_equipment_menu(self.player)
        print()
        print("  [W] Equip Weapon")
        print("  [A] Equip Armor")
        print("  [R] Unequip Weapon")
        print("  [T] Unequip Armor")
        print("  [B] Back")
        print()

        choice = self.tui.get_player_action(
            ["w", "a", "r", "t", "b"],
            prompt="Choose action: "
        )

        if choice == "b":
            self.state_manager.transition_to(GameState.Exploration)
        elif choice == "r":
            self.player.unequip_weapon()
            print("Weapon unequipped.")
            input("Press Enter to continue...")
            self.state_manager.transition_to(GameState.Exploration)
        elif choice == "t":
            self.player.unequip_armor()
            print("Armor unequipped.")
            input("Press Enter to continue...")
            self.state_manager.transition_to(GameState.Exploration)
        elif choice == "w":
            self._equip_weapon_menu()
        elif choice == "a":
            self._equip_armor_menu()

    def _equip_weapon_menu(self):
        """Show available weapons and equip chosen one."""
        from models import ITEM_DATABASE

        weapons = [
            (key, qty)
            for key, qty in self.player.inventory.items.items()
            if ITEM_DATABASE.get(key, {}).get("item_type") == "arma"
        ]

        if not weapons:
            print("No weapons in inventory.")
            input("Press Enter to continue...")
            self.state_manager.transition_to(GameState.Exploration)
            return

        print("\nWeapons:")
        for idx, (key, qty) in enumerate(weapons):
            item = ITEM_DATABASE[key]
            print(f"  [{idx + 1}] {item['name']} (+{item.get('damage_bonus', 0)} ATK) x{qty}")

        while True:
            choice = input("Choose weapon (or Q to cancel): ").strip().lower()
            if choice == "q":
                self.state_manager.transition_to(GameState.Exploration)
                return
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(weapons):
                    self.player.equip_weapon(weapons[idx][0])
                    print(f"Equipped {ITEM_DATABASE[weapons[idx][0]]['name']}!")
                    input("Press Enter to continue...")
                    self.state_manager.transition_to(GameState.Exploration)
                    return
            except (ValueError, IndexError):
                pass
            print("Invalid choice.")

    def _equip_armor_menu(self):
        """Show available armor and equip chosen one."""
        from models import ITEM_DATABASE

        armors = [
            (key, qty)
            for key, qty in self.player.inventory.items.items()
            if ITEM_DATABASE.get(key, {}).get("item_type") == "armadura"
        ]

        if not armors:
            print("No armor in inventory.")
            input("Press Enter to continue...")
            self.state_manager.transition_to(GameState.Exploration)
            return

        print("\nArmor:")
        for idx, (key, qty) in enumerate(armors):
            item = ITEM_DATABASE[key]
            print(f"  [{idx + 1}] {item['name']} (+{item.get('defense_bonus', 0)} DEF) x{qty}")

        while True:
            choice = input("Choose armor (or Q to cancel): ").strip().lower()
            if choice == "q":
                self.state_manager.transition_to(GameState.Exploration)
                return
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(armors):
                    self.player.equip_armor(armors[idx][0])
                    print(f"Equipped {ITEM_DATABASE[armors[idx][0]]['name']}!")
                    input("Press Enter to continue...")
                    self.state_manager.transition_to(GameState.Exploration)
                    return
            except (ValueError, IndexError):
                pass
            print("Invalid choice.")

    def _handle_crafting(self):
        """Display crafting menu and handle craft execution."""
        from models import RECIPE_DATABASE

        self.tui.clear_screen()
        self.tui.render_crafting_menu(self.player)
        print()

        available = self.crafting.get_available_recipes(self.player)
        if not available:
            print("No recipes available at your level.")
            input("Press Enter to return...")
            self.state_manager.transition_to(GameState.Exploration)
            return

        recipe_list = list(available.items())
        for idx, (key, recipe) in enumerate(recipe_list):
            can = self.crafting.can_craft(self.player, key)
            status = "[OK]" if can else "[MISSING MATERIALS]"
            print(f"  [{idx + 1}] {recipe['name']} {status}")
        print("  [B] Back")
        print()

        while True:
            choice = input("Choose recipe (or B to go back): ").strip().lower()
            if choice == "b":
                self.state_manager.transition_to(GameState.Exploration)
                return
            try:
                idx = int(choice) - 1
                if 0 <= idx < len(recipe_list):
                    recipe_key = recipe_list[idx][0]
                    if self.crafting.can_craft(self.player, recipe_key):
                        self.crafting.craft(self.player, recipe_key)
                        input("\nPress Enter to continue...")
                    else:
                        print("You don't have the required materials!")
                        input("Press Enter to continue...")
                    self.state_manager.transition_to(GameState.Exploration)
                    return
            except (ValueError, IndexError):
                pass
            print("Invalid choice.")

    def _handle_victory(self):
        """Display victory message with rewards and generate loot (game loop handler)."""
        # Generate loot
        loot = self.loot_generator.generate_loot(self.player.level)
        if loot:
            self.loot_generator.award_loot(self.player, loot)

        # Delegate to public method
        self.handle_victory(
            self.current_monster.name,
            loot,
            self.current_monster.exp_reward,
            self.current_monster.gold_reward,
        )

    def handle_victory(self, monster_name, loot_items, exp_gained, gold_gained):
        """Handle the Victory state after defeating a monster.

        Displays victory message, rewards, and loot items gained.
        Waits for player key press, then transitions back to Exploration.

        Args:
            monster_name: Name of the defeated monster.
            loot_items: List of item_keys gained as loot.
            exp_gained: Amount of experience gained.
            gold_gained: Amount of gold gained.
        """
        from models import ITEM_DATABASE

        self.tui.clear_screen()
        print(f"You defeated {monster_name}!")
        print(f"EXP: +{exp_gained}, Gold: +{gold_gained}")

        if loot_items:
            print("Loot gained:")
            for item_key in loot_items:
                item_data = ITEM_DATABASE.get(item_key, {})
                item_name = item_data.get("name", item_key)
                print(f"  - {item_name}")

        input("Press Enter to continue...")
        self.state_manager.transition_to(GameState.Exploration)

    def _handle_game_over(self):
        """Display game over and process choice (game loop handler)."""
        self.handle_game_over()

    def handle_game_over(self):
        """Handle the GameOver state when the player is defeated.

        Displays defeat message with final player stats.
        Shows options: [N] New Game, [L] Load Game, [Q] Quit.
        Gets player choice and transitions accordingly.
        """
        import sys

        self.tui.clear_screen()
        print("You were defeated!")

        if self.player:
            print(f"Name: {self.player.name}")
            print(f"Level: {self.player.level}")
            print(f"Gold: {self.player.gold}")

        print()
        print("[N] New Game")
        print("[L] Load Game")
        print("[Q] Quit")

        choice = input("Choose an option: ").strip().lower()

        if choice == "n":
            self.state_manager.transition_to(GameState.StartMenu)
        elif choice == "l":
            self.state_manager.transition_to(GameState.StartMenu)
        elif choice == "q":
            sys.exit(0)
        else:
            # Default to StartMenu on invalid input
            self.state_manager.transition_to(GameState.StartMenu)

    def _quit_with_save_prompt(self):
        """Prompt player to save before quitting."""
        print("\nWould you like to save before quitting?")
        choice = self.tui.get_player_action(["y", "n"], prompt="[Y]es / [N]o: ")
        if choice == "y" and self.player:
            filename = self.save_system.save_game(self.player)
            print(f"Game saved: {filename}")
        self.running = False


if __name__ == "__main__":
    engine = GameEngine()
    try:
        engine.main_loop()
    except KeyboardInterrupt:
        print("\n\nGame interrupted. Goodbye!")
