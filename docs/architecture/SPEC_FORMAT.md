# SPEC_FORMAT.md — Template e Convenções

Toda feature começa com uma SPEC. Este arquivo define o formato obrigatório,
os critérios de qualidade e como validar antes de avançar para TDD.

---

## Template

```markdown
# SPEC — <Nome da Feature>

**Status:** Draft | Aprovada | Implementada | Descartada
**Data:** YYYY-MM-DD
**Autor:** <nome>

---

## Contexto e Motivação
<Por que esta feature existe? Qual problema do usuário ela resolve?>

## Problema a Resolver
<Descrição objetiva do problema. O que está faltando ou quebrado hoje?>

## Fora do Escopo
<O que explicitamente NÃO será feito neste ciclo.>

## Critérios de Aceitação

### Cenário 1: <nome descritivo>
**Given** <estado inicial do sistema ou do usuário>
**When** <ação executada pelo usuário ou sistema>
**Then** <resultado observável esperado>

### Cenário 2: <nome descritivo>
**Given** ...
**When** ...
**Then** ...

## Dependências
<Features, APIs ou componentes que precisam estar prontos antes desta SPEC.>

## Riscos e Incertezas
<O que pode dar errado? O que ainda não sabemos?>

## Referências
<Links, ADRs, documentação externa relevante.>
```

---

## Critério INVEST — Validação antes de aprovar

Antes de aprovar uma SPEC, confirme cada item:

| Critério | Pergunta de validação |
|----------|----------------------|
| **I**ndependent | Esta SPEC pode ser implementada sem depender de feature não concluída? |
| **N**egotiable | O escopo ainda pode ser ajustado antes de iniciar? |
| **V**aluable | Entrega valor observável ao usuário final? |
| **E**stimable | O escopo é pequeno o suficiente para ter clareza? |
| **S**mall | Cabe em um ciclo de trabalho sem subdivisão? |
| **T**estable | Cada critério de aceitação pode ser verificado objetivamente? |

Se algum critério falhar, revise a SPEC antes de avançar.

---

## Formato Given/When/Then

Cada critério de aceitação deve ser escrito como um cenário BDD.

**Estrutura:**
- **Given** — estado inicial (pré-condição)
- **When** — ação executada (gatilho)
- **Then** — resultado observável (pós-condição)

**Regras:**
- Um cenário por comportamento esperado
- Linguagem de negócio, não de implementação
- O `Then` deve ser verificável sem ambiguidade
- Cubra: caminho feliz, casos de borda, casos de erro

**Exemplo:**
```
Given que o usuário está na página de dashboard
  And existem itens carregados do mercado
When o usuário seleciona a cidade "Caerleon"
Then apenas itens com preços de Caerleon são exibidos
  And o contador de itens é atualizado

Given que a API retorna erro 503
When o componente tenta carregar os preços
Then uma mensagem de erro amigável é exibida
  And os dados anteriores em cache são mantidos visíveis
```

---

## Localização e nomenclatura

```
features/
└── <nome-em-kebab-case>/
    ├── SPEC.md      ← este template preenchido
    └── REPORT.md    ← gerado por report-writer ao fechar
```

---

## Fluxo de vida de uma SPEC

```
Draft → (spec-validator) → Aprovada → (test-red) → Em implementação
→ (green-refactor + quality-gate) → Implementada
```

Uma SPEC aprovada não deve ser modificada durante a implementação.
Se o escopo mudar, crie uma nova SPEC ou negocie explicitamente antes de continuar.
