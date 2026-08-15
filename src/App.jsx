import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { PlatformLayout } from './layouts/PlatformLayout';
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
import { PlatformStatsPage } from './features/platform/PlatformStatsPage';
import { CompaniesListPage } from './features/platform/CompaniesListPage';
import { CompanyDetailPage } from './features/platform/CompanyDetailPage';
import { SubscriptionPlansPage } from './features/platform/SubscriptionPlansPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { EmailVerifiedPage } from './pages/EmailVerifiedPage';
import { SettingsPage } from './pages/SettingsPage';
import { PlatformSettingsPage } from './features/platform/PlatformSettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/email-verified" element={<EmailVerifiedPage />} />

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
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route element={<PlatformLayout />}>
          <Route path="/platform" element={<PlatformStatsPage />} />
          <Route path="/platform/companies" element={<CompaniesListPage />} />
          <Route path="/platform/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/platform/plans" element={<SubscriptionPlansPage />} />
          <Route path="/platform/settings" element={<PlatformSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}