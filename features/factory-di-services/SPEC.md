# SPEC — Factory/DI para Serviços

**Status:** Draft
**Data:** 2026-03-21
**Autor:** Claude
**Débito:** P2 estrutural — reduzir acoplamento de selector por singleton em import-time

---

## Contexto e Motivação

O projeto atual usa um padrão de **singleton em import-time** para o serviço de mercado:

```typescript
// src/services/index.ts
export const marketService: MarketService =
  import.meta.env.VITE_USE_REAL_API === "true"
    ? new ApiMarketService()
    : new MockMarketService();
```

`ApiMarketService` instancia diretamente suas dependências (`AlertStorageService`, `MockMarketService`) dentro da classe. Isso gera:

1. **Acoplamento forte** — implementações concretas hardcoded nas classes
2. **Testabilidade limitada** — não é possível injetar mocks sem modificar o código
3. **Decisão estática** — service escolhido no import, não configurável em runtime

## Problema a Resolver

- `ApiMarketService` instancia `AlertStorageService` e `MockMarketService` diretamente
- `MockMarketService` instancia `AlertStorageService` diretamente
- Não há inversão de controle — dependências não são injetáveis

## Fora do Escopo

- Alterar a interface `MarketService`
- Modificar consumidores de `marketService` (hooks, componentes)
- Introduzir container de DI complexo (Inversify, tsyringe, etc.)
- Adicionar configuração de ambiente em runtime

## Critérios de Aceite

### AC-1: Injeção de dependências em ApiMarketService

**Given** que `ApiMarketService` precisa de `AlertStorageService` e `MarketService` (fallback)
**When** instanciamos via factory
**Then** as dependências devem ser injetadas via construtor, não instanciadas internamente

### AC-2: Injeção de dependências em MockMarketService

**Given** que `MockMarketService` precisa de `AlertStorageService`
**When** instanciamos via factory
**Then** a dependência deve ser injetada via construtor

### AC-3: Factory function para criação de serviços

**Given** que precisamos de uma forma centralizada de criar serviços
**When** chamamos `createMarketService(config)`
**Then** retorna a implementação correta (`ApiMarketService` ou `MockMarketService`) com dependências injetadas

### AC-4: Testes unitários com mocks injetados

**Given** que uma implementação concreta de `MarketService`
**When** testamos o serviço
**Then** podemos injetar mocks de `AlertStorageService` diretamente no construtor

### AC-5: Compatibilidade com código existente

**Given** que o código atual importa `marketService` de `@/services`
**When** a refatoração for concluída
**Then** `import { marketService } from '@/services'` continua funcionando

## Dependências

- Nenhuma nova dependência externa
- Interfaces existentes em `src/services/market.service.ts`

## Riscos e Incertezas

- Mudança em classes que já têm testes — regressão possível
- Necessidade de exportar factoriesmas manter singleton para compatibilidade

## Referências

- `src/services/index.ts` — singleton atual
- `src/services/market.api.ts` — dependências hardcoded
- `src/services/market.mock.ts` — dependência hardcoded
- MEMORY.md — P2 estrutural: Factory/DI para serviços
