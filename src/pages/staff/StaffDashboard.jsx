import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAsistenciaHoy } from '../../services/dashboardService';
import { UsersIcon, ClipboardDocumentCheckIcon, CalendarIcon, ChartBarIcon, ArchiveBoxIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const StaffDashboard = () => {
  const [asistenciaHoy, setAsistenciaHoy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAsistenciaHoy();
        setAsistenciaHoy(data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Panel de Personal</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-8 h-8 text-sky-500" />
            <div>
              <p className="text-gray-600">Asistencias Hoy</p>
              <p className="text-3xl font-bold text-slate-800">{asistenciaHoy?.total_ingresos || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-gray-600">Sesiones Consumidas</p>
              <p className="text-3xl font-bold text-slate-800">{asistenciaHoy?.sesiones_consumidas || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-gray-600">Fecha</p>
              <p className="text-lg font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Accesos Rápidos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Botón Gestión de Usuarios */}
          <Link 
            to="/usuarios" 
            className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition flex items-center"
          >
            <UserPlusIcon className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <p className="font-medium text-indigo-900">Gestión de Usuarios</p>
              <p className="text-sm text-indigo-600">Crear y editar clientes</p>
            </div>
          </Link>

          {/* Botón: Registrar Asistencia */}
          <Link 
            to="/asistencia/registrar" 
            className="p-4 bg-sky-50 hover:bg-sky-100 rounded-lg text-left transition"
          >
            <p className="font-medium text-sky-900">Registrar Asistencia</p>
            <p className="text-sm text-sky-600">Marcar entrada/salida de clientes</p>
          </Link>

          {/* Botón: Clientes en Casa */}
          <Link 
            to="/asistencia/activos" 
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition"
          >
            <p className="font-medium text-green-900">Clientes en Casa</p>
            <p className="text-sm text-green-600">Ver quiénes están y marcar salida</p>
          </Link>

          {/* Botón: Ver Clientes */}
          <Link 
            to="/clientes" 
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition"
          >
            <p className="font-medium text-purple-900">Ver Clientes</p>
            <p className="text-sm text-purple-600">Listado de clientes activos</p>
          </Link>

          {/* Botón: Planes de Entrenamiento */}
          <Link 
            to="/planes" 
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition flex items-center"
          >
            <ChartBarIcon className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-orange-900">Planes de Entrenamiento</p>
              <p className="text-sm text-orange-600">Gestionar rutinas y ejercicios</p>
            </div>
          </Link>

          {/* Botón: Historial de Planes */}
          <Link 
            to="/historial-planes" 
            className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-left transition flex items-center"
          >
            <ArchiveBoxIcon className="w-8 h-8 text-slate-600 mr-3" />
            <div>
              <p className="font-medium text-slate-900">Historial de Planes</p>
              <p className="text-sm text-slate-600">Ver registros de asignaciones</p>
            </div>
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;