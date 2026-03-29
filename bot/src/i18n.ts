export type Locale = string | null | undefined;

const messages = {
  pt: {
    registerSuccess:
      "Conta vinculada com sucesso. As notificacoes por DM estao ativas.",
    registerInvalid: "Token invalido ou expirado. Gere um novo no site.",
    alertsTitle: "Seus alertas ativos",
    alertsEmpty: "Voce nao tem alertas ativos.",
    alertTriggered: "Alerta disparado",
    manageAlerts: "Gerenciar Alertas",
    dashboard: "Dashboard",
  },
  en: {
    registerSuccess:
      "Account linked successfully. DM notifications are active.",
    registerInvalid:
      "Invalid or expired token. Generate a new one on the website.",
    alertsTitle: "Your active alerts",
    alertsEmpty: "You have no active alerts.",
    alertTriggered: "Alert triggered",
    manageAlerts: "Manage Alerts",
    dashboard: "Dashboard",
  },
};

export function getMessages(locale: Locale) {
  return locale?.toLowerCase().startsWith("pt") ? messages.pt : messages.en;
}
