import { useState, useEffect, useCallback } from 'react';
import {
  dataSourceManager,
  type DataSourceStatus,
  type DataSourceState,
} from '@/services/dataSource.manager';

export interface UseDataSourceReturn {
  status: DataSourceStatus;
  isReal: boolean;
  isMock: boolean;
  isDegraded: boolean;
  getLabel: () => string;
  getColor: () => string;
  getDescription: () => string;
}

const STATE_LABELS: Record<DataSourceState, string> = {
  real: 'Real',
  mock: 'Mock',
  degraded: 'Degraded',
};

const STATE_COLORS: Record<DataSourceState, string> = {
  real: 'bg-emerald-500',
  mock: 'bg-amber-500',
  degraded: 'bg-red-500',
};

const STATE_DESCRIPTIONS: Record<DataSourceState, string> = {
  real: 'Dados em tempo real da API do Albion Online',
  mock: 'Dados simulados para desenvolvimento/teste',
  degraded: 'API indisponível - alguns dados podem estar desatualizados',
};

export function useDataSource(): UseDataSourceReturn {
  const [status, setStatus] = useState<DataSourceStatus>(
    dataSourceManager.getStatus()
  );

  useEffect(() => {
    return dataSourceManager.subscribe(newStatus => {
      setStatus(newStatus);
    });
  }, []);

  const getLabel = useCallback(() => STATE_LABELS[status.state], [status.state]);
  const getColor = useCallback(() => STATE_COLORS[status.state], [status.state]);
  const getDescription = useCallback(
    () => STATE_DESCRIPTIONS[status.state],
    [status.state]
  );

  return {
    status,
    isReal: status.state === 'real',
    isMock: status.state === 'mock',
    isDegraded: status.state === 'degraded',
    getLabel,
    getColor,
    getDescription,
  };
}

