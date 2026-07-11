import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import BuildingCreatePage from "./features/buildings/pages/BuildingCreatePage.jsx";
import RoomListPage from "./features/rooms/pages/RoomListPage.jsx";
import MainLayout from "./shared/components/MainLayout.jsx";
import RoomDetails from "./features/rooms/pages/RoomDetails.jsx";
import TenantsManagePage from "./features/tenants_vehicles/pages/TenantsManagePage.jsx";
import VehiclesDashboardPage from "./features/tenants_vehicles/pages/VehiclesDashboardPage.jsx";
import BuildingListPage from "./features/buildings/pages/BuildingListPage.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/buildings" element={<BuildingListPage/>}/>
                    <Route path="/buildings/new" element={<BuildingCreatePage/>}/>
                    <Route
                        path="/rooms"
                        element={<RoomListPage buildings={[]}/>}
                    />
                    <Route
                        path="/tenants"
                        element={<TenantsManagePage buildings={[]}/>}
                    />
                    <Route
                        path="/vehicles"
                        element={<VehiclesDashboardPage buildings={[]}/>}
                    />
                    <Route path="/rooms/:roomCode" element={<RoomDetails/>}/>
                    <Route path="*" element={<Navigate to="/buildings/new" replace/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
