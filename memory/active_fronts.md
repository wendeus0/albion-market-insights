---
name: active_fronts
description: Frentes ativas, decisões em aberto e observações em andamento do projeto
type: project
---

## Active fronts

- **PR #79 MERGEADO**: frente `api-proxy-worker` concluída (2026-03-22)
  - Cloudflare Worker deployado via CI (CLOUDFLARE_API_TOKEN configurado)
  - 23 testes GREEN (18 worker AC-1..AC-5 + 5 frontend AC-6)
  - `VITE_USE_PROXY` disponível para ativar proxy no frontend
- PR #77 MERGEADO: frente `coverage-branches-gap` concluída (AC-2/AC-3/AC-4)
- SPRINT 2026-03-20 FECHADO: baseline estável e sem bloqueio operacional aberto
- Observação contínua:
  - Node 24 CI lane (aguardando janela de 1-2 semanas para promoção)
  - Issue #59 (flakiness) — não bloqueia baseline
- Próximo ciclo: abrir nova frente a partir de `main` sincronizada

## Open decisions

- **Ativação do proxy no frontend**: configurar `VITE_USE_PROXY=true` e `VITE_PROXY_URL` no ambiente de produção/staging para começar a usar o Worker
- **Promoção Node 24 para default**: job paralelo verde e mergeado; aguardando janela de estabilidade (1-2 semanas) antes de tornar default
- **Deadline Node 24**: 2026-06-02 configurado no dependabot.yml
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update
- **Proteção global da API**: RESOLVIDA pela frente `api-proxy-worker` (Cloudflare Worker com cache + rate limit + deduplicação)
- **Estratégia mobile**: frente mantida aberta (PWA e/ou app nativo), aguardando recorte em SPEC
- **Feature futura de temas**: reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada
- **Issue #59 (flakiness)**: decidir se investigação adicional é necessária ou se threshold atual é aceitável
