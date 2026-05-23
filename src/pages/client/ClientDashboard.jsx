import { useState, useEffect } from 'react';
import { getMisMembresias, getMisPlanes, actualizarPerfil } from '../../services/clientService';
import { 
  CreditCardIcon, TrophyIcon, ClockIcon, ExclamationTriangleIcon, 
  PencilIcon, XMarkIcon, UserIcon, CheckCircleIcon 
} from '@heroicons/react/24/outline';

const ClientDashboard = () => {
  const [membresias, setMembresias] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  // Estados para edición de perfil
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    telefono: '',
    peso: '',
    altura: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // getMisMembresias llama al endpoint que auto-actualiza vencidas en backend
        const [membresiasData, planesData] = await Promise.all([
          getMisMembresias(),
          getMisPlanes()
        ]);
        setMembresias(membresiasData || []);
        setPlanes(planesData || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const membresiaActiva = membresias.length > 0 ? membresias[0] : null;

  // Lógica de estado real basada en fecha (independiente del campo 'estado' de BD)
  const getStatusInfo = (m) => {
    if (!m?.fecha_vencimiento) return { status: 'none', text: 'Sin datos', color: 'gray' };
    const hoy = new Date();
    const fin = new Date(m.fecha_vencimiento);
    const dias = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));

    if (dias < 0) return { status: 'expired', text: `Vencida hace ${Math.abs(dias)} días`, color: 'red' };
    if (dias <= 7) return { status: 'expiring', text: `Vence en ${dias} días`, color: 'orange' };
    return { status: 'active', text: `Vence el ${fin.toLocaleDateString()}`, color: 'sky' };
  };

  const info = getStatusInfo(membresiaActiva);

  // Manejo del formulario
  const handleOpenEdit = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      telefono: user?.telefono || '',
      peso: user?.peso || '',
      altura: user?.altura || ''
    });
    setShowModal(true);
    setSuccessMsg('');
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await actualizarPerfil(formData);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccessMsg('¡Perfil actualizado correctamente!');
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg('');
        window.location.reload(); // Recarga para aplicar cambios globales
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('Error al guardar cambios. Verifica los datos.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div></div>;
  }

  return (
    <div className="p-6 space-y-6 relative">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido, {user?.first_name || 'Usuario'}!</h2>
        <button onClick={handleOpenEdit} className="flex items-center gap-2 text-sm bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
          <PencilIcon className="w-4 h-4" /> Editar Perfil
        </button>
      </div>

      {/* Tarjeta de Membresía */}
      {membresiaActiva ? (
        <div className={`rounded-lg shadow-lg p-6 text-white bg-gradient-to-r ${
          info.color === 'red' ? 'from-red-500 to-red-600' :
          info.color === 'orange' ? 'from-orange-500 to-yellow-500' :
          'from-sky-500 to-blue-600'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCardIcon className="w-6 h-6" />
                <span className="text-lg font-semibold">Membresía {membresiaActiva.tipo_display || membresiaActiva.tipo}</span>
              </div>
              <p className="opacity-90">{info.text}</p>
              {membresiaActiva.sesiones_totales > 0 && (
                <p className="opacity-90 mt-1">Sesiones: {membresiaActiva.sesiones_consumidas || 0} / {membresiaActiva.sesiones_totales}</p>
              )}
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
              {info.status === 'active' ? 'Activa' : info.status === 'expiring' ? 'Por Vencer' : 'Vencida'}
            </span>
          </div>
          {info.status !== 'active' && (
            <div className="mt-4 bg-black/20 rounded p-3 flex items-start gap-2 text-sm">
              <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p>Tu membresía {info.status === 'expired' ? 'ha vencido' : 'está por vencer'}. Acude a recepción para renovarla.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-orange-800 font-medium">No tienes una membresía activa</p>
          <p className="text-orange-600 text-sm mt-1">Contacta a recepción para obtener una.</p>
        </div>
      )}

      {/* Planes */}
      {planes.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-green-500" /> Tu Plan de Entrenamiento
          </h3>
          <div className="space-y-4">
            {planes.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:border-sky-300 transition bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-slate-800 text-base">{plan.nombre}</h4>
                  <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full font-medium">
                    {plan.nivel_display || plan.nivel_dificultad}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{plan.descripcion}</p>
                <div className="flex gap-4 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {plan.duracion_semanas} semanas</span>
                  <span>• {plan.ejercicios?.length || 0} ejercicios</span>
                </div>
                {plan.ejercicios?.length > 0 && (
                  <div className="bg-white rounded p-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Rutina:</p>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      {plan.ejercicios.map((ej, i) => (
                        <li key={i} className="flex justify-between items-center border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                          <span className="font-medium">{ej.nombre}</span>
                          <span className="text-gray-500 text-xs">{ej.series} series x {ej.repeticiones} reps • {ej.descanso_segundos}s</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-dashed border-gray-300">
          <TrophyIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700">Sin plan asignado</h3>
          <p className="text-gray-500 text-sm mt-1">Tu entrenador te asignará una rutina pronto.</p>
        </div>
      )}

      {/* Modal de Edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
              <UserIcon className="w-5 h-5 text-sky-600" /> Editar Perfil
            </h3>
            <p className="text-sm text-gray-500 mb-6">Actualiza tus datos personales y ficha física.</p>

            {successMsg && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <CheckCircleIcon className="w-4 h-4" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input type="email" value={user?.email || ''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">El correo no se puede modificar desde aquí.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input type="number" step="0.1" min="0" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                  <input type="number" step="0.1" min="0" value={formData.altura} onChange={e => setFormData({...formData, altura: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition outline-none" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2 mt-2">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Guardando...
                  </>
                ) : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;