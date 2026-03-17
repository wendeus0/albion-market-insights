# REPORT — Cross-City Arbitrage Refinements

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-17
**Feature:** `cross-city-arbitrage-refinements`
**Branch sugerida:** `feat/cross-city-arbitrage`

---

## Resumo

Extensão do modo de arbitragem cross-city para a home e adição de filtros mínimos
de lucro líquido e ROI na `ArbitrageTable`, para destacar apenas oportunidades
realmente relevantes já no preview inicial do produto.

## O que mudou

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `features/cross-city-arbitrage-refinements/SPEC.md` | Novo | SPEC dos refinamentos |
| `features/cross-city-arbitrage-refinements/REPORT.md` | Novo | Relatório final da iteração |
| `src/components/dashboard/ArbitrageTable.tsx` | Modificado | Inputs `Min net profit` e `Min ROI` com filtragem combinada |
| `src/pages/Index.tsx` | Modificado | Home passa a usar `TopArbitragePanel` e `ArbitrageTable` no preview |
| `src/test/ArbitrageTable.test.tsx` | Novo | Testes dos filtros mínimos e combinação de filtros |
| `src/test/Index.arbitrage.test.tsx` | Novo | Testes do preview cross-city na home |

## Critérios de Aceitação

| AC | Descrição | Status |
|----|-----------|--------|
| AC-1 | Preview da home alinhado com arbitragem | ✅ `TopArbitragePanel` substitui visão local no preview principal |
| AC-2 | Tabela preview da home alinhada com arbitragem | ✅ Home exibe `ArbitrageTable` com rota, lucro líquido e ROI |
| AC-3 | Filtro por lucro líquido mínimo | ✅ `Min net profit` filtra `netProfit >= valor informado` |
| AC-4 | Filtro por ROI mínimo | ✅ `Min ROI` filtra `netProfitPercent >= valor informado` |
| AC-5 | Combinação de filtros de arbitragem | ✅ busca textual + lucro mínimo + ROI mínimo funcionam juntos |

## Resultados de Validação

| Check | Resultado |
|-------|-----------|
| `npm run test` | 168/168 passando |
| `npm run lint` | 0 erros, 10 warnings (3 em `coverage/` e 7 pré-existentes em `src/components/ui/`) |
| `npm run build` | OK |
| code-review | `REVIEW_OK_WITH_NOTES` |

## code-review

**Veredito:** `REVIEW_OK_WITH_NOTES`

### Notas

- O fallback `buildCrossCityArbitrage(topItems)` na home é conservador e pode renderizar vazio quando `topItems` não forma rotas cross-city válidas.
- Não há bloqueadores de merge.

## security-review

Pulada — refinamento restrito a UI e filtros client-side; não toca CI/CD, auth, infra, APIs públicas ou skills.

## Arquivos fora do escopo

Nenhum. O diff ficou restrito ao preview da home, filtros da tabela de arbitragem e testes relacionados.

## Riscos Residuais

- A home ficou mais orientada a arbitragem; pode exigir ajuste fino futuro de densidade visual.
- Os filtros mínimos não persistem entre navegações neste ciclo.

## Próximos Passos

1. Avaliar persistência opcional dos filtros mínimos da arbitragem
2. Considerar um CTA explícito na home para abrir o dashboard já no modo cross-city
3. Medir se o preview da home deve limitar ainda mais o número de rotas exibidas em telas pequenas
