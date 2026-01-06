import { Layout } from '@/components/layout/Layout';
import { AlertsManager } from '@/components/alerts/AlertsManager';
import { mockAlerts } from '@/data/mockData';

const Alerts = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <AlertsManager initialAlerts={mockAlerts} />
      </div>
    </Layout>
  );
};

export default Alerts;
