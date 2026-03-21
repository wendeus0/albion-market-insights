# REPORT — Deduplicação por recência

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-21
**Branch:** `feat/deduplicacao-por-recencia`

---

## Objetivo

Substituir a regra de deduplicação `first occurrence wins` por uma escolha determinística baseada em recência e confiabilidade do registro retornado pela API.

## Escopo entregue

- Extraída lógica explícita para comparar duplicatas de `AlbionPriceRecord`.
- A consolidação agora prefere o registro mais recente por chave `item_id|city|quality`.
- Em empate de recência, a consolidação prefere o registro com preços válidos mais completos.
- Em empate adicional, a consolidação usa validade dos timestamps como desempate secundário.
- A deduplicação continua produzindo uma única entrada por chave sem alterar o fluxo de fallback existente.
- Testes RED/GREEN adicionados para recência, tie-break por completude e estabilidade de registros únicos.

## Arquivos alterados

- `src/services/market.api.ts`
- `src/test/market.api.dedup.test.ts`
- `features/deduplicacao-por-recencia/SPEC.md`

## Validação executada

- RED confirmado em `src/test/market.api.dedup.test.ts`
- code review: `REVIEW_OK_WITH_NOTES`
- quality gate: `QUALITY_PASS`
  - `npm run quality:gate`
  - lint OK
  - typecheck OK
  - testes OK (`345/345`)
  - build OK
- security review: skip justificado
  - a mudança não toca auth, secrets, infra, CI/CD, scripts operacionais ou APIs novas

## Riscos residuais

- A recência do registro foi definida como o maior timestamp entre `sell_price_min_date` e `buy_price_max_date`; isso é determinístico e suficiente para o recorte atual, mas pode merecer revisão futura se o domínio exigir outra noção de snapshot.
- A frente não resolve ainda a questão separada de histórico por qualidade quando essa PR for analisada em conjunto com a outra frente relacionada.

## Decisões e observações

- Não foi necessário ADR: trata-se de uma correção local de seleção de registros, sem convenção arquitetural nova.
- O fluxo de fallback existente já estava coberto pelos testes prévios de `market.api` e foi preservado.

## Resultado final

Feature pronta para commit e PR.
