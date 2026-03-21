# SPEC — Higienização de Componentes Vendor

**Status:** Aprovada  
**Data:** 2026-03-21  
**Autor:** AI Agent  
**Prioridade:** P1  
**Tipo:** Débito técnico incremental

---

## Contexto e Motivação

O projeto utiliza componentes do shadcn/ui localizados em `src/components/ui/`. Esses componentes foram instalados via CLI do shadcn e incluem código boilerplate, exports auxiliares e patterns que geram warnings no ESLint (`react-refresh/only-export-components`).

Atualmente existem **4 warnings persistentes** de Fast Refresh que poluem o output de lint e reduzem a confiança no quality gate. Além disso, há componentes que exportam funções utilitárias junto com o componente principal, violando a convenção de "um arquivo = um componente" do React Fast Refresh.

### Componentes auditados (13 total)

| Componente    | Tipo       | Uso no projeto            | Warnings |
| ------------- | ---------- | ------------------------- | -------- |
| alert.tsx     | shadcn/ui  | AlertsManager             | 0        |
| badge.tsx     | shadcn/ui  | ItemDisplay, PriceTable   | 1        |
| button.tsx    | shadcn/ui  | Global                    | 1        |
| checkbox.tsx  | shadcn/ui  | AlertsManager             | 0        |
| dialog.tsx    | shadcn/ui  | AlertsManager             | 0        |
| form.tsx      | shadcn/ui  | AlertsManager             | 1        |
| input.tsx     | shadcn/ui  | Global                    | 0        |
| label.tsx     | shadcn/ui  | Forms                     | 0        |
| select.tsx    | shadcn/ui  | PriceTable, AlertsManager | 0        |
| skeleton.tsx  | shadcn/ui  | Loading states            | 0        |
| sonner.tsx    | shadcn/ui  | Toasts                    | 0        |
| sparkline.tsx | **Custom** | PriceTable, TopItemsPanel | 0        |
| tooltip.tsx   | shadcn/ui  | UI geral                  | 1        |

### Warnings identificados

```
29:17  warning  Fast refresh only works when a file only exports components
47:18  warning  Fast refresh only works when a file only exports components
129:10 warning  Fast refresh only works when a file only exports components
27:19  warning  Fast refresh only works when a file only exports components
```

Causa raiz: exports de constantes/funções auxiliares junto com componentes React.

---

## Problema a Resolver

1. **Warnings de ESLint**: Eliminar os 4 warnings de `react-refresh/only-export-components` para ter um quality gate limpo (0 erros, 0 warnings)
2. **Isolamento de exports**: Mover funções/utilitários exportados de componentes para arquivos separados
3. **Documentação de uso**: Criar mapa de quais componentes são realmente utilizados no projeto
4. **Componente customizado**: Avaliar se `sparkline.tsx` (componente próprio) deve permanecer em `ui/` ou migrar para `components/`

---

## Fora do Escopo

- ❌ Remover ou modificar funcionalidade dos componentes
- ❌ Atualizar versões do shadcn/ui
- ❌ Modificar componentes que não geram warnings
- ❌ Refatorar lógica de negócio dos componentes
- ❌ Alterar estilização ou aparência visual
- ❌ Criar novos componentes

---

## Critérios de Aceitação

### AC-1: Mapa de uso atualizado

**Given** que o projeto possui 13 componentes em `src/components/ui/`  
**When** eu executo o comando de análise de dependências  
**Then** um mapa `COMPONENTS_USAGE.md` é gerado listando:

- Quais componentes são importados em cada arquivo do projeto
- Quais componentes não têm referências (candidatos a pruning futuro)
- Quantidade de imports por componente

### AC-2: Warnings eliminados

**Given** que existem 4 warnings de `react-refresh/only-export-components`  
**When** eu executo `npm run lint`  
**Then** o output mostra `0 errors, 0 warnings` (exceto warnings conhecidos de vendor que não podem ser suprimidos)

### AC-3: Refatoração de exports auxiliares

**Given** que o componente `badge.tsx` exporta constantes auxiliares  
**When** eu movo essas constantes para `badge.utils.ts`  
**Then** o componente `badge.tsx` exporta apenas o componente React  
**And** o warning associado desaparece  
**And** todos os imports existentes continuam funcionando

### AC-4: Refatoração de button variants

**Given** que `button.tsx` exporta `buttonVariants` função auxiliar  
**When** eu movo `buttonVariants` para `button.utils.ts`  
**Then** o componente exporta apenas `<Button />`  
**And** imports de `buttonVariants` são atualizados para usar o novo path  
**And** o warning associado desaparece

### AC-5: Refatoração de form hooks

**Given** que `form.tsx` exporta hooks auxiliares (`useFormField`, etc.)  
**When** eu movo os hooks para `form.hooks.ts`  
**Then** o componente exporta apenas componentes de formulário  
**And** o warning associado desaparece  
**And** todos os formulários do projeto continuam funcionando

### AC-6: Refatoração de tooltip utilitários

**Given** que `tooltip.tsx` exporta funções/utilitários adicionais  
**When** eu movo esses utilitários para `tooltip.utils.ts`  
**Then** o componente exporta apenas o componente `<Tooltip />`  
**And** o warning associado desaparece

### AC-7: Testes de regressão

**Given** que modifiquei 4 componentes do shadcn/ui  
**When** eu executo `npm run test`  
**Then** todos os 333 testes existentes passam  
**And** não há testes quebrados por causa das mudanças de import

### AC-8: Build verificado

**Given** que as modificações foram aplicadas  
**When** eu executo `npm run build`  
**Then** o build completa sem erros  
**And** o bundle size não aumenta significativamente (< 1% de diferença)

### AC-9: TypeCheck aprovado

**Given** que as modificações foram aplicadas  
**When** eu executo `npm run typecheck`  
**Then** não há erros de TypeScript  
**And** todas as referências de tipos são resolvidas corretamente

---

## Estratégia de Implementação

### Fase 1: Análise e Mapeamento

1. Gerar mapa de uso de componentes com `grep`/`find`
2. Documentar quais componentes geram warnings e por quê
3. Identificar padrão de exports problemáticos

### Fase 2: Refatoração por Componente

Para cada componente com warning:

1. Extrair funções/utilitários para arquivo `.utils.ts` ou `.hooks.ts`
2. Atualizar imports no componente original
3. Atualizar imports em arquivos consumidores
4. Verificar lint/typecheck/testes

**Ordem sugerida (menor impacto primeiro):**

1. `badge.tsx` (1 warning, baixo uso)
2. `tooltip.tsx` (1 warning, baixo uso)
3. `button.tsx` (1 warning, alto uso — cuidado com imports)
4. `form.tsx` (1 warning, médio uso)

### Fase 3: Validação Final

1. `npm run lint` → 0 warnings
2. `npm run typecheck` → 0 erros
3. `npm run test` → 333/333 passando
4. `npm run build` → sucesso

---

## Dependências

- Nenhuma feature bloqueante — pode ser feita a qualquer momento
- Requer validação de que nenhum consumidor usa imports internos dos componentes

---

## Riscos e Mitigações

| Risco                               | Probabilidade | Impacto | Mitigação                                                                                         |
| ----------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------- |
| Breaking change em imports          | Média         | Alto    | Buscar todos os imports antes de mover; manter backward compatibility com re-export se necessário |
| Testes quebrados por path changes   | Baixa         | Médio   | Executar testes após cada componente refatorado                                                   |
| shadcn update sobrescrever mudanças | Baixa         | Médio   | Documentar claramente quais arquivos foram modificados; não usar `shadcn add` sem revisar         |
| Complexidade inesperada em form.tsx | Média         | Médio   | Analisar profundidade dos hooks antes de extrair; talvez manter em arquivo único se acoplado      |

---

## Checklist Pré-Implementação

- [ ] Mapear todos os imports de `buttonVariants`
- [ ] Mapear todos os imports de hooks do `form.tsx`
- [ ] Identificar se há consumidores de exports auxiliares de `badge` e `tooltip`
- [ ] Validar que `sparkline.tsx` é componente customizado (não do shadcn)

---

## Referências

- [React Fast Refresh](https://reactnative.dev/docs/fast-refresh)
- [ESLint react-refresh rule](https://github.com/ArnaudBarre/eslint-plugin-react-refresh)
- [shadcn/ui docs](https://ui.shadcn.com/docs)
- ADR relacionados: Nenhum — esta é manutenção de codebase
- Issue relacionada: #59 (flakiness) — indiretamente melhora confiança no quality gate

---

## Notas de Implementação

### Sobre manutenção futura do shadcn/ui

> **IMPORTANTE**: Os componentes em `src/components/ui/` são cópias instaladas via CLI do shadcn. Eles **não devem** ser editados diretamente pois:
>
> 1. Futuras atualizações (`npx shadcn@latest add button`) podem sobrescrever mudanças
> 2. Esta refatoração cria uma divergência consciente da base do shadcn
>
> **Decisão arquitetural**: Aceitamos essa divergência pois:
>
> - Os warnings poluem o quality gate
> - A correção é simples (mover exports)
> - O custo de re-aplicar em atualizações futuras é baixo
> - Não há previsão de atualização massiva de componentes shadcn

### Estratégia de backup

Antes de modificar cada componente:

1. Criar backup temporário: `cp component.tsx component.tsx.bak`
2. Aplicar mudanças
3. Validar com lint/typecheck/testes
4. Remover backup: `rm component.tsx.bak`

---

## Definition of Done

- [ ] AC-1: Mapa de uso gerado
- [ ] AC-2: 0 warnings no lint
- [ ] AC-3 a AC-6: Cada componente refatorado individualmente
- [ ] AC-7: Todos os testes passando
- [ ] AC-8: Build verificado
- [ ] AC-9: TypeCheck aprovado
- [ ] Documentação atualizada (se necessário)
- [ ] REPORT.md gerado
