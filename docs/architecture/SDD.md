# SDD.md — Software Design Document
# Albion Market Insights

Documento de referência arquitetural. Skills leem este arquivo para entender
a estrutura do sistema antes de tomar decisões de design.

---

## Visão Geral

SPA (Single Page Application) para análise de preços de mercado do Albion Online.
Permite visualizar preços, spreads e oportunidades de arbitragem entre as 7 cidades
do jogo, com suporte a dados reais via API pública e mock local.

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## Arquitetura em Camadas

```
┌─────────────────────────────────────────┐
│              Pages / Routes             │  React Router 6
├─────────────────────────────────────────┤
│           Components (UI)               │  shadcn/ui + Tailwind
│  dashboard/ · layout/ · alerts/ · ui/  │
├─────────────────────────────────────────┤
│           Custom Hooks                  │  TanStack Query
│  useMarketItems · useTopProfitable      │
│  useAlerts · useAlertPoller             │
│  useLastUpdateTime                      │
├─────────────────────────────────────────┤
│           Services Layer                │  Interface + Impl
│  MarketService (interface)              │
│  ├── ApiMarketService  → API real       │
│  └── MockMarketService → mock local     │
├─────────────────────────────────────────┤
│        Data / Types / Constants         │
│  mockData.ts · types.ts · constants.ts  │
│  ITEM_IDS · ITEM_NAMES                  │
└─────────────────────────────────────────┘
         ↕ (VITE_USE_REAL_API)
┌─────────────────────────────────────────┐
│     Albion Online Data Project API      │
│  west.albion-online-data.com            │
│  /api/v2/stats/prices/{ids}.json        │
│  /api/v2/stats/history/{ids}.json       │
└─────────────────────────────────────────┘
```

---

## Módulos Principais

### `src/services/`

| Arquivo | Responsabilidade |
|---------|-----------------|
| `market.service.ts` | Interface `MarketService` — contrato de dados |
| `market.api.ts` | `ApiMarketService` — chamadas à API real, fallback, timeout |
| `market.mock.ts` | `MockMarketService` — dados simulados para desenvolvimento |
| `market.api.types.ts` | Schemas Zod para validação das respostas da API |
| `alert.engine.ts` | Motor de avaliação de alertas de preço |
| `alert.storage.ts` | Persistência de alertas via localStorage |
| `index.ts` | Factory: seleciona impl via `VITE_USE_REAL_API` |

**Decisão chave:** a variável de ambiente `VITE_USE_REAL_API=true` seleciona
`ApiMarketService`; ausente ou falsa, usa `MockMarketService`. Transparente para hooks.

### `src/hooks/`

Todos os hooks usam TanStack Query para cache e revalidação automática.

| Hook | Dados |
|------|-------|
| `useMarketItems` | Lista completa de itens com preços por cidade |
| `useTopProfitable` | Top N itens por margem de lucro |
| `useAlerts` | Alertas configurados pelo usuário |
| `useAlertPoller` | Polling periódico para disparar alertas |
| `useLastUpdateTime` | Timestamp da última atualização dos dados |

### `src/components/`

| Diretório | Conteúdo |
|-----------|---------|
| `ui/` | 59 componentes shadcn/ui — **não editar diretamente** |
| `dashboard/` | `StatsCard`, `PriceTable`, `TopItemsPanel` |
| `layout/` | `Layout`, `Navbar`, `Footer` |
| `alerts/` | `AlertsManager` |

### `src/pages/`

| Rota | Página |
|------|--------|
| `/` | `Index` |
| `/dashboard` | `Dashboard` |
| `/alerts` | `Alerts` |
| `/about` | `About` |
| `*` | `NotFound` |

---

## Fluxo de Dados

```
Usuário acessa /dashboard
  → Dashboard renderiza
  → useMarketItems() dispara
  → TanStack Query verifica cache
  → Se miss: MarketService.getItems()
      → ApiMarketService: fetch preços + fetch histórico (paralelo por cidade)
        → Fallback para MockMarketService se API falhar
      → MockMarketService: retorna dados de mockData.ts
  → Dados normalizado para MarketItem[]
  → PriceTable renderiza com sparklines de priceHistory
```

---

## Modelo de Dados Central

```typescript
interface MarketItem {
  id: string           // ex: "T4_MAIN_SWORD"
  name: string         // ex: "Broadsword T4"
  tier: string         // "T4" | "T5" | "T6" | "T7" | "T8"
  category: string     // "Weapons" | "Armor" | etc.
  city: string         // "Caerleon" | "Bridgewatch" | etc.
  quality: number      // 1–5
  sellPrice: number    // sell_price_min
  buyPrice: number     // buy_price_max
  priceHistory: number[] // array de avg_price, 24h, mais antigo → mais recente
  lastUpdated: string  // ISO timestamp
}
```

---

## Decisões Arquiteturais Estáveis

| Decisão | Escolha | Motivo | ADR |
|---------|---------|--------|-----|
| Componentes UI | shadcn/ui | Composição sem lock-in | — |
| Estado servidor | TanStack Query | Cache + revalidação automática | — |
| Estilo | Tailwind CSS | Consistência com design system | — |
| Abstração de dados | Interface `MarketService` | Desacopla UI da fonte de dados | — |
| Persistência de alertas | localStorage | Sem backend no MVP | — |
| Testes E2E | Playwright | Cobertura de fluxos no browser real | — |
| Seleção de fonte | `VITE_USE_REAL_API` | Feature flag sem código condicional nos componentes | — |

---

## Restrições

- Sem state management global (Redux/Zustand) até necessidade real
- Chamadas de API apenas dentro de hooks ou TanStack Query — nunca direto em componentes
- CSS personalizado apenas quando Tailwind não resolve
- Componentes `ui/` não devem ser modificados diretamente
- Path alias `@/*` obrigatório — sem imports relativos `../`
