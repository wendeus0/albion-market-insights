# SPEC — Deduplicação por recência

**Status:** Aprovada
**Data:** 2026-03-21
**Autor:** OpenCode

---

## Contexto e Motivação

`ApiMarketService.getItems()` hoje deduplica registros da API por `item_id|city|quality` usando a regra `first occurrence wins`. Como os batches podem retornar entradas duplicadas com timestamps diferentes, essa estratégia pode descartar o registro mais recente e manter um snapshot mais antigo.

## Problema a Resolver

Substituir a deduplicação ingênua por uma regra determinística que prefira o registro mais recente e, em empate, o registro mais confiável para compor o item final.

## Fora do Escopo

- Alterar a lógica de histórico por qualidade
- Mudar UI, filtros ou tabelas
- Alterar política de cache TTL
- Reescrever a estratégia de batching/concurrency

## Critérios de Aceitação

### Cenário 1: Registro mais recente vence duplicata

**Given** que a API retorna dois registros com a mesma chave `item_id|city|quality`
**When** o serviço consolida os resultados dos batches
**Then** o registro com timestamp mais recente é mantido

### Cenário 2: Empate de recência usa confiabilidade

**Given** que dois registros duplicados têm a mesma recência
**When** o serviço precisa escolher um deles
**Then** ele prioriza o registro com preços válidos mais completos

### Cenário 3: Deduplicação continua estável

**Given** que existem registros únicos e duplicados no mesmo resultado
**When** `getItems()` termina a consolidação
**Then** cada chave aparece uma única vez no resultado final
**And** registros únicos permanecem inalterados

### Cenário 4: Sem regressão no fallback

**Given** que a API falha ou retorna dados vazios
**When** `getItems()` executa o fluxo de fallback atual
**Then** o comportamento de fallback permanece igual ao existente

## Dependências

- `src/services/market.api.ts`
- `src/services/market.api.types.ts`

## Riscos e Incertezas

- A API pode retornar timestamps parciais ou inválidos
- A definição de “mais confiável” precisa ser determinística e simples o bastante para testes

## Referências

- `QUESTIONS.md` Q32
- `PENDING_LOG.md`
- `src/services/market.api.ts`
