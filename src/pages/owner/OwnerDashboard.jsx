import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEstadisticasGenerales, getAsistenciaHoy, getAlertasMembresias } from '../../services/dashboardService';
import { UsersIcon, CreditCardIcon, ChartBarIcon, ExclamationTriangleIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [asistenciaHoy, setAsistenciaHoy] = useState(null);
  const [alertas, setAlertas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, asistenciaData, alertasData] = await Promise.all([
          getEstadisticasGenerales(),
          getAsistenciaHoy(),
          getAlertasMembresias()
        ]);
        
        setStats(statsData);
        setAsistenciaHoy(asistenciaData);
        setAlertas(alertasData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Panel de Propietario</h2>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Membresías"
          value={stats?.total_membresias || 0}
          icon={CreditCardIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Membresías Activas"
          value={stats?.membresias_activas || 0}
          icon={UsersIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Ingreso Total"
          value={`$${(stats?.ingreso_total || 0).toLocaleString()}`}
          icon={ChartBarIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Por Vencer (7 días)"
          value={stats?.membresias_por_vencer_7_dias || 0}
          icon={ExclamationTriangleIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Asistencia del Día */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Asistencia de Hoy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-sky-50 rounded-lg">
            <p className="text-3xl font-bold text-sky-600">{asistenciaHoy?.total_ingresos || 0}</p>
            <p className="text-gray-600">Total Ingresos</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{asistenciaHoy?.usuarios_unicos || 0}</p>
            <p className="text-gray-600">Usuarios Únicos</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{asistenciaHoy?.sesiones_consumidas || 0}</p>
            <p className="text-gray-600">Sesiones Consumidas</p>
          </div>
        </div>
      </div>

      {/* Alertas de Membresías */}
      {alertas?.total_alertas > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-500" />
            Alertas de Membresías ({alertas.total_alertas})
          </h3>
          <div className="space-y-2">
            {alertas.alertas?.slice(0, 5).map((alerta) => (
              <div key={alerta.membresia_id} className={`p-3 rounded-md ${
                alerta.nivel_alerta === 'CRITICA' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{alerta.usuario}</p>
                    <p className="text-sm text-gray-600">{alerta.tipo} - Vence: {alerta.fecha_vencimiento}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alerta.nivel_alerta === 'CRITICA' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {alerta.dias_restantes} días
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Accesos Rápidos Actualizados */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Accesos Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Enlace a Gestión de Usuarios */}
          <Link 
            to="/usuarios" 
            className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-left transition cursor-pointer flex items-center"
          >
            <UserPlusIcon className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <p className="font-medium text-indigo-900">Gestión de Usuarios</p>
              <p className="text-sm text-indigo-600">Crear, editar y eliminar clientes</p>
            </div>
          </Link>

          {/* Enlace a Gestión de Membresías */}
          <Link 
            to="/membresias" 
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition cursor-pointer flex items-center"
          >
            <CreditCardIcon className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-900">Gestión de Membresías</p>
              <p className="text-sm text-green-600">Asignar y renovar planes</p>
            </div>
          </Link>

          {/* ✅ NUEVO: Enlace a Planes de Entrenamiento */}
          <Link 
            to="/planes" 
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition cursor-pointer flex items-center"
          >
            <ChartBarIcon className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-purple-900">Planes de Entrenamiento</p>
              <p className="text-sm text-purple-600">Crear y asignar rutinas</p>
            </div>
          </Link>

          {/* Enlace a Directorio de Clientes */}
          <Link 
            to="/clientes" 
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition cursor-pointer flex items-center"
          >
            <UsersIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Directorio de Clientes</p>
              <p className="text-sm text-blue-600">Ver lista completa</p>
            </div>
          </Link>

          {/* Enlace a Clientes en Casa */}
          <Link 
            to="/asistencia/activos" 
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition cursor-pointer flex items-center"
          >
            <UsersIcon className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-orange-900">Clientes en Casa</p>
              <p className="text-sm text-orange-600">Ver quiénes están ahora</p>
            </div>
          </Link>

          {/* Enlace a Registrar Asistencia */}
          <Link 
            to="/asistencia/registrar" 
            className="p-4 bg-sky-50 hover:bg-sky-100 rounded-lg text-left transition cursor-pointer flex items-center"
          >
            <UsersIcon className="w-8 h-8 text-sky-600 mr-3" />
            <div>
              <p className="font-medium text-sky-900">Registrar Asistencia</p>
              <p className="text-sm text-sky-600">Marcar entrada/salida</p>
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
};

// Componente de Tarjeta de Estadística
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-4">
    <div className={`${color} p-3 rounded-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

export default OwnerDashboard;