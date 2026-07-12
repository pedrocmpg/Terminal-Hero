# 🚀 QUICK START - Terminal Hero

## Iniciar o Projeto

```bash
cd terminal-hero
npm run dev
```

Acesse: **http://localhost:5174/**

---

## 🎮 Como Jogar

### 1️⃣ Selecione um Monstro
No **painel do centro**, clique em um dos botões:
- **Slime** (fácil)
- **Goblin** (médio)
- **Zombie** (difícil)
- **Orc** (muito difícil)

### 2️⃣ Observe a Batalha Automática
- Combate acontece **automaticamente a cada 1 segundo**
- Terminal de logs mostra cada ataque
- Você não precisa clicar em nada durante o combate

### 3️⃣ Vitória = Novo Monstro Automático
- Quando derrotar o monstro, um **novo é automaticamente escolhido**
- Drops aparecem no inventário
- Combate continua

### 4️⃣ Gerencie seu Inventário (Painel Direita)
- **USAR**: Consumir potions (recupera HP)
- **VND**: Vender itens por ouro
- **Equipar**: Armas/armaduras aumentam ATK/DEF

### 5️⃣ Faça Crafting
- Combine materiais para criar itens
- Exemplo: 2x Erva → 1x Poção
- Precisa do nível mínimo

### 6️⃣ Progresso é Automático
- Estatísticas aparecem no painel esquerdo
- Seu progresso é **salvo automaticamente**
- Recarregue a página - tudo persiste!

---

## 📊 Painel Esquerdo - Seu Status

| Campo | Significado |
|-------|-------------|
| **NOME** | Seu nome (Hero) |
| **LEVEL** | Seu nível (sobe com XP) |
| **OURO** | Dinheiro (ganha em combate) |
| **ATK/DEF/SPD** | Seus atributos |
| **HP Bar** | Sua vida (vermelha) |
| **XP Bar** | Progresso para próximo nível |
| **VITÓRIAS** | Quantos monstros derrotou |
| **DERROTAS** | Quantas vezes morreu |
| **TX.VIT** | Porcentagem de vitórias |
| **MONSTROS** | Total de kills |
| **EXP TOT** | XP acumulada na vida |

---

## 🎯 Painel Centro - Combate

| Seção | O que faz |
|-------|----------|
| **Botões Monstros** | Selecione qual inimigo enfrentar |
| **Info Inimigo** | Vida, ATK, DEF do monstro ativo |
| **Terminal de Logs** | Histórico de ataques e drops |
| **Botão PARAR** | Interrompe o combate |

**Exemplo de Log:**
```
> Combate iniciado: Hero (SPD: 1) vs Slime (SPD: 1)
  [TURNO 1] Hero ataca Slime por 9 dano (HP: 21)
  [TURNO 2] Slime ataca Hero por 3 dano (HP: 97)
  [TURNO 3] Hero ataca Slime por 9 dano (HP: 12)
> Slime foi derrotado!
> Ganhou 5 XP e 2 ouro!
  📦 Slime dropou 1x Erva Medicinal
> Novo inimigo encontrado: Goblin!
```

---

## 🎒 Painel Direita - Inventário & Crafting

### Inventário
- **USAR**: Poções recuperam HP
- **VND**: Converte itens em ouro
- ⚠️ Não pode vender itens equipados

### Equipamentos
- **Armas**: Aumentam ATK
- **Armaduras**: Aumentam DEF
- Clique para equipar/desequipar

### Crafting
- **Verde**: Tem materiais suficientes
- **Vermelho**: Faltam materiais
- **FABRICAR**: Cria o item

**Exemplo:**
```
Poção de Vida Básica
Erva: 2/2        ← Verde (pode craftar)
[FABRICAR]
```

---

## 💡 Dicas Estratégicas

1. **Farm Slimes primeiro** - XP lento mas seguro
2. **Craftar potions** quando tiver muita erva
3. **Equipar armas** = derrotar monstros mais rápido
4. **Vender drops** quando inventário enche (50 slots max)
5. **Level up** = HP e ATK aumentam automaticamente

---

## ⚙️ Comandos Úteis

### Terminal (seu desktop/console)

```bash
# Dev
npm run dev

# Build produção
npm run build

# Preview build
npm run preview

# Linter
npm run lint
```

---

## 🌐 Arquitetura de Arquivos

```
src/
├── data/
│   └── staticDb.ts          ← Monstros, itens, receitas
├── hooks/
│   ├── useGameState.ts      ← Lógica de jogo (backend)
│   └── useGameLoop.ts       ← Game loop 1s/tick
├── components/
│   └── GameDashboard.tsx    ← UI Terminal Neon
├── App.jsx
└── main.jsx
```

---

## 🎨 Cores Neon Utilizadas

| Uso | Tailwind | RGB |
|-----|----------|-----|
| **Fundo** | `bg-black` | #000000 |
| **Texto Normal** | `text-green-400` | #4ade80 |
| **Títulos** | `text-fuchsia-500` | #d946ef |
| **Crítico** | `text-red-500` | #ef4444 |
| **EXP** | `text-yellow-400` | #facc15 |
| **Borda** | `border-green-500/50` | rgba(34,197,94,0.5) |

---

## 🔒 Proteções Implementadas

✅ **Não pode vender equipados** - Protege acidentes
✅ **Não pode usar armas/armaduras** - Apenas consumíveis
✅ **Drops com chance precisa** - 30%, 10%, etc
✅ **Combate automático** - Sem exploits manuais
✅ **Migração de saves** - Compatível com versões antigas
✅ **Limite de 50 slots** - Evita spam infinito

---

## 🐛 Troubleshooting

### "Combate não inicia"
→ Selecione novamente um monstro (botão deve ficar verde)

### "Logs vazios"
→ Normal se acabou de iniciar. Derrota um Slime para ver ação.

### "HP não sobe quando uso poção"
→ Poção já recuperou até o máximo (HP cheio não recupera mais)

### "Não consigo craftear"
→ Verifique: (1) Tem nível? (2) Tem materiais? (3) Aprendeu receita?

### "Perdeu meu progresso"
→ LocalStorage cleared. Reload padrão restaura se dentro de 7 dias offline.

---

## 📱 Mobile

- App é **100% responsivo**
- Touch-friendly no celular
- Layout coluna única em <768px
- Teste: Abra em qualquer navegador mobile

---

## 🎓 Conceitos Principais

| Conceito | O que é | Como funciona |
|----------|---------|---------------|
| **XP Dinâmica** | Curva de experiência | Level 1-10: *100, 11-20: *200, etc |
| **Drops** | Itens do monstro | 30% herb, 10% potion, etc |
| **Combate Automático** | Turnos sem cliques | 1 turno/segundo, novo monstro auto |
| **Crafting** | Combinação de itens | 2x Erva → 1x Poção |
| **Persistência** | Save automático | LocalStorage a cada 10s |

---

## 🚀 Próximos Passos (Futuro)

- [ ] Boss battles especiais
- [ ] Sistema de habilidades ativas
- [ ] Levantamento de dados (win_rate leaderboard)
- [ ] Temas alternativos (cyan, roxo, etc)
- [ ] Achievements/Badges

---

**Versão:** 1.0 - Taskbar Hero Edition
**Status:** ✅ Pronto para Jogar
**Última Atualização:** 12 de Julho de 2026
