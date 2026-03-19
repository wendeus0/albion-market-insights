# SPEC — Lote 1A: Unificação de Notificações

**Data:** 2026-03-19  
**Branch:** `feat/lote-1a-alertas-notificacoes`  
**Autor:** Hermes Agent  
**Prioridade:** P1 (Quick Win)  
**Referência:** QUESTIONS.md Q14

---

## 1. Resumo

Unificar os dois sistemas de notificação/toast existentes (`use-toast` custom + Sonner) em um único sistema baseado em Sonner, eliminando inconsistências visuais e comportamentais.

---

## 2. Problema

Atualmente o app mantém:
- **Hook custom `use-toast`** (`src/hooks/use-toast.ts`) - Sistema legado
- **Componente Sonner** (`src/components/ui/sonner.tsx`) - Sistema moderno

Isso causa:
- Inconsistência visual (dois estilos de toast diferentes)
- Comportamento imprevisível (hooks podem conflitar)
- Complexidade desnecessária (manter dois sistemas)
- Débito técnico

---

## 3. Solução

**Descontinuar `use-toast` custom e migrar tudo para Sonner.**

### 3.1 Estratégia

1. **Identificar todos os usos de `use-toast`**
2. **Criar wrapper `useSonnerToast`** (facade para Sonner)
3. **Migrar chamadas gradualmente**
4. **Remover `use-toast.ts` e componentes relacionados**
5. **Atualizar `App.tsx`**

### 3.2 API Alvo (Sonner)

```typescript
// Nova API unificada
import { toast } from 'sonner';

// Sucesso
toast.success('Data refreshed', {
  description: 'Market prices have been updated.',
});

// Erro
toast.error('Refresh failed', {
  description: 'Please try again later.',
});

// Info
toast.info('New alert created');

// Warning
toast.warning('Cooldown active', {
  description: 'Please wait 2:30 before refreshing.',
});
```

---

## 4. Arquivos Afetados

### 4.1 Para Modificar

| Arquivo | Uso Atual | Ação |
|---------|-----------|------|
| `src/App.tsx` | Importa `<Toaster />` e `<Sonner />` | Remover `<Toaster />`, manter só Sonner |
| `src/pages/Dashboard.tsx` | `useToast()` | Migrar para `toast` do sonner |
| `src/hooks/useAlertPoller.ts` | `useToast()` | Migrar para `toast` do sonner |
| `src/components/alerts/AlertsManager.tsx` | `useToast()` | Migrar para `toast` do sonner |

### 4.2 Para Remover

| Arquivo | Motivo |
|---------|--------|
| `src/hooks/use-toast.ts` | Sistema legado descontinuado |
| `src/components/ui/toaster.tsx` | Componente do sistema legado |
| `src/components/ui/toast.tsx` | Componente do sistema legado |

---

## 5. Critérios de Aceitação

- [ ] AC-1: Nenhum arquivo importa `use-toast` ou `useToast`
- [ ] AC-2: Todos os toasts usam API do Sonner (`toast.success`, `toast.error`, etc.)
- [ ] AC-3: `<Toaster />` removido de `App.tsx`
- [ ] AC-4: Apenas um sistema de toast renderiza na tela
- [ ] AC-5: Estilo visual consistente em todos os toasts
- [ ] AC-6: Build passa sem erros
- [ ] AC-7: Testes existentes passam (ajustados se necessário)

---

## 6. Plano de Implementação

### Fase 1: Setup (15 min)
1. Verificar configuração do Sonner em `App.tsx`
2. Confirmar que Sonner está funcionando

### Fase 2: Migração (45 min)
1. Migrar `Dashboard.tsx`
2. Migrar `useAlertPoller.ts`
3. Migrar `AlertsManager.tsx`

### Fase 3: Cleanup (15 min)
1. Remover imports não usados
2. Remover arquivos legados
3. Atualizar `App.tsx`

### Fase 4: Validação (15 min)
1. Build
2. Lint
3. Testes

**Total estimado:** 1.5 horas

---

## 7. Testes

### 7.1 Testes Unitários
- Verificar que `toast.success` é chamado em operações de sucesso
- Verificar que `toast.error` é chamado em operações de erro

### 7.2 Testes E2E (se aplicável)
- Verificar que toast aparece na tela após ação do usuário

---

## 8. Definition of Done

- [ ] SPEC revisada
- [ ] Código implementado
- [ ] Arquivos legados removidos
- [ ] Build passando
- [ ] Lint limpo
- [ ] Testes passando
- [ ] Commit + PR

---

## 9. Notas

- Sonner já está instalado e configurado
- Não precisa criar novo serviço/hook, usar `toast` direto do sonner
- Manter mesma experiência de UX (duração, posição)

