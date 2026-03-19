# REPORT — Persist Price Filters

**Feature:** `persist-price-filters`  
**Branch:** `feat/persist-price-filters`  
**Data:** 2026-03-19  
**Status:** `READY_FOR_COMMIT`

---

## Objetivo

Implementar persistência dos filtros do PriceTable via localStorage, completando o AC-5 do SPEC `enhanced-ui-filters` (PR #25). Filtros aplicados agora sobrevivem à navegação entre páginas.

## Escopo Alterado

| Arquivo                                    | Tipo       | Descrição                                                                                 |
| ------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------- |
| `src/services/filter.storage.ts`           | Novo       | Serviço de persistência com validação defensiva                                           |
| `src/components/dashboard/PriceTable.tsx`  | Modificado | Integração com filterStorage; useEffect para persistir; flag shouldPersist para Clear All |
| `src/test/PriceTable.persistence.test.tsx` | Novo       | 10 testes cobrindo AC-1 a AC-4                                                            |
| `src/test/PriceTable.test.tsx`             | Modificado | Fix regressão: `beforeEach(() => localStorage.clear())`                                   |
| `features/persist-price-filters/SPEC.md`   | Novo       | Especificação da feature                                                                  |

## Validações Executuadas

| Gate                | Resultado              | Evidência                                                  |
| ------------------- | ---------------------- | ---------------------------------------------------------- |
| **Lint**            | ✅                     | 7 warnings (shadcn/ui, esperados)                          |
| **Build**           | ✅                     | 1770 módulos, bundle ~400KB                                |
| **TypeScript**      | ✅                     | `strict: true`, sem erros                                  |
| **Unit Tests**      | ✅                     | 215/215 passando (10 novos)                                |
| **Quality Gate**    | `QUALITY_PASS`         | Todos os ACs cobertos                                      |
| **Code Review**     | `REVIEW_OK_WITH_NOTES` | Sem bloqueadores; nota: extrair hook em futura refatoração |
| **Security Review** | `SECURITY_PASS`        | Validação defensiva adequada; React escapa output          |

## Critérios de Aceitação

| ID   | Critério                       | Status | Evidência                                       |
| ---- | ------------------------------ | ------ | ----------------------------------------------- |
| AC-1 | Salvar filtros no localStorage | ✅     | Testes: salvar categoria, cidade, preço         |
| AC-2 | Restaurar filtros ao retornar  | ✅     | Testes: restaurar estado, aplicar à tabela      |
| AC-3 | Clear All remove persistência  | ✅     | Testes: remover storage, resetar UI             |
| AC-4 | Validação defensiva            | ✅     | Testes: ignorar JSON inválido, tipos incorretos |

## Riscos Residuais

| Risco                                | Severidade | Mitigação                                                     |
| ------------------------------------ | ---------- | ------------------------------------------------------------- |
| Dados corrompidos de versões futuras | Baixa      | `isValidFilterState()` valida schema; campos extras ignorados |
| XSS via localStorage                 | Baixa      | React escapa automaticamente; sem `dangerouslySetInnerHTML`   |
| Performance (sync IO)                | Baixa      | localStorage é síncrono mas volume de dados é pequeno (<1KB)  |

## Follow-ups

1. **Refatoração**: Extrair lógica de persistência para hook `usePersistentFilters()` quando houver segundo uso (DRY).
2. **UX**: Considerar indicador visual de "filtros restaurados" na primeira visita (baixa prioridade).
3. **Testes E2E**: Adicionar cenário de persistência entre navegação em `alerts-manager-e2e` (opcional).

## Decisões Técnicas

- **Chave localStorage**: `albion_price_filters` (consistente com `albion_alerts` e `albion_market_cache`)
- **Estratégia de persistência**: Salvar apenas filtros (não search, sort, paginação)
- **Clear All**: Remove completamente do storage (não apenas reseta para defaults)
- **shouldPersist flag**: Workaround para evitar race condition entre setState e useEffect no Clear All

## Notas para Revisores

- Implementação segue padrão de `alert.storage.ts` (ADR-004)
- TypeScript strict mode sem supressões
- Não há alterações em CI/CD, Docker ou workflows
- README.md modificado fora desta feature (atualização de documentação geral)

---

**Status Final:** `READY_FOR_COMMIT`
