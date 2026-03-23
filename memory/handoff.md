---
name: handoff
description: Último handoff de sessão e prompt de retomada — sobrescrito a cada encerramento
type: project
---

## Last handoff summary

**Sessão:** Deploy frontend Cloudflare Pages + correção de env vars + sprint-close (2026-03-23)
**Trabalho realizado:**

- Diagnóstico em 3 camadas do dashboard mostrando Mock:
  1. `.env` não tinha `VITE_USE_PROXY=true` → PR #81 corrigiu
  2. `.env` tinha `VITE_USE_REAL_API=false` → PR #82 corrigiu
  3. Pages dashboard tem `VITE_USE_REAL_API=false` sobrescrevendo → pendente ação do usuário
- ADR-014 criado: `docs/adr/ADR-014-env-config-frontend-proxy.md`
- 13 testes corrigidos: `vi.stubEnv("VITE_USE_PROXY", "false")` adicionado ao topo de 4 arquivos
  - `market.api.dedup.test.ts`, `market.api.batch.test.ts`, `market.api.retry.test.ts`, `market.api.history-quality.test.ts`
- Sprint-close completo: coverage (399/399, 95.74% stmts), debt-tracker, security-audit (SECURITY_PASS_WITH_NOTES), ADR-014

**Estado ao encerrar:**

- Branch local: `main` (limpa)
- `origin/main`: PRs #81 e #82 mergeados
- Worker deployado em `albion-market-proxy.wendel-gdsilva.workers.dev`
- Frontend deployado no Cloudflare Pages mas ainda mostrando Mock (ver ação pendente)

**Retomar por:**

```
Read before acting:
- memory/MEMORY.md (índice → arquivos temáticos em memory/)
- AGENTS.md
- PENDING_LOG.md
- bash .claude/scripts/git-sync-check.sh

Current state:
- PRs #81 e #82 mergeados: proxy ativado no .env
- BLOQUEIO: Pages dashboard ainda tem VITE_USE_REAL_API=false → usuário precisa corrigir manualmente
- Caminho: Cloudflare Pages dashboard → Settings → Environment variables → Production → editar VITE_USE_REAL_API para true → Deployments → Retry deployment

Open points:
- Confirmar dashboard em produção mostrando dados reais após redeploy
- Definir com usuário qual será a próxima feature
- Manter observação Node 24 até janela mínima de estabilidade

Recommended next front:
1. Usuário corrige VITE_USE_REAL_API no Pages dashboard + redeploy
2. Confirmar produção OK (badge "Live" + dados reais)
3. Abrir SPEC da próxima feature
```
