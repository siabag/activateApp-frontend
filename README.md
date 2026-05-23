# Activate App - Frontend

Aplicación web moderna y responsiva para la gestión del centro de entrenamiento **Activate**. Desarrollada con React, Vite y TailwindCSS.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Características por Rol](#-características-por-rol)

## ✨ Características

- 🎨 **Interfaz Moderna** con diseño responsivo y modo claro
- 🔐 **Autenticación JWT** con refresh automático de tokens
- 👥 **Multi-Rol** (Propietario, Personal, Cliente)
- 📊 **Dashboards Interactivos** con estadísticas en tiempo real
- 📱 **100% Responsivo** - Funciona en móvil, tablet y desktop
- ⚡ **Carga Rápida** optimizada con Vite
- 🔍 **Búsquedas Avanzadas** con filtros y paginación
- 📅 **Gestión Completa** de membresías, planes y asistencia

## 🛠 Tecnologías

### Core
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router 6** - Enrutamiento

### Estilos
- **TailwindCSS 3** - Framework CSS utility-first
- **Heroicons** - Iconos oficiales de Tailwind

### Estado y Peticiones
- **Axios** - Cliente HTTP
- **Formik** - Gestión de formularios
- **Yup** - Validación de esquemas

### Utilidades
- **JWT Decode** - Decodificación de tokens
- **date-fns** - Manipulación de fechas

## 📦 Requisitos

- Node.js 18+ 
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio


git clone <url-del-repositorio>
cd activateApp-frontend

### 2. Instalar dependencias

npm install
# o
yarn install

### 3. Configurar variables de entorno

Crear archivo .env en la raíz:

VITE_API_URL=http://127.0.0.1:8000/api

### 4. Iniciar servidor de desarrollo

npm run dev
# o
yarn dev

La aplicación estará disponible en: http://localhost:5173

## 📜 Scripts Disponibles

# Servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview

# Linting
npm run lint

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) con refresh automático:
Access Token: Válido por 60 minutos
Refresh Token: Válido por 24 horas
Auto-refresh: Se renueva automáticamente antes de expirar
Protección de rutas: Redirección a login si no hay token válido

##👤 Características por Rol

🔷 Propietario
📊 Dashboard con estadísticas completas
👥 Gestión total de usuarios (crear, editar, eliminar)
💳 Control de membresías y renovaciones
📈 Reportes de ingresos y asistencias
🏋️ Creación y asignación de planes
⚙️ Configuración del sistema

👷 Personal / Entrenador
📋 Dashboard de actividades diarias
👥 Gestión de clientes asignados
🏋️ Creación de planes de entrenamiento
📅 Registro de asistencia
📊 Seguimiento de progreso de clientes
🔍 Directorio de clientes activos

🙋 Cliente
💳 Visualización de membresía activa
📅 Alertas de vencimiento
🏋️ Mis planes de entrenamiento
📊 Historial de asistencias
✏️ Edición de perfil y datos personales
📱 Vista optimizada móvil

## 🎨 Componentes Principales

Formularios
Validación en tiempo real con Yup
Mensajes de error contextualizados
Estados de carga y deshabilitación
Tablas
Paginación automática
Búsqueda y filtrado
Ordenamiento por columnas
Acciones rápidas (editar, eliminar)
Tarjetas de Dashboard
Métricas en tiempo real
Indicadores visuales de estado
Alertas de vencimiento
Gráficos estadísticos

## 🔧 Configuración de Build

Desarrollo

npm run dev

Hot Module Replacement (HMR)
Source maps
Fast refresh

Producción

npm run build

Minificación de código
Tree shaking
Code splitting
Optimización de assets

## 📱 Responsive Design

La aplicación está optimizada para:
📱 Móvil: 320px - 768px
📱 Tablet: 768px - 1024px
💻 Desktop: 1024px+

## 🌐 Soporte de Navegadores

Chrome (últimas 2 versiones)
Firefox (últimas 2 versiones)
Safari (últimas 2 versiones)
Edge (últimas 2 versiones)

## 📝 Notas de Desarrollo

Convenciones de Código
Componentes en PascalCase
Funciones y variables en camelCase
Archivos .jsx para componentes React
Imports organizados: externos, internos, assets
Buenas Prácticas
Componentes funcionales con hooks
Custom hooks para lógica reutilizable
Separación de concerns (UI, lógica, servicios)
Manejo centralizado de errores

```bash