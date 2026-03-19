# SPEC — Lote 2: Refatoração Estrutural e UX

**Status:** Draft  
**Data:** 2026-03-19  
**Branch:** `feat/lote-2-refatoracao-estrutural`  
**Autor:** Claude Code

---

## Contexto e Motivação

Após a conclusão do Lote 1B (consistência de dados), o Lote 2 foca em melhorias de arquitetura de código, separação de responsabilidades e Developer Experience (DX). Este lote não adiciona funcionalidades novas, mas melhora a qualidade interna do código.

## Problemas a Resolver

1. **PriceTable acoplada**: Lógica de filtros, sort, persistência e paginação misturada no componente
2. **Repetição de Layout**: Cada página repete o componente `Layout` manualmente
3. **Cobertura de testes**: Gaps em `PriceTable` (76.61%) e `AlertsManager` (63.46%)

## Fora do Escopo

- Não adicionar funcionalidades novas ao usuário final
- Não modificar comportamento de negócio
- Não alterar API ou contratos de dados

## Critérios de Aceitação

### Item 1: Extrair regras da PriceTable

**Cenário 1.1: Hook usePriceTableFilters**
**Given** o componente `PriceTable`  
**When** extrair lógica de filtros para hook dedicado  
**Then** o hook `usePriceTableFilters` gerencia estado e persistência dos filtros

**Cenário 1.2: Hook usePriceTableSort**
**Given** o componente `PriceTable`  
**When** extrair lógica de ordenação para hook dedicado  
**Then** o hook `usePriceTableSort` gerencia estado da ordenação

**Cenário 1.3: Hook usePriceTablePagination**
**Given** o componente `PriceTable`  
**When** extrair lógica de paginação para hook dedicado  
**Then** o hook `usePriceTablePagination` gerencia estado da paginação

### Item 2: Rota com layout compartilhado

**Cenário 2.1: Layout compartilhado via rota**
**Given** as páginas `Index`, `Dashboard`, `About`  
**When** navegar entre elas  
**Then** o `Layout` é compartilhado via configuração de rota, não repetido em cada página

### Item 3: Cobertura de testes

**Cenário 3.1: PriceTable > 80% cobertura**
**Given** a suite de testes  
**When** executar cobertura  
**Then** `PriceTable.tsx` tem > 80% statements coverage

## Dependências

- Lote 1B 100% concluído e mergeado na `main`
- PRs #47, #48, #49 mergeados

## Riscos e Incertezas

- Refatoração pode introduzir regressões se não houver testes adequados
- Mudança de estrutura de rotas pode afetar navegação

## Referências

- `PENDING_LOG.md` — seção Lote 2
- `src/components/dashboard/PriceTable.tsx` — componente alvo
- `src/App.tsx` — configuração de rotas
