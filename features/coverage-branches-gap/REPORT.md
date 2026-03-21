# REPORT — Cobertura de Branches

**Status:** IN_PROGRESS (AC-1 completo, AC-2/3/4 pendentes)
**Data:** 2026-03-21
**Branch:** feature/coverage-branches-gap
**Tipo:** implement-feature
**Referência:** P2 qualidade — fechar gap de branches de 84%→90%

---

## Progresso Atual

### Cobertura Global

| Métrica    | Antes  | Depois     | Meta    |
| ---------- | ------ | ---------- | ------- |
| Statements | 95.17% | 95.29%     | 90%     |
| Branches   | 84%    | **86.37%** | **90%** |
| Functions  | 93.15% | 93.15%     | 90%     |
| Lines      | 95.26% | 95.29%     | 90%     |

### Arquivos com Gap de Branches

| Arquivo          | Antes  | Depois   | Status           |
| ---------------- | ------ | -------- | ---------------- |
| `sparkline.tsx`  | 47.05% | **100%** | ✅ AC-1 completo |
| `PriceTable.tsx` | 76.31% | 76.31%   | 🔄 AC-2 pendente |
| `market.api.ts`  | 78.94% | 78.94%   | 🔄 AC-3 pendente |
| `Index.tsx`      | 53.84% | 53.84%   | Pendente         |
| `form.hooks.ts`  | 50%    | 50%      | Pendente         |

---

## Critérios de Aceite

| AC   | Descrição                        | Status                                               |
| ---- | -------------------------------- | ---------------------------------------------------- |
| AC-1 | sparkline.tsx com90%+ branches   | ✅ **100%** — 15 testes adicionados                  |
| AC-2 | PriceTable.tsx com 90%+ branches | 🔄 Pendente — branches: sort, paginação, enchantment |
| AC-3 | market.api.ts com 90%+ branches  | 🔄 Pendente — branches: erro, retry, dedup           |
| AC-4 | Cobertura global ≥90%            | 🔄 **86.37%** → faltam ~21 branches                  |

---

## AC-1: sparkline.tsx ✅

### Testes Adicionados

Arquivo: `src/test/sparkline.test.tsx` — 15 testes

Branches cobertos:

- `data` undefined/null/vazio/1 elemento/2+ elementos
- `range = 0` (todos valores iguais)
- Tendência positiva/negativa/neutra
- Cor explícita vs tendência (positive/negative/neutral)
- Renderização SVG com dimensões e className

### Cobertura Alcançada

```
sparkline.tsx | 100% | 100% | 100% | 100%
```

---

## Próximos Passos

1. **AC-2**: Adicionar testes para branches de PriceTable:
   - Sort por buyPrice, timestamp
   - Paginação (onClick setCurrentPage)
   - Filtro enchantment (level 0 vs level1/2/3)

2. **AC-3**: Adicionar testes para branches de market.api:
   - Casos de erro de rede
   - Branches de retry
   - Deduplicação com valores iguais

3. **AC-4**: Verificar cobertura global atingiu 90%

---

## Commit

```
test(coverage): add sparkline tests for branch coverage (AC-1)

- Add 15 tests for sparkline.tsx
- Branches: 47% -> 100%
- Global branches: 84% -> 86.37%
```
