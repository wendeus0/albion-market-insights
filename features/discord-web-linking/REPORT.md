---
feature: discord-web-linking
status: READY_FOR_COMMIT
created: 2026-03-30
---

# REPORT — Vinculação de Discord pelo fluxo web

## Objetivo da mudança

Remover o bot do caminho crítico de vinculação inicial do Discord, usando a sessão OAuth já existente para sincronizar o vínculo no perfil e expor estados claros no `/profile` sobre vínculo, DM habilitada, pendência e conflito de troca.

## Escopo alterado

- extração de identidade Discord da sessão em `src/lib/discordAuth.ts`
- sincronização automática de `discord_id`, `discord_username` e `discord_dm_enabled` em `src/hooks/useProfile.ts`
- atualização da UX de vínculo no perfil em `src/pages/Profile.tsx`
- testes da frente em:
  - `src/test/useProfile.discord-web-linking.red.test.tsx`
  - `src/test/Profile.discord-web-linking.red.test.tsx`
- artefatos da frente em:
  - `features/discord-web-linking/SPEC.md`
  - `features/discord-web-linking/VIABILITY_CHECK.md`
  - `features/discord-web-linking/VIABILITY_RESULT.md`

## Validações executadas

### code-review

- `REVIEW_OK_WITH_NOTES`
- nota: o estado de troca pendente está visível na UI, mas a ação confirmatória ainda não executa a substituição real do vínculo; aceitável neste recorte, desde que tratado como follow-up explícito se a troca efetiva entrar no próximo ciclo

### quality-gate

- `QUALITY_PASS_WITH_GAPS`
- checks executados:
  - `npm run lint` ✅
  - `npm run typecheck` ✅
  - `npm run test -- --coverage` ✅ (`497/497` testes)
  - `npm run build` ✅
- gap não bloqueante:
  - warning de chunk grande no build (`index` > 500 kB minificado) permaneceu; não é regressão confirmada desta frente, mas continua como observação técnica

### security-review

- `EXECUTED (SECURITY_PASS_WITH_NOTES)`
- nota: a sincronização do vínculo confia em metadata de sessão do Supabase/Discord (`provider_id`/`sub`) no cliente; aceitável porque a sessão é emitida pelo provedor autenticado e o fluxo não sobrescreve vínculo existente silenciosamente, mas a identidade primária deve continuar restrita a campos provider-bound
- nota: o fluxo ainda não implementa a confirmação efetiva de troca; isso reduz risco imediato de overwrite indevido, mas a futura ação de substituição exigirá revisão específica antes de merge do próximo recorte

## Riscos residuais

- A ação de confirmar troca ainda não substitui o vínculo salvo → o usuário vê estado de troca pendente, mas a troca efetiva depende de follow-up
- A habilitação de DM é contratual no produto, não prova de entrega final pelo Discord runtime → possível expectativa de sucesso sem validação operacional do canal
- Warning de chunk grande no build permanece → possível impacto contínuo em performance de carregamento do bundle principal
- Arquivos fora do recorte principal permanecem sujos no working tree (`.pi/`, `docs/council/`, migration Supabase anterior) → risco de incluir artefatos ou mudanças paralelas no commit sem triagem final

## Follow-ups

- implementar a ação confirmatória real para substituição de vínculo quando este recorte evoluir
- decidir se `docs/council/` entra no commit da feature ou fica apenas como artefato de decisão local
- excluir do commit os artefatos fora do escopo imediato (`.pi/` e migration Supabase não relacionada a esta frente) antes do `git-flow-manager`

## Status final da frente

`READY_FOR_COMMIT`
