# memory.md — Albion Market Insights

<!-- Atualizado por: memory-curator | Não editar manualmente durante sessão ativa -->

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Integração com API real concluída — histórico de preços implementado; modo mock disponível via `VITE_USE_REAL_API`
**Branch ativa:** main

---

## Stable decisions

| Decisão | Status | Detalhes |
|---------|--------|---------|
| Camada de serviços (`src/services/`) | ✅ Fixo | Interface `MarketService`, implementações `market.api.ts` e `market.mock.ts` |
| Hooks customizados | ✅ Fixo | `useMarketItems`, `useTopProfitable`, `useAlerts`, `useAlertPoller`, `useLastUpdateTime` |
| Alert engine + storage | ✅ Fixo | Polling via `alert.engine.ts`, persistência via `alert.storage.ts` (localStorage) |
| shadcn/ui como biblioteca de componentes | ✅ Fixo | 59 componentes em `src/components/ui/` — não editar diretamente |
| Testes E2E com Playwright | ✅ Fixo | 13 testes cobrindo dashboard, navegação e alertas |
| Estrutura de governança Claude | ✅ Fixo | CLAUDE.md, CONTEXT.md, AGENTS.md, `.claude/` com agents, rules e hooks |
| Endpoint de histórico de preços | ✅ Fixo | `/api/v2/stats/history` integrado via `PriceHistoryChart` + `usePriceHistory` |

---

## Active fronts

- Catálogo de itens em `market.api.ts` — expandido para ~50 itens, mas ainda limitado para uso real
- TypeScript sem strict mode — legado do Lovable, migração gradual pendente

---

## Open decisions

- Estratégia de expansão do catálogo: hardcoded vs. endpoint dinâmico de itens disponíveis
- Migração para TypeScript strict mode: quando e em qual escopo iniciar

---

## Recurrent pitfalls

- Componentes `src/components/ui/` não devem ser editados diretamente — quebra atualizações do shadcn/ui
- API do Albion Online não requer autenticação, mas está sujeita a rate limiting — não fazer polling agressivo
- `VITE_USE_REAL_API` deve ser `true` para usar a API real; default é modo mock
- Imports relativos `../` são proibidos — usar path alias `@/*`

---

## Next recommended steps

1. Expandir catálogo de itens além dos ~50 atuais (decisão: hardcoded ou endpoint dinâmico)
2. Adicionar filtros de cidade e tier na UI do dashboard
3. Avaliar início da migração para TypeScript strict mode
4. Criar SPEC para próxima feature antes de qualquer implementação

---

## Last handoff summary

**Sessão:** 2026-03-15
**Estado ao encerrar:** Integração com API real do Albion Online concluída; endpoint de histórico de preços implementado e integrado ao `PriceHistoryChart`. Estrutura de governança Claude expandida com templates, rules globais e documentação de metodologia (SDD, TDD, BDD, ADR). SPECs migradas para `features/<feature>/SPEC.md`.
**Retomar por:** Invocar `session-primer` → `technical-triage` para mapear estado atual e decidir próxima feature.
