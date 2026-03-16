# ADR-001 — shadcn/ui como biblioteca de componentes

**Status:** Aceito
**Data:** 2026-03-16

## Contexto

O projeto nasceu de um gerador (Lovable) que produziu automaticamente 59 componentes
baseados em shadcn/ui. A equipe precisava de uma biblioteca de componentes que oferecesse:
acessibilidade nativa (Radix UI por baixo), theming via CSS variables compatível com
Tailwind CSS, e componentes copiados ao invés de instalados — sem dependência de versão
mantida por terceiro.

## Decisão

Adotar shadcn/ui como biblioteca de componentes padrão. Os 59 componentes em
`src/components/ui/` são gerenciados pelo CLI do shadcn/ui e **não devem ser editados
diretamente**. Customizações visuais vão em `src/index.css` (tokens CSS). Novos
componentes de produto vão em `src/components/` fora do diretório `ui/`.

## Consequências

- Adições de componentes shadcn/ui são feitas via `npx shadcn-ui add <componente>`.
- Editar `src/components/ui/` diretamente quebra a capacidade de atualizar via CLI.
- Componentes Radix UI trazem acessibilidade (ARIA, foco, teclado) sem configuração extra.
- Bundle inclui apenas os componentes adicionados (tree-shaking via Vite).

## Alternativas consideradas

- **Material UI (MUI):** componentes opinativos demais para o visual flat do projeto;
  theming por sistema JS, não CSS variables.
- **Chakra UI:** similar ao shadcn em filosofia, mas mantido como pacote instalado —
  upgrades dependem de release externa.
- **Componentes customizados do zero:** custo de acessibilidade e consistência inviável
  para o escopo atual.
