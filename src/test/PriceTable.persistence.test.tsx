import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceTable } from "@/components/dashboard/PriceTable";
import type { MarketItem } from "@/data/types";

const LOCAL_STORAGE_KEY = "albion_price_filters";

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

describe("PriceTable — persistência de filtros (AC-5)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("AC-1: Salvar filtros no localStorage", () => {
    it("deve salvar filtros ao alterar categoria", async () => {
      const user = userEvent.setup();
      render(<PriceTable items={mockItems} />);

      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.click(categorySelect);
      await user.click(await screen.findByRole("option", { name: /swords/i }));

      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
      expect(saved.categoryFilter).toBe("swords");
    });

    it("deve salvar filtros ao alterar cidade", async () => {
      const user = userEvent.setup();
      render(<PriceTable items={mockItems} />);

      const citySelect = screen.getByRole("combobox", { name: /city/i });
      await user.click(citySelect);
      await user.click(
        await screen.findByRole("option", { name: /caerleon/i }),
      );

      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
      expect(saved.cityFilter).toBe("Caerleon");
    });

    it("deve salvar filtros de preço ao digitar", async () => {
      const user = userEvent.setup();
      render(<PriceTable items={mockItems} />);

      const minPriceInput = screen.getByPlaceholderText(/min price/i);
      await user.type(minPriceInput, "60000");

      const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
      expect(saved.minPrice).toBe("60000");
    });
  });

  describe("AC-2: Restaurar filtros ao retornar", () => {
    it("deve restaurar filtros salvos ao montar o componente", () => {
      const savedFilters = {
        categoryFilter: "swords",
        cityFilter: "Caerleon",
        minPrice: "50000",
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedFilters));

      render(<PriceTable items={mockItems} />);

      // Verifica se o filtro de categoria foi restaurado
      expect(
        screen.getByRole("combobox", { name: /category/i }),
      ).toHaveTextContent(/swords/i);
    });

    it("deve aplicar filtros restaurados à tabela", () => {
      const savedFilters = {
        minPrice: "60000",
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedFilters));

      render(<PriceTable items={mockItems} />);

      // Deve mostrar apenas itens com preço >= 60000
      expect(screen.getByText("Battleaxe T5")).toBeInTheDocument();
      expect(screen.queryByText("Broadsword T4")).not.toBeInTheDocument();
    });
  });

  describe("AC-3: Limpar filtros remove persistência", () => {
    it("deve remover filtros do localStorage ao clicar Clear All", async () => {
      const user = userEvent.setup();

      // Pre-popula localStorage
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          categoryFilter: "swords",
          minPrice: "50000",
        }),
      );

      render(<PriceTable items={mockItems} />);

      const clearButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearButton);

      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      expect(saved).toBeNull();
    });

    it("deve resetar filtros para o padrão após Clear All", async () => {
      const user = userEvent.setup();

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          categoryFilter: "swords",
          cityFilter: "Caerleon",
        }),
      );

      render(<PriceTable items={mockItems} />);

      const clearButton = screen.getByRole("button", { name: /clear all/i });
      await user.click(clearButton);

      // Filtros devem voltar para "All"
      expect(
        screen.getByRole("combobox", { name: /category/i }),
      ).toHaveTextContent(/all/i);
      expect(screen.getByRole("combobox", { name: /city/i })).toHaveTextContent(
        /all/i,
      );
    });
  });

  describe("AC-4: Validação defensiva de dados persistidos", () => {
    it("deve ignorar dados inválidos no localStorage", () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, "invalid-json{{");

      // Não deve lançar erro
      expect(() => render(<PriceTable items={mockItems} />)).not.toThrow();
    });

    it("deve remover dados inválidos do localStorage", () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, "invalid-json{{");

      render(<PriceTable items={mockItems} />);

      // Deve limpar o localStorage corrompido
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
    });

    it("deve ignorar valores com tipos incorretos", () => {
      const corruptedData = {
        categoryFilter: 123, // deveria ser string
        minPrice: true, // deveria ser string
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(corruptedData));

      render(<PriceTable items={mockItems} />);

      // Deve usar valores padrão, não os corrompidos
      expect(
        screen.getByRole("combobox", { name: /category/i }),
      ).toHaveTextContent(/all/i);
    });
  });
});
