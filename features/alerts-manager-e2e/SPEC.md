# SPEC — Cobertura E2E do AlertsManager

**Status:** Draft
**Data:** 2026-03-18
**Autor:** Claude
**Debt ref:** PENDING_LOG.md — E2E completo de alertas

---

## Contexto e Motivação

Os testes unitários do `AlertsManager` melhoraram a cobertura de listagem e ações básicas,
mas o formulário de criação de alertas continua com cobertura insuficiente por limitações do
jsdom com `Dialog`/`Select` do Radix UI. O projeto já usa Playwright como camada E2E para
fluxos reais no browser, e o próprio ADR-005 define essa abordagem como a forma adequada de
cobrir integrações de UI não triviais.

## Problema a Resolver

Hoje `e2e/alerts.spec.ts` cobre abertura/fechamento do dialog, validação vazia e estado
vazio, mas não cobre o fluxo principal de negócio do `AlertsManager`:

1. criar um alerta válido preenchendo o formulário completo
2. persistir o alerta em `localStorage` e refletir na UI após reload
3. ativar/desativar e excluir alertas existentes
4. validar mensagens de feedback do usuário no fluxo feliz

## Fora do Escopo

- Alterar a implementação do `AlertsManager`
- Refatorar componentes `ui/` do shadcn/ui
- Testar disparo real do polling de alertas pelo motor de preços
- Cobrir envio de email real

## Critérios de Aceitação

### AC-1: Criação E2E de alerta

**Given** que o usuário está na página de alertas
**When** abre o dialog e preenche um alerta válido
**Then** o alerta é criado com sucesso e aparece na lista

### AC-2: Persistência após reload

**Given** que um alerta foi criado com sucesso
**When** a página é recarregada
**Then** o alerta continua visível na lista

### AC-3: Toggle de status

**Given** que existe um alerta na lista
**When** o usuário ativa ou desativa o alerta
**Then** o estado visual do alerta é atualizado

### AC-4: Exclusão de alerta

**Given** que existe um alerta na lista
**When** o usuário exclui o alerta
**Then** o alerta some da lista

### AC-5: Feedback do fluxo

**Given** que o usuário conclui ações válidas no fluxo de alertas
**When** cria, alterna ou exclui um alerta
**Then** a UI exibe feedback compatível com a ação executada

### AC-6: Regressão zero da suíte E2E

**Given** que os novos cenários foram adicionados
**When** `npm run test:e2e -- e2e/alerts.spec.ts` é executado
**Then** todos os cenários de `e2e/alerts.spec.ts` passam

## Dependências

- `playwright.config.ts`
- `e2e/alerts.spec.ts`
- Persistência local em `localStorage`
- Modo mock do app no ambiente E2E

## Riscos e Incertezas

- Selects do Radix podem exigir seletores mais robustos no Playwright
- O estado persistido precisa ser isolado entre cenários para evitar flaky tests
- Feedback visual via toast pode ser transitório e exigir assertions tolerantes

## Referências

- `e2e/alerts.spec.ts`
- `src/components/alerts/AlertsManager.tsx`
- `docs/adr/ADR-005-playwright-e2e-testing.md`
