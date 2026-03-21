---
name: project_state
description: Estado atual do projeto Albion Market Insights — sprint, branch, marcos alcançados
type: project
---

## Current project state

**Plataforma:** Dashboard web React + TypeScript para análise de preços do mercado do Albion Online
**Status:** Sprint 2026-03-20 fechado — baseline estável, pronto para próximo ciclo
**Branch ativa:** `main` — sincronizada com `origin/main` (commit `344741e`)
**Snapshot local:** worktree limpa, nenhuma mudança pendente

**Marcos alcançados:**

- Sprint 2026-03-20 fechado com sucesso (session-close, coverage, debt-tracker, security-audit)
- Todas as 9 janelas (Janelas 6-9) concluídas e mergeadas
- PR #72 MERGEADO: Deduplicação por recência — preferência por registros mais novos
- PR #71 MERGEADO: History by quality — respeita qualidade do item no enriquecimento
- PR #70 MERGEADO: Higienização de componentes vendor — isolamento de exports
- PR #64 MERGEADO: Lane Node 24 integrada à CI; observação contínua
- Frentes A e B do Contrato de Autonomia v1 concluídas (tier naming + ícones híbridos)
- Cobertura: 95.26% linhas, 93.47% statements, 93.09% functions
- 333 testes passando, build OK
- Issue #59 (flakiness) em acompanhamento — não bloqueia baseline
