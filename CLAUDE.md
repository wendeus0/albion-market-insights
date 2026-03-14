# CLAUDE.md — Albion Market Insights

## Pré-requisitos

Antes de qualquer modificação, revise:

1. **CONTEXT.md** — Contexto, filosofia e stack técnica do projeto
2. **AGENTS.md** — Governança de agentes e workflow oficial
3. Arquivo de SPEC da feature relevante (quando existir)

---

## Comandos de Validação

```bash
# Verificação completa antes de commit
npm run lint && npm run build

# Desenvolvimento local
npm run dev

# Preview do build de produção
npm run preview
```

Sempre execute `npm run lint && npm run build` antes de commitar. Build quebrado = commit bloqueado.

---

## Visão Arquitetural

**Albion Market Insights** é uma SPA (Single Page Application) para análise de preços de mercado do jogo Albion Online.

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS 3 |
| Componentes | shadcn/ui (Radix UI) |
| Roteamento | React Router 6 |
| Data fetching | TanStack Query 5 |
| Gráficos | Recharts 2 |
| Formulários | React Hook Form + Zod |
| Ícones | Lucide React |

### Estrutura de Diretórios

```
src/
├── components/
│   ├── ui/          # Componentes shadcn/ui (não modificar diretamente)
│   ├── dashboard/   # Componentes do dashboard (StatsCard, PriceTable, TopItemsPanel)
│   ├── layout/      # Layout, Navbar, Footer
│   └── alerts/      # AlertsManager
├── pages/           # Páginas (Dashboard, Index, Alerts, About, NotFound)
├── hooks/           # Custom hooks (use-mobile, use-toast)
├── lib/             # Utilitários (utils.ts)
└── data/            # Dados e tipos (mockData.ts)
```

### Path Alias

```typescript
// Use @/* para imports absolutos
import { Button } from "@/components/ui/button"
import { mockItems } from "@/data/mockData"
```

---

## Convenções de Código

- **Componentes**: PascalCase, um componente por arquivo
- **Hooks**: camelCase com prefixo `use`
- **Tipos**: interfaces TypeScript — definir próximo ao uso ou em `mockData.ts`
- **Estilos**: Tailwind CSS com classes utilitárias; evitar CSS inline
- **Componentes UI**: sempre usar shadcn/ui quando disponível antes de criar do zero
- **Imports**: path alias `@/*` obrigatório (sem imports relativos de `../`)

---

## Modelo de Domínio

- **Cidades**: Caerleon, Bridgewatch, Fort Sterling, Lymhurst, Martlock, Thetford, Black Market
- **Tiers**: T4, T5, T6, T7, T8
- **Qualidades**: Normal, Good, Outstanding, Excellent, Masterpiece
- **Dados**: `src/data/mockData.ts` — fonte atual dos dados de mercado

---

## Workflow Oficial

```
SPEC → COMPONENT_DESIGN → IMPLEMENT → REVIEW → QA → COMMIT
```

Consulte `AGENTS.md` para detalhes de cada fase e papel dos agentes.
