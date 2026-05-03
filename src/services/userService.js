import api from './api';

// Obtener lista de usuarios (paginación incluida)
export const getUsers = async (params = {}) => {
  try {
    const response = await api.get('/usuarios/admin/', { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    throw error;
  }
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    // Por defecto, creamos usuarios con rol 'CLIENTE' desde esta vista
    const response = await api.post('/usuarios/admin/', {
      ...userData,
      role: 'CLIENTE'
    });
    return response.data;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
};

// Actualizar usuario existente
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/usuarios/admin/${id}/`, userData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id) => {
  try {
    await api.delete(`/usuarios/admin/${id}/`);
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error;
  }
};