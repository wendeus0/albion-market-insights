# ADR-011 — Runtime CI com lane paralela para observação de Node 24

Status: Aceito
Data: 2026-03-20

## Contexto

Há necessidade de validar compatibilidade com Node 24 sem elevar risco operacional da base estável em Node 20.

A troca direta do runtime default pode mascarar regressões de toolchain e qualidade de pipeline. A estratégia precisava permitir:
- comparação objetiva entre runtimes
- rollback rápido
- promoção baseada em evidência

## Decisão

Manter Node 20 como runtime default e operar uma lane paralela Node 24 no workflow de quality gate.

Política de promoção:
1. Lanes Node 20 e Node 24 devem ficar verdes de forma recorrente
2. Janela mínima de estabilidade contínua (1-2 semanas) antes da promoção
3. Promoção para Node 24 default em PR dedicado
4. Rollback imediato documentado (retorno da matrix para Node 20)

## Consequências

- Redução de risco na migração de runtime
- Maior rastreabilidade da decisão de promoção
- Custo de CI ligeiramente maior durante fase de observação
- Possibilidade de detectar falhas específicas de runner/toolchain por runtime

## Alternativas consideradas

- Troca direta para Node 24: mais rápida, porém com risco alto de regressão operacional.
- Adiar totalmente Node 24: reduz risco imediato, mas aumenta risco de dívida de compatibilidade.
- Feature branch isolada sem CI principal: reduz visibilidade e dificulta comparação contínua.

