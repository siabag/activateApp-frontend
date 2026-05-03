import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Verificar si existe el token
  const isAuthenticated = localStorage.getItem('access_token');

  // Si no hay token, redirigir a Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderizar la página solicitada
  return <Outlet />;
};

export default ProtectedRoute;