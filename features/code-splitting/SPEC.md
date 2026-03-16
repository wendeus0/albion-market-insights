# SPEC — Code-splitting por rota com React.lazy()

**Status:** Draft
**Data:** 2026-03-16
**Debt ref:** DEBT-P1-004

---

## Contexto e Motivação

O bundle de produção atual tem 523KB minificado (160KB gzip), acima do limite de 500KB recomendado pelo Vite. Todo o código das 5 rotas é carregado no primeiro acesso, mesmo que o usuário acesse apenas `/dashboard`. Code-splitting por rota reduz o chunk inicial e melhora o tempo de carregamento percebido.

## Problema a Resolver

`src/App.tsx` importa todas as páginas de forma estática. O build gera um único chunk sem separação por rota, causando aviso de tamanho no Vite e carregamento desnecessário de código não utilizado na visita inicial.

## Fora do Escopo

- Code-splitting de componentes internos (ex: `PriceTable`, `AlertsManager`)
- Prefetching de rotas via hover ou IntersectionObserver
- Skeleton screens ou animações de transição de rota
- Alteração em testes E2E existentes
- Mudança no roteamento (paths, React Router config)

## Critérios de Aceitação

### Cenário 1: Carregamento lazy das rotas
**Given** que o usuário acessa a aplicação pela primeira vez
**When** o browser carrega o bundle inicial
**Then** apenas o código da rota atual é carregado no chunk inicial
  **And** as demais rotas são carregadas sob demanda na primeira navegação

### Cenário 2: Fallback durante carregamento de rota
**Given** que o usuário navega para uma rota ainda não carregada
**When** o chunk da rota está sendo baixado
**Then** um fallback visual é exibido (spinner ou loading state)
  **And** a aplicação não exibe tela em branco nem erro

### Cenário 3: NotFound mantida estática
**Given** que o usuário acessa uma rota inexistente (`/rota-nao-existe`)
**When** o React Router não encontra correspondência
**Then** a página NotFound é exibida normalmente
  **And** o comportamento é idêntico ao atual

### Cenário 4: Build sem erro de tamanho
**Given** que `npm run build` é executado após a mudança
**When** o Vite conclui o build
**Then** o aviso `chunk size limit exceeded` não é emitido para o chunk principal
  **And** o build completa com sucesso

## Dependências

- React 18 (`lazy`, `Suspense`) — já disponível
- React Router 6 (`BrowserRouter`, `Routes`, `Route`) — já em uso
- Vite 5 — já configurado; `build.chunkSizeWarningLimit` pode precisar de ajuste

## Riscos e Incertezas

- `NotFound` (`path="*"`) pode ser mantida estática para evitar flash ao 404 — decisão de implementação
- Testes unitários de páginas (ex: `NotFound.test.tsx`) usam import estático — não são afetados pela mudança em `App.tsx`

## Referências

- `src/App.tsx` — arquivo único a modificar
- DEBT-P1-004 em `ANALYSIS_REPORT.md`
