import api from './api';

// Obtener historial de planes (Staff/Owner ven todos, Cliente ve solo los suyos)
export const getPlanHistory = async (params = {}) => {
  try {
    const response = await api.get('/planes/historial/', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo historial de planes:', error);
    throw error;
  }
};

// Actualizar estado de un plan en el historial (ej: marcar como completado)
export const updatePlanHistoryStatus = async (id, data) => {
  try {
    // Usamos PATCH para actualizar parcialmente el estado/progreso
    const response = await api.patch(`/planes/historial/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error actualizando historial:', error);
    throw error;
  }
};