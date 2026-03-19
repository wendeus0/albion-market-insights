# SPEC — Lote 1B: Consistência de Dados

**Data:** 2026-03-19  
**Branch:** `feat/lote-1b-item3-cooldown-persistente`  
**Status:** Item 3 em desenvolvimento

---

## Progresso do Lote

| Item | Descrição                          | Status                                                 |
| ---- | ---------------------------------- | ------------------------------------------------------ |
| 1    | Política única de frescor (15 min) | ✅ Concluído via `DATA_FRESHNESS_MS`                   |
| 2    | ID robusto para alertas            | ✅ Concluído via `useAlertsForm`                       |
| 3    | Cooldown de alerta persistente     | ✅ **CONCLUÍDO** — implementado em `useAlertPoller.ts` |
| 4    | Runtime padronizado em Node 20     | ⏳ Pendente                                            |

---

## Item 3: Cooldown de Alerta Persistente

### Contexto

Os itens 1 e 2 foram concluídos em features anteriores. O hook `useAlertsForm` (PR #42) já implementa geração de ID robusto. Esta SPEC foca exclusivamente no Item 3.

### Problema

`lastFiredAt` em `useAlertPoller` é apenas em memória. Reseta no reload da página, permitindo que o mesmo alerta dispare novamente imediatamente após refresh.

### Solução

Persistir o estado de cooldown no localStorage com TTL de 60 minutos por alerta.

### Critérios de Aceite

**AC-1: Serviço de cooldown persistente**
DADO que um alerta dispara
QUANDO o sistema registra o cooldown
ENTÃO o timestamp é persistido no localStorage com TTL de 60 min

**AC-2: Hook useAlertPoller integra cooldown persistente**
DADO que `useAlertPoller` verifica se um alerta pode disparar
QUANDO consulta o cooldown
ENTÃO verifica primeiro o localStorage, depois a memória

**AC-3: TTL de cooldown respeitado**
DADO um cooldown persistido há mais de 60 min
QUANDO o sistema verifica se pode disparar
ENTÃO o cooldown é considerado expirado

**AC-4: Migração transparente**
DADO que não existe cooldown persistido para um alerta
QUANDO o sistema inicia
ENTÃO comportamento fallback para memória (como antes)

**AC-5: Limpeza de cooldowns expirados**
DADO múltiplos cooldowns persistidos
QUANDO alguns estão expirados
ENTÃO são automaticamente removidos do localStorage

### Arquitetura

**Novo serviço:** `src/services/alertCooldown.storage.ts`

- `saveCooldown(alertId: string): void` — persiste timestamp com TTL
- `getCooldown(alertId: string): number | null` — retorna timestamp se válido
- `isInCooldown(alertId: string): boolean` — verifica se está em cooldown
- `clearExpiredCooldowns(): void` — limpa entradas expiradas
- `clearAllCooldowns(): void` — limpa todos (útil para testes)

**Hook modificado:** `src/hooks/useAlertPoller.ts`

- Integra `alertCooldown.storage` nas verificações de cooldown
- Mantém compatibilidade com comportamento existente

### Testes

- Testes unitários para `alertCooldown.storage.ts` (validação, TTL, expiração)
- Testes de integração para `useAlertPoller` com cooldown persistido
- Testes de migração (cenário sem dados persistidos)
