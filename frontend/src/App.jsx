import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Pendaftaran from './pages/pendaftaran/Pendaftaran';
import Poli from './pages/poli/Poli';
import Farmasi from './pages/farmasi/Farmasi';
import Laboratorium from './pages/laboratorium/Laboratorium';
import Kasir from './pages/kasir/Kasir';
import Laporan from './pages/laporan/Laporan';
import MasterData from './pages/master/MasterData';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600"></div>
          <span className="text-sm font-semibold text-slate-500">Memeriksa sesi...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Main App Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route
              path="pendaftaran"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pendaftaran']}>
                  <Pendaftaran />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="poli"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dokter']}>
                  <Poli />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="farmasi"
              element={
                <ProtectedRoute allowedRoles={['admin', 'apoteker']}>
                  <Farmasi />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="laboratorium"
              element={
                <ProtectedRoute allowedRoles={['admin', 'laboran', 'dokter']}>
                  <Laboratorium />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="kasir"
              element={
                <ProtectedRoute allowedRoles={['admin', 'kasir']}>
                  <Kasir />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="laporan"
              element={
                <ProtectedRoute allowedRoles={['admin', 'kepala']}>
                  <Laporan />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="master-data"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MasterData />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch All - Redirect to login/dashboard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
