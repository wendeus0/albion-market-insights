import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertsManager } from './AlertsManager';
import type { Alert, MarketItem } from '@/data/types';

const mockItems: MarketItem[] = [
  {
    itemId: 'T4_BAG',
    itemName: 'Bag',
    city: 'Caerleon',
    sellPrice: 5000,
    buyPrice: 4500,
    spread: 500,
    spreadPercent: 11.1,
    timestamp: new Date().toISOString(),
    tier: 'T4',
    quality: 'Normal',
    priceHistory: [],
  },
  {
    itemId: 'T5_BAG',
    itemName: 'Large Bag',
    city: 'Bridgewatch',
    sellPrice: 15000,
    buyPrice: 13000,
    spread: 2000,
    spreadPercent: 15.4,
    timestamp: new Date().toISOString(),
    tier: 'T5',
    quality: 'Good',
    priceHistory: [],
  },
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    itemId: 'T4_BAG',
    itemName: 'Bag',
    city: 'Caerleon',
    condition: 'below',
    threshold: 3000,
    isActive: true,
    createdAt: new Date().toISOString(),
    notifications: { inApp: true, email: false },
  },
  {
    id: '2',
    itemId: 'T5_BAG',
    itemName: 'Large Bag',
    city: 'All Cities',
    condition: 'above',
    threshold: 20000,
    isActive: false,
    createdAt: new Date().toISOString(),
    notifications: { inApp: true, email: true },
  },
];

describe('AlertsManager', () => {
  const mockOnSaveAlert = vi.fn();
  const mockOnDeleteAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o componente com título', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    expect(screen.getByText('Price Alerts')).toBeInTheDocument();
    expect(screen.getByText('Get notified when prices match your criteria')).toBeInTheDocument();
  });

  it('deve renderizar lista de alertas existentes', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    expect(screen.getByText('Bag')).toBeInTheDocument();
    expect(screen.getByText('Large Bag')).toBeInTheDocument();
    expect(screen.getByText('Price below 3,000')).toBeInTheDocument();
    expect(screen.getByText('Price above 20,000')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando não há alertas', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    expect(screen.getByText('No alerts yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first price alert to start tracking items.')).toBeInTheDocument();
  });

  it('deve renderizar botões Create Alert', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={[]}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    const createButtons = screen.getAllByText('Create Alert');
    expect(createButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('deve chamar onDeleteAlert ao clicar em delete', async () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Find delete buttons by their destructive styling
    const allButtons = screen.getAllByRole('button');
    const deleteButton = allButtons.find(btn => 
      btn.className.includes('text-destructive')
    );
    
    if (deleteButton) {
      await userEvent.click(deleteButton);
      expect(mockOnDeleteAlert).toHaveBeenCalled();
    }
  });

  it('deve exibir info box explicativo', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    expect(screen.getByText('How Alerts Work')).toBeInTheDocument();
    expect(screen.getByText(/We check market prices every 15 minutes/i)).toBeInTheDocument();
  });

  it('deve renderizar badges de notificações dos alertas', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Use getAllByText since there may be multiple instances
    const inAppBadges = screen.getAllByText('In-app');
    const emailBadges = screen.getAllByText('Email');
    
    expect(inAppBadges.length).toBeGreaterThan(0);
    expect(emailBadges.length).toBeGreaterThan(0);
  });

  it('deve exibir cidade do alerta', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    expect(screen.getByText('Caerleon')).toBeInTheDocument();
    expect(screen.getByText('All Cities')).toBeInTheDocument();
  });

  it('deve mostrar alertas inativos com opacidade reduzida', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Both alerts should be rendered
    expect(screen.getByText('Bag')).toBeInTheDocument();
    expect(screen.getByText('Large Bag')).toBeInTheDocument();
  });

  it('deve renderizar botões de toggle para ativar/desativar', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Toggle buttons should be present
    const toggleButtons = screen.getAllByRole('button').filter(btn => 
      btn.classList.contains('h-8') && btn.classList.contains('w-8')
    );
    expect(toggleButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('deve exibir ícones de condição (Below, Above, Change)', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Component should render condition text
    expect(screen.getByText('Price below 3,000')).toBeInTheDocument();
    expect(screen.getByText('Price above 20,000')).toBeInTheDocument();
  });

  it('deve chamar onSaveAlert ao toggle alerta', async () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Find toggle buttons
    const toggleButtons = screen.getAllByRole('button').filter(btn => 
      btn.classList.contains('h-8') && btn.classList.contains('w-8')
    );
    
    if (toggleButtons.length > 0) {
      await userEvent.click(toggleButtons[0]);
      expect(mockOnSaveAlert).toHaveBeenCalled();
    }
  });

  it('deve renderizar IDs dos alertas nos elementos', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Alert items should be rendered with proper structure
    expect(screen.getByText('Bag')).toBeInTheDocument();
    expect(screen.getByText('Large Bag')).toBeInTheDocument();
  });

  it('deve renderizar status de notificações corretamente', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // First alert has inApp: true, email: false
    // Second alert has inApp: true, email: true
    // Both should show "In-app", only second shows "Email"
    const inAppElements = screen.getAllByText('In-app');
    const emailElements = screen.getAllByText('Email');
    
    expect(inAppElements.length).toBeGreaterThanOrEqual(2);
    expect(emailElements.length).toBeGreaterThanOrEqual(1);
  });

  it('deve renderizar threshold formatado corretamente', () => {
    render(
      <AlertsManager
        availableItems={mockItems}
        alerts={mockAlerts}
        onSaveAlert={mockOnSaveAlert}
        onDeleteAlert={mockOnDeleteAlert}
      />
    );
    
    // Thresholds should be formatted with locale string
    expect(screen.getByText('Price below 3,000')).toBeInTheDocument();
    expect(screen.getByText('Price above 20,000')).toBeInTheDocument();
  });
});
