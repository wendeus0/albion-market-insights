# REPORT — Cross-City Arbitrage

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-17
**Feature:** `cross-city-arbitrage`
**Branch sugerida:** `feat/cross-city-arbitrage`

---

## Resumo

Implementação de um modo `Cross-City Arbitrage` no dashboard para substituir a
leitura enganosa de spread local por uma rota real de compra e venda entre
cidades, com lucro líquido já descontando taxa fixa de mercado de 6.5%.

## O que mudou

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `features/cross-city-arbitrage/SPEC.md` | Novo | SPEC aprovada da feature |
| `src/data/types.ts` | Modificado | Novo tipo `ArbitrageOpportunity` |
| `src/lib/arbitrage.ts` | Novo | Regra de negócio para derivar oportunidades cross-city |
| `src/components/dashboard/ArbitrageTable.tsx` | Novo | Tabela dedicada ao modo de arbitragem |
| `src/components/dashboard/TopArbitragePanel.tsx` | Novo | Painel lateral com top rotas de arbitragem |
| `src/pages/Dashboard.tsx` | Modificado | Alternância entre `Local Spread` e `Cross-City Arbitrage` |
| `src/test/arbitrage.test.ts` | Novo | Testes unitários da regra de arbitragem |
| `src/test/Dashboard.arbitrage.test.tsx` | Novo | Testes de UI do modo cross-city |

## Critérios de Aceitação

| AC | Descrição | Status |
|----|-----------|--------|
| AC-1 | Alternância de modo no dashboard | ✅ Botões `Local Spread` e `Cross-City Arbitrage` no dashboard |
| AC-2 | Agregação por item entre cidades | ✅ `buildCrossCityArbitrage()` consolida por `itemId + quality` |
| AC-3 | Exibição de rota explícita | ✅ Tabela mostra `Buy In`, `Buy Price`, `Sell In`, `Sell Price` |
| AC-4 | Lucro líquido com taxa | ✅ Cálculo usa `sellPrice * (1 - 0.065) - buyPrice` |
| AC-5 | Exclusão de oportunidades irreais | ✅ Rotas com lucro líquido `<= 0` não são exibidas |
| AC-6 | Ranking coerente | ✅ Ordenação padrão por maior ROI líquido |
| AC-7 | Painel lateral consistente | ✅ Dashboard troca `TopItemsPanel` por `TopArbitragePanel` no modo novo |

## Resultados de Validação

| Check | Resultado |
|-------|-----------|
| `npm run test` | 161/161 passando |
| `npm run lint` | 0 erros, 10 warnings (3 do diretório `coverage/` e 7 pré-existentes em `src/components/ui/`) |
| `npm run build` | OK |
| code-review | `REVIEW_OK_WITH_NOTES` |

## code-review

**Veredito:** `REVIEW_OK_WITH_NOTES`

### Notas

- O preview da home (`src/pages/Index.tsx`) continua na visualização local por escolha de escopo.
- O card de métricas locais existente no dashboard permanece aproximado no modo `Local Spread`.

Nenhum item bloqueante foi encontrado.

## security-review

Pulada — a feature não toca CI/CD, auth/secrets, infra, APIs públicas ou skills.

## Arquivos fora do escopo

Nenhum. A mudança ficou restrita ao dashboard, tipos e regra de negócio client-side.

## Riscos Residuais

- A taxa fixa de 6.5% é uma aproximação de produto; pode precisar virar configuração futura.
- O modo novo ainda não foi levado para o preview da home.
- A arbitragem ainda não considera custo logístico nem risco de transporte.

## Próximos Passos

1. Avaliar se o modo cross-city deve substituir também o preview da home
2. Considerar filtro adicional por lucro mínimo líquido ou ROI mínimo
3. Avaliar taxa configurável por usuário em ciclo futuro
