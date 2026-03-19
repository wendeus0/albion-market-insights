# SPEC — Persist Price Filters

**Status:** Draft
**Data:** 2026-03-19
**Autor:** AI Assistant
**Branch sugerida:** `feat/persist-price-filters`

---

## Contexto e Motivação

O PriceTable já possui filtros avançados implementados no PR #25 (enhanced-ui-filters), incluindo filtros por faixa de preço, spread, categoria, cidade, tier, qualidade e encantamento. No entanto, quando o usuário navega para outra página e retorna, todos os filtros são perdidos e resetados para o estado padrão. Isso prejudica a experiência de usuários que desejam manter seu contexto de análise durante a navegação.

Esta feature implementa o AC-5 do SPEC `enhanced-ui-filters`, adicionando persistência dos filtros do PriceTable via localStorage.

## Problema a Resolver

- Filtros aplicados no PriceTable são perdidos ao navegar para outra rota
- Usuários precisam reconfigurar filtros toda vez que retornam à página
- Não há distinção entre "limpar filtros intencionalmente" vs "navegar e voltar"

## Fora do Escopo

- Persistência de ordenação (sortField, sortDirection)
- Persistência de paginação (currentPage)
- Sincronização entre abas/janelas (BroadcastChannel)
- Expiração/TTL dos filtros (será tratado em futura iteração se necessário)

## Critérios de Aceitação

### AC-1: Salvar filtros no localStorage

**Given** que o usuário está no PriceTable
**And** aplica um ou mais filtros (categoria, cidade, tier, qualidade, encantamento, preço mín/máx, spread mín/máx)
**When** os filtros são alterados
**Then** o estado dos filtros deve ser persistido em `localStorage` com chave `albion_price_filters`

### AC-2: Restaurar filtros ao retornar

**Given** que o usuário aplicou filtros previamente
**And** os filtros estão salvos no localStorage
**When** o usuário retorna à página do PriceTable
**Then** os filtros devem ser restaurados automaticamente do localStorage
**And** a tabela deve refletir os filtros aplicados

### AC-3: Limpar filtros remove persistência

**Given** que filtros estão salvos no localStorage
**When** o usuário clica em "Clear All" (botão de limpar filtros)
**Then** os filtros devem ser resetados para o padrão
**And** a entrada no localStorage deve ser removida (ou definida como estado vazio)

### AC-4: Validação defensiva de dados persistidos

**Given** que existe dados no localStorage em `albion_price_filters`
**When** o usuário retorna à página
**Then** o sistema deve validar o schema dos dados antes de aplicar
**And** se os dados forem inválidos/corrompidos, devem ser ignorados e removidos

## Dependências

- `feat/enhanced-ui-filters` (PR #25) — já mergeada em main
- `feat/typescript-strict-mode-components` (PR #22) — já mergeada
- `src/services/alert.storage.ts` — serviço similar de persistência para referência

## Riscos e Incertezas

- Dados corrompidos no localStorage podem quebrar a UI
- Versões futuras com novos filtros podem conflitar com dados antigos persistidos
- Performance: leitura/escrita síncrona no localStorage pode bloquear brevemente

## Referências

- SPEC `enhanced-ui-filters` AC-5
- ADR-004 (padrão de persistência em localStorage)
- `src/services/alert.storage.ts` (implementação similar)
- `memory/MEMORY.md` — pendência de persistência de filtros

---

## Checklist de Validação

- [ ] Filtros salvos ao alterar qualquer filtro
- [ ] Filtros restaurados ao carregar a página
- [ ] Clear All remove persistência
- [ ] Dados inválidos são tratados sem crash
- [ ] TypeScript strict mode sem supressões
- [ ] Testes cobrem casos feliz, borda e erro
