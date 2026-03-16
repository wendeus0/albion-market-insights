# ADR-003 — Interface MarketService com feature flag para implementação

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

Durante o desenvolvimento, requisições frequentes à API real do Albion Online
(`west.albion-online-data.com`) causam rate limiting e dependência de conectividade.
Em testes automatizados, dados não-determinísticos da API real tornam assertions
instáveis. Era necessário um mecanismo para alternar entre dados reais e determinísticos
sem alterar código de componentes.

## Decisão

Definir a interface `MarketService` em `src/services/index.ts` com as operações:
`getItems()`, `getTopProfitable()`, `getLastUpdateTime()`, `getAlerts()`, `saveAlert()`,
`deleteAlert()`. Duas implementações concretas: `ApiMarketService` (`market.api.ts`) e
`MockMarketService` (`market.mock.ts`). A seleção da implementação é feita via variável
de ambiente `VITE_USE_REAL_API` — se definida e `true`, usa a API real; caso contrário,
usa o mock.

## Consequências

- Todos os hooks e componentes dependem de `marketService` (instância exportada),
  nunca das implementações concretas.
- Testes unitários mockam `@/services` diretamente, sem tocar a lógica de seleção.
- Ambiente de desenvolvimento padrão usa dados mock — evita consumo de quota da API.
- `VITE_USE_REAL_API=true` deve ser configurado explicitamente em produção.
- Adicionar novo endpoint requer atualização da interface e de ambas as implementações.

## Alternativas consideradas

- **Sempre usar API real:** não viável em testes; rate limiting bloqueia CI.
- **Mock em arquivo separado sem interface:** acoplamento direto — trocar implementação
  exigiria modificar todos os pontos de consumo.
- **MSW (Mock Service Worker):** válido para testes de integração E2E; escolhido apenas
  para E2E com Playwright; não adequado para desacoplamento de implementação em runtime.
