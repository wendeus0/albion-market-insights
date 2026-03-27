import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }), signOut: vi.fn() },
  },
}));

vi.mock('@/contexts/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: null, loading: false, signOut: vi.fn() }),
}));

// Mock useLocation
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

const mockUseLocation = vi.mocked(useLocation);

describe("Navbar", () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: "/" } as ReturnType<
      typeof useLocation
    >);
  });

  it("deve renderizar logo e navegacao desktop", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Albion Market")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Alerts")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("deve destacar link ativo na navegacao desktop", () => {
    mockUseLocation.mockReturnValue({ pathname: "/dashboard" } as ReturnType<
      typeof useLocation
    >);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink).toHaveClass("bg-primary/10", "text-primary");
  });

  it("deve renderizar botoes de acao desktop", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("deve renderizar botao de menu mobile", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /open navigation menu/i }),
    ).toBeInTheDocument();
  });

  it("deve abrir menu mobile ao clicar no botao", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });

    // Menu deve estar fechado inicialmente (apenas desktop visível)
    expect(screen.queryAllByText("Home")).toHaveLength(1);

    fireEvent.click(menuButton);

    // Agora deve ter 2 links Home (desktop + mobile)
    expect(screen.queryAllByText("Home")).toHaveLength(2);
  });

  it("deve fechar menu mobile ao clicar em link", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });

    // Abrir menu
    fireEvent.click(menuButton);
    expect(screen.queryAllByText("Home")).toHaveLength(2);

    // Clicar em link
    const mobileLinks = screen.queryAllByText("Dashboard");
    fireEvent.click(mobileLinks[1]); // Mobile link

    // Menu deve fechar (apenas desktop visível)
    expect(screen.queryAllByText("Dashboard")).toHaveLength(1);
  });

  it("deve fechar menu mobile ao clicar novamente no botao", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });

    // Abrir menu
    fireEvent.click(menuButton);
    expect(screen.queryAllByText("Home")).toHaveLength(2);

    // Fechar menu
    fireEvent.click(menuButton);
    expect(screen.queryAllByText("Home")).toHaveLength(1);
  });

  it("deve destacar link ativo no menu mobile", () => {
    mockUseLocation.mockReturnValue({ pathname: "/alerts" } as ReturnType<
      typeof useLocation
    >);

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(menuButton);

    const alertsLinks = screen.queryAllByText("Alerts");
    expect(alertsLinks[1]).toHaveClass("bg-primary/10", "text-primary");
  });

  it("deve renderizar botoes de acao no menu mobile", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
    );

    const menuButton = screen.getByRole("button", {
      name: /open navigation menu/i,
    });
    fireEvent.click(menuButton);

    const signInLinks = screen.queryAllByRole("link", { name: "Sign In" });
    expect(signInLinks).toHaveLength(2);

    const getStartedLinks = screen.queryAllByRole("link", {
      name: "Get Started",
    });
    expect(getStartedLinks).toHaveLength(2);
  });
});
