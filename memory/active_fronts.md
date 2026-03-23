---
name: active_fronts
description: Frentes ativas, decisões em aberto e observações em andamento do projeto
type: project
---

## Active fronts

- **`api-proxy-worker` — PR #79 ABERTA, AGUARDANDO MERGE** (2026-03-22)
  - Branch: `feat/api-proxy-worker` | PR: https://github.com/wendeus0/albion-market-insights/pull/79
  - 5 commits separados por bloco lógico (docs/adr, worker, frontend, CI, session)
  - 23 testes GREEN (18 worker AC-1..AC-5 + 5 frontend AC-6); REPORT `READY_FOR_COMMIT`
  - Pendente: configurar `CLOUDFLARE_API_TOKEN` em GitHub Secrets antes de merge
- SPRINT 2026-03-20 FECHADO: baseline estável e sem bloqueio operacional aberto
- PR #77 MERGEADO: frente `coverage-branches-gap` concluída (AC-2/AC-3/AC-4)
- Observação contínua:
  - Node 24 CI lane (aguardando janela de 1-2 semanas para promoção)
  - Issue #59 (flakiness) — não bloqueia baseline

## Open decisions

- **Branch/commit/PR de `api-proxy-worker`**: implementação completa e testada; aguardando sessão seguinte para `git-flow-manager`
- **Deploy do Worker**: requer `CLOUDFLARE_API_TOKEN` em GitHub Secrets; Worker ainda não deployado em `workers.dev`
- **VITE_PROXY_URL em produção**: precisa ser configurado no `.env` real após deploy do Worker
- **Promoção Node 24 para default**: job paralelo verde e mergeado; aguardando janela de estabilidade (1-2 semanas) antes de tornar default
- **Deadline Node 24**: 2026-06-02 configurado no dependabot.yml
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update
- **Proteção global da API**: RESOLVIDA pela frente `api-proxy-worker` (Cloudflare Worker com cache + rate limit + deduplicação)
- **Estratégia mobile**: frente mantida aberta (PWA e/ou app nativo), aguardando recorte em SPEC
- **Feature futura de temas**: reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada
- **Issue #59 (flakiness)**: decidir se investigação adicional é necessária ou se threshold atual é aceitável
