# REPORT — Code-splitting por rota com React.lazy()

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-16
**Branch:** feat/code-splitting
**Debt ref:** DEBT-P1-004

---

## O que mudou

- `src/App.tsx`: imports de `Index`, `Dashboard`, `Alerts` e `About` convertidos para `React.lazy()` + `Suspense`
- `NotFound` mantida com import estático (rota `path="*"`)
- `src/test/App.test.tsx`: testes de AC-2 (Suspense fallback) e AC-3 (NotFound estático) adicionados

## Por que mudou

Bundle principal estava em 523 kB (acima do limite de 500 kB do Vite). O build gerava um único chunk sem separação por rota. Code-splitting por `React.lazy()` resolve o DEBT-P1-004 registrado no backlog.

## Como foi validado

| Critério | Status |
|----------|--------|
| AC-1: rotas lazy carregadas sob demanda | ✅ Build gera chunks separados por rota |
| AC-2: Suspense fallback durante carregamento | ✅ Teste `App.test.tsx` passando (GREEN) |
| AC-3: NotFound mantida estática | ✅ Teste `App.test.tsx` passando (GREEN) |
| AC-4: build sem aviso de chunk size | ✅ Build concluído sem aviso de limite |

### Métricas de bundle

| Chunk | Tamanho | Gzip |
|-------|---------|------|
| index (principal) | 393.73 kB | 121.69 kB |
| Alerts | 52.16 kB | 17.83 kB |
| About | 8.71 kB | 2.65 kB |
| Index | 6.72 kB | 2.10 kB |
| Dashboard | 2.67 kB | 1.30 kB |

Chunk principal **reduzido de 523 kB para 393 kB (~25%)**.

### Gates

- `npm run lint`: 0 erros (7 warnings pré-existentes em `src/components/ui/`)
- `npm run build`: sucesso
- `npm run test`: 81/81 passando
- `security-review`: pulada — mudança restrita a `src/App.tsx`, sem toque em auth/CI/APIs/infra

## Riscos residuais

- Nenhum. Mudança limitada a um arquivo de roteamento.

## Próximos passos

- `branch-sync-guard` → `feature-scope-guard` → `enforce-workflow` → `git-flow-manager`
