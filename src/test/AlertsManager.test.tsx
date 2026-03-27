import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertsManager } from '@/components/alerts/AlertsManager';
import type { Alert, MarketItem } from '@/data/types';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
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
    quality: 'Normal',
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
    onSaveAlert: vi.fn().mockResolvedValue(undefined),
    onDeleteAlert: vi.fn().mockResolvedValue(undefined),
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
    vi.clearAllMocks();
  });

  it('renderiza lista de alertas', () => {
    render(<AlertsManager {...defaultProps} />);
    expect(screen.getByText('Clarent Blade')).toBeDefined();
  });

  it('renderiza canais de notificacao do alerta ativo', () => {
    render(<AlertsManager {...defaultProps} />);
    expect(screen.getByText(/in-app/i)).toBeDefined();
    expect(screen.queryByText(/email/i)).toBeNull();
  });

  it('renderiza com availableItems como prop', () => {
    const { container } = render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn().mockResolvedValue(undefined)}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(container).toBeDefined();
    expect(screen.getByText('No alerts yet')).toBeDefined();
  });

  it('chama onDeleteAlert ao clicar em delete', async () => {
    const onDeleteAlert = vi.fn().mockResolvedValue(undefined);
    render(<AlertsManager {...defaultProps} onDeleteAlert={onDeleteAlert} />);
    const deleteButtons = screen.getAllByRole('button');
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(onDeleteAlert).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith(
        'Alert deleted',
        expect.objectContaining({ description: expect.any(String) }),
      );
    });
  });

  it('chama onSaveAlert (toggle) ao clicar no botão de toggle', async () => {
    const onSaveAlert = vi.fn().mockResolvedValue(undefined);
    render(<AlertsManager {...defaultProps} onSaveAlert={onSaveAlert} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 2]);

    await waitFor(() => {
      expect(onSaveAlert).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1', isActive: false }),
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Alert disabled',
        expect.objectContaining({ description: 'Your alert for Clarent Blade has been disabled.' }),
      );
    });
  });

  it('exibe "No alerts yet" quando lista de alertas está vazia', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn().mockResolvedValue(undefined)}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText('No alerts yet')).toBeDefined();
  });

  it('exibe erro de validação ao submeter sem selecionar item', async () => {
    const user = userEvent.setup();
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn().mockResolvedValue(undefined)}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: /create alert/i })[0]);
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Selecione um item')).toBeDefined();
    });
  });

  it('não chama onSaveAlert quando formulário é inválido', async () => {
    const user = userEvent.setup();
    const onSaveAlert = vi.fn().mockResolvedValue(undefined);
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={onSaveAlert}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );
    await user.click(screen.getAllByRole('button', { name: /create alert/i })[0]);
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(screen.getByText('Selecione um item')).toBeDefined();
    });
    expect(onSaveAlert).not.toHaveBeenCalled();
  });

  it('cria alerta com city all e item conhecido', async () => {
    const onSaveAlert = vi.fn().mockResolvedValue(undefined);
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={onSaveAlert}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = await openCreateDialog();
    await selectDialogOption(/item/i, /clarent blade/i);
    await user.clear(screen.getByPlaceholderText(/e\.g\., 50000/i));
    await user.type(screen.getByPlaceholderText(/e\.g\., 50000/i), '25000');
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
        expect(onSaveAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            itemId: 'ITEM_0001',
            itemName: 'Clarent Blade',
            quality: 'Normal',
            city: 'all',
            condition: 'below',
          threshold: 25000,
          isActive: true,
        }),
      );
    });
  });

  it('cria alerta de change com percentual no toast', async () => {
    const onSaveAlert = vi.fn().mockResolvedValue(undefined);
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={onSaveAlert}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = await openCreateDialog();
    await selectDialogOption(/item/i, /bloodletter/i);
    await user.click(screen.getByRole('button', { name: /change/i }));
    await user.clear(screen.getByPlaceholderText(/e\.g\., 15/i));
    await user.type(screen.getByPlaceholderText(/e\.g\., 15/i), '12');
    const submitButtons = screen.getAllByRole('button', { name: /create alert/i });
    await user.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
        expect(onSaveAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            itemName: 'Bloodletter',
            quality: 'Good',
            condition: 'change',
            threshold: 12,
        }),
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Alert created!',
        expect.objectContaining({
          description: expect.stringContaining('12%'),
        }),
      );
    });
  });

  it('filtra itens pelo termo digitado', async () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn().mockResolvedValue(undefined)}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = await openCreateDialog();
    await user.type(screen.getByPlaceholderText(/search by item name/i), 'blood');
    await user.click(screen.getByRole('combobox', { name: /item/i }));

    expect(screen.getByRole('option', { name: /bloodletter/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /clarent blade/i })).toBeNull();
  });

  it('filtra itens por tokens de tier e quality', async () => {
    render(
      <AlertsManager
        availableItems={[
          ...mockItems,
          {
            ...mockItems[0],
            itemId: 'T4_MAIN_SWORD',
            itemName: 'Carving Sword',
            tier: 'T4',
            quality: 'Masterpiece',
          },
          {
            ...mockItems[0],
            itemId: 'T4_MAIN_SWORD@2',
            itemName: 'Carving Sword',
            tier: 'T4',
            quality: 'Excellent',
          },
        ]}
        alerts={[]}
        onSaveAlert={vi.fn().mockResolvedValue(undefined)}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = await openCreateDialog();
    await user.type(screen.getByPlaceholderText(/search by item name/i), 'carving t4 masterpiece');
    await user.click(screen.getByRole('combobox', { name: /item/i }));

    expect(screen.getByRole('option', { name: /carving sword/i })).toBeInTheDocument();
    expect(screen.getByText('Masterpiece')).toBeInTheDocument();
    expect(screen.queryByText('Excellent')).toBeNull();
  });

  it('exibe tier com encantamento e qualidade como metadados da opcao', async () => {
    render(
      <AlertsManager
        availableItems={[
          ...mockItems,
          {
            ...mockItems[0],
            itemId: 'ITEM_0001@2',
            quality: 'Excellent',
          },
        ]}
        alerts={[]}
        onSaveAlert={vi.fn().mockResolvedValue(undefined)}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await openCreateDialog();
    await userEvent.click(screen.getByRole('combobox', { name: /item/i }));

    expect(screen.getAllByRole('option', { name: /clarent blade/i })).toHaveLength(2);
    expect(screen.getByText('T4.2')).toBeInTheDocument();
    expect(screen.getByText('Ench. 2')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
  });

  it('preenche threshold sugerido ao selecionar item e mudar condição', async () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={vi.fn().mockResolvedValue(undefined)}
        onDeleteAlert={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const user = await openCreateDialog();
    await selectDialogOption(/item/i, /clarent blade/i);

    await waitFor(() => {
      expect(screen.getByDisplayValue('42750')).toBeInTheDocument();
      expect(screen.getByText(/suggested threshold: 42,750/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /above/i }));

    await waitFor(() => {
      expect(screen.getByDisplayValue('47250')).toBeInTheDocument();
      expect(screen.getByText(/suggested threshold: 47,250/i)).toBeInTheDocument();
    });
  });

  it('desabilita acoes e exibe spinner durante mutacao pendente', async () => {
    let resolveToggle!: () => void;
    const onSaveAlert = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveToggle = resolve;
        }),
    );

    render(<AlertsManager {...defaultProps} onSaveAlert={onSaveAlert} />);

    await userEvent.click(screen.getByRole('button', { name: /disable alert/i }));

    expect(screen.getByRole('button', { name: /disable alert/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /delete alert/i })).toBeDisabled();
    expect(document.querySelector('.animate-spin')).not.toBeNull();

    resolveToggle();

    await waitFor(() => {
      expect(onSaveAlert).toHaveBeenCalled();
    });
  });
});
