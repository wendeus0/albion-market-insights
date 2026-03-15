# CONTEXT.md — Albion Market Insights

## O Projeto

**Albion Market Insights** é um dashboard web para análise de preços de mercado do jogo Albion Online. O objetivo é oferecer aos jogadores uma visão consolidada de preços, spreads e oportunidades de lucro entre as 7 principais cidades do jogo.

Este é o **segundo repositório** do ecossistema `wendeus0`, desenvolvido em pair programming com IA como segunda frente de trabalho além do AIgnt-OS. O projeto está sendo refatorado e recriado com base em princípios mais sólidos de arquitetura de software.

---

## Filosofia de Desenvolvimento

Este projeto adota uma metodologia explícita baseada em quatro pilares. Cada um resolve um problema concreto de qualidade e previsibilidade. A documentação operacional completa está em `docs/architecture/`.

### Spec-Driven Development (SDD)
Nenhuma linha de código é escrita sem uma SPEC aprovada. A SPEC define *o quê* — comportamento esperado, critérios de aceitação e escopo. O *como* é responsabilidade da implementação.

**Problema que resolve:** evita implementações que resolvem o problema errado ou expandem escopo silenciosamente.

### Test-Driven Development (TDD) com BDD
Testes escritos *antes* da implementação, a partir dos critérios de aceitação da SPEC. Ciclo: RED → GREEN → REFACTOR. Os critérios usam formato **Given/When/Then** (BDD), tornando cada critério diretamente rastreável a um teste.

**Problema que resolve:** testes escritos após a implementação testam o código como foi escrito, não o comportamento esperado.

### Definition of Done (DoD)
Uma feature só está concluída quando: SPEC aprovada, testes passando, lint e build limpos, code review sem blockers, security review concluída, ADR criado se necessário, commit e PR abertos. Consulte `docs/architecture/TDD.md` para o DoD completo.

**Problema que resolve:** sem DoD explícito, "pronto" significa coisas diferentes em momentos diferentes.

### Architecture Decision Records (ADR)
Decisões arquiteturais estáveis são registradas em `docs/adr/`. Cada ADR tem status rastreável e cadência de revisão definida. Consulte `docs/architecture/TDD.md` para critérios e cadência.

---

### Princípios de trabalho
- **Component-first**: cada feature começa pelo design do componente, não pelo dado
- **Incremental**: uma feature por vez, entregável a cada ciclo
- **Pair programming com IA**: Claude atua como co-piloto, não como executor autônomo

---

## Stack Técnica

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.8.3 | Tipagem estática |
| Vite | 5.4.19 | Build tool e dev server |
| Tailwind CSS | 3.4.17 | Estilização utilitária |
| shadcn/ui | — | Biblioteca de componentes (Radix UI) |
| React Router | 6.30.1 | Roteamento client-side |
| TanStack Query | 5.83.0 | Data fetching e cache |
| Recharts | 2.15.4 | Visualizações e gráficos |
| React Hook Form | 7.61.1 | Gerenciamento de formulários |
| Zod | 3.25.76 | Validação de esquemas |
| Lucide React | 0.462.0 | Ícones |

---

## Modelo de Domínio

### Cidades de Mercado
```
Caerleon · Bridgewatch · Fort Sterling · Lymhurst · Martlock · Thetford · Black Market
```

### Sistema de Tiers
```
T4 · T5 · T6 · T7 · T8
```

### Qualidades de Item
```
Normal · Good · Outstanding · Excellent · Masterpiece
```

### Conceitos-Chave
- **Spread**: diferença de preço entre cidades (oportunidade de arbitragem)
- **Margem de lucro**: spread após descontar taxas de transação
- **Histórico de preços**: evolução temporal do preço de um item em uma cidade

---

## Estrutura Atual

```
src/
├── components/
│   ├── ui/          # shadcn/ui (59 componentes — não editar diretamente)
│   ├── dashboard/   # StatsCard, PriceTable, TopItemsPanel
│   ├── layout/      # Layout, Navbar, Footer
│   └── alerts/      # AlertsManager
├── pages/           # Dashboard, Index, Alerts, About, NotFound
├── hooks/           # use-mobile, use-toast, useAlerts, useAlertPoller,
│                    # useLastUpdateTime, useMarketItems, useTopProfitable
├── services/        # Camada de serviços (market.service.ts, market.api.ts,
│                    # market.api.types.ts, market.mock.ts, alert.engine.ts,
│                    # alert.storage.ts, index.ts)
├── lib/             # utils.ts, schemas.ts
├── data/            # mockData.ts, types.ts, constants.ts
└── test/            # Setup e testes unitários (Vitest)

e2e/                 # Testes E2E com Playwright
├── alerts.spec.ts
├── dashboard.spec.ts
└── navigation.spec.ts
```

### Rotas
| Rota | Página |
|------|--------|
| `/` | Index |
| `/dashboard` | Dashboard |
| `/alerts` | Alerts |
| `/about` | About |
| `*` | NotFound |

---

## Estado Atual (2026-03)

- Estrutura de governança importada do AIgnt-OS (CLAUDE.md, CONTEXT.md, AGENTS.md, `.claude/`)
- Camada de serviços implementada (`src/services/`) — abstrai API real e mock data
- Hooks customizados extraídos dos componentes (`src/hooks/`)
- Sistema de alertas com engine de polling e persistência em localStorage
- Testes E2E com Playwright (13 testes passando)
- `market.api.ts` integrado com a API real (`west.albion-online-data.com`)
- Seletor de fonte de dados: variável de ambiente `VITE_USE_REAL_API=true` ativa a API real (default: mock)
- Próximo passo: SPEC formal da integração API e expansão do catálogo de itens

---

## Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Componentes UI | shadcn/ui | Composição flexível, sem lock-in |
| Estado servidor | TanStack Query | Cache automático, revalidação |
| Estilos | Tailwind CSS | Consistência com design system |
| Dados | Mock → API Albion | Desenvolvimento offline primeiro |
| TypeScript | Sem strict mode | Migração gradual do código Lovable |
| Camada de serviços | Interface `MarketService` | Desacopla componentes da fonte de dados |
| Persistência de alertas | localStorage via `AlertStorageService` | Sem backend necessário no MVP |
| Testes E2E | Playwright | Cobertura de fluxos críticos no browser real |

---

## Restrições MVP

- Evitar state management global complexo (Redux, Zustand) até necessidade real
- Evitar chamadas de API diretas fora de hooks ou TanStack Query
- Evitar CSS personalizado quando Tailwind resolve
- Foco em funcionalidade estável antes de otimizações de performance
