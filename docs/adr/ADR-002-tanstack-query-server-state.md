# ADR-002 — TanStack Query para gerenciamento de estado de servidor

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

O dashboard consome dados de mercado que precisam de: cache com tempo de expiração
configurável, re-fetch em background, deduplicação de requisições simultâneas, estados
de loading/error/success por query, e invalidação manual após mutações (salvar/deletar
alerta). React state simples com `useEffect` tornaria essa lógica repetitiva e propensa
a race conditions.

## Decisão

Usar TanStack Query v5 como camada de gerenciamento de estado de servidor. Toda
comunicação com `MarketService` passa por `useQuery` ou `useMutation`. O `QueryClient`
é configurado em `src/main.tsx` com staleTime e gcTime globais. Nenhum estado de servidor
é mantido via `useState` ou Context API.

## Consequências

- Hooks como `useMarketItems`, `useTopProfitable`, `useAlerts` encapsulam `useQuery`
  com chaves estáveis.
- Cache sobrevive a remontagens de componente (comportamento padrão do QueryClient).
- Invalidação de cache após salvar/deletar alerta garante consistência automática.
- Devtools do TanStack Query disponíveis em desenvolvimento para inspeção do cache.
- Dependência de `@tanstack/react-query` v5 — breaking changes futuros podem exigir
  migração dos hooks.

## Alternativas consideradas

- **SWR:** API mais simples, mas sem suporte nativo a mutations/invalidation no nível
  necessário para o padrão alerta→save→refresh.
- **Redux Toolkit Query:** robusto, mas adiciona Redux ao bundle — overhead desnecessário
  para um dashboard sem estado global complexo.
- **`useEffect` + `useState` manual:** funciona para casos simples, mas a lógica de
  cache, retry e deduplicação teria que ser reimplementada em cada hook.
