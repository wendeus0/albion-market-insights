import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataSourceBadge } from '@/components/dashboard/DataSourceBadge';
import { DegradedBanner } from '@/components/dashboard/DegradedBanner';
import { dataSourceManager } from '@/services/dataSource.manager';

describe('DataSourceBadge', () => {
  beforeEach(() => {
    dataSourceManager.setMock();
  });

  it('should render with Mock label by default', () => {
    render(<DataSourceBadge />);
    expect(screen.getByText('Mock')).toBeInTheDocument();
  });

  it('should show Real label when in real mode', () => {
    dataSourceManager.setReal();
    render(<DataSourceBadge />);
    expect(screen.getByText('Real')).toBeInTheDocument();
  });

  it('should show Degraded label when in degraded mode', () => {
    dataSourceManager.setDegraded('API error');
    render(<DataSourceBadge />);
    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });

  it('should render badge with correct styling in mock mode', () => {
    render(<DataSourceBadge />);
    const badge = screen.getByText('Mock');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('div')).toHaveClass('bg-amber-500');
  });

  it('should render badge with correct styling in real mode', () => {
    dataSourceManager.setReal();
    render(<DataSourceBadge />);
    const badge = screen.getByText('Real');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('div')).toHaveClass('bg-emerald-500');
  });

  it('should render badge with correct styling in degraded mode', () => {
    dataSourceManager.setDegraded('Error');
    render(<DataSourceBadge />);
    const badge = screen.getByText('Degraded');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('div')).toHaveClass('bg-red-500');
  });
});

describe('DegradedBanner', () => {
  beforeEach(() => {
    dataSourceManager.setMock();
  });

  it('should not render when not in degraded mode', () => {
    const { container } = render(<DegradedBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when in degraded mode', () => {
    dataSourceManager.setDegraded('API timeout');
    render(<DegradedBanner />);
    
    expect(screen.getByText(/Dados em Modo Degradado/)).toBeInTheDocument();
    expect(screen.getByText(/Não foi possível conectar/)).toBeInTheDocument();
  });

  it('should display error message', () => {
    dataSourceManager.setDegraded('Connection refused');
    render(<DegradedBanner />);
    
    expect(screen.getByText(/Connection refused/)).toBeInTheDocument();
  });

  it('should have alert role for accessibility', () => {
    dataSourceManager.setDegraded('Error');
    render(<DegradedBanner />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

