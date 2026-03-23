---
name: project_state
description: Estado atual do projeto Albion Market Insights — sprint, branch, marcos alcançados
type: project
---

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Sprint 2026-03-23 encerrado — deploy no Cloudflare Pages configurado, Worker proxy ativo
**Branch ativa:** `main` (limpa após merge dos PRs #81 e #82)
**Snapshot local:** worktree limpa, sem mudanças pendentes

**Marcos alcançados:**

- Sprint 2026-03-23 fechado (session-close, coverage, debt-tracker, security-audit, ADR-014)
- PR #81 MERGEADO: `.env` commitado com `VITE_USE_PROXY=true` e `VITE_PROXY_URL`
- PR #82 MERGEADO: `VITE_USE_REAL_API=true` restaurado no `.env`
- ADR-014 criado: configuração de ambiente para frontend com proxy Cloudflare
- 13 testes corrigidos: `vi.stubEnv("VITE_USE_PROXY", "false")` adicionado a 4 arquivos de teste
- Cobertura global: 95.74% statements, 90.21% branches, 94.64% functions, 96.93% lines
- Quality gate validado com 399/399 testes passando
- PR #79 MERGEADO: api-proxy-worker (Worker deployado via CI)
- PR #77 MERGEADO: fechamento do gap de cobertura de branches (AC-2/AC-3/AC-4)
- PR #72 MERGEADO: Deduplicação por recência
- PR #71 MERGEADO: History by quality
- PR #70 MERGEADO: Higienização de componentes vendor
- PR #64 MERGEADO: Lane Node 24 integrada à CI; observação contínua
- Issue #59 (flakiness) em acompanhamento — não bloqueia baseline

**Ação pendente (usuário):** Atualizar `VITE_USE_REAL_API` de `false` para `true` no dashboard Cloudflare Pages (Settings → Environment variables → Production) e fazer redeploy
