import { useState } from 'react'
import reactLogo from './assets/react.svg'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          ¡Bienvenido a <span className="text-sky-500">Activate</span>!
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          El frontend está listo. Backend corriendo en http://127.0.0.1:8000
        </p>
        
        <div className="flex gap-4 justify-center">
          <a 
            href="http://127.0.0.1:8000/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition shadow-lg"
          >
            Admin Django
          </a>
          <a 
            href="http://127.0.0.1:8000/api/token/" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition shadow-lg"
          >
            Probar API
          </a>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Estado del Proyecto</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              ✅ Backend Django corriendo
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              ✅ Frontend React + Vite activo
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              ✅ Tailwind CSS configurado
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              ⏳ Configurando Axios y Router
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App