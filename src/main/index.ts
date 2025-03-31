import { app, BrowserWindow, ipcMain, powerMonitor } from 'electron';
import path from 'path';
import { eventBus } from '../core/events/EventBus';
import { SystemEventType } from '../core/events/EventTypes';
import { configManager } from '../config/ConfigManager';
import { SustainabilityService } from '../services/sustainability/SustainabilityService';
import { ENERGY_MODE_CONFIGS } from '../config/defaults';

// Referencia global para evitar recolección de basura
let mainWindow: BrowserWindow | null = null;

// Instancia del servicio de sostenibilidad
let sustainabilityService: SustainabilityService;
// Importamos el servicio como singleton
import { sustainabilityService as sustService } from '../services/sustainability/SustainabilityService';

/**
 * Crea la ventana principal de la aplicación con optimizaciones de sostenibilidad
 */
async function createWindow() {
  // Asegura que la configuración está cargada
  await configManager.initialize();
  
  // Obtiene preferencias del usuario
  const userPrefs = configManager.getUserPreferences();
  
  // Inicializa servicio de sostenibilidad
  try {
    // Usar la instancia singleton en lugar de crear una nueva
    sustainabilityService = sustService;
    await sustainabilityService.initialize();
  } catch (error) {
    console.error('Error al inicializar el servicio de sostenibilidad:', error);
  }
  
  // Configuración optimizada para la ventana principal
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    // Optimizaciones para eficiencia y sostenibilidad
    show: false, // No mostrar hasta que esté lista para evitar parpadeo
    backgroundColor: userPrefs.theme === 'dark' ? '#121212' : '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      // Optimizaciones para rendimiento y energía
      backgroundThrottling: true,
      spellcheck: userPrefs.spellcheck,
    },
    // Configuraciones visuales según tema
    titleBarStyle: 'hiddenInset', // Estilo nativo con controles en la barra de título (macOS)
    autoHideMenuBar: true, // Oculta menú para maximizar área de trabajo
  });
  
  // Aplica otras optimizaciones específicas según modo de energía
  applyEnergyModeOptimizations(userPrefs.energyMode);
  
  // Carga la URL de la aplicación
  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    // En desarrollo, carga desde servidor de desarrollo
    const port = process.env.PORT || 5173;
    await mainWindow.loadURL(`http://localhost:${port}`);
    
    // Abre DevTools en desarrollo
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  // Muestra la ventana cuando está lista para reducir parpadeo
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });
  
  // Monitoreo de energía
  setupPowerMonitoring();
  
  // Gestión de eventos
  await setupEventHandlers();
}

/**
 * Configura optimizaciones basadas en el modo de energía
 */
function applyEnergyModeOptimizations(mode: string) {
  if (!mainWindow) return;
  
  const energySettings = ENERGY_MODE_CONFIGS[mode as keyof typeof ENERGY_MODE_CONFIGS]?.features;
  
  if (!energySettings) return;
  
  // Aplica optimizaciones específicas de Electron
  if (mode === 'ultraSaving' || mode === 'lowPower') {
    // Reduce intervalo de actualización de la interfaz
    mainWindow.webContents.setFrameRate(30);
  } else {
    // Restablece a valores predeterminados
    mainWindow.webContents.setFrameRate(60);
  }
  
  // Notifica al renderer sobre el cambio de modo
  mainWindow.webContents.send('energy-mode-changed', {
    mode,
    settings: energySettings
  });
}

/**
 * Configura monitoreo de energía
 */
function setupPowerMonitoring() {
  // Monitorea cambios en el estado de energía
  powerMonitor.on('on-ac', () => {
    eventBus.emit(SystemEventType.BATTERY_STATUS_CHANGED, {
      isCharging: true,
      level: 100 // Asumimos nivel completo en AC
    });
  });
  
  powerMonitor.on('on-battery', () => {
    // En batería, usamos valores estimados para esta versión
    eventBus.emit(SystemEventType.BATTERY_STATUS_CHANGED, {
      isCharging: false,
      level: 80 // Valor inicial estimado
    });
  });
  
  // Reportamos estado de energía periódicamente
  setInterval(() => {
    // Reportar valores estáticos para esta versión
    eventBus.emit(SystemEventType.BATTERY_STATUS_CHANGED, {
      isCharging: true,
      level: 100
    });
  }, 60000); // Cada minuto para minimizar impacto
}

/**
 * Configura manejadores de eventos
 */
async function setupEventHandlers() {
  if (!mainWindow) return;
  
  // Eventos de ventana para optimización
  mainWindow.on('focus', () => {
    eventBus.emit(SystemEventType.APP_FOCUSED);
  });
  
  mainWindow.on('blur', () => {
    eventBus.emit(SystemEventType.APP_BLURRED);
  });
  
  // Cierre de la aplicación
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Eventos IPC
  await setupIpcHandlers();
  
  // Suscripción a eventos del sistema
  eventBus.on(SystemEventType.ENERGY_MODE_CHANGED, (data) => {
    applyEnergyModeOptimizations(data.mode || data.currentMode);
  });
}

/**
 * Configura manejadores IPC para comunicación renderer-main
 */
async function setupIpcHandlers() {
  try {
    // Importa módulos de manera asíncrona con mejor manejo de errores
    const ipcModule = await import('./ipc');
    const { setupIPC } = ipcModule;
    
    // Importa DocumentService
    const docServiceModule = await import('../services/document/DocumentService');
    const { documentService } = docServiceModule;
    
    // Inicializa DocumentService
    try {
      await documentService.initialize();
      console.log('DocumentService inicializado correctamente');
    } catch (error) {
      console.error('Error al inicializar DocumentService:', error);
    }
    
    // Configura servicios para IPC con manejo de errores mejorado
    setupIPC({
      documentService, // Servicio de documentos inicializado
      sustainabilityService,
      versionControlService: null, // TODO: Implementar servicio de control de versiones
      searchService: null, // TODO: Implementar servicio de búsqueda
      aiService: null, // TODO: Implementar servicio de IA
      syncService: null // TODO: Implementar servicio de sincronización
    });
  } catch (error) {
    console.error('Error al configurar manejadores IPC:', error);
    // Registro mejorado de errores
    console.error('Detalles del error:', error instanceof Error ? error.stack : String(error));
  }
  
  // Mantiene manejadores básicos existentes para compatibilidad
  
  // Configuración
  ipcMain.handle('get-user-preferences', async () => {
    try {
      // Asegurarse de que configManager está inicializado
      if (!configManager.isInitialized()) {
        await configManager.initialize();
      }
      return configManager.getUserPreferences();
    } catch (error) {
      console.error('Error al obtener preferencias de usuario:', error);
      return { theme: 'system', energyMode: 'standard' }; // Valores por defecto
    }
  });
  
  ipcMain.handle('update-user-preferences', async (_, preferences) => {
    try {
      // Asegurarse de que configManager está inicializado
      if (!configManager.isInitialized()) {
        await configManager.initialize();
      }
      return await configManager.updateUserPreferences(preferences);
    } catch (error) {
      console.error('Error al actualizar preferencias de usuario:', error);
      return false;
    }
  });
  
  // Sostenibilidad básica (los detallados se manejan en sustainabilityHandlers.ts)
  ipcMain.handle('get-sustainability-metrics', async () => {
    try {
      return await sustainabilityService?.getMetrics() || { cpu: 0, memory: { total: 0, used: 0, percentage: 0 } };
    } catch (error) {
      console.error('Error al obtener métricas de sostenibilidad:', error);
      return { cpu: 0, memory: { total: 0, used: 0, percentage: 0 } };
    }
  });
  
  ipcMain.handle('get-energy-mode', () => {
    try {
      return sustainabilityService?.getCurrentEnergyMode() || 'standard';
    } catch (error) {
      console.error('Error al obtener modo de energía:', error);
      return 'standard';
    }
  });
  
  ipcMain.handle('set-energy-mode', async (_, mode) => {
    try {
      if (sustainabilityService) {
        return await sustainabilityService.setEnergyMode(mode);
      }
    } catch (error) {
      console.error('Error al establecer modo de energía:', error);
    }
    return false;
  });
  
  ipcMain.handle('get-sustainability-report', async () => {
    try {
      if (sustainabilityService) {
        return await sustainabilityService.generateSustainabilityReport();
      }
    } catch (error) {
      console.error('Error al generar informe de sostenibilidad:', error);
    }
    return { timestamp: new Date().toISOString(), metrics: {}, energyState: { currentMode: 'standard' } };
  });
}

// Inicialización de la aplicación
app.whenReady().then(async () => {
  // Crea ventana principal
  await createWindow();
  
  // Comportamiento macOS: recrear ventana cuando se hace clic en icono del dock
  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
  
  // Notificar que la aplicación está lista
  eventBus.emit(SystemEventType.APP_READY);
});

// Salir en todas las plataformas excepto macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Limpieza antes de salir
app.on('before-quit', () => {
  eventBus.emit(SystemEventType.APP_WILL_CLOSE);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  
  // Registra y notifica sobre errores no capturados
  eventBus.emit(SystemEventType.SYSTEM_ERROR, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});