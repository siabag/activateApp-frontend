import api from './api';

// Obtener lista de membresías
export const getMemberships = async (params = {}) => {
  try {
    const response = await api.get('/membresias/', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo membresías:', error);
    throw error;
  }
};

// Crear nueva membresía
export const createMembership = async (data) => {
  try {
    // El backend espera: usuario (id), tipo, precio, sesiones_totales
    const response = await api.post('/membresias/', data);
    return response.data;
  } catch (error) {
    console.error('Error creando membresía:', error);
    throw error;
  }
};

// Renovar membresía
export const renewMembership = async (id) => {
  try {
    const response = await api.post(`/membresias/${id}/renovar/`);
    return response.data;
  } catch (error) {
    console.error('Error renovando membresía:', error);
    throw error;
  }
};