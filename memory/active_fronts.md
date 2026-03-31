---
name: active_fronts
description: Frentes ativas, decisões em aberto e observações em andamento do projeto
type: project
---

## Active fronts

- **fix-alerts-authenticated-ux** (2026-03-31) ✅ **CONCLUÍDA — PR #102 MERGEADA**
  - AC-1 (toggle/delete instantâneo): Fix race condition com `refetchType: 'none'`
  - AC-2 (delete UI): Já resolvido pelo mesmo fix
  - AC-3 (item search): Já implementado em `AlertsManager.tsx`
  - AC-4 (threshold suggestion): Já implementado em `useAlertsForm.tsx`
  - 502/502 testes passando, 93.73% coverage
- **PR #97 MERGEADO**: fix oauth pkce flow (2026-03-29) ✅
  - OAuth com Discord: `flowType: "pkce"` + `detectSessionInUrl: true` no Supabase client
  - Early return guard no Login para usuários autenticados
  - Edge Function "Verify JWT with legacy secret" desabilitado no Supabase Dashboard
- **PR #98 MERGEADO**: session logs OAuth fix (2026-03-30) ✅
- **PRs #81 e #82 MERGEADOS**: configuração de env vars para Cloudflare Pages concluída (2026-03-23)
  - `.env` commitado com `VITE_USE_PROXY=true`, `VITE_PROXY_URL`, `VITE_USE_REAL_API=true`
  - ADR-014 criado documentando a estratégia
  - 13 testes corrigidos com `vi.stubEnv("VITE_USE_PROXY", "false")`
- **PR #79 MERGEADO**: frente `api-proxy-worker` concluída (2026-03-22)
- SPRINT 2026-03-23 FECHADO: 399/399 testes passando, deploy configurado
- Observação contínua:
  - Node 24 promovido para default (2026-03-31)
  - Node 20 mantido como lane de fallback temporária
  - Issue #59 (flakiness) — não bloqueia baseline

## Open decisions

- **Dashboard Cloudflare Pages**: `VITE_USE_REAL_API=true` configurado no dashboard + redeploy executado (2026-03-23) — dados reais em produção ✅
- **Promoção Node 24 para default**: CONCLUÍDO (2026-03-31)
  - Node 24 promovido para runtime default operacional
  - Node 20 mantido como lane de fallback temporária no CI
  - PR de promoção mergeado após quality gate verde
- Runbook de promoção/rollback publicado: `docs/architecture/NODE24_PROMOTION_RUNBOOK.md`
- **Deadline Node 24**: 2026-06-02 configurado no dependabot.yml
- **Trade-off shadcn/ui warnings**: manter warnings de vendor como exceção permanente ou investir em estratégia de isolamento/update
- **Estratégia mobile**: frente mantida aberta (PWA e/ou app nativo), aguardando recorte em SPEC
- **Feature futura de temas**: reintroduzir theming completo (light/dark/system) apenas com SPEC dedicada
- **Issue #59 (flakiness)**: decidir se investigação adicional é necessária ou se threshold atual é aceitável
