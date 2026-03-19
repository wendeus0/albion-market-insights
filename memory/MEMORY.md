# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline de produto estável em `main` (215/215 testes, CI operacional); sessão atual consolidou decisões arquiteturais e backlog por lotes
**Branch ativa:** `docs/decision-batches-2026-03-19` (PR #36 aberto contra `main`)
**Snapshot local:** Branch de docs com `PENDING_LOG.md` + `QUESTIONS.md` já commitados/push; `memory/MEMORY.md` em atualização local

---

## Stable decisions

| Decisão                                   | Status  | Detalhes                                                                                                                                        |
| ----------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Camada de serviços (`src/services/`)      | ✅ Fixo | Interface `MarketService`, implementações `market.api.ts` e `market.mock.ts`                                                                    |
| Hooks customizados                        | ✅ Fixo | `useMarketItems`, `useTopProfitable`, `useAlerts`, `useAlertPoller`, `useLastUpdateTime` — testados com >90% cobertura                          |
| Alert engine + storage                    | ✅ Fixo | Polling via `alert.engine.ts`, persistência via `alert.storage.ts` (localStorage)                                                               |
| shadcn/ui como biblioteca de componentes  | ✅ Fixo | 59 componentes em `src/components/ui/` — não editar diretamente                                                                                 |
| Testes E2E com Playwright                 | ✅ Fixo | 13 testes cobrindo dashboard, navegação e alertas                                                                                               |
| Estrutura de governança Claude            | ✅ Fixo | CLAUDE.md com `@AGENTS.md`, `.claude/` com agents, rules e hooks                                                                                |
| Endpoint de histórico de preços           | ✅ Fixo | `/api/v2/stats/history` integrado em `market.api.ts`                                                                                            |
| Sem debug logging em produção             | ✅ Fixo | `console.*` removidos de `market.api.ts` e `NotFound.tsx`; testes garantem ausência                                                             |
| Timeout da API                            | ✅ Fixo | 15 segundos — `AbortController` único compartilhado entre todos os batches                                                                      |
| ITEM_CATALOG como fonte de verdade        | ✅ Fixo | `ITEM_IDS` e `ITEM_NAMES` derivados de `ITEM_CATALOG`; 17 categorias, 1.830 IDs únicos (T4-T8 + `@1/@2/@3`)                                     |
| Batch loading com concorrência controlada | ✅ Fixo | `BATCH_SIZE=100`, `HISTORY_CONCURRENCY=3`, `withConcurrency()` exportado para teste unitário                                                    |
| Retry com backoff exponencial             | ✅ Fixo | `fetchWithRetry` exportado; `RETRY_MAX_ATTEMPTS=3`, `RETRY_BASE_DELAY_MS=500ms`; retry em 429/5xx/network; AbortSignal respeitado               |
| Code-splitting por rota                   | ✅ Fixo | `React.lazy()` + `Suspense` em `src/App.tsx`; `NotFound` estática; bundle 393 kB (era 523 kB)                                                   |
| TypeScript strict mode                    | ✅ Fixo | `strict: true` ativado em `tsconfig.json` e `tsconfig.app.json`; ADR-006 atualizado; 215/215 testes; codebase 100% type-safe                    |
| Cache de dados de mercado com TTL         | ✅ Fixo | `src/services/market.cache.ts`; TTL 5 min; schema Zod valida campos completos de `MarketItem`; ADR-007 criado                                   |
| Itens encantados no catálogo              | ✅ Fixo | `ENCHANTMENT_LEVELS = [0,1,2,3]`; IDs com `@1/@2/@3`; filtro de encantamento no `PriceTable`; ADR-008                                           |
| Filtros avançados no `PriceTable`         | ✅ Fixo | min/max preço, min/max spread, botão `Clear All`, contador de filtros ativos; persistência via `filter.storage.ts` (localStorage)               |
| Playwright E2E no Arch Linux              | ✅ Fixo | Usar `chromium` do sistema (`/usr/bin/chromium`) via `executablePath` condicional em `playwright.config.ts`                                     |
| Quality Gate no CI                        | ✅ Fixo | Workflow `.github/workflows/quality-gate.yml` com lint → test --coverage → build; npm 10.8.2 padronizado via `packageManager` em `package.json` |
| Persistência de filtros                   | ✅ Fixo | `filter.storage.ts` serviço dedicado; validação defensiva; 10 testes; AC-5 do SPEC enhanced-ui-filters completo                                 |
| Artefato `dist/`                          | ✅ Fixo | Política confirmada: manter `dist/` ignorado no Git; gerar/publicar somente via build local/CI                                                  |

---

## Active fronts

- PR #36 aberto (`docs/decision-batches-2026-03-19`): consolidação documental das decisões Q01–Q70 e plano de implementação por lotes
- Plano de execução aprovado e registrado em `PENDING_LOG.md` (Lote 0 a Lote 4), com prioridade P0→P2
- Feature de produto ainda não iniciada nesta frente; próxima etapa é abrir SPEC do Lote 0 antes de código

---

## Open decisions

- **Upgrade de actions para Node 24** (2026-06-02): deadline configurado no dependabot.yml; avaliar quando próximo da data
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update
- **Proteção global da API**: definir arquitetura da camada central (proxy/backend com cache compartilhado + rate limit) para mitigar refresh concorrente entre usuários
- **Estratégia mobile**: frente mantida aberta (PWA e/ou app nativo), aguardando recorte em SPEC
- **Feature futura de temas**: reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada

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
- Hooks com estado global (ex: use-toast) precisam de função de reset entre testes — exportar `_resetXxxState()` se necessário
- Mock de TanStack Query: usar `as ReturnType<typeof useHook>` para tipagem em testes de hooks dependentes
- Playwright no Arch Linux: usar `chromium` do sistema; build Ubuntu fallback dos mirrors da Microsoft não funciona
- Testes E2E devem rodar em modo mock (`VITE_USE_REAL_API=false`) para garantir dados determinísticos
- Toast notifications geram elementos duplicados no DOM (visual + aria-live); usar `{ exact: true }` ou seletores específicos
- Flag `shouldPersist` necessária para controlar race condition entre `setState` e `useEffect` de persistência no Clear All
- Cooldown de refresh no cliente não protege limite global da API; sem proxy central, múltiplos usuários ainda podem saturar upstream
- Não versionar `dist/`; manter artefatos de build fora do controle de versão

---

## Next recommended steps

1. **Mergear PR #36** (`docs/logs`) para consolidar trilha de decisões e backlog por lotes
2. **Abrir SPEC do Lote 0 (P0)** e iniciar implementação das correções de confiança de dados (fallback, modo degradado, Last Update, dashboard)
3. **Definir desenho da camada central da API** (cache compartilhado + rate limit) antes de liberar refresh manual em escala
4. **Planejar roadmap de estratégia futura**: mobile (PWA/app) e temas (light/dark/system) via SPECs dedicadas

---

## Last handoff summary

**Sessão:** 2026-03-19
**Trabalho realizado:**

- Rodada completa de revisão arquitetural em blocos (Q01–Q70) com decisões aprovadas de produto, dados, UX, CI e documentação
- Criação de `QUESTIONS.md` com trilha auditável das perguntas e decisões
- Atualização de `PENDING_LOG.md` com decisões consolidadas e plano de implementação por lotes (Lote 0 a Lote 4)
- Abertura da branch `docs/decision-batches-2026-03-19`, commit de docs e PR #36
- Política de artefatos confirmada: `dist/` permanece ignorado no repositório

**Estado ao encerrar:** baseline de produto permanece estável em `main`; frente atual é documental/planejamento em PR #36; execução técnica pendente de SPEC do Lote 0

**Retomar por:**

```
Read before acting:
- `AGENTS.md`
- `memory/MEMORY.md`
- `PENDING_LOG.md`

Current state:
- `main` contém PRs #32, #33, #34, #35 com baseline estável
- PR #36 (`docs/decision-batches-2026-03-19`) aberto com decisões consolidadas + backlog por lotes
- 215/215 testes passando no baseline atual
- Política `dist/`: manter ignorado no Git

Open points:
- Upgrade de actions para Node 24 (deadline 2026-06-02)
- Avaliar atualização de shadcn/ui para eliminar warnings
- Definir arquitetura de proteção global da API (proxy/cache/rate limit)
- Abrir SPEC para iniciar Lote 0

Recommended next front:
- Implementação do Lote 0 (P0) após SPEC aprovada
- Em paralelo, preparar recorte de estratégia futura (mobile e temas)
```
