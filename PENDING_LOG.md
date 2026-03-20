# PENDING_LOG.md — Albion Market Insights

<!-- Atualizado por: session-logger | Não editar manualmente durante sessão ativa -->

## Estado operacional atual

- Branch ativa de trabalho: `chore/node24-migration-gates` (PR #64 aberto)
- Estratégia vigente de runtime:
  - Node 20 = default operacional
  - Node 24 = lane paralela em observação
- Último marco de CI na frente Node 24:
  - run `23344041067` com lanes Node 20 e Node 24 verdes simultaneamente

## Decisões vigentes

- Não criar repositório externo para a frente Node 24 neste momento.
- Manter laboratório interno em `features/node-24-readiness/pr-64-lab/`.
- Promover Node 24 para default apenas após janela contínua de estabilidade.
- Rollback rápido deve continuar documentado e testável (retorno imediato para Node 20-only em caso de regressão).

## Backlog ativo (priorizado por impacto)

### P1 — Próxima janela recomendada

1) Higiene de componentes vendor (`src/components/ui/*`)
- Tipo: dívida técnica incremental
- Objetivo: reduzir warnings/ruído e acoplamento de código não utilizado
- Critério de saída:
  - mapa de uso atualizado
  - pruning incremental sem regressão
  - lint/typecheck/testes verdes

### P2 — Estrutural (após P1)

2) Histórico por qualidade (alvo final)
- Ajustar fetch/enriquecimento para respeitar qualidade do item ao compor histórico.

3) Deduplicação por recência
- Substituir estratégia atual por regra baseada em timestamp/confiabilidade.

4) Factory/DI para serviços
- Reduzir acoplamento de selector por singleton em import-time.

5) Refresh manual com cooldown local (5 min)
- Reavaliar necessidade após mudanças recentes de política de frescor e UX.

### Futuro (não bloqueante)

6) Temas (light/dark/system) via SPEC dedicada.
7) Frente mobile (PWA vs nativo) com reaproveitamento de contratos atuais.

## Node 24 — Plano de observação

### Status dos gates

- Gate 1 (bootstrap CI): concluído
  - Correção de sintaxe/parse no workflow de matrix
- Gate 2 (execução paralela): concluído
  - Correção de leitura de cobertura com fallback para `coverage-final.json`
  - Reexecução verde simultânea (Node 20 + Node 24)

### Próxima condição para promoção

- Acumular janela de estabilidade contínua (1-2 semanas) em execuções reais de PR.
- Não observar regressão de flakiness/material no quality gate.
- Abrir PR dedicado de promoção quando os critérios acima forem cumpridos.

## Janela 6 — Concluída (2026-03-20)

- Drift de documentação/governança alinhado:
  - `CONTEXT.md` atualizado
  - ADR-003 e ADR-005 revisados
  - ADR-011 criado
  - README com política de runtime em observação
  - políticas de storage e artefatos adicionadas

## Janela 7 — Concluída (2026-03-20)

- Lote 1B (itens P1 de consistência) concluído:
  - política única de frescor confirmada
  - ID robusto para alertas confirmado
  - cooldown persistente de alertas confirmado

## Janela 8 — Concluída (2026-03-20)

- UX/consistência da arbitragem:
  - feedback de faixas inválidas na PriceTable (`min > max`)
  - Home com fonte única de arbitragem derivada de `marketItems`
  - paginação adicionada na `ArbitrageTable`
  - testes de regressão atualizados

## Janela 9 — Concluída (2026-03-20)
- Pruning de UI concluído: removidos 34 componentes sem referência em src/components/ui/*.
- Guard-rails executados: npm run lint, npm run typecheck e npm run test verdes.
- Resultado de suíte: 35 arquivos de teste, 333 testes passando.
- Observação: mantido PR #64 aberto como lane de observação controlada.

## Marcos históricos consolidados

- Lote P0 concluído e mergeado
- Lote 1A concluído e mergeado
- Lote 1B (P1) concluído
- Lote 2 concluído e mergeado (PR #51)
- Lote 3 (qualidade/CI/docs) concluído nas frentes planejadas

## Pontos de atenção atuais

- Manter observação do comportamento Node 24 no CI antes de promoção.
- Warnings em componentes vendor (`src/components/ui/*`) seguem como trade-off conhecido até a janela de higiene.
- Não commitar artefatos gerados (`dist/`, `coverage/`, relatórios temporários).

