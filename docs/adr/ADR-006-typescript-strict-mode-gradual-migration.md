# ADR-006 — Migração gradual para TypeScript strict mode

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

O projeto foi iniciado com `noImplicitAny: false` e `strictNullChecks: false`, permitindo que erros de tipo silenciosos proliferassem na codebase. A análise de março/2026 identificou isso como único DEBT-P0 do projeto. Habilitar strict mode de forma abrupta em toda a codebase seria arriscado devido ao volume de arquivos e à ausência de mapeamento prévio de erros.

## Decisão

Migração gradual em iterações por camada:

1. **Iteração 1 (concluída):** Ativar `noImplicitAny: true` e `strictNullChecks: true` globalmente. Validar que toda a codebase compila sem erros — se limpa, sem supressões. Se necessário, suprimir com `// @ts-ignore // TODO: strict-mode-iteration-N` fora da camada alvo.
2. **Iterações futuras:** `src/hooks/` → `src/pages/` → `src/components/` → habilitar `strict: true` completo.

Flags **não** ativados nesta iteração (cobertos por `strict: true` completo, adiados): `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`.

## Consequências

- Erros de tipo implícito (`any`) e de nullabilidade passam a ser detectados em tempo de compilação em toda a codebase.
- A codebase atual (`src/services/` e demais) já era type-safe — nenhuma supressão foi necessária na iteração 1.
- PRs futuros que introduzirem `any` implícito ou null unsafe serão bloqueados pelo compilador.
- `strict: true` completo exigirá uma iteração dedicada quando hooks e páginas forem auditados.

## Alternativas consideradas

- **`strict: true` imediato:** rejeitado — risco de mascarar erros com supressões em massa sem revisão adequada.
- **tsconfig por camada (project references):** rejeitado — aumenta complexidade de build sem ganho proporcional; migração global mais simples se a codebase já for compatível.
- **Manter flags desativados:** rejeitado — débito P0; erros de tipo em `src/services/` têm impacto direto em runtime.
