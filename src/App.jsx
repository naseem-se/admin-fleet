import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VehiclesListPage } from './features/vehicles/VehiclesListPage';
import { VehicleDetailPage } from './features/vehicles/VehicleDetailPage';
import { DriversListPage } from './features/drivers/DriversListPage';
import { DriverDetailPage } from './features/drivers/DriverDetailPage';
import { JourneysLivePage } from './features/journeys/JourneysLivePage';
import { FuelListPage } from './features/fuel/FuelListPage';
import { MaintenanceListPage } from './features/maintenance/MaintenanceListPage';
import { ReportsPage } from './features/reports/ReportsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={['company_admin', 'dispatcher']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/vehicles" element={<VehiclesListPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/drivers" element={<DriversListPage />} />
          <Route path="/drivers/:id" element={<DriverDetailPage />} />
          <Route path="/journeys" element={<JourneysLivePage />} />
          <Route path="/fuel" element={<FuelListPage />} />
          <Route path="/maintenance" element={<MaintenanceListPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}