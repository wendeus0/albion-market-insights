# NODE24_PROMOTION_RUNBOOK.md

## Objetivo

Definir critérios objetivos para promover Node 24 de lane de observação para runtime default no projeto, mantendo rollback rápido e baixo risco operacional.

## Estado atual

- Baseline operacional: Node 20
- Lane paralela no CI: Node 24 (workflow `quality-gate.yml`)
- Promoção: somente após janela mínima de estabilidade contínua

## Critérios de promoção (Go / No-Go)

### Gate 1 — Estabilidade em PRs reais

Critério:
- Janela de 7 a 14 dias com execuções reais de PR passando em Node 24
- Sem padrão recorrente de falha exclusiva da lane Node 24

Evidência:
- Histórico de runs no GitHub Actions (`quality-gate`)

### Gate 2 — Qualidade técnica

Critério:
- `npm run lint` verde
- `npm run typecheck` verde
- `npm run test` verde
- `npm run build` verde
- `npm run test:e2e:smoke` verde

Evidência:
- Pipeline verde com lane Node 24

### Gate 3 — Sem regressão de tempo crítica

Critério:
- Tempo da lane Node 24 dentro de faixa aceitável (sem crescimento significativo sustentado)

Faixa sugerida:
- Até +20% da mediana da lane Node 20 por período curto

Evidência:
- Duração por job no histórico do Actions

### Gate 4 — Rollback validado

Critério:
- Procedimento de rollback testado e documentado

Evidência:
- Passo de rollback executável em 1 alteração de workflow

## Procedimento de promoção

1. Atualizar documentação para indicar Node 24 como default
   - `README.md`
   - `CONTEXT.md`
   - `memory/active_fronts.md`

2. Ajustar CI para lane principal em Node 24 (mantendo Node 20 como fallback temporário, se desejado)

3. Rodar quality gate completo em PR dedicado

4. Mergear PR de promoção com plano de observação pós-merge (24h-72h)

## Procedimento de rollback imediato

Se houver regressão relevante após promoção:

1. Editar `.github/workflows/quality-gate.yml`
   - reduzir matrix para Node 20 apenas

2. Reexecutar pipeline

3. Abrir/atualizar issue de incidente com:
   - sintoma
   - primeira run com falha
   - workaround aplicado
   - causa raiz (quando identificada)

## Checklist rápido (copiar para PR de promoção)

- [ ] Janela de estabilidade (7-14 dias) confirmada
- [ ] Lint/typecheck/test/build verdes em Node 24
- [ ] E2E smoke verde em Node 24
- [ ] Sem regressão relevante de duração de pipeline
- [ ] Rollback testado e documentado
- [ ] Docs de runtime atualizadas

## Donos e responsabilidade

- Dono técnico da promoção: maintainer do repositório
- Aprovação recomendada: 1 revisão técnica adicional
- Canal de acompanhamento: issue #60

