# ADR-005 — Playwright para testes E2E

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

O dashboard tem fluxos de UI não triviais: navegação entre abas, criação de alertas via
dialog com validação de formulário, polling de dados em background. Testes unitários com
Vitest + Testing Library cobrem lógica de componente isolada, mas não cobrem integração
entre rotas, estado global e interações sequenciais do usuário. Era necessária uma camada
de testes que executasse o browser real.

## Decisão

Usar Playwright como framework de testes E2E. A suíte vive em `e2e/` com 13 testes
cobrindo: carregamento do dashboard, navegação entre abas (Overview, Market, Alerts,
Settings), criação e exclusão de alertas, e comportamento com dados mock. A configuração
em `playwright.config.ts` aponta para `http://localhost:5173` com servidor Vite em
background.

## Consequências

- Testes E2E são executados com `npm run test:e2e` (separado dos unitários).
- Requerem binários de browser instalados via `npx playwright install`.
- Execução mais lenta que unitários (~10-30s vs <1s) — não devem rodar no watch mode.
- Testam comportamento real do bundle Vite, não componentes isolados — detectam
  regressões de integração que testes unitários não pegam.
- CI deve executar `npm run test:e2e` com `VITE_USE_REAL_API` não definido (modo mock)
  para garantir determinismo.

## Alternativas consideradas

- **Cypress:** ecossistema maduro, mas arquitetura diferente (iframes) complica
  debugging em alguns cenários; bundle maior.
- **Testing Library apenas:** cobre componentes isolados mas não fluxos de navegação
  multi-rota com estado persistido entre páginas.
- **Testes manuais:** não escalam; regressões passam despercebidas sem automação.
