import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import RegisterAttendance from './pages/attendance/RegisterAttendance';
import UserManagement from './pages/owner/UserManagement';
import MembershipManagement from './pages/owner/MembershipManagement';
import ClientList from './pages/users/ClientList';
import ActiveAttendance from './pages/attendance/ActiveAttendance';
import PlanManagement from './pages/owner/PlanManagement';
import PlanHistory from './pages/owner/PlanHistory';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública: Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Redirección de raíz a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Rutas Protegidas (Requieren Layout y Token) */}
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Ruta para Registro de Asistencia */}
            <Route path="asistencia/registrar" element={<RegisterAttendance />} />
            
            {/* Ruta para Gestión de Usuarios */}
            <Route path="usuarios" element={<UserManagement />} />
            
            {/* Ruta para Gestión de Membresías */}
            <Route path="membresias" element={<MembershipManagement />} />
            
            {/* Ruta para Directorio de Clientes */}
            <Route path="clientes" element={<ClientList />} />
            
            {/* Ruta para Clientes en Casa */}
            <Route path="asistencia/activos" element={<ActiveAttendance />} />
            
            {/* Ruta para Planes de Entrenamiento */}
            <Route path="planes" element={<PlanManagement />} />
            
            {/* Ruta: Historial de Planes */}
            <Route path="historial-planes" element={<PlanHistory />} />
            
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;