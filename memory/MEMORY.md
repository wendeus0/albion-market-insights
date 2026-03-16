# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline estável — PR feat/cache-ttl-localstorage mergeado; 102/102 testes passando; lint e build limpos
**Branch ativa:** main | Último PR: `feat/cache-ttl-localstorage` (#17) — cache de dados de mercado com TTL em localStorage (fecha DEBT-P1-002)

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
| TypeScript strict mode (iteração 1) | ✅ Fixo | `noImplicitAny: true` + `strictNullChecks: true` em `tsconfig.app.json` e `tsconfig.json`; ADR-006 criado; sem supressões necessárias |
| Cache de dados de mercado com TTL | ✅ Fixo | `src/services/market.cache.ts`; TTL 5 min (`CACHE_TTL_MS=300_000`); chave `albion_market_cache`; schema Zod valida campos completos de `MarketItem`; `writeCache` silencia `QuotaExceededError`; ADR-007 criado |

---

## Active fronts

- Nenhuma frente ativa no momento. Baseline limpa, sem feature em andamento.

---

## Open decisions

- Migração TypeScript strict mode iteração 2: escopo de `src/hooks/` com `noImplicitAny` + `strictNullChecks` já ativos (ver ADR-006)
- Enchanted items (`.@1`, `.@2`, `.@3`): avaliar adição ao catálogo em feature futura
- Filtros de UI adicionais: revisar gaps de UX remanescentes no PriceTable além de Tier e Cidade

---

## Recurrent pitfalls

- Componentes `src/components/ui/` não devem ser editados diretamente — quebra atualizações do shadcn/ui
- API do Albion Online não requer autenticação, mas tem rate limiting — `fetchWithRetry` mitiga isso
- `VITE_USE_REAL_API` deve ser `'true'` (string), não booleano — default é modo mock
- Imports relativos `../` ou `./` são proibidos — usar path alias `@/*` (inclui imports dentro de `src/services/`)
- Timeout da API é 15s — testes de timer devem avançar ao menos 15001ms para disparar abort
- `AbortController` deve ser único e compartilhado entre todos os batches — múltiplos controllers causam hang em testes com fake timers
- Deduplicação por `${item_id}|${city}|${quality}` é obrigatória ao consolidar resultados de múltiplos batches
- Testes com `fetchWithRetry`: usar `const assertion = expect(promise).rejects...; await vi.runAllTimersAsync(); await assertion` — handler ANTES dos timers para evitar `PromiseRejectionHandledWarning`
- Quando um PR for mergeado, criar nova branch a partir de `origin/main` — não continuar na branch antiga que divergiu
- `window.matchMedia` não existe no jsdom — mockar em testes que renderizam `App` (Sonner usa essa API)
- `vi.stubGlobal('fetch', vi.fn())` retorna o objeto `globalThis`, não o spy — usar `globalThis.fetch as ReturnType<typeof vi.fn>` para assertions
- `vi.mock(...)` deve estar no top-level do módulo de teste — quando aninhado em blocos, é hoistado silenciosamente mas gera warning (será erro em versão futura do Vitest)

---

## Next recommended steps

1. **TypeScript strict mode iteração 2** — avaliar `src/hooks/` com `noImplicitAny` + `strictNullChecks` já ativos (ADR-006)
2. **Enchanted items** — avaliar adição de variantes `.@1/.@2/.@3` ao catálogo (DEBT-P2)
3. **Filtros de UI** — revisar gaps de UX no PriceTable (pendência aberta)

---

## Last handoff summary

**Sessão:** 2026-03-16
**Trabalho realizado:**
- `feat/cache-ttl-localstorage` completo do plano ao PR #17 mergeado
  - `src/services/market.cache.ts`: `readCache`, `writeCache`, `isCacheValid`; TTL 5 min; schema Zod com validação completa dos campos de `MarketItem`; `QuotaExceededError` silenciado
  - `src/services/market.api.ts`: integração do cache em `getItems()` e `getLastUpdateTime()`; import via `@/services/market.cache`
  - `src/test/market.cache.test.ts`: 17 testes cobrindo AC-1 a AC-5 + 3 testes de integração com `ApiMarketService`
  - `docs/adr/ADR-007-market-data-cache-ttl-localstorage.md`: registra trade-offs de TTL, storage e degradação graciosa
  - Erros menores resolvidos: `vi.stubGlobal` retorna globalThis (não spy), `vi.mock` deve ser top-level, import relativo corrigido para `@/*`
  - 102/102 testes passando; lint 0 erros; build OK

**Estado ao encerrar:** Baseline limpa. 102/102 testes. Lint e build OK. Sem feature ativa. DEBTs-P0 e P1-001, P1-002, P1-004 fechados.

**Retomar por:**
```
session-open → implement-feature typescript-strict-mode-hooks
```
