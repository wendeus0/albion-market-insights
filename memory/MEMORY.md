# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Sprint encerrado com Lote 2 mergeado na `main`, artefatos de fechamento consolidados e baseline preservada
**Branch ativa:** `docs/sprint-close-lote-2` — branch documental criada após o merge do PR #51 para registrar o fechamento do sprint
**Snapshot local:** worktree contém artefatos documentais de fechamento (`ERROR_LOG.md`, `PENDING_LOG.md`, `memory/MEMORY.md`, ADR-010) e artefatos de `coverage/` fora de escopo

---

## Stable decisions

| Decisão                                   | Status  | Detalhes                                                                                                                                                                  |
| ----------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camada de serviços (`src/services/`)      | ✅ Fixo | Interface `MarketService`, implementações `market.api.ts` e `market.mock.ts`                                                                                              |
| Hooks customizados                        | ✅ Fixo | `useMarketItems`, `useTopProfitable`, `useAlerts`, `useAlertPoller`, `useLastUpdateTime` — testados com >90% cobertura                                                    |
| Alert engine + storage                    | ✅ Fixo | Polling via `alert.engine.ts`, persistência via `alert.storage.ts` (localStorage)                                                                                         |
| shadcn/ui como biblioteca de componentes  | ✅ Fixo | 59 componentes em `src/components/ui/` — não editar diretamente                                                                                                           |
| Testes E2E com Playwright                 | ✅ Fixo | 13 testes cobrindo dashboard, navegação e alertas                                                                                                                         |
| Estrutura de governança Claude            | ✅ Fixo | CLAUDE.md com `@AGENTS.md`, `.claude/` com agents, rules e hooks                                                                                                          |
| Endpoint de histórico de preços           | ✅ Fixo | `/api/v2/stats/history` integrado em `market.api.ts`                                                                                                                      |
| Sem debug logging em produção             | ✅ Fixo | `console.*` removidos de `market.api.ts` e `NotFound.tsx`; testes garantem ausência                                                                                       |
| Timeout da API                            | ✅ Fixo | 15 segundos — `AbortController` único compartilhado entre todos os batches                                                                                                |
| ITEM_CATALOG como fonte de verdade        | ✅ Fixo | `ITEM_IDS` e `ITEM_NAMES` derivados de `ITEM_CATALOG`; 17 categorias, 1.830 IDs únicos (T4-T8 + `@1/@2/@3`)                                                               |
| Batch loading com concorrência controlada | ✅ Fixo | `BATCH_SIZE=100`, `HISTORY_CONCURRENCY=3`, `withConcurrency()` exportado para teste unitário                                                                              |
| Retry com backoff exponencial             | ✅ Fixo | `fetchWithRetry` exportado; `RETRY_MAX_ATTEMPTS=3`, `RETRY_BASE_DELAY_MS=500ms`; retry em 429/5xx/network; AbortSignal respeitado                                         |
| Code-splitting por rota                   | ✅ Fixo | `React.lazy()` + `Suspense` em `src/App.tsx`; `NotFound` estática; bundle 393 kB (era 523 kB)                                                                             |
| TypeScript strict mode                    | ✅ Fixo | `strict: true` ativado em `tsconfig.json` e `tsconfig.app.json`; ADR-006 atualizado; 215/215 testes; codebase 100% type-safe                                              |
| Cache de dados de mercado com TTL         | ✅ Fixo | `src/services/market.cache.ts`; TTL 15 min alinhado à política única de frescor (`DATA_FRESHNESS_MS`); schema Zod valida campos completos de `MarketItem`; ADR-007 criado |
| Itens encantados no catálogo              | ✅ Fixo | `ENCHANTMENT_LEVELS = [0,1,2,3]`; IDs com `@1/@2/@3`; filtro de encantamento no `PriceTable`; ADR-008                                                                     |
| Filtros avançados no `PriceTable`         | ✅ Fixo | min/max preço, min/max spread, botão `Clear All`, contador de filtros ativos; persistência via `filter.storage.ts` (localStorage)                                         |
| Playwright E2E no Arch Linux              | ✅ Fixo | Usar `chromium` do sistema (`/usr/bin/chromium`) via `executablePath` condicional em `playwright.config.ts`                                                               |
| Quality Gate no CI                        | ✅ Fixo | Workflow `.github/workflows/quality-gate.yml` com lint → test --coverage → build; npm 10.8.2 padronizado via `packageManager` em `package.json`                           |
| Persistência de filtros                   | ✅ Fixo | `filter.storage.ts` serviço dedicado; validação defensiva; 10 testes; AC-5 do SPEC enhanced-ui-filters completo                                                           |
| Artefato `dist/`                          | ✅ Fixo | Política confirmada: manter `dist/` ignorado no Git; gerar/publicar somente via build local/CI                                                                            |
| AlertsManager modularizado                | ✅ Fixo | PR #42 mergeado; regras separadas em `useAlertsForm`, `useAlertsFeedback` e `useAlertsUI`; `AlertsManager.tsx` reduzido e com responsabilidades isoladas                  |
| Quality Gate restaurado                   | ✅ Fixo | PR #43 mergeado; mocks de `@/data/constants` em testes de API corrigidos via mock parcial com `importOriginal`; CI voltou a ficar verde                                   |
| Layout compartilhado por rota             | ✅ Fixo | `AppLayout` centraliza `Layout` para `Index`, `Dashboard`, `Alerts` e `About`; páginas renderizam apenas conteúdo de rota                                                 |
| Extração estrutural da PriceTable         | ✅ Fixo | `usePriceTableFilters`, `usePriceTableSort` e `usePriceTablePagination` isolam estado local; `PriceTable.tsx` permanece acima de 80% de cobertura                         |

---

## Active fronts

- ✅ **LOTE 1B 100% CONCLUÍDO**: itens 3 e 4 validados e documentados nos PRs #48 e #49
- ✅ **LOTE 2 CONCLUÍDO E MERGEADO**: refatoração estrutural integrada à `main` via PR #51
- Baseline validada localmente com `quality:gate` e `280/280` testes passando no fechamento do sprint
- Próxima frente sugerida após merge: Lote 3 (qualidade, CI e documentação) ou mitigação dos gaps de cobertura do sprint

---

## Open decisions

- **Upgrade de actions para Node 24** (2026-06-02): deadline configurado no dependabot.yml; avaliar quando próximo da data
- **Avaliação futura de `node-version: 24`**: medir impacto real em `npm ci`, testes com cobertura, build, uso de memória e compatibilidade antes de trocar o runtime do job do projeto
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update
- **Proteção global da API**: definir arquitetura da camada central (proxy/backend com cache compartilhado + rate limit) para mitigar refresh concorrente entre usuários
- **Estratégia mobile**: frente mantida aberta (PWA e/ou app nativo), aguardando recorte em SPEC
- **Feature futura de temas**: reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada
- **Cobertura dos hooks extraídos no sprint**: decidir se `usePriceTablePagination.ts` precisa de reforço imediato antes do próximo lote funcional

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
- `vi.mock(...)` deve estar no top-level do módulo de teste — quando aninhado em blocos, é hoistado silenciosamente mas gera warning
- Mocks parciais de `@/data/constants` devem preservar exports reais com `importOriginal`/`vi.importActual`; omitir novos exports como `DATA_FRESHNESS_MS` derruba imports em cascata nos testes de `market.api`
- Não sobrescrever `DATA_FRESHNESS_MS`/`CACHE_TTL_MS` em testes sem necessidade; mock contraditório de TTL gerou falha no PR #42 após o merge do fix do `Quality Gate`
- Hooks com estado global (ex: use-toast) precisam de função de reset entre testes — exportar `_resetXxxState()` se necessário
- Mock de TanStack Query: usar `as ReturnType<typeof useHook>` para tipagem em testes de hooks dependentes
- Playwright no Arch Linux: usar `chromium` do sistema; build Ubuntu fallback dos mirrors da Microsoft não funciona
- Testes E2E devem rodar em modo mock (`VITE_USE_REAL_API=false`) para garantir dados determinísticos
- Toast notifications geram elementos duplicados no DOM (visual + aria-live); usar `{ exact: true }` ou seletores específicos
- Flag `shouldPersist` necessária para controlar race condition entre `setState` e `useEffect` de persistência no Clear All
- Cooldown de refresh no cliente não protege limite global da API; sem proxy central, múltiplos usuários ainda podem saturar upstream
- Não versionar `dist/`; manter artefatos de build fora do controle de versão
- Não incluir artefatos de `coverage/` em commits/PRs; eles continuam sujando a worktree após `quality:gate`

---

## Next recommended steps

1. **Publicar os artefatos de fechamento do sprint** em uma PR documental limpa
2. **Abrir a próxima frente técnica mais barata**: reforçar cobertura em `usePriceTablePagination.ts`, `Dashboard.tsx` e `ArbitrageTable.tsx`
3. **Planejar o Lote 3** (qualidade, CI e documentação), priorizando `typecheck` explícito no `quality:gate`
4. **Atualizar workflow para actions compatíveis com Node 24** antes da depreciação de 2026-06-02

---

## Last handoff summary

**Sessão:** 2026-03-20 (sprint-close)
**Trabalho realizado:**

- ✅ **LOTE 2 IMPLEMENTADO**: `PriceTable` modularizada em hooks e `Layout` compartilhado por rota
- ✅ `quality:gate` validado no fim do sprint com `280/280` testes
- ✅ PR #51 mergeado na `main` a partir do commit `188c146`
- ✅ ADR-010 criado para registrar a convenção estrutural do sprint
- ✅ Logs de sessão e memória consolidados

**Estado ao encerrar:**

- `origin/main` já contém o Lote 2 mergeado
- branch documental `docs/sprint-close-lote-2` preparada para registrar o fechamento do sprint
- Cobertura global do sprint em 89.22% statements; `PriceTable.tsx` em 83.33%
- Worktree local suja apenas por artefatos de cobertura

**Retomar por:**

```
Read before acting:
- `AGENTS.md`
- `memory/MEMORY.md`
- `PENDING_LOG.md`

Current state:
- ✅ LOTE 1B concluído
- ✅ LOTE 2 implementado e mergeado na `main`
- Baseline validada localmente: `quality:gate` verde, `280/280` testes

Recommended next front:
1. 📦 Publicar os artefatos de fechamento do sprint
2. 🧪 Atacar os gaps de cobertura mais baratos: `usePriceTablePagination.ts`, `Dashboard.tsx`, `ArbitrageTable.tsx`
3. 🚀 Planejar o Lote 3 com foco em `typecheck` explícito no `quality:gate`
4. Alternativa: preparar a migração de actions para Node 24
```
