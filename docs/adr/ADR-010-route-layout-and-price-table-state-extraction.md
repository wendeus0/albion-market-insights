# ADR-010: Layout compartilhado por rota e extração de estado local da PriceTable

## Status

- **Data**: 2026-03-20
- **Status**: Aprovado
- **Autor**: Wendel Duarte

## Contexto

O sprint do Lote 2 atacou dois pontos recorrentes de manutenção:

- páginas principais (`Index`, `Dashboard`, `Alerts`, `About`) instanciavam `Layout` manualmente, repetindo estrutura de casca da aplicação na camada errada;
- `PriceTable.tsx` concentrava filtros, persistência, ordenação e paginação no mesmo componente visual, dificultando testes focados e futuras mudanças incrementais.

O projeto já havia adotado a extração de responsabilidades no `AlertsManager` via hooks especializados (ADR-009). Faltava formalizar a mesma direção estrutural para componentes de dashboard e para a composição de rotas.

## Decisão

Adotamos duas convenções complementares:

### 1. Layout global compartilhado via rota-pai

- `src/App.tsx` define uma rota-pai com `AppLayout`
- `AppLayout` encapsula `Layout` + `Outlet`
- páginas sob essa casca passam a renderizar apenas o conteúdo da rota

### 2. Estado local complexo extraído para hooks dedicados

- componentes visuais permanecem responsáveis por composição e JSX
- regras de estado local com múltiplas responsabilidades devem ser extraídas para hooks focados
- no caso da `PriceTable`, o estado foi dividido em:
  - `usePriceTableFilters`
  - `usePriceTableSort`
  - `usePriceTablePagination`

## Consequências

### Positivas

- reduz duplicação estrutural nas páginas principais
- melhora testabilidade de regras antes escondidas em componentes grandes
- estabelece um padrão reaproveitável para futuras refatorações em componentes de dashboard
- aproxima o projeto de uma separação mais clara entre casca de aplicação, estado local e UI

### Negativas

- aumenta a quantidade de arquivos por feature/refatoração
- introduz mais indireção para leitura inicial do fluxo do componente
- exige disciplina para evitar abstração prematura em componentes simples

## Quando aplicar

- use rota-pai compartilhada quando várias páginas reutilizarem a mesma casca estrutural
- extraia hooks quando o componente misturar UI com múltiplas regras de estado/teste
- não extraia hooks para componentes pequenos sem sinais reais de acoplamento ou repetição

## Alternativas consideradas

### 1. Manter `Layout` manual em cada página

- **Rejeitado**: mantém duplicação e torna mudanças globais mais frágeis

### 2. Extrair toda a `PriceTable` para um único hook monolítico

- **Rejeitado**: apenas moveria o acoplamento para outro arquivo

### 3. Mover estado da `PriceTable` para Context API

- **Rejeitado**: o estado continua local ao componente e não precisa ser compartilhado globalmente

## Referências

- `docs/adr/ADR-009-alerts-manager-hooks-extraction.md`
- `src/components/layout/AppLayout.tsx`
- `src/hooks/usePriceTableFilters.ts`
- `src/hooks/usePriceTableSort.ts`
- `src/hooks/usePriceTablePagination.ts`
