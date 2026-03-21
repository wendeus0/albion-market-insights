# ADR-012 — Factory com injeção de dependências para serviços

Status: Aceito
Data: 2026-03-21

## Contexto

O ADR-003 definiu a interface `MarketService` com seleção de implementação via variável de ambiente. O padrão original usava singleton em import-time:

```typescript
// src/services/index.ts (antes)
export const marketService: MarketService =
  import.meta.env.VITE_USE_REAL_API === "true"
    ? new ApiMarketService()
    : new MockMarketService();
```

As implementações (`ApiMarketService`, `MockMarketService`) instanciavam dependências internamente:

- `ApiMarketService` criava `AlertStorageService` e `MockMarketService` internamente
- `MockMarketService` criava `AlertStorageService` internamente

Isso gerava:

- Acoplamento forte entre implementações concretas
- Testabilidade limitada (não era possível injetar mocks)
- Decisão estática em tempo de import

## Decisão

Introduzir factory function com injeção de dependências (DI):

1. **Construtores aceitam dependências** com valores default:

   ```typescript
   // ApiMarketService
   constructor(
     private storage: AlertStorageService = new AlertStorageService(),
     private fallback: MarketService = new MockMarketService()
   ) {}

   // MockMarketService
   constructor(
     private storage: AlertStorageService = new AlertStorageService()
   ) {}
   ```

2. **Factory function centraliza criação**:

   ```typescript
   // src/services/factory.ts
   export function createMarketService(
     config?: MarketServiceConfig,
   ): MarketService {
     const storage = config?.storage ?? new AlertStorageService();
     if (config?.useRealApi ?? import.meta.env.VITE_USE_REAL_API === "true") {
       return new ApiMarketService(
         storage,
         config?.fallback ?? new MockMarketService(storage),
       );
     }
     return new MockMarketService(storage);
   }
   ```

3. **Singleton mantido para retrocompatibilidade**:
   ```typescript
   // src/services/index.ts
   export { createMarketService } from "./factory";
   export const marketService: MarketService = createMarketService();
   ```

## Consequências

### Positivas

- Testes unitários podem injetar mocks diretamente no construtor
- Factory permite configuração explícita de dependências
- Retrocompatibilidade: `import { marketService }` continua funcionando
- Menor acoplamento entre implementações concretas

### Negativas

- Construtores com valores default podem mascarar dependências implícitas
- Factory adicional no código (baixo overhead)

## Relação com outros ADRs

- **ADR-003**: Estende o padrão de interface com DI
- **ADR-006**: TypeScript strict mode garante tipagem das dependências

## Alternativas consideradas

- **Container de DI (Inversify, tsyringe)**: Overkill para o tamanho do projeto
- **Service Locator**: Menos explícito que a factory
- **Manter singleton em import-time**: Não permitiria testes com mocks injetados
