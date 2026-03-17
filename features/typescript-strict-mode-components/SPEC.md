# SPEC — TypeScript Strict Mode Iteração 4 (Components)

**Status:** Draft
**Data:** 2026-03-17
**Autor:** antigravity

---

## Contexto e Motivação

O ADR-006 define uma migração gradual para TypeScript strict mode por camada.
Iterações 1-3 concluídas: iteração 1 ativou `noImplicitAny` e `strictNullChecks`;
iteração 2 ativou 4 flags adicionais nos hooks; iteração 3 auditou `src/pages/`.
Esta iteração audita `src/components/` (exceto `src/components/ui/` que é gerenciada
pelo shadcn/ui) — última camada de componentes antes de considerar a migração
completa.

## Problema a Resolver

Não há garantia formal (via teste automatizado) de que `src/components/` é
type-safe com as flags de strict mode vigentes. A ausência de testes fixando
esse estado permite que futuros PRs introduzam regressões silenciosas na camada
de componentes.

## Fora do Escopo

- Ativação de novas flags TypeScript (todas as flags previstas no ADR-006 já
  estão ativas).
- Refatoração de lógica de negócio nos componentes.
- Modificação de `src/components/ui/` (regra crítica do projeto — shadcn/ui).
- Adição de supressões `@ts-ignore` ou `@ts-expect-error`.

## Critérios de Aceitação

### AC-1: Compilação limpa de src/components/ (exceto ui/)

**Given** que `tsconfig.app.json` contém as flags `noImplicitAny`,
`strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`,
`strictPropertyInitialization` e `useUnknownInCatchVariables` todas ativadas
**When** o TypeScript compiler executa `tsc --noEmit` sobre `src/`
**Then** nenhum erro de compilação é reportado em nenhum arquivo de
`src/components/` exceto `src/components/ui/`

### AC-2: Ausência de supressões de tipo em src/components/ (exceto ui/)

**Given** que os arquivos de `src/components/` (exceto `ui/`) foram auditados
**When** se verifica a presença de `@ts-ignore` ou `@ts-expect-error` em
qualquer arquivo da camada
**Then** nenhuma supressão é encontrada — a conformidade é nativa, sem
contornos

## Dependências

- `feat/typescript-strict-mode-pages` mergeada (PR #20) — já concluída.
- `tsconfig.app.json` com todas as flags de strict mode ativas — já presente.

## Riscos e Incertezas

- Baixo risco: `tsc --noEmit` já confirma compilação limpa nos componentes
  antes desta SPEC ser escrita.
- Os componentes não instanciam classes nem usam `bind`/`call`/`apply` extensivamente,
  então as flags adicionadas na iteração 2 têm impacto neutro aqui.

## Referências

- ADR-006: `docs/adr/ADR-006-typescript-strict-mode-gradual-migration.md`
- Iteração 1: `features/typescript-strict-mode/SPEC.md`
- Iteração 2: `features/typescript-strict-mode-hooks/SPEC.md`
- Iteração 3: `features/typescript-strict-mode-pages/SPEC.md`
