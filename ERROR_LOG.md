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
