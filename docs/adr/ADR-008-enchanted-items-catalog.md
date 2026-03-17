# ADR-008 — Suporte a Itens Encantados no Catálogo

**Status:** Aceito
**Data:** 2026-03-17

## Contexto

O catálogo do Albion Market Insights continha apenas itens básicos (450 IDs).
No entanto, o Albion Online possui itens encantados (`.@1`, `.@2`, `.@3`) que
representam um mercado significativo com preços e spreads diferentes.

## Decisão

Expandir o catálogo para incluir todas as variantes encantadas:
- Cada item base (T4-T8) agora tem 4 variantes (0, 1, 2, 3)
- Total de IDs: 450 → 1.830 (~4x aumento)
- Filtro de encantamento adicionado à UI
- Nomes exibem sufixo `.N` para identificação

## Consequências

**Positivas:**
- Análise de mercado completa incluindo itens encantados
- Melhor oportunidade de identificar spreads lucrativos
- Filtro permite focar em níveis específicos

**Negativas:**
- 4x mais IDs para carregar/processar
- Potencial impacto em performance (mitigado por batch loading existente)
- UI mais poluída sem filtros adequados

## Alternativas Consideradas

1. **Manter apenas itens básicos**: Rejeitado — perde oportunidades de mercado
2. **Lazy loading de encantamentos**: Rejeitado — complexidade desnecessária, batch loading já mitiga
3. **Encantamentos como categoria separada**: Rejeitado — confuso, item é o mesmo com atributos diferentes

## Mitigações

- Batch loading com concorrência controlada já implementado
- Filtro de encantamento permite reduzir visibilidade
- Paginação client-side existente
