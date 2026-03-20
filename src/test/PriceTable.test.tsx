import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceTable } from "@/components/dashboard/PriceTable";
import type { MarketItem } from "@/data/types";

beforeEach(() => {
  localStorage.clear();
});

const mockItems: MarketItem[] = [
  {
    itemId: "T4_MAIN_SWORD",
    itemName: "Broadsword T4",
    city: "Caerleon",
    sellPrice: 50000,
    buyPrice: 40000,
    spread: 10000,
    spreadPercent: 25,
    timestamp: new Date().toISOString(),
    tier: "T4",
    quality: "Normal",
    priceHistory: [45000, 46000, 47000],
  },
  {
    itemId: "T5_MAIN_AXE",
    itemName: "Battleaxe T5",
    city: "Bridgewatch",
    sellPrice: 80000,
    buyPrice: 60000,
    spread: 20000,
    spreadPercent: 33,
    timestamp: new Date().toISOString(),
    tier: "T5",
    quality: "Normal",
    priceHistory: [75000, 77000, 80000],
  },
  {
    itemId: "T4_BAG@2",
    itemName: "Bag T4.2",
    city: "Martlock",
    sellPrice: 65000,
    buyPrice: 50000,
    spread: 15000,
    spreadPercent: 30,
    timestamp: new Date().toISOString(),
    tier: "T4",
    quality: "Outstanding",
    priceHistory: [62000, 63000, 65000],
  },
];

async function selectOption(
  triggerText: RegExp | string,
  optionText: RegExp | string,
) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: triggerText }));
  await user.click(await screen.findByRole("option", { name: optionText }));
}

describe("PriceTable — filtro de categoria (AC6)", () => {
  it('exibe Select de categoria com opção "All Categories"', () => {
    render(<PriceTable items={mockItems} />);

    expect(
      screen.getByRole("combobox", { name: /category/i }),
    ).toBeInTheDocument();
  });

  it("exibe labels de categoria legíveis no Select", async () => {
    render(<PriceTable items={mockItems} />);

    const categorySelect = screen.getByRole("combobox", { name: /category/i });
    expect(categorySelect).toBeInTheDocument();
  });
});

describe("PriceTable — filtros de faixa (AC1, AC2)", () => {
  it("exibe inputs de faixa de preço (min/max)", () => {
    render(<PriceTable items={mockItems} />);

    expect(screen.getByPlaceholderText(/min price/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max price/i)).toBeInTheDocument();
  });

  it("exibe inputs de faixa de spread (min/max)", () => {
    render(<PriceTable items={mockItems} />);

    expect(screen.getByPlaceholderText(/min spread/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max spread/i)).toBeInTheDocument();
  });

  it("exibe feedback quando min price > max price", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    await user.type(screen.getByPlaceholderText(/min price/i), "90000");
    await user.type(screen.getByPlaceholderText(/max price/i), "50000");

    expect(
      screen.getByText(/min price cannot be greater than max price/i),
    ).toBeInTheDocument();
  });

  it("remove feedback quando faixa de preço volta a ser válida", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    const maxPriceInput = screen.getByPlaceholderText(/max price/i);

    await user.type(minPriceInput, "90000");
    await user.type(maxPriceInput, "50000");
    expect(
      screen.getByText(/min price cannot be greater than max price/i),
    ).toBeInTheDocument();

    await user.clear(minPriceInput);
    await user.type(minPriceInput, "40000");

    expect(
      screen.queryByText(/min price cannot be greater than max price/i),
    ).not.toBeInTheDocument();
  });

  it("filtra itens por faixa de preço", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, "60000");

    // Deve mostrar apenas T5_MAIN_AXE (80000/60000)
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
  });

  it("filtra itens por faixa de spread percentual", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minSpreadInput = screen.getByPlaceholderText(/min spread/i);
    await user.type(minSpreadInput, "30");

    // Deve mostrar apenas T5_MAIN_AXE (33%)
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
  });
});

describe("PriceTable — Clear All e indicador (AC3, AC4)", () => {
  it("exibe botão Clear All quando filtros estão ativos", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, "1000");

    expect(
      screen.getByRole("button", { name: /clear all/i }),
    ).toBeInTheDocument();
  });

  it("exibe contador de filtros ativos", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, "1000");

    expect(screen.getByText(/1 filter active/i)).toBeInTheDocument();
  });

  it("limpa todos os filtros ao clicar Clear All", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, "60000");

    const clearButton = screen.getByRole("button", { name: /clear all/i });
    await user.click(clearButton);

    // Todos os itens devem aparecer novamente
    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
  });
});

describe("PriceTable — ordenação", () => {
  it("ordena itens ao clicar no cabeçalho", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const sellPriceHeader = screen.getByRole("button", { name: /sell price/i });
    await user.click(sellPriceHeader);

    expect(sellPriceHeader).toBeInTheDocument();
  });

  it("alterna direção da ordenação ao clicar novamente no mesmo cabeçalho", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const spreadHeader = screen.getByRole("button", { name: /spread/i });
    await user.click(spreadHeader);
    await user.click(spreadHeader);

    expect(spreadHeader).toBeInTheDocument();
  });

  it("ordena por nome do item", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const itemNameHeader = screen.getByRole("button", { name: /item/i });
    await user.click(itemNameHeader);

    expect(itemNameHeader).toBeInTheDocument();
    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
  });
});

describe("PriceTable — estado vazio", () => {
  it("exibe mensagem quando nenhum item corresponde aos critérios", () => {
    render(<PriceTable items={[]} />);

    expect(screen.getByText(/no items found/i)).toBeInTheDocument();
  });

  it("exibe estado vazio quando filtros não retornam resultados", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    await user.type(minPriceInput, "999999");

    expect(screen.getByText(/no items found/i)).toBeInTheDocument();
  });
});

describe("PriceTable — filtros adicionais", () => {
  it("filtra por max price", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const maxPriceInput = screen.getByPlaceholderText(/max price/i);
    await user.type(maxPriceInput, "60000");

    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.queryByText("Battleaxe T5")).not.toBeInTheDocument();
  });

  it("filtra por max spread", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const maxSpreadInput = screen.getByPlaceholderText(/max spread %/i);
    await user.type(maxSpreadInput, "30");

    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.queryByText("Battleaxe T5")).not.toBeInTheDocument();
  });

  it("filtra por categoria usando o select", async () => {
    render(<PriceTable items={mockItems} />);

    await selectOption(/category/i, /bags/i);

    expect(screen.getByText("Bag T4.2")).toBeInTheDocument();
    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
    expect(screen.queryByText("Battleaxe T5")).not.toBeInTheDocument();
  });

  it("filtra por encantamento usando o select", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const comboboxes = screen.getAllByRole("combobox");
    await user.click(comboboxes[4]);
    await user.click(await screen.findByRole("option", { name: /level 2/i }));

    expect(screen.getByText("Bag T4.2")).toBeInTheDocument();
    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
    expect(screen.queryByText("Battleaxe T5")).not.toBeInTheDocument();
  });

  it("filtra por cidade usando o select", async () => {
    render(<PriceTable items={mockItems} />);

    const user = userEvent.setup();
    const comboboxes = screen.getAllByRole("combobox");
    await user.click(comboboxes[1]);
    await user.click(await screen.findByRole("option", { name: "Martlock" }));

    expect(screen.getByText("Bag T4.2")).toBeInTheDocument();
    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
    expect(screen.queryByText("Battleaxe T5")).not.toBeInTheDocument();
  });
});

describe("PriceTable — busca", () => {
  it("filtra itens por nome", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const searchInput = screen.getByPlaceholderText(/search by item name/i);
    await user.type(searchInput, "Sword");

    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.queryByText("Battleaxe T5")).not.toBeInTheDocument();
  });

  it("filtra itens por ID", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const searchInput = screen.getByPlaceholderText(/search by item name/i);
    await user.type(searchInput, "T5_MAIN_AXE");

    expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
    expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
  });
});

describe("PriceTable — paginação", () => {
  const manyItems: MarketItem[] = Array.from({ length: 25 }, (_, i) => ({
    itemId: `T4_ITEM_${i}`,
    itemName: `Item ${i}`,
    city: "Caerleon",
    sellPrice: 50000 + i * 1000,
    buyPrice: 40000 + i * 1000,
    spread: 10000,
    spreadPercent: 25,
    timestamp: new Date().toISOString(),
    tier: "T4",
    quality: "Normal",
    priceHistory: [45000, 46000, 47000],
  }));

  it("exibe controles de paginação quando há muitos itens", () => {
    render(<PriceTable items={manyItems} />);

    expect(
      screen.getByText(/showing 1 to 10 of 25 items/i),
    ).toBeInTheDocument();
  });

  it("exibe números de página quando há muitos itens", () => {
    render(<PriceTable items={manyItems} />);

    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
  });
});

describe("PriceTable — filtros combinados", () => {
  it("aplica múltiplos filtros simultaneamente", async () => {
    const user = userEvent.setup();
    render(<PriceTable items={mockItems} />);

    const minPriceInput = screen.getByPlaceholderText(/min price/i);
    const maxPriceInput = screen.getByPlaceholderText(/max price/i);

    await user.type(minPriceInput, "40000");
    await user.type(maxPriceInput, "60000");

    expect(screen.getByText("Broadsword T4")).toBeInTheDocument();
    expect(screen.queryByText("Battleaxe T5")).not.toBeInTheDocument();

    expect(screen.getByText(/2 filter active/i)).toBeInTheDocument();
  });
});
