# ADR-007 — Cache de dados de mercado com TTL em localStorage

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

`ApiMarketService.getItems()` busca preços de 450 itens × 7 cidades a cada chamada,
gerando dezenas de requisições HTTP em paralelo. O carregamento inicial com a API real
pode levar vários segundos. Os preços do Albion Online têm granularidade de minutos —
dados com poucos minutos de atraso ainda são úteis para análise de spread.

## Decisão

Introduzir cache de dados de mercado em `localStorage` com TTL de 5 minutos (300 000 ms).
O módulo `src/services/market.cache.ts` encapsula leitura, escrita e validação via schema
Zod. A `ApiMarketService.getItems()` verifica o cache antes de qualquer chamada HTTP; em
cache hit, retorna os dados diretamente. Em cache miss ou expirado, busca da API e
persiste o resultado. A chave usada é `albion_market_cache`.

## Consequências

- **Positivo:** carregamento do dashboard pode ser imediato em navegações subsequentes
  dentro da janela de 5 minutos.
- **Positivo:** reduz chamadas à API pública (`west.albion-online-data.com`), diminuindo
  risco de atingir rate limits.
- **Negativo:** dados exibidos podem ter até 5 minutos de atraso em relação ao mercado
  real — aceitável para o uso analítico atual.
- **Negativo:** dados são per-device/per-browser; limpeza de storage apaga o cache sem
  aviso (comportamento idêntico ao ADR-004).
- **Mitigação de risco de quota:** `writeCache` silencia `QuotaExceededError` — em caso de
  storage cheio, a feature degrada para o comportamento anterior sem cache, sem erros.
- **Mitigação de dados corrompidos:** `readCache` valida a estrutura completa com Zod
  (incluindo campos de `MarketItem`); dados inválidos são tratados como cache miss.
- `getLastUpdateTime()` reflete `cachedAt` do cache, comunicando ao usuário a idade dos
  dados exibidos.

## Alternativas consideradas

- **TTL mais curto (1 min):** reduziria o benefício percebido — a busca completa leva
  mais de 1 min em alguns casos; o cache poderia expirar antes de ser útil.
- **TTL mais longo (30 min):** dados ficariam desatualizados demais para análise de
  oportunidades de mercado em tempo real.
- **Cache em memória (in-process):** perdido a cada reload — benefício limitado para o
  caso de uso principal (abrir o dashboard pela manhã).
- **IndexedDB:** API assíncrona e mais complexa sem ganho relevante para o volume de
  dados atual (~450 itens × 7 cidades).
- **Service Worker + Cache API:** infra mais robusta mas desnecessária para o escopo
  front-end apenas do projeto.
