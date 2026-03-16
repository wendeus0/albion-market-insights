---
feature: backoff-exponencial
status: draft
created: 2026-03-16
debt_ref: DEBT-P1-001
---

# SPEC — Backoff Exponencial em market.api.ts

## Contexto

A API pública do Albion Online (`west.albion-online-data.com`) possui rate limiting não documentado (~180 req/min estimado). Atualmente `fetchPricesBatch` e `fetchHistoryBatch` falham silenciosamente sem retentativa. Erros transientes (rede, 429, 5xx) resultam em dados incompletos ou fallback para mock sem qualquer tentativa de recuperação.

## Objetivo

Adicionar retentativas com backoff exponencial às chamadas de fetch em `market.api.ts`, reduzindo falhas transientes sem aumentar pressão sobre o rate limit.

## Escopo

Apenas `src/services/market.api.ts`. Sem alteração em componentes, hooks, testes E2E ou configuração.

## Critérios de aceite

### AC-1 — `fetchWithRetry` como utilitário exportado
- Uma função `fetchWithRetry(url, options, retryConfig?)` é exportada de `market.api.ts`
- Encapsula a lógica de retry; `fetchPricesBatch` e `fetchHistoryBatch` delegam para ela

### AC-2 — Retentativa em erros transientes
- Retentar em: HTTP 429, HTTP 5xx (500–599), erro de rede (falha de `fetch()`)
- Não retentar em: `AbortError`, HTTP 4xx (exceto 429), HTTP 2xx/3xx

### AC-3 — Backoff exponencial com jitter
- Delay entre tentativas: `baseDelay * 2^attempt + jitter` (jitter: 0–100ms aleatório)
- Parâmetros exportados como constantes: `RETRY_MAX_ATTEMPTS = 3`, `RETRY_BASE_DELAY_MS = 500`

### AC-4 — Respeito ao AbortSignal
- Se o `AbortSignal` estiver abortado antes ou durante uma retentativa, interrompe imediatamente sem nova tentativa
- Deve rejeitar com `AbortError` (não engolir o erro de abort)

### AC-5 — História best-effort mantida
- `fetchHistoryBatch` usa `fetchWithRetry` internamente
- Erros após esgotar retentativas continuam sendo silenciados (catch externo inalterado)

## Fora do escopo
- Cache com TTL em localStorage
- Circuit breaker
- UI de feedback de retentativa
- Alteração no timeout global (15s via AbortController)
