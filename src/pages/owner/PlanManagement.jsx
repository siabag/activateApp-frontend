import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPlans, createPlan, assignPlan } from '../../services/planService';
import { getUsers } from '../../services/userService';
import { PlusIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Cargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansData, usersData] = await Promise.all([
        getPlans(),
        getUsers({ role: 'CLIENTE' })
      ]);
      setPlans(plansData.results || []);
      setUsers(usersData.results || usersData);
    } catch (error) {
      console.error('Error cargando datos', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Esquema de validación para ejercicios individuales
  const exerciseSchema = Yup.object().shape({
    nombre: Yup.string().required('Nombre requerido'),
    series: Yup.number().required('Series requeridas').min(1),
    repeticiones: Yup.string().required('Repeticiones requeridas'),
    descanso_segundos: Yup.number().required('Descanso requerido').min(0),
    orden: Yup.number().required('Orden requerido').min(1)
  });

  // Esquema de validación general del Plan
  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es requerido'),
    area_muscular: Yup.string().required('El área muscular es requerida'),
    nivel_dificultad: Yup.string().required('El nivel es requerido'),
    duracion_semanas: Yup.number().required('La duración es requerida').min(1).max(52),
    ejercicios: Yup.array().of(exerciseSchema).min(1, 'Agrega al menos un ejercicio'),
  });

  // Manejar creación de Plan
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await createPlan(values);
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error al crear plan:', error);
      alert('Error al crear plan: ' + (error.response?.data?.detail || 'Error desconocido'));
    } finally {
      setSubmitting(false);
    }
  };

  // Abrir modal de asignación
  const openAssignModal = (plan) => {
    setSelectedPlan(plan);
    setIsAssignModalOpen(true);
  };

  // Manejar asignación de Plan
  const handleAssign = async (values, { setSubmitting }) => {
    try {
      await assignPlan(selectedPlan.id, values.selectedUsers);
      setIsAssignModalOpen(false);
      fetchData();
      alert('Plan asignado correctamente');
    } catch (error) {
      console.error('Error al asignar plan:', error);
      alert('Error al asignar plan');
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Planes de Entrenamiento</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nuevo Plan
        </button>
      </div>

      {/* Tabla de Planes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Cargando...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ejercicios</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.area_display || plan.area_muscular}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      plan.nivel_dificultad === 'AVANZADO' ? 'bg-red-100 text-red-800' :
                      plan.nivel_dificultad === 'INTERMEDIO' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {plan.nivel_display || plan.nivel_dificultad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.total_ejercicios || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openAssignModal(plan)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center"
                    >
                      <UserPlusIcon className="w-4 h-4 mr-1" /> Asignar
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay planes creados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nuevo Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-4xl sm:w-full relative z-10 p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Plan de Entrenamiento</h3>
              
              <Formik
                initialValues={{
                  nombre: '',
                  descripcion: '',
                  area_muscular: 'PECHO',
                  nivel_dificultad: 'INTERMEDIO',
                  duracion_semanas: 4,
                  ejercicios: [{ nombre: '', series: 3, repeticiones: '10', descanso_segundos: 60, orden: 1 }]
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, isSubmitting }) => (
                  <Form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Plan</label>
                        <Field name="nombre" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        <ErrorMessage name="nombre" component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                      
                      {/* Campo de Nivel de Dificultad */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nivel de Dificultad</label>
                        <Field as="select" name="nivel_dificultad" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                          <option value="PRINCIPIANTE">Principiante</option>
                          <option value="INTERMEDIO">Intermedio</option>
                          <option value="AVANZADO">Avanzado</option>
                        </Field>
                        <ErrorMessage name="nivel_dificultad" component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Área Muscular</label>
                        <Field as="select" name="area_muscular" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                          <option value="PECHO">Pecho</option>
                          <option value="ESPALDA">Espalda</option>
                          <option value="PIERNAS">Piernas</option>
                          <option value="HOMBROS">Hombros</option>
                          <option value="BRAZOS">Brazos</option>
                          <option value="ABDOMEN">Abdomen</option>
                          <option value="GLUTEOS">Glúteos</option>
                          <option value="CARDIO">Cardiovascular</option>
                          <option value="CUERPO_COMPLETO">Cuerpo Completo</option>
                        </Field>
                        <ErrorMessage name="area_muscular" component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                      
                      {/* Campo de Duración en Semanas */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duración (Semanas)</label>
                        <Field name="duracion_semanas" type="number" min="1" max="52" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        <ErrorMessage name="duracion_semanas" component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descripción</label>
                      <Field as="textarea" name="descripcion" rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ejercicios</label>
                      <FieldArray name="ejercicios">
                        {({ push, remove }) => (
                          <div className="space-y-3 mt-2">
                            {values.ejercicios.map((_, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-md relative border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-600 mb-2">Ejercicio #{index + 1}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Field name={`ejercicios[${index}].nombre`} placeholder="Nombre (ej: Press Banca)" className="border p-2 rounded text-sm w-full" />
                                  <div className="flex gap-2">
                                    <Field name={`ejercicios[${index}].series`} type="number" placeholder="Series" className="border p-2 rounded text-sm w-1/2" />
                                    <Field name={`ejercicios[${index}].repeticiones`} placeholder="Reps (ej: 12)" className="border p-2 rounded text-sm w-1/2" />
                                  </div>
                                  <Field name={`ejercicios[${index}].descanso_segundos`} type="number" placeholder="Descanso (s)" className="border p-2 rounded text-sm w-full" />
                                  <Field name={`ejercicios[${index}].orden`} type="number" placeholder="Orden" className="border p-2 rounded text-sm w-full" />
                                </div>
                                <button type="button" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push({ nombre: '', series: 3, repeticiones: '10', descanso_segundos: 60, orden: values.ejercicios.length + 1 })}
                              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            >
                              + Agregar Ejercicio
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                      </button>
                      <button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                        {isSubmitting ? 'Guardando...' : 'Crear Plan'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Plan */}
      {isAssignModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsAssignModalOpen(false)}></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full relative z-10 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asignar Plan: {selectedPlan.nombre}</h3>
              
              <Formik
                initialValues={{ selectedUsers: [] }}
                onSubmit={handleAssign}
              >
                {({ values, setFieldValue, isSubmitting }) => (
                  <Form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Selecciona Clientes</label>
                      <div className="mt-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                        {users.map(user => (
                          <label key={user.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={values.selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                const newUsers = e.target.checked
                                  ? [...values.selectedUsers, user.id]
                                  : values.selectedUsers.filter(id => id !== user.id);
                                setFieldValue('selectedUsers', newUsers);
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700">{user.first_name} {user.last_name}</span>
                          </label>
                        ))}
                      </div>
                      {values.selectedUsers.length === 0 && <p className="text-red-500 text-xs mt-1">Selecciona al menos un cliente</p>}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button type="button" onClick={() => setIsAssignModalOpen(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                      </button>
                      <button type="submit" disabled={isSubmitting || values.selectedUsers.length === 0} className="bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                        {isSubmitting ? 'Asignando...' : 'Asignar Plan'}
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

export default PlanManagement;