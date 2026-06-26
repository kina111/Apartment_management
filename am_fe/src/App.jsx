import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BuildingCreatePage from "./features/buildings/pages/BuildingCreatePage.jsx";
import RoomListPage from "./features/rooms/pages/RoomListPage.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import { useEffect, useState } from "react";
import { getAllBuildingsByManagerId } from "./features/buildings/services/buildingApi.js";
import RoomDetails from "./features/rooms/pages/RoomDetails.jsx";

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
          <Route path="/rooms/:roomCode" element={<RoomDetails />} />
          <Route path="*" element={<Navigate to="/buildings/new" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
