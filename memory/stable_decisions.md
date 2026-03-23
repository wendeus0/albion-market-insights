---
name: stable_decisions
description: Decisões arquiteturais e operacionais consolidadas do projeto — não reverter sem ADR
type: project
---

## Stable decisions

| Decisão                                   | Status  | Detalhes                                                                                                                                                                  |
| ----------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camada de serviços (`src/services/`)      | Fixo | Interface `MarketService`, implementações `market.api.ts` e `market.mock.ts`                                                                                              |
| Hooks customizados                        | Fixo | `useMarketItems`, `useTopProfitable`, `useAlerts`, `useAlertPoller`, `useLastUpdateTime` — testados com >90% cobertura                                                    |
| Alert engine + storage                    | Fixo | Polling via `alert.engine.ts`, persistência via `alert.storage.ts` (localStorage)                                                                                         |
| shadcn/ui como biblioteca de componentes  | Fixo | 59 componentes em `src/components/ui/` — não editar diretamente                                                                                                           |
| Testes E2E com Playwright                 | Fixo | 13 testes cobrindo dashboard, navegação e alertas                                                                                                                         |
| Estrutura de governança Claude            | Fixo | CLAUDE.md com `@AGENTS.md`, `.claude/` com agents, rules e hooks                                                                                                          |
| Endpoint de histórico de preços           | Fixo | `/api/v2/stats/history` integrado em `market.api.ts`                                                                                                                      |
| Sem debug logging em produção             | Fixo | `console.*` removidos de `market.api.ts` e `NotFound.tsx`; testes garantem ausência                                                                                       |
| Timeout da API                            | Fixo | 15 segundos — `AbortController` único compartilhado entre todos os batches                                                                                                |
| ITEM_CATALOG como fonte de verdade        | Fixo | `ITEM_IDS` e `ITEM_NAMES` derivados de `ITEM_CATALOG`; 17 categorias, 1.830 IDs únicos (T4-T8 + `@1/@2/@3`)                                                               |
| Batch loading com concorrência controlada | Fixo | `BATCH_SIZE=100`, `HISTORY_CONCURRENCY=3`, `withConcurrency()` exportado para teste unitário                                                                              |
| Retry com backoff exponencial             | Fixo | `fetchWithRetry` exportado; `RETRY_MAX_ATTEMPTS=3`, `RETRY_BASE_DELAY_MS=500ms`; retry em 429/5xx/network; AbortSignal respeitado                                         |
| Code-splitting por rota                   | Fixo | `React.lazy()` + `Suspense` em `src/App.tsx`; `NotFound` estática; bundle 393 kB (era 523 kB)                                                                             |
| TypeScript strict mode                    | Fixo | `strict: true` ativado em `tsconfig.json` e `tsconfig.app.json`; ADR-006 atualizado; 215/215 testes; codebase 100% type-safe                                              |
| Cache de dados de mercado com TTL         | Fixo | `src/services/market.cache.ts`; TTL 15 min alinhado à política única de frescor (`DATA_FRESHNESS_MS`); schema Zod valida campos completos de `MarketItem`; ADR-007 criado |
| Itens encantados no catálogo              | Fixo | `ENCHANTMENT_LEVELS = [0,1,2,3]`; IDs com `@1/@2/@3`; filtro de encantamento no `PriceTable`; ADR-008                                                                     |
| Filtros avançados no `PriceTable`         | Fixo | min/max preço, min/max spread, botão `Clear All`, contador de filtros ativos; persistência via `filter.storage.ts` (localStorage)                                         |
| Playwright E2E no Arch Linux              | Fixo | Usar `chromium` do sistema (`/usr/bin/chromium`) via `executablePath` condicional em `playwright.config.ts`                                                               |
| Quality Gate no CI                        | Fixo | Workflow `.github/workflows/quality-gate.yml` com lint → test --coverage → build; npm 10.8.2 padronizado via `packageManager` em `package.json`                           |
| Persistência de filtros                   | Fixo | `filter.storage.ts` serviço dedicado; validação defensiva; 10 testes; AC-5 do SPEC enhanced-ui-filters completo                                                           |
| Artefato `dist/`                          | Fixo | Política confirmada: manter `dist/` ignorado no Git; gerar/publicar somente via build local/CI                                                                            |
| AlertsManager modularizado                | Fixo | PR #42 mergeado; regras separadas em `useAlertsForm`, `useAlertsF eedback` e `useAlertsUI`; `AlertsManager.tsx` reduzido e com responsabilidades isoladas                  |
| Quality Gate restaurado                   | Fixo | PR #43 mergeado; mocks de `@/data/constants` em testes de API corrigidos via mock parcial com `importOriginal`; CI voltou a ficar verde                                   |
| Layout compartilhado por rota             | Fixo | `AppLayout` centraliza `Layout` para `Index`, `Dashboard`, `Alerts` e `About`; páginas renderizam apenas conteúdo de rota                                                 |
| Extração estrutural da PriceTable         | Fixo | `usePriceTableFilters`, `usePriceTableSort` e `usePriceTablePagination` isolam estado local; 100% cobertura em hooks extraídos                                            |
| CI com lane Node 24 paralela              | Fixo | Workflow `.github/workflows/quality-gate.yml` com jobs Node 20 (default) e Node 24 (observação); rollback documentado                                                     |
| Cloudflare Worker como proxy de API       | Fixo | `worker/src/index.ts`; Cache API (TTL 5min), deduplicação via Map<string, Promise>, rate limit 30 req/min por IP, fallback stale; feature flag `VITE_USE_PROXY`; ADR-013 |
| Deploy automático do Worker               | Fixo | Workflow `.github/workflows/deploy-worker.yml`; dispara em push para `main` com paths `worker/**`; requer secret `CLOUDFLARE_API_TOKEN`                                   |
