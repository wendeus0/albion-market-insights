# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline estável — PR #20 `feat/typescript-strict-mode-pages` aberto; 112/112 testes passando; lint e build limpos
**Branch ativa:** main | Último PR: `feat/typescript-strict-mode-pages` (#20) — strict mode iteração 3 completa

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
| TypeScript strict mode iteração 1 | ✅ Fixo | `noImplicitAny: true` + `strictNullChecks: true` em `tsconfig.app.json` e `tsconfig.json`; ADR-006 criado; sem supressões necessárias |
| Cache de dados de mercado com TTL | ✅ Fixo | `src/services/market.cache.ts`; TTL 5 min (`CACHE_TTL_MS=300_000`); chave `albion_market_cache`; schema Zod valida campos completos de `MarketItem`; `writeCache` silencia `QuotaExceededError`; ADR-007 criado |
| TypeScript strict mode iteração 2 | ✅ Fixo | 4 flags adicionais ativadas em `tsconfig.app.json`: `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`; codebase continua type-safe sem supressões; 106/106 testes |
| TypeScript strict mode iteração 3 | ✅ Fixo | `src/pages/` auditada: 5 arquivos compilam sem erros e sem `@ts-ignore`/`@ts-expect-error`; 6 testes adicionados em `tsconfig.strict.test.ts`; PR #20 aberto; 112/112 testes |

---

## Active fronts

- `feat/typescript-strict-mode-pages` — PR #20 aberto, aguardando merge. Iteração 3 concluída.

---

## Open decisions

- TypeScript strict mode iteração 4: auditar `src/components/` (exceto `src/components/ui/`) com flags vigentes
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

1. **Merge PR #20** — `feat/typescript-strict-mode-pages` aguardando aprovação
2. **TypeScript strict mode iteração 4** — auditar `src/components/` (exceto `src/components/ui/`) com flags já ativas (ADR-006)
3. **Enchanted items** — avaliar adição de variantes `.@1/.@2/.@3` ao catálogo (DEBT-P2)
4. **Filtros de UI** — revisar gaps de UX no PriceTable (pendência aberta)

---

## Last handoff summary

**Sessão:** 2026-03-17
**Trabalho realizado:**
- `feat/typescript-strict-mode-pages` (iteração 3) — ciclo completo do plano ao PR #20
  - `src/test/tsconfig.strict.test.ts`: 6 testes novos cobrindo AC-1 (compilação limpa via `tsc --noEmit`) e AC-2 (ausência de supressões nos 5 arquivos de página)
  - `src/pages/` confirmada type-safe nativamente — sem supressões necessárias
  - 112/112 testes passando (106 anteriores + 6 novos)
  - Lint 0 erros; build OK; PR #20 aberto
- Logs consolidados: `ERROR_LOG.md`, `PENDING_LOG.md` e `memory/MEMORY.md` atualizados

**Estado ao encerrar:** PR #20 aberto. 112/112 testes. Lint e build OK. Iteração 3 concluída.

**Retomar por:**
```
session-open → implement-feature typescript-strict-mode-components
```
