import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BuildingCreatePage from './features/buildings/pages/BuildingCreatePage.jsx';
import MainLayout from './shared/components/MainLayout.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/buildings/new" element={<BuildingCreatePage />} />
          <Route path="*" element={<Navigate to="/buildings/new" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
