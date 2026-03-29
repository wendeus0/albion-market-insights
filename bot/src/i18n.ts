export type Locale = string | null | undefined;

const messages = {
  pt: {
    registerSuccess:
      "Conta vinculada com sucesso. As notificações por DM estão ativas.",
    registerInvalid: "Token inválido ou expirado. Gere um novo no site.",
    registerError: "Não foi possível concluir a vinculação. Tente novamente.",
    registerRequired:
      "Sua conta ainda não está vinculada. Use /register <token>.",
    alertsTitle: "Seus alertas ativos",
    alertsEmpty: "Você não tem alertas ativos.",
    alertsError: "Não foi possível consultar seus alertas agora.",
    alertTriggered: "Alerta disparado",
    manageAlerts: "Gerenciar Alertas",
    dashboard: "Dashboard",
    interactionError: "Ocorreu um erro ao processar o comando.",
  },
  en: {
    registerSuccess:
      "Account linked successfully. DM notifications are active.",
    registerInvalid:
      "Invalid or expired token. Generate a new one on the website.",
    registerError: "Could not complete account linking. Please try again.",
    registerRequired:
      "Your account is not linked yet. Use /register <token> first.",
    alertsTitle: "Your active alerts",
    alertsEmpty: "You have no active alerts.",
    alertsError: "Could not load your alerts right now.",
    alertTriggered: "Alert triggered",
    manageAlerts: "Manage Alerts",
    dashboard: "Dashboard",
    interactionError:
      "An unexpected error occurred while processing the command.",
  },
};

export function getMessages(locale: Locale) {
  return locale?.toLowerCase().startsWith("pt") ? messages.pt : messages.en;
}
