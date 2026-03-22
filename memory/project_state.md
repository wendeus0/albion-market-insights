---
name: project_state
description: Estado atual do projeto Albion Market Insights — sprint, branch, marcos alcançados
type: project
---

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Sessão encerrada com frente `coverage-branches-gap` concluída e mergeada na `main`
**Branch ativa:** `feat/coverage-branches-gap-ac2-ac4` (local) — já mergeada; drift atual `behind=1` em relação a `origin/main`
**Snapshot local:** worktree limpa, sem mudanças pendentes

**Marcos alcançados:**

- Sprint 2026-03-20 fechado com sucesso (session-close, coverage, debt-tracker, security-audit)
- Todas as 9 janelas (Janelas 6-9) concluídas e mergeadas
- PR #77 MERGEADO: fechamento do gap de cobertura de branches (AC-2/AC-3/AC-4)
- Cobertura global atual: 95.83% statements, 90.28% branches, 94.64% functions, 96.92% lines
- Cobertura alvo atingida nos módulos críticos: `PriceTable.tsx` 100% branches, `market.api.ts` 94.73% branches
- Quality gate validado com 394/394 testes passando
- PR #72 MERGEADO: Deduplicação por recência — preferência por registros mais novos
- PR #71 MERGEADO: History by quality — respeita qualidade do item no enriquecimento
- PR #70 MERGEADO: Higienização de componentes vendor — isolamento de exports
- PR #64 MERGEADO: Lane Node 24 integrada à CI; observação contínua
- Frentes A e B do Contrato de Autonomia v1 concluídas (tier naming + ícones híbridos)
- Issue #59 (flakiness) em acompanhamento — não bloqueia baseline
