# REPORT — Cobertura de Branches

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-21
**Branch:** feat/coverage-branches-gap-ac2-ac4
**Tipo:** implement-feature
**Referência:** P2 qualidade — fechar gap de branches de 84%→90%

---

## Objetivo

Retomar a frente `coverage-branches-gap` para concluir AC-2, AC-3 e AC-4, elevando cobertura de branches nos módulos críticos e ultrapassando 90% global.

## Resultado

| Métrica      |      Antes |     Depois |    Meta |
| ------------ | ---------: | ---------: | ------: |
| Statements   |     94.07% |     95.83% |     90% |
| **Branches** | **86.71%** | **90.28%** | **90%** |
| Functions    |     94.04% |     94.64% |     90% |
| Lines        |     95.70% |     96.92% |     90% |

## Critérios de Aceite

| AC   | Descrição                          | Status                   | Evidência       |
| ---- | ---------------------------------- | ------------------------ | --------------- |
| AC-1 | `sparkline.tsx` com 90%+ branches  | ✅ Concluído previamente | 100% mantido    |
| AC-2 | `PriceTable.tsx` com 90%+ branches | ✅ Concluído             | 76.31% → 100%   |
| AC-3 | `market.api.ts` com 90%+ branches  | ✅ Concluído             | 78.94% → 94.73% |
| AC-4 | Cobertura global de branches ≥90%  | ✅ Concluído             | 86.71% → 90.28% |

## Mudanças Aplicadas

- `features/coverage-branches-gap/SPEC.md`
  - status promovido para `Approved`
  - anotação de retomada para AC-1 já concluído
- `src/test/PriceTable.test.tsx`
  - novos cenários para branching de `formatTime` (minutos/horas)
  - teste de ordenação por cidade
  - teste de feedback de faixa inválida de spread
  - teste de variação de cor para `spreadPercent` médio/baixo
- `src/test/market.api.dedup.test.ts`
  - cenários adicionais de deduplicação por recência/completude/confiança
  - cenário com timestamps inválidos (caminho `parseTimestamp` defensivo)
  - cenário de descarte de registros inválidos em parse
  - cenário para retorno imediato de histórico com arrays vazios
- `src/test/market.api.test.ts`
  - limpeza de cache (`localStorage`) por teste para evitar bypass de fluxo
  - cenário de `getLastUpdateTime()` antes de fetch bem-sucedido
  - cenário de fallback desabilitado com estado degradado

## Validações Executadas

```bash
npx vitest run src/test/PriceTable.test.tsx src/test/market.api.dedup.test.ts src/test/market.api.test.ts
npm run test -- --coverage
npm run quality:gate
```

- `quality:gate`: PASS
- `lint`: PASS
- `typecheck`: PASS
- `test`: 394/394 PASS
- `build`: PASS

## Code Review

- Veredito: `REVIEW_OK`
- Sem blockers de lógica, escopo ou convenções para a frente atual

## Security Review

- `security-review` **não acionada** (skip justificado)
- Motivo: alteração restrita a testes + documentação de SPEC/REPORT; sem mudanças em CI/CD, auth/secrets, infraestrutura, API pública ou automações

## Riscos Residuais

- Nenhum risco funcional novo identificado (mudanças sem impacto em runtime de produção)
