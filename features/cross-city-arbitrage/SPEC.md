# SPEC — Cross-City Arbitrage

**Status:** Implementada
**Data:** 2026-03-17
**Autor:** OpenCode

---

## Contexto e Motivação

O dashboard atual exibe `MarketItem` por cidade e calcula `spread` com base em
`sellPrice - buyPrice` dentro da mesma linha. Isso produz resultados irreais em
cenários onde a cidade possui buy orders anômalas (ex.: buy price = 1 prata),
inflando o percentual de spread e escondendo a oportunidade real do jogador:
comprar em uma cidade e vender em outra.

Para traders de Albion Online, a informação útil não é apenas “qual item tem um
spread alto”, mas sim:

1. em qual cidade comprar
2. em qual cidade vender
3. qual o lucro líquido esperado após taxa de mercado
4. qual o percentual de retorno da operação

## Problema a Resolver

O sistema atual não consegue:

1. agrupar preços do mesmo item entre cidades para formar uma rota de arbitragem
2. indicar explicitamente cidade de compra e cidade de venda
3. descontar taxa de transação ao calcular o lucro real do jogador
4. evitar que buy orders anômalas dominem o ranking de oportunidades

## Fora do Escopo

- cálculo de custo logístico/risco de transporte entre cidades
- suporte a taxa configurável por usuário neste ciclo
- alteração do sistema de alertas
- alteração do contrato da API pública
- edição de componentes em `src/components/ui/`

## Decisão de Produto

Adicionar um modo de visualização chamado **Cross-City Arbitrage** no dashboard.
Nesse modo, os dados serão agregados por item e qualidade para exibir a melhor
rota disponível entre cidades.

Para o cálculo de lucro líquido, usar taxa fixa de mercado de **6.5%** sobre o
preço de venda, representando uma aproximação conservadora da taxa efetiva para
o jogador neste ciclo.

## Critérios de Aceitação

### AC-1: Alternância de modo no dashboard

**Given** que o usuário está no dashboard
**When** visualiza a área principal de dados
**Then** deve conseguir alternar entre os modos `Local Spread` e `Cross-City Arbitrage`

### AC-2: Agregação por item entre cidades

**Given** múltiplas entradas do mesmo `itemId` em cidades diferentes
**When** o modo `Cross-City Arbitrage` é selecionado
**Then** o sistema deve consolidar essas entradas em uma única oportunidade com:
- menor `sellPrice` válido como origem de compra
- maior `buyPrice` válido em cidade diferente como destino de venda

### AC-3: Exibição de rota explícita

**Given** uma oportunidade de arbitragem válida
**When** ela é renderizada na tabela
**Then** a UI deve mostrar claramente:
- item
- cidade de compra
- preço de compra
- cidade de venda
- preço de venda

### AC-4: Lucro líquido com taxa

**Given** uma oportunidade com compra e venda válidas
**When** o lucro é calculado
**Then** o valor deve ser `sellPrice * (1 - 0.065) - buyPrice`
**And** o percentual de lucro deve ser calculado sobre o custo de compra

### AC-5: Exclusão de oportunidades irreais

**Given** um item cujo lucro líquido após taxa seja menor ou igual a zero
**When** o modo `Cross-City Arbitrage` é selecionado
**Then** essa combinação não deve aparecer como oportunidade

### AC-6: Ranking coerente de oportunidades

**Given** múltiplas oportunidades válidas
**When** são exibidas no modo `Cross-City Arbitrage`
**Then** devem ser ordenadas por maior lucro percentual líquido por padrão

### AC-7: Painel lateral consistente

**Given** o painel `Top Profitable Items`
**When** o dashboard está em modo `Cross-City Arbitrage`
**Then** o painel deve refletir oportunidades cross-city em vez de spreads locais irreais

## Dependências

- baseline em `main` com PR #26 mergeado
- `PriceTable` e `TopItemsPanel` como superfícies primárias de UI
- `MarketItem[]` carregado por `useMarketItems()` como fonte para agregação

## Riscos e Incertezas

- taxa fixa de 6.5% é aproximação; pode exigir configuração futura
- a agregação por item+qualidade pode aumentar custo de renderização client-side
- itens com poucos mercados ativos podem gerar poucas oportunidades válidas

## Referências

- `src/components/dashboard/PriceTable.tsx`
- `src/components/dashboard/TopItemsPanel.tsx`
- `src/pages/Dashboard.tsx`
- `src/data/types.ts`
- `CONTEXT.md` — margem de lucro após taxas de transação
