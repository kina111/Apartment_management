import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BuildingDetailPage from "./features/buildings/pages/BuildingDetailPage.jsx";
import BuildingEditPage from "./features/buildings/pages/BuildingEditPage.jsx";
import BuildingListPage from "./features/buildings/pages/BuildingListPage.jsx";
import RoomListPage from "./features/rooms/pages/RoomListPage.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import { useEffect, useState } from "react";
import { getAllBuildingsByManagerId } from "./features/buildings/services/buildingApi.js";
import RoomDetails from "./features/rooms/pages/RoomDetails.jsx";
import TenantsManagePage from "./features/tenants_vehicles/pages/TenantsManagePage.jsx";
import VehiclesDashboardPage from "./features/tenants_vehicles/pages/VehiclesDashboardPage.jsx";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";
import { useAuth } from "./shared/context/AuthContext.jsx";
import React, { lazy } from "react";

const ManagerListPage = lazy(() => import("./features/account-management/pages/ManagerListPage.jsx"));
const ManagerCreatePage = lazy(() => import("./features/account-management/pages/ManagerCreatePage.jsx"));

function App() {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    if (!user?.accountId) return;
    const loadBuildingByAccountId = async () => {
      const buildings = await getAllBuildingsByManagerId(user.accountId);
      setBuildings(buildings);
    };
    loadBuildingByAccountId();
  }, [user?.accountId]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/unauthorized"
          element={
            <div style={{
              minHeight: "100vh", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: "#0f0f1a", color: "#fff", fontFamily: "Inter, sans-serif"
            }}>
              <h1 style={{ fontSize: "3rem", margin: 0 }}>403</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
                Bạn không có quyền truy cập trang này.
              </p>
              <a href="/" style={{ marginTop: "1rem", color: "#6366f1" }}>Về trang chủ</a>
            </div>
          }
        />

        {/* ── Protected Routes (requires login) ── */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/buildings" element={<BuildingListPage />} />
          <Route path="/buildings/:buildingId" element={<BuildingDetailPage />} />
          <Route path="/buildings/:buildingId/edit" element={<BuildingEditPage />} />
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
          
          {/* ── LANDLORD ONLY Routes ── */}
          <Route element={<ProtectedRoute allowedRoles={['LANDLORD']} />}>
            <Route path="/managers" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ManagerListPage />
              </React.Suspense>
            } />
            <Route path="/managers/new" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ManagerCreatePage />
              </React.Suspense>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/buildings" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
