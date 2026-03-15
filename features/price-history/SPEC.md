# SPEC: Histórico de Preços com API Real

**Status**: APPROVED
**Data**: 2026-03-14
**Feature**: Integração do endpoint `/api/v2/stats/history` para popular `priceHistory` com dados reais

---

## Contexto

A `MarketItem.priceHistory` atualmente contém apenas `[item.sellPrice]` — um único ponto. Isso torna os sparklines na `PriceTable` inúteis (linha reta). A API pública do Albion Online Data Project expõe um endpoint de histórico de preços que permite recuperar até 24 pontos de dados por item/cidade, o suficiente para gráficos de tendência significativos.

---

## Objetivo

Integrar o endpoint de histórico de preços ao `ApiMarketService` para que:
- `priceHistory` de cada `MarketItem` tenha dados reais de preço (até 24h de histórico)
- Os sparklines na `PriceTable` mostrem tendências reais
- A feature seja transparente — `MockMarketService` continua gerando dados simulados

---

## API de Referência

**Endpoint de histórico:**
```
GET https://west.albion-online-data.com/api/v2/stats/history/{item_ids}.json
    ?locations={city}
    &qualities={quality}
    &time-scale=1  (1 = pontos horários)
```

**Contrato de resposta:**
```typescript
[
  {
    item_id: string;
    location: string;
    quality: number;
    data: Array<{
      item_count: number;
      avg_price: number;
      timestamp: string;
    }>;
  }
]
```

**Restrições:**
- A query de histórico aceita múltiplos `item_ids` (separados por vírgula), mas apenas 1 city por vez
- Usar `time-scale=1` para resolução horária (24 pontos para janela de 24h)
- Máximo de 20 itens por request recomendado para evitar URLs longas

---

## Requisitos Funcionais

### RF-01: Busca de histórico paralela
- `ApiMarketService.getItems()` deve buscar histórico após buscar preços correntes
- A busca deve ser por cidade (um request por cidade com todos os item_ids daquela cidade)
- Usar `Promise.all` para requests paralelos
- Timeout idêntico ao de preços: 10s com `AbortController`

### RF-02: Enriquecimento de `priceHistory`
- `MarketItem.priceHistory` deve conter array de `avg_price` dos últimos 24 pontos
- Ordenar por `timestamp` ascendente (mais antigo primeiro, mais recente último)
- Se não houver dados de histórico para um item, manter `[item.sellPrice]` como fallback

### RF-03: Fallback gracioso
- Se o endpoint de histórico falhar (timeout, erro de rede, 4xx/5xx), não bloquear `getItems()`
- Retornar items com `priceHistory: [sellPrice]` (comportamento atual mantido)
- Logar: `[ApiMarketService] Histórico indisponível, usando preço atual`

### RF-04: Sem mudança na interface pública
- `MarketService` interface não muda
- Componentes e hooks não precisam de alteração
- `MockMarketService` continua gerando `priceHistory` simulado

---

## Requisitos Não-Funcionais

### RNF-01: Performance
- Requests de histórico devem ser paralelos (por cidade), não sequenciais
- Não bloquear renderização — `getItems()` pode demorar mais, mas TanStack Query gerencia o estado

### RNF-02: Sem dependências novas
- Usar apenas `fetch` nativo (sem axios ou libs HTTP)

### RNF-03: TypeScript
- Schema Zod para validar resposta do endpoint de histórico
- Sem `any`

---

## Arquivos a Modificar

| Arquivo | Tipo de mudança |
|---------|----------------|
| `src/services/market.api.ts` | Adicionar busca de histórico, enriquecer `priceHistory` |
| `src/services/market.api.types.ts` | Adicionar schema Zod para resposta de histórico |

**Arquivos a NÃO modificar**: `market.service.ts`, `market.mock.ts`, `services/index.ts`, tipos, componentes.

---

## Critérios de Aceitação

### CA-01: priceHistory populado com dados reais
- [ ] Com `VITE_USE_REAL_API=true`, items retornados têm `priceHistory.length > 1`
- [ ] Sparklines na `PriceTable` mostram variação (não linha reta)

### CA-02: Fallback em falha do endpoint de histórico
- [ ] Se endpoint de histórico retornar erro, `getItems()` ainda retorna items com `priceHistory: [sellPrice]`
- [ ] Console exibe mensagem de fallback de histórico

### CA-03: Requests paralelos
- [ ] Verificar no DevTools Network: requests de histórico disparam em paralelo (por cidade)
- [ ] Total de requests = 7 (uma por cidade)

### CA-04: Mock não afetado
- [ ] Sem `VITE_USE_REAL_API`, `MockMarketService.getItems()` funciona como antes
- [ ] `priceHistory` do mock continua sendo array simulado com múltiplos pontos

### CA-05: Build e lint limpos
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` conclui sem erros

### CA-06: Testes E2E não quebram
- [ ] `npx playwright test` continua com 13 testes passando (modo mock ativo por padrão)

---

## O que está FORA do escopo desta SPEC

- UI dedicada para visualização de histórico (modal de detalhes, página de item) — SPEC separada
- Seleção de janela temporal (7d, 30d) — SPEC separada
- Cache persistente de histórico no localStorage — avaliar após CA completos
- Filtros adicionais na tabela (já implementados na `PriceTable`)

---

## Dependências

- Depende de: `SPEC-real-api.md` (DONE)
- SPEC de visualização de histórico depende desta
