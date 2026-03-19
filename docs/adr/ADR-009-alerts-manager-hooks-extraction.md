# ADR-009: Extração de Hooks do AlertsManager

## Status
- **Data**: 2026-03-19
- **Status**: Aprovado
- **Autor**: Wendel Duarte

## Contexto

O componente `AlertsManager.tsx` havia crescido para 466 linhas, misturando:
- Lógica de formulário (react-hook-form)
- Geração de IDs e criação de alertas
- Notificações/toasts (Sonner)
- Helpers de UI (formatação de texto, ícones)
- JSX de renderização

Isso violava o princípio de responsabilidade única e dificultava testes unitários.

## Decisão

Extrair 3 hooks especializados seguindo o padrão `[feature] + [subdomínio]`:

### 1. useAlertsForm
**Responsabilidade**: Gerenciamento do formulário de criação de alertas.

```typescript
interface UseAlertsFormReturn {
  form: UseFormReturn<AlertFormValues>;
  alertType: string;
  createAlert: (values: AlertFormValues) => Alert | null;
  resetForm: () => void;
}
```

**Decisões:**
- Mantém react-hook-form encapsulado
- Exporta `generateAlertId()` com fallback para browsers antigos
- Retorna `null` se item não for encontrado (validação defensiva)

### 2. useAlertsFeedback
**Responsabilidade**: Centralização de notificações Sonner.

```typescript
interface UseAlertsFeedbackReturn {
  notifyToggle: (alert: Alert) => void;
  notifyDelete: (id: string, itemName?: string) => void;
  notifyCreate: (itemName: string, condition: Alert['condition'], threshold: number) => void;
}
```

**Decisões:**
- Recebe `onDeleteAlert` para desacoplar ação da notificação
- Formata mensagens contextualmente (below/above/change)

### 3. useAlertsUI
**Responsabilidade**: Helpers de formatação pura (sem side effects).

```typescript
interface UseAlertsUIReturn {
  getConditionIcon: (condition: Alert['condition']) => ReactNode;
  getConditionText: (alert: Alert) => string;
  getCityLabel: (city: string) => string;
  getConditionStyles: (condition: Alert['condition']) => { icon: ReactNode; className: string };
}
```

**Decisões:**
- Hook sem dependências (pode ser substituído por funções puras futuramente)
- Retorna elementos React diretamente para conveniência

## Consequências

### Positivas
- **AlertsManager.tsx**: 466 → ~320 linhas (-31%)
- **Testabilidade**: 21 novos testes unitários para lógica extraída
- **Reusabilidade**: `generateAlertId` pode ser usado externamente
- **Manutenibilidade**: Mudanças em feedback/toast não afetam formulário

### Negativas
- **Indireção adicional**: 3 imports a mais no componente
- **Custo de abstração**: Hooks simples podem parecer over-engineering

## Padrão de Nomenclatura

Adotamos `[feature] + [subdomínio]` para hooks relacionados a um componente:
- `useAlertsForm` (não `useAlertForm`)
- `useAlertsFeedback` (não `useAlertToast`)
- `useAlertsUI` (não `useAlertHelpers`)

Isso agrupa visualmente hooks relacionados no file explorer.

## Alternativas Consideradas

### 1. Serviços puros (funções não-hook)
- **Rejeitado**: `useAlertsForm` precisa do ciclo de vida do react-hook-form

### 2. Hook único `useAlertsManager`
- **Rejeitado**: Violaria separação de responsabilidades, tornando-o tão grande quanto o componente original

### 3. Context API
- **Rejeitado**: Não há necessidade de compartilhar estado entre componentes distantes

## Referências

- Padrão de hooks do PriceTable (futuro): `usePriceTableFilters`, `usePriceTableSort`
- Documentação react-hook-form: https://react-hook-form.com/
- Sonner toast: https://sonner.emilkowal.ski/

