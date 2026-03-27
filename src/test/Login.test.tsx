import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: vi.fn().mockReturnValue(vi.fn()) };
});

import { supabase } from '@/lib/supabase';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import { useNavigate } from 'react-router-dom';

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function makeSubscription() {
  return { data: { subscription: { unsubscribe: vi.fn() } } };
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.onAuthStateChange as Mock).mockReturnValue(makeSubscription());
    (supabase.auth.getSession as Mock).mockResolvedValue({ data: { session: null }, error: null });
  });

  it('renderiza campos email e senha', () => {
    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('exibe erro em credenciais inválidas', async () => {
    (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid credentials' },
    });

    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('redireciona para /alerts após login bem-sucedido', async () => {
    const navigate = vi.fn();
    (useNavigate as Mock).mockReturnValue(navigate);
    (supabase.auth.signInWithPassword as Mock).mockResolvedValue({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    });

    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/alerts');
    });
  });

  it('alterna entre modo login e signup', async () => {
    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    const toggleBtn = screen.getByRole('button', { name: /criar conta/i });
    await userEvent.click(toggleBtn);

    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument();
  });

  it('mostra loading state durante request', async () => {
    let resolveSignIn!: (v: unknown) => void;
    (supabase.auth.signInWithPassword as Mock).mockReturnValue(
      new Promise((r) => { resolveSignIn = r; }),
    );

    const Wrapper = makeWrapper();
    render(<Login />, { wrapper: Wrapper });

    await userEvent.type(screen.getByLabelText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();

    resolveSignIn({ data: { session: null }, error: null });
  });
});
