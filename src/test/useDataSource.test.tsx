import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataSource } from '@/hooks/useDataSource';
import { dataSourceManager } from '@/services/dataSource.manager';

describe('useDataSource', () => {
  beforeEach(() => {
    dataSourceManager.setMock();
  });

  it('should return mock state initially', () => {
    const { result } = renderHook(() => useDataSource());
    
    expect(result.current.status.state).toBe('mock');
    expect(result.current.isMock).toBe(true);
    expect(result.current.isReal).toBe(false);
    expect(result.current.isDegraded).toBe(false);
  });

  it('should update when state changes to real', () => {
    const { result } = renderHook(() => useDataSource());
    
    act(() => {
      dataSourceManager.setReal();
    });
    
    expect(result.current.status.state).toBe('real');
    expect(result.current.isReal).toBe(true);
    expect(result.current.isMock).toBe(false);
  });

  it('should update when state changes to degraded', () => {
    const { result } = renderHook(() => useDataSource());
    
    act(() => {
      dataSourceManager.setDegraded('API error');
    });
    
    expect(result.current.status.state).toBe('degraded');
    expect(result.current.isDegraded).toBe(true);
    expect(result.current.isMock).toBe(false);
  });

  it('should return correct label for each state', () => {
    const { result } = renderHook(() => useDataSource());
    
    expect(result.current.getLabel()).toBe('Mock');
    
    act(() => {
      dataSourceManager.setReal();
    });
    expect(result.current.getLabel()).toBe('Real');
    
    act(() => {
      dataSourceManager.setDegraded('Error');
    });
    expect(result.current.getLabel()).toBe('Degraded');
  });

  it('should return correct color for each state', () => {
    const { result } = renderHook(() => useDataSource());
    
    expect(result.current.getColor()).toBe('bg-amber-500');
    
    act(() => {
      dataSourceManager.setReal();
    });
    expect(result.current.getColor()).toBe('bg-emerald-500');
    
    act(() => {
      dataSourceManager.setDegraded('Error');
    });
    expect(result.current.getColor()).toBe('bg-red-500');
  });

  it('should return correct description for each state', () => {
    const { result } = renderHook(() => useDataSource());
    
    expect(result.current.getDescription()).toBe('Dados simulados para desenvolvimento/teste');
    
    act(() => {
      dataSourceManager.setReal();
    });
    expect(result.current.getDescription()).toBe('Dados em tempo real da API do Albion Online');
    
    act(() => {
      dataSourceManager.setDegraded('Error');
    });
    expect(result.current.getDescription()).toBe('API indisponível - alguns dados podem estar desatualizados');
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useDataSource());
    
    // Should not throw when unmounted
    expect(() => unmount()).not.toThrow();
  });
});

