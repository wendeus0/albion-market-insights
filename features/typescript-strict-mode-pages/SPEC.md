# SPEC — TypeScript Strict Mode Iteração 3 (Pages)

**Status:** Draft
**Data:** 2026-03-17
**Autor:** antigravity

---

## Contexto e Motivação

O ADR-006 define uma migração gradual para TypeScript strict mode por camada:
iteração 1 ativou `noImplicitAny` e `strictNullChecks`; iteração 2 ativou
`strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization` e
`useUnknownInCatchVariables` nos hooks. Esta iteração audita `src/pages/` —
camada seguinte na hierarquia — confirmando que os 5 arquivos de página
compilam sem erros e sem supressões com todas as flags já ativas.

## Problema a Resolver

Não há garantia formal (via teste automatizado) de que `src/pages/` é
type-safe com as flags de strict mode vigentes. A ausência de testes fixando
esse estado permite que futuros PRs introduzam regressões silenciosas de
tipo na camada de páginas.

## Fora do Escopo

- Ativação de novas flags TypeScript (todas as flags previstas no ADR-006 já
  estão ativas).
- Refatoração de lógica de negócio nas páginas.
- Mudanças em `src/components/` (reservado para iteração 4).
- Adição de supressões `@ts-ignore` ou `@ts-expect-error`.
- Modificação de `src/components/ui/` (regra crítica do projeto).

## Critérios de Aceitação

### AC-1: Compilação limpa de src/pages/

**Given** que `tsconfig.app.json` contém as flags `noImplicitAny`,
`strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`,
`strictPropertyInitialization` e `useUnknownInCatchVariables` todas ativadas
**When** o TypeScript compiler executa `tsc --noEmit` sobre `src/`
**Then** nenhum erro de compilação é reportado em nenhum arquivo de
`src/pages/` (About.tsx, Alerts.tsx, Dashboard.tsx, Index.tsx, NotFound.tsx)

### AC-2: Ausência de supressões de tipo em src/pages/

**Given** que os arquivos de `src/pages/` foram auditados
**When** se verifica a presença de `@ts-ignore` ou `@ts-expect-error` em
qualquer arquivo da camada
**Then** nenhuma supressão é encontrada — a conformidade é nativa, sem
contornos

## Dependências

- `feat/typescript-strict-mode-hooks` mergeada (PR #18) — já concluída.
- `tsconfig.app.json` com todas as flags de strict mode ativas — já presente.

## Riscos e Incertezas

- Baixo risco: inspeção manual e `tsc --noEmit` já confirmam compilação limpa
  nas páginas antes desta SPEC ser escrita.
- As páginas não instanciam classes nem usam `bind`/`call`/`apply`, então
  as flags adicionadas na iteração 2 têm impacto neutro aqui.

## Referências

- ADR-006: `docs/adr/ADR-006-typescript-strict-mode-gradual-migration.md`
- Iteração 1: `features/typescript-strict-mode/SPEC.md`
- Iteração 2: `features/typescript-strict-mode-hooks/SPEC.md`
