# SPEC — TypeScript Strict Mode (primeira iteração: src/services/)

**Status:** Draft
**Data:** 2026-03-16
**Autor:** Claude

---

## Contexto e Motivação

O projeto tem `noImplicitAny: false` e `strictNullChecks: false` nos dois tsconfigs (`tsconfig.json` e `tsconfig.app.json`), o que permite erros de tipo silenciosos em toda a codebase. Isso é o único DEBT-P0 identificado na análise de março/2026. A migração começa por `src/services/` — a camada mais crítica do projeto — onde erros de tipo têm maior impacto em runtime.

## Problema a Resolver

Erros de tipo em `src/services/` passam silenciosamente pelo compilador, especialmente:
- parâmetros sem tipo explícito (implícito `any`)
- valores possivelmente `null`/`undefined` acessados sem guard

## Fora do Escopo

- Ativar `strict: true` completo (que inclui `strictFunctionTypes`, `strictBindCallApply`, etc.)
- Corrigir erros de tipo em `src/components/`, `src/hooks/`, `src/pages/`, `src/lib/`, `src/data/`
- Adicionar cobertura de testes além do que já existe
- Migrar para `noUnusedLocals` ou `noUnusedParameters`

## Critérios de Aceitação

### Cenário 1: Flags ativados no tsconfig
**Given** os arquivos `tsconfig.json` e `tsconfig.app.json` com `noImplicitAny: false` e `strictNullChecks: false`
**When** a feature for implementada
**Then** ambos os arquivos passam a ter `noImplicitAny: true` e `strictNullChecks: true`

### Cenário 2: src/services/ compila sem erros de tipo
**Given** os flags `noImplicitAny: true` e `strictNullChecks: true` ativados
**When** o TypeScript compila os 7 arquivos de `src/services/`
**Then** nenhum erro de tipo é reportado nos arquivos da camada de serviços

### Cenário 3: Build de produção passa sem erros
**Given** os flags ativados e os erros de serviços corrigidos
**When** `npm run build` é executado
**Then** o build completa sem erros — erros em arquivos fora de `src/services/` são suprimidos com `// @ts-ignore` acompanhado de comentário `// TODO: strict-mode-iteration-N`

### Cenário 4: Testes existentes continuam passando
**Given** o código de serviços corrigido para strict mode
**When** `npm run test` é executado
**Then** todos os 81 testes passam sem regressão

## Dependências

- `tsconfig.json` e `tsconfig.app.json` na raiz do projeto
- 7 arquivos em `src/services/`: `market.service.ts`, `market.api.ts`, `market.api.types.ts`, `market.mock.ts`, `alert.engine.ts`, `alert.storage.ts`, `index.ts`

## Riscos e Incertezas

- Quantidade exata de erros fora de `src/services/` ainda não mapeada — pode ser maior que o esperado, aumentando o esforço de supressão
- Supressões com `@ts-ignore` em arquivos externos podem mascarar erros reais — mitigado pelo comentário `TODO` e iterações futuras

## Referências

- `ANALYSIS_REPORT.md` — DEBT-P0 identificado em 2026-03-16
- `memory/MEMORY.md` — "TypeScript strict mode: desativado — único P0 restante; migração gradual pendente iniciando por `src/services/`"
