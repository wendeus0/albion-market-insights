import { Outlet } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
