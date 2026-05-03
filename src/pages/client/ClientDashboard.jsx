import { useState, useEffect } from 'react';
import { getMisMembresias, getMisPlanes } from '../../services/dashboardService';
import { CreditCardIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';

const ClientDashboard = () => {
  const [membresias, setMembresias] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membresiasData, planesData] = await Promise.all([
          getMisMembresias(),
          getMisPlanes()
        ]);
        
        setMembresias(membresiasData);
        setPlanes(planesData);
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

  const membresiaActiva = membresias.find(m => m.estado === 'ACTIVA');

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">
        ¡Bienvenido, {user?.first_name || 'Usuario'}!
      </h2>

      {/* Membresía Activa */}
      {membresiaActiva ? (
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <CreditCardIcon className="w-6 h-6" />
                <span className="text-lg font-semibold">Membresía {membresiaActiva.tipo_display || membresiaActiva.tipo}</span>
              </div>
              <p className="text-sky-100">Vence: {new Date(membresiaActiva.fecha_vencimiento).toLocaleDateString()}</p>
              {membresiaActiva.sesiones_totales > 0 && (
                <p className="text-sky-100 mt-1">
                  Sesiones: {membresiaActiva.sesiones_consumidas} / {membresiaActiva.sesiones_totales}
                </p>
              )}
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="font-bold">ACTIVA</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-orange-800 font-medium">No tienes una membresía activa</p>
          <p className="text-orange-600 text-sm mt-1">Contacta al propietario para renovar</p>
        </div>
      )}

      {/* Plan de Entrenamiento */}
      {planes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrophyIcon className="w-5 h-5 mr-2 text-green-500" />
            Tu Plan de Entrenamiento
          </h3>
          <div className="space-y-3">
            {planes.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-slate-800">{plan.nombre}</h4>
                    <p className="text-sm text-gray-600 mt-1">{plan.descripcion}</p>
                    <div className="flex space-x-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {plan.duracion_semanas} semanas
                      </span>
                      <span>• {plan.nivel_display || plan.nivel_dificultad}</span>
                    </div>
                  </div>
                </div>
                {plan.ejercicios && plan.ejercicios.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Ejercicios ({plan.ejercicios.length}):</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.ejercicios.slice(0, 3).map((ejercicio, index) => (
                        <li key={index}>• {ejercicio.nombre}</li>
                      ))}
                      {plan.ejercicios.length > 3 && (
                        <li className="text-sky-600">+ {plan.ejercicios.length - 3} más...</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;