---
name: active_fronts
description: Frentes ativas, decisões em aberto e observações em andamento do projeto
type: project
---

## Active fronts

- **`api-proxy-worker` — IMPLEMENTADO LOCALMENTE, AGUARDANDO BRANCH/COMMIT/PR** (2026-03-22)
  - Cloudflare Worker como proxy entre frontend e API Albion Online
  - 23 testes passando (18 worker + 5 frontend); REPORT `READY_FOR_COMMIT`
  - Mudanças locais não commitadas — próxima sessão cria branch `feat/api-proxy-worker` e abre PR
  - Working directory: `worker/` (sub-projeto com `package.json` próprio)
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
