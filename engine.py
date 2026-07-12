import random

from models import PLAYER_STARTING_STATS, Player


def create_character(name):
    """Create a new Player with PLAYER_STARTING_STATS.

    Args:
        name: Character name string.

    Returns:
        A new Player instance initialized with starting stats.
    """
    return Player(
        name=name,
        hp=PLAYER_STARTING_STATS["hp"],
        attack=PLAYER_STARTING_STATS["attack"],
        defense=PLAYER_STARTING_STATS["defense"],
        level=PLAYER_STARTING_STATS["level"],
    )


class InventorySystem:
    """Manages inventory operations with validation."""

    def drop_item(self, player, item_key, quantity=1):
        """Drop/discard items from player's inventory.

        Args:
            player: Player instance
            item_key: Key of item to drop
            quantity: Number to drop (default 1)

        Returns:
            True if successful

        Raises:
            ValueError: if insufficient quantity or item not in inventory
        """
        current_qty = player.inventory.get_quantity(item_key)
        if current_qty < quantity:
            raise ValueError(
                f"Cannot drop {quantity} of '{item_key}': only have {current_qty}"
            )
        player.inventory.remove_item(item_key, quantity)
        return True


class EquipmentSystem:
    """Manages equipment operations with validation."""

    def equip_weapon(self, player, item_key):
        """Equip a weapon - delegates to Player.equip_weapon()."""
        return player.equip_weapon(item_key)

    def unequip_weapon(self, player):
        """Unequip current weapon - delegates to Player.unequip_weapon()."""
        return player.unequip_weapon()

    def equip_armor(self, player, item_key):
        """Equip armor - delegates to Player.equip_armor()."""
        return player.equip_armor(item_key)

    def unequip_armor(self, player):
        """Unequip current armor - delegates to Player.unequip_armor()."""
        return player.unequip_armor()


class CombatEngine:
    """Manages turn-based combat between player and monsters."""

    def __init__(self):
        self._defending = False  # Track if player is defending
        self._original_defense = None  # Store original defense for reset

    def calculate_damage(self, attacker_attack, defender_defense):
        """Calculate damage using formula: (attack - defense) * random(0.8, 1.2).

        Applies minimum damage floor of 1 and maximum cap of 150% of attacker.attack.
        """
        base_damage = attacker_attack - defender_defense
        variance = random.uniform(0.8, 1.2)
        raw_damage = base_damage * variance

        # Apply floor: minimum damage is 1
        if raw_damage < 1:
            raw_damage = 1

        # Apply ceiling: max damage is 150% of attacker's attack
        max_damage_cap = attacker_attack * 1.5
        if raw_damage > max_damage_cap:
            raw_damage = max_damage_cap

        return int(raw_damage)

    def player_attack(self, player, monster):
        """Execute player attack on monster.

        Calculates damage using player.attack and monster.defense,
        then applies damage to monster.hp.

        Returns the damage dealt.
        """
        damage = self.calculate_damage(player.attack, monster.defense)
        monster.hp -= damage
        return damage

    def player_defend(self, player):
        """Increase player defense by 50% for one turn.

        Stores original defense to restore on next turn via reset_defend().

        Returns the new defense value.
        """
        self._defending = True
        self._original_defense = player.defense
        player.defense = int(player.defense * 1.5)
        return player.defense

    def reset_defend(self, player):
        """Reset defense after player's next turn.

        Restores original defense value if player was defending.
        """
        if self._defending:
            player.defense = self._original_defense
            self._defending = False
            self._original_defense = None

    def player_use_consumable(self, player, item_key):
        """Use a consumable item from inventory.

        Delegates to Player.use_consumable() which handles validation,
        inventory removal, and effect application.
        """
        player.use_consumable(item_key)

    def monster_attack(self, monster, player):
        """Execute monster attack on player using same damage formula.

        Monster always uses Attack action (no defend/consumable logic for MVP).

        Returns the damage dealt.
        """
        damage = self.calculate_damage(monster.attack, player.defense)
        player.hp -= damage
        return damage

    def execute_combat_turn(self, player, player_action, monster):
        """Process a full combat turn: player action then monster action.

        Args:
            player: Player instance
            player_action: Action string - "attack", "defend", or "use_item:<item_key>"
            monster: Monster instance

        Returns:
            dict with keys:
                - "result": "victory", "game_over", or "continue"
                - "player_damage": damage dealt by player (if attack)
                - "monster_damage": damage dealt by monster (if monster attacks)
                - "exp": exp reward (only on victory)
                - "gold": gold reward (only on victory)
        """
        # Reset defend from previous turn
        self.reset_defend(player)

        player_damage = 0

        # Execute player action
        if player_action == "attack":
            player_damage = self.player_attack(player, monster)
        elif player_action == "defend":
            self.player_defend(player)
        elif player_action.startswith("use_item:"):
            item_key = player_action.split(":", 1)[1]
            self.player_use_consumable(player, item_key)

        # Check if monster is defeated
        if monster.hp <= 0:
            player.gain_exp(monster.exp_reward)
            player.gain_gold(monster.gold_reward)
            return {
                "result": "victory",
                "exp": monster.exp_reward,
                "gold": monster.gold_reward,
                "player_damage": player_damage,
            }

        # Monster turn
        monster_damage = self.monster_attack(monster, player)

        # Check if player is defeated
        if player.hp <= 0:
            return {
                "result": "game_over",
                "monster_damage": monster_damage,
            }

        # Combat continues
        return {
            "result": "continue",
            "player_damage": player_damage,
            "monster_damage": monster_damage,
        }


class CraftingSystem:
    """Manages crafting recipes, availability, and execution."""

    def get_available_recipes(self, player):
        """Return recipes with level_required <= player.level."""
        from models import RECIPE_DATABASE

        available = {}
        for recipe_key, recipe in RECIPE_DATABASE.items():
            if recipe["level_required"] <= player.level:
                available[recipe_key] = recipe
        return available

    def can_craft(self, player, recipe_key):
        """Check if player has all required materials in inventory."""
        from models import RECIPE_DATABASE

        if recipe_key not in RECIPE_DATABASE:
            return False
        recipe = RECIPE_DATABASE[recipe_key]
        for material_key, qty_needed in recipe["required_materials"].items():
            if not player.inventory.has_item(material_key, qty_needed):
                return False
        return True

    def is_recipe_locked(self, player, recipe_key):
        """Return True if player's level is below recipe's level_required."""
        from models import RECIPE_DATABASE

        if recipe_key not in RECIPE_DATABASE:
            return True
        return RECIPE_DATABASE[recipe_key]["level_required"] > player.level

    def craft(self, player, recipe_key):
        """Execute crafting: remove materials and add crafted item.

        Args:
            player: Player instance
            recipe_key: Key from RECIPE_DATABASE

        Returns:
            str: Confirmation message with crafted item details

        Raises:
            ValueError: if recipe doesn't exist, player level too low,
                        or insufficient materials
        """
        from models import RECIPE_DATABASE, ITEM_DATABASE

        if recipe_key not in RECIPE_DATABASE:
            raise ValueError(f"Recipe '{recipe_key}' does not exist!")

        recipe = RECIPE_DATABASE[recipe_key]

        # Check level requirement
        if recipe["level_required"] > player.level:
            raise ValueError(
                f"Level {recipe['level_required']} required to craft '{recipe['name']}'!"
            )

        # Check all materials first (atomic check)
        for material_key, qty_needed in recipe["required_materials"].items():
            if not player.inventory.has_item(material_key, qty_needed):
                current = player.inventory.get_quantity(material_key)
                raise ValueError(
                    f"Insufficient materials: need {qty_needed}x {material_key}, have {current}"
                )

        # Remove all materials
        for material_key, qty_needed in recipe["required_materials"].items():
            player.inventory.remove_item(material_key, qty_needed)

        # Add crafted item
        crafted_key = recipe["crafted_item"]
        player.inventory.add_item(crafted_key)

        # Build confirmation message
        item_data = ITEM_DATABASE[crafted_key]
        bonuses = ""
        if "damage_bonus" in item_data:
            bonuses = f" (+{item_data['damage_bonus']} ATK)"
        elif "defense_bonus" in item_data:
            bonuses = f" (+{item_data['defense_bonus']} DEF)"
        elif "effect_value" in item_data:
            bonuses = f" (Efeito: {item_data['effect_value']})"

        msg = f"Crafted: {item_data['name']}{bonuses}"
        print(msg)
        return msg


class LootGenerator:
    """Generates random loot drops from defeated monsters."""

    def generate_loot(self, player_level, monster_difficulty="common"):
        """Generate 0-3 random item drops based on player level and monster tier.

        Args:
            player_level: Current player level
            monster_difficulty: "common", "uncommon", or "rare"

        Returns:
            list of item_keys generated as loot
        """
        from models import ITEM_DATABASE

        # Determine number of items (0-3)
        if monster_difficulty == "rare":
            num_items = random.randint(1, 3)
        elif monster_difficulty == "uncommon":
            num_items = random.randint(0, 3)
        else:
            num_items = random.randint(0, 2)

        # Filter items available at player level + 3
        # For MVP, all items are available (no level_required on items)
        # We use all items from ITEM_DATABASE
        available_items = list(ITEM_DATABASE.keys())

        # Weight by monster tier - higher tier = more chance of equipment
        equipment_items = [
            k
            for k, v in ITEM_DATABASE.items()
            if v["item_type"] in ("arma", "armadura")
        ]
        consumable_items = [
            k for k, v in ITEM_DATABASE.items() if v["item_type"] == "consumivel"
        ]
        material_items = [
            k for k, v in ITEM_DATABASE.items() if v["item_type"] == "material"
        ]

        loot = []
        for _ in range(num_items):
            if monster_difficulty == "rare":
                # Higher chance of equipment from rare monsters
                pool = equipment_items * 3 + consumable_items * 2 + material_items
            elif monster_difficulty == "uncommon":
                pool = equipment_items * 2 + consumable_items * 2 + material_items * 2
            else:
                pool = equipment_items + consumable_items * 2 + material_items * 3

            item_key = random.choice(pool)
            loot.append(item_key)

        return loot

    def award_loot(self, player, loot_items):
        """Add loot items to player inventory.

        Args:
            player: Player instance
            loot_items: list of item_keys to add
        """
        for item_key in loot_items:
            try:
                player.inventory.add_item(item_key)
            except ValueError:
                # Inventory full - skip this item
                pass


class ProgressionSystem:
    """Manages experience accumulation and level-up progression."""

    def award_experience(self, player, exp_amount):
        """Award experience to player and trigger level-up if threshold reached.

        Uses a while loop to handle cases where exp gained exceeds multiple
        level thresholds in a single award.

        Args:
            player: Player instance to award experience to.
            exp_amount: Amount of experience to award.

        Returns:
            True if player leveled up at least once, False otherwise.
        """
        player.exp += exp_amount
        leveled_up = False
        while player.exp >= player.exp_to_next_level:
            player.level_up()
            self.unlock_abilities_for_level(player, player.level)
            self.unlock_recipes_for_level(player, player.level)
            leveled_up = True
        return leveled_up

    def unlock_abilities_for_level(self, player, new_level):
        """Unlock abilities that require the given level.

        Checks ABILITY_DATABASE for abilities whose level_required matches
        new_level. If the player doesn't already have the ability, it is
        created and appended to player.abilities.

        Args:
            player: Player instance to unlock abilities for.
            new_level: The level just reached by the player.

        Returns:
            List of newly unlocked Ability instances.
        """
        from models import ABILITY_DATABASE, Ability

        unlocked = []
        for ability_key, ability_data in ABILITY_DATABASE.items():
            if ability_data["level_required"] == new_level:
                # Check if not already unlocked
                already_has = any(a.ability_key == ability_key for a in player.abilities)
                if not already_has:
                    ability = Ability(ability_key)
                    player.abilities.append(ability)
                    unlocked.append(ability)
                    print(f"\U0001f513 New ability unlocked: {ability.name}!")
        return unlocked

    def unlock_recipes_for_level(self, player, new_level):
        """Unlock recipes that require the given level.

        Checks RECIPE_DATABASE for recipes whose level_required matches
        new_level. If the player doesn't already have the recipe learned,
        it is added to player.learned_recipes.

        Args:
            player: Player instance to unlock recipes for.
            new_level: The level just reached by the player.

        Returns:
            List of newly unlocked recipe keys.
        """
        from models import RECIPE_DATABASE

        unlocked = []
        for recipe_key, recipe_data in RECIPE_DATABASE.items():
            if recipe_data["level_required"] == new_level:
                if recipe_key not in player.learned_recipes:
                    player.learned_recipes.append(recipe_key)
                    unlocked.append(recipe_key)
                    print(f"📜 New recipe unlocked: {recipe_data['name']}!")
        return unlocked

    def use_ability(self, player, ability_key, target=None):
        """Use an ability, deducting exp cost and applying effect.

        For offensive abilities (damage_multiplier > 0): applies the multiplier
        to the base combat damage formula against the target monster.
        For defensive abilities (duration > 0): doubles the player's defense
        for the specified number of turns.

        Args:
            player: Player instance.
            ability_key: Key from ABILITY_DATABASE.
            target: Monster target for offensive abilities (optional for defensive).

        Returns:
            dict with ability effect details:
                - offensive: {"type": "offensive", "damage": int, "ability": str}
                - defensive: {"type": "defensive", "ability": str, "original_defense": int, "duration": int}

        Raises:
            ValueError: if ability doesn't exist, player hasn't unlocked it,
                        or player doesn't have enough exp.
        """
        from models import ABILITY_DATABASE, Ability

        if ability_key not in ABILITY_DATABASE:
            raise ValueError(f"Ability '{ability_key}' does not exist!")

        ability_data = ABILITY_DATABASE[ability_key]

        # Check if player has the ability unlocked
        has_ability = any(a.ability_key == ability_key for a in player.abilities)
        if not has_ability:
            raise ValueError(f"Player has not unlocked '{ability_data['name']}'!")

        # Check exp cost
        if player.exp < ability_data["exp_cost"]:
            raise ValueError(
                f"Not enough EXP! Need {ability_data['exp_cost']}, have {player.exp}"
            )

        # Deduct cost
        player.exp -= ability_data["exp_cost"]

        # Apply effect based on ability type
        if ability_data["damage_multiplier"] > 0 and target is not None:
            # Offensive ability - calculate boosted damage
            engine = CombatEngine()
            base_damage = engine.calculate_damage(player.attack, target.defense)
            boosted_damage = int(base_damage * ability_data["damage_multiplier"])
            # Apply ceiling: max damage is 150% of player's attack
            max_cap = int(player.attack * 1.5)
            boosted_damage = min(boosted_damage, max_cap)
            # Apply floor: minimum damage is 1
            boosted_damage = max(boosted_damage, 1)
            target.hp -= boosted_damage
            return {
                "type": "offensive",
                "damage": boosted_damage,
                "ability": ability_data["name"],
            }

        elif ability_data["duration"] > 0:
            # Defensive ability - boost defense for duration turns
            # For power_defense: 100% defense boost for duration turns
            original_defense = player.defense
            player.defense = player.defense * 2  # 100% boost
            return {
                "type": "defensive",
                "ability": ability_data["name"],
                "original_defense": original_defense,
                "duration": ability_data["duration"],
            }

        return {"type": "unknown", "ability": ability_data["name"]}


class EncounterGenerator:
    """Generates random monsters weighted by player level with stat variation."""

    # Tier definitions: level ranges map to monster types
    TIER_COMMON = ["slime"]          # Lv1-3
    TIER_UNCOMMON = ["goblin"]       # Lv4-7
    TIER_RARE = ["zombie"]           # Lv8+

    def generate_monster(self, player_level):
        """Generate a random monster weighted by player level with ±20% stat variation.

        Monster selection is weighted by tier:
        - Lv1-3: Common tier (slime)
        - Lv4-7: Uncommon tier (goblin)
        - Lv8+: Rare tier (zombie)

        Stats are randomized within ±20% of base values and clamped to >= 1.

        Args:
            player_level: Current player level (1+)

        Returns:
            Monster instance with randomized stats.
        """
        from models import MONSTER_DATABASE, Character

        # Select monster type based on player level tier
        monster_type = self._select_monster_type(player_level)
        base_stats = MONSTER_DATABASE[monster_type]

        # Randomize stats within ±20%
        hp = self._randomize_stat(base_stats["hp"])
        attack = self._randomize_stat(base_stats["attack"])
        defense = self._randomize_stat(base_stats["defense"])

        # Create monster with randomized stats
        monster = _RandomizedMonster(
            name=base_stats["name"],
            hp=hp,
            attack=attack,
            defense=defense,
            exp_range=base_stats["exp_range"],
            gold_range=base_stats["gold_range"],
        )

        return monster

    def _select_monster_type(self, player_level):
        """Select a monster type based on player level tier."""
        if player_level <= 3:
            return random.choice(self.TIER_COMMON)
        elif player_level <= 7:
            return random.choice(self.TIER_UNCOMMON)
        else:
            return random.choice(self.TIER_RARE)

    def _randomize_stat(self, base_value):
        """Randomize a stat within ±20% of base, minimum 1, returns int."""
        lower = base_value * 0.8
        upper = base_value * 1.2
        randomized = random.uniform(lower, upper)
        return max(1, int(round(randomized)))


class _RandomizedMonster:
    """Monster with pre-randomized stats (used by EncounterGenerator)."""

    def __init__(self, name, hp, attack, defense, exp_range, gold_range):
        self.name = name
        self.hp = hp
        self.max_hp = hp
        self.attack = attack
        self.defense = defense
        self.level = 1

        min_exp, max_exp = exp_range
        min_gold, max_gold = gold_range
        self.exp_reward = random.randint(min_exp, max_exp)
        self.gold_reward = random.randint(min_gold, max_gold)

    def is_alive(self):
        return self.hp > 0


from enum import Enum


class GameState(Enum):
    """Game states for the state machine."""
    StartMenu = "start_menu"
    NewGame = "new_game"
    LoadGame = "load_game"
    Exploration = "exploration"
    Combat = "combat"
    Inventory = "inventory"
    Equipment = "equipment"
    Crafting = "crafting"
    GameOver = "game_over"
    Victory = "victory"


class GameStateManager:
    """Manages game state transitions with validation.

    Implements a state machine that tracks valid transitions between
    game states and raises ValueError on invalid transition attempts.
    """

    VALID_TRANSITIONS = {
        GameState.StartMenu: [GameState.NewGame, GameState.LoadGame],
        GameState.NewGame: [GameState.Exploration],
        GameState.LoadGame: [GameState.Exploration],
        GameState.Exploration: [
            GameState.Combat,
            GameState.Inventory,
            GameState.Equipment,
            GameState.Crafting,
        ],
        GameState.Combat: [GameState.Victory, GameState.GameOver],
        GameState.Victory: [GameState.Exploration],
        GameState.GameOver: [GameState.StartMenu],
        GameState.Inventory: [GameState.Exploration],
        GameState.Equipment: [GameState.Exploration],
        GameState.Crafting: [GameState.Exploration],
    }

    def __init__(self):
        self.current_state = GameState.StartMenu

    def transition_to(self, new_state):
        """Transition to a new state if the transition is valid.

        Args:
            new_state: GameState to transition to.

        Returns:
            The new current state.

        Raises:
            ValueError: If the transition from current_state to new_state is not valid.
        """
        valid_next_states = self.VALID_TRANSITIONS.get(self.current_state, [])
        if new_state not in valid_next_states:
            raise ValueError(
                f"Invalid transition: {self.current_state.value} → {new_state.value}. "
                f"Valid transitions from {self.current_state.value}: "
                f"{[s.value for s in valid_next_states]}"
            )
        self.current_state = new_state
        return self.current_state
