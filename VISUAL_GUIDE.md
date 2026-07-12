# 🎨 VISUAL GUIDE - Terminal Hero UI

## Desktop View (1920px)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Terminal Hero - Taskbar Hero Edition                            🟢 Status: ONLINE │
├─────────────────────┬──────────────────────────┬────────────────────────────────────┤
│  PLAYER_STATUS      │  COMBATE_ATIVO           │  INVENTORY_SYSTEM                  │
├─────────────────────┼──────────────────────────┼────────────────────────────────────┤
│                     │                          │                                    │
│ NOME: Hero          │ Selecione Alvo:          │ ≡ INVENTÁRIO (3)                   │
│ LEVEL: 1            │ [Slime] [Goblin]         │                                    │
│ OURO: 42            │ [Zombie] [Orc]           │ ┌─ Poção ×2       [USAR] [VND] ─┐ │
│                     │                          │ ├─ Herb ×1        [USAR] [VND] ─┤ │
│ ≡ ATRIBUTOS         │ ≡ INIMIGO ATIVO          │ └─ Iron Ore ×1    [USAR] [VND] ─┘ │
│ ATK: 10 (base: 10)  │ Slime                    │                                    │
│ DEF: 5 (base: 5)    │ HP: 30 | ATK: 4 | DEF: 1 │ ≡ EQUIPAMENTOS                     │
│ SPD: 1              │                          │ ⚔ ARMA: Desarmado                 │
│                     │ Terminal de Logs:        │ 🛡 ARMADURA: Sem armadura         │
│ ≡ VITALIDADE        │ ┌────────────────────┐  │                                    │
│ [████████░░░░░░░░░] │ │ > Combate iniciado │  │ ⚔ Espada Comum                    │
│ 100/100 HP          │ │   [TURNO 1] Hero   │  │                                    │
│                     │ │   ataca por 9 dano │  │ ≡ CRAFTING (1)                     │
│ ≡ EXPERIÊNCIA       │ │   [TURNO 2] Slime  │  │                                    │
│ [▓▓▓░░░░░░░░░░░░░░] │ │   ataca por 3 dano │  │ Poção de Vida Básica               │
│ 0/100 XP            │ │ > Slime derrotado! │  │ Erva: 2/2 ✓                        │
│                     │ │ > Ganhou 5 XP      │  │ [FABRICAR]                         │
│ ≡ ESTATÍSTICAS      │ │ > Ganhou 2 ouro    │  │                                    │
│ VITÓRIAS: 0         │ │   📦 Drop: 1 Herb  │  │                                    │
│ DERROTAS: 0         │ │ > Novo: Goblin!    │  │                                    │
│ TX.VIT: N/A         │ └────────────────────┘  │                                    │
│ MONSTROS: 0         │                          │                                    │
│ EXP TOT: 0          │ [PARAR COMBATE]          │                                    │
│                     │                          │                                    │
└─────────────────────┴──────────────────────────┴────────────────────────────────────┘
```

### Cores
```
Fundo:        ⬛ #000000
Texto normal: 🟢 #4ade80  
Títulos:      🟣 #d946ef
HP crítico:   🔴 #ef4444
XP:           🟡 #facc15
Brilho:       ✨ rgba(34,197,94,0.3)
```

---

## Mobile View (375px)

```
┌──────────────────────────────┐
│ Terminal Hero Mobile         │
├──────────────────────────────┤
│ > PLAYER_STATUS              │
├──────────────────────────────┤
│ NOME: Hero                   │
│ LEVEL: 1 | OURO: 42          │
│                              │
│ ATK: 10 | DEF: 5 | SPD: 1    │
│                              │
│ [████████░░░░░░░░░░] 100 HP  │
│ [▓▓▓░░░░░░░░░░░░░░░] 0 XP    │
│                              │
│ V: 0  D: 0  TX: N/A          │
│ MONSTROS: 0  XP: 0           │
└──────────────────────────────┘
┌──────────────────────────────┐
│ > COMBATE_ATIVO              │
├──────────────────────────────┤
│ [Slime] [Goblin]             │
│ [Zombie] [Orc]               │
│                              │
│ Slime (HP:30 ATK:4 DEF:1)    │
│                              │
│ Terminal:                    │
│ > Combate iniciado           │
│   [T1] Hero ataca: 9 dano    │
│   [T2] Slime ataca: 3 dano   │
│ > Slime derrotado!           │
│ > Novo: Goblin!              │
│                              │
│ [PARAR COMBATE]              │
└──────────────────────────────┘
┌──────────────────────────────┐
│ > INVENTORY_SYSTEM           │
├──────────────────────────────┤
│ Poção ×2    [USAR] [VND]     │
│ Herb ×1     [USAR] [VND]     │
│ Iron Ore ×1 [USAR] [VND]     │
│                              │
│ ⚔ Desarmado                  │
│ 🛡 Sem armadura              │
│ [Espada Comum]               │
│                              │
│ Poção de Vida Básica         │
│ Erva: 2/2 ✓                  │
│ [FABRICAR]                   │
└──────────────────────────────┘
```

---

## Estado: Combate em Progresso

```
Terminal de Logs (Real Time):

> Combate iniciado: Hero (SPD: 1) vs Slime (SPD: 1)
  [TURNO 1] Hero ataca Slime por 9 dano (HP: 21)
  [TURNO 2] Slime ataca Hero por 3 dano (HP: 97)
  [TURNO 3] Hero ataca Slime por 9 dano (HP: 12)
  [TURNO 4] Slime ataca Hero por 3 dano (HP: 94)
  [TURNO 5] Hero ataca Slime por 9 dano (HP: 3)
  [TURNO 6] Slime ataca Hero por 3 dano (HP: 91)
  [TURNO 7] Hero ataca Slime por 9 dano (HP: -6)
> Slime foi derrotado!
> Ganhou 7 XP e 3 ouro!
  📦 Slime dropou 1x Erva Medicinal
  📦 Slime dropou 1x Poção de Vida Básica
> Novo inimigo encontrado: Zombie!

Novo Combate (Automático):

  [TURNO 1] Zombie ataca Hero por 5 dano (HP: 86)
  [TURNO 2] Hero ataca Zombie por 4 dano (HP: 96)
  ...
```

---

## Estado: Após 5 Vitórias

```
PLAYER STATUS (Coluna Esquerda):

NOME: Hero
LEVEL: 2 ↑
OURO: 87 ↑

≡ ATRIBUTOS
ATK: 12 ↑ (base: 12)
DEF: 7 ↑ (base: 7)
SPD: 1

≡ VITALIDADE
[████████████████░░░░] 
110/110 HP ↑

≡ EXPERIÊNCIA
[████████████░░░░░░░░]
45/200 XP ↑ (Level 2 requer 200)

≡ ESTATÍSTICAS
VITÓRIAS: 5 ↑
DERROTAS: 0
TX.VIT: 100% ✓
MONSTROS: 5 ↑
EXP TOT: 35 ↑

≡ EQUIPAMENTO
⚔ Desarmado
🛡 Sem armadura
```

---

## Estado: Com Equipamento

```
Após equipar "Espada Comum":

ATRIBUTOS (Coluna Esquerda):
ATK: 15 (base: 12)  ← +3 da espada
DEF: 7 (base: 7)

EQUIPAMENTO (Coluna Esquerda):
⚔ Espada Comum
🛡 Sem armadura

Após equipar "Escudo Comum":

ATRIBUTOS:
ATK: 15 (base: 12)
DEF: 10 (base: 7)  ← +3 do escudo

EQUIPAMENTO:
⚔ Espada Comum
🛡 Escudo Comum
```

---

## Estado: Crafting em Progresso

```
CRAFTING SECTION (Coluna Direita):

≡ CRAFTING (2 receitas aprendidas)

Poção de Vida Básica
Erva: 2/2 ✓ (Verde - tem tudo)
[FABRICAR] ← Ativo, clicável

Espada Comum
Minério: 0/3 ✗ (Vermelho - falta)
[FABRICAR] ← Desativado, opaco
```

### Após Craftear:

```
INVENTÁRIO (Coluna Direita):

Poção ×4     [USAR] [VND]  ← Aumentou!
Herb ×0      [USAR] [VND]  ← Zerou
Iron Ore ×1  [USAR] [VND]
```

---

## Transições de Cor (Hover Estados)

### Botão Monstro (Não Selecionado)
```
Normal:       🟩 text-green-400 | border-green-500/50
Hover:        🟩 border-green-400 | shadow neon
Selecionado:  🟢 bg-green-400 text-black | shadow forte
```

### Botão Ação (Vender)
```
Normal:       🟩 text-green-400 | border-green-500/30
Hover:        🔴 border-red-500 | text-red-500 | shadow red
```

### Botão Parar Combate
```
Normal:       🔴 text-red-500 | border-red-500/50
Hover:        🔴 border-red-500 | bg-red-500/10
Ativo:        Nunca ativo durante combate
```

### Botão Fabricar (Bloqueado)
```
Desbloqueado: 🟩 Normalmente verde
Bloqueado:    ⚫ opacity-50 | cursor-not-allowed
```

---

## Elementos Especiais

### Barra de HP
```
Normal:      [████████░░░░░░░░░░░░] 85/100
Crítico:     [██░░░░░░░░░░░░░░░░░░] 15/100 (vermelho)
Cheio:       [████████████████████░] 100/100 (verde)
```

### Barra de EXP
```
Normal:      [▓▓▓░░░░░░░░░░░░░░░░░] 50/500 (amarelo)
Próx Level:  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░] 450/500 (amarelo)
```

### Ícones Contextuais
```
📦 Drop          (item caiu do monstro)
⚔ Arma           (tipo de item)
🛡 Armadura      (tipo de item)
✓ Suficiente     (verde, material ok)
✗ Insuficiente   (vermelho, falta material)
```

---

## Animações CSS

```css
/* Auto-scroll para novo log */
scroll-behavior: smooth;

/* Brilho Neon ao Hover */
shadow-[0_0_10px_rgba(34,197,94,0.3)]

/* Transição de Cor */
transition: all 200ms ease-in-out

/* Pulse no "Inicializando" */
animate-pulse

/* Desativado */
opacity-50
cursor-not-allowed
```

---

## Responsividade Breakpoints

```
┌────────────────────────────────┐
│ Mobile (375px - 767px)         │
│ 1 coluna (stack vertical)      │
└────────────────────────────────┘
         ↕ (md: 768px)
┌────────────────────────────────┐
│ Tablet (768px - 1023px)        │
│ 3 colunas (aperto, ajustes)    │
└────────────────────────────────┘
         ↕ (lg: 1024px)
┌────────────────────────────────┐
│ Desktop (1024px+)              │
│ 3 colunas (layout ideal)       │
└────────────────────────────────┘
```

---

## Paleta Neon Detalhada

| Uso | Tailwind | Hex | RGB |
|-----|----------|-----|-----|
| Fundo | bg-black | #000000 | 0,0,0 |
| Texto padrão | text-green-400 | #4ade80 | 74,222,128 |
| Accent 1 | text-fuchsia-500 | #d946ef | 217,70,239 |
| Crítico | text-red-500 | #ef4444 | 239,68,68 |
| Progresso | text-yellow-400 | #facc15 | 250,204,21 |
| Borda dark | border-green-500/50 | rgba(34,197,94,0.5) | 34,197,94,0.5 |
| Shadow | shadow | rgba(34,197,94,0.3) | 34,197,94,0.3 |

---

## Estado Último (Game Over)

```
Após Derrota em Combate:

PLAYER STATUS (Coluna Esquerda):

≡ VITALIDADE
[██░░░░░░░░░░░░░░░░░░]
55/110 HP  (50% do máximo)
  ↓
Terminal de Logs (Coluna Centro):

> Hero foi derrotado por Zombie!
> Revivido com 50% de HP (55 HP).

(Opcionalmente: [PARAR COMBATE] para pausar)
```

---

## Atalhos Visuais para Daltônicos

```
SEM dependência APENAS de cor:

✓ Altura de elemento
✓ Opacidade (desativado = opacity-50)
✓ Brilho neon
✓ Símbolos: ⚔ 🛡 📦
✓ Texto explícito: "FABRICAR desativado"
✓ Geom​etria: bordas/espaçamento

EVITADO:
✗ Gradientes confusos
✗ Apenas "verde = bom, vermelho = ruim"
✗ Texto sem contraste
```

---

## Total Visual

- **3 Painéis Principais** com bordas neon
- **100+ componentes interativos** com feedback
- **Totalmente responsivo** (mobile-first)
- **Acessível** para todos usuários
- **Perfeito para terminal** (cyberpunk aesthetic)
- **Zero gradientes** confusos

---

**Design Status:** ✅ Terminal Neon Moderno Completo
