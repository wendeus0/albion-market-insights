# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline estável em `main` — PR #28 mergeado; cobertura elevada para 86.24% statements / 88.02% lines; 205/205 testes passando; hooks de alertas agora com cobertura robusta (>90%)
**Branch ativa:** `feat/alerts-manager-e2e` | Commit: `bdf2924` | Próximo passo: abrir PR para `main`
**Snapshot local relevante:** worktree contém modificações nos logs (`ERROR_LOG.md`, `PENDING_LOG.md`, `memory/MEMORY.md`) e arquivos de coverage gerados automaticamente; logs precisam ser commitados separadamente antes do PR

---

## Stable decisions

| Decisão | Status | Detalhes |
|---------|--------|---------|
| Camada de serviços (`src/services/`) | ✅ Fixo | Interface `MarketService`, implementações `market.api.ts` e `market.mock.ts` |
| Hooks customizados | ✅ Fixo | `useMarketItems`, `useTopProfitable`, `useAlerts`, `useAlertPoller`, `useLastUpdateTime` — testados com >90% cobertura |
| Alert engine + storage | ✅ Fixo | Polling via `alert.engine.ts`, persistência via `alert.storage.ts` (localStorage) |
| shadcn/ui como biblioteca de componentes | ✅ Fixo | 59 componentes em `src/components/ui/` — não editar diretamente |
| Testes E2E com Playwright | ✅ Fixo | 13 testes cobrindo dashboard, navegação e alertas |
| Estrutura de governança Claude | ✅ Fixo | CLAUDE.md com `@AGENTS.md`, `.claude/` com agents, rules e hooks |
| Endpoint de histórico de preços | ✅ Fixo | `/api/v2/stats/history` integrado em `market.api.ts` |
| Sem debug logging em produção | ✅ Fixo | `console.*` removidos de `market.api.ts` e `NotFound.tsx`; testes garantem ausência |
| Timeout da API | ✅ Fixo | 15 segundos — `AbortController` único compartilhado entre todos os batches |
| ITEM_CATALOG como fonte de verdade | ✅ Fixo | `ITEM_IDS` e `ITEM_NAMES` derivados de `ITEM_CATALOG`; 17 categorias, 1.830 IDs únicos (T4-T8 + `@1/@2/@3`) |
| Batch loading com concorrência controlada | ✅ Fixo | `BATCH_SIZE=100`, `HISTORY_CONCURRENCY=3`, `withConcurrency()` exportado para teste unitário |
| Retry com backoff exponencial | ✅ Fixo | `fetchWithRetry` exportado; `RETRY_MAX_ATTEMPTS=3`, `RETRY_BASE_DELAY_MS=500ms`; retry em 429/5xx/network; AbortSignal respeitado |
| Code-splitting por rota | ✅ Fixo | `React.lazy()` + `Suspense` em `src/App.tsx`; `NotFound` estática; bundle 393 kB (era 523 kB) |
| TypeScript strict mode iteração 1 | ✅ Fixo | `noImplicitAny: true` + `strictNullChecks: true` em `tsconfig.app.json` e `tsconfig.json`; ADR-006 criado; sem supressões necessárias |
| Cache de dados de mercado com TTL | ✅ Fixo | `src/services/market.cache.ts`; TTL 5 min (`CACHE_TTL_MS=300_000`); chave `albion_market_cache`; schema Zod valida campos completos de `MarketItem`; `writeCache` silencia `QuotaExceededError`; ADR-007 criado |
| TypeScript strict mode iteração 2 | ✅ Fixo | 4 flags adicionais ativadas em `tsconfig.app.json`: `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`; codebase continua type-safe sem supressões; 106/106 testes |
| TypeScript strict mode iteração 3 | ✅ Fixo | `src/pages/` auditada: 5 arquivos compilam sem erros e sem `@ts-ignore`/`@ts-expect-error`; 6 testes adicionados em `tsconfig.strict.test.ts`; PR #20 mergeado; 112/112 testes |
| TypeScript strict mode iteração 4 | ✅ Fixo | `src/components/` (exceto `ui/`) auditada: 8 arquivos compilam sem erros e sem `@ts-ignore`/`@ts-expect-error`; 9 testes adicionados em `tsconfig.strict.test.ts`; PR #22 mergeado; 121/121 testes; migração gradual COMPLETA |
| Itens encantados no catálogo | ✅ Fixo | PR #24 mergeado; `ENCHANTMENT_LEVELS = [0,1,2,3]`; IDs com `@1/@2/@3`; filtro de encantamento no `PriceTable`; ADR-008 |
| Filtros avançados no `PriceTable` | ✅ Fixo | PR #25 mergeado; min/max preço, min/max spread, botão `Clear All` e contador de filtros ativos |
| Playwright E2E no Arch Linux | ✅ Fixo | Usar `chromium` do sistema (`/usr/bin/chromium`) via `executablePath` condicional em `playwright.config.ts`; build Ubuntu fallback não funciona no Arch; CI Ubuntu continua usando build padrão |

---

## Active fronts

- E2E de AlertsManager concluído em `feat/alerts-manager-e2e`; pronto para PR.
- Cobertura de testes: hooks concluídos (PR #28), E2E concluído; componentes unitários pendentes.
- Frente principal recomendada: elevar cobertura de `PriceTable` (76.61%) e `AlertsManager` (63.46%) para ≥80% via testes unitários.

---

## Open decisions

- **`strict: true` master flag**: migração gradual concluída; decidir se a flag agregada deve substituir a configuração fragmentada atual
- **Persistência de filtros (AC-5)**: decidir se filtros do `PriceTable` devem sobreviver à navegação via `localStorage`
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update

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
- Hooks com estado global (ex: use-toast) precisam de função de reset entre testes — exportar `_resetXxxState()` se necessário
- Mock de TanStack Query: usar `as ReturnType<typeof useHook>` para tipagem em testes de hooks dependentes
- Playwright no Arch Linux: usar `chromium` do sistema; build Ubuntu fallback dos mirrors da Microsoft não funciona; configurar `executablePath` condicional em `playwright.config.ts`
- Testes E2E devem rodar em modo mock (`VITE_USE_REAL_API=false`) para garantir dados determinísticos nos selects e formulários
- Toast notifications geram elementos duplicados no DOM (visual + aria-live); usar `{ exact: true }` ou seletores específicos para evitar strict mode violation

---

## Next recommended steps

1. **Cobertura de componentes** — priorizar `src/components/dashboard/PriceTable.tsx` (76.61%) e `src/components/alerts/AlertsManager.tsx` (63.46%) para ≥80%
2. **Avaliação de `strict: true`** — decidir ativação da flag master agora que todas as camadas já foram auditadas
3. **Hardening de alertas** — validar payload de `localStorage` em `src/services/alert.storage.ts`
4. **UX opcional** — decidir sobre persistência dos filtros do `PriceTable`

---

## Last handoff summary

**Sessão:** 2026-03-18
**Trabalho realizado:**
- Feature `feat/coverage-critical-modules` implementada e mergeada (PR #28)
- 72 novos testes adicionados para hooks de alertas e notificações
- Cobertura elevada: use-toast.ts (91.22%), useAlerts.ts (100%), useAlertPoller.ts (93.75%)
- Cobertura global: 81.81% → 86.24% statements / 83.35% → 88.02% lines
- 205/205 testes passando sem regressões
- Feature `feat/alerts-manager-e2e` desenvolvida e commitada (commit `bdf2924`)
- 4 novos cenários E2E adicionados: criação, persistência, toggle, exclusão de alertas
- Configuração Playwright ajustada para usar `chromium` do sistema no Arch Linux
- Modo mock forçado nos testes E2E para garantir determinismo
- 9/9 testes E2E passando (5 originais + 4 novos)

**Estado ao encerrar:** Branch `feat/alerts-manager-e2e` pronta para PR. Logs atualizados (`ERROR_LOG.md`, `PENDING_LOG.md`, `memory/MEMORY.md`) precisam ser commitados antes de abrir o PR.

**Retomar por:**
```
Read before acting:
- `AGENTS.md`
- `ERROR_LOG.md`
- `PENDING_LOG.md`
- `memory/MEMORY.md`

Current state:
- `main` contém PR #28 com cobertura de hooks completa
- Branch `feat/alerts-manager-e2e` pronta para PR (commit `bdf2924`)
- Cobertura global em 86.24% statements / 88.02% lines (acima de 80%)
- Hooks críticos: use-toast (91%), useAlerts (100%), useAlertPoller (93.75%)
- E2E de AlertsManager: 9/9 cenários passando
- Gaps remanescentes: PriceTable (76.61%), AlertsManager (63.46%) em testes unitários
- 205/205 testes passando

Open points:
- abrir PR para `feat/alerts-manager-e2e` (com 2 commits: E2E + logs)
- elevar cobertura de PriceTable e AlertsManager para ≥80% via testes unitários
- decidir ativação de `strict: true` master flag
- endurecer leitura de alertas persistidos (observação LOW de segurança)
- decidir sobre persistência de filtros do PriceTable

Recommended next front:
- git-flow-manager: commitar logs atualizados e abrir PR para `feat/alerts-manager-e2e`
- ou implement-feature para cobertura de componentes: PriceTable.tsx + AlertsManager.tsx
```
