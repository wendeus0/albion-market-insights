# SPEC: Integração com API Real do Albion Online

**Status**: DRAFT
**Data**: 2026-03-14
**Feature**: Substituição do mock data pela API pública do Albion Online Data Project

---

## Contexto

A camada de serviços já está implementada (`src/services/`). A classe `ApiMarketService` em `market.api.ts` faz chamadas reais ao endpoint de preços, mas com limitações que impedem uso em produção:

1. Catálogo fixo de apenas 20 itens hardcoded
2. Nomes de itens gerados por `item_id.replace(/_/g, ' ')` (não legíveis por humanos)
3. `priceHistory` contém apenas o preço atual — sem histórico real
4. Sem fallback quando a API está indisponível
5. Sem tratamento de rate limiting ou timeout

---

## Objetivo

Tornar `ApiMarketService` pronto para produção com:
- Catálogo expandido (mínimo 50 itens representativos por tier/categoria)
- Nomes legíveis por humanos
- Fallback para mock data em caso de falha da API
- Tratamento de erro robusto

---

## API de Referência

**Endpoint de preços:**
```
GET https://west.albion-online-data.com/api/v2/stats/prices/{item_ids}.json
    ?locations={cities}
    &qualities={1,2,3,4,5}
```

**Endpoint de histórico:**
```
GET https://west.albion-online-data.com/api/v2/stats/history/{item_ids}.json
    ?locations={city}
    &qualities={quality}
    &time-scale={1|6|24}  (horas)
```

**Contrato de resposta (preços):**
```typescript
// Já implementado em market.api.types.ts
{
  item_id: string;
  city: string;
  quality: number; // 1–5
  sell_price_min: number;
  sell_price_min_date: string;
  buy_price_max: number;
  buy_price_max_date: string;
}
```

---

## Requisitos Funcionais

### RF-01: Catálogo de Itens
- O sistema deve consultar no mínimo 50 itens distribuídos entre T4–T8
- Cobrir categorias: armas (espadas, lanças, adagas, cajados), armaduras (placa, couro, pano), acessórios (capas, sapatilhas)
- O catálogo deve ser definido em `src/data/constants.ts` como array exportado `ITEM_IDS`

### RF-02: Nomes Legíveis
- Cada `item_id` deve ter um nome legível mapeado
- Mapeamento definido em `src/data/constants.ts` como `ITEM_NAMES: Record<string, string>`
- Fallback: se `item_id` não estiver no mapa, usar formatação atual (`replace(/_/g, ' ')`)

### RF-03: Fallback para Mock Data
- Se a chamada à API falhar (rede, timeout, status != 2xx), `getItems()` deve retornar os dados do `MockMarketService`
- O fallback deve ser transparente para os consumidores (hooks e componentes)
- Logar no console: `[ApiMarketService] API indisponível, usando mock data`

### RF-04: Timeout
- Chamadas à API devem ter timeout de 10 segundos
- Implementar via `AbortController` + `setTimeout`

### RF-05: Filtro de dados inválidos
- Registros com `sell_price_min === 0` E `buy_price_max === 0` devem ser descartados
- Comportamento atual: filtra apenas quando ambos > 0 ✅ (manter)

---

## Requisitos Não-Funcionais

### RNF-01: Sem dependências novas
- Usar apenas `fetch` nativo (sem axios ou libs HTTP)
- Sem bibliotecas de mapeamento de nomes (manter em constants.ts)

### RNF-02: TypeScript
- Todos os novos exports devem ter tipos explícitos
- Sem uso de `any`

---

## Arquivos a Modificar

| Arquivo | Tipo de mudança |
|---------|----------------|
| `src/data/constants.ts` | Adicionar `ITEM_IDS` (array) e `ITEM_NAMES` (Record) |
| `src/services/market.api.ts` | RF-02 (nomes), RF-03 (fallback), RF-04 (timeout) |
| `src/services/market.api.types.ts` | Nenhuma alteração esperada |

**Arquivos a NÃO modificar**: `market.service.ts`, `market.mock.ts`, `services/index.ts`, componentes.

---

## Critérios de Aceitação

### CA-01: Catálogo expandido
- [ ] `ITEM_IDS` em `constants.ts` contém ≥ 50 itens
- [ ] Itens cobrem tiers T4, T5, T6, T7, T8
- [ ] Itens cobrem ≥ 3 categorias distintas de equipamento

### CA-02: Nomes legíveis
- [ ] `ITEM_NAMES['T4_MAIN_SWORD']` retorna `'Espada Longa T4'` (ou equivalente em inglês)
- [ ] Item sem mapeamento ainda renderiza (fallback funciona)

### CA-03: Fallback em falha de rede
- [ ] Mockar `fetch` para lançar erro → `getItems()` retorna array não-vazio (dados mock)
- [ ] Console exibe a mensagem de fallback esperada

### CA-04: Timeout
- [ ] Mockar `fetch` para nunca resolver → `getItems()` retorna em ≤ 11s com dados mock
- [ ] Sem `UnhandledPromiseRejection` no console

### CA-05: Build e lint limpos
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` conclui sem erros

### CA-06: Testes E2E não quebram
- [ ] `npx playwright test` continua com 13 testes passando (modo mock ativo por padrão)

---

## O que está FORA do escopo desta SPEC

- Endpoint de histórico de preços (`/api/v2/stats/history`) — SPEC separada
- Filtros de cidade/tier na UI — SPEC separada
- Cache de respostas da API — avaliar após CA completos
- Internacionalização de nomes — usar inglês por ora

---

## Dependências

- Esta SPEC não tem pré-requisitos — a camada de serviços já está pronta
- SPEC de histórico de preços depende desta
