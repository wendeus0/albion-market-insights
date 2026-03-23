# SPEC — Higiene de componentes vendor UI (round 2)

Status: Approved
Owner: Hermes Agent
Data: 2026-03-23

## Contexto

O backlog ativo prioriza uma nova janela de higiene em `src/components/ui/*` para reduzir ruído de manutenção e acoplamento desnecessário, preservando comportamento de produção.

Há sinais de arquivos utilitários internos sem import direto no código-fonte (`badge.utils`, `button.utils`, `form.hooks`, `sonner.utils`, `tooltip.utils`) que podem ser candidatos a pruning ou consolidação.

## Objetivo

Executar pruning incremental e seguro de módulos UI sem uso direto, com validação de regressão completa e atualização documental da frente.

## Escopo

- Mapear uso direto de módulos em `src/components/ui/*`.
- Adicionar testes de proteção para contratos críticos antes de qualquer remoção.
- Remover somente arquivos comprovadamente sem uso direto e sem necessidade de separação arquitetural.
- Ajustar imports locais quando necessário para manter coesão.
- Atualizar documentação da frente e PENDING_LOG.

## Não-escopo

- Reescrever componentes de negócio (Dashboard, Alerts, PriceTable).
- Alterar comportamento visual/funcional da UI em produção.
- Introduzir nova biblioteca de UI ou troca de Radix/Shadcn.

## Decisões

1. Pruning será estritamente incremental (remoção de baixo risco primeiro).
2. Utilitários que são apenas re-export interno de dependência externa e não têm import direto serão removidos.
3. Helpers internos com papel estrutural podem ser mantidos se a remoção reduzir legibilidade ou aumentar acoplamento acidental.

## Critérios de Aceite

AC-1: `features/higiene-vendor-ui-round-2/COMPONENTS_USAGE.md` atualizado com mapa de uso.
AC-2: Arquivos sem uso direto e de baixo risco removidos sem regressão.
AC-3: Testes de proteção adicionados/ajustados antes da remoção para contratos críticos impactados.
AC-4: `npm run lint`, `npm run typecheck`, `npm run test -- --coverage` e `npm run build` verdes.
AC-5: `PENDING_LOG.md` atualizado com escopo, evidências e impacto.

## Estratégia de Teste (TDD)

- RED: adicionar teste que valida o contrato de export do `toast` via `@/components/ui/sonner` (evita quebra silenciosa no pruning).
- GREEN: ajustar implementação para passar teste com menor mudança possível.
- REFACTOR: remover `sonner.utils.ts` e consolidar export no módulo principal.

Execução:
- `npm run test -- src/test/ui.sonner.contract.test.ts`
- `npm run lint`
- `npm run typecheck`
- `npm run test -- --coverage`
- `npm run build`

## Riscos e trade-offs

- Risco: remover arquivo utilitário ainda referenciado por import relativo interno.
  - Mitigação: mapeamento automatizado + busca por imports relativos + testes de contrato.
- Trade-off: manter alguns arquivos "sem uso direto" quando representam boundary interno útil (ex.: separação de hooks/contexto de form).

