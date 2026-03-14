# memory.md — Memória Persistente de Sessão

## Estado do Projeto (2026-03-14)

**Plataforma**: Dashboard web React + TypeScript para análise de mercado do Albion Online
**Status**: Frente 1 em andamento — cobertura comportamental E2E
**Branch de trabalho**: `claude/copy-config-between-repos-NZJ9E`

---

## Roadmap Aprovado (3 Frentes)

### Frente 1 — Cobertura comportamental (E2E) ← ATUAL
**Objetivo**: Rede de segurança antes de qualquer refatoração
**Ferramentas**: Playwright (E2E) + Vitest/Testing Library (componentes)
**Fluxo lógico**: Testes E2E testam comportamento visível ao usuário — sobrevivem a refatorações internas

### Frente 2 — Camada de serviço + testes unitários/integração
**Objetivo**: Desacoplar UI de mockData; escrever testes contra contratos de serviço
**Critério de conclusão**: Nenhum arquivo em `src/pages/` ou `src/components/` importa de `mockData.ts` diretamente

### Frente 3 — API real + persistência
**Objetivo**: Albion Online Data Project API + Supabase/localStorage para alertas
**API**: `https://west.albion-online-data.com/api/v2/stats/prices/{item_id}`

---

## Decisões Arquiteturais Registradas

| Decisão | Status | Detalhes |
|---------|--------|---------|
| Estrutura organizacional AIgnt-OS | ✅ Concluído | CLAUDE.md, CONTEXT.md, AGENTS.md, agents/, settings.json |
| Stack migration: TanStack ecosystem | ✅ Concluído | TanStack Router + Query + Virtual, Zustand, TypeScript strict |
| TypeScript strict: true | ✅ Concluído | noUnusedLocals, noUnusedParameters habilitados |
| react-router-dom removido | ✅ Concluído | Substituído por @tanstack/react-router |
| Virtualização do PriceTable | ✅ Concluído | @tanstack/react-virtual — apenas rows visíveis no DOM |
| Zustand store de filtros | ✅ Concluído | `src/store/marketFilters.ts` |
| useMarketItems hook | ✅ Criado | `src/hooks/useMarketItems.ts` — TanStack Query, 15min staleTime |
| Playwright E2E | 🔄 Em andamento | Frente 1 |
| Camada de serviço | ⏳ Planejado | `src/services/market.service.ts` — Frente 2 |
| API Albion Online Data Project | ⏳ Planejado | Frente 3 |

---

## Problemas Identificados (a corrigir na Frente 2)

| Problema | Arquivo(s) | Prioridade |
|---------|-----------|-----------|
| Importação direta de mockData | Index.tsx, Dashboard.tsx | CRÍTICO |
| AlertsManager faz find() em mockItems | AlertsManager.tsx:85 | CRÍTICO |
| useMarketItems hook criado mas não usado | useMarketItems.ts | ALTO |
| cities/tiers/qualities importados de mockData | PriceTable.tsx | MÉDIO |

---

## Riscos Conhecidos

- AlertsManager acoplado ao mockItems.find() — refatoração necessária antes dos testes unitários
- Playwright requer servidor rodando para testes E2E (configurar baseURL)
- API Albion Online Data Project usa item_id no formato `T4_MAIN_SWORD` (não o mesmo que mockData)

---

## Contexto de Sessões Anteriores

- `2026-03-14`: Estrutura de governança Claude copiada do AIgnt-OS e adaptada para o projeto web
- `2026-03-14`: Stack migrada — TanStack Router, Zustand, Virtual, TypeScript strict, Vitest configurado
- `2026-03-14`: Roadmap de 3 frentes aprovado — iniciando Frente 1 (E2E com Playwright)
