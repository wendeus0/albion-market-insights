# CONTEXT.md — Albion Market Insights

## O Projeto

**Albion Market Insights** é um dashboard web para análise de preços de mercado do jogo Albion Online. O objetivo é oferecer aos jogadores uma visão consolidada de preços, spreads e oportunidades de lucro entre as 7 principais cidades do jogo.

Este é o **segundo repositório** do ecossistema `wendeus0`, desenvolvido em pair programming com IA como segunda frente de trabalho além do AIgnt-OS. O projeto está sendo refatorado e recriado com base em princípios mais sólidos de arquitetura de software.

---

## Filosofia de Desenvolvimento

- **Component-first**: cada feature começa pelo design do componente, não pelo dado
- **Spec-driven**: escrever SPEC antes de implementar — clareza sobre o quê antes do como
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
├── hooks/           # use-mobile, use-toast
├── lib/             # utils.ts
└── data/            # mockData.ts (fonte de dados atual)
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

- Projeto gerado pelo Lovable com estrutura base funcional
- Dados ainda em modo mock (`src/data/mockData.ts`)
- Fase de refatoração iniciada — reescrita seguindo princípios de arquitetura mais sólidos
- Integração com API real do Albion Online planejada para fase posterior

---

## Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Componentes UI | shadcn/ui | Composição flexível, sem lock-in |
| Estado servidor | TanStack Query | Cache automático, revalidação |
| Estilos | Tailwind CSS | Consistência com design system |
| Dados | Mock → API Albion | Desenvolvimento offline primeiro |
| TypeScript | Sem strict mode | Migração gradual do código Lovable |

---

## Restrições MVP

- Evitar state management global complexo (Redux, Zustand) até necessidade real
- Evitar chamadas de API diretas fora de hooks ou TanStack Query
- Evitar CSS personalizado quando Tailwind resolve
- Foco em funcionalidade estável antes de otimizações de performance
