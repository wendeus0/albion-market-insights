# SPEC — Enhanced UI Filters

**Status:** Draft
**Data:** 2026-03-17
**Autor:** antigravity

---

## Contexto e Motivação

Após a implementação de enchanted items, o catálogo expandiu de 450 para 1.830 IDs.
Com essa quantidade significativamente maior de itens, a experiência do usuário no
PriceTable pode ser comprometida sem filtros adicionais robustos. Os filtros atuais
(Categoria, Cidade, Tier, Qualidade, Enchantment) são úteis, mas há gaps que dificultam
a navegação eficiente.

## Problema a Resolver

O sistema atual não permite:
1. **Filtrar por faixa de preço** — usuários não conseguem ver apenas itens dentro de um orçamento
2. **Filtrar por spread mínimo/máximo** — traders não conseguem focar em oportunidades de lucro específicas
3. **Busca avançada com múltiplos termos** — busca atual é simples (OR implícito)
4. **Limpar todos os filtros de uma vez** — necessário resetar filtros individualmente
5. **Indicador visual de filtros ativos** — usuários não sabem claramente o que está filtrado

## Fora do Escopo

- Modificação de `src/components/ui/` (shadcn/ui)
- Alteração na lógica de fetch de dados da API
- Filtros server-side (manter client-side)
- Exportação de dados filtrados

## Critérios de Aceitação

### AC-1: Filtro por faixa de preço (Sell/Buy)

**Given** que o usuário está no PriceTable
**When** aplica filtros de preço mínimo e máximo
**Then** apenas itens dentro da faixa de preço são exibidos

### AC-2: Filtro por faixa de spread (%)

**Given** que o usuário está no PriceTable
**When** aplica filtros de spread mínimo e máximo
**Then** apenas itens com spread percentual dentro da faixa são exibidos

### AC-3: Botão "Clear All Filters"

**Given** que um ou mais filtros estão ativos
**When** o usuário clica em "Clear All"
**Then** todos os filtros são resetados para o estado padrão (all)

### AC-4: Indicador de filtros ativos

**Given** que filtros estão aplicados
**When** o usuário visualiza a barra de filtros
**Then** deve ver um badge/contador indicando quantos filtros estão ativos

### AC-5: Preservar filtros ao navegar

**Given** que o usuário aplicou filtros
**When** navega para outra página e retorna
**Then** os filtros devem persistir (localStorage)

## Dependências

- `feat/enchanted-items` mergeada (PR #24) — concluída
- `feat/typescript-strict-mode-components` mergeada — concluída

## Riscos e Incertezas

- Muitos filtros podem poluir a UI — necessário design limpo
- Filtros em localStorage podem confundir usuários se não forem claros
- Performance de filtragem client-side com 1.830+ itens

## Referências

- PENDING_LOG.md:24 — pendência de filtros de UI
- ADR-008 — suporte a enchanted items (baseline atual)
