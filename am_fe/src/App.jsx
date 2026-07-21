import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BuildingCreatePage from "./features/buildings/pages/BuildingCreatePage.jsx";
import RoomListPage from "./features/rooms/pages/RoomListPage.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import { useEffect, useState } from "react";
import { getAllBuildingsByManagerId } from "./features/buildings/services/buildingApi.js";
import RoomDetails from "./features/rooms/pages/RoomDetails.jsx";
import TenantsManagePage from "./features/tenants_vehicles/pages/TenantsManagePage.jsx";
import VehiclesDashboardPage from "./features/tenants_vehicles/pages/VehiclesDashboardPage.jsx";
import {
  ContractListPage,
  ContractCreatePage,
  ContractDetailPage,
  ContractRenewPage,
  ContractTransferPage,
  ContractTerminatePage
} from "./features/contracts";


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
          <Route path="/rooms/:roomCode" element={<RoomDetails />} />
          <Route
            path="/contracts"
            element={<ContractListPage buildings={buildings} />}
          />
          <Route
            path="/contracts/new"
            element={<ContractCreatePage buildings={buildings} />}
          />
          <Route path="/contracts/id/:contractId" element={<ContractDetailPage />} />
          <Route path="/contracts/id/:contractId/renew" element={<ContractRenewPage />} />
          <Route path="/contracts/id/:contractId/transfer" element={<ContractTransferPage />} />
          <Route path="/contracts/id/:contractId/terminate" element={<ContractTerminatePage />} />
          <Route path="*" element={<Navigate to="/buildings/new" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
