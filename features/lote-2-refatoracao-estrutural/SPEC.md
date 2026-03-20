# SPEC — Lote 2: Refatoração Estrutural e UX

**Status:** Implementada  
**Data:** 2026-03-19  
**Branch:** `feat/lote-2-refatoracao-estrutural`  
**Autor:** Claude Code

---

## Contexto e Motivação

Após a conclusão do Lote 1B (consistência de dados), o Lote 2 foca em melhorias de arquitetura de código, separação de responsabilidades e Developer Experience (DX). Este lote não adiciona funcionalidades novas, mas melhora a qualidade interna do código.

## Problema a Resolver

1. **PriceTable acoplada**: lógica de filtros, ordenação e paginação ainda vive no componente, o que dificulta testes isolados e aumenta custo de manutenção.
2. **Layout repetido nas páginas**: `Index`, `Dashboard`, `Alerts` e `About` instanciam `Layout` manualmente, espalhando uma responsabilidade estrutural pela camada de páginas.
3. **Cobertura concentrada no componente**: a lógica extraída precisa continuar verificável por testes, preservando a cobertura do fluxo principal de `PriceTable` acima do limiar esperado.

## Fora do Escopo

- Não adicionar funcionalidades novas ao usuário final
- Não modificar comportamento de negócio
- Não alterar API ou contratos de dados

## Critérios de Aceitação

### Cenário 1: Extrair filtros e persistência da `PriceTable`

**Given** a tabela de preços com filtros de busca, categoria, cidade, tier, qualidade, encantamento e faixas numéricas  
**When** a lógica for extraída para um hook ou módulo dedicado  
**Then** o componente `PriceTable` delega leitura, atualização, limpeza e persistência desses filtros sem alterar o comportamento atual da UI

### Cenário 2: Extrair ordenação da `PriceTable`

**Given** a tabela de preços com ordenação por colunas  
**When** a lógica de `sortField`, `sortDirection` e alternância de cabeçalho for isolada  
**Then** a ordenação continua funcionando com o mesmo contrato visual e o componente deixa de concentrar essa regra internamente

### Cenário 3: Extrair paginação da `PriceTable`

**Given** a tabela de preços com paginação local  
**When** a regra de páginas visíveis, navegação e slice dos itens for isolada  
**Then** a paginação mantém o comportamento atual e o reset para página 1 continua acontecendo quando filtros relevantes forem alterados

### Cenário 4: Compartilhar `Layout` via rotas

**Given** as páginas `Index`, `Dashboard`, `Alerts` e `About`  
**When** a aplicação for reestruturada para usar uma rota-pai com `Layout` compartilhado  
**Then** essas páginas deixam de instanciar `Layout` manualmente e a navegação existente continua funcionando nas mesmas URLs

### Cenário 5: Cobertura mínima preservada para `PriceTable`

**Given** a refatoração estrutural da `PriceTable`  
**When** a suíte relevante for executada com cobertura  
**Then** `src/components/dashboard/PriceTable.tsx` permanece com pelo menos 80% de statements coverage

## Dependências

- Lote 1B 100% concluído e mergeado na `main`
- Branch de trabalho criada a partir de `origin/main`

## Riscos e Incertezas

- Refatoração pode introduzir regressões silenciosas se os testes cobrirem apenas a UI final e não os hooks extraídos
- Mudança de estrutura de rotas pode afetar renderização de páginas lazy-loaded e do `NotFound`
- O worktree local contém artefatos em `coverage/` fora do escopo da feature e eles não devem contaminar o diff

## Referências

- `PENDING_LOG.md` — seção Lote 2
- `src/components/dashboard/PriceTable.tsx` — componente alvo
- `src/test/PriceTable.test.tsx` — testes existentes da tabela
- `src/test/PriceTable.persistence.test.tsx` — testes existentes de persistência
- `src/App.tsx` — configuração atual de rotas
