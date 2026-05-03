import axios from 'axios';

// URL base de API Django
const API_URL = 'http://127.0.0.1:8000/api';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🟢 INTERCEPTOR DE PETICIÓN (Antes de enviar datos)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔴 INTERCEPTOR DE RESPUESTA (Después de recibir datos)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No autorizado) y no hemos intentado refrescar ya
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Intentar obtener un nuevo token
          const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          // Guardar el nuevo token
          localStorage.setItem('access_token', access);

          // Actualizar la cabecera de la petición original y reenviarla
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Si falla el refresh, el usuario debe volver a loguearse
          console.error('Token refresh failed', refreshError);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user'); 
          window.location.href = '/login';
        }
      } else {
        // No hay refresh token, redirigir a login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;