# SPEC — PR 64 Lab (Node 24 Validation)

## Contexto
Este espaço isola os experimentos do PR #64 dentro do próprio repositório Albion Market Insights.

PR alvo: https://github.com/wendeus0/albion-market-insights/pull/64
Branch alvo: chore/node24-migration-gates

## Objetivo
Executar validação progressiva de Node 24 sem promover imediatamente para runtime padrão do projeto.

## Escopo desta pasta
- Artefatos de experimento e rastreabilidade do PR #64
- Critérios de promoção para migração ao projeto principal
- Registro de divergências observadas durante os testes

## Fora de escopo
- Troca imediata do runtime padrão para Node 24 em todas as pipelines
- Mudança de `engines.node` sem baseline estável

## Gates de promoção para o projeto principal
1. Lane Node 24 verde por janela contínua mínima acordada (ex.: 1-2 semanas)
2. Nenhuma regressão funcional nos jobs de lint/typecheck/test/build
3. Sem aumento material de flakiness em relação ao baseline Node 20
4. Rollback documentado e testado em caso de falha

## Estratégia operacional
- Manter Node 20 como default de produção durante a fase de validação
- Executar Node 24 em lane paralela
- Promover somente após evidência consistente

## Critério de saída
- Gate de promoção aprovado
- Decisão registrada no PENDING_LOG.md
- Atualização de runtime/documentação planejada para PR dedicado de promoção

