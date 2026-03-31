# Viability Check — Discord metadata na sessão OAuth

## Pergunta original

Quais campos da sessão/Auth metadata estão disponíveis de forma confiável após o login com Discord neste projeto?

## Hipótese de trabalho

A vinculação web é viável se a sessão autenticada do Supabase expuser, no objeto `user`, identificadores estáveis o bastante para:

1. reconhecer que o provider é `discord`
2. obter uma identificação exibível da conta vinculada
3. persistir um identificador de Discord confiável no perfil sem depender de `/register`

## O que já sabemos no código atual

- `src/contexts/AuthContext.tsx` já mantém `session.user` em memória no app
- `src/pages/AuthCallback.tsx` já conclui o exchange PKCE e redireciona após OAuth
- o app ainda não lê `user.app_metadata`, `user.user_metadata` nem `user.identities`
- a dúvida restante é de **disponibilidade e confiabilidade dos campos**, não do fluxo OAuth em si

## Checagem técnica mínima proposta

### Objetivo

Confirmar, em ambiente real de login com Discord, quais campos do `user` retornado pelo Supabase estão presentes após o callback e quais podem ser usados como fonte de verdade para vínculo web.

### Evidências a coletar

Capturar e inspecionar, para uma sessão real autenticada com Discord:

- `user.app_metadata`
- `user.user_metadata`
- `user.identities`
- `user.email`
- qualquer campo de ID estável do Discord presente nesses blocos
- qualquer campo de username/display name presente nesses blocos

### Critério de viabilidade

A estratégia é considerada **viável sem nova infraestrutura** se houver um campo de ID do Discord estável e um campo de identificação exibível acessíveis logo após o login.

A estratégia é considerada **viável com fallback de produto** se:

- existir apenas identificação parcial para exibição, mas não um ID confiável
- o app puder mostrar estado pendente/erro controlado sem vínculo falso

A estratégia é considerada **não viável no formato proposto** se a sessão não trouxer nenhum identificador confiável do Discord para persistência.

## Como validar na implementação

1. fazer login real com Discord
2. inspecionar o objeto `user` retornado pelo Supabase logo após `exchangeCodeForSession`
3. registrar quais campos permanecem estáveis em novo login com a mesma conta
4. validar como o app deve se comportar quando:
   - há ID + username
   - há apenas username/email
   - não há metadata suficiente

## Decisão esperada após a checagem

- **Prosseguir com vínculo web direto**
- **Prosseguir com vínculo web + estado pendente/fallback**
- **Revisar a estratégia e manter passo adicional fora do bot**
