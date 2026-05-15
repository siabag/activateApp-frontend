import { useState } from 'react';
import OwnerDashboard from './owner/OwnerDashboard';
import StaffDashboard from './staff/StaffDashboard';
import ClientDashboard from './client/ClientDashboard';

const Dashboard = () => {
  // 🔹 Leer datos de localStorage directamente
  const userData = localStorage.getItem('user');
  const userRole = userData ? JSON.parse(userData).role : null;
  
  // 🔹 Estado para loading
  const [loading] = useState(false);

  // Renderizar dashboard según el rol
  const renderDashboard = () => {
    switch (userRole) {
      case 'PROPIETARIO':
        return <OwnerDashboard />;
      case 'PERSONAL':
        return <StaffDashboard />;
      case 'CLIENTE':
        return <ClientDashboard />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-red-600">
              Rol no reconocido o sesión inválida
            </h2>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800"
            >
              Volver al Login
            </button>
          </div>
        );
    }
  };

  // 🔹 Loading opcional
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;