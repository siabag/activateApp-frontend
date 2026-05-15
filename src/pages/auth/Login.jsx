import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Esquema de validación con Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Correo electrónico inválido')
      .required('El correo es requerido'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('La contraseña es requerida'),
  });

  // Valores iniciales del formulario
  const initialValues = {
    email: '',
    password: '',
  };

  // Función que se ejecuta al enviar el formulario
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError('');
    setLoading(true);

    try {
      // 🔹 Petición a la API de Django para obtener tokens JWT
      const response = await api.post('/token/', {
        email: values.email,
        password: values.password,
      });

      const { access, refresh } = response.data;

      // 🔹 Guardar tokens en localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // 🔹 Obtener y guardar información del usuario
      const userResponse = await api.get('/usuarios/profile/');
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      // 🔹 Redirigir al dashboard
      navigate('/dashboard');
      resetForm();
      
    } catch (err) {
      console.error('Error en login:', err);
      
      // Manejar errores específicos de la API
      if (err.response?.status === 401) {
        setError('Credenciales inválidas. Verifica tu correo y contraseña.');
      } else if (err.response?.status === 400) {
        setError('Datos inválidos. Por favor revisa el formulario.');
      } else {
        setError('Error de conexión. Intenta más tarde.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-sky-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Activate<span className="text-sky-500">.</span>
          </h1>
          <p className="text-gray-500 mt-2">Inicia sesión para continuar</p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Formulario con Formik */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-5">
              
              {/* Campo Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className={`block w-full rounded-md border ${
                    touched.email && errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'
                  } shadow-sm py-2 px-3`}
                  placeholder="usuario@activate.com"
                />
                <ErrorMessage 
                  name="email" 
                  component="p" 
                  className="mt-1 text-sm text-red-600" 
                />
              </div>

              {/* Campo Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className={`block w-full rounded-md border ${
                    touched.password && errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'
                  } shadow-sm py-2 px-3`}
                  placeholder="••••••••"
                />
                <ErrorMessage 
                  name="password" 
                  component="p" 
                  className="mt-1 text-sm text-red-600" 
                />
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className={`w-full flex justify-center py-2.5 px-4 rounded-md text-white font-medium transition ${
                  isSubmitting || loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSubmitting || loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </Form>
          )}
        </Formik>

        {/* Enlace a registro */}
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-sky-600 hover:text-sky-500 font-medium">
            Regístrate aquí
          </Link>
        </p>

        {/* Credenciales de prueba */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-3 bg-slate-50 rounded-md text-xs text-gray-500">
            <p className="font-medium mb-1">Credenciales de prueba:</p>
            <p>Propietario: propietario@activate.com / admin123</p>
            <p>Personal: entrenador1@activate.com / personal123</p>
            <p>Cliente: juan.perez@email.com / cliente123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;