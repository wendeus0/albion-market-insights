# REPORT — Cobertura de Branches

**Status:** IN_PROGRESS
**Data:** 2026-03-21
**Branch:** feature/coverage-branches-gap
**Tipo:** implement-feature
**Referência:** P2 qualidade — fechar gap de branches de 84%→90%

---

## Progresso Atual

### Cobertura Global

| Métrica    | Antes  | Depois | Meta |
| ---------- | ------ | ------ | ---- |
| Statements | 95.17% | 95.29% | 90%  |
| Branches   | 84%    | 86.37% | 90%  |
| Functions  | 93.15% | 93.15% | 90%  |
| Lines      | 95.26% | 95.29% | 90%  |

### Arquivos com Gap de Branches

| Arquivo          | Antes  | Depois   | Status           |
| ---------------- | ------ | -------- | ---------------- |
| `sparkline.tsx`  | 47.05% | **100%** | ✅ AC-1 completo |
| `PriceTable.tsx` | 76.31% | 76.31%   | 🔄 Em progresso  |
| `market.api.ts`  | 78.94% | 78.94%   | 🔄 Em progresso  |
| `form.hooks.ts`  | 50%    | 50%      | Pendente         |
| `Index.tsx`      | 53.84% | 53.84%   | Pendente         |

---

## Critérios de Aceite

| AC   | Descrição                        | Status               |
| ---- | -------------------------------- | -------------------- |
| AC-1 | sparkline.tsx com 90%+ branches  | ✅ 100%              |
| AC-2 | PriceTable.tsx com 90%+ branches | 🔄 Em progresso      |
| AC-3 | market.api.ts com 90%+ branches  | Pendente             |
| AC-4 | Cobertura global ≥90%            | 🔄 86.37% → meta 90% |

---

## Mudanças Realizadas

### AC-1: sparkline.tsx (✅ Completo)

Arquivo criado: `src/test/sparkline.test.tsx` — 15 testes

Branches cobertos:

- `data` undefined/null/vazio/1 elemento/2+ elementos
- `range = 0` (todos valores iguais)
- Tendência positiva/negativa/neutra
- Cor explícita vs tendência

---

## Próximos Passos

1. AC-2: Adicionar testes para PriceTable.tsx branches
2. AC-3: Adicionar testes para market.api.ts branches
3. AC-4: Verificar cobertura global atingiu 90%
