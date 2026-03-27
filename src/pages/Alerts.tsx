import { AlertsManager } from "@/components/alerts/AlertsManager";
import { useMarketItems } from "@/hooks/useMarketItems";
import { useAlerts, useSaveAlert, useDeleteAlert } from "@/hooks/useAlerts";
import { useAuth } from "@/contexts/useAuth";
import { AuthBanner } from "@/components/auth/AuthBanner";

const Alerts = () => {
  const { data: items = [] } = useMarketItems();
  const { data: alerts = [] } = useAlerts();
  const saveAlert = useSaveAlert();
  const deleteAlert = useDeleteAlert();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      {!user && <AuthBanner />}
      <AlertsManager
        availableItems={items}
        alerts={alerts}
        onSaveAlert={(alert) => saveAlert.mutateAsync(alert)}
        onDeleteAlert={(id) => deleteAlert.mutateAsync(id)}
      />
    </div>
  );
};

export default Alerts;
