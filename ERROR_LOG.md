# ERROR_LOG.md — Albion Market Insights

<!-- Atualizado por: session-logger | Não editar manualmente durante sessão ativa -->

## Formato de entrada

```
### [YYYY-MM-DD HH:MM] <contexto>
- **Erro**: descrição
- **Causa**: causa identificada
- **Ação tomada**: o que foi feito
- **Status**: RESOLVIDO | PENDENTE | ESCALADO
```

---

### [2026-03-16 02:36] fix-feature: test de timeout com mismatch de timer

- **Erro**: Teste `retorna mock data em timeout (>10s)` falhava com timeout de 5000ms (limite do Vitest) em vez de assertion failure
- **Causa**: Teste avançava `vi.advanceTimersByTime(10_001)` mas o serviço usa `setTimeout(..., 15_000)` — o abort nunca disparava e o teste ficava pendurado
- **Ação tomada**: Corrigido para `vi.advanceTimersByTime(15_001)` e título atualizado para "timeout (>15s)" — incluído no commit `ad190a2`
- **Status**: RESOLVIDO

---

### [2026-03-16 03:35] feat/catalog-expansion — erros durante implementação de batch loading

- **Erro 1**: Teste "filtra registros" retornava 4 itens em vez de 2
- **Causa**: `batchResults.flat()` sem deduplicação; 5 batches com mesmo mock retornavam o mesmo item 5×
- **Ação tomada**: Deduplicação por `${item_id}|${city}|${quality}` em `getItems()` antes do `.map()`
- **Status**: RESOLVIDO

- **Erro 2**: Teste "retorna mock data em erro de rede" retornava `[]` em vez de fallback
- **Causa**: `fetchPricesBatch` capturava erros internamente → `allPriceRecords` ficava `[]` sem acionar fallback
- **Ação tomada**: Adicionado `if (allPriceRecords.length === 0) return this.fallback.getItems()`
- **Status**: RESOLVIDO

- **Erro 3**: Teste de timeout ficava pendurado (5000ms limit do Vitest)
- **Causa**: AbortController por batch — timer abortava apenas os primeiros 3; tasks 4-5 iniciavam com controllers novos nunca abortados
- **Ação tomada**: Um único `AbortController` compartilhado + `if (controller.signal.aborted) return []` no início de cada task
- **Status**: RESOLVIDO

---

### [2026-03-16 04:09] feat/backoff-exponencial — erros durante implementação e testes

- **Erro 1**: 4 testes pré-existentes em `market.api.test.ts` começaram a falhar com timeout após introdução do retry
- **Causa**: `fetchWithRetry` adiciona delays reais via `setTimeout`; testes sem fake timers ultrapassavam o limite de 5s do Vitest
- **Ação tomada**: `vi.useFakeTimers()` + padrão `const promise = ...; await vi.runAllTimersAsync(); await promise` em 4 testes; timeout dos testes elevado para 10000ms
- **Status**: RESOLVIDO

- **Erro 2**: 6 `PromiseRejectionHandledWarning` durante `npm run test` no arquivo `market.api.retry.test.ts`
- **Causa**: `await expect(promise).rejects.toThrow()` chamado APÓS `await vi.runAllTimersAsync()` — rejeição disparava sem handler registrado
- **Ação tomada**: Handler anexado ANTES: `const assertion = expect(promise).rejects.toThrow(); await vi.runAllTimersAsync(); await assertion`
- **Status**: RESOLVIDO

- **Erro 3**: 13 erros de ESLint `@typescript-eslint/no-explicit-any` em `market.api.retry.test.ts`
- **Causa**: Imports dinâmicos com `as any` para acessar exports internos do módulo em testes
- **Ação tomada**: `/* eslint-disable @typescript-eslint/no-explicit-any */` no topo do arquivo de testes
- **Status**: RESOLVIDO

- **Erro 4**: Tentativa de commit na branch `feat/catalog-expansion` bloqueada por drift de `origin/main`
- **Causa**: PR #10 (`feat/catalog-expansion`) já havia sido mergeado; branch local divergiu de `origin/main` via merge commit
- **Ação tomada**: Nova branch `feat/backoff-exponencial` criada a partir de `origin/main`; stash → checkout → stash pop → commit → push → PR #11
- **Status**: RESOLVIDO

---

### [2026-03-16 05:00] feat/code-splitting — sem erros

- Ciclo completo sem falhas: test-red → green-refactor → quality-gate → commit → PR #13 mergeado
- Único ajuste necessário: mock de `window.matchMedia` para Sonner em `App.test.tsx` (jsdom não expõe a API)
- **Status**: SEM ERROS

---

### [2026-03-16 07:00] feat/typescript-strict-mode — sem erros

- Ciclo completo sem falhas: spec-editor → spec-validator → test-red → green-refactor → quality-gate → adr-manager → commit → PR mergeado
- Codebase já era type-safe; ativar `noImplicitAny: true` + `strictNullChecks: true` não gerou nenhum erro de compilação
- 85/85 testes passando (81 anteriores + 4 novos de AC-1)
- ADR-006 criado para registrar estratégia de migração gradual
- **Status**: SEM ERROS

---

### [2026-03-16 09:06] feat/cache-ttl-localstorage — erros menores durante implementação

- **Erro 1**: `vi.stubGlobal('fetch', vi.fn())` retorna o objeto global, não o spy — `expect(fetchSpy).not.toHaveBeenCalled()` lançou `TypeError: { …(45) } is not a spy`
- **Causa**: `vi.stubGlobal` retorna o objeto `globalThis`, não a função mock
- **Ação tomada**: Corrigido para `expect(globalThis.fetch as ReturnType<typeof vi.fn>).not.toHaveBeenCalled()` — padrão já usado em `market.api.test.ts`
- **Status**: RESOLVIDO

- **Erro 2**: 3× `vi.mock` dentro de blocos de teste causaram warning de hoisting
- **Causa**: `vi.mock` deve estar no top-level do módulo; quando aninhado, é hoistado silenciosamente mas gera aviso
- **Ação tomada**: Movido para top-level no arquivo de testes antes de prosseguir para GREEN
- **Status**: RESOLVIDO

- **Erro 3 (code-review)**: Import relativo `'./market.cache'` em `market.api.ts` violando convenção `@/*`
- **Causa**: Import escrito como relativo durante implementação GREEN
- **Ação tomada**: Corrigido para `'@/services/market.cache'` antes do commit
- **Status**: RESOLVIDO

- Ciclo completo sem outros bloqueadores: spec → test-red → green-refactor → code-review → quality-gate → ADR-007 → commit → PR #17 mergeado
- 102/102 testes passando (85 anteriores + 17 novos)
- **Status**: SEM ERROS REMANESCENTES

---

### [2026-03-17 01:25] feat/typescript-strict-mode-hooks — sem erros

- Ciclo completo executado: spec-editor → spec-validator → test-red → green-refactor → quality-gate → report-writer → branch-sync-guard → feature-scope-guard → enforce-workflow → git-flow-manager
- PR #18 mergeado em `main`
- 106/106 testes passando (102 anteriores + 4 novos)
- TypeScript compila sem erros com 4 flags adicionais ativadas
- **Status**: SEM ERROS

---

### [2026-03-17] feat/typescript-strict-mode-pages — sem erros

- Ciclo completo executado: spec-editor → spec-validator → test-red → green-refactor → code-review → quality-gate → report-writer → branch-sync-guard → feature-scope-guard → enforce-workflow → git-flow-manager
- PR #20 mergeado em `main`
- 112/112 testes passando (106 anteriores + 6 novos: AC-1 compilação limpa + AC-2 ×5 arquivos)
- `src/pages/` confirmada type-safe sem supressões com todas as flags vigentes
- **Status**: SEM ERROS

---

### [2026-03-17] feat/typescript-strict-mode-components — sem erros

- Ciclo completo executado: spec-editor → spec-validator → test-red → green-refactor → code-review → quality-gate → report-writer → branch-sync-guard → feature-scope-guard → enforce-workflow → git-flow-manager
- PR #22 mergeado em `main`
- 121/121 testes passando (112 anteriores + 9 novos: AC-1 compilação limpa + AC-2 ×8 arquivos)
- `src/components/` (exceto `ui/`) confirmada type-safe sem supressões com todas as flags vigentes
- **Status**: SEM ERROS — migração gradual para TypeScript strict mode COMPLETA
