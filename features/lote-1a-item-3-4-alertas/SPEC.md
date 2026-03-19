# SPEC — Lote 1A: Itens 3 e 4 (Alertas)

**Data:** 2026-03-19  
**Branch:** `feat/lote-1a-item-3-4-alertas`  
**Itens:** 
- Item 3: Respeitar `notifications.inApp` (Q10)
- Item 4: Normalização de `alert.city` (Q08, Q44)

---

## Item 3: Respeitar `notifications.inApp` (Q10)

### Problema
O poller de alertas (`useAlertPoller.ts`) não verifica se `notifications.inApp` está habilitado antes de mostrar o toast. Todo alerta ativo notifica sempre, ignorando a preferência do usuário.

### Solução
Adicionar verificação de `alert.notifications.inApp` antes de chamar `toast.warning()`.

### Arquivos
- `src/hooks/useAlertPoller.ts`

### Critérios de Aceitação
- [ ] AC-1: Toast só aparece se `alert.notifications.inApp === true`
- [ ] AC-2: Alertas com `notifications.inApp: false` não mostram notificação
- [ ] AC-3: Testes atualizados para cobrir ambos os cenários

---

## Item 4: Normalização de `alert.city` (Q08, Q44)

### Problema
Inconsistência entre:
- **Formulário:** usa `"all"` (valor canônico)
- **Persistência:** usa `"All Cities"` (string legível)
- **Engine:** depende de `"All Cities"` exatamente

Isso causa:
- Comportamento imprevisível
- Dados inconsistentes no localStorage
- Lógica de negócio acoplada a string de UI

### Solução
1. **Contrato canônico:** usar `"all"` em todo lugar (persistência, engine)
2. **Label de UI:** mapear `"all"` → `"All Cities"` apenas na apresentação
3. **Migrar dados existentes:** converter `"All Cities"` → `"all"` ao carregar

### Arquivos
- `src/lib/schemas.ts` - Atualizar schema de alerta
- `src/components/alerts/AlertsManager.tsx` - Normalizar ao salvar/carregar
- `src/services/alert.engine.ts` - Usar `"all"` na lógica
- `src/services/alert.storage.ts` - Adicionar migração de dados

### Critérios de Aceitação
- [ ] AC-1: Schema aceita apenas `"all"` ou nome de cidade válido
- [ ] AC-2: Dados antigos com `"All Cities"` são migrados automaticamente
- [ ] AC-3: Labels na UI mostram `"All Cities"` quando valor é `"all"`
- [ ] AC-4: Engine funciona corretamente com `"all"`
- [ ] AC-5: Testes cobrem migração e novos dados

---

## Plano de Implementação

### Item 3 (15 minutos)
1. Ler `useAlertPoller.ts`
2. Adicionar verificação `if (alert.notifications?.inApp)`
3. Atualizar testes

### Item 4 (45 minutos)
1. Atualizar schema em `schemas.ts`
2. Adicionar migração em `alert.storage.ts`
3. Atualizar `AlertsManager.tsx` para normalizar
4. Atualizar `alert.engine.ts` para usar `"all"`
5. Atualizar testes

**Total estimado:** 1 hora

