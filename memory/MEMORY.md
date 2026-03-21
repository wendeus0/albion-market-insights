# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** ✅ Ciclo de 9 janelas concluído e mergeado na `main` (2026-03-20)
**Branch ativa:** `main` — sincronizada com `origin/main`
**Snapshot local:** worktree limpa, baseline estável

**Marcos alcançados:**

- Todas as 9 janelas (Janelas 6-9 da rodada 2026-03-20) concluídas e mergeadas
- Frentes A e B do Contrato de Autonomia v1 concluídas (tier naming + ícones híbridos)
- ✅ **PR #64 MERGEADO**: Lane Node 24 integrada à CI; observação contínua em execução
- Issue #59 (flakiness) em acompanhamento — não bloqueia baseline
- 333 testes passando, build OK

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
| Extração estrutural da PriceTable         | ✅ Fixo | `usePriceTableFilters`, `usePriceTableSort` e `usePriceTablePagination` isolam estado local; 100% cobertura em hooks extraídos                                            |
| CI com lane Node 24 paralela              | ✅ Fixo | Workflow `.github/workflows/quality-gate.yml` com jobs Node 20 (default) e Node 24 (observação); rollback documentado                                                     |

---

## Active fronts

- ✅ **LOTE 1B 100% CONCLUÍDO**: itens 3 e 4 validados e documentados nos PRs #48 e #49
- ✅ **LOTE 2 CONCLUÍDO E MERGEADO**: refatoração estrutural integrada à `main` via PR #51
- ✅ **LOTE 3 (CI/QUALIDADE) CONCLUÍDO**: Janelas 6-9 finalizadas (2026-03-20)
- ✅ **SPRINT CLOSE EXECUTADO**: triagem técnica consolidada, todas as janelas mergeadas
- ✅ **FRENTES A/B CONCLUÍDAS**: Tier naming (PR #67) + Ícones híbridos (PR #68) mergeados
- Baseline estável: 333 testes passando, build OK
- Observação contínua: Node 24 CI lane (aguardando janela de estabilidade), Issue #59 (flakiness)
- **Pronto para**: abertura de nova frente ou consolidação de observação Node 24

---

## Open decisions

- **Promoção Node 24 para default**: job paralelo verde e mergeado; aguardando janela de estabilidade (1-2 semanas) antes de tornar default
- **Deadline Node 24**: 2026-06-02 configurado no dependabot.yml
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update
- **Proteção global da API**: definir arquitetura da camada central (proxy/backend com cache compartilhado + rate limit) para mitigar refresh concorrente entre usuários
- **Estratégia mobile**: frente mantida aberta (PWA e/ou app nativo), aguardando recorte em SPEC
- **Feature futura de temas**: reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada
- **Issue #59 (flakiness)**: decidir se investigação adicional é necessária ou se threshold atual é aceitável

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

1. **Promoção Node 24 para default**: quando janela de estabilidade for atingida (1-2 semanas)
2. **Investigação issue #59**: avaliar se flakiness requer ação ou é aceitável
3. **Frentes C/D do Contrato de Autonomia**: dependem de resolução de issues #65 e #66 (bloqueadas por infraestrutura)
4. **Nova feature**: abrir SPEC para próximo ciclo de desenvolvimento (a definir)
5. **Manutenção preventiva**: pruning de código morto, atualização de dependências

---

## Last handoff summary

**Sessão:** Encerramento 2026-03-21  
**Trabalho realizado:**

- ✅ **VALIDAÇÃO DO ESTADO**: Sessão aberta com `session-open` e `technical-triage`
- ✅ **CONSOLIDAÇÃO**: Todas as 9 janelas da rodada 2026-03-20 confirmadas como concluídas e mergeadas
- ✅ **HANDOFF**: Logs e memória atualizados via `session-logger` e `memory-curator`
- Baseline validada: 333 testes passando, build OK, worktree limpa

**Estado ao encerrar:**

- Branch `main` sincronizada com `origin/main` (commit `0d8209a`)
- Todas as frentes A e B do Contrato de Autonomia v1 concluídas
- ✅ **PR #64 MERGEADO**: Lane Node 24 integrada à CI
- Issue #59 em acompanhamento (flakiness)
- MEMORY.md atualizado com estado consolidado

**Retomar por:**

```
Read before acting:
- `AGENTS.md`
- `memory/MEMORY.md`
- `PENDING_LOG.md`

Current state:
- ✅ Ciclo de 9 janelas concluído e mergeado (2026-03-20)
- ✅ Frentes A/B (tier naming + ícones híbridos) mergeadas
- Baseline: 333 testes, build OK, worktree limpa
- Observação: PR #64 (Node 24), Issue #59 (flakiness)

Recommended next front:
1. 🔍 Aguardar janela de estabilidade Node 24 (1-2 semanas) antes de promoção
2. 🔍 Investigar issue #59 se flakiness impactar CI
3. 📝 Abrir SPEC para próxima feature (a definir com usuário)
4. 🔧 Manutenção preventiva (pruning, updates)
```
