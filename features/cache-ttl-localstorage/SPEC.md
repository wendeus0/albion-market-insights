---
feature: cache-ttl-localstorage
status: draft
created: 2026-03-16
---

# SPEC — Cache com TTL em localStorage

## Contexto

`ApiMarketService.getItems()` busca dados de preços para 450 itens × 7 cidades a cada chamada.
Com a API real ativa, o carregamento inicial pode levar vários segundos e gera N requisições HTTP.
Os preços do Albion Online não mudam com frequência suficiente para justificar refresh contínuo —
dados de alguns minutos atrás ainda são úteis para análise.

## Objetivo

Introduzir uma camada de cache em `localStorage` na `ApiMarketService` para que dados recentemente
buscados sejam reutilizados dentro de uma janela de TTL, reduzindo chamadas à API e tempo de carregamento.

## Escopo

- Novo módulo `src/services/market.cache.ts` com a lógica de leitura/escrita de cache
- Integração na `ApiMarketService.getItems()` — verificar cache antes de buscar
- `getLastUpdateTime()` reflete o `cachedAt` quando os dados vêm do cache
- Sem mudanças em UI, hooks ou componentes

## Fora do escopo

- Cache para `getTopProfitable()` (opera sobre `getItems()` — beneficia indiretamente)
- Cache para histórico de preços (apenas dados de preço corrente)
- Invalidação manual de cache pela UI
- Cache em memória (apenas localStorage)

## Acceptance Criteria

### AC-1 — Cache miss: busca API e persiste

Dado que não há cache no localStorage (ou a chave não existe),
quando `getItems()` for chamado,
então deve buscar os dados da API, armazená-los no localStorage com `cachedAt` e `expiresAt`,
e retornar os itens buscados.

### AC-2 — Cache hit: retorna do cache sem chamar API

Dado que existe cache válido (não expirado) no localStorage,
quando `getItems()` for chamado,
então deve retornar os dados do cache sem realizar nenhuma chamada HTTP à API de preços.

### AC-3 — Cache expirado: revalida e atualiza

Dado que existe cache no localStorage mas `expiresAt` está no passado,
quando `getItems()` for chamado,
então deve buscar novos dados da API, atualizar o cache no localStorage, e retornar os novos itens.

### AC-4 — getLastUpdateTime reflete cachedAt

Dado que os dados são servidos do cache,
quando `getLastUpdateTime()` for chamado,
então deve retornar o `cachedAt` do cache (não a hora atual).

### AC-5 — Cache corrompido: trata como miss

Dado que o localStorage contém dados inválidos ou malformados na chave de cache,
quando `getItems()` for chamado,
então deve tratar como cache miss, buscar da API normalmente, e sobrescrever o valor corrompido.

## Decisões técnicas

| Decisão | Valor |
|---------|-------|
| Chave localStorage | `albion_market_cache` |
| TTL padrão | 5 minutos (300 000 ms) — exportado como `CACHE_TTL_MS` |
| Estrutura do cache | `{ data: MarketItem[], cachedAt: string, expiresAt: string }` |
| Validação do cache | Schema Zod no módulo `market.cache.ts` |
| Módulo de cache | `src/services/market.cache.ts` — leitura/escrita isoladas |

## Arquivos esperados

- `src/services/market.cache.ts` — leitura, escrita, validação e TTL
- `src/services/market.api.ts` — integração do cache em `getItems()` e `getLastUpdateTime()`
- `src/test/market.cache.test.ts` — testes unitários do módulo de cache
