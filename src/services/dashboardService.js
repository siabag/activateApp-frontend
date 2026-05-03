import api from './api';

// Obtener estadísticas generales (solo Propietario)
export const getEstadisticasGenerales = async () => {
  try {
    const response = await api.get('/membresias/estadisticas/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

// Obtener asistencia del día
export const getAsistenciaHoy = async () => {
  try {
    const response = await api.get('/asistencia/resumen_hoy/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    throw error;
  }
};

// Obtener mis membresías (Cliente)
export const getMisMembresias = async () => {
  try {
    const response = await api.get('/membresias/mis-membresias/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener membresías:', error);
    throw error;
  }
};

// Obtener mis planes (Cliente)
export const getMisPlanes = async () => {
  try {
    const response = await api.get('/planes/mis-planes/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener planes:', error);
    throw error;
  }
};

// Obtener alertas de membresías (Propietario/Personal)
export const getAlertasMembresias = async () => {
  try {
    const response = await api.get('/membresias/alertas/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    throw error;
  }
};