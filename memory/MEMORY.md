# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline estável — PR #11 mergeado; 79/79 testes passando; lint e build limpos
**Branch ativa:** main | Último PR: `feat/backoff-exponencial` (#11) — retry com backoff exponencial
**ANALYSIS_REPORT.md:** gerado em 2026-03-16 — 11 débitos classificados (3×P0, 4×P1, 4×P2)

---

## Stable decisions

| Decisão | Status | Detalhes |
|---------|--------|---------|
| Camada de serviços (`src/services/`) | ✅ Fixo | Interface `MarketService`, implementações `market.api.ts` e `market.mock.ts` |
| Hooks customizados | ✅ Fixo | `useMarketItems`, `useTopProfitable`, `useAlerts`, `useAlertPoller`, `useLastUpdateTime` |
| Alert engine + storage | ✅ Fixo | Polling via `alert.engine.ts`, persistência via `alert.storage.ts` (localStorage) |
| shadcn/ui como biblioteca de componentes | ✅ Fixo | 59 componentes em `src/components/ui/` — não editar diretamente |
| Testes E2E com Playwright | ✅ Fixo | 13 testes cobrindo dashboard, navegação e alertas |
| Estrutura de governança Claude | ✅ Fixo | CLAUDE.md com `@AGENTS.md`, `.claude/` com agents, rules e hooks |
| Endpoint de histórico de preços | ✅ Fixo | `/api/v2/stats/history` integrado em `market.api.ts` |
| Sem debug logging em produção | ✅ Fixo | `console.*` removidos de `market.api.ts` e `NotFound.tsx`; testes garantem ausência |
| Timeout da API | ✅ Fixo | 15 segundos — `AbortController` único compartilhado entre todos os batches |
| ITEM_CATALOG como fonte de verdade | ✅ Fixo | `ITEM_IDS` e `ITEM_NAMES` derivados de `ITEM_CATALOG`; 17 categorias, 450 IDs únicos (T4-T8) |
| Batch loading com concorrência controlada | ✅ Fixo | `BATCH_SIZE=100`, `HISTORY_CONCURRENCY=3`, `withConcurrency()` exportado para teste unitário |
| Retry com backoff exponencial | ✅ Fixo | `fetchWithRetry` exportado; `RETRY_MAX_ATTEMPTS=3`, `RETRY_BASE_DELAY_MS=500ms`; retry em 429/5xx/network; AbortSignal respeitado |

---

## Active fronts

- **TypeScript strict mode:** desativado (`noImplicitAny: false`, `strictNullChecks: false`) — migração gradual pendente; recomendação: começar por `src/services/`
- **Bundle size:** ~520KB minificado — code-splitting por rota pendente (DEBT-P1-004)

---

## Open decisions

- Migração TypeScript strict mode: quando e em qual escopo iniciar
- Enchanted items (`.@1`, `.@2`, `.@3`): avaliar adição ao catálogo em feature futura

---

## Recurrent pitfalls

- Componentes `src/components/ui/` não devem ser editados diretamente — quebra atualizações do shadcn/ui
- API do Albion Online não requer autenticação, mas tem rate limiting — `fetchWithRetry` agora mitiga isso
- `VITE_USE_REAL_API` deve ser `'true'` (string), não booleano — default é modo mock
- Imports relativos `../` são proibidos — usar path alias `@/*`
- Timeout da API é 15s — testes de timer devem avançar ao menos 15001ms para disparar abort
- `AbortController` deve ser único e compartilhado entre todos os batches — múltiplos controllers causam hang em testes com fake timers
- Deduplicação por `${item_id}|${city}|${quality}` é obrigatória ao consolidar resultados de múltiplos batches
- Testes com `fetchWithRetry`: usar `const assertion = expect(promise).rejects...; await vi.runAllTimersAsync(); await assertion` — handler ANTES dos timers para evitar `PromiseRejectionHandledWarning`
- Quando um PR for mergeado, criar nova branch a partir de `origin/main` — não continuar na branch antiga que divergiu

---

## Next recommended steps

1. **Code-splitting** — `React.lazy()` nas rotas para reduzir bundle de 520KB (DEBT-P1-004)
2. **TypeScript strict mode** — migração gradual iniciando por `src/services/` (DEBT-P0)
3. **Cache com TTL** — localStorage para dados de preços (DEBT-P1-002); reduz chamadas à API
4. **Enchanted items** — avaliar adição de variantes `.@1/.@2/.@3` ao catálogo

---

## Last handoff summary

**Sessão:** 2026-03-16
**Trabalho realizado:**
- `feat/backoff-exponencial` completo do plano ao PR #11 mergeado
  - `market.api.ts`: `fetchWithRetry` exportado + `RETRY_MAX_ATTEMPTS=3` + `RETRY_BASE_DELAY_MS=500`; `fetchPricesBatch` e `fetchHistoryBatch` delegam para ela
  - `src/test/market.api.retry.test.ts`: 14 novos testes cobrindo AC-1 a AC-5
  - `src/test/market.api.test.ts`: 4 testes existentes corrigidos com fake timers para compatibilidade com retry
  - 79/79 testes passando; lint 0 erros; build limpo
- Branch criada a partir de `origin/main` após detectar que `feat/catalog-expansion` havia divergido por merge do PR #10

**Estado ao encerrar:** Baseline limpa. 79/79 testes. Lint e build OK. Sem feature ativa. DEBT-P1-001 encerrado.

**Retomar por:**
```
session-open → technical-triage → próxima feature (code-splitting ou strict mode)
```
