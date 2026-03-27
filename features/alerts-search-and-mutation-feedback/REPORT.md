---
id: alerts-search-and-mutation-feedback
type: report
status: ready_for_review
created: 2026-03-27
updated: 2026-03-27
---

# REPORT — Busca de Alertas e Feedback de Mutação

## Escopo Entregue

- isolamento do cache de alertas por sessão/usuário autenticado
- limpeza explícita do cache ao alternar entre storage local e Supabase
- busca de itens no formulário por tokens de nome, tier, quality e encantamento
- persistência de `quality` no contrato do alerta
- indicação visual explícita de encantamento nas opções da busca

## Implementação

- `quality` foi adicionada ao contrato e à persistência dos alertas
- a query de alertas deixou de usar chave global estática e passou a ser segmentada por usuário
- o fluxo de auth agora remove queries antigas ao trocar a origem de storage
- o seletor de item aceita filtros compostos como `carving t4 masterpiece`
- variantes do mesmo item podem coexistir por `itemId + quality`

## Validação

- `npm run quality:gate` OK
- suíte verde: `52/52` arquivos, `468/468` testes
- migration incremental aplicada para `alerts.quality`
- validação manual confirmou que, após limpeza do cache local, alertas fantasmas não reaparecem
- validação manual confirmou coexistência de dois alertas reais para jackets sem sobrescrita indevida

## Evidências Relevantes

- query key por usuário em `src/hooks/useAlerts.ts`
- troca de storage com limpeza de cache em `src/hooks/useAuthSync.ts`
- busca tokenizada e badge de encantamento em `src/components/alerts/AlertsManager.tsx`
- migration incremental em `supabase/migrations/20260327_alerts_add_quality.sql`

## Pendências Conhecidas

- a busca por encantamento ainda depende da qualidade do dataset disponível no ambiente
- no mock local, muitos itens não carregam encantamento real no `itemId`, o que limita a evidência visual dessa dimensão
- a validação final dessa parte deve ocorrer no preview da Cloudflare com dataset mais próximo do real
