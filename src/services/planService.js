import api from './api';

// Obtener lista de planes (Staff)
export const getPlans = async (params = {}) => {
  try {
    const response = await api.get('/planes/', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    throw error;
  }
};

// Obtener detalle de un plan (Staff)
export const getPlanDetail = async (id) => {
  try {
    const response = await api.get(`/planes/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo detalle del plan:', error);
    throw error;
  }
};

// Crear o actualizar plan (Staff)
export const createPlan = async (data) => {
  try {
    const response = await api.post('/planes/', data);
    return response.data;
  } catch (error) {
    console.error('Error creando plan:', error);
    throw error;
  }
};

// Asignar plan a usuarios (Staff)
export const assignPlan = async (id, userIds) => {
  try {
    const response = await api.post(`/planes/${id}/asignar/`, { usuarios: userIds });
    return response.data;
  } catch (error) {
    console.error('Error asignando plan:', error);
    throw error;
  }
};

// Obtener mis planes (Cliente)
export const getMyPlans = async () => {
  try {
    const response = await api.get('/planes/mis-planes/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo mis planes:', error);
    throw error;
  }
};