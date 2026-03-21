# REPORT — Histórico por qualidade

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-21
**Branch:** `feat/history-by-quality`

---

## Objetivo

Corrigir o enriquecimento de `priceHistory` para que cada item use o histórico correspondente à sua própria qualidade, sem compartilhar dados entre qualidades diferentes e sem reutilizar cache legado incompatível.

## Escopo entregue

- A URL de `/stats/history` agora solicita as qualidades realmente presentes no lote/cidade.
- O mapa interno de histórico agora diferencia `itemId`, `city` e `quality`.
- O fallback por item foi preservado quando a API não retorna histórico da qualidade específica.
- O cache local ganhou `CACHE_VERSION` para invalidar entradas antigas incompatíveis com a nova chave de histórico.
- Testes cobrindo o comportamento por qualidade e a invalidação de cache legado foram adicionados.

## Arquivos alterados

- `src/services/market.api.ts`
- `src/services/market.cache.ts`
- `src/test/market.api.history-quality.test.ts`
- `src/test/market.cache.test.ts`
- `features/history-by-quality/SPEC.md`

## Validação executada

- RED confirmado em `src/test/market.api.history-quality.test.ts` com falha por histórico compartilhado entre qualidades.
- `REVIEW_OK` em revisão do diff atual.
- `QUALITY_PASS` via `npm run quality:gate`
  - lint OK
  - typecheck OK
  - testes OK (`345/345`)
  - coverage OK
  - build OK
- `SECURITY_PASS`

## Riscos residuais

- A análise de segurança foi estática e não validou a API real sob carga.
- A feature não resolve ainda a frente separada de deduplicação por recência.

## Decisões e observações

- Não foi necessário ADR: a mudança é corretiva e local ao contrato interno do serviço.
- `security-review` não encontrou riscos bloqueantes.

## Resultado final

Feature pronta para commit e PR.
