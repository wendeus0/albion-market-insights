# REPORT — Node 24 Readiness (P2)

## Status
READY_FOR_COMMIT

## Objetivo
Avaliar impacto da migração de runtime do projeto de Node 20 para Node 24 antes do deadline de actions.

## Baseline observada (Node 20)
- Runtime local: Node v20.20.0 / npm 10.8.2
- Build: OK (`npm run build`)
- Workflow CI principal (`quality-gate.yml`) ainda fixa `node-version: 20`
- Test suite completa sob cobertura apresenta flakiness intermitente (issue #59), o que impacta comparações de desempenho confiáveis

## Risco técnico
1. Dependências de toolchain (Vite, Vitest, Playwright, ESLint) podem ter comportamento diferente em Node 24
2. Instabilidade atual da suíte sob cobertura pode mascarar regressões reais da migração
3. Sem job paralelo de comparação, mudança direta de runtime aumenta risco de quebra de pipeline

## Recomendação
1. Manter Node 20 como default até estabilizar baseline de testes (issue #59)
2. Criar job paralelo de validação Node 24 no CI (não bloqueante no primeiro ciclo)
3. Após 1-2 semanas de estabilidade, promover Node 24 para runtime padrão do quality gate
4. Atualizar `engines.node` e documentação somente após CI verde contínuo em Node 24

## Próximos passos sugeridos
- Abrir issue de tracking para migração gradual (Node 20 -> 24)
- Planejar rollout em 3 fases: parallel check -> soft enforcement -> full switch

