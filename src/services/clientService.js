import api from './api';

// Obtener planes del cliente
export const getMisPlanes = async () => {
  try {
    const response = await api.get('/planes/mis-planes/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo mis planes:', error);
    throw error;
  }
};

// Obtener membresías con auto-actualización integrada
export const getMisMembresias = async () => {
  try {
    // Usamos el endpoint que valida automáticamente
    const response = await api.get('/membresias/mis-membresias-actualizadas/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo membresías:', error);
    throw error;
  }
};

// Endpoint alternativo si solo quieres validar sin obtener datos
export const validarMembresiasVencidas = async () => {
  try {
    const response = await api.post('/membresias/validar-vencidas/');
    return response.data;
  } catch (error) {
    console.error('Error validando membresías:', error);
    throw error;
  }
};

// Actualizar perfil del usuario
export const actualizarPerfil = async (data) => {
  try {
    const response = await api.patch('/usuarios/mi-perfil/', data);
    return response.data;
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    throw error;
  }
};