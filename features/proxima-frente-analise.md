# Análise: Próxima Frente de Trabalho

**Data:** 2026-03-19  
**Baseado em:** PENDING_LOG.md, QUESTIONS.md (Q01-Q70), ANALYSIS_REPORT.md  
**Após:** Conclusão do Lote P0

---

## 🎯 Recomendação Principal

### **Lote 1A: Correções de Alertas e Notificações** (P1 - Alto Impacto)

**Racional:** O sistema de alertas tem bugs de produto que afetam diretamente a experiência do usuário e a confiabilidade das notificações.

#### Itens Prioritários:

1. **Contrato de alerta `change` (Q07)** ⚠️ CRÍTICO
   - **Problema:** UI promete "price change" mas engine dispara com `spreadPercent`
   - **Impacto:** Usuário recebe alertas incorretos
   - **Complexidade:** Média (requer mudança em schema + engine)
   - **Arquivos:** `alert.engine.ts`, `AlertsManager.tsx`, `schemas.ts`

2. **Unificação de notificações (Q14)** 🔥 ALTO
   - **Problema:** Dois sistemas de toast coexistem (`useToast` + Sonner)
   - **Impacto:** Inconsistência visual, comportamento imprevisível
   - **Complexidade:** Baixa (refatoração de imports)
   - **Arquivos:** `App.tsx`, `use-toast.ts`, `useAlertPoller.ts`

3. **Respeitar `notifications.inApp` (Q10)** 🔥 ALTO
   - **Problema:** Poller ignora preferência do usuário
   - **Impacto:** Usuário recebe notificações mesmo desabilitando
   - **Complexidade:** Baixa (1 condição no poller)
   - **Arquivos:** `useAlertPoller.ts`

4. **Normalização de `alert.city` (Q08, Q44)** ⚠️ MÉDIO
   - **Problema:** `"all"` vs `"All Cities"` inconsistência entre form/persistência/engine
   - **Impacto:** Comportamento imprevisível em alertas cross-city
   - **Complexidade:** Média (mudança de contrato)
   - **Arquivos:** `AlertsManager.tsx`, `alert.engine.ts`, `schemas.ts`

**Estimativa:** 1-2 dias de trabalho  
**Testes:** 15-20 testes novos  
**Impacto UX:** ⭐⭐⭐⭐⭐ (resolve bugs reais de usuário)

---

## 🥈 Alternativa: Lote 1B - Consistência de Dados

Se preferir foco técnico/arquitetural antes de bugs de UX:

#### Itens:

1. **Política única de frescor (15 min)**
   - Alinhar TTL cache (5min), staleTime (15min), textos UI
   - **Complexidade:** Baixa
   - **Impacto:** Clareza para usuário

2. **ID robusto para alertas**
   - Migrar de `Date.now()` para `crypto.randomUUID()`
   - **Complexidade:** Baixa
   - **Impacto:** Previne colisões raras

3. **Cooldown de alerta persistente**
   - TTL no localStorage para sobreviver a reload
   - **Complexidade:** Média (novo serviço similar ao refreshCooldown)

---

## 🥉 Lote 2 - Refatoração Estrutural

**Para quando:** Lote 1A/B concluído e estabilidade de alertas garantida

#### Prioridade:

1. **Extrair regras da `PriceTable`**
   - Hook dedicado para filtros/sort/paginação
   - **Benefício:** Componente menor, testável, reutilizável
   - **Complexidade:** Alta (muita lógica acoplada)

2. **Extrair regras da `AlertsManager`**
   - Similar ao acima
   - **Complexidade:** Média-Alta

---

## 📊 Matriz de Decisão

| Critério | Lote 1A (Alertas) | Lote 1B (Dados) | Lote 2 (Refatoração) |
|----------|-------------------|-----------------|---------------------|
| Impacto UX | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Complexidade | Média | Baixa | Alta |
| Risco de Bug | Baixo | Baixo | Médio |
| Débito Técnico | Médio | Baixo | Alto |
| Velocidade | Rápido | Rápido | Lento |

---

## ✅ Minha Recomendação

**Vá com Lote 1A (Alertas e Notificações)**

**Justificativa:**
1. Bugs de alerta afetam funcionalidade core do produto
2. Usuário configura alerta esperando X e recebe Y = insatisfação
3. Dois sistemas de toast causam confusão visual
4. São mudanças isoladas, fáceis de testar
5. Prepara terreno para refatorações maiores (Lote 2)

**Ordem de implementação:**
1. Unificação de notificações (quick win)
2. Respeitar `notifications.inApp` (quick win)
3. Normalização de `alert.city` (contrato)
4. Contrato de alerta `change` (schema + engine)

---

## 📋 Próximos Passos Imediatos

Se aprovado Lote 1A:

1. Criar SPEC para "unificação de notificações"
2. Implementar com TDD
3. Criar SPEC para "correção de alerta change"
4. Implementar com TDD
5. Quality gate completo

**Tempo estimado total:** 1.5-2 dias  
**Entrega:** Sistema de alertas funcional e confiável

---

*Análise gerada por Hermes Agent após conclusão do Lote P0*

