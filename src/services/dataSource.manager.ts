/**
 * Gerenciador de estado da fonte de dados
 * Controla se estamos usando dados reais, mockados ou em estado degradado
 */

export type DataSourceState = 'real' | 'mock' | 'degraded';

export interface DataSourceStatus {
  state: DataSourceState;
  lastError?: string;
  lastSuccessfulFetch?: Date;
}

class DataSourceManager {
  private status: DataSourceStatus = { state: 'mock' };
  private listeners: Set<(status: DataSourceStatus) => void> = new Set();

  getStatus(): DataSourceStatus {
    return { ...this.status };
  }

  setReal(): void {
    this.status = {
      state: 'real',
      lastSuccessfulFetch: new Date(),
    };
    this.notify();
  }

  setMock(): void {
    this.status = { state: 'mock' };
    this.notify();
  }

  setDegraded(error: string): void {
    this.status = {
      state: 'degraded',
      lastError: error,
    };
    this.notify();
  }

  subscribe(listener: (status: DataSourceStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => listener(status));
  }
}

export const dataSourceManager = new DataSourceManager();

/**
 * Verifica se estamos em ambiente de desenvolvimento/teste
 */
export function isDevEnvironment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === 'test';
}

/**
 * Verifica se deve usar fallback para mock em caso de erro
 * Em produção: NUNCA (retorna false)
 * Em dev/test: SIM (retorna true)
 */
export function shouldUseMockFallback(): boolean {
  return isDevEnvironment();
}

