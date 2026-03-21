# REPORT — Node 24 Readiness (P2)

## Status
READY_FOR_COMMIT

## Gate 1 — Diagnóstico (compatibilidade e risco)

Baseline observada:
- Runtime local default: Node v20.20.0 / npm 10.8.2
- Runtime validado em paralelo: Node v24.14.0 com npm 10.8.2
- CI atual em `.github/workflows/quality-gate.yml` estava fixo em Node 20

Resultados de compatibilidade em Node 24:
- `npm ci`: OK
- `npm run quality:gate`: OK
- `npm run test:e2e:smoke`: OK (após provisionar Chromium no ambiente)

Matriz de risco:
- Vite/Vitest/TypeScript/ESLint: baixo (suite verde em Node 24)
- Playwright: médio (depende de browser provisionado; falha sem Chromium)
- CI workflow: baixo-médio (mudança simples, mas impacta tempo de pipeline)

## Gate 2 — Prova controlada em branch dedicada

Branch:
- `chore/node24-migration-gates`

Mudanças aplicadas:
- `quality-gate.yml` convertido para matriz:
  - Node 20 e Node 24 em paralelo
  - `fail-fast: false`
- Coverage threshold mantém enforcement no lane Node 20 (evita duplicidade de gate)
- Logs de runtime exibem explicitamente versão da lane

## Gate 3 — Rollback validado

Estratégia de rollback imediato:
1. Editar matrix no workflow para `node-version: [20]`
2. Reexecutar pipeline
3. Opcional: reverter commit da frente Node 24 em 1 commit (git revert)

Critério de abort (Node 24):
- qualquer falha recorrente em quality-gate ou smoke E2E por incompatibilidade de runtime
- fallback automático para lane única Node 20 até correção

## Gate 4 — Publicação

Artefatos desta frente:
- `package.json`: engines ajustada para faixa suportada `>=20.0.0 <25`
- `.github/workflows/quality-gate.yml`: matriz Node 20/24 + instruções de rollback
- relatório atualizado com evidências e plano de abort

## Evidências locais

Node 24:
- `npm ci` -> OK
- `npm run quality:gate` -> OK
- `npm run test:e2e:smoke` -> OK (4/4)

## Decisão

Recomendação: manter validação paralela Node 20/24 ativa no CI e promover Node 24 como runtime principal apenas após janela curta de estabilidade contínua.

