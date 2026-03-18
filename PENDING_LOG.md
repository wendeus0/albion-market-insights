# PENDING_LOG.md — Albion Market Insights

<!-- Atualizado por: session-logger | Não editar manualmente durante sessão ativa -->

## Decisões incorporadas

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

## Pendências

- [x] **ADR-004**: `docs/adr/ADR-004-localstorage-alert-persistence.md` já existe e está completo (2026-03-16).
- [x] **Expansão do catálogo**: CONCLUÍDO — PR #10 mergeado. 450 IDs em 17 categorias.
- [x] **Enchanted items**: CONCLUÍDO — PR #24 mergeado. Catálogo em 1.830 IDs com filtro de encantamento.
- [x] **Filtros de UI adicionais**: CONCLUÍDO parcialmente no PR #25 — min/max preço e spread, `Clear All`, contador de filtros. Gap remanescente: persistência opcional dos filtros (AC-5).
- [x] **Tratamento de Rate Limit**: CONCLUÍDO — PR #11 mergeado. `fetchWithRetry` com backoff exponencial e jitter em `market.api.ts`. Fecha DEBT-P1-001.
- [x] **Cache com TTL**: CONCLUÍDO — PR #17 mergeado. `market.cache.ts` com TTL 5 min e validação Zod. Fecha DEBT-P1-002.
- [x] **Cobertura de hooks críticos**: CONCLUÍDO — PR #28 mergeado. use-toast.ts (91.22%), useAlerts.ts (100%), useAlertPoller.ts (93.75%). 72 novos testes.
- [x] **Cobertura de componentes críticos** (2026-03-18): CONCLUÍDO — PR #31 mergeado em `main`; testes unitários adicionados para `PriceTable.tsx` (84.67%) e `AlertsManager.tsx` (80.76%); ambos acima do limiar de 80%; 211/211 testes passando; workflow `Quality Gate` criado e operacional.
- [ ] **Validação defensiva de alertas persistidos**: adicionar schema validation ao ler `localStorage` em `src/services/alert.storage.ts`.
- [x] **E2E completo de alertas**: CONCLUÍDO — `feat/alerts-manager-e2e` com 9 cenários Playwright cobrindo criação, persistência, toggle e exclusão de alertas.
- [ ] **Decisão sobre `strict: true`**: avaliar ativação da flag master agora que a migração gradual terminou.

## Pontos de atenção

- **Worktree local sujo**: existem mudanças fora do sprint em `AGENTS.md`, `.claude/rules/quality.md`, `.env` e `.opencode/`; não sobrescrever sem validar contexto.
- **Cobertura atual**: `npx vitest run --coverage` resultou em 86.24% statements / 88.02% lines; hooks de alertas agora estão acima de 90%. Gaps remanescentes: `PriceTable` (76.61%) e `AlertsManager` (63.46%).
- **Catálogo expandido**: 1.830 IDs aumentam pressão sobre filtragem client-side; monitorar performance real antes de nova expansão.
- **shadcn/ui warnings**: warnings de ESLint em `src/components/ui/` permanecem como trade-off até atualização do vendor.
