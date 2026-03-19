# Albion Market Insights

![Quality Gate](https://github.com/wendeus0/albion-market-insights/actions/workflows/quality-gate.yml/badge.svg)

Ferramenta de análise de mercado para **Albion Online**, focada em visualização de preços, detecção de oportunidades de arbitragem e monitoramento de alertas.

## 🚀 Funcionalidades

- **Dashboard de Mercado**: Visualização em tempo real de preços, tendências e estatísticas.
- **Arbitragem entre Cidades**: Identificação automática de oportunidades de lucro comprando em uma cidade e vendendo em outra.
- **Gerenciador de Alertas**: Configure alertas personalizados para ser notificado quando itens atingirem preços alvo.
- **Suporte a Encantamentos**: Filtragem e análise detalhada por nível de encantamento (Tier/Enchantment).
- **Dados Reais**: Integração com a API do *Albion Online Data Project* (opcional).
- **Performance**: Otimizações como *code splitting*, *caching* local e *backoff* exponencial para requisições.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui (Radix UI), Lucide React
- **Data**: TanStack Query, Recharts, Zod
- **Testes**: Vitest (Unit), Playwright (E2E)

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (v20+) — alinhado com CI e tooling
- npm (v10.8.2+)

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/wendeus0/albion-market-insights.git
   cd albion-market-insights
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação estará disponível em `http://localhost:8080`.

## ⚙️ Configuração

O projeto pode rodar com dados mockados (padrão) ou com a API real.

Para usar a API real, crie um arquivo `.env` na raiz ou defina a variável de ambiente:

```env
VITE_USE_REAL_API=true
```

## ✅ Testes

- **Unitários**: `npm run test`
- **E2E**: `npm run test:e2e`
- **Validação Completa**: `npm run quality:gate` (Lint + Build + Testes + Coverage)

## 📂 Documentação do Desenvolvedor

- [CLAUDE.md](./CLAUDE.md): Guia rápido de comandos, stack e convenções.
- [AGENTS.md](./AGENTS.md): Regras de workflow, arquitetura, hierarquia de documentação e skills.
- [features/](./features/): Especificações (SPEC.md) e relatórios (REPORT.md) de cada funcionalidade.

## 🤝 Contribuição

Este projeto segue um workflow estrito baseado em Specs e Features. Consulte `AGENTS.md` antes de contribuir.
