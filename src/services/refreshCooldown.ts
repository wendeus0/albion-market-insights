/**
 * Serviço de cooldown para refresh manual de dados
 * Previne spam de requisições à API
 */

export const COOLDOWN_KEY = 'albion_refresh_cooldown';
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos

export interface CooldownState {
  canRefresh: boolean;
  timeRemaining: number; // em segundos
  lastRefresh: number | null; // timestamp
}

/**
 * Verifica se o refresh está disponível
 */
export function checkCooldown(): CooldownState {
  const lastRefresh = localStorage.getItem(COOLDOWN_KEY);
  
  if (!lastRefresh) {
    return {
      canRefresh: true,
      timeRemaining: 0,
      lastRefresh: null,
    };
  }
  
  const lastRefreshTime = parseInt(lastRefresh, 10);
  const now = Date.now();
  const elapsed = now - lastRefreshTime;
  
  if (elapsed >= COOLDOWN_MS) {
    return {
      canRefresh: true,
      timeRemaining: 0,
      lastRefresh: lastRefreshTime,
    };
  }
  
  const timeRemaining = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
  return {
    canRefresh: false,
    timeRemaining,
    lastRefresh: lastRefreshTime,
  };
}

/**
 * Registra um refresh no localStorage
 */
export function recordRefresh(): void {
  localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
}

/**
 * Formata o tempo restante em formato legível (mm:ss)
 */
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Limpa o cooldown (útil para testes)
 */
export function clearCooldown(): void {
  localStorage.removeItem(COOLDOWN_KEY);
}

