# PENDING_LOG.md — Albion Market Insights

<!-- Atualizado por: session-logger | Não editar manualmente durante sessão ativa -->

## Decisões incorporadas

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

- **Ativação da API Real**: O ambiente foi configurado para usar a API real (`VITE_USE_REAL_API=true`) no arquivo `.env`, substituindo o mock data padrão.
- **Teste de integração**: Validado que `market.api.ts` é carregado quando a variável de ambiente está ativa.
- **Debug logging removido** (2026-03-16): `console.log/warn/error` removidos de `market.api.ts` e `NotFound.tsx`; testes adicionados para garantir ausência. Commit `ad190a2` em `main`.
- **ANALYSIS_REPORT.md gerado** (2026-03-16): codebase-analysis completa; relatório em raiz do projeto com 11 débitos classificados (P0/P1/P2).
- **Catálogo expandido** (2026-03-16): `feat/catalog-expansion` — PR #10 aceito em `main`; 52→450 IDs, 17 categorias, batch loading com concorrência controlada, filtro de categoria no PriceTable. 65/65 testes.
- **Backoff exponencial** (2026-03-16): `feat/backoff-exponencial` — PR #11 aceito em `main`; `fetchWithRetry` exportado, retry em 429/5xx/network, backoff `500ms * 2^attempt + jitter`, `AbortSignal` respeitado. 79/79 testes. Fecha DEBT-P1-001.
- **Code-splitting** (2026-03-16): `feat/code-splitting` — PR #13 aceito em `main`; `React.lazy()` + `Suspense` em `src/App.tsx`; bundle principal 523 kB → 393 kB (~25%); `NotFound` mantida estática; 81/81 testes. Fecha DEBT-P1-004.
- **TypeScript strict mode iteração 1** (2026-03-16): `feat/typescript-strict-mode` — PR aceito em `main`; `noImplicitAny: true` + `strictNullChecks: true` ativados em `tsconfig.app.json` e `tsconfig.json`; codebase já era type-safe, sem supressões; 85/85 testes; ADR-006 criado. Fecha DEBT-P0.
- **Cache com TTL em localStorage** (2026-03-16): `feat/cache-ttl-localstorage` — PR #17 aceito em `main`; `src/services/market.cache.ts` com `readCache`, `writeCache`, `isCacheValid`; TTL 5 min; schema Zod valida campos completos de `MarketItem`; `ApiMarketService.getItems()` verifica cache antes de fetch; `getLastUpdateTime()` reflete `cachedAt`; 102/102 testes; ADR-007 criado. Fecha DEBT-P1-002.
- **TypeScript strict mode iteração 2 (hooks)** (2026-03-17): `feat/typescript-strict-mode-hooks` — PR #18 aceito em `main`; 4 flags adicionais ativadas (`strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`); 106/106 testes; codebase continua type-safe sem supressões. Próxima iteração: `src/pages/`.
- **TypeScript strict mode iteração 3 (pages)** (2026-03-17): `feat/typescript-strict-mode-pages` — PR #20 mergeado; 6 testes adicionados em `tsconfig.strict.test.ts` cobrindo AC-1 (compilação limpa de `src/pages/`) e AC-2 (ausência de `@ts-ignore`/`@ts-expect-error` nos 5 arquivos de página); 112/112 testes. Próxima iteração: `src/components/`.
- **TypeScript strict mode iteração 4 (components)** (2026-03-17): `feat/typescript-strict-mode-components` — PR #22 mergeado; 9 testes adicionados em `tsconfig.strict.test.ts` cobrindo AC-1 (compilação limpa de `src/components/` exceto `ui/`) e AC-2 (ausência de `@ts-ignore`/`@ts-expect-error` nos 8 arquivos de componente); 121/121 testes. Migração gradual para TypeScript strict mode COMPLETA.
- **Enchanted items** (2026-03-17): `feat(catalog)` — PR #24 mergeado em `main`; catálogo expandido de 450 para 1.830 IDs com suporte a `@1/@2/@3`, filtro de encantamento no `PriceTable` e ADR-008 criado. 126/126 testes.
- **Enhanced UI Filters** (2026-03-17): `feat(ui)` — PR #25 mergeado em `main`; filtros min/max de preço e spread, botão `Clear All` e contador de filtros ativos no `PriceTable`. 133/133 testes.
- **Auditoria de segurança do sprint** (2026-03-17): `SECURITY_AUDIT_REPORT.md` gerado com veredito `SECURITY_PASS_WITH_NOTES`; sem achados CRITICAL/HIGH/MEDIUM; observação LOW na leitura de alertas de `localStorage` sem validação de schema.
- **Cobertura de hooks críticos** (2026-03-18): `feat/coverage-critical-modules` — PR #28 mergeado em `main`; testes adicionados para `use-toast.ts`, `useAlerts.ts` e `useAlertPoller.ts`; cobertura global elevada de 77.99% para 86.24% statements; 205/205 testes passando.
- **E2E de AlertsManager** (2026-03-18): `feat/alerts-manager-e2e` — testes Playwright adicionados para fluxos de criação, persistência, toggle e exclusão; configuração ajustada para usar `chromium` do sistema no Arch Linux; modo mock forçado nos testes E2E; 9/9 cenários passando.
- **TypeScript strict mode consolidação** (2026-03-19): CONCLUÍDO — ADR-006 atualizado com decisão de substituir 6 flags individuais por `strict: true` master flag; mitigações documentadas; PR #32 aberto (`feat/typescript-strict-mode-final`).
- **Persistência de filtros do PriceTable** (2026-03-19): CONCLUÍDO — implementação de AC-5 do SPEC `enhanced-ui-filters`; serviço `filter.storage.ts` com validação defensiva; integração no `PriceTable`; 10 testes novos; 215/215 testes passando; PR #33 aberto (`feat/persist-price-filters`).
- **README modernizado** (2026-03-19): CONCLUÍDO — atualização completa do README.md com descrição em português, funcionalidades, tech stack e links para documentação; PR #34 aberto (`docs/readme-update`).
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
- [ ] **Contrato de alerta `change`**: migrar para variação percentual temporal de preço (não `spreadPercent` atual). *[Movido para Lote 1]*
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

### Lote 2 — Refatoração Estrutural e UX (P1/P2) 🏗️ PRÓXIMA FEATURE ESTRUTURAL

> **Nota:** Lote 2 deve ser iniciado após a conclusão do Lote 1B.  
> Foco em arquitetura de código, separação de responsabilidades e DX.

**Itens Prioritários:**
- [ ] **Extrair regras da `PriceTable`** para hooks/serviços puros (filtros, sort, persistência, paginação).
- [ ] **Rota com layout compartilhado**: reduzir repetição de `Layout` nas páginas.
- [x] **Extrair regras da `AlertsManager`** para hooks/serviços puros (normalização, persistência, feedback). ✅ **CONCLUÍDO**

**Itens Secundários:**
- [ ] **Persistência da tabela**: filtros + ordenação persistentes; paginação não persistente; reset de página ao filtrar.
- [ ] **Validação de filtros numéricos**: tratar `min > max` com feedback de UX.
- [ ] **Arbitragem na Home com fonte única**: remover fallback semântico misto.
- [ ] **Paginação da `ArbitrageTable`** (virtualização apenas se profiling justificar).
- [ ] **Higiene de componentes vendor**: pruning incremental de `src/components/ui/*` não usados.

**Estimativa:** 2-3 dias  
**Pré-requisito:** Conclusão do Lote 1B

### Lote 3 — Qualidade, CI e documentação (P1/P2)

- [ ] **`quality:gate` com `typecheck` explícito** (`tsc --noEmit`) + cobertura de configs TS de toolchain.
- [ ] **Smoke E2E obrigatório no CI** (PR), mantendo suíte completa em job dedicado quando necessário.
- [ ] **Threshold oficial de coverage** com enforcement gradual no CI.
- [ ] **Atualizar docs com drift**: `CONTEXT.md`, ADR-003, ADR-005, README e notas de workflow.
- [ ] **Política de privacidade/retenção localStorage**: documentar escopo, retenção e limpeza.
- [ ] **Política de artefatos `dist/`**: manter não versionado; gerar apenas em build/CI.

### Lote 4 — Estratégia futura (não bloqueante)

- [ ] **Feature futura de temas**: arquitetura light/dark/system com `ThemeProvider` completo (via SPEC dedicada).
- [ ] **Frente mobile**: estudar roadmap PWA vs app nativo, reaproveitando contratos e componentes existentes.

---

## 🎯 Lote 1B — Consistência de Dados (P1) 🔄 EM ANDAMENTO

**Análise completa em:** `features/proxima-janela-analise.md`

Após a conclusão bem-sucedida dos Lotes P0 e 1A, o Lote 1B foca em quick wins de consistência interna antes de avançar para refatorações estruturais (Lote 2).

### Itens em Progresso:

- [ ] **Política única de frescor (15 min)**: unificar TTL de cache, `staleTime`, textos de UI e polling.
- [ ] **ID robusto para alertas**: migrar de `Date.now()` para `crypto.randomUUID()` com fallback.
- [ ] **Cooldown de alerta persistente**: sobreviver a reload com TTL curto por alerta.
- [ ] **Runtime padronizado em Node 20**: alinhar README e tooling.

**Estimativa:** 1 dia  
**Próxima Feature Estrutural:** Lote 2 (Refatoração Estrutural e UX)

---

## 🏗️ Lote 2 — Refatoração Estrutural e UX (P1/P2) 🔄 EM ANDAMENTO

### Item 3: AlertsManager Hooks ✅ CONCLUÍDO

**Data:** 2026-03-19  
**Status:** ✅ **CONCLUÍDO**

#### Hooks Criados:

1. **`useAlertsForm.ts`** (72 linhas)
   - Gerenciamento do formulário com react-hook-form
   - Geração de ID robusto (`crypto.randomUUID` com fallback)
   - Criação do objeto Alert a partir dos valores do formulário
   - Função `generateAlertId` exportada para reuso

2. **`useAlertsFeedback.ts`** (63 linhas)
   - Centralização de todos os toasts do Sonner
   - `notifyToggle()` - feedback de ativação/desativação
   - `notifyDelete()` - feedback de exclusão com nome do item
   - `notifyCreate()` - feedback de criação com formatação contextual

3. **`useAlertsUI.ts`** (76 linhas)
   - Helpers de UI para formatação
   - `getConditionIcon()` - ícones por condição (below/above/change)
   - `getConditionText()` - textos descritivos formatados
   - `getCityLabel()` - labels de cidade ("All Cities" vs nome)
   - `getConditionStyles()` - estilos condicionais para UI

#### Resultados:
- **AlertsManager.tsx:** 466 → ~320 linhas (-31%)
- **Cobertura de testes:** 3 arquivos de teste com 30+ casos
- **Separação de responsabilidades:** UI, formulário e feedback isolados
- **ADR-009:** Documentação arquitetural criada

#### Testes:
- `useAlertsForm.test.ts` - 9 casos (form init, createAlert, reset, UUID fallback)
- `useAlertsFeedback.test.ts` - 6 casos (toggle, delete, create toasts)
- `useAlertsUI.test.ts` - 6 casos (icons, text, labels)

---

## ✅ Lote 1A — Correções de Alertas e Notificações (P1) CONCLUÍDO

**Análise completa em:** `features/proxima-frente-analise.md`

### ✅ Todos os Itens Concluídos

- [x] **Item 1: Contrato de alerta `change` (Q07)** — ✅ **MERGEADO**
  - Engine calcula variação percentual temporal usando `priceHistory`
  - Substitui `spreadPercent` por variação real do preço ao longo do tempo
  
- [x] **Item 2: Unificação de notificações (Q14)** — ✅ **MERGEADO**
  - Removido sistema `use-toast` legado
  - Sistema único baseado em Sonner

- [x] **Item 3: Respeitar `notifications.inApp` (Q10)** — ✅ **MERGEADO**
  - Poller verifica flag antes de notificar
  - Usuário pode desabilitar notificações por alerta

- [x] **Item 4: Normalização de `alert.city` (Q08, Q44)** — ✅ **MERGEADO**
  - Valor canônico `"all"` em todo o sistema
  - Migração automática de dados antigos
  - Label de UI separada do valor persistido

**Tempo total:** 1.5 dias  
**Impacto UX:** ⭐⭐⭐⭐⭐  
**Status:** ✅ **LOTE 1A 100% COMPLETO**

## Pendências

- [x] **ADR-004**: `docs/adr/ADR-004-localstorage-alert-persistence.md` já existe e está completo (2026-03-16).
- [x] **Expansão do catálogo**: CONCLUÍDO — PR #10 mergeado. 450 IDs em 17 categorias.
- [x] **Enchanted items**: CONCLUÍDO — PR #24 mergeado. Catálogo em 1.830 IDs com filtro de encantamento.
- [x] **Filtros de UI adicionais**: CONCLUÍDO parcialmente no PR #25 — min/max preço e spread, `Clear All`, contador de filtros. Gap remanescente: persistência opcional dos filtros (AC-5).
- [x] **Tratamento de Rate Limit**: CONCLUÍDO — PR #11 mergeado. `fetchWithRetry` com backoff exponencial e jitter em `market.api.ts`. Fecha DEBT-P1-001.
- [x] **Cache com TTL**: CONCLUÍDO — PR #17 mergeado. `market.cache.ts` com TTL 5 min e validação Zod. Fecha DEBT-P1-002.
- [x] **Cobertura de hooks críticos**: CONCLUÍDO — PR #28 mergeado. use-toast.ts (91.22%), useAlerts.ts (100%), useAlertPoller.ts (93.75%). 72 novos testes.
- [x] **Cobertura de componentes críticos** (2026-03-18): CONCLUÍDO — PR #31 mergeado em `main`; testes unitários adicionados para `PriceTable.tsx` (84.67%) e `AlertsManager.tsx` (80.76%); ambos acima do limiar de 80%; 211/211 testes passando; workflow `Quality Gate` criado e operacional.
- [x] **Validação defensiva de alertas persistidos**: CONCLUÍDO — PR #28 mergeado em `main`; `alertSchema.safeParse()` valida dados do localStorage; 13 testes cobrindo JSON malformado, campos ausentes, tipos incorretos, enum inválido e estrutura aninhada inválida.
- [x] **E2E completo de alertas**: CONCLUÍDO — `feat/alerts-manager-e2e` com 9 cenários Playwright cobrindo criação, persistência, toggle e exclusão de alertas.
- [x] **Decisão sobre `strict: true`** (2026-03-19): CONCLUÍDO — ADR-006 atualizado com decisão de consolidar 6 flags em `strict: true`; mitigações documentadas (`@ts-expect-error`, limite de 5 supressões); PR #32 aberto.
- [x] **Persistência de filtros do PriceTable** (2026-03-19): CONCLUÍDO — implementação de AC-5 do SPEC `enhanced-ui-filters`; serviço `filter.storage.ts` com validação defensiva; 10 testes novos; 215/215 testes passando; PR #33 aberto.

## Pontos de atenção

- **Worktree local sujo**: existem mudanças fora do sprint em `AGENTS.md`, `.claude/rules/quality.md`, `.env` e `.opencode/`; não sobrescrever sem validar contexto.
- **Cobertura atual**: `npx vitest run --coverage` resultou em 86.24% statements / 88.02% lines; hooks de alertas agora estão acima de 90%. Gaps remanescentes: `PriceTable` (76.61%) e `AlertsManager` (63.46%).
- **Catálogo expandido**: 1.830 IDs aumentam pressão sobre filtragem client-side; monitorar performance real antes de nova expansão.
- **shadcn/ui warnings**: warnings de ESLint em `src/components/ui/` permanecem como trade-off até atualização do vendor.
- **PRs abertos aguardando merge** (2026-03-19): #32 (strict mode), #33 (persist filters), #34 (readme update) — revisar e mergear quando aprovados.
- **Upgrade de actions para Node 24** (2026-06-02): deadline configurado no dependabot.yml; avaliar quando próximo da data.
