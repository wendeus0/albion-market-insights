# SPEC — Lote P0: Correções Críticas de Confiança de Dados

**Data:** 2026-03-19  
**Branch:** `feat/lote-p0-correcoes-criticas`  
**Autor:** Hermes Agent  
**Status:** Em implementação

---

## 1. Resumo Executivo

Este lote consolida **6 correções críticas** identificadas na triagem arquitetural (2026-03-19). O foco é aumentar a **confiança do usuário nos dados** e corrigir bugs de comportamento que podem levar a decisões de negócio incorretas.

---

## 2. Itens do Lote

### Item 1: Indicador de Modo de Dados (Data Source Badge)
**ID:** P0-001  
**Problema:** Usuário não sabe se está vendo dados reais ou mockados  
**Solução:** Badge visual indicando `Real` | `Mock` | `Degraded`  
**Critérios de Aceitação:**
- [ ] AC-1: Badge visível em `Index` e `Dashboard`
- [ ] AC-2: Cores: verde (Real), amarelo (Mock), vermelho (Degraded)
- [ ] AC-3: Tooltip explicando o significado
- [ ] AC-4: Testes unitários para 3 estados

### Item 2: Fallback Explícito (sem silêncio)
**ID:** P0-002  
**Problema:** API falha → cai silenciosamente para mock  
**Solução:** Em produção, exibir estado degradado com motivo  
**Critérios de Aceitação:**
- [ ] AC-1: Modo `VITE_USE_REAL_API=true` nunca usa mock silencioso
- [ ] AC-2: Em erro, exibir banner/warning na UI
- [ ] AC-3: Modo dev/test pode manter fallback para facilitar desenvolvimento
- [ ] AC-4: Testes de integração para cenário de falha

### Item 3: Clear All Transacional
**ID:** P0-003  
**Problema:** `clearAllFilters()` seta `shouldPersist` para `false` permanentemente  
**Solução:** Limpar estado + storage de forma transacional  
**Critérios de Aceitação:**
- [ ] AC-1: `Clear All` limpa memória e localStorage
- [ ] AC-2: Novos filtros após clear continuam persistindo
- [ ] AC-3: Não há regressão de comportamento
- [ ] AC-4: Testes cobrindo ciclo completo

### Item 4: Fonte Correta de Last Update
**ID:** P0-004  
**Problema:** `cachedLastUpdate` nasce com `new Date()` mesmo antes do fetch  
**Solução:** Exibir apenas timestamp real do último fetch bem-sucedido  
**Critérios de Aceitação:**
- [ ] AC-1: `Last Update` só aparece após fetch real
- [ ] AC-2: Valor inicial é `null`/`undefined`, não data atual
- [ ] AC-3: Formatação amigável ("2 minutos atrás")
- [ ] AC-4: Testes para estado inicial e após fetch

### Item 5: Dashboard Foco Único em Arbitragem
**ID:** P0-005  
**Problema:** Aba `Local Spread` mostra métricas placeholder/misleading  
**Solução:** Remover aba e focar apenas em `Cross-City Arbitrage`  
**Critérios de Aceitação:**
- [ ] AC-1: Aba `Local Spread` removida
- [ ] AC-2: Layout ajustado sem quebrar responsividade
- [ ] AC-3: `StatsCard` de "Local Opportunities" removido ou atualizado
- [ ] AC-4: Testes E2E atualizados

### Item 6: Indicador de Cooldown de Refresh
**ID:** P0-006  
**Problema:** Usuário pode spammar refresh manual sem saber do cooldown  
**Solução:** Mostrar tempo restante e desabilitar botão durante cooldown  
**Critérios de Aceitação:**
- [ ] AC-1: Botão de refresh desabilitado durante cooldown (5 min)
- [ ] AC-2: Tooltip/contador mostrando tempo restante
- [ ] AC-3: Persistência do timestamp de último refresh (localStorage)
- [ ] AC-4: Testes para comportamento de cooldown

---

## 3. Escopo

### Incluído
- Alterações em `services/`, `hooks/`, `components/dashboard/`, `pages/`
- Testes unitários e E2E
- Documentação de ADR se necessário

### Excluído
- Alterações em `components/ui/` (shadcn/ui)
- Mudanças arquiteturais profundas (DI, factory)
- Novas features (apenas correções)

---

## 4. Critérios de Aceitação Globais

1. Todos os 6 itens implementados
2. `npm run lint && npm run build` passando
3. Cobertura de testes não diminui (manter ≥86%)
4. Testes E2E passando
5. Sem `console.log` em código de produção
6. Documentação atualizada se necessário

---

## 5. Plano de Implementação

### Fase 1: Setup e Infraestrutura
1. Criar `DataSourceBadge` component
2. Criar hook `useDataSource()`
3. Modificar `market.api.ts` para expor estado de erro

### Fase 2: Correções de UI
4. Integrar badge em `Index` e `Dashboard`
5. Implementar tratamento de erro explícito
6. Corrigir `Clear All` transacional

### Fase 3: Correções de Lógica
7. Corrigir `Last Update` timestamp
8. Remover aba `Local Spread`
9. Implementar cooldown de refresh

### Fase 4: Testes e Validação
10. Testes unitários para novos componentes/hooks
11. Testes E2E atualizados
12. Quality gate completo

---

## 6. Dependências

- Nenhuma dependência externa nova
- Usar apenas stack existente (React, Tailwind, shadcn/ui)

---

## 7. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Mudança de comportamento inesperada | Testes E2E abrangentes |
| Quebra de layout | Validar responsividade em múltiplos viewports |
| Performance | Manter code-splitting, não adicionar bundles grandes |

---

## 8. Definição de Pronto (DoD)

- [ ] SPEC revisada e aprovada
- [ ] Código implementado com TDD
- [ ] Lint e build passando
- [ ] Testes unitários ≥90% para novos módulos
- [ ] Testes E2E passando
- [ ] Code review interno (self-review)
- [ ] Sem console.log/warn/error
- [ ] Documentação atualizada (se aplicável)
- [ ] PR criado e pronto para revisão

---

*SPEC criada seguindo workflow AGENTS.md*

