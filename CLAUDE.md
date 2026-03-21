# CLAUDE.md — Albion Market Insights

@AGENTS.md

## Comandos de Validação

```bash
npm run lint && npm run build   # obrigatório antes de commit
npm run test                    # testes unitários (Vitest — single run)
npm run test:e2e                # testes E2E (Playwright)
npm run dev                     # desenvolvimento local (http://localhost:8080)
npm run preview                 # preview do build de produção
```

`npm run lint && npm run build` deve passar sem erros antes de qualquer commit.

---

## Stack

| Camada           | Tecnologia                 |
| ---------------- | -------------------------- |
| Framework        | React 18 + TypeScript      |
| Build            | Vite 5                     |
| Estilos          | Tailwind CSS 3             |
| Componentes      | shadcn/ui (Radix UI)       |
| Roteamento       | React Router 6             |
| Data fetching    | TanStack Query 5           |
| Gráficos         | Recharts 2                 |
| Formulários      | React Hook Form + Zod      |
| Ícones           | Lucide React               |
| Testes unitários | Vitest 4 + Testing Library |
| Testes E2E       | Playwright 1.49            |

---

## Estrutura Principal

```
src/
├── components/
│   ├── ui/          # shadcn/ui — não modificar diretamente
│   ├── dashboard/   # StatsCard, PriceTable, TopItemsPanel
│   ├── layout/      # Layout, Navbar, Footer
│   └── alerts/      # AlertsManager
├── pages/           # Index, Dashboard, Alerts, About, NotFound
├── hooks/           # useMarketItems, useTopProfitable, useAlerts, useAlertPoller, useLastUpdateTime
├── services/        # MarketService interface + market.api.ts + market.mock.ts + alert engine
├── lib/             # utils.ts, schemas.ts
├── data/            # constants.ts (ITEM_IDS, ITEM_NAMES), types.ts, mockData.ts
└── test/            # Testes unitários Vitest
```

---

## Convenções de Código

- **Componentes**: PascalCase, um por arquivo
- **Hooks**: camelCase com prefixo `use`
- **Tipos**: interfaces TypeScript — definir em `types.ts` ou próximo ao uso
- **Estilos**: Tailwind CSS; evitar CSS inline
- **Componentes UI**: usar shadcn/ui sempre que disponível
- **Imports**: path alias `@/*` obrigatório — sem imports relativos `../`

---

## Ambiente

- `VITE_USE_REAL_API=true` — ativa a API real (west.albion-online-data.com)
- Sem essa variável: modo mock (padrão para testes E2E)

---

## Workflow

Meta-skill `implement-feature` orquestra o ciclo completo.
Consulte `AGENTS.md` para fluxo de etapas, regras críticas e Definition of Done.

---

## Memória

Estado durável desta sessão: `memory/MEMORY.md` (índice) → arquivos temáticos em `memory/`.
Convenção de formato: `.claude/rules/memory.md`.

Antes de consolidar memória, handoff ou abertura/fechamento de sessão com impacto de Git/PRs, executar `bash .claude/scripts/git-sync-check.sh` para validar o estado remoto/local.
