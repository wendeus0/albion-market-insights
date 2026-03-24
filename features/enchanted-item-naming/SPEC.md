# SPEC — Nomenclatura de Itens Encantados

**Status:** Draft
**Data:** 2026-03-24
**Autor:** wendeus0

---

## Contexto e Motivação

Atualmente, os itens encantados no Albion Market Insights são exibidos com a nomenclatura separada:

- Nome do item: "Adept's Assassin Jacket .1"
- Badge de tier: "T4"

Isso cria uma experiência fragmentada onde o nível de encantamento (.1, .2, .3) aparece no nome do item, enquanto o tier (T4) aparece em um badge separado. A proposta é unificar essa informação, mostrando o nível de encantamento junto com o tier no badge, resultando em uma apresentação mais clara e consistente com o padrão do jogo Albion Online.

## Problema a Resolver

A separação entre tier e encantamento dificulta a leitura rápida das informações do item. Usuários precisam processar duas fontes distintas (nome + badge) para entender completamente o tier e o encantamento de um item. A nova abordagem consolidará essas informações em um único local (badge), seguindo o padrão "T4.1", "T5.2", etc.

## Fora do Escopo

- Alterar a lógica de filtros de encantamento existentes
- Modificar o catálogo de itens ou IDs
- Alterar comportamento de ordenação ou busca
- Mudar a forma como encantamentos são armazenados no estado
- Ajustar outros componentes além das tabelas de exibição (PriceTable, ArbitrageTable, TopItemsPanel, TopArbitragePanel)

## Critérios de Aceitação

### AC-1: Nomes de itens sem sufixo de encantamento

**Given** que o sistema gera os nomes dos itens via `ITEM_NAMES`
**When** um item possui encantamento (@1, @2, @3)
**Then** o nome do item NÃO deve conter o sufixo " .1", " .2" ou " .3"
**And** o nome base deve permanecer igual ao do item não-encantado

### AC-2: Badge de tier com encantamento

**Given** que um item é exibido em uma tabela (PriceTable, ArbitrageTable, TopItemsPanel ou TopArbitragePanel)
**When** o item possui encantamento
**Then** o badge de tier deve exibir "T{tier}.{enchantLevel}" (ex: "T4.1", "T5.3")
**And** itens sem encantamento continuam exibindo apenas "T{tier}" (ex: "T4")

### AC-3: Cálculo do nível de encantamento

**Given** que um item tem um `itemId` com sufixo de encantamento
**When** o sistema renderiza o badge de tier
**Then** o nível de encantamento deve ser extraído do padrão `@([0-3])$` no `itemId`
**And** o valor deve ser concatenado ao tier com um ponto como separador

### AC-4: Consistência visual

**Given** que múltiplos itens são exibidos na mesma tabela
**When** comparando itens encantados e não-encantados
**Then** todos os badges devem seguir o mesmo padrão visual
**And** a única diferença deve ser a presença ou ausência do sufixo de encantamento

### AC-5: Compatibilidade com filtros existentes

**Given** que o usuário aplica filtros de encantamento no PriceTable
**When** os itens filtrados são exibidos
**Then** a nova nomenclatura deve ser aplicada corretamente
**And** os filtros devem continuar funcionando como antes

## Dependências

- `ITEM_NAMES` em `src/data/constants.ts` — para remoção do sufixo de encantamento
- Componentes de tabela (`PriceTable`, `ArbitrageTable`, `TopItemsPanel`, `TopArbitragePanel`) — para ajuste do badge de tier
- Estrutura de `MarketItem` com `itemId` e `tier` — para extração do nível de encantamento

## Riscos e Incertezas

- **Risco Baixo**: Testes existentes podem validar nomes de itens específicos que precisarão ser atualizados
- **Risco Baixo**: Usuários habituados ao formato atual podem precisar de adaptação visual
- **Mitigação**: Manter o mesmo estilo visual do badge, apenas alterando o texto

## Referências

- ADR-008 (se existir sobre nomenclatura de itens)
- Estrutura atual de `ITEM_NAMES` em `src/data/constants.ts`
- Componente `ItemIcon` para exibição de itens

---

## Checklist INVEST

| Critério        | Status | Observação                           |
| --------------- | ------ | ------------------------------------ |
| **I**ndependent | ✅     | Não depende de features em andamento |
| **N**egotiable  | ✅     | Escopo bem definido e ajustável      |
| **V**aluable    | ✅     | Melhora clareza visual para usuários |
| **E**stimable   | ✅     | Pequeno: 2-3 arquivos principais     |
| **S**mall       | ✅     | Cabe em 1 ciclo de trabalho          |
| **T**estable    | ✅     | Critérios verificáveis via testes    |
