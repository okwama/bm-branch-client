import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import ClientDetailsPage from './pages/ClientDetailsPage';
import UnscheduledRequests from './pages/UnscheduledRequests';
import PhotoListPage from './pages/PhotoListPage';
import StaffList from './pages/StaffList';
import SosList from './pages/SosList';
import NoticePage from './pages/NoticePage';
import TeamsList from './pages/TeamList';
import ClientsList from './pages/ClientsPage';
import ClaimsPage from './pages/ClaimsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';
import PendingRequests from './pages/PendingRequests';
import Runs from './pages/Runs';
import InTransitRequests from './pages/InTransitRequests';
import AddClientPage from './pages/AddClientPage';
import ClientBranchesPage from './pages/ClientBranchesPage';
import DailyRuns, { RunsForDatePage } from './pages/DailyRuns';
import { SosProvider } from './contexts/SosContext';

// Protected route wrapper
const ProtectedRoute = () => {
  console.log('🛡️ ProtectedRoute: Component rendered');
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('🛡️ ProtectedRoute: Auth state - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  if (isLoading) {
    console.log('🛡️ ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🛡️ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('🛡️ ProtectedRoute: Authenticated, rendering protected content');
  return <Outlet />;
};

// Redirect authenticated users away from login
const LoginRoute = () => {
  console.log('🔑 LoginRoute: Component rendered');
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔑 LoginRoute: Auth state - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    console.log('🔑 LoginRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('🔑 LoginRoute: Already authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  console.log('🔑 LoginRoute: Not authenticated, showing login page');
  return <LoginPage />;
};

// Dashboard layout wrapper
const DashboardWrapper = () => {
  console.log('📊 DashboardWrapper: Component rendered');
  return (
    <Layout>
      <DashboardLayout />
    </Layout>
  );
};

const App = () => {
  console.log('🚀 App: Component rendered');
  return (
    <SosProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginRoute />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardWrapper />}>
            <Route path="/" element={<UnscheduledRequests />} />
            <Route path="/dashboard" element={<UnscheduledRequests />} />
            <Route path="/dashboard/unscheduled" element={<UnscheduledRequests />} />
            <Route path="/dashboard/pending" element={<PendingRequests />} />
            <Route path="/dashboard/in-transit" element={<InTransitRequests />} />
            <Route path="/dashboard/clients/:id" element={<ClientDetailsPage />} />
            <Route path="/dashboard/photo-list" element={<PhotoListPage />} />
            <Route path="/dashboard/staff-list" element={<StaffList/>} />
            <Route path="/dashboard/sos-list" element={<SosList/>} />
            <Route path="/dashboard/notices" element={<NoticePage/>} />
            <Route path="/dashboard/daily" element={<DailyRuns/>} />
            <Route path="/dashboard/runs/:date" element={<RunsForDatePage />} />
            <Route path="/dashboard/teams-list" element={<TeamsList/>} />
            <Route path="/dashboard/clients-list" element={<ClientsList/>} />
            <Route path="/dashboard/claims" element={<ClaimsPage />} />
            <Route path="/dashboard/runs" element={<Runs />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/clients/add" element={<AddClientPage />} />
            <Route path="/dashboard/clients/:id/branches" element={<ClientBranchesPage />} />
          </Route>
          
          <Route path="/settings" element={
            <Layout>
              <SettingsPage />
            </Layout>
          } />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SosProvider>
  );
};

export default App;