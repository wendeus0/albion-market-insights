import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArbitrageTable } from "@/components/dashboard/ArbitrageTable";
import type { ArbitrageOpportunity } from "@/data/types";

const mockItems: ArbitrageOpportunity[] = [
  {
    itemId: "T4_SWORD",
    itemName: "Broadsword T4",
    tier: "T4",
    quality: "Normal",
    buyCity: "Caerleon",
    sellCity: "Bridgewatch",
    buyPrice: 1000,
    sellPrice: 1500,
    netProfit: 450,
    netProfitPercent: 45,
    timestamp: new Date(Date.now() - 30000).toISOString(), // 30s ago
  },
  {
    itemId: "T5_AXE",
    itemName: "Battleaxe T5",
    tier: "T5",
    quality: "Good",
    buyCity: "Martlock",
    sellCity: "Caerleon",
    buyPrice: 2000,
    sellPrice: 2800,
    netProfit: 750,
    netProfitPercent: 37.5,
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2m ago
  },
  {
    itemId: "T6_MACE",
    itemName: "Heavy Mace T6",
    tier: "T6",
    quality: "Outstanding",
    buyCity: "Lymhurst",
    sellCity: "Bridgewatch",
    buyPrice: 5000,
    sellPrice: 6000,
    netProfit: 900,
    netProfitPercent: 18,
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1h ago
  },
];

describe("ArbitrageTable", () => {
  it("deve renderizar tabela com dados de arbitragem", () => {
    render(<ArbitrageTable items={mockItems} />);

    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
    expect(screen.getByText("Heavy Mace T6")).toBeInTheDocument();
  });

  it("deve ordenar por netProfitPercent desc por padrao", () => {
    render(<ArbitrageTable items={mockItems} />);

    const rows = screen.getAllByRole("row");
    // Primeira linha é o header, então começamos da segunda
    expect(rows[1]).toHaveTextContent("Broadsword T4"); // 45% - maior
  });

  it("deve filtrar por termo de busca", () => {
    render(<ArbitrageTable items={mockItems} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "axe" } });

    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
  });

  it("deve filtrar por lucro minimo", () => {
    render(<ArbitrageTable items={mockItems} />);

    const minProfitInput = screen.getByPlaceholderText(/min net profit/i);
    fireEvent.change(minProfitInput, { target: { value: "500" } });

    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
    expect(screen.getByText("Heavy Mace T6")).toBeInTheDocument();
    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
  });

  it("deve filtrar por ROI minimo", () => {
    render(<ArbitrageTable items={mockItems} />);

    const minRoiInput = screen.getByPlaceholderText(/min roi/i);
    fireEvent.change(minRoiInput, { target: { value: "30" } });

    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
    expect(screen.queryByText("Heavy Mace T6")).not.toBeInTheDocument();
  });

  it("deve ordenar ao clicar no cabecalho", () => {
    render(<ArbitrageTable items={mockItems} />);

    // Clicar em Item para ordenar por nome
    const itemHeader = screen.getByText("Item");
    fireEvent.click(itemHeader);

    const rows = screen.getAllByRole("row");
    // Primeiro clique em novo campo ordena desc (default do componente)
    expect(rows[1]).toHaveTextContent("Heavy Mace T6");
  });

  it("deve alternar direcao de ordenacao ao clicar novamente", () => {
    render(<ArbitrageTable items={mockItems} />);

    const itemHeader = screen.getByText("Item");

    // Primeiro clique - desc (default para novo campo)
    fireEvent.click(itemHeader);
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Heavy Mace T6");

    // Segundo clique - asc (toggle)
    fireEvent.click(itemHeader);
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Battleaxe T5");
  });

  it("deve formatar precos corretamente", () => {
    render(<ArbitrageTable items={mockItems} />);

    expect(screen.getByText("1,000")).toBeInTheDocument();
    expect(screen.getByText("1,500")).toBeInTheDocument();
  });

  it("deve formatar tempo relativo corretamente", () => {
    render(<ArbitrageTable items={mockItems} />);

    expect(screen.getByText("Just now")).toBeInTheDocument();
    expect(screen.getByText("2m ago")).toBeInTheDocument();
    expect(screen.getByText("1h ago")).toBeInTheDocument();
  });

  it("deve mostrar mensagem quando nenhum item corresponde", () => {
    render(<ArbitrageTable items={mockItems} />);

    const searchInput = screen.getByPlaceholderText(/search item/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    expect(
      screen.getByText(/no arbitrage opportunities found/i),
    ).toBeInTheDocument();
  });

  it("deve calcular e exibir lucro liquido", () => {
    render(<ArbitrageTable items={mockItems} />);

    expect(screen.getByText("450")).toBeInTheDocument();
    expect(screen.getByText("750")).toBeInTheDocument();
  });

  it("deve exibir porcentagem de lucro", () => {
    render(<ArbitrageTable items={mockItems} />);

    expect(screen.getByText("+45.0%")).toBeInTheDocument();
    expect(screen.getByText("+37.5%")).toBeInTheDocument();
  });

  it("deve permitir ordenação pelos demais cabeçalhos", () => {
    render(<ArbitrageTable items={mockItems} />);

    fireEvent.click(screen.getByText("Buy In"));
    fireEvent.click(screen.getByText("Buy Price"));
    fireEvent.click(screen.getByText("Sell In"));
    fireEvent.click(screen.getByText("Sell Price"));
    fireEvent.click(screen.getByText("Net Profit"));
    fireEvent.click(screen.getByText("Updated"));

    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
    expect(screen.getByText("Heavy Mace T6")).toBeInTheDocument();
  });
});
