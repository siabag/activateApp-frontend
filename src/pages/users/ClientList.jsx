import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../../services/userService';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para búsqueda
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 🔍 Debounce: Espera 500ms después de dejar de escribir antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      // Enviamos rol y búsqueda al backend
      const params = { role: 'CLIENTE' };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      
      const data = await getUsers(params);
      setClients(data.results || data);
    } catch (error) {
      console.error('Error cargando clientes', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleClearSearch = () => {
    setSearch('');
    setDebouncedSearch('');
  };

  return (
    <div className="p-6 space-y-6">
      <Link to="/dashboard" className="inline-flex items-center text-sky-600 hover:text-sky-800 font-medium mb-2">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al Panel
      </Link>

      {/* ✅ Cabecera con Título y Buscador */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Directorio de Clientes</h2>
        
        <div className="relative w-full md:w-80">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
              title="Limpiar búsqueda"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ✅ Estados de Carga / Vacío / Tabla */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          <p className="mt-3 text-gray-500 text-sm">Buscando clientes...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">
            {debouncedSearch ? 'No se encontraron clientes con ese criterio.' : 'No hay clientes registrados en el sistema.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-sky-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.first_name} {client.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Indicador de resultados */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
            Mostrando {clients.length} cliente{clients.length !== 1 ? 's' : ''}
            {debouncedSearch && ` para "${debouncedSearch}"`}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;