# SPEC — TypeScript Strict Mode Iteração 2 (Hooks)

**Status:** Aprovada
**Data:** 2026-03-17
**Autor:** Claude Code

---

## Contexto e Motivação

A iteração 1 da migração TypeScript strict mode foi concluída com sucesso, ativando `noImplicitAny: true` e `strictNullChecks: true` globalmente na codebase. O ADR-006 estabelece uma migração gradual por camadas. Esta feature representa a iteração 2, focada na camada `src/hooks/`.

A camada de hooks é crítica pois conecta a UI (React) com os serviços de dados. Garantir type safety estrita aqui previne erros de runtime relacionados a tipos de retorno, parâmetros de funções e manipulação de erros.

## Problema a Resolver

Atualmente, os hooks em `src/hooks/` compilam com `noImplicitAny` e `strictNullChecks`, mas não foram validados contra flags adicionais do strict mode:
- `strictFunctionTypes`: verifica contravariância em parâmetros de função
- `strictBindCallApply`: tipagem estrita para métodos bind/call/apply
- `strictPropertyInitialization`: propriedades de classe devem ser inicializadas
- `useUnknownInCatchVariables`: variáveis em catch são `unknown` em vez de `any`

Esta feature ativa essas flags adicionais para a camada de hooks, garantindo type safety completa.

## Fora do Escopo

- Alterar hooks em `src/components/ui/` (shadcn/ui — não devem ser editados)
- Migração de `src/pages/` ou `src/components/` (próximas iterações)
- Ativação completa de `strict: true` (requer todas as camadas)
- Refatoração funcional dos hooks (apenas ajustes de tipo)

## Critérios de Aceitação

### Cenário 1: Compilação com strictFunctionTypes
**Given** que o projeto tem hooks em `src/hooks/`
**When** ativamos `strictFunctionTypes: true` no `tsconfig.app.json`
**Then** todos os hooks compilam sem erros de tipo

### Cenário 2: Compilação com strictBindCallApply
**Given** que o projeto tem hooks em `src/hooks/`
**When** ativamos `strictBindCallApply: true` no `tsconfig.app.json`
**Then** todos os hooks compilam sem erros de tipo

### Cenário 3: Compilação com strictPropertyInitialization
**Given** que o projeto tem hooks em `src/hooks/`
**When** ativamos `strictPropertyInitialization: true` no `tsconfig.app.json`
**Then** todos os hooks compilam sem erros de tipo

### Cenário 4: Compilação com useUnknownInCatchVariables
**Given** que o projeto tem hooks em `src/hooks/`
**When** ativamos `useUnknownInCatchVariables: true` no `tsconfig.app.json`
**Then** todos os hooks compilam sem erros de tipo

### Cenário 5: Testes passam após migração
**Given** que os hooks foram ajustados para strict mode
**When** executamos `npm run test`
**Then** todos os testes existentes passam

### Cenário 6: Lint e build limpos
**Given** que os hooks foram ajustados para strict mode
**When** executamos `npm run lint && npm run build`
**Then** não há erros de lint ou build

## Dependências

- ADR-006 (TypeScript strict mode gradual migration) — já implementado
- Iteração 1 concluída (`noImplicitAny` + `strictNullChecks` ativos)

## Riscos e Incertezas

- Hooks que usam refs ou callbacks podem necessitar ajustes de tipagem
- Testes que mockam funções podem precisar atualização de tipos
- Se surgirem muitos erros, pode ser necessário ajustar estratégia (adiar algumas flags)

## Referências

- ADR-006: `docs/adr/ADR-006-typescript-strict-mode-gradual-migration.md`
- TypeScript Strict Mode: https://www.typescriptlang.org/tsconfig/#strict
