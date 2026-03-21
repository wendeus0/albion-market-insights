# REPORT — Cobertura de Branches

**Status:** IN_PROGRESS (AC-1 completo, AC-2/3 parcial)
**Data:** 2026-03-21
**Branch:** feature/coverage-branches-gap
**Tipo:** implement-feature
**Referência:** P2 qualidade — fechar gap de branches de 84%→90%

---

## Progresso Atual

### Cobertura Global

| Métrica      | Antes  | Depois     | Meta    |
| ------------ | ------ | ---------- | ------- |
| Statements   | 95.17% | 94.07%     | 90%     |
| **Branches** | 84%    | **86.71%** | **90%** |
| Functions    | 93.15% | 94.04%     | 90%     |
| Lines        | 95.26% | 95.70%     | 90%     |

**Faltam:** 19 branches para atingir 90%

---

## Critérios de Aceite

| AC   | Descrição                        | Status      | Branches           |
| ---- | -------------------------------- | ----------- | ------------------ |
| AC-1 | sparkline.tsx com 90%+ branches  | ✅ Completo | 47%→100%           |
| AC-2 | PriceTable.tsx com 90%+ branches | 🔄 Parcial  | 76% (9 uncovered)  |
| AC-3 | market.api.ts com 90%+ branches  | 🔄 Pendente | 78% (16 uncovered) |
| AC-4 | Cobertura global ≥90%            | 🔄 Parcial  | 86.71% → meta 90%  |

---

## Mudanças Realizadas

### AC-1: sparkline.tsx ✅ (Commit1)

Arquivo: `src/test/sparkline.test.tsx` — 15 testes

- `data` undefined/null/vazio/1 elemento/2+ elementos
- `range = 0` (todos valores iguais)
- Tendência positiva/negativa/neutra
- Cor explícita vs tendência

### AC-2/3: Arbitrage + DataSource (Commit 2)

Arquivos:

- `src/test/arbitrage.test.ts` — +3 testes
- `src/test/dataSource.manager.test.ts` — +1 teste
- `src/test/PriceTable.test.tsx` — +4 testes

Branches cobertos:

- arbitrage.ts: 84%→ 92%
- dataSource.manager.ts: mantido

---

## Próximos Passos

1. **AC-2**: Adicionar mais testes para PriceTable.tsx
   - Branches de onClick handlers

2. **AC-3**: Adicionar testes para market.api.ts
   - Branches de error/retry
   - Branches de deduplicação

3. **AC-4**: Verificar cobertura global atingiu 90%

---

## Commits

```
785f8ef test(coverage): add sparkline tests for branch coverage (AC-1)
6e85155 test(coverage): add tests for branch coverage (AC-2/3 partial)
```

---

## Cobertura por Arquivo

| Arquivo           | Branches | Uncovered |
| ----------------- | -------- | --------- |
| sparkline.tsx     | 100%     | 0         |
| arbitrage.ts      | 92%      | 2         |
| PriceTable.tsx    | 76%      | 9         |
| market.api.ts     | 78%      | 16        |
| AlertsManager.tsx | 76%      | 9         |
