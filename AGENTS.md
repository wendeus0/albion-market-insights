# AGENTS.md — Albion Market Insights

## Hierarquia de Fontes de Verdade

1. **SPEC da feature** — comportamento esperado (precedência sobre tudo)
2. **CLAUDE.md** — convenções de código, stack e comandos de validação
3. **AGENTS.md** (este arquivo) — workflow e responsabilidades
4. **CONTEXT.md** — contexto do projeto, modelo de domínio e decisões arquiteturais
5. **memory/MEMORY.md** — estado durável entre sessões

---

## Workflow Oficial

```
spec-editor → spec-validator → [task-planner*]
→ [repo-preflight*] → test-red → green-refactor → [code-review*] → quality-gate
→ [security-review*] → report-writer
→ branch-sync-guard → [adr-manager*] → feature-scope-guard → enforce-workflow → git-flow-manager
```

Use a meta-skill `implement-feature` para orquestrar o ciclo completo.

| Fase | Skill | Critério de Saída |
|------|-------|-------------------|
| SPEC | `spec-editor` → `spec-validator` | SPEC aprovada com critérios de aceite verificáveis |
| TEST-RED | `test-red` | Testes falhando pelo motivo certo |
| GREEN-REFACTOR | `green-refactor` | Testes passando, código refatorado |
| QUALITY-GATE | `quality-gate` | `QUALITY_PASS` ou `QUALITY_PASS_WITH_GAPS` |
| SECURITY-REVIEW | `security-review` | `SECURITY_PASS` \| `SECURITY_PASS_WITH_NOTES` \| `SECURITY_BLOCKED` |
| REPORT | `report-writer` | `READY_FOR_COMMIT` |
| BRANCH-SYNC | `branch-sync-guard` | `SYNC_OK` |
| SCOPE-CHECK | `feature-scope-guard` | `SCOPE_OK` ou `SCOPE_WARNING` aceito |
| VERIFY | `enforce-workflow` | `WORKFLOW_OK` |
| COMMIT | `git-flow-manager` | Commit + PR abertos |

### Condicionais

| Skill | Quando ativar |
|-------|---------------|
| `task-planner` | SPEC com ≥3 critérios de aceite implementáveis de forma independente |
| `repo-preflight` | Feature toca Docker, build, scripts de boot ou env vars |
| `code-review` | Diff maior que trivial ou lógica não óbvia |
| `security-review` | Feature toca CI/CD, auth/secrets, infra, APIs públicas ou skills |
| `adr-manager` | Decisão arquitetural durável com trade-off relevante |

---

## Agentes Customizados do Projeto

Estes agentes estão disponíveis em `.claude/agents/` como subagentes especializados:

### explorer
- **Modo**: read-only
- **Ativa quando**: início de análise de impacto antes de implementação
- **Entrega**: mapeamento de arquivos afetados, dependências, riscos

### worker
- **Modo**: leitura e escrita
- **Ativa quando**: SPEC aprovada e impacto mapeado
- **Entrega**: implementação dentro do escopo, lint e build passando

### reviewer
- **Modo**: read-only
- **Ativa quando**: implementação concluída (equivale a `code-review`)
- **Entrega**: findings classificados: BLOQUEANTE / RISCO / SUGESTÃO

### monitor
- **Modo**: execução de comandos (sem escrita)
- **Ativa quando**: falha de build, lint ou comportamento inesperado (equivale a `debug-failure`)
- **Entrega**: relatório de evidências com passos de reprodução

### domain-expert
- **Modo**: read-only
- **Ativa quando**: dúvida sobre domínio do Albion Online (itens, cidades, tiers, lógica de mercado)
- **Entrega**: validação de domínio, não implementação

---

## Regras Críticas

1. **Uma feature por vez** — não iniciar nova feature sem fechar a anterior
2. **SPEC antes de código** — nenhuma implementação de feature nova sem SPEC aprovada
3. **Testes RED antes de GREEN** — escrever testes que falham antes de qualquer código
4. **Reviewer antes de commit** — código vai para commit apenas após `code-review` sem blockers
5. **Lint e build limpos** — `npm run lint && npm run build` deve passar antes de commit
6. **Escopo restrito** — implementar exatamente o que está na SPEC
7. **`enforce-workflow` antes de commit** — nunca pular o gate final

---

## Definition of Done (DoD)

- [ ] SPEC aprovada com critérios de aceite verificáveis
- [ ] Testes RED escritos antes da implementação (falhando pelo motivo certo)
- [ ] Todos os testes passando (GREEN confirmado)
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
- [ ] Nenhum `console.log` de debug no código
- [ ] Path alias `@/*` em todos os imports
- [ ] `code-review` sem blockers (quando aplicável)
- [ ] `security-review` concluída ou pulada com justificativa (quando aplicável)
- [ ] `REPORT.md` gerado com `READY_FOR_COMMIT`
- [ ] `enforce-workflow` retornou `WORKFLOW_OK`
- [ ] Commit + PR abertos

---

## Convenções de Nomenclatura

- **Branches**: `<tipo>/<descricao-em-kebab-case>`
  - Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`
  - Exemplos: `feat/price-history-chart`, `fix/market-sync-timeout`
- **Commits**: Conventional Commits — `<tipo>(<escopo>): <descrição>`
  - Máximo 72 caracteres na primeira linha
  - Imperativo presente: "add", "fix", "update"
  - Exemplo: `feat(price-history): integrar endpoint de histórico com cache`
- **Features**: `features/<nome-em-kebab-case>/SPEC.md`
- **ADRs**: `docs/adr/ADR-NNN-titulo-em-kebab-case.md`

---

## Restrições de Operação

- Nunca usar `git push --force` sem confirmação explícita
- Nunca usar `git reset --hard` sem autorização explícita
- Não editar `src/components/ui/` diretamente (quebra atualizações do shadcn/ui)
- Não fazer polling agressivo à API (rate limits não documentados)
- Não misturar mudanças funcionais com refatoração no mesmo commit
