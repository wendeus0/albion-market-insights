# Análise: Próxima Janela Lógica de Trabalho

**Data:** 2026-03-19  
**Após:** Lote P0 ✅ e Lote 1A ✅ concluídos e mergeados  
**Status:** Codebase estável, sistema de alertas corrigido

---

## 📊 Panorama Atual

### ✅ Concluído Recentemente
- **Lote P0:** Indicador de fonte de dados, fallback explícito, dashboard focado em arbitragem
- **Lote 1A:** Sistema de alertas 100% funcional (notificações unificadas, contrato change corrigido, normalização de city)

### 🎯 Métricas Atuais
- **Testes:** 238+ passando
- **Cobertura:** ~86%
- **Build:** ✅ Estável
- **Débito Técnico:** Reduzido significativamente

---

## 🎯 Recomendação: Lote 1B — Consistência de Dados (P1)

**Por que este lote agora?**
- P0 e 1A focaram em **confiança de dados** e **funcionalidade de alertas**
- Agora é hora de **polir a consistência interna** antes de refatorações grandes
- Itens são **independentes** e **baixo risco**
- Preparam terreno para **Lote 2** (refatoração estrutural)

---

## 📋 Itens Propostos (Lote 1B)

### 1. Política Única de Frescor (15 min) ⚡ QUICK WIN
**Problema:** Cache TTL = 5min, staleTime = 15min, textos dizem "15 min"

**Solução:**
- Unificar tudo para 15 minutos
- Ou: Ajustar textos para refletir 5 minutos reais
- **Tempo:** 30 min
- **Impacto:** Clareza para usuário

### 2. ID Robusto para Alertas 🔒 QUICK WIN
**Problema:** `Date.now().toString()` pode colidir em cliques rápidos

**Solução:**
- Migrar para `crypto.randomUUID()`
- Fallback para `Date.now()` + random em browsers antigos
- **Tempo:** 45 min
- **Impacto:** Elimina colisões de ID

### 3. Cooldown de Alerta Persistente ⏱️ MÉDIO
**Problema:** Cooldown de notificação é apenas em memória (reseta no reload)

**Solução:**
- Persistir `lastFiredAt` no localStorage com TTL curto (60 min)
- Ao carregar, limpar entradas expiradas
- **Tempo:** 1h
- **Impacto:** Evita notificações duplicadas após reload

### 4. Runtime Node 20 📦 QUICK WIN
**Problema:** README diz Node 18+, CI usa Node 20

**Solução:**
- Atualizar README para Node 20+
- Verificar `package.json` engines
- **Tempo:** 15 min
- **Impacto:** Documentação alinhada com realidade

---

## 🥈 Alternativa: Lote 2 — Refatoração Estrutural

Se preferir avançar para refatoração:

### Prioridade 1: Extrair Regras da PriceTable
- Hook dedicado: `usePriceTableFilters`
- Hook dedicado: `usePriceTableSort`
- Hook dedicado: `usePriceTablePagination`
- **Tempo:** 4-6h
- **Benefício:** Componente menor, mais testável

### Prioridade 2: Layout Compartilhado
- Criar rota com layout em `App.tsx`
- Remover `<Layout>` de cada página
- **Tempo:** 2h
- **Benefício:** Menos repetição, melhor DX

---

## 🥉 Alternativa: Polish e UX

### Itens de Polish:
1. **Validação de filtros numéricos** - Detectar `min > max`
2. **Higiene de componentes shadcn/ui** - Remover não usados
3. **Documentação** - Atualizar ADRs, CONTEXT.md
4. **CI/CD** - Adicionar smoke E2E obrigatório

---

## 🎯 Recomendação Final

**Lote 1B: Consistência de Dados**

**Justificativa:**
1. Quick wins geram momentum
2. Preparam codebase para refatorações maiores
3. Itens são independentes (risco baixo)
4. Podem ser feitos em 1 dia
5. Deixam o sistema mais robusto

**Ordem de implementação:**
1. Política de frescor (30 min) — quick win
2. Runtime Node 20 (15 min) — quick win
3. ID robusto (45 min) — quick win
4. Cooldown persistente (1h) — mais complexo

---

## 📊 Matriz de Decisão

| Critério | Lote 1B | Lote 2 | Polish |
|----------|---------|--------|--------|
| Velocidade | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Impacto UX | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Risco | ⭐⭐⭐⭐⭐ (baixo) | ⭐⭐⭐ (médio) | ⭐⭐⭐⭐ (baixo) |
| Débito Técnico | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Prepara para Lote 2 | ⭐⭐⭐⭐ | — | ⭐⭐ |

---

## ✅ Status Pós-Lote 1A

```
Lote P0:  ████████████████████ 100% ✅
Lote 1A: ████████████████████ 100% ✅
Lote 1B: ░░░░░░░░░░░░░░░░░░░░ 0%   🔄 Próximo
Lote 2:  ░░░░░░░░░░░░░░░░░░░░ 0%   ⏳ Depois
```

**Sua decisão:**
- **A:** Lote 1B (consistência de dados) — 1 dia
- **B:** Lote 2 (refatoração estrutural) — 2-3 dias
- **C:** Polish/UX — 1-2 dias
- **D:** Outra coisa (especificar)

