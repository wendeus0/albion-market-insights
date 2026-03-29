---
feature: discord-oauth-bot
status: READY_FOR_COMMIT
created: 2026-03-29
---

# REPORT — Discord OAuth e Bot de Notificacoes

## Objetivo da Mudança

Substituir o login por email/senha por Discord OAuth, adicionar callback dedicado,
permitir vinculacao do perfil com o bot via link magico e preparar o fluxo de notificacao
por DM com fallback para webhook.

## Escopo Alterado

- login OAuth via Discord em `src/contexts/AuthContext.tsx`, `src/contexts/auth.context.ts`, `src/pages/Login.tsx`, `src/pages/AuthCallback.tsx` e `src/App.tsx`
- extensao do perfil e da tipagem de usuario em `src/hooks/useProfile.ts`, `src/data/types.ts`, `src/pages/Profile.tsx` e `src/hooks/useDiscordLink.ts`
- Edge Function e migration de suporte em `supabase/functions/generate-discord-link/index.ts` e `supabase/migrations/20260329_discord_oauth_bot.sql`
- integracao de notificacao em `src/services/alert.notifications.ts` e `src/hooks/useAlertPoller.ts`
- bot MVP em `bot/` com comandos `/register` e `/alerts list`
- cobertura de testes para OAuth, callback, perfil, polling e contrato SQL

## Validações executadas

### code-review

- `REVIEW_OK`
- revisao editorial do diff sem achados bloqueantes ou melhorias obrigatorias

### quality-gate

- `QUALITY_PASS`
- `npm run quality:gate` verde
- `54/54` arquivos de teste passando
- `481/481` testes passando
- build de producao do frontend concluida com sucesso

### security-review

- `EXECUTED (SECURITY_PASS_WITH_NOTES)`
- nota: `bot/` herda vulnerabilidades transitivas de `discord.js -> undici`; nao bloqueia o MVP, mas requer acompanhamento antes de hardening de producao
- nota: `supabase/functions/generate-discord-link/index.ts` mantem CORS aberto; aceitavel com JWT obrigatorio, ideal restringir quando o dominio final estiver estabilizado
- nota: `bot/src/supabase.ts` usa `SUPABASE_SERVICE_KEY`; segredo deve permanecer apenas no servidor

### deploy

- Edge Function `generate-discord-link` publicada no projeto `ubxwoictayqssadvtfkh`
- migration remota aplicada com `supabase db push`
- build local do bot concluido com `npm run build` em `bot/`

## Riscos residuais

- `discord.js` com advisories transitivos em `undici` → possivel exposicao a falhas conhecidas ate atualizacao do ecossistema
- CORS aberto na Edge Function → superficie maior para chamadas cross-origin, embora ainda protegida por JWT valido
- bot ainda nao validado em runtime no servidor final → possivel diferenca entre build local e execucao real com PM2/ambiente remoto
- branch atual contem arquivos fora do escopo da feature (`.claude/scripts/git-sync-check.sh`, `supabase/.temp/`) → risco de commitar artefatos ou mudancas paralelas sem revisao

## Follow-ups

- instalar e subir o bot no servidor com `.env` real e `pm2`
- restringir `Access-Control-Allow-Origin` da Edge Function para o dominio final quando a URL de producao estabilizar
- revisar atualizacoes futuras de `discord.js` para remover advisories transitivos
- excluir `supabase/.temp/` do escopo versionado antes de commit

## Status Final

`READY_FOR_COMMIT`
