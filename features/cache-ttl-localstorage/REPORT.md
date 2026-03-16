# REPORT — cache-ttl-localstorage

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-16

---

## O que mudou

- **`src/services/market.cache.ts`** (novo): módulo de cache com leitura, escrita e validação Zod dos dados. Exporta `CACHE_KEY`, `CACHE_TTL_MS` (300 000 ms), `readCache`, `writeCache`, `isCacheValid` e o tipo `MarketCacheEntry` derivado do schema.
- **`src/services/market.api.ts`**: `getItems()` verifica o cache antes de chamar a API; `cachedLastUpdate` é sincronizado com `cached.cachedAt` quando o cache é servido. `writeCache` é chamado após fetch bem-sucedido.
- **`src/test/market.cache.test.ts`** (novo): 17 testes cobrindo AC-1 a AC-5.

---

## Por que mudou

Carregamento inicial com API real era lento (450 itens × 7 cidades). Dados de preços do Albion Online têm granularidade adequada para TTL de 5 minutos — sem perda de utilidade analítica. Fecha DEBT-P1-002.

---

## Como foi validado

- 102/102 testes passando (85 anteriores + 17 novos)
- `npm run lint`: 0 erros (7 warnings pré-existentes em `src/components/ui/`)
- `npm run build`: sucesso, bundle inalterado (~394 kB)
- code-review: REVIEW_OK_WITH_NOTES — riscos #1 (cast sem validação), #2 (QuotaExceededError), #4 (import relativo) resolvidos

---

## Riscos residuais

- **Finding #3 (RISCO baixo):** `cachedLastUpdate` é estado de instância. Em cenário multi-instância (improvável em produção — app usa singleton), o valor pode divergir do cache real. Sem impacto em testes ou uso atual.
- **Finding #6 (SUGESTÃO):** `isCacheValid` com `expiresAt` malformado retorna `false` por propriedade de `NaN` — comportamento correto mas implícito. Sem risco operacional.

---

## Próximos passos

1. TypeScript strict mode iteração 2 (`src/hooks/`) — ADR-006
2. Enchanted items (`.@1/.@2/.@3`) no catálogo
