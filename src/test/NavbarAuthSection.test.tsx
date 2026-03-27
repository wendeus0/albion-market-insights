import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({ user: null, loading: false, signOut: vi.fn() }),
}));

import { useAuth } from '@/contexts/useAuth';
import { NavbarAuthSection } from '@/components/layout/NavbarAuthSection';

const mockSignOut = vi.fn();

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('NavbarAuthSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(undefined);
    (useAuth as Mock).mockReturnValue({ user: null, loading: false, signOut: mockSignOut });
  });

  it('exibe Sign In e Get Started quando não autenticado', () => {
    render(<NavbarAuthSection />, { wrapper });

    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });

  it('exibe email do usuário e botão Logout quando autenticado', () => {
    (useAuth as Mock).mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' },
      loading: false,
      signOut: mockSignOut,
    });

    render(<NavbarAuthSection />, { wrapper });

    expect(screen.getByText(/test@test\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('chama signOut ao clicar em Logout', async () => {
    (useAuth as Mock).mockReturnValue({
      user: { id: 'u1', email: 'test@test.com' },
      loading: false,
      signOut: mockSignOut,
    });

    render(<NavbarAuthSection />, { wrapper });

    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
