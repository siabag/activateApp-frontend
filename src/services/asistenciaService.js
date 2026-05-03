import api from './api';

// Registrar una asistencia (Ingreso o Salida)
export const registrarAsistencia = async (data) => {
  try {
    // data debe contener: { usuario: id_usuario, tipo_registro: 'INGRESO' | 'SALIDA' }
    const response = await api.post('/asistencia/', data);
    return response.data;
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    throw error;
  }
};

// Buscar usuarios para el filtro del registro
// Usamos el endpoint de admin o usuarios para buscar
export const buscarUsuarios = async (busqueda) => {
  try {
    const response = await api.get(`/usuarios/admin/?search=${busqueda}`);
    return response.data;
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    throw error;
  }
};