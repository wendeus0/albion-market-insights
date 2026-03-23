# ADR-013 — Cloudflare Workers como proxy intermediário para a API do Albion Online

Status: Proposto
Data: 2026-03-22

## Contexto

O projeto é um SPA React puro que consome a API pública `west.albion-online-data.com` diretamente do browser. Cada ciclo de carregamento completo gera ~25–50 requisições HTTP independentes (batches de preços × 7 cidades + histórico). Todos os mecanismos de proteção atuais — cache em localStorage (ADR-007), `staleTime` no TanStack Query, cooldown de refresh manual e retry com backoff — operam por browser, por usuário.

Com múltiplos usuários simultâneos, não há coordenação:
- O mesmo conjunto de dados é buscado N vezes sem cache compartilhado
- Cada usuário acumula retries independentes em resposta ao mesmo 429 da API
- Não existe visibilidade sobre uso real da API (sem servidor, sem logs centralizados)

A ausência de camada central expõe o projeto a banimento de IP de CDN, 429s em pico de uso e dados exibidos em momentos diferentes para usuários distintos.

ADR-007 registrou "Service Worker + Cache API" como alternativa descartada por ser "desnecessária para o escopo front-end apenas do projeto". Esta decisão abre o escopo para introduzir uma camada de servidor mínima.

## Decisão

Introduzir um Cloudflare Worker como proxy intermediário entre o frontend e a API pública. O Worker opera como sub-projeto independente na pasta `worker/` do monorepo, com `wrangler.toml` e `package.json` próprios.

**Responsabilidades do Worker no MVP:**
- `GET /api/market/prices` — único endpoint na primeira iteração
- Cache compartilhado via **Cache API nativa da Cloudflare** (TTL 5 min, `Cache-Control: max-age=300`)
- Deduplicação de requests concorrentes via Promise coalescing (Map de Promises pendentes)
- Rate limit básico por IP: 30 req/min com contadores em Map em memória
- Fallback controlado: em erro da API externa, retorna dado cacheado com `{ stale: true }`
- Headers CORS para permitir acesso cross-origin do frontend

**Integração com o frontend:**
- Nova variável de ambiente: `VITE_USE_PROXY=true` e `VITE_PROXY_URL`
- Quando `VITE_USE_PROXY=false` (padrão dev/test): comportamento atual sem alteração
- Modificação restrita a `src/services/market.api.ts` (troca de `BASE_URL`)
- Cache em localStorage permanece como segunda camada (ADR-007 não é revogado)

**Runtime:** V8 isolate (não Node.js) — apenas Web APIs padrão; tipagem via `@cloudflare/workers-types`.

## Consequências

### Positivas

- Cache compartilhado entre todos os usuários: N usuários simultâneos geram 1 fetch à API por janela de 5 min
- Deduplicação de thundering herd: requests concorrentes ao mesmo endpoint convergem em 1 chamada
- Deploy independente do frontend: `wrangler deploy` não bloqueia pipeline do SPA
- Free tier adequado: 100k req/dia — suficiente para escala atual do projeto
- Cache API persiste entre isolates no mesmo PoP — sem cold-start cache loss (problema central do Vercel Functions)
- Latência adicionada mínima (~5–20ms overhead)

### Negativas

- Novo sub-projeto (`worker/`) com pipeline CI separado (`.github/workflows/deploy-worker.yml`)
- Novo secret obrigatório no GitHub: `CLOUDFLARE_API_TOKEN`
- Vendor lock-in: `wrangler.toml` e Cache API são específicos da Cloudflare
- Runtime V8 isolate — incompatível com APIs Node.js (`fs`, `path`, etc.); requer atenção na implementação
- Cache API é edge-local (por PoP): usuários em regiões diferentes podem receber dados de janelas ligeiramente distintas
- Rate limit in-memory não é distribuído entre instâncias — comportamento best-effort em alta concorrência

### Fora do escopo desta decisão (futuro)

- Workers KV para cache global persistente
- Rate limit distribuído via Durable Objects
- Proxy para endpoint de histórico
- Autenticação frontend → Worker
- Observabilidade avançada (logs estruturados, métricas)

## Alternativas consideradas

| Alternativa | Descartada por |
|-------------|----------------|
| Vercel Functions | Cache in-memory stateless — perde estado em cold starts; Vercel KV tem custo além do free tier |
| Netlify Functions | Sem cache compartilhado nativo; rate limit global requer serviço externo (Redis/Upstash) |
| Node.js/Fastify (Railway, Render) | Overengineering para o momento; novo deploy de processo HTTP; sleep em free tiers gera cold start >30s |
| Manter frontend-only | Não resolve concorrência entre usuários — problema cresce proporcionalmente à base de usuários |

## Relação com outros ADRs

- **ADR-003**: A interface `MarketService` e a factory pattern permanecem inalteradas; o proxy é uma camada de transporte transparente
- **ADR-007**: O cache em localStorage permanece como segunda camada (client-side); não é revogado
- **ADR-012**: A factory `createMarketService` não é alterada; `ApiMarketService` passa a apontar para o proxy quando `VITE_USE_PROXY=true`
