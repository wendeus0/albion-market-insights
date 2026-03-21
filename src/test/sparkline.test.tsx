import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sparkline } from "@/components/ui/sparkline";

describe("Sparkline", () => {
  describe("AC-1: Branches de dados inválidos", () => {
    it("retorna null quando data é undefined", () => {
      const { container } = render(
        <Sparkline data={undefined as unknown as number[]} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("retorna null quando data é null", () => {
      const { container } = render(
        <Sparkline data={null as unknown as number[]} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("retorna null quando data está vazio", () => {
      const { container } = render(<Sparkline data={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it("retorna null quando data tem apenas 1 elemento", () => {
      const { container } = render(<Sparkline data={[10]} />);
      expect(container.firstChild).toBeNull();
    });

    it("renderiza quando data tem 2 elementos", () => {
      const { container } = render(<Sparkline data={[10, 20]} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("AC-1: Branches de range", () => {
    it("renderiza corretamente quando todos os valores são iguais (range = 0)", () => {
      const { container } = render(<Sparkline data={[5, 5, 5, 5]} />);
      const polyline = container.querySelector("polyline");
      expect(polyline).toBeInTheDocument();
      expect(polyline?.getAttribute("points")).toBeTruthy();
    });
  });

  describe("AC-1: Branches de tendência", () => {
    it("detecta tendência positiva quando último valor > primeiro", () => {
      const { container } = render(<Sparkline data={[10, 20, 30]} />);
      const polyline = container.querySelector("polyline");
      expect(polyline?.getAttribute("stroke")).toBe("hsl(var(--success))");
    });

    it("detecta tendência negativa quando último valor < primeiro", () => {
      const { container } = render(<Sparkline data={[30, 20, 10]} />);
      const polyline = container.querySelector("polyline");
      expect(polyline?.getAttribute("stroke")).toBe("hsl(var(--destructive))");
    });

    it("detecta tendência neutra quando último valor = primeiro", () => {
      const { container } = render(<Sparkline data={[10, 20, 10]} />);
      const polyline = container.querySelector("polyline");
      expect(polyline?.getAttribute("stroke")).toBe(
        "hsl(var(--muted-foreground))",
      );
    });
  });

  describe("AC-1: Branches de cor", () => {
    it("usa cor explícita positive quando especificada", () => {
      const { container } = render(
        <Sparkline data={[30, 20, 10]} color="positive" />,
      );
      const polyline = container.querySelector("polyline");
      expect(polyline?.getAttribute("stroke")).toBe("hsl(var(--success))");
    });

    it("usa cor explícita negative quando especificada", () => {
      const { container } = render(
        <Sparkline data={[10, 20, 30]} color="negative" />,
      );
      const polyline = container.querySelector("polyline");
      expect(polyline?.getAttribute("stroke")).toBe("hsl(var(--destructive))");
    });

    it("usa tendência quando cor é neutral", () => {
      const { container } = render(
        <Sparkline data={[10, 20, 30]} color="neutral" />,
      );
      const polyline = container.querySelector("polyline");
      expect(polyline?.getAttribute("stroke")).toBe("hsl(var(--success))");
    });
  });

  describe("AC-1: Renderização SVG", () => {
    it("renderiza SVG com dimensões corretas", () => {
      const { container } = render(<Sparkline data={[1, 2, 3, 4, 5]} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "60");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("aplica className customizada", () => {
      const { container } = render(
        <Sparkline data={[1, 2, 3]} className="custom-class" />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toHaveClass("custom-class");
    });

    it("gera pontos corretos para os dados", () => {
      const { container } = render(<Sparkline data={[1, 2, 3]} />);
      const polyline = container.querySelector("polyline");
      const points = polyline?.getAttribute("points");
      expect(points).toBeTruthy();
      expect(points?.split(" ").length).toBe(3);
    });
  });
});
