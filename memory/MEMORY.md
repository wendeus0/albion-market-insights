# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline estável — PR #13 mergeado; 81/81 testes passando; lint e build limpos
**Branch ativa:** main | Último PR: `feat/code-splitting` (#13) — code-splitting por rota
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
| Code-splitting por rota | ✅ Fixo | `React.lazy()` + `Suspense` em `src/App.tsx`; `NotFound` estática; bundle 393 kB (era 523 kB) |

---

## Active fronts

- **TypeScript strict mode:** desativado (`noImplicitAny: false`, `strictNullChecks: false`) — único P0 restante; migração gradual pendente iniciando por `src/services/`

---

## Open decisions

- Migração TypeScript strict mode: escopo exato da primeira iteração (apenas `src/services/` ou incluir `src/hooks/`?)
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
- `window.matchMedia` não existe no jsdom — mockar em testes que renderizam `App` (Sonner usa essa API)

---

## Next recommended steps

1. **TypeScript strict mode** — migração gradual iniciando por `src/services/` (único DEBT-P0 restante)
2. **Cache com TTL** — localStorage para dados de preços (DEBT-P1-002); reduz chamadas à API
3. **Enchanted items** — avaliar adição de variantes `.@1/.@2/.@3` ao catálogo (P2)

---

## Last handoff summary

**Sessão:** 2026-03-16
**Trabalho realizado:**
- `feat/code-splitting` completo do plano ao PR #13 mergeado
  - `src/App.tsx`: imports de `Index`, `Dashboard`, `Alerts`, `About` convertidos para `React.lazy()` + `Suspense` com `role="status"` no fallback; `NotFound` mantida estática
  - `src/test/App.test.tsx`: 2 testes — AC-2 (Suspense fallback, RED→GREEN) e AC-3 (NotFound estático)
  - Bundle principal: 523 kB → 393 kB (~25% de redução); 4 chunks de rota separados
  - 81/81 testes passando; lint 0 erros; build limpo
- Sessão sem erros — único ajuste: mock de `window.matchMedia` para jsdom em testes de App

**Estado ao encerrar:** Baseline limpa. 81/81 testes. Lint e build OK. Sem feature ativa. DEBT-P1-004 encerrado. Único P0 restante: TypeScript strict mode.

**Retomar por:**
```
session-open → implement-feature typescript-strict-mode
```
