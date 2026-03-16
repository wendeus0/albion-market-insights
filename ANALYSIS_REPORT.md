# ANALYSIS_REPORT.md — Albion Market Insights

**Data:** 2026-03-16
**Branch:** main
**Último commit:** f0c0019 — Merge PR #8 (governance setup)

---

## 1. Visão Geral da Codebase

**O que faz:** Dashboard web React/TypeScript para monitoramento de preços do mercado do Albion Online. Consome a API pública `west.albion-online-data.com`, exibe preços em tempo real, histórico de preços e gerencia alertas de preço com notificações in-app.

**Padrão arquitetural:** Layered Architecture com separação clara:
- `services/` — dados e lógica de negócio
- `hooks/` — bridge entre serviços e componentes via TanStack Query
- `components/` — apresentação pura
- `pages/` — composição de views por rota

**Módulos principais:**

| Módulo | Responsabilidade |
|--------|-----------------|
| `services/market.api.ts` | Fetch da API real com fallback para mock |
| `services/alert.engine.ts` | Lógica pura de disparo de alertas |
| `services/alert.storage.ts` | Persistência de alertas em localStorage |
| `services/index.ts` | Feature flag: API real vs. mock |
| `hooks/useMarketItems.ts` | Query de itens com TanStack Query |
| `hooks/useAlertPoller.ts` | Effect de polling + notificações toast |
| `data/constants.ts` | Catálogo de itens, cidades, tiers, qualidades |
| `lib/schemas.ts` | Validação de formulários com Zod |

**Stack:** React 18, TypeScript 5.8, Vite 5, Tailwind CSS 3, TanStack Query 5, shadcn/ui (59 componentes), Recharts, React Hook Form + Zod, Vitest 4, Playwright.

---

## 2. Fluxos Críticos

### Fluxo 1: Carregamento de preços
```
Dashboard
  → useMarketItems()
    → TanStack Query (staleTime: 15min)
      → marketService.getItems()
        → [API real] ApiMarketService
            → fetch /api/v2/stats/prices (timeout 15s)
            → fetch /api/v2/stats/history × 7 cidades (paralelo)
            → merge históricos
        → [fallback/mock] MockMarketService
            → retorna mockItems pré-gerados
      → PriceTable (filtros, sort, paginação)
      → TopItemsPanel (top 5 por spread%)
```

### Fluxo 2: Criação de alerta
```
AlertsManager (form Zod/RHF)
  → onSaveAlert()
    → useSaveAlert() mutation
      → marketService.saveAlert(alert)
        → AlertStorageService → localStorage['albion_alerts']
      → invalidateQueries(['alerts']) → refetch automático
```

### Fluxo 3: Disparo de alerta
```
useAlertPoller (effect, 15min interval)
  → items + alerts em estado
    → checkAlerts(items, alerts)
      → foreach alerta ativo:
          → verifica condição (below/above/change)
          → verifica filtro de cidade
          → verifica cooldown (60min por alertId)
          → if disparado: toast.warning()
```

---

## 3. Débitos Técnicos

### P0 — Bloqueadores

| ID | Descrição | Localização | Ação |
|----|-----------|-------------|------|
| DEBT-P0-001 | **TypeScript strict mode desativado** — `noImplicitAny`, `strictNullChecks` e `noUnusedLocals` todos `false` | `tsconfig.json` | Migrar incrementalmente — começar por `services/` |
| DEBT-P0-002 | **Debug logging em produção** — `console.log/warn/error` em `market.api.ts` e `NotFound.tsx` | `src/services/market.api.ts:57,70,80,111-112`, `src/pages/NotFound.tsx:10` | Remover imediatamente (viola DoD) |
| DEBT-P0-003 | **Catálogo limitado a ~50 itens hardcoded** — Albion tem 500+ itens únicos monitoráveis | `src/data/constants.ts:15-92` | Criar SPEC para expansão de catálogo |

### P1 — Urgentes

| ID | Descrição | Localização | Ação |
|----|-----------|-------------|------|
| DEBT-P1-001 | **Rate limiting da API não tratado** — 350 requisições paralelas sem backoff exponencial ou retry | `src/services/market.api.ts:96-103` | Implementar backoff + circuit breaker |
| DEBT-P1-002 | **Performance: N+1 fetch para histórico** — 7 requisições por carga sem cache entre sessões | `src/services/market.api.ts:63-114` | Cache em localStorage com TTL |
| DEBT-P1-003 | **ESLint warnings em shadcn/ui** — 7 warnings `react-refresh/only-export-components` | `src/components/ui/` (7 arquivos) | Aceitar como trade-off ou aguardar update shadcn/ui |
| DEBT-P1-004 | **Bundle size acima de limite** — 520KB minificado sem code-splitting por rota | Build output | Lazy loading de rotas com React.lazy() |

### P2 — Importantes

| ID | Descrição | Localização | Ação |
|----|-----------|-------------|------|
| DEBT-P2-001 | **Filtros de dashboard ausentes** — sem busca por Tier/Categoria/Cidade no nível de página | Dashboard layout | Criar SPEC: "Filtros de Dashboard" |
| DEBT-P2-002 | **Cobertura insuficiente de fallback** — sem teste que valida dados do mock após fallback de erro | `src/test/market.api.test.ts` | Adicionar 1-2 testes de integração de fallback |
| DEBT-P2-003 | **ADR-004 ausente** — decisão de localStorage documentada em MEMORY.md mas sem arquivo formal | `docs/adr/` (ausente) | Criar `ADR-004-localStorage-alertas.md` |
| DEBT-P2-004 | **Sem testes E2E de alerta end-to-end** — fluxo criar→persistir→disparar não tem cobertura E2E | `e2e/` | Adicionar cenário Playwright completo |

---

## 4. Saúde de Dependências

**Status geral: `DEP_OK_WITH_UPDATES_AVAILABLE`**
**Vulnerabilidades críticas:** 0 (npm audit limpo)

### Atualizações prioritárias

| Pacote | Atual | Latest | Risco | Prioridade |
|--------|-------|--------|-------|------------|
| `@hookform/resolvers` | 3.10.0 | 5.2.2 | ALTO — 2 major versions | P1 |
| `vite` | 5.4.19 | 8.0.0 | ALTO — 2 major versions | P1 |
| `recharts` | 2.15.4 | 3.8.0 | MÉDIO — breaking API | P2 |
| `zod` | 3.25.76 | 4.3.6 | MÉDIO — breaking schemas | P2 |
| `date-fns` | 3.6.0 | 4.1.0 | MÉDIO — treeshake changes | P2 |
| `@tanstack/react-query` | 5.83.0 | 5.90.21 | BAIXO — safe patch | P2 |
| `@playwright/test` | 1.49.1 | 1.58.2 | BAIXO — patches | P2 |

### Variáveis de ambiente

| Variável | Status | Uso |
|----------|--------|-----|
| `VITE_USE_REAL_API` | Documentada (`.env.example`) | Feature flag: API real vs. mock |
| `CI` | Implícita em CI runners | Playwright E2E config |

---

## 5. Cobertura de Testes

Relatório pré-gerado não disponível. Estimativa por análise estática:

| Módulo | Testes | Estimativa cobertura |
|--------|--------|---------------------|
| `alert.engine.ts` | 10 testes (todos os fluxos principais) | ~95% |
| `alert.storage.ts` | 9 testes (CRUD completo) | ~90% |
| `market.api.ts` | 6 testes (fetch, erro, timeout, fallback) | ~70% |
| `market.mock.ts` | 11 testes (interface completa) | ~85% |
| `AlertsManager.tsx` | 8 testes (render, submit, validate) | ~60% |
| `useMarketItems.ts` | 5 testes (loading, data, error) | ~70% |
| `useAlertPoller.ts` | 0 testes | 0% — gap crítico |
| `market.api.ts` (fallback path) | Parcial | ~40% — gap identificado |
| `Dashboard.tsx` | 0 testes | 0% — gap existente |
| `PriceTable.tsx` | 0 testes | 0% — gap existente |

**Gap mais crítico:** `useAlertPoller.ts` — lógica de polling, cooldown e notificação sem nenhum teste.

---

## 6. Oportunidades de Aprimoramento

Ordenadas por impacto estimado:

### Alta Impacto

1. **Expansão do catálogo de itens via endpoint dinâmico**
   - Albion tem 500+ itens; hoje apenas 50 são monitoráveis
   - Abordagem: buscar lista de itens da API, cache local com TTL
   - Impacto: aumenta valor do produto dramaticamente

2. **Code-splitting por rota**
   - React.lazy() para Dashboard, Alerts, About
   - Reduz bundle inicial em ~40% (gráficos Recharts e tabelas pesadas)
   - Melhora LCP e FCP significativamente

3. **Cache de histórico com TTL**
   - Evita 7 requisições a cada carregamento
   - localStorage com invalidação por timestamp
   - Possibilita modo offline parcial

### Médio Impacto

4. **TypeScript strict mode incremental**
   - Começar por `services/` e `lib/` (menor superfície)
   - Reduz bugs de runtime, melhora autocompletar
   - Pode ser feito gradualmente por módulo

5. **Backoff exponencial na API**
   - Previne 429s e banimento de IP
   - Retry automático com jitter
   - Melhora resiliência em produção

6. **Observabilidade básica**
   - Logging estruturado para substituir console.*
   - Substituir por solução como Sentry (error tracking) ou DataDog
   - Hoje há zero visibilidade sobre erros em produção

### Baixo Impacto

7. **Persistência de filtros em query params**
   - Usuário perde filtros ao navegar entre páginas
   - React Router search params resolve com pouco esforço

8. **Testes de `useAlertPoller`**
   - Hoje zero cobertura; lógica de cooldown e polling é crítica
   - Mock de timer com `vi.useFakeTimers()`

9. **ADR-004 formal**
   - Documenta decisão de localStorage para alertas
   - Baixo esforço, alto valor documental

---

## 7. Próximos Passos Recomendados

Prioridade sugerida para próxima sessão:

1. **Imediato (P0):** Remover `console.log/warn/error` de `market.api.ts` e `NotFound.tsx` — viola DoD
2. **Imediato (P2):** Criar `docs/adr/ADR-004-localStorage-alertas.md` — baixo esforço, fecha pendência
3. **Próximo sprint (P0):** Criar SPEC para expansão do catálogo de itens
4. **Próximo sprint (P1):** Implementar backoff exponencial + cache de histórico
5. **Sprint 2:** Code-splitting de rotas e atualização de `@hookform/resolvers` + `vite`
6. **Backlog:** TypeScript strict mode incremental; testes para `useAlertPoller`

---

*Relatório gerado por codebase-analysis em 2026-03-16*
