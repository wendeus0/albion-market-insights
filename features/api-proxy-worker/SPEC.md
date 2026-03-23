---
feature: api-proxy-worker
status: aprovada
created: 2026-03-22
adr_ref: ADR-013
---

# SPEC — Cloudflare Worker como proxy para a API do Albion Online

## Contexto

O projeto é um SPA React puro que chama a API pública `west.albion-online-data.com` diretamente do browser. Cada ciclo completo gera ~25–50 requisições HTTP. Com múltiplos usuários simultâneos, não há coordenação: o mesmo dado é buscado N vezes, sem cache compartilhado e sem visibilidade sobre uso da API.

Os mecanismos atuais (cache localStorage, staleTime, cooldown manual) são por-browser e por-usuário — não resolvem concorrência global. A ausência de camada central expõe o projeto a 429s em pico, banimento de IP de CDN e dados em momentos inconsistentes entre usuários.

## Objetivo

Introduzir um Cloudflare Worker como proxy entre o frontend e a API pública. O Worker serve como ponto central de cache compartilhado, deduplicação de requests concorrentes e rate limit básico, sem alterar o contrato de dados do frontend.

## Escopo

- Novo sub-projeto `worker/` na raiz do monorepo (Cloudflare Worker, TypeScript, Wrangler)
- Único endpoint: `GET /api/market/prices`
- Ajuste em `src/services/market.api.ts` para suportar feature flag `VITE_USE_PROXY`
- Novas variáveis de ambiente documentadas em `.env.example`
- Novo workflow CI: `.github/workflows/deploy-worker.yml`

**Nota:** `repo-preflight` é obrigatório antes de `test-red` — esta feature depende de Wrangler CLI, conta Cloudflare e configuração de secrets no GitHub.

## Critérios de aceite

### AC-1 — Worker serve dados de preço com CORS

- `GET /api/market/prices?items=...&locations=...&qualities=...` retorna `200` com array JSON de registros de preço no formato da API Albion (`item_id`, `city`, `sell_price_min`, `buy_price_max`, etc.)
- Resposta inclui `Access-Control-Allow-Origin: *`
- `OPTIONS /api/market/prices` retorna `200` com headers CORS adequados (preflight)
- Resposta inclui header `X-Cache: HIT` ou `X-Cache: MISS` para diagnóstico

### AC-2 — Cache compartilhado com TTL de 5 minutos

- Primeira requisição para um conjunto de parâmetros (cache miss) busca a API Albion e persiste a resposta via Cache API da Cloudflare com `Cache-Control: max-age=300`
- Segunda requisição idêntica dentro de 5 minutos retorna `X-Cache: HIT` sem nova chamada à API Albion
- Após 5 minutos, a entrada expira e a próxima requisição gera novo fetch (cache miss)

### AC-3 — Deduplicação de requests concorrentes

- Quando N requisições para o mesmo endpoint chegam simultaneamente (antes do primeiro fetch completar), apenas 1 chamada é feita à API Albion
- Todas as N requisições recebem a resposta da única chamada realizada
- O Map de Promises pendentes é limpo após a resposta (sem vazamento de memória entre ciclos)

### AC-4 — Rate limit básico por IP

- IP que excede 30 requisições em uma janela de 60 segundos recebe `429 Too Many Requests`
- Resposta 429 inclui header `Retry-After: 60`
- IPs dentro do limite são atendidos normalmente sem degradação de desempenho

### AC-5 — Fallback controlado em erro da API

- Se a API Albion retornar erro (5xx, timeout de 15s) **e** existir dado cacheado: Worker retorna `200` com o dado cacheado e campo `stale: true` no body
- Se a API Albion retornar erro **e não** existir dado cacheado: Worker retorna `503` com `{ "error": "service_unavailable" }`
- Em ambos os casos, o Worker não propaga o erro HTTP bruto da API Albion para o frontend

### AC-6 — Feature flag no frontend

- Quando `VITE_USE_PROXY=false` (ou ausente): `market.api.ts` usa `BASE_URL` da API Albion diretamente — comportamento atual inalterado; todos os testes unitários e E2E existentes continuam passando sem alteração
- Quando `VITE_USE_PROXY=true` e `VITE_PROXY_URL` definido: `market.api.ts` usa `VITE_PROXY_URL` como base para as chamadas de preços
- A troca de URL não altera o parsing de resposta nem o contrato `MarketItem`

## Fora do escopo

- Workers KV (cache persistente global entre regiões/PoPs)
- Rate limit distribuído (Durable Objects)
- Proxy para endpoint de histórico (`/api/v2/stats/history`)
- Autenticação frontend → Worker (tokens, JWT, API keys)
- Observabilidade avançada (logs estruturados, métricas, dashboards)
- Versionamento de API (`/v1/`, `/v2/`)
- Domínio customizado no Worker (usar `*.workers.dev` no MVP)
- Testes E2E do Worker (Playwright)
- Alterações nos hooks, componentes ou páginas do frontend

## Dependências e restrições técnicas

- Runtime Cloudflare Workers (V8 isolate — não é Node.js): apenas Web APIs padrão
- `@cloudflare/workers-types` para tipagem TypeScript do Worker
- Wrangler CLI >=3 para dev local e deploy
- Secret `CLOUDFLARE_API_TOKEN` necessário no GitHub Actions
- Cache API é edge-local (por PoP): usuários em regiões distintas podem ter janelas de cache independentes — comportamento aceitável no MVP
- ADR-003, ADR-007 e ADR-012 permanecem válidos e inalterados

## Riscos e incertezas

- Cache API disponível em `wrangler dev` por padrão — testes unitários usam mocks de `caches.default` via Vitest
- Porta padrão do `wrangler dev`: 8787 — documentar em `.env.example` como `VITE_PROXY_URL=http://localhost:8787`
- Comportamento do Map de deduplicação em alta concorrência real pode diferir do ambiente de teste
