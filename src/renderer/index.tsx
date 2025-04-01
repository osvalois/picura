import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/App';
import './styles/index.css';

/**
 * Punto de entrada para el módulo renderer de Electron
 * Con optimizaciones para sostenibilidad y rendimiento
 */

// Función para manejar preferencias de tema
const applyThemePreferences = () => {
  // Detecta preferencia de tema del sistema (dark/light)
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Obtiene preferencia guardada si existe
  const savedTheme = localStorage.getItem('theme');
  
  // Determina el tema a aplicar
  const theme = savedTheme || (prefersDarkMode ? 'dark' : 'light');
  
  // Aplica clase de tema a nivel de documento
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Inicialización optimizada para sostenibilidad
document.addEventListener('DOMContentLoaded', () => {
  console.log('Iniciando Picura D - Versión MVP');
  
  // Aplica preferencias de tema
  applyThemePreferences();
  
  // Escucha cambios de preferencia de tema del sistema para adaptarse
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyThemePreferences);
  
  // Renderiza la aplicación con configuración básica
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    // Optimización: Inicializa con renderizado por lotes
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <Router>
        <App />
      </Router>
    );
  }
});

// Optimización: Gestión mínima de errores para producción
window.addEventListener('error', (event) => {
  console.error('Error no capturado:', event.error);
  
  // En una implementación real, enviaría analíticas o registros
  if (window.electronAPI && window.electronAPI.logError) {
    window.electronAPI.logError({
      message: event.error?.message || 'Error desconocido',
      stack: event.error?.stack || '',
      timestamp: new Date().toISOString()
    });
  }
});

// Detección de batería para ajuste automático
if ('getBattery' in navigator) {
  // Use type assertion to tell TypeScript about this API
  (navigator as any).getBattery().then((battery: { 
    charging: boolean; 
    level: number; 
    addEventListener: (event: string, handler: () => void) => void;
  }) => {
    const updateBatteryStatus = () => {
      // Envía estado de batería al proceso principal
      if (window.electronAPI && window.electronAPI.updateBatteryStatus) {
        window.electronAPI.updateBatteryStatus({
          isCharging: battery.charging,
          level: battery.level * 100
        });
      }
    };
    
    // Escucha eventos de batería
    battery.addEventListener('levelchange', updateBatteryStatus);
    battery.addEventListener('chargingchange', updateBatteryStatus);
    
    // Estado inicial
    updateBatteryStatus();
  });
}