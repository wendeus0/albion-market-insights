import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertsManager } from '@/components/alerts/AlertsManager';
import type { Alert, MarketItem } from '@/data/types';

const toastSpy = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastSpy }),
}));

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

  const openCreateDialog = async () => {
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: /create alert/i })[0]);
    return user;
  };

  async function selectDialogOption(triggerText: RegExp | string, optionText: RegExp | string) {
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox', { name: triggerText }));
    await user.click(await screen.findByRole('option', { name: optionText }));
  }

  beforeEach(() => {
    toastSpy.mockClear();
  });

  it('renderiza lista de alertas', () => {
    // Given / When
    render(<AlertsManager {...defaultProps} />);

    // Then
    expect(screen.getByText('Clarent Blade')).toBeDefined();
  });

  it('renderiza canais de notificacao do alerta ativo', () => {
    render(<AlertsManager {...defaultProps} />);

    expect(screen.getByText(/in-app/i)).toBeDefined();
    expect(screen.queryByText(/email/i)).toBeNull();
  });

  it('renderiza com availableItems como prop (não mockData)', () => {
    // Given / When
    const { container } = render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn()}
        onDeleteAlert={vi.fn()}
      />
    );

    // Then
    expect(container).toBeDefined();
    expect(screen.getByText('No alerts yet')).toBeDefined();
  });

  it('chama onDeleteAlert ao clicar em delete', () => {
    // Given
    const onDeleteAlert = vi.fn();
    render(<AlertsManager {...defaultProps} onDeleteAlert={onDeleteAlert} />);
    const deleteButtons = screen.getAllByRole('button');

    // When
    const trashButton = deleteButtons[deleteButtons.length - 1];
    fireEvent.click(trashButton);

    // Then
    expect(onDeleteAlert).toHaveBeenCalledWith('1');
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Alert deleted', variant: 'destructive' })
    );
  });

  it('chama onSaveAlert (toggle) ao clicar no botão de toggle', () => {
    // Given
    const onSaveAlert = vi.fn();
    render(<AlertsManager {...defaultProps} onSaveAlert={onSaveAlert} />);
    const buttons = screen.getAllByRole('button');

    // When
    const toggleButton = buttons[buttons.length - 2];
    fireEvent.click(toggleButton);

    // Then
    expect(onSaveAlert).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', isActive: false })
    );
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Alert updated' })
    );
  });

  it('exibe "No alerts yet" quando lista de alertas está vazia', () => {
    // Given / When
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn()}
        onDeleteAlert={vi.fn()}
      />
    );

    // Then
    expect(screen.getByText('No alerts yet')).toBeDefined();
  });

  it('exibe erro de validação ao submeter sem selecionar item', async () => {
    // Given
    const user = userEvent.setup();
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn()}
        onDeleteAlert={vi.fn()}
      />
    );
    await user.click(screen.getAllByRole('button', { name: /create alert/i })[0]);

    // When
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    // Then
    await waitFor(() => {
      expect(screen.getByText('Selecione um item')).toBeDefined();
    });
  });

  it('não chama onSaveAlert quando formulário é inválido', async () => {
    // Given
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

    // When
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    // Then
    await waitFor(() => {
      expect(screen.getByText('Selecione um item')).toBeDefined();
    });
    expect(onSaveAlert).not.toHaveBeenCalled();
  });

  it('cria alerta com city all e item conhecido', async () => {
    const onSaveAlert = vi.fn();
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={onSaveAlert}
        onDeleteAlert={vi.fn()}
      />
    );

    const user = await openCreateDialog();
    await selectDialogOption(/item/i, /clarent blade/i);
    await user.type(screen.getByPlaceholderText(/e\.g\., 50000/i), '25000');
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(onSaveAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          itemId: 'ITEM_0001',
          itemName: 'Clarent Blade',
          city: 'All Cities',
          condition: 'below',
          threshold: 25000,
          isActive: true,
        })
      );
    });
  });

  it('cria alerta de change com percentual no toast', async () => {
    const onSaveAlert = vi.fn();
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={onSaveAlert}
        onDeleteAlert={vi.fn()}
      />
    );

    const user = await openCreateDialog();
    await selectDialogOption(/item/i, /bloodletter/i);
    await user.click(screen.getByRole('button', { name: /change/i }));
    await user.type(screen.getByPlaceholderText(/e\.g\., 15/i), '12');
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(onSaveAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          itemName: 'Bloodletter',
          condition: 'change',
          threshold: 12,
        })
      );
      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Alert created!',
          description: expect.stringContaining('12%'),
        })
      );
    });
  });
});
