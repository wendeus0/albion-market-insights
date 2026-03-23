# SPEC — Auto-refresh no Dashboard com remoção de refresh manual

Status: Approved
Owner: Hermes Agent
Data: 2026-03-23

## Contexto

O dashboard ainda depende de botão manual de refresh, o que incentiva chamadas repetidas e desnecessárias.
Há decisão prévia no backlog para migrar para atualização automática com indicador temporal.

## Objetivo

Substituir o refresh manual por auto-refresh periódico e indicador textual de recência da atualização.

## Escopo

- Remover botão "Refresh Data" do header do Dashboard.
- Ativar auto-refresh no Dashboard usando intervalo fixo de 15 minutos (alinhado à política única de frescor).
- Exibir indicador textual no header ao lado do DataSourceBadge:
  - Syncing... (enquanto loading)
  - Awaiting first sync (sem timestamp ainda)
  - Updated just now (< 1 min)
  - Updated X min ago (>= 1 min e < 60 min)
  - Updated Xh ago (>= 60 min)

## Não-escopo

- Alterar semântica de cache TTL/staleTime global.
- Criar polling agressivo (intervalos menores que 10 min).
- Introduzir controle de intervalo configurável em UI.

## Decisões

1. Intervalo: 15 minutos (DATA_FRESHNESS_MS).
2. Modo de atualização: React Query `refetchInterval` na página Dashboard.
3. Sem botão de refresh manual nesta tela.

## Critérios de Aceite

AC-1: Dashboard não renderiza botão manual de refresh.
AC-2: Dashboard configura auto-refresh em `useMarketItems` e `useLastUpdateTime` com `refetchInterval=DATA_FRESHNESS_MS`.
AC-3: Indicador de recência é exibido no header ao lado do `DataSourceBadge`.
AC-4: Estados do indicador cobrem loading, ausência de timestamp e recência relativa.
AC-5: Suíte de testes da página passa com quality gate intacto.

## Estratégia de Teste

- Atualizar `src/pages/Dashboard.test.tsx` para validar:
  - ausência de botão manual
  - configuração de auto-refresh nos hooks
  - mensagens do indicador temporal
- Rodar:
  - `npm run test -- src/pages/Dashboard.test.tsx`
  - `npm run quality:gate`

## Riscos e trade-offs

- Trade-off UX: perde ação manual imediata, ganha previsibilidade e menos abuso de API.
- Risco de percepção de atraso mitigado por indicador textual claro de recência.

