# memory.md — Memória Persistente de Sessão

## Estado do Projeto (2026-03-14)

**Plataforma**: Dashboard web React + TypeScript para análise de mercado do Albion Online
**Status**: Refatoração concluída — arquitetura de serviços, hooks e testes implementados
**Branch de trabalho**: `claude/plan-restructuring-steps-5rpte`

---

## Decisões Arquiteturais Registradas

| Decisão | Status | Detalhes |
|---------|--------|---------|
| Copiar estrutura organizacional do AIgnt-OS | ✅ Concluído | CLAUDE.md, CONTEXT.md, AGENTS.md, agents/, settings.json criados |
| Camada de serviços (`src/services/`) | ✅ Concluído | Interface `MarketService`, implementações API + mock |
| Hooks customizados | ✅ Concluído | useMarketItems, useTopProfitable, useAlerts, useAlertPoller, useLastUpdateTime |
| Alert engine + storage | ✅ Concluído | Polling via `alert.engine.ts`, persistência via `alert.storage.ts` (localStorage) |
| Testes E2E com Playwright | ✅ Concluído | 13 testes passando: dashboard, navigation, alerts |
| Dados em modo mock | 🔄 Temporário | `src/data/mockData.ts` — substituir via `VITE_USE_REAL_API=true` |
| shadcn/ui como biblioteca de componentes | ✅ Fixo | 59 componentes disponíveis em `src/components/ui/` |
| TypeScript sem strict mode | 🔄 Revisitar | Legado do Lovable — migrar gradualmente |

---

## Estrutura de Governança Importada do AIgnt-OS

Workflow: `SPEC → COMPONENT_DESIGN → IMPLEMENT → REVIEW → QA → COMMIT`

Agentes disponíveis:
- `explorer` — mapeamento read-only antes de implementar
- `worker` — implementação focada dentro do escopo
- `reviewer` — code review read-only antes do commit
- `monitor` — coleta de evidências em falhas

---

## Próximos Passos

1. Criar SPEC formal da integração com a API real do Albion Online
2. Expandir catálogo de itens em `market.api.ts` (atualmente apenas 20 itens)
3. Adicionar filtros de cidade e tier na UI do dashboard
4. Avaliar TypeScript strict mode (migração gradual)
5. Adicionar histórico de preços real (endpoint `/api/v2/stats/history`)

---

## Riscos Conhecidos

- `market.api.ts` lista apenas 20 itens hardcoded — catálogo limitado para uso real
- TypeScript sem strict mode pode mascarar erros de tipo
- Componentes shadcn/ui não devem ser editados diretamente (quebra atualizações)
- API do Albion Online sem autenticação, mas sujeita a rate limiting

---

## Contexto de Sessões Anteriores

- `2026-03-14 (sessão 1)`: Estrutura de governança Claude copiada do AIgnt-OS e adaptada para o projeto web
- `2026-03-14 (sessão 2)`: Camada de serviços, hooks customizados, alert engine, alert storage implementados
- `2026-03-14 (sessão 3)`: 13 testes E2E com Playwright criados e passando; melhorias no sistema de alertas
- `2026-03-14 (sessão 4)`: CONTEXT.md e memory.md atualizados para refletir arquitetura atual; SPEC-real-api criada
