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

## Pendências

- [x] **ADR-004**: `docs/adr/ADR-004-localstorage-alert-persistence.md` já existe e está completo (2026-03-16).
- [x] **Expansão do catálogo**: CONCLUÍDO — PR #10 mergeado. 450 IDs em 17 categorias.
- [ ] **Filtros de UI adicionais**: Tier e Cidade já existem no PriceTable. Avaliar se há gaps remanescentes de UX.
- [x] **Tratamento de Rate Limit**: CONCLUÍDO — PR #11 mergeado. `fetchWithRetry` com backoff exponencial e jitter em `market.api.ts`. `RETRY_MAX_ATTEMPTS=3`, `RETRY_BASE_DELAY_MS=500ms`. Fecha DEBT-P1-001.
- [x] **Working tree com mudanças não commitadas**: RESOLVIDO — `chore/session-logs-code-splitting` mergeado; feat/typescript-strict-mode commitado e mergeado.

## Pontos de atenção

- **Performance**: Com a API real, o carregamento inicial pode ser lento devido à busca de histórico para cada item em cada cidade (N itens * 7 cidades). Considerar cache com TTL em localStorage.
- **TypeScript strict mode iteração 2**: `noImplicitAny` e `strictNullChecks` ativados (DEBT-P0 fechado). Próximas iterações: avaliar `src/hooks/` e depois `strict: true` completo (ver ADR-006).
- **Cache com TTL**: dados de preços em localStorage para reduzir chamadas à API (DEBT-P1-002) — ainda pendente.
