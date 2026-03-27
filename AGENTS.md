# AGENTS.md — Albion Market Insights

## Hierarquia de Fontes de Verdade

1. SPEC da feature → 2. CLAUDE.md → 3. AGENTS.md → 4. CONTEXT.md → 5. memory/MEMORY.md

---

## Workflow Oficial

```
spec-editor → spec-validator → [task-planner*]
→ [repo-preflight*] → test-red → green-refactor → [code-review*] → quality-gate
→ [security-review*] → report-writer
→ branch-sync-guard → [adr-manager*] → feature-scope-guard → enforce-workflow → git-flow-manager
```

Meta-skill: `implement-feature`

### Condicionais

| Skill             | Quando                                            |
| ----------------- | ------------------------------------------------- |
| `task-planner`    | SPEC com >=3 critérios independentes              |
| `repo-preflight`  | Docker, build, scripts de boot, env vars          |
| `code-review`     | Diff não trivial ou lógica não óbvia              |
| `security-review` | CI/CD, auth/secrets, infra, APIs públicas, skills |
| `adr-manager`     | Decisão arquitetural durável com trade-off        |

---

## Agentes Customizados (`.claude/agents/`)

| Agente        | Modo               | Quando                                       | Entrega                        |
| ------------- | ------------------ | -------------------------------------------- | ------------------------------ |
| explorer      | read-only          | análise de impacto pré-implementação         | mapa de arquivos, deps, riscos |
| worker        | r/w                | SPEC aprovada + impacto mapeado              | implementação, lint/build OK   |
| reviewer      | read-only          | pós-implementação (= `code-review`)          | BLOQUEANTE / RISCO / SUGESTÃO  |
| monitor       | exec (sem escrita) | falha build/lint/runtime (= `debug-failure`) | evidências + reprodução        |
| domain-expert | read-only          | dúvida sobre domínio Albion Online           | validação de domínio           |

---

## Regras Críticas

1. Uma feature por vez
2. SPEC antes de código
3. Testes RED antes de GREEN
4. `code-review` sem blockers antes de commit
5. `npm run quality:gate` limpo antes de commit (lint + typecheck + test + coverage + build)
6. Escopo restrito à SPEC
7. `enforce-workflow` antes de commit
8. Não editar `src/components/ui/` (shadcn/ui)
9. Não fazer polling agressivo à API
10. Antes de `session-open`, `session-close`, `sprint-close` ou `memory-curator` quando o estado de branches/PRs impactar a memória, executar `.claude/scripts/git-sync-check.sh`
11. `memory-curator` neste projeto usa formato de índice; ver `.claude/rules/memory.md`

### Guardrail de Memória Durável

- `memory/MEMORY.md` não pode assumir que branch local existente representa frente ativa.
- Antes de consolidar memória durável, validar estado remoto/local com `.claude/scripts/git-sync-check.sh`.
- Se o script indicar branch local já mergeada em `origin/main`, tratar essa frente como concluída até evidência contrária.
- Snapshot local só entra na memória quando altera a próxima sessão.

---

## Definition of Done

SPEC aprovada → RED → GREEN → `quality:gate` OK (lint + typecheck + test + coverage + build) → sem console.log → `@/*` imports → code-review OK → security-review OK/pulada → REPORT READY_FOR_COMMIT → WORKFLOW_OK → commit + PR

## CI

`.github/workflows/security-review.yml` — analisa PRs automaticamente via `claude-code-security-review`. Requer secret `CLAUDE_API_KEY` no repositório GitHub. Não substitui a skill `security-review` local.
