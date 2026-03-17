# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline estável em `main` — PR #25 mergeado; TypeScript strict mode completo, enchanted items ativos e filtros avançados no `PriceTable`; 133/133 testes passando; cobertura atual 77.99% statements / 79.6% lines
**Branch ativa:** main | Último PR: `feat(ui): adicionar filtros avançados no PriceTable` (#25)
**Snapshot local relevante:** worktree local sujo com mudanças fora do sprint em `AGENTS.md`, `.claude/rules/quality.md`, `.env` e `.opencode/`; preservar antes de iniciar nova frente

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

---

## Active fronts

- Encerramento de sprint concluído; próximos trabalhos são de follow-up técnico, não de feature aberta.
- Frente principal recomendada: elevar cobertura e robustez dos módulos de alertas e dashboard antes de novas expansões de produto.

---

## Open decisions

- **`strict: true` master flag**: migração gradual está concluída; decidir se a flag agregada deve substituir a configuração fragmentada atual
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
- `src/services/alert.storage.ts` lê dados persistidos sem validação de schema — tratar `localStorage` como entrada não confiável em mudanças futuras

---

## Next recommended steps

1. **Consolidar logs** — commitar atualizações de ERROR_LOG.md, PENDING_LOG.md e MEMORY.md
2. **Cobertura de testes** — priorizar `src/components/dashboard/PriceTable.tsx`, `src/components/alerts/AlertsManager.tsx`, `src/hooks/useAlerts.ts`, `src/hooks/useAlertPoller.ts` e `src/hooks/use-toast.ts`
3. **Hardening de alertas** — validar payload de `localStorage` em `src/services/alert.storage.ts`
4. **Avaliação de `strict: true`** — decidir ativação da flag master agora que todas as camadas já foram auditadas
5. **UX opcional** — decidir sobre persistência dos filtros do `PriceTable`

---

## Last handoff summary

**Sessão:** 2026-03-17
**Trabalho realizado:**
- Sprint consolidado com PRs #23, #24 e #25 já em `main`
- `feat(catalog)` (#24): catálogo expandido para 1.830 IDs com suporte a encantamentos e ADR-008
- `feat(ui)` (#25): filtros avançados no `PriceTable`; baseline atual em 133/133 testes passando
- Cobertura revisada com `npx vitest run --coverage`: 77.99% statements / 79.6% lines; gaps concentrados em dashboard e alertas
- `SECURITY_AUDIT_REPORT.md` gerado com veredito `SECURITY_PASS_WITH_NOTES` e 1 observação LOW em `alert.storage.ts`

**Estado ao encerrar:** Baseline funcional em `main`, sprint fechado, memória consolidada; worktree local ainda contém mudanças fora do sprint que exigem cuidado.

**Retomar por:**
```
Read before acting:
- `AGENTS.md`
- `ERROR_LOG.md`
- `PENDING_LOG.md`
- `memory/MEMORY.md`
- `SECURITY_AUDIT_REPORT.md`

Current state:
- `main` já contém PRs #24 e #25; baseline com 133/133 testes passando
- Cobertura global abaixo do limiar operacional de 80%, com maiores gaps em `PriceTable`, `AlertsManager` e hooks de alertas
- Há observação LOW de segurança em `src/services/alert.storage.ts`
- Worktree local está sujo por arquivos fora do sprint; não sobrescrever sem triagem

Open points:
- decidir ativação de `strict: true`
- endurecer leitura de alertas persistidos
- elevar cobertura dos módulos críticos
- decidir se filtros do `PriceTable` devem persistir

Recommended next front:
- iniciar por uma frente curta de robustez: `fix-feature` para `alert.storage.ts` + testes de cobertura em alertas/dashboard
```
