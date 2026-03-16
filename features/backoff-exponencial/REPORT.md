---
feature: backoff-exponencial
debt_ref: DEBT-P1-001
status: READY_FOR_COMMIT
date: 2026-03-16
---

# REPORT — Backoff Exponencial em market.api.ts

## Resumo executivo

Implementação de retry com backoff exponencial e jitter nas chamadas de fetch de `market.api.ts`. A função `fetchWithRetry` foi extraída como utilitário exportado e integrada em `fetchPricesBatch` e `fetchHistoryBatch`. Todos os 5 critérios de aceite da SPEC foram atendidos. 79/79 testes passando, lint limpo, build limpo.

## Escopo alterado

| Arquivo | Tipo de alteração |
|---------|------------------|
| `src/services/market.api.ts` | Adição de `fetchWithRetry`, `RETRY_MAX_ATTEMPTS`, `RETRY_BASE_DELAY_MS`; substituição de `fetch` direto em `fetchPricesBatch` e `fetchHistoryBatch` |
| `src/test/market.api.retry.test.ts` | Novo — 14 testes cobrindo AC-1, AC-2, AC-4, AC-5 |
| `src/test/market.api.test.ts` | Correção de 4 testes pré-existentes para compatibilidade com fake timers após introdução do retry |

## Critérios de aceite

| AC | Descrição | Status |
|----|-----------|--------|
| AC-1 | `fetchWithRetry` exportado; `fetchPricesBatch`/`fetchHistoryBatch` delegam para ela | PASS |
| AC-2 | Retry em 429/5xx/network; não-retry em 4xx/AbortError | PASS |
| AC-3 | Backoff `baseDelay * 2^attempt + jitter`; constantes `RETRY_MAX_ATTEMPTS=3`, `RETRY_BASE_DELAY_MS=500` exportadas | PASS |
| AC-4 | `AbortSignal` abortado interrompe retentativas e rejeita com `AbortError` | PASS |
| AC-5 | `fetchHistoryBatch` usa `fetchWithRetry`; erros após retries continuam silenciados | PASS |

## Validações executadas

- **quality-gate**: `QUALITY_PASS` — lint 0 erros, build limpo, 79/79 testes
- **security-review**: `SECURITY_PASS` — mudança restrita a lógica de retry client-side sobre URLs fixas; sem secrets, sem CI/CD, sem superfície de ataque relevante
- **code-review**: `SKIPPED` — diff focado, lógica direta, sem ramificações não óbvias

## Riscos residuais

- `fetchWithRetry` aceita URL arbitrária — não relevante em contexto browser com callers restritos a constantes hardcoded; sem vetor SSRF aplicável
- `response.json()` sem limite de payload — pré-existente, fora do escopo desta feature

## Follow-ups

- AC-3 (jitter) não tem teste unitário direto — coberto indiretamente pelos testes de contagem de tentativas; pode ser adicionado se desejar cobertura explícita
- `DEBT-P1-001` encerrado após merge

## Status final

**READY_FOR_COMMIT**
