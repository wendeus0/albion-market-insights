---
feature: discord-web-linking
title: Vinculação de Discord pelo fluxo web
status: APPROVED
created: 2026-03-30
---

# SPEC — Vinculação de Discord pelo fluxo web

## Context

A estratégia atual de vínculo com Discord depende de gerar um token temporário no app e concluir o pareamento via comando `/register <token>` no bot. Na prática, isso adiciona atrito operacional, depende do bot estar saudável no momento do vínculo e cria um ponto frágil no onboarding.

O produto já autentica o usuário com Discord OAuth. Isso abre espaço para um recorte menor e mais confiável: concluir a vinculação do perfil diretamente no fluxo web autenticado, sem exigir uma etapa manual no bot para liberar notificações por DM.

## Goal

Permitir que um usuário autenticado via Discord tenha seu perfil marcado como vinculado diretamente no app, com feedback claro de sucesso, estado visível no perfil e sem depender do comando `/register` para concluir a vinculação inicial.

## Acceptance criteria

### AC-1 — Usuário autenticado vê vínculo concluído automaticamente no perfil

**Given** que o usuário concluiu o login com Discord e acessa `/profile`
**When** a página termina de carregar
**Then** a interface exibe que a conta Discord está vinculada
**And** mostra a identificação disponível da conta vinculada ao usuário
**And** não exibe instruções para usar `/register <token>`
**And** o vínculo exibido corresponde ao estado persistido em `profiles`, que é a fonte de verdade final

### AC-2 — Perfil sem dados suficientes não entra em estado falso de vínculo

**Given** que a sessão autenticada não fornece dados suficientes para confirmar a conta Discord
**When** o usuário acessa `/profile`
**Then** a interface mantém o estado como “não vinculado”
**And** exibe mensagem clara informando que a vinculação não pôde ser concluída automaticamente
**And** não afirma que DMs estão habilitadas

### AC-3 — Vinculação web habilita DM imediatamente

**Given** que o usuário teve a conta Discord vinculada com sucesso no fluxo web
**When** a vinculação é concluída e o vínculo é persistido com sucesso
**Then** a interface informa explicitamente que notificações por DM no Discord estão habilitadas
**And** o sistema passa a tratar o usuário como apto a receber DM sem comando manual adicional

**Given** que um alerta elegível for disparado posteriormente
**When** o usuário já estiver vinculado pelo fluxo web
**Then** o caminho de entrega por DM é considerado disponível
**And** isso representa habilitação de produto para o canal de DM, não garantia de entrega final em runtime

### AC-4 — Reautenticação mantém consistência do vínculo

**Given** que um usuário já possui vínculo Discord salvo
**When** faz novo login com a mesma conta Discord
**Then** o perfil continua aparecendo como vinculado
**And** o app não cria estado duplicado ou contraditório de vínculo

### AC-5 — Falha na sincronização do vínculo gera feedback controlado

**Given** que ocorre falha ao concluir ou refletir a vinculação no app
**When** o usuário acessa `/profile` após o login
**Then** a página continua navegável
**And** exibe feedback amigável de erro ou pendência
**And** preserva o fallback por webhook já existente
**And** não exibe DM como habilitada enquanto o vínculo persistido não estiver consistente

### AC-6 — UX do perfil deixa claro o novo fluxo de vínculo

**Given** que o usuário acessa `/profile`
**When** consulta a seção de integração com Discord
**Then** a interface explica que a vinculação acontece pelo login no app
**And** informa claramente se DMs estão habilitadas ou não
**And** não orienta o usuário a copiar token temporário
**And** não depende do bot para concluir o pareamento inicial

### AC-7 — Troca de vínculo pede confirmação do usuário

**Given** que já existe uma conta Discord vinculada ao perfil
**When** uma nova tentativa de vínculo web identificar uma conta Discord diferente
**Then** o app entra em estado explícito de troca pendente
**And** solicita confirmação explícita antes de substituir a conta vinculada
**And** deixa claro qual vínculo atual será trocado
**And** não altera o vínculo salvo sem confirmação do usuário

## Non-goals

- redesenhar o fluxo completo de login OAuth
- remover o bot Discord do produto
- remover os comandos já existentes do bot
- alterar `src/components/ui/`
- expandir o escopo para email, SMS ou outros canais de notificação
- reestruturar o modelo completo de notificações além do necessário para refletir a nova estratégia de vínculo

## Casos de erro

- Sessão autenticada sem dados suficientes do Discord → perfil permanece como não vinculado, não habilita DM e exibe mensagem de pendência
- Falha ao persistir ou refletir o vínculo no perfil → usuário vê feedback amigável, o app continua utilizável e não mostra vínculo falso
- Usuário autenticado por método incompatível com o fluxo esperado → perfil não exibe vínculo falso e orienta o próximo passo
- Conta já vinculada com dados divergentes → interface entra em estado de troca pendente e não substitui o vínculo sem confirmação

## Dependências e restrições técnicas

- sessão OAuth do Discord já funcional no app
- disponibilidade de um identificador estável e confiável da conta Discord no contexto autenticado
- `profiles` deve permanecer como fonte de verdade final do vínculo persistido
- manutenção do fallback atual por `discord_webhook_url`
- username, email e avatar não podem ser tratados como identidade primária do vínculo
- validação local via `npm run quality:gate`

## Open questions

- Quais campos da sessão/Auth metadata estão disponíveis de forma confiável após o login com Discord neste projeto?
- (nenhuma outra no momento)

## Referências

- `features/discord-oauth-bot/SPEC.md`
- `features/auth-supabase-alert-sync/SPEC.md`
- `src/pages/Profile.tsx`
- `src/hooks/useProfile.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/AuthCallback.tsx`
