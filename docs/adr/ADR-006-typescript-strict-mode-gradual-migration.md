# ADR-006 — Migração gradual para TypeScript strict mode

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

O projeto foi iniciado com `noImplicitAny: false` e `strictNullChecks: false`, permitindo que erros de tipo silenciosos proliferassem na codebase. A análise de março/2026 identificou isso como único DEBT-P0 do projeto. Habilitar strict mode de forma abrupta em toda a codebase seria arriscado devido ao volume de arquivos e à ausência de mapeamento prévio de erros.

## Decisão

Migração gradual em iterações por camada, culminando na ativação de `strict: true`:

1. **Iteração 1 (concluída):** Ativar `noImplicitAny: true` e `strictNullChecks: true` globalmente. Validar que toda a codebase compila sem erros — se limpa, sem supressões.
2. **Iteração 2-4 (concluídas):** Ativar incrementalmente `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `useUnknownInCatchVariables`.
3. **Iteração 5 (decisão):** Substituir as 6 flags individuais por `strict: true` master flag.

**Mitigações para perda de controle individual:**

- Exceções devem usar `@ts-expect-error` com justificativa obrigatória
- Acúmulo de >5 supressões por arquivo dispara revisão de código
- ESLint continua permitindo desativação granular por regra (`eslint-disable`)
- Sub-diretórios podem ter `tsconfig.json` específico se justificado (ex: scripts de build)
- Validação de runtime via Zod para fronteiras de dados externos

## Consequências

- Erros de tipo implícito (`any`) e de nullabilidade passam a ser detectados em tempo de compilação em toda a codebase.
- A codebase atual (`src/services/` e demais) já era type-safe — nenhuma supressão foi necessária na iteração 1.
- PRs futuros que introduzirem `any` implícito ou null unsafe serão bloqueados pelo compilador.
- `strict: true` ativado elimina divergência entre `tsconfig.json` e `tsconfig.app.json`.
- Nova flag strict do TypeScript será ativada automaticamente — trade-off aceito dado o compromisso com type safety rigorosa.
- Supressões são permitidas via `@ts-expect-error` com limite de 5 por arquivo.

## Alternativas consideradas

- **`strict: true` imediato:** rejeitado — risco de mascarar erros com supressões em massa sem revisão adequada.
- **tsconfig por camada (project references):** rejeitado — aumenta complexidade de build sem ganho proporcional; migração global mais simples se a codebase já for compatível.
- **Manter flags desativados:** rejeitado — débito P0; erros de tipo em `src/services/` têm impacto direto em runtime.
- **Manter flags individuais permanentemente:** rejeitado em 2026-03-19 — divergência entre tsconfig.json e tsconfig.app.json cria inconsistência; benefício de granularidade não compensa risco de manutenção.

## Histórico de decisões

| Data       | Alteração                     | Motivo                                                                                                           |
| ---------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 2026-03-16 | ADR criado                    | Início migração gradual com 2 flags                                                                              |
| 2026-03-17 | Adicionadas 4 flags           | Hooks, pages, components auditados com sucesso                                                                   |
| 2026-03-19 | Consolidado em `strict: true` | Migração completa; codebase 100% compatível (211 testes, 0 supressões); elimina divergência entre tsconfig files |
