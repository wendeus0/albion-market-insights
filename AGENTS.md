# AGENTS.md — Governança de Agentes

## Hierarquia de Fontes de Verdade

1. **SPEC da feature** — define o comportamento esperado (tem precedência sobre tudo)
2. **CONTEXT.md** — contexto do projeto, stack e modelo de domínio
3. **CLAUDE.md** — convenções de código e comandos de validação
4. **AGENTS.md** (este arquivo) — governança de processo e workflow

---

## Workflow Oficial

```
SPEC → COMPONENT_DESIGN → IMPLEMENT → REVIEW → QA → COMMIT
```

| Fase | Responsável | Critério de Saída |
|------|-------------|-------------------|
| **SPEC** | Usuário + Claude | SPEC.md clara, testável, com critérios de aceitação |
| **COMPONENT_DESIGN** | explorer | Mapeamento de impacto, componentes afetados, riscos |
| **IMPLEMENT** | worker | Código funcional, lint limpo, build passando |
| **REVIEW** | reviewer | Sem blockers identificados |
| **QA** | monitor | Build e lint passando, comportamento esperado verificado |
| **COMMIT** | Claude | Commit com mensagem descritiva, push na branch correta |

---

## Papéis dos Agentes

### explorer
- **Modo**: read-only
- **Ativa quando**: início de qualquer feature nova ou bugfix
- **Entrega**: mapeamento de arquivos afetados, dependências, riscos

### worker
- **Modo**: leitura e escrita
- **Ativa quando**: SPEC aprovada e design mapeado
- **Entrega**: implementação dentro do escopo, lint e build passando

### reviewer
- **Modo**: read-only
- **Ativa quando**: implementação concluída
- **Entrega**: lista classificada de findings (BLOQUEANTE / RISCO / SUGESTÃO)

### monitor
- **Modo**: execução de comandos (sem escrita)
- **Ativa quando**: falha de build, lint ou comportamento inesperado
- **Entrega**: relatório de evidências com passos de reprodução

---

## Regras Críticas

1. **Uma feature por vez** — não iniciar nova feature sem commitar a anterior
2. **SPEC antes de código** — nenhuma implementação sem critérios de aceitação claros
3. **Explorer antes de worker** — sempre mapear impacto antes de implementar
4. **Reviewer antes de commit** — código vai para commit somente após review sem blockers
5. **Lint e build limpos** — `npm run lint && npm run build` deve passar antes de qualquer commit
6. **Escopo restrito** — worker não expande além do definido na SPEC

---

## Convenções de Nomenclatura

- Agentes: `<domínio>-<papel>` em inglês (ex: `explorer`, `worker`, `reviewer`)
- Branches: `claude/<descricao-da-feature>-<ID>`
- Commits: `<tipo>: <descrição>` (feat, fix, refactor, docs, chore)

---

## Entregáveis por Feature

Para cada feature concluída:

- [ ] SPEC.md com critérios de aceitação
- [ ] Código implementado e revisado
- [ ] `npm run lint` passando
- [ ] `npm run build` passando
- [ ] Commit com mensagem descritiva
- [ ] Push na branch correta

---

## Restrições de Operação

- **Sem force push**: nunca usar `git push --force`
- **Sem reset hard**: nunca usar `git reset --hard` sem autorização explícita
- **Sem expansão de escopo**: worker implementa exatamente o que está na SPEC
- **Sem mock permanente**: dados mock são temporários — documentar quando substituir pela API real
