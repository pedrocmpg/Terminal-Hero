# Terminal Hero - Como Usar

## 🚀 Iniciar o Jogo

```bash
cd terminal-hero
npm install
npm run dev
```

Abra em seu navegador: **http://localhost:5173**

---

## 🎮 Gameplay

### Interface

```
┌─ HEADER ────────────────────────────────────────┐
│ TERMINAL HERO | Lv 25 | ⚔ 45W | ✦ Prestige 2  │
└─────────────────────────────────────────────────┘

┌─ ESQUERDA ──┬─ CENTRO ─────────────┬─ DIREITA ─┐
│ Stats       │ Combate              │ Inventário│
│ ├ HP        │ ├ Seletor Monstro   │ ├ Itens    │
│ ├ XP        │ ├ Info Inimigo      │ └ Crafting │
│ ├ ATK/DEF   │ └ Battle Log        │            │
│ └ Tempo     │                      │            │
└─────────────┴──────────────────────┴────────────┘
```

---

## 📋 Funcionalidades

### 1. Combate Automático
- **Como funciona**: Seleciona um monstro, herói ataca automaticamente
- **Auto-progresso**: Monstro derrotado? Nova batalha começa
- **Tab inativa**: O jogo pausa (economiza bateria/CPU)

### 2. Inventário
- **Consumíveis** (✓): Use para recuperar HP
- **Vendáveis** ($): Venda por ouro
- **Equipáveis** (⚔/🛡): Equipe para ganhar bônus

### 3. Crafting
- **Receitas**: Aprende automaticamente com levels
- **Materiais**: Colete drops de monstros
- **Fabricar** (⚙): Clique para criar itens

### 4. Sistema de Prestige
- **Requisito**: Atingir nível 10+ (depois 15, 20, 25...)
- **Benefício**: Bônus permanente de ATK/DEF (+10% por nível)
- **Reset**: Voltar ao nível 1, mas mais forte
- **Botão**: ✦ Prestige (canto superior direito)

---

## 💰 Progresso Offline

- **Tempo máximo**: 7 dias offline
- **XP por minuto**: 2 (base) + prestige
- **Ouro por minuto**: 1 (base) + prestige
- **Bônus**: Começa aplicar quando abre o jogo

### Exemplo
```
Offline 1 dia (1440 min):
- Base: 2,880 XP + 1,440 Ouro
- Prestige 2 (30% bônus): 3,744 XP + 1,872 Ouro
```

---

## 🎯 Dicas de Jogo

### Early Game (Lv 1-10)
1. Combate contra **Slime** (mais fácil)
2. Colete **Herbs** e **Common Items**
3. Venda itens extras para ganhar ouro
4. Equipe items quando conseguir

### Mid Game (Lv 11-20)
1. Switch para **Goblin** ou **Orc** (mais rewards)
2. Comece craftando **Potions**
3. Equipe items melhorados
4. Prepare para primeiro **Prestige**

### Late Game (Lv 21+)
1. Prestigie regularmente
2. Farm monstros harder (Boss, Dragon)
3. Maximize drops
4. Stack de múltiplos prestiges

---

## ⚙️ Controles

| Ação | Como |
|------|------|
| Mudar monstro | Clique no botão do monstro |
| Parar combate | Clique em "Parar" ou no inimigo |
| Usar poção | Clique em ✓ na poção |
| Vender item | Clique em $ no item |
| Equipar arma | Clique no botão da arma |
| Desquipar | Botão "Desquipar" (stats) |
| Craftar | Clique em ⚙ quando tiver materiais |
| Prestigiar | Clique em ✦ quando elegível |
| Limpar logs | Botão "Limpar" no Battle Log |

---

## 💾 Save

- **Automático**: A cada 10 segundos
- **Armazenamento**: Browser LocalStorage
- **Backup**: Abra DevTools → Console →
  ```javascript
  // Copiar save
  copy(localStorage.getItem('terminal_hero_save'));
  
  // Restaurar (paste no console)
  localStorage.setItem('terminal_hero_save', 'seu_save_aqui');
  ```

---

## 🐛 Troubleshooting

### "Meu save desapareceu"
- Cookies/Cache foi limpo
- Abra DevTools: `localStorage` ainda tem dados?
- Se não, pode ser perda permanente

### "O jogo trava"
- Muitos logs? Clique "Limpar"
- Feche outras abas
- Recarga: F5

### "Prestige não aparece"
- Verifica o nível requerido (10, 15, 20...)
- Recarregue se não aparecer ainda

### "Quero resetar tudo"
```javascript
localStorage.removeItem('terminal_hero_save');
location.reload();
```

---

## 📊 Estatísticas

### Rastreadas
- Nível atual
- Total XP
- Vitórias/Derrotas
- Monstros derrotados (por tipo)
- Tempo jogado
- Prestige level
- Gold total

### Acesso
```javascript
// No console (F12)
const save = JSON.parse(localStorage.getItem('terminal_hero_save'));
console.table(save);
```

---

## 🎨 Customização (Desenvolvedor)

### Mudar cores
Arquivo: `src/index.css` e `src/components/GameDashboard.tsx`

Cores usadas:
- Cyan: `#06b6d4`
- Amber: `#f59e0b`
- Red: `#ef4444`
- Green: `#10b981`

### Mudar velocidade
Arquivo: `src/hooks/useGameLoop.ts`, linha 57:
```typescript
}, 1000); // Mude para 500 = 2x velocidade
```

### Mudar rewards offline
Arquivo: `src/hooks/useGameState.ts`, linha 596:
```typescript
const XP_PER_MINUTE = 2; // Mude para 5 = mais XP
```

---

## 🏆 Metas de Gameplay

- [ ] Atingir nível 10 (primeiro prestige)
- [ ] Prestigiar 5 vezes
- [ ] Derrotar 1000 monstros
- [ ] Ganhar 100k de ouro
- [ ] 50h de tempo jogado
- [ ] Todos os itens no inventário

---

## 💬 Feedback

Gostou? Compartilhe!
Encontrou bug? Abra issue no GitHub.

---

**Versão**: 2.0 (Task Bar Hero Edition)
**Última atualização**: Jul 17, 2026
**Build**: 66.10 KB (gzip)
