# memory.md — Memória Persistente de Sessão

## Estado do Projeto (2026-03-14)

**Plataforma**: Dashboard web React + TypeScript para análise de mercado do Albion Online
**Status**: Fase de refatoração iniciada — reescrita com arquitetura mais sólida
**Branch de trabalho**: `claude/copy-config-between-repos-NZJ9E`

---

## Decisões Arquiteturais Registradas

| Decisão | Status | Detalhes |
|---------|--------|---------|
| Copiar estrutura organizacional do AIgnt-OS | ✅ Concluído | CLAUDE.md, CONTEXT.md, AGENTS.md, agents/, settings.json criados |
| Dados em modo mock | 🔄 Temporário | `src/data/mockData.ts` — substituir pela API Albion Online |
| shadcn/ui como biblioteca de componentes | ✅ Fixo | 59 componentes disponíveis em `src/components/ui/` |
| TypeScript sem strict mode | 🔄 Revisitar | Legado do Lovable — migrar gradualmente |

---

## Estrutura de Governança Importada do AIgnt-OS

Workflow: `SPEC → COMPONENT_DESIGN → IMPLEMENT → REVIEW → QA → COMMIT`

Agentes disponíveis:
- `explorer` — mapeamento read-only antes de implementar
- `worker` — implementação focada dentro do escopo
- `reviewer` — code review read-only antes do commit
- `monitor` — coleta de evidências em falhas

---

## Próximos Passos

1. Refinar CONTEXT.md, AGENTS.md e CLAUDE.md conforme o projeto evolui
2. Criar primeira SPEC de feature para a refatoração
3. Integrar API real do Albion Online (substituir mockData.ts)
4. Avaliar necessidade de state management global (TanStack Query cobre a maioria)
5. Adicionar testes (Vitest + Testing Library)

---

## Riscos Conhecidos

- Dados em mock não refletem comportamento real da API do Albion Online
- TypeScript sem strict mode pode mascarar erros de tipo
- Componentes shadcn/ui não devem ser editados diretamente (quebra atualizações)
- Nenhuma cobertura de testes no projeto original Lovable

---

## Contexto de Sessões Anteriores

- `2026-03-14`: Estrutura de governança Claude copiada do AIgnt-OS e adaptada para o projeto web
