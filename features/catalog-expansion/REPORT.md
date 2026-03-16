# REPORT — feat/catalog-expansion

**Status:** READY_FOR_COMMIT
**Data:** 2026-03-16
**Branch:** feat/catalog-expansion

---

## O que mudou

### `src/data/constants.ts`
- Introduzido `ITEM_CATALOG` com 17 categorias (swords, axes, spears, daggers, bows, fire_staves, frost_staves, holy_staves, arcane_staves, cursed_staves, plate, leather, cloth, off_hands, bags, capes, resources)
- `ITEM_IDS` agora derivado de `ITEM_CATALOG` — 450 IDs únicos (era ~52 hardcoded)
- `ITEM_NAMES` gerado programaticamente via `TYPE_LABELS` para todos os 450 IDs
- Helper interno `genIds(types)` elimina repetição de tier × tipo

### `src/services/market.api.ts`
- Exportadas funções utilitárias `chunkArray<T>` e `withConcurrency<T>`
- `BATCH_SIZE = 100` e `HISTORY_CONCURRENCY = 3` exportados como constantes
- `getItems()` refatorado para processar batches com concorrência controlada
- AbortController único compartilhado entre todos os price batches (timeout 15s)
- Deduplicação por `${item_id}|${city}|${quality}` antes de processar itens
- Fallback para `MockMarketService` quando nenhum registro de preço retorna

### `src/components/dashboard/PriceTable.tsx`
- Adicionado `<Select aria-label="Category">` com opções derivadas de `ITEM_CATALOG`
- Filtro de categoria client-side, sem re-fetch
- Estado `categoryFilter` integrado ao `useMemo` de filtragem existente

### Novos arquivos de teste
- `src/test/catalog.test.ts` — AC1 (≥400 IDs únicos) e AC2 (sem duplicatas)
- `src/test/market.api.batch.test.ts` — AC3 (≥2 price fetches com 200 IDs), AC4 (falha em 1 batch não cancela outros), AC5 (concorrência ≤ HISTORY_CONCURRENCY), AC7 (chunkArray)
- `src/test/PriceTable.test.tsx` — AC6 (Select de categoria com aria-label)

---

## Por que mudou

O dashboard rastreava ~52 itens hardcoded enquanto o jogo tem 3000+ itens. A expansão para 450 IDs estratégicos (T4–T8 em todas as categorias principais) multiplica o valor de arbitragem cross-city por ~10× sem violar os rate limits da API (180 req/min — custo por refresh com 5 batches: ~40 requests).

---

## Como foi validado

| Critério | Verificação | Resultado |
|----------|------------|-----------|
| AC1: ≥400 IDs únicos | `catalog.test.ts` | ✅ 450 IDs |
| AC2: Sem duplicatas | `catalog.test.ts` | ✅ |
| AC3: ≥2 price fetches com 200 IDs | `market.api.batch.test.ts` | ✅ |
| AC4: Falha em 1 batch não cancela outros | `market.api.batch.test.ts` | ✅ |
| AC5: Concorrência ≤ HISTORY_CONCURRENCY | `market.api.batch.test.ts` | ✅ |
| AC6: Select de categoria no PriceTable | `PriceTable.test.tsx` | ✅ |
| AC7: 65 testes existentes passando | `npm run test` | ✅ 65/65 |
| Lint | `npm run lint` | ✅ 0 erros |
| Build | `npm run build` | ✅ sem erros |

---

## security-review

**Status:** SKIPPED — justificativa: feature exclusivamente de produto (constantes de domínio, lógica de serviço de mercado e componente de UI). Não toca CI/CD, autenticação, secrets, infraestrutura, permissões nem APIs públicas. Nenhum dos triggers obrigatórios de security-review se aplica.

---

## Riscos residuais

- Bundle de `constants.ts` cresce ~30–50 KB (450 IDs + TYPE_LABELS). Aceitável — dados estáticos, compressão gzip reduz para ~5–8 KB em produção.
- Rate limit da API: 5 batches × 1 price request = 5 requests por refresh. Com staleTime de 15 min, bem dentro dos 180 req/min.

---

## Próximos passos

- Monitorar comportamento com a API real (`VITE_USE_REAL_API=true`)
- Avaliar adição de enchanted items (`.@1`, `.@2`, `.@3`) em feature futura
