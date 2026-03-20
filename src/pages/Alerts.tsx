import { AlertsManager } from "@/components/alerts/AlertsManager";
import { useMarketItems } from "@/hooks/useMarketItems";
import { useAlerts, useSaveAlert, useDeleteAlert } from "@/hooks/useAlerts";

const Alerts = () => {
  const { data: items = [] } = useMarketItems();
  const { data: alerts = [] } = useAlerts();
  const saveAlert = useSaveAlert();
  const deleteAlert = useDeleteAlert();

  return (
    <div className="container mx-auto px-4 py-8">
      <AlertsManager
        availableItems={items}
        alerts={alerts}
        onSaveAlert={(alert) => saveAlert.mutate(alert)}
        onDeleteAlert={(id) => deleteAlert.mutate(id)}
      />
    </div>
  );
};

export default Alerts;
