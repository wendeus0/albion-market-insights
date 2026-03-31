# Viability Result — Discord metadata via Supabase session

**Data:** 2026-03-30
**Feature:** `discord-web-linking`

## Método da checagem

A checagem foi feita consultando os dados reais já persistidos no projeto Supabase deste ambiente, com foco em:

- `auth.users.raw_app_meta_data`
- `auth.users.raw_user_meta_data`
- `auth.identities`
- `public.profiles`

## Evidências encontradas

### 1. Usuário OAuth do Discord existe com provider explícito

No registro real de usuário autenticado por Discord, o projeto armazena:

- `raw_app_meta_data.provider = "discord"`
- `raw_app_meta_data.providers = ["discord"]`

### 2. Há identificador forte e estável do Discord

No mesmo usuário, foram encontrados campos consistentes em `raw_user_meta_data` e `auth.identities.identity_data`:

- `provider_id = "<discord-id-redacted>"`
- `sub = "<discord-id-redacted>"`
- `provider = "discord"`

Esses campos são candidatos fortes para identidade primária do vínculo.

### 3. Há campos exibíveis para UI

Também existem campos úteis para exibição no perfil:

- `full_name = "<discord-full-name-redacted>"`
- `name = "<discord-username-redacted>"`
- `custom_claims.global_name = "<discord-global-name-redacted>"`
- `avatar_url` / `picture`

Esses campos são adequados para exibição, mas **não** devem ser a chave primária do vínculo.

### 4. `profiles` ainda não reflete o vínculo Discord

A tabela `public.profiles` já possui linha para o usuário autenticado, mas ainda está vazia para vínculo Discord:

- `discord_id = null`
- `discord_username = null`
- `discord_dm_enabled = false`

Isso confirma que a nova estratégia ainda precisa sincronizar os dados da sessão para `profiles`.

## Conclusão

## Verdict

**Viável com alta confiança.**

A estratégia de vínculo web é tecnicamente viável neste projeto porque já existe evidência real de que o Supabase persiste metadata de OAuth do Discord com um identificador forte e estável (`provider_id` / `sub`) associado ao provider `discord`.

## Regras que permanecem obrigatórias

1. usar `provider_id` ou `sub` como base da identidade primária, nunca username/email/avatar
2. persistir o vínculo final em `public.profiles`, que continua como fonte de verdade
3. só marcar `discord_dm_enabled = true` após persistência bem-sucedida
4. exigir confirmação antes de sobrescrever um `discord_id` já salvo com outro valor
5. tratar metadata ausente/parcial como estado seguro: sem vínculo falso e sem DM habilitada

## Próximo passo recomendado

Prosseguir para implementação com TDD, começando por testes RED que cubram:

- extração do Discord ID da sessão autenticada
- sincronização inicial para `profiles`
- manutenção do vínculo em relogin com a mesma conta
- confirmação obrigatória ao detectar troca para outra conta Discord
- estado seguro quando a metadata do provider não estiver disponível
