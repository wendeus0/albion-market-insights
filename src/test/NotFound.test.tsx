import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '@/pages/NotFound';

describe('NotFound', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('não chama console.error ao renderizar página 404', () => {
    // Given
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // When
    render(
      <MemoryRouter initialEntries={['/rota-inexistente']}>
        <NotFound />
      </MemoryRouter>
    );

    // Then
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
