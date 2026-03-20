# SPEC — Cobertura de Testes: Hooks e Componentes Pós-Refatoração

**Status:** Aprovada  
**Data:** 2026-03-20  
**Autor:** Wendel Duarte

---

## Contexto e Motivação

Após a conclusão do Lote 2 (refatoração estrutural da `PriceTable`), a cobertura de testes ficou concentrada em alguns gaps específicos. O `quality:gate` passou com sucesso (280/280 testes, 89.22% statements), mas módulos críticos introduzidos ou impactados pela refatoração ainda estão abaixo do limiar mínimo de 80%:

- `usePriceTablePagination.ts` — 55.55% (novo hook do Lote 2)
- `Navbar.tsx` — 58.33% (componente de navegação compartilhado)
- `Dashboard.tsx` — 68.18% (página principal com lógica de refresh/toasts)
- `ArbitrageTable.tsx` — 69.64% (componente de negócio central)

Esta feature fecha esses gaps de forma incremental, priorizando os módulos mais baratos de testar primeiro.

## Problema a Resolver

1. **Hook de paginação sub-testado**: `usePriceTablePagination.ts` tem cobertura baixa (55.55%) apesar de ser parte do novo código do Lote 2
2. **Navbar com navegação mobile não testada**: toggles de menu mobile, tratamento de `window.matchMedia`
3. **Dashboard com fluxos de refresh não cobertos**: cooldown de 5 min, exibição de toasts, estado do countdown
4. **ArbitrageTable com filtros e sorting não totalmente cobertos**: ordenação, cálculo de spread, células de dados

## Fora do Escopo

- Refatoração de código existente (somente adicionar testes)
- Alteração de comportamento ou API pública dos componentes
- Testes E2E (Playwright) — foco em testes unitários de componentes e hooks
- Cobertura de arquivos vendor em `src/components/ui/*` (trade-off consciente)
- Testes de performance ou profiling

## Critérios de Aceitação

### Cenário 1: Hook usePriceTablePagination coberto

**Given** o hook `usePriceTablePagination` recebe uma lista de itens e `itemsPerPage`  
**When** testes unitários validam cálculo de páginas, navegação e reset  
**Then** a cobertura do hook atinge pelo menos 80% statements  
**And** casos de borda são testados: lista vazia, página única, navegação nos limites

### Cenário 2: Navbar com interações mobile testadas

**Given** o componente `Navbar` renderizado em diferentes viewports  
**When** o usuário alterna o menu mobile e interage com links  
**Then** estados de aberto/fechado são corretamente gerenciados  
**And** navegação entre rotas é validada

### Cenário 3: Dashboard com refresh e cooldown cobertos

**Given** a página `Dashboard` com cooldown de refresh ativo  
**When** o usuário tenta refresh dentro e fora do período de cooldown  
**Then** botão é corretamente desabilitado/habilitado  
**And** countdown é exibido corretamente  
**And** toasts são acionados nos cenários apropriados

### Cenário 4: ArbitrageTable com ordenação e filtros testados

**Given** a tabela `ArbitrageTable` com dados de arbitragem  
**When** o usuário ordena por diferentes colunas e aplica filtros  
**Then** ordenação respeita o campo e direção  
**And** cálculos de spread são precisos  
**And** células especiais (status, ícones) renderizam corretamente

## Dependências

- Lote 2 100% concluído e mergeado na `main` ✅
- Branch `main` sincronizada com `origin/main` ✅
- `coverage/` já não versionado (PR #53 mergeado) ✅

## Riscos e Incertezas

- **Testes de `window.matchMedia`**: requer mock específico para `Navbar`; pode ser complexo
- **Testes de toasts no Dashboard**: elementos duplicados no DOM (visual + aria-live) dificultam assertions
- **Tempo estimado pode variar**: se um módulo revelar lógica escondida complexa, pode escopar para feature separada

## Referências

- `PENDING_LOG.md:271` — gaps de cobertura identificados
- `memory/MEMORY.md:63` — decisão aberta sobre cobertura de hooks extraídos
- ADR-010 — convenção de extração estrutural aplicada no Lote 2
- Arquivos alvo:
  - `src/hooks/usePriceTablePagination.ts`
  - `src/components/layout/Navbar.tsx`
  - `src/pages/Dashboard.tsx`
  - `src/components/dashboard/ArbitrageTable.tsx`

---

## Validação INVEST

| Critério        | Status | Justificativa                                                 |
| --------------- | ------ | ------------------------------------------------------------- |
| **I**ndependent | ✅     | Não depende de features não concluídas                        |
| **N**egotiable  | ✅     | Escopo pode ser ajustado (priorizar os 2-3 primeiros módulos) |
| **V**aluable    | ✅     | Reduz débito técnico, melhora confiança na baseline           |
| **E**stimable   | ✅     | 1-2 dias de trabalho focado                                   |
| **S**mall       | ✅     | 4 módulos específicos, sem subdivisão necessária              |
| **T**estable    | ✅     | Cada critério tem verificação objetiva de cobertura           |

---

## Critério de Conclusão

- [x] `usePriceTablePagination.ts` ≥ 80% statements coverage (100% ✅)
- [x] `Navbar.tsx` ≥ 80% statements coverage (100% ✅)
- [x] `Dashboard.tsx` ≥ 80% statements coverage (86.36% ✅)
- [x] `ArbitrageTable.tsx` ≥ 80% statements coverage (87.5% ✅)
- [x] `npm run quality:gate` passa com todos os testes novos
- [ ] Nenhum código de produção modificado (apenas testes)
