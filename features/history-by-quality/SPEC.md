# SPEC — Histórico por qualidade

**Status:** Aprovada
**Data:** 2026-03-21
**Autor:** OpenCode

---

## Contexto e Motivação

O `ApiMarketService` já enriquece `priceHistory` com dados reais, mas a busca de histórico usa `qualities=1` fixo e indexa o resultado apenas por `itemId|city`. Isso faz com que itens com qualidade diferente de `Normal` recebam histórico incorreto ou compartilhem histórico de outra qualidade.

## Problema a Resolver

Garantir que o histórico de preços respeite a qualidade real de cada item retornado pela API de preços, preservando fallback seguro quando o histórico daquela qualidade não existir.

## Fora do Escopo

- Alterar UI da `PriceTable` ou dos sparklines
- Mudar contrato público de `MarketService`
- Revisar deduplicação por recência
- Alterar cache TTL ou estratégia de retry

## Critérios de Aceitação

### Cenário 1: Histórico usa a mesma qualidade do item

**Given** que a API de preços retorna o mesmo `item_id` e `city` com qualidades diferentes
**When** `ApiMarketService.getItems()` enriquece `priceHistory`
**Then** cada `MarketItem` recebe apenas o histórico correspondente à sua própria qualidade

### Cenário 2: Chamada de histórico solicita todas as qualidades necessárias

**Given** que existem itens com qualidades diferentes no lote atual
**When** o serviço monta a URL do endpoint `/stats/history`
**Then** o parâmetro `qualities` inclui as qualidades necessárias para o lote
**And** não fica fixo em `1`

### Cenário 3: Fallback continua seguro sem histórico por qualidade

**Given** que a API de histórico não retorna dados para a qualidade de um item
**When** `getItems()` finaliza o enriquecimento
**Then** o item mantém `priceHistory` com fallback baseado no preço atual
**And** os demais itens com histórico válido continuam enriquecidos

### Cenário 4: Contrato interno do mapa de histórico diferencia qualidade

**Given** que o serviço consolida respostas de múltiplos batches e cidades
**When** o mapa interno de histórico é construído
**Then** a chave de lookup diferencia `itemId`, `city` e `quality`
**And** não sobrescreve histórico entre qualidades distintas

## Dependências

- `features/price-history/SPEC.md` implementada
- Endpoint `/api/v2/stats/history` já integrado

## Riscos e Incertezas

- A API pode retornar histórico faltante para algumas combinações de qualidade
- A inclusão de múltiplas qualidades na mesma URL não deve quebrar limites atuais do endpoint
- O cache atual pode mascarar comportamento se os testes não isolarem `readCache`/`writeCache`

## Referências

- `features/price-history/SPEC.md`
- `src/services/market.api.ts`
- `src/services/market.api.types.ts`
