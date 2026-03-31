# CONTEXT.md — Albion Market Insights

## O Projeto

Albion Market Insights é um dashboard web para análise de mercado do Albion Online, com foco em preços, spreads e oportunidades de arbitragem entre as principais cidades do jogo.

O repositório segue um fluxo orientado a especificação (SPEC), testes (TDD/BDD) e decisões arquiteturais registradas em ADR.

---

## Filosofia de Desenvolvimento

### SDD (Spec-Driven Development)

Nenhuma implementação começa sem SPEC aprovada com critérios verificáveis.

### TDD/BDD

Ciclo RED → GREEN → REFACTOR, com cenários Given/When/Then rastreáveis aos critérios da SPEC.

### Definition of Done (DoD)

Uma entrega só fecha quando passa por qualidade técnica (lint/typecheck/test/build), review e documentação de decisão quando necessário.

### ADR (Architecture Decision Record)

Decisões duráveis de arquitetura são registradas em `docs/adr/`.

---

## Stack Técnica

| Tecnologia            | Versão           | Papel                  |
| --------------------- | ---------------- | ---------------------- |
| React                 | 18.3.1           | UI                     |
| TypeScript            | 5.8.3            | Tipagem estática       |
| Vite                  | 7.3.1            | Build e dev server     |
| Tailwind CSS          | 3.4.17           | Estilos                |
| shadcn/ui + Radix     | —                | Componentes base       |
| React Router          | 6.30.1           | Rotas                  |
| TanStack Query        | 5.83.0           | Estado de servidor     |
| Recharts              | 2.15.4           | Visualização           |
| React Hook Form + Zod | 7.61.1 / 3.25.76 | Formulário e validação |
| Vitest                | 4.1.0            | Testes unitários       |
| Playwright            | 1.58.2           | Testes E2E             |

---

## Estrutura Atual

```
src/
├── components/
│   ├── ui/                 # Base shadcn/ui
│   ├── dashboard/          # Tabela, arbitragem, cards, badges
│   ├── layout/             # AppLayout, Navbar, Footer
│   └── alerts/             # AlertsManager
├── pages/                  # Index, Dashboard, Alerts, About, NotFound
├── hooks/                  # alerts, price table (filters/sort/pagination), data source
├── services/               # market.api/mock/cache, alert storage/engine, cooldown
├── data/                   # constants e mockData
├── lib/                    # utilitários e schemas
└── test/                   # testes unitários/integrados

e2e/                        # specs E2E Playwright
```

### Rotas

| Rota         | Página    |
| ------------ | --------- |
| `/`          | Index     |
| `/dashboard` | Dashboard |
| `/alerts`    | Alerts    |
| `/about`     | About     |
| `*`          | NotFound  |

---

## Estado Atual (2026-03)

- Refatorações estruturais principais concluídas (layout compartilhado e extração de hooks críticos).
- `quality:gate` consolidado com lint + typecheck + testes com cobertura + build.
- CI com lane paralela de runtime para validação progressiva:
  - Node 24 = default operacional
  - Node 20 = lane de fallback temporária
- Testes E2E smoke executados no CI (`e2e/navigation.spec.ts`).
- Catálogo com suporte a encantamentos e filtros avançados em produção.
- Persistências locais ativas:
  - Alertas: `localStorage`
  - Cache de mercado com TTL: `localStorage`

---

## Runtime e CI (política vigente)

- `engines.node`: `>=24.0.0`.
- Estratégia atual: Node 24 promovido para default após janela de estabilidade confirmada.
- Rollback rápido previsto: reduzir matrix para Node 24 apenas em caso de regressão.
- Runbook oficial de promoção/rollback: `docs/architecture/NODE24_PROMOTION_RUNBOOK.md`.

---

## Decisões Arquiteturais Ativas

| Tema                    | Escolha atual                        | Motivo                                  |
| ----------------------- | ------------------------------------ | --------------------------------------- |
| Fonte de dados          | `MarketService` com seleção por flag | Desacoplamento e determinismo em testes |
| Persistência de alertas | localStorage                         | Simplicidade para frontend-only         |
| Cache de mercado        | localStorage com TTL                 | Menor latência e menor pressão na API   |
| Qualidade CI            | quality gate + smoke E2E             | Cobertura de regressões de integração   |
| Runtime                 | Node 20 default + Node 24 observação | Migração segura e progressiva           |

---

## Restrições vigentes

- Sem backend próprio no escopo atual.
- Sem versionamento de `dist/` no repositório.
- Sem chamadas diretas à API fora da camada de serviços.
- Mudança de runtime default só após janela mínima de estabilidade da lane paralela.
