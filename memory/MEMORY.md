# MEMORY.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Baseline estável — debug logging removido (DoD restaurado); 54/54 testes passando; lint e build limpos
**Branch ativa:** main | Último commit: `ad190a2` fix(market.api): remover debug logging de produção
**ANALYSIS_REPORT.md:** gerado em 2026-03-16 — 11 débitos classificados (3×P0, 4×P1, 4×P2)

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
| Timeout da API | ✅ Fixo | 15 segundos (não 10s) — teste corrigido para refletir valor real |

---

## Active fronts

- **Catálogo de itens:** ~50 itens hardcoded em `src/data/constants.ts` — limitação de produto real; decisão pendente (hardcoded vs. endpoint dinâmico)
- **TypeScript strict mode:** desativado (`noImplicitAny: false`, `strictNullChecks: false`) — migração gradual pendente
- **Working tree com mudanças não commitadas:** arquivos de sessões anteriores (`AGENTS.md`, `CLAUDE.md`, test files, `vite.config.ts`, `docs/adr/`, `memory/`) aguardam avaliação

---

## Open decisions

- Estratégia de expansão do catálogo: hardcoded completo (~500 itens) vs. endpoint dinâmico da API
- Migração TypeScript strict mode: quando e em qual escopo iniciar (recomendação: começar por `src/services/`)
- ADR-004: decisão de localStorage para alertas precisa ser formalizada em `docs/adr/ADR-004-*.md`

---

## Recurrent pitfalls

- Componentes `src/components/ui/` não devem ser editados diretamente — quebra atualizações do shadcn/ui
- API do Albion Online não requer autenticação, mas está sujeita a rate limiting — não fazer polling agressivo; sem backoff implementado ainda
- `VITE_USE_REAL_API` deve ser `'true'` (string), não booleano — default é modo mock
- Imports relativos `../` são proibidos — usar path alias `@/*`
- Timeout da API é 15s (não 10s) — qualquer teste de timer deve avançar ao menos 15001ms para disparar o abort
- Não commitar arquivos fora do escopo da feature ativa — working tree tem mudanças de sessões anteriores pendentes

---

## Next recommended steps

1. **Avaliar working tree não commitado** — verificar se mudanças em `AGENTS.md`, `CLAUDE.md`, test files e `vite.config.ts` são intencionais e commitar ou descartar
2. **`adr-manager`** — criar `docs/adr/ADR-004-localStorage-alertas.md` (esforço XS, fecha DEBT-P2-003)
3. **`spec-editor`** — iniciar SPEC para expansão do catálogo de itens (DEBT-P0-003, maior impacto de produto)
4. **Backoff exponencial** — implementar retry com backoff em `market.api.ts` para rate limiting (DEBT-P1-001)
5. **Code-splitting** — `React.lazy()` nas rotas para reduzir bundle de 520KB (DEBT-P1-004)

---

## Last handoff summary

**Sessão:** 2026-03-16
**Trabalho realizado:**
- `codebase-analysis` completa → `ANALYSIS_REPORT.md` gerado com 11 débitos priorizados
- `fix-feature` completo → debug logging removido de `market.api.ts` e `NotFound.tsx`; 4 testes adicionados/corrigidos; commit `ad190a2` em `main`; pushed
- `technical-triage` executado duas vezes: antes e após o fix

**Estado ao encerrar:** Baseline limpa. 54/54 testes. Lint e build OK. Sem feature ativa em andamento.

**Retomar por:**
```
session-open → avaliar working tree não commitado → adr-manager (ADR-004) → spec-editor (catálogo de itens)
```
