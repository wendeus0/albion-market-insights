# Mapa de Uso de Componentes UI

**Gerado em:** 2026-03-21  
**Componentes analisados:** 13  
**Total de imports:** 27

---

## Resumo por Componente

| Componente    | Imports | Tipo       | Warnings | Status    |
| ------------- | ------- | ---------- | -------- | --------- |
| alert.tsx     | 1       | shadcn/ui  | 0        | OK        |
| badge.tsx     | 4       | shadcn/ui  | 1        | REFATORAR |
| button.tsx    | 11      | shadcn/ui  | 1        | REFATORAR |
| checkbox.tsx  | 2       | shadcn/ui  | 0        | OK        |
| dialog.tsx    | 2       | shadcn/ui  | 0        | OK        |
| form.tsx      | 2       | shadcn/ui  | 1        | REFATORAR |
| input.tsx     | 4       | shadcn/ui  | 0        | OK        |
| label.tsx     | 4       | shadcn/ui  | 0        | OK        |
| select.tsx    | 5       | shadcn/ui  | 0        | OK        |
| skeleton.tsx  | 1       | shadcn/ui  | 0        | OK        |
| sonner.tsx    | 1       | shadcn/ui  | 0        | OK        |
| sparkline.tsx | 4       | **Custom** | 0        | OK        |
| tooltip.tsx   | 2       | shadcn/ui  | 1        | REFATORAR |

---

## Detalhamento de Imports

### 1. alert.tsx (1 import)

- `src/components/items/ItemIcon.tsx`: `AlertCircle` from `lucide-react` (não é do UI)

**Verificação:** O componente Alert do shadcn não é importado diretamente. Apenas ícone do lucide-react.

### 2. badge.tsx (4 imports)

- `src/components/items/ItemDisplay.tsx`: `Badge`
- `src/components/market/PriceTable.tsx`: `Badge`
- `src/components/market/TopArbitragePanel.tsx`: `Badge`
- `src/pages/Index.tsx`: `Badge`

**Exports auxiliares:** `badgeVariants` (usado apenas internamente no arquivo)
**Consumidores externos de badgeVariants:** NENHUM

### 3. button.tsx (11 imports)

- `src/components/alerts/AlertsManager.tsx`: `Button`
- `src/components/items/ItemIcon.tsx`: `Button`
- `src/components/layout/Layout.tsx`: `Button`
- `src/components/market/PriceTable.tsx`: `Button`
- `src/components/market/TopArbitragePanel.tsx`: `Button`
- `src/components/market/TopItemsPanel.tsx`: `Button`
- `src/pages/About.tsx`: `Button`
- `src/pages/Alerts.tsx`: `Button`
- `src/pages/Dashboard.tsx`: `Button`
- `src/pages/Index.tsx`: `Button`
- `src/pages/NotFound.tsx`: `Button`

**Exports auxiliares:** `buttonVariants`
**Consumidores externos de buttonVariants:** NENHUM (verificado via grep)

### 4. checkbox.tsx (2 imports)

- `src/components/alerts/AlertsManager.tsx`: `Checkbox`
- `src/components/market/PriceTable.tsx`: `Checkbox`

**Exports auxiliares:** Nenhum

### 5. dialog.tsx (2 imports)

- `src/components/alerts/AlertsManager.tsx`: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`
- `src/components/market/PriceTable.tsx`: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogTrigger`

**Exports auxiliares:** Nenhum relevante

### 6. form.tsx (2 imports)

- `src/components/alerts/AlertsManager.tsx`: `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`
- `src/test/components/alerts/AlertsManager.test.tsx`: `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel`, `FormMessage`

**Exports auxiliares:** `useFormField`, `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField`
**Consumidores externos de useFormField:** NENHUM (verificado via grep)

### 7. input.tsx (4 imports)

- `src/components/alerts/AlertsManager.tsx`: `Input`
- `src/components/market/PriceTable.tsx`: `Input`
- `src/pages/Alerts.tsx`: `Input`
- `src/pages/Dashboard.tsx`: `Input`

**Exports auxiliares:** Nenhum

### 8. label.tsx (4 imports)

- `src/components/alerts/AlertsManager.tsx`: `Label`
- `src/components/market/PriceTable.tsx`: `Label`
- `src/pages/Alerts.tsx`: `Label`
- `src/test/components/alerts/AlertsManager.test.tsx`: `Label`

**Exports auxiliares:** Nenhum

### 9. select.tsx (5 imports)

- `src/components/alerts/AlertsManager.tsx`: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `src/components/market/PriceTable.tsx`: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `src/pages/Alerts.tsx`: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `src/pages/Dashboard.tsx`: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `src/pages/Index.tsx`: `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`

**Exports auxiliares:** Nenhum

### 10. skeleton.tsx (1 import)

- `src/components/market/TopItemsPanel.tsx`: `Skeleton`

**Exports auxiliares:** Nenhum

### 11. sonner.tsx (1 import)

- `src/App.tsx`: `Toaster`

**Exports auxiliares:** Nenhum

### 12. sparkline.tsx (4 imports) - **COMPONENTE CUSTOMIZADO**

- `src/components/market/PriceTable.tsx`: `Sparkline`
- `src/components/market/TopItemsPanel.tsx`: `Sparkline`
- `src/test/components/ui/sparkline.test.tsx`: `Sparkline`
- `src/components/items/ItemIcon.tsx`: `Sparkline` (verificar se existe)

**Observação:** Componente customizado, não parte do shadcn/ui. Não deve ser removido.

### 13. tooltip.tsx (2 imports)

- `src/components/items/ItemDisplay.tsx`: `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`
- `src/components/market/PriceTable.tsx`: `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`

**Exports auxiliares:** Múltiplos componentes exportados na linha 28

---

## Análise de Warnings

### Warning 1: badge.tsx (linha 29)

```typescript
export { Badge, badgeVariants };
```

**Causa:** Exporta `badgeVariants` junto com componente
**Solução:** Extrair `badgeVariants` para `badge.utils.ts`
**Impacto:** Baixo (nenhum consumidor externo)

### Warning 2: button.tsx (linha 47)

```typescript
export { Button, buttonVariants };
```

**Causa:** Exporta `buttonVariants` junto com componente
**Solução:** Extrair `buttonVariants` para `button.utils.ts`
**Impacto:** Baixo (nenhum consumidor externo)

### Warning 3: form.tsx (linha 129)

```typescript
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
```

**Causa:** Exporta `useFormField` (hook) junto com componentes
**Solução:** Extrair `useFormField` para `form.hooks.ts`
**Impacto:** Médio (hooks são usados internamente por outros componentes do form)

### Warning 4: tooltip.tsx (linha 28)

```typescript
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```

**Causa:** Exporta múltiplos componentes em uma linha
**Solução:** Este warning é estranho pois todos são componentes React. Pode ser falso positivo ou o linter está detectando as atribuições de constantes nas linhas 6-10.
**Verificação necessária:** Analisar linhas 6-10:

```typescript
const TooltipProvider = TooltipPrimitive.Provider; // ← pode ser considerado "não-componente"
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
```

**Solução:** Usar export direto sem atribuição intermediária ou mover para utils

---

## Estratégia de Refatoração

### Ordem de Execução (menor risco primeiro)

1. **badge.tsx** → `badge.utils.ts`
   - Extrair `badgeVariants`
   - Nenhum impacto externo
   - Importar de volta no badge.tsx

2. **button.tsx** → `button.utils.ts`
   - Extrair `buttonVariants`
   - Nenhum impacto externo
   - Importar de volta no button.tsx

3. **tooltip.tsx** → `tooltip.utils.ts`
   - Extrair atribuições de constantes (linhas 6-10)
   - Re-exportar do arquivo utils
   - Impacto: componentes que importam tooltip não devem mudar

4. **form.tsx** → `form.hooks.ts`
   - Extrair `useFormField`
   - Cuidado: `useFormField` é usado por `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`
   - Solução: Manter import interno do hook no mesmo arquivo OU extrair hooks para arquivo separado mas manter re-export
   - **Decisão:** Extrair para `form.hooks.ts` e importar de volta no `form.tsx`

---

## Checklist de Validação

Para cada componente refatorado:

- [ ] Arquivo `.utils.ts` ou `.hooks.ts` criado
- [ ] Componente original importa do novo arquivo
- [ ] Componente original exporta apenas componente(s) React
- [ ] Todos os imports externos continuam funcionando
- [ ] `npm run lint` → warning específico eliminado
- [ ] `npm run typecheck` → 0 erros
- [ ] `npm run test` → 333/333 passando

---

## Notas de Risco

### Risco Alto: Nenhum identificado

### Risco Médio: form.tsx

- `useFormField` é usado internamente por 4 componentes no mesmo arquivo
- Extrair para arquivo separado requer garantir que o contexto continue funcionando
- **Mitigação:** Manter `FormFieldContext` e `FormItemContext` no arquivo principal, extrair apenas o hook

### Risco Baixo: tooltip.tsx

- Pode haver confusão sobre qual é o warning específico
- **Mitigação:** Aplicar mudança e verificar se warning some

---

## Comandos de Validação

```bash
# Verificar warnings restantes
npm run lint 2>&1 | grep "react-refresh"

# Contar warnings totais
npm run lint 2>&1 | grep -c "warning"

# Verificar imports específicos
grep -r "badgeVariants" src/ --include="*.tsx"
grep -r "buttonVariants" src/ --include="*.tsx"
grep -r "useFormField" src/ --include="*.tsx"
```

---

## Resultado da Refatoração

**Data de conclusão:** 2026-03-21
**Status:** ✅ CONCLUÍDO

### Resumo de Mudanças

| Componente | Arquivo(s) Criado(s) | Status |
|------------|---------------------|--------|
| badge.tsx | `badge.utils.ts` | ✅ Exporta apenas componente React |
| tooltip.tsx | `tooltip.utils.ts` | ✅ Exporta apenas componentes React |
| sonner.tsx | `sonner.utils.ts` | ✅ Exporta apenas componente React |
| button.tsx | `button.utils.ts` | ✅ Exporta apenas componente React |
| form.tsx | `form.hooks.ts` | ✅ Exporta apenas componentes React |

### Validação Final

- [x] `npm run lint` → 0 erros, 0 warnings
- [x] `npm run typecheck` → 0 erros
- [x] `npm run test` → 342/342 testes passando
- [x] `npm run build` → Build sucesso

### Arquivos Criados

1. `src/components/ui/badge.utils.ts` - `badgeVariants`
2. `src/components/ui/tooltip.utils.ts` - `TooltipProvider`, `TooltipRoot`, `TooltipTrigger`
3. `src/components/ui/sonner.utils.ts` - `toast` (re-export do sonner)
4. `src/components/ui/button.utils.ts` - `buttonVariants`
5. `src/components/ui/form.hooks.ts` - `useFormField`, `FormFieldContext`, `FormItemContext`

### Arquivos Modificados

1. `src/components/ui/badge.tsx` - Importa `badgeVariants` de utils
2. `src/components/ui/tooltip.tsx` - Importa constantes de utils
3. `src/components/ui/sonner.tsx` - Exporta apenas `Toaster`
4. `src/components/ui/button.tsx` - Importa `buttonVariants` de utils
5. `src/components/ui/form.tsx` - Importa hooks de hooks.ts
6. `src/pages/Dashboard.tsx` - Importa `toast` de 'sonner' diretamente
7. `src/pages/Dashboard.test.tsx` - Mock de 'sonner' em vez de '@/components/ui/sonner'

### Warnings Eliminados

- [x] badge.tsx linha 29 - `badgeVariants` exportado junto com componente
- [x] tooltip.tsx linha 28 - Múltiplas constantes exportadas
- [x] sonner.tsx linha 27 - `toast` exportado junto com componente
- [x] button.tsx linha 47 - `buttonVariants` exportado junto com componente
- [x] form.tsx linha 129 - `useFormField` exportado junto com componentes

