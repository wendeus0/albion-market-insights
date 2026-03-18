# SPEC — Elevação de Cobertura de Testes em Módulos Críticos

**Status:** Implemented
**Data:** 2026-03-18
**Autor:** Claude
**Debt ref:** MEMORY.md — gaps de cobertura em dashboard e alertas

---

## Contexto e Motivação

A cobertura atual do projeto está em 81.81% statements / 83.35% lines, mas módulos críticos de UI e hooks estão abaixo do limiar operacional de 80%:

| Módulo | Cobertura Atual | Target |
|--------|----------------|--------|
| `src/components/dashboard/PriceTable.tsx` | 76.61% | ≥80% |
| `src/components/alerts/AlertsManager.tsx` | 63.46% | ≥80% |
| `src/hooks/useAlerts.ts` | 20% | ≥80% |
| `src/hooks/useAlertPoller.ts` | 43.75% | ≥80% |
| `src/hooks/use-toast.ts` | 54.71% | ≥80% |

Estes módulos são críticos para a experiência do usuário (filtros de preços, gestão de alertas, notificações). Baixa cobertura aumenta o risco de regressões e dificulta refatorações seguras.

## Problema a Resolver

1. **PriceTable**: Testes insuficientes para filtros avançados (min/max preço/spread, Clear All, contador)
2. **AlertsManager**: Baixa cobertura de branches em handlers de criação/edição/exclusão de alertas
3. **useAlerts**: Hook central de gestão de alertas praticamente sem testes
4. **useAlertPoller**: Lógica de polling não coberta adequadamente
5. **use-toast**: Sistema de notificações com cobertura parcial

## Fora do Escopo

- Refatoração de código de produção (apenas adicionar testes)
- Mudanças na interface pública dos hooks/componentes
- Testes E2E (foco em testes unitários/integração)
- Cobertura de `src/components/ui/` (shadcn/ui — não editar)

## Critérios de Aceitação

### AC-1: Cobertura PriceTable ≥80%

**Given** que o `PriceTable` renderiza com dados de mercado
**When** executamos filtros avançados (min/max preço, min/max spread, Clear All)
**Then** todas as interações são cobertas por testes
**And** cobertura de statements atinge ≥80%

### AC-2: Cobertura AlertsManager ≥80%

**Given** que o `AlertsManager` está montado
**When** usuário cria, edita, exclui e ativa/desativa alertas
**Then** todos os handlers são testados
**And** cobertura de statements atinge ≥80%

### AC-3: Cobertura useAlerts ≥80%

**Given** que o hook `useAlerts` é utilizado
**When** alertas são carregados, criados, atualizados e removidos
**Then** todas as operações CRUD são testadas
**And** cobertura de statements atinge ≥80%

### AC-4: Cobertura useAlertPoller ≥80%

**Given** que o hook `useAlertPoller` monitora alertas
**When** condições de disparo são atendidas ou polling ocorre
**Then** lógica de verificação e notificação é testada
**And** cobertura de statements atinge ≥80%

### AC-5: Cobertura use-toast ≥80%

**Given** que o hook `use-toast` gerencia notificações
**When** toasts são adicionados, atualizados e removidos
**Then** todas as ações do reducer são testadas
**And** cobertura de statements atinge ≥80%

### AC-6: Regressão zero

**Given** que implementamos os novos testes
**When** executamos o suite completo
**Then** todos os 133 testes existentes continuam passando
**And** novos testes adicionados também passam

## Dependências

- Baseline estável em `main` (133/133 testes passando)
- `zod` para schemas de validação (já disponível)
- `@testing-library/react` e `@testing-library/react-hooks` (já configurados)
- MSW (Mock Service Worker) para mocks de API (já configurado)

## Riscos e Incertezas

- Testes de hooks podem requerer mocks complexos de contexto
- Timer-based tests (useAlertPoller) podem ser flaky — usar fake timers
- AlertsManager pode ter dependências circulares a serem mockadas

## Referências

- `src/components/dashboard/PriceTable.tsx`
- `src/components/alerts/AlertsManager.tsx`
- `src/hooks/useAlerts.ts`
- `src/hooks/useAlertPoller.ts`
- `src/hooks/use-toast.ts`
- Cobertura atual: `npx vitest run --coverage`
