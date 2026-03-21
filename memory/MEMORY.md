# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** ✅ Sprint 2026-03-20 fechado — baseline estável, pronto para próximo ciclo
**Branch ativa:** `main` — sincronizada com `origin/main` (commit `344741e`)
**Snapshot local:** worktree limpa, nenhuma mudança pendente

**Marcos alcançados:**

- Sprint 2026-03-20 fechado com sucesso (session-close, coverage, debt-tracker, security-audit)
- Todas as 9 janelas (Janelas 6-9) concluídas e mergeadas
- ✅ **PR #72 MERGEADO**: Deduplicação por recência — preferência por registros mais novos
- ✅ **PR #71 MERGEADO**: History by quality — respeita qualidade do item no enriquecimento
- ✅ **PR #70 MERGEADO**: Higienização de componentes vendor — isolamento de exports
- ✅ **PR #64 MERGEADO**: Lane Node 24 integrada à CI; observação contínua
- Frentes A e B do Contrato de Autonomia v1 concluídas (tier naming + ícones híbridos)
- Cobertura: 95.26% linhas, 93.47% statements, 93.09% functions
- 333 testes passando, build OK
- Issue #59 (flakiness) em acompanhamento — não bloqueia baseline

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

- ✅ **SPRINT 2026-03-20 FECHADO**: 9 janelas completas, frentes A/B mergeadas, baseline estável
- ✅ **PR #72, #71, #70 MERGEADOS**: Deduplicação, history-by-quality, higienização de componentes
- ✅ **LOTE 1B, 2, 3 CONCLUÍDOS E MERGEADOS**: documentação, refatoração, CI/qualidade
- ✅ **FRENTES A/B CONCLUÍDAS**: Tier naming (PR #67) + Ícones híbridos (PR #68)
- 🔄 **Observação contínua**:
  - Node 24 CI lane (aguardando janela de 1-2 semanas para promoção)
  - Issue #59 (flakiness) — não bloqueia baseline
- 🎯 **Próximo ciclo**: Abertura de nova feature (a definir com usuário)

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
- Antes de consolidar memória/handoff, validar estado remoto/local com `bash .claude/scripts/git-sync-check.sh` — branch local existente pode já estar mergeada
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

1. **Abrir SPEC para próxima feature**: iniciar ciclo de desenvolvimento (a definir com usuário)
2. **Promoção Node 24 para default**: quando janela de estabilidade for atingida (1-2 semanas)
3. **Investigação issue #59**: avaliar se flakiness requer ação ou é aceitável
4. **Fix P1**: validação defensiva de schema em `alert.storage.ts`
5. **Frentes C/D do Contrato de Autonomia**: dependem de resolução de issues #65 e #66 (bloqueadas por infraestrutura)
6. **Manutenção preventiva**: pruning de código morto, atualização de dependências

---

## Last handoff summary

**Sessão:** Memory Curator — Correção pós-merge 2026-03-21  
**Trabalho realizado:**

- ✅ **ESTADO CORRIGIDO**: Identificado via GitHub que PRs #70, #71, #72 já estavam mergeados na `main`
- ✅ **MEMORY.md ATUALIZADO**: Refletindo merges de deduplicação, history-by-quality e higienização
- ✅ **ACTIVE FRONTS REVISADAS**: Removida referência obsoleta a features já concluídas
- ✅ **HANDOFF CONSOLIDADO**: Prompt de retomada atualizado com estado real do projeto

**Estado ao encerrar:**

- Branch `main` sincronizada com `origin/main` (commit `344741e`)
- ✅ **PR #72 MERGEADO**: Deduplicação por recência
- ✅ **PR #71 MERGEADO**: History by quality
- ✅ **PR #70 MERGEADO**: Higienização de componentes vendor
- Worktree limpa, baseline estável
- 333 testes passando, build OK
- Cobertura: 95.26% linhas, 93.47% statements, 93.09% functions
- Issue #59 (flakiness) em acompanhamento — não bloqueia baseline
- PR #64 (Node 24 lane) mergeado — observação contínua ativa

**Retomar por:**

```
Read before acting:
- `AGENTS.md`
- `memory/MEMORY.md`
- `PENDING_LOG.md`
- `bash .claude/scripts/git-sync-check.sh`
- `SECURITY_AUDIT_REPORT.md` (se tocar auth/CI/infra)

Current state:
- ✅ Sprint fechado — baseline estável, 333 testes OK
- ✅ PRs #70, #71, #72 mergeados (higienização, history-by-quality, deduplicação)
- Cobertura: 95%+ linhas/statements; gap em branches (84%)
- Débito: 1 P1 (validação alert.storage.ts), 4 P2
- Observação: Node 24 (1-2 semanas estabilidade), Issue #59

Recommended next front:
1. 📝 Abrir SPEC para próxima feature (a definir com usuário)
2. 🔧 Fix P1: validação defensiva em `alert.storage.ts`
3. 🔍 Aguardar estabilidade Node 24 para promoção
4. 📊 Fechar gap de cobertura em branches (84% → 90%)
```
