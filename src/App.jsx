import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import MiembrosList from './pages/miembros/MiembrosList';
import MiembrosForm from './pages/miembros/MiembrosForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Private Admin Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="miembros" element={<MiembrosList />} />
            <Route path="miembros/nuevo" element={<MiembrosForm />} />
            
            {/* Placeholders for future sections */}
            <Route path="eventos" element={<div className="text-white">Sección de Eventos (Próximamente)</div>} />
            <Route path="asistencia" element={<div className="text-white">Sección de Asistencia (Próximamente)</div>} />
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
