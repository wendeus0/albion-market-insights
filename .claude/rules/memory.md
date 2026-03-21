# Memory — Convenção de Memória Distribuída

Este projeto segue o padrão global de memória distribuída em arquivos temáticos dentro de `memory/`.

## Estrutura

`memory/MEMORY.md` é um **índice lean** (6-10 linhas) que aponta para:

| Arquivo | Conteúdo |
|---|---|
| `project_state.md` | Estado atual, sprint, branch, marcos |
| `stable_decisions.md` | Decisões arquiteturais fixas (tabela) |
| `active_fronts.md` | Frentes ativas + decisões abertas |
| `pitfalls.md` | Armadilhas técnicas recorrentes |
| `next_steps.md` | Próximos passos recomendados |
| `handoff.md` | Último handoff de sessão |

## Regras para memory-curator

1. Nunca reescrever `memory/MEMORY.md` como documento monolítico de 7 seções.
2. Ao atualizar memória: identificar qual(is) arquivo(s) temático(s) afetados e editar apenas eles.
3. `handoff.md` é sobrescrito na íntegra ao encerrar sessão.
4. `stable_decisions.md` é append-only — nunca remover decisões sem confirmação explícita.
5. `next_steps.md` é sobrescrito a cada sessão — reflete apenas o estado atual.
6. `pitfalls.md` é append-only durante sessão; revisão de pitfalls obsoletos requer confirmação.
7. O campo `Read before acting` do handoff deve apontar para `memory/MEMORY.md` como ponto de entrada — não listar cada arquivo individualmente.
