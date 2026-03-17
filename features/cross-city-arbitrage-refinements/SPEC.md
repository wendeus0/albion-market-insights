# SPEC — Cross-City Arbitrage Refinements

**Status:** Implementada
**Data:** 2026-03-17
**Autor:** OpenCode

---

## Contexto e Motivação

O modo `Cross-City Arbitrage` já existe no dashboard, mas duas melhorias seguem em
aberto para completar a experiência:

1. o preview da home ainda mostra a visão local antiga em vez da melhor rota de arbitragem
2. a tabela nova ainda não permite filtrar oportunidades por lucro mínimo ou ROI mínimo

Sem esses refinamentos, a home comunica uma visão inconsistente do produto e o
usuário precisa inspecionar manualmente oportunidades pouco interessantes no modo
novo do dashboard.

## Problema a Resolver

O sistema atual não consegue:

1. refletir a visão cross-city no preview principal da home
2. limitar a lista de oportunidades por lucro líquido mínimo
3. limitar a lista de oportunidades por ROI mínimo

## Fora do Escopo

- novos cálculos de taxa de mercado
- configuração personalizada de taxa pelo usuário
- persistência de filtros no `localStorage`
- mudança no contrato da API ou no serviço de mercado
- edição de `src/components/ui/`

## Critérios de Aceitação

### AC-1: Preview da home alinhado com arbitragem

**Given** que o usuário está na home (`/`)
**When** visualiza a área de preview do dashboard
**Then** deve ver rotas de arbitragem cross-city em vez do painel local antigo

### AC-2: Tabela preview da home alinhada com arbitragem

**Given** que a home exibe a seção principal de dados
**When** o usuário rola até a tabela preview
**Then** deve ver a visão de arbitragem com cidade de compra, cidade de venda, lucro líquido e ROI

### AC-3: Filtro por lucro líquido mínimo

**Given** que o usuário está no modo `Cross-City Arbitrage`
**When** informa um valor mínimo de lucro líquido
**Then** apenas oportunidades com `netProfit >= valor informado` devem permanecer visíveis

### AC-4: Filtro por ROI mínimo

**Given** que o usuário está no modo `Cross-City Arbitrage`
**When** informa um valor mínimo de ROI
**Then** apenas oportunidades com `netProfitPercent >= valor informado` devem permanecer visíveis

### AC-5: Combinação de filtros de arbitragem

**Given** que o usuário aplica busca textual e filtros mínimos de lucro/ROI
**When** a lista é recalculada
**Then** o resultado final deve respeitar todos os filtros simultaneamente

## Dependências

- `features/cross-city-arbitrage/SPEC.md` implementada
- `src/lib/arbitrage.ts` como fonte da regra de negócio
- `src/components/dashboard/ArbitrageTable.tsx` e `src/components/dashboard/TopArbitragePanel.tsx`

## Riscos e Incertezas

- a home pode ficar mais densa visualmente se o preview não for contido
- thresholds altos podem gerar estado vazio com frequência
- ainda não haverá persistência dos filtros após navegação

## Referências

- `src/pages/Index.tsx`
- `src/components/dashboard/ArbitrageTable.tsx`
- `src/components/dashboard/TopArbitragePanel.tsx`
- `features/cross-city-arbitrage/SPEC.md`
