import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BuildingDetailPage from "./features/buildings/pages/BuildingDetailPage.jsx";
import BuildingEditPage from "./features/buildings/pages/BuildingEditPage.jsx";
import BuildingListPage from "./features/buildings/pages/BuildingListPage.jsx";
import RoomListPage from "./features/rooms/pages/RoomListPage.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import { useEffect, useState } from "react";
import { getAllBuildingsByManagerId, getMyBuildingOptions } from "./features/buildings/services/buildingApi.js";
import RoomDetails from "./features/rooms/pages/RoomDetails.jsx";
import TenantsManagePage from "./features/tenants_vehicles/pages/TenantsManagePage.jsx";
import VehiclesDashboardPage from "./features/tenants_vehicles/pages/VehiclesDashboardPage.jsx";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import ProtectedRoute from "./shared/components/ProtectedRoute.jsx";
import { useAuth } from "./shared/context/AuthContext.jsx";
import React, { lazy } from "react";

const ManagerListPage = lazy(() => import("./features/account-management/pages/ManagerListPage.jsx"));
const ManagerCreatePage = lazy(() => import("./features/account-management/pages/ManagerCreatePage.jsx"));
const ManagerEditPage = lazy(() => import("./features/account-management/pages/ManagerEditPage.jsx"));
import NotificationPage from "./features/notifications/pages/NotificationPage.jsx";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  ContractListPage,
  ContractCreatePage,
  ContractDetailPage,
  ContractRenewPage,
  ContractTransferPage,
  ContractTerminatePage
} from "./features/contracts";


function App() {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    if (!user?.accountId) {
      setBuildings([]);
      return;
    }

    const loadBuildingByAccountId = async () => {
      try {
        const buildings = user.role === "LANDLORD"
          ? await getMyBuildingOptions()
          : await getAllBuildingsByManagerId(user.accountId);

        setBuildings(buildings);
      } catch (error) {
        console.error("Lỗi tải danh sách tòa nhà:", error);
        setBuildings([]);
      }
    };

    loadBuildingByAccountId();
  }, [user?.accountId, user?.role]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
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
            <Route path="/managers/:id/edit" element={
              <React.Suspense fallback={<div>Loading...</div>}>
                <ManagerEditPage />
              </React.Suspense>
            } />
            <Route path="/notifications" element={<NotificationPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/buildings" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
