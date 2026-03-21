# ADR-003 — Interface MarketService com feature flag para implementação

Status: Aceito
Data: 2026-03-16
Última revisão: 2026-03-20

## Contexto

O projeto precisa operar em dois modos:
- Modo determinístico para testes e desenvolvimento sem dependência de conectividade.
- Modo de dados reais via API pública do Albion Online.

Sem um contrato único de serviço, componentes e hooks ficariam acoplados à implementação concreta (API ou mock), dificultando testes, evolução e controle operacional.

## Decisão

Definir um contrato `MarketService` e consumir sempre a instância `marketService` exportada por `src/services/index.ts`, sem import direto de implementações concretas nos componentes.

Implementações:
- `ApiMarketService` (`market.api.ts`)
- `MockMarketService` (`market.mock.ts`)

Seleção de implementação:
- Variável `VITE_USE_REAL_API=true` usa API real
- Ausente/falso usa mock

## Consequências

- Hooks e componentes ficam desacoplados da origem de dados.
- Testes continuam mockando `@/services` no ponto único de entrada.
- Desenvolvimento padrão permanece determinístico com mock.
- Produção pode habilitar API real explicitamente.
- Novos endpoints exigem evolução coordenada do contrato e das implementações.

## Relação com runtime/CI

A decisão de contrato por interface reduz risco de mudanças de runtime (Node 20/24), porque o comportamento funcional fica menos dependente do mecanismo de transporte de dados na borda da aplicação.

## Alternativas consideradas

- Sempre API real: maior risco de flakiness/rate limit e menor determinismo em testes.
- Sem interface (imports diretos): acoplamento alto e custo maior de manutenção.
- MSW como única estratégia: útil para testes, mas não substitui contrato de serviço em runtime.

