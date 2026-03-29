---
id: discord-oauth-bot
type: feature
summary: Substituir login por Discord OAuth e adicionar vinculo de notificacoes via bot com link magico.
status: approved
created: 2026-03-29
---

# SPEC — Discord OAuth e Bot de Notificacoes

## Contexto e Motivação

O fluxo atual exige login por email/senha e configuracao manual de `discord_webhook_url`.
Isso adiciona friccao no onboarding e torna a configuracao de notificacoes tecnica demais
para parte dos usuarios. A frente busca simplificar autenticacao com Discord OAuth,
preservar o fallback por webhook e preparar notificacoes por DM via bot.

## Problema a Resolver

Hoje o produto nao oferece:

- login nativo com Discord como unico metodo de autenticacao
- callback OAuth dedicado no frontend
- vinculo da conta Discord do usuario com o perfil do app via link magico
- bot Discord para listar alertas e enviar DMs quando alertas disparam

Sem esse recorte formalizado, auth, perfil, integracao externa e notificacoes podem evoluir
sem contrato claro de UX, seguranca e fallback.

## Fora do Escopo

- manter login por email/senha em producao
- comandos alem de `/register` e `/alerts list` no MVP
- notificacoes por email, SMS ou canais publicos do Discord
- portfolio, guild tools ou features sociais
- alteracoes em `src/components/ui/`
- URL de producao diferente de `https://albion-market-insights.pages.dev`

## Critérios de Aceitação

### AC-1 — Login usa apenas Discord OAuth

**Given** que o usuario acessa `/login`
**When** clica em "Entrar com Discord"
**Then** o app inicia `signInWithOAuth` com provider `discord`
**And** apos o retorno do Discord processa o callback em `/auth/callback`
**And** redireciona o usuario autenticado para `/alerts`

### AC-2 — Cancelamento ou erro de OAuth gera feedback controlado

**Given** que o usuario inicia o fluxo OAuth do Discord
**When** cancela a autorizacao ou o callback falha
**Then** o app retorna para a experiencia de login
**And** exibe mensagem de erro amigavel sem quebrar a navegacao

### AC-3 — Perfil gera link magico de vinculacao do bot

**Given** que o usuario autenticado acessa `/profile`
**And** ainda nao possui `discord_id` vinculado
**When** aciona a opcao de vincular Discord
**Then** o frontend chama a Edge Function `generate-discord-link`
**And** o perfil recebe um token unico com expiracao de 15 minutos
**And** a UI exibe instrucoes claras com o comando `/register <token>`

### AC-4 — Bot vincula conta Discord por token valido

**Given** que o usuario possui um token valido gerado pelo app
**When** executa `/register <token>` no bot `AlbionMarketBot`
**Then** o bot valida o token no Supabase
**And** grava `discord_id`, `discord_username` e `discord_dm_enabled=true` no perfil
**And** invalida o token apos uso
**And** responde no idioma do usuario com confirmacao de sucesso

### AC-5 — Bot rejeita token invalido ou expirado

**Given** que o usuario executa `/register <token>` com token inexistente ou expirado
**When** o bot consulta o Supabase
**Then** nao vincula nenhuma conta
**And** responde com erro amigavel em portugues ou ingles

### AC-6 — Bot lista alertas ativos do usuario

**Given** que o usuario possui conta Discord vinculada e alertas ativos
**When** executa `/alerts list`
**Then** o bot consulta os alertas do usuario no Supabase
**And** responde com embed contendo item, condicao, threshold e status

### AC-7 — Alertas disparam DM quando Discord estiver vinculado

**Given** que existe alerta disparado e ainda nao notificado no Discord
**And** o usuario possui `discord_dm_enabled=true` e `discord_id` preenchido
**When** o bot executa o polling a cada 30 segundos
**Then** envia uma DM com dados do alerta e horario em UTC
**And** inclui botoes clicaveis para `/alerts` e `/dashboard`
**And** marca o alerta como notificado no Discord

### AC-8 — Webhook continua como fallback

**Given** que um alerta foi disparado
**And** o usuario nao possui Discord vinculado para DM
**When** o fluxo de notificacao for processado
**Then** o comportamento atual por `discord_webhook_url` continua disponivel
**And** a frente nao remove o fallback existente

### AC-9 — Mensagens do bot respeitam locale do usuario

**Given** que o usuario do Discord possui locale `pt-BR`
**When** recebe resposta do bot ou DM de alerta
**Then** as mensagens sao exibidas em portugues

**Given** que o usuario possui outro locale
**When** recebe resposta do bot ou DM de alerta
**Then** as mensagens sao exibidas em ingles

## Casos de Erro

- callback OAuth sem `code` valido deve falhar com feedback visual e sem sessao parcial
- Edge Function sem JWT valido deve responder erro de autorizacao
- token ja usado nao pode ser reutilizado no comando `/register`
- falha ao enviar DM nao deve quebrar o loop do bot para outros alertas
- usuario sem alertas ativos recebe resposta vazia amigavel em `/alerts list`

## Dependências

- Supabase Auth com provider Discord habilitado
- Edge Function `generate-discord-link`
- tabela `profiles` com colunas `discord_id`, `discord_username`, `discord_dm_enabled`, `discord_link_token`, `discord_link_expires_at`
- tabela `alerts` com colunas `notified_discord` e `notified_at`
- bot `AlbionMarketBot` hospedado no servidor proprio do usuario

## Riscos e Incertezas

- login apenas por Discord altera a experiencia de usuarios existentes e exige regressao cuidadosa
- o bot depende de uptime do servidor proprio para polling continuo
- rate limit ou falhas de DM do Discord podem atrasar notificacoes
- a Edge Function precisa usar contrato seguro para gerar e expirar tokens sem drift com o frontend

## Referências

- `features/auth-supabase-alert-sync/SPEC.md`
- `features/supabase-rls-alerts-profiles/SPEC.md`
- `src/contexts/AuthContext.tsx`
- `src/pages/Login.tsx`
- `src/pages/Profile.tsx`
- `src/hooks/useProfile.ts`
- `https://albion-market-insights.pages.dev`
