# SPEC — Elevação de Cobertura de Componentes Críticos

**Status:** Implemented (Partial)
**Data:** 2026-03-18
**Autor:** Claude
**Debt ref:** MEMORY.md — gaps de cobertura em componentes de UI

---

## Contexto e Motivação

Após elevar a cobertura dos hooks de alertas para >90% (PR #28), os gaps de cobertura restantes estão concentrados em dois componentes críticos de UI:

| Módulo | Cobertura Atual | Target |
|--------|----------------|--------|
| `src/components/dashboard/PriceTable.tsx` | 76.61% | ≥80% |
| `src/components/alerts/AlertsManager.tsx` | 63.46% | ≥80% |

Estes componentes são a interface principal do usuário com o sistema de filtros e alertas. Elevar sua cobertura reduz o risco de regressões em funcionalidades core.

## Problema a Resolver

### PriceTable.tsx (76.61%)
- Filtros avançados (min/max preço, min/max spread) pouco testados
- Botão "Clear All" sem cobertura
- Contador de filtros ativos não validado
- Estados de ordenação e paginação com gaps

### AlertsManager.tsx (63.46%)
- Formulário de criação de alertas com baixa cobertura
- Validação Zod do formulário não testada
- Handlers de toggle e delete sem cobertura adequada
- Estados de lista vazia e notificações (toast) com gaps

## Fora do Escopo

- Refatoração de código de produção (apenas adicionar testes)
- Mudanças na interface pública dos componentes
- Testes E2E (foco em testes unitários/integração)
- Cobertura de `src/components/ui/` (shadcn/ui — não editar)

## Critérios de Aceitação

### AC-1: Cobertura PriceTable ≥80%

**Given** que o `PriceTable` renderiza com dados de mercado
**When** usuário interage com filtros avançados (min/max preço, min/max spread, Clear All)
**Then** todas as interações são cobertas por testes
**And** cobertura de statements atinge ≥80%

### AC-2: Filtros de preço e spread testados

**Given** que itens com diferentes preços e spreads estão na tabela
**When** filtros min/max de preço e spread são aplicados
**Then** apenas itens dentro dos ranges são exibidos

### AC-3: Botão Clear All testado

**Given** que múltiplos filtros estão ativos
**When** usuário clica em "Clear All"
**Then** todos os filtros são resetados e todos os itens são exibidos

### AC-4: Contador de filtros ativos testado

**Given** que filtros estão aplicados
**Then** contador exibe o número correto de filtros ativos

### AC-5: Cobertura AlertsManager ≥80%

**Given** que o `AlertsManager` está montado
**When** usuário cria, ativa/desativa e exclui alertas
**Then** todos os handlers são testados
**And** cobertura de statements atinge ≥80%

### AC-6: Formulário de criação testado

**Given** que o formulário de criação está aberto
**When** usuário preenche campos válidos/inválidos e submete
**Then** validações Zod são aplicadas e alerta é criado corretamente

### AC-7: Listagem e ações de alertas testadas

**Given** que alertas existem na lista
**When** usuário ativa/desativa ou exclui um alerta
**Then** ações são executadas e toasts são exibidos

### AC-8: Estado vazio testado

**Given** que não há alertas criados
**When** o componente é renderizado
**Then** mensagem e CTA apropriados são exibidos

### AC-9: Regressão zero

**Given** que implementamos os novos testes
**When** executamos o suite completo
**Then** todos os 205 testes existentes continuam passando
**And** novos testes adicionados também passam

## Dependências

- Baseline estável em `main` (205/205 testes passando)
- `@testing-library/react` e `@testing-library/user-event` (já configurados)
- Mock de `use-toast` (função `_resetToastState` disponível)
- Dados de teste de `MarketItem` e `Alert` (já existem)

## Riscos e Incertezas

- AlertsManager usa react-hook-form + Zod — mocks podem ser complexos
- Componentes dependentes de contexto (toast) requerem mocks adequados
- Selects do shadcn/ui podem requerer interações específicas nos testes

## Referências

- `src/components/dashboard/PriceTable.tsx`
- `src/components/alerts/AlertsManager.tsx`
- `src/hooks/use-toast.ts` (função `_resetToastState`)
- `src/lib/schemas.ts` (alertFormSchema)
- Cobertura atual: `npx vitest run --coverage`
