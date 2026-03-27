---
id: alerts-search-and-mutation-feedback
type: feature
summary: Refinar a busca de item no formulario de alertas, persistir quality como variante do alerta e reduzir a percepcao de delay nas mutacoes.
status: approved
created: 2026-03-27
---

# SPEC — Busca de Alertas e Feedback de Mutação

## Contexto e Motivação

Após a correção funcional do fluxo autenticado de alertas, surgiram dois pontos de UX ainda relevantes:
o campo de item precisa privilegiar busca por nome com metadados de contexto, e o usuário ainda percebe
leve atraso visual nas ações de toggle e exclusão. Além disso, a qualidade do item precisa ser tratada
como variante real de mercado, coerente com os fluxos de ROI e lucro que já segmentam oportunidades por
`itemId|quality`.

## Problema a Resolver

Hoje o formulário de alertas ainda mistura busca e seleção de forma limitada, as mutações de alerta
não comunicam estado de processamento de maneira suficientemente clara, e o contrato do alerta ainda
ignora `quality`. Isso reduz fluidez do fluxo e cria inconsistência com o restante do domínio de mercado,
onde qualidade altera preço, ROI e potencial de lucro.

## Fora do Escopo

- análise histórica avançada de preço
- recomendação de lucro potencial por janela temporal
- busca remota/autocomplete via backend
- refatoração de componentes `src/components/ui/`

## Critérios de Aceitação

### AC-1 — Busca prioriza nome do item

**Given** que o usuário abre o formulário de criação de alerta
**When** digita um termo de busca
**Then** o filtro considera primariamente o nome do item
**And** não exige que o usuário conheça tier, qualidade ou outros atributos para localizar o item

### AC-2 — Opções exibem metadados úteis sem poluir a busca

**Given** que a lista de itens filtrada é exibida
**When** o usuário visualiza uma opção de item
**Then** a opção mostra o nome como informação principal
**And** exibe metadados auxiliares que ajudem desambiguação, priorizando tier, encantamento e quality
**And** cada combinação relevante de item e quality pode ser distinguida pelo usuário

### AC-3 — Quality integra o contrato e a persistência do alerta

**Given** que o usuário seleciona uma variante de item com quality específica
**When** o alerta é criado, salvo, lido ou reidratado
**Then** `quality` é persistida no contrato do alerta
**And** o alerta continua associado à variante correta do item
**And** o motor de matching não mistura variantes com qualities diferentes

### AC-4 — Toggle e exclusão comunicam estado de mutação

**Given** que o usuário aciona toggle ou exclusão de um alerta
**When** a mutação está em andamento
**Then** a UI exibe feedback visual imediato de processamento
**And** evita cliques repetidos no mesmo controle durante a operação

### AC-5 — Percepção de delay é reduzida sem quebrar consistência

**Given** que as mutações de alerta dependem de roundtrip assíncrono
**When** o usuário executa toggle ou exclusão
**Then** o estado visual reage imediatamente
**And** rollback continua possível em caso de erro
**And** o fluxo permanece consistente com o backend

## Casos de Erro

- busca sem resultado deve apresentar estado vazio claro
- mutação com falha deve restaurar estado coerente e informar erro
- metadados ausentes não devem quebrar renderização da opção
- alertas legados sem `quality` não devem quebrar leitura local ou remota

## Dependências

- `features/fix-alerts-authenticated-ux/SPEC.md`
- `src/components/alerts/AlertsManager.tsx`
- `src/hooks/useAlerts.ts`
- `src/data/types.ts`
- `src/services/alert.storage.supabase.ts`
- `supabase/migrations/20260327_auth_alerts_profiles.sql`

## Riscos e Incertezas

- exibir metadados demais pode piorar legibilidade da lista
- delay percebido pode ter origem parcial em animação/render, não só em mutação
- encantamento pode exigir derivação adicional a partir do naming atual do catálogo
- migração de alertas já persistidos sem `quality` exige fallback explícito

## Referências

- `PENDING_LOG.md`
- `src/components/alerts/AlertsManager.tsx`
- `src/hooks/useAlerts.ts`
