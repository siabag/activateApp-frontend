import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import { UserPlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Obtener el usuario logueado para verificar permisos
  const loggedUser = JSON.parse(localStorage.getItem('user'));
  const isPropietario = loggedUser?.role === 'PROPIETARIO';

  // Esquema de validación con Yup
  const validationSchema = Yup.object({
    first_name: Yup.string().required('El nombre es requerido'),
    last_name: Yup.string().required('El apellido es requerido'),
    email: Yup.string().email('Email inválido').required('El email es requerido'),
    telefono: Yup.string().required('El teléfono es requerido'),
    role: Yup.string()
      .oneOf(['CLIENTE', 'PERSONAL', 'PROPIETARIO'], 'Rol inválido')
      .when('$isPropietario', {
        is: true,
        then: () => Yup.string().required('El rol es requerido'),
        otherwise: () => Yup.string().notRequired()
      }),
    peso: Yup.number()
      .when('$isEdit', {
        is: false,
        then: () => Yup.number().required('El peso es requerido').min(30, 'Peso mínimo 30kg').max(300, 'Peso máximo 300kg'),
        otherwise: () => Yup.number().min(30, 'Peso mínimo 30kg').max(300, 'Peso máximo 300kg')
      }),
    altura: Yup.number()
      .when('$isEdit', {
        is: false,
        then: () => Yup.number().required('La altura es requerida').min(100, 'Altura mínima 100cm').max(250, 'Altura máxima 250cm'),
        otherwise: () => Yup.number().min(100, 'Altura mínima 100cm').max(250, 'Altura máxima 250cm')
      }),
    password: Yup.string()
      .when('$isEdit', {
        is: false,
        then: () => Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña requerida'),
        otherwise: () => Yup.string().min(6, 'Mínimo 6 caracteres')
      }),
    password_confirm: Yup.string()
      .when('$isEdit', {
        is: false,
        then: () => Yup.string()
          .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
          .required('Confirma tu contraseña'),
        otherwise: () => Yup.string()
          .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
      })
  });

  // Cargar usuarios
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({ search: searchTerm, page });
      setUsers(data.results || []);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (error) {
      console.error('Error cargando usuarios', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Guardar usuario (Crear o Editar) - LÓGICA CORREGIDA
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = { ...values };
      
      // Determinar el rol correctamente
      if (!isPropietario) {
        // Si es Personal -> Siempre crea CLIENTE
        payload.role = 'CLIENTE';
      } else if (!payload.role || payload.role === '') {
        // Si es Propietario pero no seleccionó rol -> CLIENTE por defecto
        payload.role = 'CLIENTE';
      }
      // Si es Propietario Y seleccionó un rol (PERSONAL/PROPIETARIO) -> Se respeta
      
      // Limpiar campos de control de Formik
      delete payload.isEdit;
      delete payload.isPropietario;
      
      console.log('🚀 Enviando al backend:', payload);
      
      if (currentUser) {
        await updateUser(currentUser.id, payload);
      } else {
        await createUser(payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error guardando usuario', error);
      alert('Error al guardar el usuario: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Error eliminando usuario', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  // Helper para badges de rol
  const getRoleBadge = (role) => {
    const styles = {
      'CLIENTE': 'bg-green-100 text-green-800',
      'PERSONAL': 'bg-blue-100 text-blue-800',
      'PROPIETARIO': 'bg-purple-100 text-purple-800'
    };
    return styles[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Botón Volver al Panel */}
      <Link to="/dashboard" className="inline-flex items-center text-sky-600 hover:text-sky-800 font-medium mb-2">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al Panel
      </Link>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
        <button
          onClick={openCreateModal}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center transition"
        >
          <UserPlusIcon className="w-5 h-5 mr-2" />
          {isPropietario ? 'Nuevo Usuario' : 'Nuevo Cliente'}
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg">Buscar</button>
      </form>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando usuarios...</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telefono || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No se encontraron usuarios.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Paginación */}
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
                  Página <span className="font-medium">{page}</span>
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
          </>
        )}
      </div>

      {/* Modal de Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {currentUser ? 'Editar Usuario' : (isPropietario ? 'Nuevo Usuario' : 'Nuevo Cliente')}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <Formik
                  initialValues={{
                    first_name: currentUser?.first_name || '',
                    last_name: currentUser?.last_name || '',
                    email: currentUser?.email || '',
                    telefono: currentUser?.telefono || '',
                    peso: currentUser?.peso || '',
                    altura: currentUser?.altura || '',
                    // ✅ CORRECCIÓN CLAVE: Dejar vacío al crear para que tome el valor del select
                    role: currentUser?.role || '',
                    password: '',
                    password_confirm: '',
                    isEdit: !!currentUser,
                    isPropietario: isPropietario
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                  context={{ isEdit: !!currentUser, isPropietario }}
                >
                  {({ isSubmitting, touched, errors, values }) => (
                    <Form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nombre</label>
                          <Field name="first_name" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.first_name && errors.first_name ? 'border-red-300' : 'border-gray-300'}`} />
                          <ErrorMessage name="first_name" component="p" className="mt-1 text-sm text-red-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Apellido</label>
                          <Field name="last_name" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.last_name && errors.last_name ? 'border-red-300' : 'border-gray-300'}`} />
                          <ErrorMessage name="last_name" component="p" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <Field name="email" type="email" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.email && errors.email ? 'border-red-300' : 'border-gray-300'}`} />
                        <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <Field name="telefono" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.telefono && errors.telefono ? 'border-red-300' : 'border-gray-300'}`} />
                        <ErrorMessage name="telefono" component="p" className="mt-1 text-sm text-red-600" />
                      </div>

                      {/* ✅ SELECTOR DE ROL - Solo visible para PROPIETARIO al crear */}
                      {isPropietario && !currentUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Rol <span className="text-red-500">*</span>
                          </label>
                          <Field 
                            as="select" 
                            name="role" 
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 bg-white ${touched.role && errors.role ? 'border-red-300' : 'border-gray-300'}`}
                          >
                            <option value="">Seleccionar rol...</option>
                            <option value="CLIENTE">Cliente</option>
                            <option value="PERSONAL">Personal / Entrenador</option>
                            <option value="PROPIETARIO">Propietario</option>
                          </Field>
                          <ErrorMessage name="role" component="p" className="mt-1 text-sm text-red-600" />
                          <p className="text-xs text-gray-500 mt-1">
                            ⚠️ Solo asigna rol "Propietario" a usuarios de total confianza.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                          <Field name="peso" type="number" step="0.1" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.peso && errors.peso ? 'border-red-300' : 'border-gray-300'}`} />
                          <ErrorMessage name="peso" component="p" className="mt-1 text-sm text-red-600" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                          <Field name="altura" type="number" step="0.1" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.altura && errors.altura ? 'border-red-300' : 'border-gray-300'}`} />
                          <ErrorMessage name="altura" component="p" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Contraseña {!currentUser && <span className="text-red-500">*</span>}
                        </label>
                        <Field name="password" type="password" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.password && errors.password ? 'border-red-300' : 'border-gray-300'}`} placeholder={currentUser ? "Dejar vacío para mantener la actual" : ""} />
                        <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-600" />
                      </div>

                      {!currentUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Confirmar Contraseña <span className="text-red-500">*</span>
                          </label>
                          <Field name="password_confirm" type="password" className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 ${touched.password_confirm && errors.password_confirm ? 'border-red-300' : 'border-gray-300'}`} />
                          <ErrorMessage name="password_confirm" component="p" className="mt-1 text-sm text-red-600" />
                        </div>
                      )}

                      <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                          Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none disabled:opacity-50">
                          {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;