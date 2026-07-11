import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BuildingCreatePage from "./features/buildings/pages/BuildingCreatePage.jsx";
import RoomListPage from "./features/rooms/pages/RoomListPage.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import { useEffect, useState } from "react";
import { getAllBuildingsByManagerId } from "./features/buildings/services/buildingApi.js";
import RoomDetails from "./features/rooms/pages/RoomDetails.jsx";
import TenantsManagePage from "./features/tenants_vehicles/pages/TenantsManagePage.jsx";
import VehiclesDashboardPage from "./features/tenants_vehicles/pages/VehiclesDashboardPage.jsx";
import DashboardPage from "./features/billing/pages/DashboardPage.jsx";
import InvoiceListPage from "./features/billing/pages/InvoiceListPage.jsx";
import BulkCalculatePage from "./features/billing/pages/BulkCalculatePage.jsx";
import PaymentSimulationPage from "./features/billing/pages/PaymentSimulationPage.jsx";
import PaymentSuccessPage from "./features/billing/pages/PaymentSuccessPage.jsx";
import PaymentCancelPage from "./features/billing/pages/PaymentCancelPage.jsx";
import "./features/billing/billing.css";

function App() {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    const loadBuildingByAccountId = async () => {
      const buildings = await getAllBuildingsByManagerId(2);
      setBuildings(buildings);
    };
    loadBuildingByAccountId();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/buildings/new" element={<BuildingCreatePage />} />
          <Route
            path="/rooms"
            element={<RoomListPage buildings={buildings} />}
          />
          <Route
            path="/tenants"
            element={<TenantsManagePage buildings={buildings} />}
          />
          <Route
            path="/vehicles"
            element={<VehiclesDashboardPage buildings={buildings} />}
          />
          <Route path="/billing" element={<DashboardPage buildings={buildings} />} />
          <Route path="/billing/invoices" element={<InvoiceListPage buildings={buildings} />} />
          <Route path="/billing/calculate" element={<BulkCalculatePage buildings={buildings} />} />
          <Route path="/rooms/:roomCode" element={<RoomDetails />} />
          <Route path="*" element={<Navigate to="/billing" replace />} />
        </Route>
        <Route path="/payment-simulation" element={<PaymentSimulationPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-cancel" element={<PaymentCancelPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
