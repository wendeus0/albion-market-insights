---
id: fix-alerts-authenticated-ux
type: fix-feature
summary: Corrigir toggle e exclusao de alertas autenticados, adicionar busca de item e sugestao de threshold no formulario.
status: approved
created: 2026-03-27
---

# SPEC — Fixes de UX dos Alertas Autenticados

## Contexto e Motivação

Na validacao manual com Supabase real, o fluxo de alertas autenticados apresentou regressoes funcionais
e gaps de UX no formulario de criacao. Os pontos foram confirmados no app local apos login real.

## Problema a Resolver

Hoje existem quatro problemas concretos no fluxo de alertas:

- toggle de ativar/desativar nao reflete corretamente no backend/UI autenticada
- exclusao remota nao atualiza visualmente a lista de imediato
- seletor de item exige lista fixa sem busca por nome
- threshold inicial nao ajuda o usuario a partir do preco praticado do item

## Fora do Escopo

- refatorar `src/components/ui/`
- criar busca remota de itens
- introduzir analytics ou telemetria
- alterar schema de banco ou contrato das tabelas Supabase

## Critérios de Aceitação

### AC-1 — Toggle de alerta funciona em fluxo autenticado

**Given** que existe um alerta salvo
**When** o usuario aciona o toggle de ativar ou desativar
**Then** a alteracao eh persistida corretamente
**And** a lista local reflete o novo estado sem reload manual

### AC-2 — Exclusao atualiza a UI imediatamente

**Given** que existe um alerta salvo
**When** o usuario exclui esse alerta
**Then** o alerta some da lista sem recarregar a pagina
**And** o estado remoto permanece consistente

### AC-3 — Campo de item aceita busca por nome

**Given** que o usuario abre o dialog de criacao
**When** digita parte do nome do item
**Then** a lista exibida eh filtrada pelo termo digitado
**And** o usuario consegue selecionar o item desejado sem percorrer lista fixa inteira

### AC-4 — Threshold inicial ajuda a partir do preco do item

**Given** que o usuario seleciona um item no formulario
**When** o campo de threshold ainda nao foi preenchido manualmente
**Then** o formulario sugere um valor coerente com o preco atual/medio do item
**And** a sugestao muda conforme o tipo de alerta selecionado

## Casos de Erro

- Falha de save/delete nao deve deixar a UI em estado falso de sucesso
- Busca sem resultados deve informar estado vazio sem quebrar o dialog
- Item sem preco disponivel nao deve preencher threshold com valor incorreto

## Dependências

- `src/components/alerts/AlertsManager.tsx`
- `src/hooks/useAlerts.ts`
- `src/hooks/useAlertsForm.tsx`
- `src/hooks/useAlertsFeedback.tsx`

## Riscos e Incertezas

- O fluxo otimista de mutacao pode divergir do backend se nao houver rollback claro em erro
- Busca local precisa manter acessibilidade do seletor atual
- Sugestao de threshold deve evitar sobrescrever edicao manual do usuario

## Referências

- `PENDING_LOG.md`
- `src/components/alerts/AlertsManager.tsx`
- `src/services/alert.storage.supabase.ts`
