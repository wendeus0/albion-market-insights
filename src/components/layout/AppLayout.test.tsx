import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";

vi.mock("@/components/layout/Layout", () => ({
  Layout: ({ children }: { children: ReactNode }) => (
    <div data-testid="shared-layout">{children}</div>
  ),
}));

describe("AppLayout", () => {
  it("deve renderizar o Layout compartilhado com o conteudo da rota filha", () => {
    render(
      <MemoryRouter initialEntries={["/"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>home content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("shared-layout")).toBeInTheDocument();
    expect(screen.getByText("home content")).toBeInTheDocument();
  });

  it("deve expor o Outlet para permitir rotas aninhadas", () => {
    render(
      <MemoryRouter initialEntries={["/nested"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/nested" element={<div>nested content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("nested content")).toBeInTheDocument();
  });
});
