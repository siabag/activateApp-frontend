import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPlanHistory } from '../../services/planHistoryService';
import { CheckCircleIcon, ClockIcon, XCircleIcon, ArrowPathIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PlanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para paginación y filtros
  const [pagination, setPagination] = useState({ page: 1, count: 0 });
  const [filters, setFilters] = useState({ search: '', estado: '' });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Enviamos página actual + filtros al backend
      const data = await getPlanHistory({
        page: pagination.page,
        search: filters.search,
        estado: filters.estado || undefined
      });
      
      setHistory(data.results || []);
      setPagination(prev => ({ 
        ...prev, 
        count: data.count || 0 
      }));
    } catch (error) {
      console.error('Error cargando historial', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters.search, filters.estado]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Manejadores de filtros
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(pagination.count / 10)) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a pág 1 al buscar
  };

  const handleStatusChange = (e) => {
    setFilters(prev => ({ ...prev, estado: e.target.value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETADO': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'CANCELADO': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default: return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'ASIGNADO': 'bg-blue-100 text-blue-800',
      'EN_PROGRESO': 'bg-yellow-100 text-yellow-800',
      'COMPLETADO': 'bg-green-100 text-green-800',
      'CANCELADO': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <Link to="/dashboard" className="inline-flex items-center text-sky-600 hover:text-sky-800 font-medium mb-2">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al Panel
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Historial de Planes Asignados</h2>
        <button onClick={fetchHistory} className="text-sm text-sky-600 hover:underline inline-flex items-center">
          <ArrowPathIcon className="w-4 h-4 mr-1" /> Actualizar
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente o plan..."
            value={filters.search}
            onChange={handleSearch}
            className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={filters.estado}
            onChange={handleStatusChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">Todos los estados</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="COMPLETADO">Completado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando historial...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay registros que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Asignación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.usuario_info ? `${item.usuario_info.first_name} ${item.usuario_info.last_name}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.plan_info?.nombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.fecha_asignacion).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {getStatusIcon(item.estado)}
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.estado)}`}>
                          {item.estado_display || item.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                        <div 
                          className="bg-sky-600 h-2.5 rounded-full" 
                          style={{ width: `${item.progreso_porcentaje}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">{item.progreso_porcentaje}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página <span className="font-bold">{pagination.page}</span> de {Math.ceil(pagination.count / 10) || 1}
              <span className="ml-2 text-gray-400">({pagination.count} registros)</span>
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.count / 10) || loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlanHistory;