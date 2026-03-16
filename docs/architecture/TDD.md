# TDD.md — Metodologia de Testes

Documentação de referência para Test-Driven Development, BDD e Architecture
Decision Records neste projeto.

---

## Test-Driven Development (TDD)

### Por que TDD?
Testes escritos *após* a implementação tendem a verificar o código como foi
escrito, não o comportamento que deveria existir. TDD inverte isso: o teste
é a especificação executável. Você só escreve código de produção para fazer
um teste passar.

### Ciclo RED → GREEN → REFACTOR

**RED**
- Escreva o teste a partir de um critério de aceitação da SPEC
- Execute: o teste deve falhar pelo motivo *certo* (comportamento ausente),
  não por erro de sintaxe, import errado ou setup incorreto
- Confirme a falha antes de avançar

**GREEN**
- Escreva a implementação *mínima* para o teste passar
- Não antecipe requisitos não cobertos por teste existente
- Código feio é aceitável aqui — o REFACTOR corrige

**REFACTOR**
- Somente após verde confirmado
- Melhore estrutura, nomes, organização
- Não altere comportamento — os testes são o contrato
- Execute os testes após cada mudança estrutural

---

## Behavior-Driven Development (BDD)

### Outside-In TDD
O desenvolvimento começa pelo comportamento externo (componente, API, interface)
e trabalha para dentro. Isso garante que cada camada interna existe para servir
um comportamento observável, não o contrário.

Ordem natural:
1. Escreva o teste do comportamento do componente/endpoint (camada externa)
2. Implemente o mínimo no componente
3. Identifique o que a camada interna precisa entregar
4. Escreva o teste da camada interna
5. Implemente

### Formato Given/When/Then
Os critérios de aceitação da SPEC se tornam cenários de teste diretamente:

```typescript
// Cenário da SPEC:
// Given que a API retorna erro 503
// When o hook tenta carregar os dados
// Then retorna estado de erro com mensagem amigável

it('deve retornar estado de erro quando API retorna 503', async () => {
  // Given
  server.use(http.get('/api/prices', () => HttpResponse.error()))

  // When
  const { result } = renderHook(() => useMarketItems())
  await waitFor(() => expect(result.current.isError).toBe(true))

  // Then
  expect(result.current.error.message).toContain('indisponível')
})
```

### Convenções de nomenclatura de testes
- Descreve o comportamento, não o método
- Formato: `deve <comportamento> quando <condição>`
- Exemplos:
  - `deve exibir apenas itens de Caerleon quando cidade selecionada`
  - `deve manter cache quando API retorna erro`
  - `deve calcular spread considerando taxa de transação`

---

## Definition of Done (DoD)

Uma feature só está concluída quando **todos** os itens abaixo estão satisfeitos:

### Código
- [ ] SPEC aprovada com critérios de aceitação verificáveis
- [ ] Testes escritos antes da implementação (RED confirmado e documentado)
- [ ] Todos os testes passando (GREEN confirmado)
- [ ] Refatoração concluída sem regressão

### Qualidade
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
- [ ] Sem `console.log` de debug no código
- [ ] Sem `any` TypeScript não justificado
- [ ] Imports usando path alias `@/*`

### Processo
- [ ] Code review sem blockers (`REVIEW_PASS` ou `REVIEW_PASS_WITH_WARNINGS`)
- [ ] Security review concluída quando aplicável
- [ ] ADR criado se houver decisão arquitetural durável
- [ ] `REPORT.md` da feature gerado por `report-writer`
- [ ] Commit com mensagem Conventional Commits
- [ ] PR aberto com descrição do `report-writer`

---

## Architecture Decision Records (ADR)

### O que é um ADR?
Um registro curto e auditável de uma decisão arquitetural. Documenta o
*porquê* de uma escolha, não apenas o *o quê*. Permite entender o contexto
de decisões passadas sem depender de memória ou histórico de conversa.

### Quando criar um ADR
Crie um ADR quando a decisão for:
- Estável e durável (não uma escolha tática de curto prazo)
- Com impacto em múltiplas áreas do projeto
- Com trade-off relevante que precise de rastreabilidade futura
- Uma mudança formal de convenção arquitetural

Não crie ADR para:
- Detalhe de implementação local sem impacto amplo
- Correção de bug isolado
- Ajuste de configuração sem consequência arquitetural

### Formato obrigatório

```markdown
# ADR-NNN — <Título>

**Status:** Proposto | Aceito | Depreciado | Substituído por ADR-NNN
**Data:** YYYY-MM-DD

## Contexto
<Qual situação motivou esta decisão? Quais forças estavam em jogo?>

## Decisão
<O que foi decidido, de forma objetiva.>

## Consequências
<O que muda com esta decisão? Quais trade-offs foram aceitos?>

## Alternativas consideradas
<O que foi avaliado e descartado, e por quê.>
```

### Localização
```
docs/adr/
└── ADR-NNN-titulo-em-kebab-case.md
```

### Cadência de revisão

**Revisão por gatilho** (imediata, quando ocorrer):
- Uma dependência central é atualizada com breaking changes
- A decisão é questionada por inconsistência observada no código
- O contexto que motivou a decisão mudou significativamente
- Uma nova feature depende de rever a decisão

**Revisão periódica** (agendada):
- A cada início de ciclo de feature relevante: revisar ADRs relacionados à área tocada
- A cada 3 meses: varredura de todos os ADRs com status `Aceito` para verificar se ainda fazem sentido

**Status após revisão:**
- Ainda válido → mantém `Aceito`, atualiza data de última revisão
- Parcialmente válido → cria ADR novo que estende ou nuança o anterior
- Inválido → marca como `Depreciado` com motivo, cria ADR substituto se necessário

### Status de ADRs existentes neste projeto

| ADR | Título | Status | Última revisão |
|-----|--------|--------|----------------|
| ADR-001 | shadcn/ui como biblioteca de componentes | Aceito | 2026-03-16 |
| ADR-002 | TanStack Query para gerenciamento de estado de servidor | Aceito | 2026-03-16 |
| ADR-003 | Interface MarketService com feature flag para implementação | Aceito | 2026-03-16 |
| ADR-004 | localStorage para persistência de alertas | Aceito | 2026-03-16 |
| ADR-005 | Playwright para testes E2E | Aceito | 2026-03-16 |
