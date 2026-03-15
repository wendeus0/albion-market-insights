# Quality Gate — Albion Market Insights

## Comandos obrigatórios
```bash
npm run lint    # ESLint — zero erros permitidos
npm run build   # Vite build — deve completar sem erro
```

## O que bloqueia commit (QUALITY_BLOCKED)
- `npm run lint` com erros (não warnings)
- `npm run build` com falha
- Regressão funcional confirmada em componente existente
- Tipo TypeScript `any` introduzido sem justificativa documentada
- Import relativo `../` em vez de path alias `@/*`

## O que permite commit com ressalva (QUALITY_PASS_WITH_GAPS)
- Warnings de lint documentados com motivo
- Cobertura abaixo do ideal sem regressão
- TODO introduzido com issue referenciada

## O que não bloqueia
- Warnings de lint pré-existentes não relacionados à mudança
- Tamanho de bundle levemente aumentado sem impacto perceptível
- TODOs em código legado não tocado

## Checklist antes de commitar
- [ ] `npm run lint` passou sem erros
- [ ] `npm run build` completou com sucesso
- [ ] Nenhum `console.log` de debug deixado no código
- [ ] Componentes shadcn/ui usados onde disponíveis (não reinventados)
- [ ] Path alias `@/*` usado em todos os imports
