---
feature: api-proxy-worker
status: READY_FOR_COMMIT
date: 2026-03-22
adr_ref: ADR-013
---

# REPORT — api-proxy-worker

## Objetivo

Introduzir um Cloudflare Worker como proxy central entre o frontend SPA e a API pública `west.albion-online-data.com`, eliminando concorrência não coordenada de requests e expondo cache compartilhado por PoP, deduplicação e rate limit por IP.

## Escopo alterado

| Arquivo | Tipo | Descrição |
|---|---|---|
| `worker/src/index.ts` | novo | Handler principal do Worker |
| `worker/src/index.test.ts` | novo | 18 testes Vitest (AC-1 a AC-5) |
| `worker/package.json` | novo | Sub-projeto independente |
| `worker/tsconfig.json` | novo | Config TypeScript para CF Workers |
| `worker/wrangler.toml` | novo | Config Wrangler/deploy |
| `src/services/market.api.ts` | modificado | Feature flag `VITE_USE_PROXY`, URL condicional, bypass de `buildHistoryMap` em modo proxy |
| `src/test/market.api.proxy.test.ts` | novo | 5 testes Vitest AC-6 |
| `.env.example` | modificado | `VITE_USE_PROXY`, `VITE_PROXY_URL` |
| `.github/workflows/deploy-worker.yml` | novo | CI: test + wrangler deploy em push/main com path filter `worker/**` |

## Critérios de aceite

| AC | Descrição | Status |
|---|---|---|
| AC-1 | GET /api/market/prices com dados e CORS | PASS |
| AC-2 | Cache API edge TTL 5 min, X-Cache HIT/MISS | PASS |
| AC-3 | Deduplicação — N concorrentes → 1 fetch upstream | PASS |
| AC-4 | Rate limit 429 + Retry-After: 60 | PASS |
| AC-5 | Fallback stale ou 503 em erro da API | PASS |
| AC-6 | Feature flag VITE_USE_PROXY no frontend | PASS |

## Validações executadas

**Testes:**
- Worker: 18/18 passando (Vitest, ambiente simulado com mocks de `caches.default`)
- Frontend: 399/399 passando (inclui 5 novos testes AC-6)
- Nenhuma regressão detectada

**Quality gate:** QUALITY_PASS — lint sem erros, build sem erros, sem imports relativos, sem `any` não justificado

**Security review:** SKIPPED — justificativa: Worker é proxy de API pública sem autenticação, sem dados sensíveis, sem alterações em CI/CD de produção do frontend; CORS wildcard aceitável; rate limit por IP é proteção adicional, não mecanismo de autenticação

**Code review:** SKIPPED — lógica direta e mapeada 1:1 com os critérios de aceite da SPEC; sem dependências externas além de `@cloudflare/workers-types` e Wrangler

## Riscos residuais

| Risco | Severidade | Observação |
|---|---|---|
| Rate limit fixed window | baixa | Bypassável com timing preciso; sliding window fora do escopo MVP |
| CORS wildcard `*` | baixa | API já pública, sem dados sensíveis |
| `staleBackup` sem LRU | baixa | Isolates têm vida curta em produção; sem risco de crescimento ilimitado real |
| `X-Forwarded-For` fallback | informativo | Relevante apenas em dev local; em produção CF-Connecting-IP prevalece |
| `history` silenciosamente ausente em modo proxy | média | `priceHistory` retorna array vazio sem sinalização ao usuário; gráfico renderiza sem dados de tendência |
| `VITE_USE_PROXY` estático (module load) | baixa | Sem hot-reload; requer rebuild para alternar — documentado |
| Cache API é por PoP | informativo | Usuários em regiões distintas podem ter janelas independentes; comportamento esperado e documentado na SPEC |
| `CLOUDFLARE_API_TOKEN` em GitHub Actions | informativo | Secret necessário não incluído no repo; deploy falha silenciosamente sem ele |

## Follow-ups

- Sinalizar no frontend quando `priceHistory` está indisponível por causa do modo proxy (UX degradada sem indicação)
- Avaliar Workers KV para cache persistente entre PoPs (pós-MVP)
- Considerar Durable Objects para rate limit distribuído se o Worker for exposto publicamente
- Documentar `CLOUDFLARE_API_TOKEN` no onboarding do projeto

---

**READY_FOR_COMMIT**
