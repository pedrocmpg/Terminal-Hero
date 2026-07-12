import random
from collections import defaultdict

PLAYER_STARTING_STATS = {
    "hp": 100,
    "attack": 10,
    "defense": 5,
    "level": 1,
    "inventory": {}
}

MONSTER_DATABASE = {
    "slime": {
        "name": "Slime",
        "max_hp": 30,
        "attack": 4,
        "defense": 1,
        "exp_range": (1, 10),
        "gold_range": (1, 5)
    },
    "goblin": {
        "name": "Goblin",
        "hp": 55,
        "attack": 12,
        "defense": 4,
        "exp_range": (5, 15),
        "gold_range": (5, 10)
    },
    "zombie": {
        "name": "Zombie",
        "hp": 100,
        "attack": 8,
        "defense": 6,
        "exp_range": (10, 20),
        "gold_range": (10, 15)
    }
}

ABILITY_DATABASE = {
    "fire_strike": {
        "name": "Fire Strike",
        "level_required": 5,
        "exp_cost": 20,
        "damage_multiplier": 1.5,
        "duration": 0  
    },
    "power_defense": {
        "name": "Power Defense",
        "level_required": 10,
        "exp_cost": 30,
        "damage_multiplier": 0, 
        "duration": 2  
    }
}

RECIPE_DATABASE = {
    "basic_potion": {
        "name": "Poção de Vida Básica",
        "level_required": 1,
        "required_materials": {"herb": 2},
        "crafted_item": "basic_potion"
    },
    "common_sword": {
        "name": "Espada Comum",
        "level_required": 3,
        "required_materials": {"iron_ore": 3},
        "crafted_item": "common_sword"
    },
    "common_shield": {
        "name": "Escudo Comum",
        "level_required": 5,
        "required_materials": {"iron_ore": 2, "leather": 2},
        "crafted_item": "common_shield"
    }
}

ITEM_DATABASE = {
    "basic_potion": {
        "name": "Poção de Vida Básica",
        "item_type": "consumivel",
        "value": 30,
        "effect_value": 50,
        "id": "basic_potion"
    },
    "common_sword": {
        "name": "Espada Comum",
        "item_type": "arma",
        "value": 25,
        "damage_bonus": 5
    },
    "common_shield": {
        "name": "Escudo Comum",
        "item_type": "armadura",
        "value": 25,
        "defense_bonus": 3
    },
    "common_bow": {
        "name": "Arco Comum",
        "item_type": "arma",
        "value": 20,
        "damage_bonus": 3
    },
    "common_arrow": {
        "name": "Flecha Comum",
        "item_type": "consumivel",
        "value": 5,
        "effect_value": 10
    },
    "herb": {
        "name": "Erva Medicinal",
        "item_type": "material",
        "value": 5,
    },
    "iron_ore": {
        "name": "Minério de Ferro",
        "item_type": "material",
        "value": 10,
    },
    "leather": {
        "name": "Couro",
        "item_type": "material",
        "value": 8,
    }
}


class Inventory:
    """Gerencia itens do personagem com rastreamento de quantidade."""
    
    MAX_SLOTS = 50  # Maximum unique item types allowed
    
    def __init__(self):
        self.items = defaultdict(int)  # {item_key: quantidade}
    
    def add_item(self, item_key, quantity=1):
        """Adiciona item ao inventário."""
        if item_key not in ITEM_DATABASE:
            raise ValueError(f"Item '{item_key}' não existe no banco de dados!")
        # Capacity check: 50 unique item types
        if item_key not in self.items and len(self.items) >= self.MAX_SLOTS:
            raise ValueError("Inventário cheio! Máximo de 50 tipos de itens.")
        self.items[item_key] += quantity
        return True
    
    def remove_item(self, item_key, quantity=1):
        """Remove item do inventário."""
        if self.items[item_key] < quantity:
            return False
        self.items[item_key] -= quantity
        if self.items[item_key] == 0:
            del self.items[item_key]
        return True
    
    def has_item(self, item_key, quantity=1):
        """Verifica se tem quantidade suficiente de um item."""
        return self.items.get(item_key, 0) >= quantity
    
    def get_quantity(self, item_key):
        """Retorna a quantidade de um item."""
        return self.items.get(item_key, 0)
    
    def list_items(self):
        """Retorna lista formatada de itens no inventário."""
        if not self.items:
            return "Inventário vazio"
        
        items_list = []
        for item_key, quantity in self.items.items():
            item_data = ITEM_DATABASE[item_key]
            items_list.append(f"{item_data['name']} x{quantity}")
        return items_list
    
    def clear(self):
        """Limpa o inventário."""
        self.items.clear()


class Character:
    def __init__(self, name, hp, attack, defense, level):
        self.name = name
        self.hp = hp
        self.max_hp = hp
        self.attack = attack
        self.defense = defense
        self.level = level
        self.inventory = Inventory()
    
    def is_alive(self):
        return self.hp > 0
    
class Player(Character):
    def __init__(self, name, hp, attack, defense, level):
        super().__init__(name, hp, attack, defense, level)
        self.exp = 0
        self.exp_to_next_level = 100
        self.gold = 0
        self.skills = []
        self.abilities = []
        self.absolute_skills = []
        self.learned_recipes = ["basic_potion"]
        self.equipped_weapon = None  # item_key
        self.equipped_armor = None   # item_key
        self.base_attack = attack
        self.base_defense = defense

    def level_up(self):
        self.level += 1
        self.max_hp += 10
        self.hp = self.max_hp
        self.base_attack += 2
        self.attack += 2
        self.base_defense += 2
        self.defense += 2
        self.exp = self.exp - self.exp_to_next_level
        self.exp_to_next_level += 50
        print(f"{self.name} has leveled up to level {self.level}!")

    def gain_exp(self, amount):
        self.exp += amount
        print(f"{self.name} gained {amount} EXP!")
        if self.exp >= self.exp_to_next_level:
            self.level_up()
    
    def gain_gold(self, amount):
        """Adiciona ouro ao jogador."""
        self.gold += amount
        return True
    
    def spend_gold(self, amount):
        """Remove ouro do jogador."""
        if self.gold < amount:
            return False
        self.gold -= amount
        return True
    
    def equip_weapon(self, item_key):
        """Equipa uma arma."""
        if item_key not in ITEM_DATABASE:
            raise ValueError(f"Item '{item_key}' não existe!")
        
        item_data = ITEM_DATABASE[item_key]
        if item_data["item_type"] != "arma":
            raise ValueError(f"'{item_data['name']}' não é uma arma!")
        
        if not self.inventory.has_item(item_key):
            raise ValueError(f"Você não possui '{item_data['name']}'!")
        
        self.equipped_weapon = item_key
        damage_bonus = item_data.get("damage_bonus", 0)
        self.attack = self.base_attack + damage_bonus
        return True
    
    def unequip_weapon(self):
        """Remove a arma equipada."""
        self.equipped_weapon = None
        self.attack = self.base_attack
        return True
    
    def equip_armor(self, item_key):
        """Equipa uma armadura."""
        if item_key not in ITEM_DATABASE:
            raise ValueError(f"Item '{item_key}' não existe!")
        
        item_data = ITEM_DATABASE[item_key]
        if item_data["item_type"] != "armadura":
            raise ValueError(f"'{item_data['name']}' não é uma armadura!")
        
        if not self.inventory.has_item(item_key):
            raise ValueError(f"Você não possui '{item_data['name']}'!")
        
        self.equipped_armor = item_key
        defense_bonus = item_data.get("defense_bonus", 0)
        self.defense = self.base_defense + defense_bonus
        return True
    
    def unequip_armor(self):
        """Remove a armadura equipada."""
        self.equipped_armor = None
        self.defense = self.base_defense
        return True
    
    def use_consumable(self, item_key):
        """Usa um consumível do inventário."""
        if item_key not in ITEM_DATABASE:
            raise ValueError(f"Item '{item_key}' não existe!")
        
        item_data = ITEM_DATABASE[item_key]
        if item_data["item_type"] != "consumivel":
            raise ValueError(f"'{item_data['name']}' não é um consumível!")
        
        if not self.inventory.remove_item(item_key, 1):
            raise ValueError(f"Você não possui '{item_data['name']}'!")
        
        effect_value = item_data.get("effect_value", 0)
        
        # Aplicar efeito baseado em tipo de consumível
        if item_key == "basic_potion":
            self.hp += effect_value
            if self.hp > self.max_hp:
                self.hp = self.max_hp
            print(f"{self.name} usou {item_data['name']} e curou {effect_value} de HP!")
        
        elif item_key == "common_arrow":
            # Flecha é usada em combate, apenas remove do inventário
            print(f"{self.name} atirou uma {item_data['name']}!")
        
        return True

class Monster(Character):
    def __init__(self, monster_type):
        stats = MONSTER_DATABASE.get(monster_type)
        
        if not stats:
            raise ValueError(f"Monstro do tipo '{monster_type}' não existe!")

        super().__init__(
            name=stats["name"],
            hp=stats["hp"],
            attack=stats["attack"],
            defense=stats["defense"],
            level=1
        )
        
        min_exp, max_exp = stats["exp_range"]
        min_gold, max_gold = stats["gold_range"]
        
        self.exp_reward = random.randint(min_exp, max_exp)
        self.gold_reward = random.randint(min_gold, max_gold)


class Item:
    """Classe base para todos os itens."""
    
    def __init__(self, item_key):
        if item_key not in ITEM_DATABASE:
            raise ValueError(f"Item '{item_key}' não existe no banco de dados!")
        
        self.item_key = item_key
        self.data = ITEM_DATABASE[item_key]
        self.name = self.data["name"]
        self.item_type = self.data["item_type"]
        self.value = self.data["value"]
    
    def get_info(self):
        """Retorna informações formatadas do item."""
        return f"{self.name} (${self.value})"


class Weapon(Item):
    """Arma que aumenta ataque."""
    
    def __init__(self, item_key):
        super().__init__(item_key)
        
        if self.item_type != "arma":
            raise ValueError(f"'{self.name}' não é uma arma válida!")
        
        self.damage_bonus = self.data.get("damage_bonus", 0)
    
    def get_info(self):
        """Retorna informações da arma."""
        return f"{self.name} (+{self.damage_bonus} ATK) - ${self.value}"


class Armor(Item):
    """Armadura que aumenta defesa."""
    
    def __init__(self, item_key):
        super().__init__(item_key)
        
        if self.item_type != "armadura":
            raise ValueError(f"'{self.name}' não é uma armadura válida!")
        
        self.defense_bonus = self.data.get("defense_bonus", 0)
    
    def get_info(self):
        """Retorna informações da armadura."""
        return f"{self.name} (+{self.defense_bonus} DEF) - ${self.value}"


class Consumable(Item):
    """Item consumível com efeito único."""
    
    def __init__(self, item_key):
        super().__init__(item_key)
        
        if self.item_type != "consumivel":
            raise ValueError(f"'{self.name}' não é um consumível válido!")
        
        self.effect_value = self.data.get("effect_value", 0)
    
    def get_info(self):
        """Retorna informações do consumível."""
        return f"{self.name} (Efeito: {self.effect_value}) - ${self.value}"
    
    def use(self, player):
        """Aplica o efeito do consumível no jogador."""
        if self.item_key == "basic_potion":
            player.hp += self.effect_value
            if player.hp > player.max_hp:
                player.hp = player.max_hp
            return f"{player.name} usou {self.name} e curou {self.effect_value} de HP!"
        
        elif self.item_key == "common_arrow":
            return f"{player.name} atirou uma {self.name}! (Dano: {self.effect_value})"
        
        return f"{player.name} usou {self.name}!"


class Ability:
    """Habilidade especial desbloqueada em níveis específicos."""

    def __init__(self, ability_key):
        if ability_key not in ABILITY_DATABASE:
            raise ValueError(f"Ability '{ability_key}' não existe no banco de dados!")

        data = ABILITY_DATABASE[ability_key]
        self.ability_key = ability_key
        self.name = data["name"]
        self.level_required = data["level_required"]
        self.exp_cost = data["exp_cost"]
        self.damage_multiplier = data["damage_multiplier"]
        self.duration = data["duration"]

    def can_use(self, player):
        """Check if player has enough exp to use this ability."""
        return player.exp >= self.exp_cost