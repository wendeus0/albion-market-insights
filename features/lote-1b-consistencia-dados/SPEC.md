# SPEC — Lote 1B: Consistência de Dados

**Data:** 2026-03-19  
**Branch:** `feat/lote-1b-consistencia-dados`  
**Itens:**
1. Política única de frescor (15 min)
2. ID robusto para alertas
3. Cooldown de alerta persistente
4. Runtime padronizado em Node 20

---

## Item 1: Política Única de Frescor (15 min)

### Problema
Inconsistência nos valores de frescor dos dados:
- Cache TTL: 5 minutos (`market.cache.ts`)
- TanStack Query staleTime: 15 minutos (`useMarketItems.ts`)
- Textos na UI: "Every 15 min"
- Polling: 15 minutos (`useAlertPoller.ts`)

### Solução
Padronizar tudo para **15 minutos** (900.000 ms), que é o valor mais comum e aceitável.

### Centralização
Criar constante única em `data/constants.ts`:
```typescript
export const DATA_FRESHNESS_MS = 15 * 60 * 1000; // 15 minutos
```

### Arquivos a Modificar
- `src/data/constants.ts` - Adicionar constante
- `src/services/market.cache.ts` - Usar constante (TTL)
- `src/hooks/useMarketItems.ts` - Usar constante (staleTime)
- `src/hooks/useAlertPoller.ts` - Usar constante (refetchInterval)
- `src/pages/Dashboard.tsx` - Texto "Every 15 min" (já correto)

---

## Item 2: ID Robusto para Alertas

### Problema
`Date.now().toString()` pode colidir em cliques rápidos (< 1ms).

### Solução
Migrar para `crypto.randomUUID()` com fallback seguro para browsers antigos.

### Implementação
```typescript
function generateAlertId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
```

---

## Item 3: Cooldown de Alerta Persistente

### Problema
`lastFiredAt` em `useAlertPoller` é apenas em memória. Reseta no reload da página.

### Solução
Persistir no localStorage com TTL de 60 minutos.

---

## Item 4: Runtime Node 20

### Problema
README diz Node 18+, mas CI usa Node 20.

### Solução
Atualizar README e verificar package.json engines.

