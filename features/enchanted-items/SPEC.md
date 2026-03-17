# SPEC — Enchanted Items

**Status:** Draft
**Data:** 2026-03-17
**Autor:** antigravity

---

## Contexto e Motivação

O catálogo atual do Albion Market Insights contém 450 IDs de itens básicos (T4-T8)
sem variantes encantadas. No Albion Online, itens encantados (`.@1`, `.@2`, `.@3`)
têm atributos superiores e preços significativamente diferentes. A ausência dessas
variantes limita a análise de mercado para apenas itens básicos, ignorando um
mercado significativo de itens de maior valor.

## Problema a Resolver

O sistema atual não consegue:
1. Buscar preços de itens encantados na API
2. Exibir itens encantados no catálogo
3. Permitir filtros por nível de encantamento na UI
4. Configurar alertas para itens encantados específicos

## Fora do Escopo

- Modificação do sistema de alertas (alert engine já suporta qualquer itemId)
- Alteração da API de backend (usa itemId existente, apenas novos IDs)
- Suporte a encantamentos em recursos (concentrado em equipamentos)
- Modificação de `src/components/ui/` (shadcn/ui)

## Critérios de Aceitação

### AC-1: Catálogo com itens encantados

**Given** que o `ITEM_CATALOG` foi atualizado
**When** se acessa a categoria "Swords"
**Then** devem existir IDs para `T4_MAIN_SWORD`, `T4_MAIN_SWORD@1`, `T4_MAIN_SWORD@2`, `T4_MAIN_SWORD@3`

### AC-2: Geração de IDs encantados

**Given** a função `genIds()` existente
**When** chamada com suporte a encantamentos
**Then** deve gerar IDs no formato `{TIER}_{TYPE}@{LEVEL}` onde LEVEL ∈ [0, 1, 2, 3]

### AC-3: Filtro de encantamento na UI

**Given** que o usuário está no PriceTable
**When** visualiza os filtros disponíveis
**Then** deve haver um filtro "Enchantment" com opções: All, 0, 1, 2, 3

### AC-4: Exibição de nome com encantamento

**Given** que um item encantado é exibido na tabela
**When** o nome é renderizado
**Then** deve mostrar "Main Sword .1" (ou similar) para `@1`, identificando o nível

### AC-5: Integração com API

**Given** que o itemId `T4_MAIN_SWORD@2` é solicitado
**When** a API é chamada
**Then** deve retornar dados de preço corretos para o item encantado nível 2

### AC-6: Categorização correta

**Given** que itens encantados são adicionados
**When** o catálogo é filtrado por categoria
**Then** `T4_MAIN_SWORD@1` deve aparecer na mesma categoria que `T4_MAIN_SWORD`

## Dependências

- `feat/typescript-strict-mode-components` mergeada (PR #22) — concluída
- API do Albion Online suporta IDs com `@N` — já suportado

## Riscos e Incertezas

- Quantidade de IDs vai de 450 para ~1800 (4x mais), pode impactar performance de carregamento
- UI pode ficar poluída com muitos itens — necessário bom sistema de filtros
- Alguns itens podem não ter dados na API para todos níveis de encantamento

## Referências

- Albion Online Data Project API: suporta `itemId@1`, `@2`, `@3`
- ADR-006: Migração TypeScript strict mode (base estável)
