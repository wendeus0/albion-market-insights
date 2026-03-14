import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertsManager } from '@/components/alerts/AlertsManager';
import type { Alert, MarketItem } from '@/data/types';

const mockItems: MarketItem[] = [
  {
    itemId: 'ITEM_0001',
    itemName: 'Clarent Blade',
    city: 'Caerleon',
    sellPrice: 50000,
    buyPrice: 40000,
    spread: 10000,
    spreadPercent: 25,
    timestamp: new Date().toISOString(),
    tier: 'T4',
    quality: 'Normal',
    priceHistory: [45000, 46000, 47000],
  },
  {
    itemId: 'ITEM_0002',
    itemName: 'Bloodletter',
    city: 'Bridgewatch',
    sellPrice: 80000,
    buyPrice: 60000,
    spread: 20000,
    spreadPercent: 33,
    timestamp: new Date().toISOString(),
    tier: 'T5',
    quality: 'Good',
    priceHistory: [75000, 77000, 80000],
  },
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    itemId: 'ITEM_0001',
    itemName: 'Clarent Blade',
    city: 'Caerleon',
    condition: 'below',
    threshold: 25000,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    notifications: { inApp: true, email: false },
  },
];

describe('AlertsManager', () => {
  const defaultProps = {
    availableItems: mockItems,
    alerts: mockAlerts,
    onSaveAlert: vi.fn(),
    onDeleteAlert: vi.fn(),
  };

  it('renderiza lista de alertas', () => {
    render(<AlertsManager {...defaultProps} />);
    expect(screen.getByText('Clarent Blade')).toBeDefined();
  });

  it('renderiza com availableItems como prop (não mockData)', () => {
    const { container } = render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn()}
        onDeleteAlert={vi.fn()}
      />
    );
    expect(container).toBeDefined();
    // Sem alerts, mostra estado vazio
    expect(screen.getByText('No alerts yet')).toBeDefined();
  });

  it('chama onDeleteAlert ao clicar em delete', () => {
    const onDeleteAlert = vi.fn();
    render(<AlertsManager {...defaultProps} onDeleteAlert={onDeleteAlert} />);
    const deleteButtons = screen.getAllByRole('button');
    // Último botão é o de delete
    const trashButton = deleteButtons[deleteButtons.length - 1];
    fireEvent.click(trashButton);
    expect(onDeleteAlert).toHaveBeenCalledWith('1');
  });

  it('chama onSaveAlert (toggle) ao clicar no botão de toggle', () => {
    const onSaveAlert = vi.fn();
    render(<AlertsManager {...defaultProps} onSaveAlert={onSaveAlert} />);
    const buttons = screen.getAllByRole('button');
    // Penúltimo botão é o de toggle
    const toggleButton = buttons[buttons.length - 2];
    fireEvent.click(toggleButton);
    expect(onSaveAlert).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', isActive: false })
    );
  });

  it('exibe "No alerts yet" quando lista de alertas está vazia', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn()}
        onDeleteAlert={vi.fn()}
      />
    );
    expect(screen.getByText('No alerts yet')).toBeDefined();
  });

  it('exibe erro de validação ao submeter sem selecionar item', async () => {
    const user = userEvent.setup();
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn()}
        onDeleteAlert={vi.fn()}
      />
    );

    // Abre o dialog
    await user.click(screen.getAllByRole('button', { name: /create alert/i })[0]);

    // Submete sem preencher item
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Selecione um item')).toBeDefined();
    });
  });

  it('não chama onSaveAlert quando formulário é inválido', async () => {
    const user = userEvent.setup();
    const onSaveAlert = vi.fn();
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={onSaveAlert}
        onDeleteAlert={vi.fn()}
      />
    );

    await user.click(screen.getAllByRole('button', { name: /create alert/i })[0]);

    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Selecione um item')).toBeDefined();
    });

    expect(onSaveAlert).not.toHaveBeenCalled();
  });
});
