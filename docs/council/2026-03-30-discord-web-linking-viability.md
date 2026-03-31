# Council — Viabilidade do vínculo web de Discord

**Data:** 2026-03-30
**Decisão:** A vinculação web de Discord é viável neste projeto usando a sessão OAuth/Supabase para obter identificadores confiáveis, habilitar DM imediatamente e pedir confirmação antes de trocar vínculo existente.

## Contexto analisado

- `src/contexts/AuthContext.tsx` já mantém `session.user`
- `src/pages/AuthCallback.tsx` já conclui `exchangeCodeForSession(code)`
- o app ainda não lê `user.app_metadata`, `user.user_metadata` ou `user.identities`
- a checagem técnica foi registrada em `features/discord-web-linking/VIABILITY_CHECK.md`
- o fluxo `/register <token>` via bot mostrou fricção operacional
- o fallback por webhook deve continuar

## Protagonist

- A decisão é promissora porque o projeto já tem o fluxo OAuth concluído e o problema restante parece ser uma leitura confiável de metadata seguida de sincronização para `profiles`.
- O menor experimento útil é inspecionar a sessão real, confirmar um Discord ID estável e então validar persistência + reload do perfil.

## Antagonistas

### Architect
- Alertou que a proposta muda a fonte de verdade do vínculo e isso precisa ficar explícito.
- Separou “conta vinculada” de “DM contratualmente habilitada”.
- Pediu guardrails para metadata parcial, conflito de vínculo e prevalência de `profiles` sobre dados transitórios da sessão.

### Engineer
- Reforçou que ainda não há evidência de um Discord ID estável na sessão.
- Apontou riscos de persistência parcial, múltiplas abas, conflito de vínculo e ambiguidade entre username e identidade.
- Pediu um spike real com login e persistência para provar a hipótese.

### Skeptic
- Objeta aprovar a decisão sem uma checagem real da sessão do Supabase.
- A principal falha silenciosa seria marcar vínculo/DM com base em campo incorreto ou instável.

### Security
- Exigiu que apenas um Discord ID provider-bound seja usado como identidade forte.
- Reforçou que nunca se deve habilitar DM sem `discord_id` persistido e sem confirmação em caso de troca.

## Verdict

**PROCEED_WITH_CHANGES**

A direção é boa e tem valor claro de produto, mas a viabilidade depende de um gate técnico explícito: provar com uma sessão real do Supabase que existe um Discord ID estável e confiável para persistência. Sem isso, a proposta não deve ir para implementação completa.

## Motivos principais

1. O projeto já possui a maior parte do fluxo OAuth pronta, então o experimento é pequeno.
2. O maior risco não está no OAuth, mas na **confiabilidade dos campos de identidade** retornados pela sessão.
3. O vínculo persistido em `profiles` deve ser a **fonte de verdade final**; a sessão só propõe criação/atualização.
4. “DM habilitada imediatamente” é aceitável como contrato de produto apenas se houver persistência bem-sucedida e estado coerente lido de volta.

## Gates antes de implementação

1. Fazer login real com Discord e inspecionar `session.user.app_metadata`, `session.user.user_metadata` e `session.user.identities`.
2. Confirmar que existe um **Discord ID estável** repetível em novo login com a mesma conta.
3. Confirmar que ausência desse ID resulta em estado seguro: sem vínculo falso e sem DM habilitada.
4. Confirmar que conflito com vínculo existente exige confirmação antes de overwrite.
5. Confirmar que o perfil lido após persistência reflete exatamente o estado exibido na UI.

## Ajustes recomendados na SPEC

- explicitar que `profiles` é a fonte de verdade final do vínculo
- separar “conta vinculada” de “DM habilitada em contrato” vs “entrega real de DM”
- explicitar o estado de conflito/pending replacement
- explicitar o comportamento quando a sessão tiver metadata parcial ou insuficiente
- explicitar que username/email/avatar nunca são identidade primária

## Próximo passo objetivo

Executar a checagem técnica de viabilidade descrita em `features/discord-web-linking/VIABILITY_CHECK.md` e registrar o resultado antes de iniciar `test-red`.

**Exit state:** COUNCIL_DONE
