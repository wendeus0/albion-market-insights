import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import App from '@/App';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('@/services', () => ({
  marketService: { setStorage: vi.fn(), getAlerts: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/services/alert.storage.supabase', () => ({
  SupabaseAlertStorageService: vi.fn().mockImplementation(function () {
    return { getAlerts: vi.fn().mockResolvedValue([]), saveAlert: vi.fn(), deleteAlert: vi.fn() };
  }),
}));

vi.mock('@/services/alert.storage', () => ({
  AlertStorageService: vi.fn().mockImplementation(function () {
    return { getAlerts: vi.fn().mockReturnValue([]), saveAlert: vi.fn(), deleteAlert: vi.fn() };
  }),
}));

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
  it('deve exibir fallback enquanto rota lazy está carregando', async () => {
    // Given: /dashboard tem componente suspenso (simula lazy chunk em download)
    window.history.pushState({}, '', '/dashboard');

    // When: App é renderizado
    render(<App />);

    // Then: fallback de loading é exibido — App precisa ter Suspense com fallback
    // RED: falha porque App não tem Suspense; React lança erro ao suspender sem boundary
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Flush da resolução assíncrona de lazy imports para evitar warning de act no teardown
    await act(async () => {
      await Promise.resolve();
    });
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
