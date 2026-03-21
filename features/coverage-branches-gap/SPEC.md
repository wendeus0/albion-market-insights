# SPEC — Fechar Gap de Cobertura em Branches

**Status:** Approved
**Data:** 2026-03-21
**Autor:** Claude
**Débito:** P2 — qualidade técnica

---

## Contexto e Motivação

A cobertura de branches do projeto está em ~84%, abaixo da meta de 90%. Os principais contribuidores para o gap são:

| Arquivo                              | Branches |
| ------------------------------------ | -------- |
| `src/components/ui/sparkline.tsx`    | 47.05%   |
| `src/pages/Index.tsx`                | 53.84%   |
| `src/services/dataSource.manager.ts` | 50%      |
| `src/components/ui/form.hooks.ts`    | 50%      |
| `src/components/PriceTable.tsx`      | 76.31%   |
| `src/services/market.api.ts`         | 78.94%   |

Branches não cobertas representam caminhos de erro, validações e casos de borda que podem falhar em produção.

## Problema a Resolver

- Testes não exercitam branches de erro e casos de borda
- Regressões podem passar despercebidas em caminhos não testados
- Gap entre cobertura de statements (~95%) e branches (~84%)

## Fora do Escopo

- Aumentar cobertura de statements (já está em 95%)
- Testar componentes UI externos (shadcn/ui)
- Alterar lógica de produção para facilitar testes

## Critérios de Aceite

### AC-1: sparkline.tsx com 90%+ branches

**Given** que `sparkline.tsx` tem 47% de branch coverage
**When** adicionamos testes para casos de borda
**Then** cobertura de branches deve atingir ≥90%

_Status de retomada (2026-03-21): já concluído em execução anterior._

### AC-2: PriceTable.tsx com 90%+ branches

**Given** que `PriceTable.tsx` tem 76% de branch coverage
**When** adicionamos testes para branches não cobertas
**Then** cobertura de branches deve atingir ≥90%

### AC-3: market.api.ts com 90%+ branches

**Given** que `market.api.ts` tem 78% de branch coverage
**When** adicionamos testes para caminhos de erro e borda
**Then** cobertura de branches deve atingir ≥90%

### AC-4: Cobertura global de branches ≥90%

**Given** que a cobertura global de branches está em ~84%
**When** todos os ACs anteriores forem implementados
**Then** cobertura global de branches deve atingir ≥90%

## Dependências

- Testes existentes nos arquivos citados
- Vitest para execução de testes
- Cobertura atual como baseline

## Riscos e Incertezas

- Alguns branches podem ser de código defensivo difícil de testar
- Componentes UI podem ter branches em bibliotecas externas
- Mocking de APIs pode ser complexo para casos de erro

## Referências

- `npm run test -- --coverage` — relatório atual
- `coverage/` — relatório HTML detalhado
