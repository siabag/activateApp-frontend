import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMemberships, createMembership } from '../../services/membershipService';
import { getUsers } from '../../services/userService';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const MembershipManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState(''); // Estado para el filtro

  // Esquema de validación
  const validationSchema = Yup.object({
    usuario: Yup.string().required('Selecciona un cliente'),
    tipo: Yup.string().required('Selecciona un tipo de membresía'),
    precio: Yup.number().required('El precio es requerido').min(0),
  });

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Enviamos el filtro 'estado' al backend (puede ser '', 'ACTIVA' o 'VENCIDA')
      const params = { 
        ordering: '-fecha_inicio', 
        page, 
        estado: filterStatus // Envía el filtro
      };

      const [membData, userData] = await Promise.all([
        getMemberships(params),
        getUsers({ role: 'CLIENTE' })
      ]);
      
      setMemberships(membData.results || []);
      setTotalPages(Math.ceil((membData.count || 0) / 10));
      setUsers(userData.results || userData);
    } catch (error) {
      console.error('Error cargando datos', error);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]); // Se recarga si cambia página o filtro

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejar creación
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createMembership({
        usuario: values.usuario,
        tipo: values.tipo,
        precio: values.precio,
        sesiones_totales: 0
      });
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.usuario?.[0] || 
                       error.response?.data?.detail || 
                       'Error al crear membresía';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
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

      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Membresías</h2>
        <div className="flex gap-3">
            <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition"
            >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Membresía
            </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Filtrar por estado:</span>
            <select 
                value={filterStatus} 
                onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1); // Reiniciar paginación al filtrar
                }}
                className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md border"
            >
                <option value="">Todas</option>
                <option value="ACTIVA">Activas</option>
                <option value="VENCIDA">Vencidas</option>
            </select>
        </div>
      </div>

      {/* Tabla de Membresías - CON SCROLL HORIZONTAL */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Cargando...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Inicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Vencimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Estado</th>
                    {/* Eliminada columna de Acciones */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberships.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {m.usuario ? (
                          typeof m.usuario === 'object' 
                            ? `${m.usuario.first_name || ''} ${m.usuario.last_name || ''}` 
                            : `Usuario ID: ${m.usuario}`
                        ) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.tipo_display || m.tipo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(m.fecha_inicio).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(m.fecha_vencimiento).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          m.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {m.estado}
                        </span>
                      </td>
                      {/* Sin botones de acción */}
                      <td className="px-6 py-4 whitespace-nowrap"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    Anterior
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{page}</span> de <span className="font-medium">{totalPages}</span>
                  </p>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                        Anterior
                      </button>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                        Siguiente
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Nueva Membresía */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full relative z-10 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asignar Membresía</h3>
              
              <Formik
                initialValues={{ usuario: '', tipo: 'MENSUAL', precio: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cliente</label>
                      <Field as="select" name="usuario" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option value="">Selecciona un cliente...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="usuario" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Plan</label>
                      <Field as="select" name="tipo" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option value="MENSUAL">Mensual</option>
                        <option value="BIMESTRAL">Bimestral (60 días)</option>
                        <option value="TRIMESTRAL">Trimestral</option>
                        <option value="SEMESTRAL">Semestral</option>
                        <option value="ANUAL">Anual</option>
                      </Field>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Precio ($)</label>
                      <Field name="precio" type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                      <ErrorMessage name="precio" component="p" className="text-red-500 text-xs mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                      </button>
                      <button type="submit" disabled={isSubmitting} className="bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                        {isSubmitting ? 'Guardando...' : 'Crear Membresía'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManagement;