import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buscarUsuarios, registrarAsistencia } from '../../services/asistenciaService';
import { MagnifyingGlassIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const RegisterAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Buscar usuarios mientras se escribe
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {
      try {
        const data = await buscarUsuarios(term);
        setUsuarios(data.results || data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setUsuarios([]);
    }
  };

  // Seleccionar usuario de la lista
  const selectUser = (user) => {
    setSelectedUser(user);
    setUsuarios([]);
    setSearchTerm(`${user.first_name} ${user.last_name}`);
    setMessage({ type: '', text: '' });
  };

  // Registrar entrada o salida
  const handleRegister = async (tipo) => {
    if (!selectedUser) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await registrarAsistencia({
        usuario: selectedUser.id,
        tipo_registro: tipo,
        metodo_ingreso: 'MANUAL'
      });

      setMessage({ 
        type: 'success', 
        text: `¡Éxito! ${tipo === 'INGRESO' ? 'Entrada' : 'Salida'} registrada para ${selectedUser.first_name}.` 
      });
      
      // Limpiar selección después de un éxito
      setTimeout(() => {
        setSelectedUser(null);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      // Capturar errores de validación del backend (ej: sin membresía)
      const errorMsg = error.response?.data?.detail || 'Error al registrar. Intenta de nuevo.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="text-sky-600 hover:text-sky-800 mb-4 flex items-center">
          ← Volver al Panel
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Registrar Asistencia</h2>
        <p className="text-gray-500">Busca al cliente para registrar su ingreso o salida.</p>
      </div>

      {/* Mensajes de éxito/error */}
      {message.text && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Buscar por nombre, apellido o email..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500"
        />
        
        {/* Resultados de búsqueda */}
        {usuarios.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
            {usuarios.map(user => (
              <li 
                key={user.id}
                onClick={() => selectUser(user)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
              >
                <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                <p className="text-sm text-gray-500">{user.email} | ID: {user.id}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tarjeta del Usuario Seleccionado */}
      {selectedUser && (
        <div className="bg-white rounded-xl shadow-lg border border-sky-100 overflow-hidden">
          <div className="bg-sky-50 px-6 py-4 border-b border-sky-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{selectedUser.first_name} {selectedUser.last_name}</h3>
              <p className="text-sm text-sky-600">{selectedUser.email}</p>
            </div>
            <button 
              onClick={() => setSelectedUser(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => handleRegister('INGRESO')}
              disabled={loading}
              className={`flex items-center justify-center px-8 py-4 rounded-lg text-white font-bold text-lg transition transform hover:scale-105 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200 shadow-lg'
              }`}
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6 mr-2" />
              Registrar INGRESO
            </button>

            <button
              onClick={() => handleRegister('SALIDA')}
              disabled={loading}
              className={`flex items-center justify-center px-8 py-4 rounded-lg text-white font-bold text-lg transition transform hover:scale-105 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200 shadow-lg'
              }`}
            >
              <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-2" />
              Registrar SALIDA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterAttendance;