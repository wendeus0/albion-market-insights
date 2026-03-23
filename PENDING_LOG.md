# PENDING_LOG.md — Albion Market Insights

<!-- Atualizado por: session-logger | Não editar manualmente durante sessão ativa -->

## Decisões incorporadas

- **Frentes D + A (hardening de testes + governança Node 24)** (2026-03-23) ✅ **CONCLUÍDO**
  - Hardening de suíte de testes:
    - `src/test/setup.ts`: mock de localStorage ajustado com `length` dinâmico e retorno nullish-safe (`??`) para reduzir acoplamento temporal em assertions
    - `src/hooks/useAlerts.test.tsx`: assert estabilizado para contrato final (`data=[]` e sem erro), reduzindo flake em execução full-suite
  - Governança Node 24:
    - Runbook criado em `docs/architecture/NODE24_PROMOTION_RUNBOOK.md` com gates objetivos de promoção e rollback imediato
    - Referências ao runbook adicionadas em:
      - `README.md`
      - `CONTEXT.md`
      - `memory/active_fronts.md`
  - Quality gate validado após mudanças:
    - `401/401` testes passando
    - `lint`, `typecheck` e `build` verdes
  - Issue atualizada:
    - #60 (Node 24 migration tracking) com progresso e próximos gates operacionais

- **Estabilização autônoma da suíte de hooks (`useAlerts`)** (2026-03-23) ✅ **CONCLUÍDO**
  - Falha intermitente identificada no teste `src/hooks/useAlerts.test.tsx` durante execução completa da suíte (`isSuccess` podia não refletir estado final no timing esperado)
  - Ajuste aplicado no teste para assert orientado ao contrato de saída (`data=[]` e ausência de erro), com `waitFor` defensivo e timeout explícito
  - Arquivos alterados:
    - `src/hooks/useAlerts.test.tsx`
    - `src/test/setup.ts` (localStorage mock com `length` dinâmico + nullish-safe)
  - Quality gate validado após mudança:
    - `401/401` testes passando
    - `lint`, `typecheck` e `build` verdes
  - Obstáculos de execução:
    - nenhum bloqueio estrutural encontrado nesta frente

- **Higiene de componentes vendor UI — round 2** (2026-03-23) ✅ **CONCLUÍDO EM BRANCH `feat/higiene-vendor-ui-round-2`**
  - SPEC criada em `features/higiene-vendor-ui-round-2/SPEC.md`
  - Mapa de uso gerado em `features/higiene-vendor-ui-round-2/COMPONENTS_USAGE.md` (+ `COMPONENTS_USAGE_RAW.json`)
  - TDD aplicado para contrato de toast Sonner:
    - RED: novo teste `src/test/ui.sonner.contract.test.ts` falhando (toast não reexportado no boundary interno)
    - GREEN: boundary explícito criado em `src/components/ui/sonnerToast.ts`
    - REFACTOR: removido arquivo não usado `src/components/ui/sonner.utils.ts`
  - Resultado de pruning incremental:
    - `src/components/ui`: 19 -> 18 arquivos rastreados na pasta (-1 arquivo, -5.26%)
    - removido apenas utilitário de baixo risco sem import direto
  - Quality gate validado após mudanças:
    - `401/401` testes passando
    - Coverage: `95.95% statements`, `90.42% branches`
    - `lint`, `typecheck` e `build` verdes

- **Melhorias autônomas de estabilidade de testes e roteamento v7** (2026-03-23) ✅ **CONCLUÍDO**
  - `DataSourceBadge` ajustado para evitar warning de `ref` no Radix Slot (`TooltipTrigger asChild`) encapsulando `Badge` em wrapper `span.inline-flex`
  - Opt-in explícito de future flags do React Router v7 no app e testes:
    - `v7_startTransition: true`
    - `v7_relativeSplatPath: true`
  - `App.tsx` alinhado ao padrão de imports com alias `@/` (NotFound + lazy pages)
  - Arquivos alterados:
    - `src/components/dashboard/DataSourceBadge.tsx`
    - `src/App.tsx`
    - `src/components/layout/AppLayout.test.tsx`
    - `src/components/layout/Navbar.test.tsx`
    - `src/pages/Dashboard.test.tsx`
    - `src/test/NotFound.test.tsx`
  - Quality gate validado após mudanças:
    - `399/399` testes passando
    - Coverage: `95.83% statements`, `90.38% branches`
    - `lint`, `typecheck` e `build` verdes
  - Obstáculo registrado em issue para próxima frente:
    - #84 warning remanescente de `act(...)` em teste de Suspense/lazy (`src/test/App.test.tsx`) — https://github.com/wendeus0/albion-market-insights/issues/84
  - Follow-up concluído: warning de `act(...)` em `src/test/App.test.tsx` eliminado com flush assíncrono em `act`, issue #84 comentada e fechada

- **[RESOLVIDO] Cloudflare Pages dashboard com VITE_USE_REAL_API=false** (2026-03-23) ✅ **CONCLUÍDO**
  - Variável corrigida para `true` no dashboard do Pages + redeploy executado pelo usuário
  - Dashboard em produção agora exibe dados reais via Worker proxy

- **Auto-refresh no Dashboard com remoção do refresh manual** (2026-03-23) ✅ **CONCLUÍDO**
  - SPEC criada: `features/auto-refresh-dashboard/SPEC.md`
  - Botão manual de refresh removido do header do Dashboard
  - Auto-refresh configurado em `useMarketItems` e `useLastUpdateTime` com `refetchInterval=DATA_FRESHNESS_MS` (15 min)
  - Indicador textual de recência adicionado ao lado do `DataSourceBadge`:
    - `Syncing...`
    - `Awaiting first sync`
    - `Updated just now`
    - `Updated X min ago`
    - `Updated Xh ago`
  - Hook `useLastUpdateTime` expandido para aceitar opções (`refetchInterval`)
  - Quality gate validado após mudanças:
    - `400/400` testes passando
    - Coverage: `95.95% statements`, `90.42% branches`
    - `lint`, `typecheck` e `build` verdes

- **Deploy frontend Cloudflare Pages + correção env vars** (2026-03-23) ✅ **PRs #81 e #82 MERGEADOS**
  - PR #81: `.env` commitado com `VITE_USE_PROXY=true` e `VITE_PROXY_URL=https://albion-market-proxy.wendel-gdsilva.workers.dev`
  - PR #82: `VITE_USE_REAL_API` restaurado para `true` no `.env`
  - ADR-014 criado: estratégia de commitar `.env` com config de produção, precedência do dashboard
  - 13 testes corrigidos: `vi.stubEnv("VITE_USE_PROXY", "false")` adicionado a 4 arquivos de teste
    - `market.api.dedup.test.ts`, `market.api.batch.test.ts`, `market.api.retry.test.ts`, `market.api.history-quality.test.ts`
  - Sprint-close executado: 399/399 testes, 95.74% statements, 90.21% branches, SECURITY_PASS_WITH_NOTES

- **Frente `api-proxy-worker` — Cloudflare Worker implementado localmente** (2026-03-22) 🔄 **AGUARDANDO BRANCH/COMMIT/PR**
  - Worker implementado em `worker/src/index.ts` com AC-1 a AC-5 passando (18 testes Vitest)
  - Frontend ajustado com feature flag `VITE_USE_PROXY` em `src/services/market.api.ts` (AC-6, 5 testes)
  - Arquivos criados/modificados: `worker/src/index.ts`, `worker/src/index.test.ts`, `src/services/market.api.ts`, `src/test/market.api.proxy.test.ts`, `.env.example`, `.github/workflows/deploy-worker.yml`
  - ADR `docs/adr/ADR-012-cloudflare-workers-api-proxy.md` criado
  - REPORT em `features/api-proxy-worker/REPORT.md` com status `READY_FOR_COMMIT`
  - Usuário instruiu a não subir PR nesta sessão — branch/commit/PR fica para próxima sessão
  - Decisões abertas pós-MVP: fixed window rate limit → sliding window, CORS wildcard → domínio específico, staleBackup sem LRU, X-Forwarded-For como fallback de IP

- **Contrato de autonomia v1 — Execução Opção A (Frente B: ícones híbridos)** (2026-03-20) ✅ **CONCLUÍDO EM BRANCH `feat/frente-b-icon-fallback`**
  - Estratégia híbrida aplicada: CDN primária (`render.albiononline.com`) + fallback local (`/placeholder.svg`) em falha de carregamento
  - Novo componente reutilizável:
    - `src/components/items/ItemIcon.tsx`
    - `src/components/items/itemIcon.utils.ts`
  - Pontos de UI atualizados para exibir ícone de item:
    - `ArbitrageTable`, `PriceTable`, `TopArbitragePanel`, `TopItemsPanel`
  - Testes adicionados:
    - `src/components/items/ItemIcon.test.tsx` (4 cenários: URL CDN, render primário, fallback em erro, reset ao trocar item)
  - Gates executados:
    - lint: ok (0 erro, 7 warnings conhecidos de vendor/ui)
    - typecheck: ok
    - test: ok (36 arquivos, 337 testes)
    - build: ok
  - Registro de obstáculos das frentes futuras atualizado em issues abertas:
    - #65 (Frente C): comentário de atualização do bloqueio em 2026-03-20 — ausência de infraestrutura auth dual
    - #66 (Frente D): comentário de atualização do bloqueio em 2026-03-20 — ausência de backend de entrega/observabilidade Discord

- **Hotfix CI PR #67 — coverage summary ausente no step de threshold** (2026-03-20) ✅ **CONCLUÍDO**
  - Causa raiz: workflow esperava `coverage/coverage-summary.json`, mas a configuração de teste não forçava `json-summary` no reporter
  - Correção aplicada em `vite.config.ts`:
    - `test.coverage.reporter = ["text", "html", "json-summary"]`
  - Resultado: arquivo `coverage/coverage-summary.json` garantido em execução com `--coverage`
  - Validação local:
    - `npm run test -- --coverage` gerou `coverage-summary.json`
    - `npm run quality:gate` passou completo

- **Contrato de autonomia v1 — Execução Opção A (Frente A) + registro de bloqueios C/D** (2026-03-20) ✅ **CONCLUÍDO EM BRANCH `feat/frente-a-tier-naming`**
  - Frente A implementada via TDD em `ITEM_NAMES`: nomenclatura por tier com nome completo
    - T1 Beginner's, T2 Novice's, T3 Journeyman's, T4 Adept's, T5 Expert's, T6 Master's, T7 Grandmaster's, T8 Elder's
  - Badge `Tx` preservado (sem alteração de layout da tabela/listagens)
  - Testes adicionados/ajustados para contrato de nomenclatura:
    - `src/test/catalog.test.ts` (novos cenários de prefixo por tier e sufixo de encantamento)
    - `src/test/market.api.test.ts` (expect alinhado para nome legível novo)
  - Issues de bloqueio registradas para frentes futuras:
    - #65 Frente C bloqueada (ausência de infraestrutura auth dual): https://github.com/wendeus0/albion-market-insights/issues/65
    - #66 Frente D bloqueada (ausência de backend de entrega Discord): https://github.com/wendeus0/albion-market-insights/issues/66
  - Gates executados:
    - lint: ok (0 erro, 7 warnings conhecidos de vendor/ui)
    - typecheck: ok
    - test: ok (35 arquivos, 330 testes)
    - build: ok

- **Execução das 5 janelas lógicas em branches isoladas** (2026-03-20) 🔄 **EM PR / SEM CONFLITO DE BRANCH**
  - Janela 1 (P0): branch documental dedicada `docs/sprint-followup-2026-03-20` para centralizar `PENDING_LOG.md`, `ERROR_LOG.md` e `memory/MEMORY.md`
  - Janela 2 (P1): PR #56 aberto — cobertura de hooks extraídos (`usePriceTableFilters.ts` e `usePriceTablePagination.ts`) elevada no recorte para 100% statements/lines/functions
  - Janela 3 (P1): PR #57 aberto — cobertura de UI elevada (`Navbar.tsx` 100%, `Dashboard.tsx` 90.9%, `ArbitrageTable.tsx` 98.21%)
  - Janela 4 (P2): PR #58 aberto — `typecheck` explícito no `quality:gate`, smoke E2E no CI e threshold inicial de coverage
  - Janela 5 (P2): PR #61 aberto — relatório técnico de prontidão Node 24 em `features/node-24-readiness/REPORT.md`
  - Issues abertas direto no GitHub conforme combinado: #59 (flakiness da suíte sob cobertura) e #60 (tracking de migração Node 24)

- **Lote 2 — Refatoração Estrutural e UX** (2026-03-20) ✅ **MERGEADO NA MAIN via PR #51**
  - `PriceTable` delega filtros, ordenação e paginação para hooks dedicados
  - Novo `AppLayout` via rota-pai elimina repetição manual de `Layout` nas páginas principais
  - `PriceTable.tsx` validada com 83.33% statements coverage após a refatoração
  - `quality:gate` validado com sucesso (`280/280` testes)
  - ADR-010 criado para registrar a convenção estrutural adotada no sprint

- **Lote P0 completo** (2026-03-19) ✅ **MERGEADO NA MAIN**
  - Todas as correções críticas de confiança de dados implementadas
  - DataSourceBadge: indicador visual de modo de dados (Real/Mock/Degraded)
  - DegradedBanner: fallback explícito em produção (sem silêncio)
  - Clear All transacional: bug fix no PriceTable com persistência correta
  - Last Update real: removido timestamp fictício inicial
  - Dashboard foco único: removida aba Local Spread, apenas arbitragem cross-city
  - Cooldown de refresh: 5 minutos entre refreshes manuais com countdown
  - 41 testes novos (total: 250+ passando)
  - PR aceito e mergeado em `main`

- **Lote 1A — Item 2: Unificação de notificações** (2026-03-19) ✅ **MERGEADO NA MAIN**
  - Removido sistema `use-toast` legado
  - Migrado para Sonner em todos os componentes
  - 5 arquivos legados deletados
  - Testes atualizados
  - PR aceito e mergeado em `main`

- **Lote 1A — Itens 3 e 4: Alertas** (2026-03-19) ✅ **MERGEADO NA MAIN**
  - Item 3: Respeitar `notifications.inApp` — poller só notifica quando habilitado
  - Item 4: Normalização de `alert.city` — valor canônico `"all"`, migração automática
  - Schema atualizado, testes atualizados
  - PR aceito e mergeado em `main`

- **Lote 1A — Item 1: Contrato `change`** (2026-03-19) ✅ **MERGEADO NA MAIN**
  - Engine de alertas agora calcula variação percentual temporal real
  - Usa `priceHistory` em vez de `spreadPercent` para condição `change`
  - Toast mostra variação real (+25.0%, -15.3%, etc.)
  - Testes atualizados para nova lógica
  - PR aceito e mergeado em `main`
  - **LOTE 1A COMPLETO** — todos os 4 itens implementados

- **Quality Gate restaurado** (2026-03-19) ✅ **MERGEADO NA MAIN**
  - PR #43 corrigiu regressão em testes causada por mocks incompletos de `@/data/constants`
  - `market.api.retry.test.ts` e `market.api.batch.test.ts` passaram a usar mock parcial com `importOriginal`
  - `quality:gate` voltou a passar de forma consistente no CI

- **Lote 2 — Item 3: AlertsManager hooks** (2026-03-19) ✅ **MERGEADO NA MAIN**
  - `AlertsManager` foi quebrado em hooks especializados: `useAlertsForm`, `useAlertsFeedback` e `useAlertsUI`
  - Após o merge do PR #43, o PR #42 exigiu ajuste adicional em `market.cache.test.ts` para remover mock stale de TTL
  - PR #42 mergeado em `main`; `quality-gate` validado com sucesso

- **Ativação da API Real**: O ambiente foi configurado para usar a API real (`VITE_USE_REAL_API=true`) no arquivo `.env`, substituindo o mock data padrão.
- **Teste de integração**: Validado que `market.api.ts` é carregado quando a variável de ambiente está ativa.
- **Debug logging removido** (2026-03-16): `console.log/warn/error` removidos de `market.api.ts` e `NotFound.tsx`; testes adicionados para garantir ausência. Commit `ad190a2` em `main`.
- **ANALYSIS_REPORT.md gerado** (2026-03-16): codebase-analysis completa; relatório em raiz do projeto com 11 débitos classificados (P0/P1/P2).
- **Catálogo expandido** (2026-03-16): `feat/catalog-expansion` — PR #10 aceito em `main`; 52→450 IDs, 17 categorias, batch loading com concorrência controlada, filtro de categoria no PriceTable. 65/65 testes.
- **Backoff exponencial** (2026-03-16): `feat/backoff-exponencial` — PR #11 aceito em `main`; `fetchWithRetry` exportado, retry em 429/5xx/network, backoff `500ms * 2^attempt + jitter`, `AbortSignal` respeitado. 79/79 testes. Fecha DEBT-P1-001.
- **Code-splitting** (2026-03-16): `feat/code-splitting` — PR #13 aceito em `main`; `React.lazy()` + `Suspense` em `src/App.tsx`; bundle principal 523 kB → 393 kB (~25%); `NotFound` mantida estática; 81/81 testes. Fecha DEBT-P1-004.
- **TypeScript strict mode iteração 1** (2026-03-16): `feat/typescript-strict-mode` — PR aceito em `main`; `noImplicitAny: true` + `strictNullChecks: true` ativados em `tsconfig.app.json` e `tsconfig.json`; codebase já era type-safe, sem supressões; 85/85 testes; ADR-006 criado. Fecha DEBT-P0.
- **Cache com TTL em localStorage** (2026-03-16): `feat/cache-ttl-localstorage` — PR #17 aceito em `main`; `src/services/market.cache.ts` com `readCache`, `writeCache`, `isCacheValid`; TTL posteriormente alinhado para 15 min pela política única de frescor; schema Zod valida campos completos de `MarketItem`; `ApiMarketService.getItems()` verifica cache antes de fetch; `getLastUpdateTime()` reflete `cachedAt`; 102/102 testes; ADR-007 criado. Fecha DEBT-P1-002.
- **TypeScript strict mode iteração 2 (hooks)** (2026-03-17): `feat/typescript-strict-mode-hooks` — PR #18 aceito em `main`; 4 flags adicionais ativadas (`strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`); 106/106 testes; codebase continua type-safe sem supressões. Próxima iteração: `src/pages/`.
- **TypeScript strict mode iteração 3 (pages)** (2026-03-17): `feat/typescript-strict-mode-pages` — PR #20 mergeado; 6 testes adicionados em `tsconfig.strict.test.ts` cobrindo AC-1 (compilação limpa de `src/pages/`) e AC-2 (ausência de `@ts-ignore`/`@ts-expect-error` nos 5 arquivos de página); 112/112 testes. Próxima iteração: `src/components/`.
- **TypeScript strict mode iteração 4 (components)** (2026-03-17): `feat/typescript-strict-mode-components` — PR #22 mergeado; 9 testes adicionados em `tsconfig.strict.test.ts` cobrindo AC-1 (compilação limpa de `src/components/` exceto `ui/`) e AC-2 (ausência de `@ts-ignore`/`@ts-expect-error` nos 8 arquivos de componente); 121/121 testes. Migração gradual para TypeScript strict mode COMPLETA.
- **Enchanted items** (2026-03-17): `feat(catalog)` — PR #24 mergeado em `main`; catálogo expandido de 450 para 1.830 IDs com suporte a `@1/@2/@3`, filtro de encantamento no `PriceTable` e ADR-008 criado. 126/126 testes.
- **Enhanced UI Filters** (2026-03-17): `feat(ui)` — PR #25 mergeado em `main`; filtros min/max de preço e spread, botão `Clear All` e contador de filtros ativos no `PriceTable`. 133/133 testes.
- **Auditoria de segurança do sprint** (2026-03-17): `SECURITY_AUDIT_REPORT.md` gerado com veredito `SECURITY_PASS_WITH_NOTES`; sem achados CRITICAL/HIGH/MEDIUM; observação LOW na leitura de alertas de `localStorage` sem validação de schema.
- **Cobertura de hooks críticos** (2026-03-18): `feat/coverage-critical-modules` — PR #28 mergeado em `main`; testes adicionados para `use-toast.ts`, `useAlerts.ts` e `useAlertPoller.ts`; cobertura global elevada de 77.99% para 86.24% statements; 205/205 testes passando.
- **E2E de AlertsManager** (2026-03-18): `feat/alerts-manager-e2e` — testes Playwright adicionados para fluxos de criação, persistência, toggle e exclusão; configuração ajustada para usar `chromium` do sistema no Arch Linux; modo mock forçado nos testes E2E; 9/9 cenários passando.
- **TypeScript strict mode consolidação** (2026-03-19): CONCLUÍDO — ADR-006 atualizado com decisão de substituir 6 flags individuais por `strict: true` master flag; mitigações documentadas; PR #32 mergeado em `main`.
- **Persistência de filtros do PriceTable** (2026-03-19): CONCLUÍDO — implementação de AC-5 do SPEC `enhanced-ui-filters`; serviço `filter.storage.ts` com validação defensiva; integração no `PriceTable`; 10 testes novos; PR #33 mergeado em `main`.
- **README modernizado** (2026-03-19): CONCLUÍDO — atualização completa do README.md com descrição em português, funcionalidades, tech stack e links para documentação; PR #34 mergeado em `main`.
- **Triagem arquitetural consolidada** (2026-03-19): decisões de produto/arquitetura/qualidade aprovadas em bloco (Q01–Q70) e registradas em `QUESTIONS.md`, incluindo foco do Dashboard em arbitragem, unificação de políticas de dados e revisão do fluxo de alertas.
- **Frente mobile mantida aberta** (2026-03-19): estratégia futura registrada para evolução mobile via PWA e/ou app nativo, sem bloquear entregas web atuais.
- **Guardrails de refresh e API** (2026-03-19): aprovado cooldown de refresh manual (1x/5 min por cliente) + necessidade de proteção global via camada central (proxy/backend com cache compartilhado + rate limit).
- **Feature futura de temas registrada** (2026-03-19): remover dependência parcial atual de tema e reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada.
- **Política de artefatos `dist/` confirmada** (2026-03-19): manter `dist/` ignorado no repositório; geração/publicação apenas via build local/CI.

## Plano de implementação por lotes (decisões 2026-03-19)

### Lote 0 — Correções críticas de confiança de dados (P0) ✅ CONCLUÍDO

- [x] **Serviço real sem fallback silencioso em produção** (2026-03-19): `dataSourceManager` com estado `degraded`; fallback apenas em dev/test.
- [x] **Status de modo de dados visível** (2026-03-19): `DataSourceBadge` em `Index` e `Dashboard`; estados `Real`/`Mock`/`Degraded` com tooltip.
- [x] **`Clear All` transacional no PriceTable** (2026-03-19): `isClearingRef` controla persistência; reset de página ao limpar.
- [ ] **Contrato de alerta `change`**: migrar para variação percentual temporal de preço (não `spreadPercent` atual). _[Movido para Lote 1]_
- [x] **Fonte correta de `Last Update`** (2026-03-19): `getLastUpdateTime()` retorna `null` inicialmente; timestamp real após fetch.
- [x] **Dashboard com foco único em arbitragem** (2026-03-19): removida aba `Local Spread`; apenas `ArbitrageTable` e `TopArbitragePanel`.
- [x] **Refresh manual com cooldown (5 min)** (2026-03-19): `refreshCooldown.ts` com localStorage; UI mostra countdown; toast informativo.

### Lote 1 — Consistência de dados, contratos e runtime (P1)

#### ✅ Já Concluídos no Lote 1A:

- [x] **Normalização de `alert.city`**: valor canônico (`all`) no domínio + labels na UI.
- [x] **Unificação de notificações**: consolidar em Sonner + wrapper interno; descontinuar `use-toast` custom.

#### 🔄 Lote 1B — Consistência de Dados (Em Andamento):

- [ ] **Política única de frescor (15 min)**: alinhar TTL de cache, `staleTime`, textos de UI e polling.
- [ ] **ID robusto para alertas**: migrar para `crypto.randomUUID()` com fallback seguro.
- [ ] **Cooldown de alerta persistente**: sobreviver a reload com TTL curto por alerta.
- [ ] **Runtime padronizado em Node 20**: alinhar README e tooling.

#### ⏳ Itens Futuros (Lote 1C ou Lote 2):

- [ ] **Refresh manual com cooldown local (5 min)**: já parcialmente implementado, avaliar necessidade.
- [ ] **Histórico por qualidade (alvo final)**: ajustar fetch/enriquecimento para respeitar qualidade do item.
- [ ] **Deduplicação por recência**: substituir `first occurrence wins` por regra de timestamp/confiabilidade.
- [ ] **Factory/DI para serviços**: reduzir acoplamento do selector por singleton import-time.

### Lote 2 — Refatoração Estrutural e UX (P1/P2) ✅ CONCLUÍDO / MERGEADO

> Foco concluído em arquitetura de código, separação de responsabilidades e DX.

**Itens Prioritários:**

- Branch ativa de trabalho: `chore/node24-migration-gates` (PR #64 aberto)
- Estratégia vigente de runtime:
  - Node 20 = default operacional
  - Node 24 = lane paralela em observação
- Último marco de CI na frente Node 24:
  - run `23344041067` com lanes Node 20 e Node 24 verdes simultaneamente

## Decisões vigentes

- Não criar repositório externo para a frente Node 24 neste momento.
- Manter laboratório interno em `features/node-24-readiness/pr-64-lab/`.
- Promover Node 24 para default apenas após janela contínua de estabilidade.
- Rollback rápido deve continuar documentado e testável (retorno imediato para Node 20-only em caso de regressão).

## Backlog ativo (priorizado por impacto)

### P1 — Próxima janela recomendada

1. Higiene de componentes vendor (`src/components/ui/*`)

- Tipo: dívida técnica incremental
- Objetivo: reduzir warnings/ruído e acoplamento de código não utilizado
- Critério de saída:
  - mapa de uso atualizado
  - pruning incremental sem regressão
  - lint/typecheck/testes verdes

### P2 — Estrutural (após P1)

2. Histórico por qualidade (alvo final)

- Ajustar fetch/enriquecimento para respeitar qualidade do item ao compor histórico.

3. Deduplicação por recência

- Substituir estratégia atual por regra baseada em timestamp/confiabilidade.

4. Factory/DI para serviços

- Reduzir acoplamento de selector por singleton em import-time.

5. Refresh manual com cooldown local (5 min)

- Reavaliar necessidade após mudanças recentes de política de frescor e UX.

### Futuro (não bloqueante)

6. Temas (light/dark/system) via SPEC dedicada.
7. Frente mobile (PWA vs nativo) com reaproveitamento de contratos atuais.

## Node 24 — Plano de observação

### Status dos gates

- Gate 1 (bootstrap CI): concluído
  - Correção de sintaxe/parse no workflow de matrix
- Gate 2 (execução paralela): concluído
  - Correção de leitura de cobertura com fallback para `coverage-final.json`
  - Reexecução verde simultânea (Node 20 + Node 24)

### Próxima condição para promoção

- Acumular janela de estabilidade contínua (1-2 semanas) em execuções reais de PR.
- Não observar regressão de flakiness/material no quality gate.
- Abrir PR dedicado de promoção quando os critérios acima forem cumpridos.

## Janela 6 — Concluída (2026-03-20)

- Drift de documentação/governança alinhado:
  - `CONTEXT.md` atualizado
  - ADR-003 e ADR-005 revisados
  - ADR-011 criado
  - README com política de runtime em observação
  - políticas de storage e artefatos adicionadas

## Janela 7 — Concluída (2026-03-20)

- Lote 1B (itens P1 de consistência) concluído:
  - política única de frescor confirmada
  - ID robusto para alertas confirmado
  - cooldown persistente de alertas confirmado

## Janela 8 — Concluída (2026-03-20)

- UX/consistência da arbitragem:
  - feedback de faixas inválidas na PriceTable (`min > max`)
  - Home com fonte única de arbitragem derivada de `marketItems`
  - paginação adicionada na `ArbitrageTable`
  - testes de regressão atualizados

## Janela 9 — Concluída (2026-03-20)

- Pruning de UI concluído: removidos 34 componentes sem referência em src/components/ui/\*.
- Guard-rails executados: npm run lint, npm run typecheck e npm run test verdes.
- Resultado de suíte: 35 arquivos de teste, 333 testes passando.
- Observação: mantido PR #64 aberto como lane de observação controlada.

## Marcos históricos consolidados

- Lote P0 concluído e mergeado
- Lote 1A concluído e mergeado
- Lote 1B (P1) concluído
- Lote 2 concluído e mergeado (PR #51)
- Lote 3 (qualidade/CI/docs) concluído nas frentes planejadas

## Pontos de atenção atuais

- Branch local `feat/coverage-branches-gap-ac2-ac4` já foi mergeada na `main`; próxima sessão deve retornar para `main` e sincronizar antes de abrir nova frente.
- Manter observação do comportamento Node 24 no CI antes de promoção.
- Warnings em componentes vendor (`src/components/ui/*`) seguem como trade-off conhecido até a janela de higiene.
- Não commitar artefatos gerados (`dist/`, `coverage/`, relatórios temporários).

## Decisões incorporadas recentemente

- **Retomada coverage-branches-gap (AC-2/AC-3/AC-4)** (2026-03-21) ✅ **MERGEADO NA MAIN via PR #77**
  - SPEC `features/coverage-branches-gap/SPEC.md` validada e promovida para `Approved`
  - Cobertura global de branches elevada de **86.71%** para **90.28%** (meta atingida)
  - Cobertura por arquivo: `PriceTable.tsx` **100% branches** e `market.api.ts` **94.73% branches**
  - Quality gate completo aprovado: lint + typecheck + testes (`394/394`) + build
  - Commit `2655a8d` na branch `feat/coverage-branches-gap-ac2-ac4`, PR #77 criada e mergeada

- **Guardrail de sincronização Git para memória durável** (2026-03-21) ✅ **CONCLUÍDO**
  - Script `.claude/scripts/git-sync-check.sh` criado para validar estado remoto/local antes de consolidar memória ou handoff
  - `AGENTS.md` atualizado para exigir a checagem antes de `session-open`, `session-close`, `sprint-close` e `memory-curator` quando branches/PRs impactarem a memória
  - `CLAUDE.md` atualizado para reforçar o guardrail em fluxos de contexto persistente
  - Objetivo: evitar que branches locais já mergeadas sejam tratadas como frentes ainda ativas

- **Atualização de memória pós-merge PR #64** (2026-03-21) ✅ **CONCLUÍDO**
  - MEMORY.md atualizado para refletir merge do PR #64 (lane Node 24 integrada à CI)
  - Decisão estável adicionada: CI com lane Node 24 paralela
  - Estado consolidado: observação contínua ativa, aguardando janela de estabilidade

- **Validação do estado do projeto** (2026-03-21) ✅ **CONCLUÍDO**
  - Sessão de abertura executada com `session-open` e `technical-triage`
  - Confirmado que todas as 9 janelas da rodada 2026-03-20 foram concluídas e mergeadas
  - MEMORY.md identificado como desatualizado (referenciando branch já mergeada)
  - Próximo passo definido: consolidação de sessão antes de abrir nova frente
