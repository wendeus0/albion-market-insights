---
name: active_fronts
description: Frentes ativas, decisões em aberto e observações em andamento do projeto
type: project
---

## Active fronts

- SPRINT 2026-03-20 FECHADO: baseline estável e sem bloqueio operacional aberto
- PR #77 MERGEADO: frente `coverage-branches-gap` concluída (AC-2/AC-3/AC-4)
- PR #72, #71, #70 MERGEADOS: Deduplicação, history-by-quality, higienização de componentes
- LOTE 1B, 2, 3 CONCLUÍDOS E MERGEADOS: documentação, refatoração, CI/qualidade
- Observação contínua:
  - Node 24 CI lane (aguardando janela de 1-2 semanas para promoção)
  - Issue #59 (flakiness) — não bloqueia baseline
- Próximo ciclo: abrir nova frente a partir de `main` sincronizada

## Open decisions

- **Promoção Node 24 para default**: job paralelo verde e mergeado; aguardando janela de estabilidade (1-2 semanas) antes de tornar default
- **Deadline Node 24**: 2026-06-02 configurado no dependabot.yml
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update
- **Proteção global da API**: definir arquitetura da camada central (proxy/backend com cache compartilhado + rate limit) para mitigar refresh concorrente entre usuários
- **Estratégia mobile**: frente mantida aberta (PWA e/ou app nativo), aguardando recorte em SPEC
- **Feature futura de temas**: reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada
- **Issue #59 (flakiness)**: decidir se investigação adicional é necessária ou se threshold atual é aceitável
