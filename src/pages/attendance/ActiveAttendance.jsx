import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const ActiveAttendance = () => {
  const [activeClients, setActiveClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActive = useCallback(async () => {
    try {
      const response = await api.get('/asistencia/activos/');
      setActiveClients(response.data);
    } catch (error) {
      console.error('Error al cargar clientes activos:', error);
      setError('Error al cargar clientes activos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
    // Actualizar cada 30 segundos para ver entradas/salidas en tiempo real
    const interval = setInterval(fetchActive, 30000);
    return () => clearInterval(interval);
  }, [fetchActive]);

  const handleMarkExit = async (userId) => {
    try {
      await api.post('/asistencia/', {
        usuario: userId,
        tipo_registro: 'SALIDA',
        metodo_ingreso: 'MANUAL'
      });
      // Recargar lista tras marcar salida
      fetchActive();
    } catch (error) {
      console.error('Error al registrar salida:', error);
      alert('Error al registrar salida. Verifica que el usuario tenga una membresía.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Link to="/dashboard" className="inline-flex items-center text-sky-600 hover:text-sky-800 font-medium mb-2">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al Panel
      </Link>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">🟢 Clientes en Casa</h2>
        <button onClick={fetchActive} className="text-sm text-sky-600 hover:underline">↻ Actualizar</button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : activeClients.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No hay clientes registrados en casa en este momento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membresía</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora de Ingreso</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.membresia}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.hora_ingreso}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleMarkExit(client.usuario_id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none"
                    >
                      <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-1" />
                      Marcar Salida
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveAttendance;