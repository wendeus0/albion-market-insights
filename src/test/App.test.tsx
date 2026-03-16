import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

// AC-2: simula página que suspende indefinidamente (chunk ainda não carregado)
const neverResolves = new Promise<{ default: () => null }>(() => {});
vi.mock('@/pages/Dashboard', () => ({
  default: () => { throw neverResolves; },
}));

// window.matchMedia não existe no jsdom (usado por Sonner)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App — code-splitting', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
  });

  // AC-2: Suspense fallback exibido enquanto rota lazy carrega
  it('deve exibir fallback enquanto rota lazy está carregando', () => {
    // Given: /dashboard tem componente suspenso (simula lazy chunk em download)
    window.history.pushState({}, '', '/dashboard');

    // When: App é renderizado
    render(<App />);

    // Then: fallback de loading é exibido — App precisa ter Suspense com fallback
    // RED: falha porque App não tem Suspense; React lança erro ao suspender sem boundary
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  // AC-3: NotFound exibido para rota inexistente (deve manter comportamento estático)
  it('deve exibir NotFound para rota inexistente', () => {
    // Given: rota não mapeada no React Router
    window.history.pushState({}, '', '/rota-inexistente');

    // When: App é renderizado
    render(<App />);

    // Then: página 404 é exibida normalmente
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });
});
