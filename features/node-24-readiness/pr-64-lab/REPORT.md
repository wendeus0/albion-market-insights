# REPORT — PR 64 Lab (Node 24 Validation)

## Status
EM_ANDAMENTO (GATE 1 CONCLUÍDO, GATE 2 EM EXECUÇÃO)

## Objetivo
Validar Node 24 em lane paralela com isolamento controlado antes de promoção para o runtime principal.

## Premissas vigentes
- PR #64 permanece aberto
- Node 20 segue como runtime default do projeto
- Promoção depende de estabilidade observável

## Execução inicial
- Pasta de laboratório criada em `features/node-24-readiness/pr-64-lab/`
- SPEC de experimento registrado
- Critérios de promoção definidos

## GATE 1 — Observação de execução CI (2026-03-20)
- Resultado inicial do PR #64: workflow `Quality Gate` em falha imediata
- Causa-raiz identificada: YAML inválido no workflow (`matrix.node-version` no contexto da expressão)
- Evidência: run `23342643515` com anotação `Invalid workflow file` (linha 36)
- Impacto: nenhum job de Node 20/24 chegou a iniciar, impossibilitando comparação entre lanes

## Correção aplicada no gate
- Workflow ajustado para usar chave compatível no matrix: `node_version`
- Referências atualizadas para `${{ matrix.node_version }}` em setup/logs/conditions
- Ajuste adicional no comando de runtime para evitar ambiguidade de parser YAML (substituído por bloco multiline)
- Rollback permanece documentado para lane Node 24

## GATE 2 — Resultado da lane paralela (2026-03-20)
- Run validado com jobs iniciados: `23343859250`
- Node 24: `success` (job `quality-gate (24)`)
- Node 20: `failure` (job `quality-gate (20)`)
- Falha do Node 20 não foi de código de produto: step `Enforce coverage threshold (gradual)` não encontrou `coverage-summary.json`
- Evidência de execução: quality gate + smoke E2E passaram; quebra ocorreu apenas na leitura do artefato de cobertura

## Correção aplicada no Gate 2
- Enforcement de coverage no workflow agora aceita fallback para `coverage/coverage-final.json`
- Quando `coverage-summary.json` existir, mantém caminho preferencial
- Quando não existir, calcula `% statements` a partir de `coverage-final.json` e aplica threshold (88%)

## Próximas verificações
1. Reexecutar pipeline com fallback de coverage
2. Confirmar green simultâneo de Node 20 e Node 24
3. Consolidar amostra mínima de estabilidade para decisão de promoção

## Decisão pendente
Promover Node 24 para default somente após cumprir os gates de estabilidade.

