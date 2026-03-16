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

## Pendências

- [x] **ADR-004**: `docs/adr/ADR-004-localstorage-alert-persistence.md` já existe e está completo (2026-03-16).
- [x] **Expansão do catálogo**: CONCLUÍDO — PR #10 mergeado. 450 IDs em 17 categorias.
- [ ] **Filtros de UI adicionais**: Tier e Cidade já existem no PriceTable. Avaliar se há gaps remanescentes de UX.
- [x] **Tratamento de Rate Limit**: CONCLUÍDO — PR #11 mergeado. `fetchWithRetry` com backoff exponencial e jitter em `market.api.ts`. Fecha DEBT-P1-001.
- [x] **Cache com TTL**: CONCLUÍDO — PR #17 mergeado. `market.cache.ts` com TTL 5 min e validação Zod. Fecha DEBT-P1-002.

## Pontos de atenção

- **TypeScript strict mode iteração 2**: avaliar `src/hooks/` com `noImplicitAny` + `strictNullChecks` já ativos (ver ADR-006).
- **Enchanted items** (`.@1/.@2/.@3`): avaliar adição ao catálogo — DEBT-P2 em aberto.
- **Filtros de UI**: revisar se há gaps de UX remanescentes além de Tier e Cidade no PriceTable.
