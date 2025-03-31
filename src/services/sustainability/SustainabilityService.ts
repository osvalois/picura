import { ResourceUsageMetrics, PowerConsumptionMetrics, EnergyMode, SystemEnergyState } from '../../shared/types/SustainabilityMetrics';
import { UserPreferences } from '../../shared/types/User';
import { ResourceMonitor } from './ResourceMonitor';
import { configManager } from '../../config/ConfigManager';
import { eventBus } from '../../core/events/EventBus';
import { SystemEventType, SustainabilityEventType } from '../../core/events/EventTypes';
import { ENERGY_MODE_CONFIGS, MONITORING_CONFIG } from '../../config/defaults';
import { app, powerMonitor } from 'electron';

/**
 * Servicio que gestiona la sostenibilidad y eficiencia energética de la aplicación
 */
export class SustainabilityService {
  // Métodos stub para implementaciones futuras
  public async getMetricsHistory(timeRange: string, limit: number): Promise<any> {
    return Promise.resolve({
      timestamps: [],
      cpuUsage: [],
      memoryUsage: [],
      energyConsumption: []
    });
  }
  
  public async getOptimizationSuggestions(): Promise<any> {
    return Promise.resolve([
      {
        type: "energy",
        description: "Sugerencia de optimización",
        impact: "medium"
      }
    ]);
  }
  
  public async getBatteryStatus(): Promise<any> {
    return Promise.resolve({
      level: 100,
      charging: true,
      temperature: 25
    });
  }
  
  public async startIntensiveMonitoring(duration: number): Promise<boolean> {
    return Promise.resolve(true);
  }
  
  public async stopIntensiveMonitoring(): Promise<boolean> {
    return Promise.resolve(true);
  }
  private resourceMonitor: ResourceMonitor;
  private currentEnergyMode: EnergyMode;
  private autoModeEnabled: boolean = true;
  private sessionStartTime: Date;
  private totalEnergyUsed: number = 0; // mWh
  private energySaved: number = 0; // mWh (estimados vs uso tradicional)
  private dataTransferred: { sent: number; received: number; saved: number } = {
    sent: 0,
    received: 0,
    saved: 0
  };
  private isLowBattery: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private batteryCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.resourceMonitor = new ResourceMonitor();
    this.currentEnergyMode = 'standard'; // Valor inicial predeterminado
    this.sessionStartTime = new Date();

    // Registra eventos relacionados con sostenibilidad
    this.registerEventListeners();
  }

  /**
   * Inicializa el servicio de sostenibilidad
   */
  public async initialize(): Promise<void> {
    try {
      // Actualiza el modo de energía desde la configuración
      // Si configManager no está inicializado, se mantendrá el modo por defecto
      try {
        if (configManager.isInitialized()) {
          const userPrefs = configManager.getUserPreferences();
          if (userPrefs && userPrefs.energyMode) {
            this.currentEnergyMode = userPrefs.energyMode;
          }
        } else {
          await configManager.initialize();
          const userPrefs = configManager.getUserPreferences();
          if (userPrefs && userPrefs.energyMode) {
            this.currentEnergyMode = userPrefs.energyMode;
          }
        }
      } catch (configError) {
        console.log('Error al inicializar ConfigManager, usando modo de energía por defecto:', configError);
      }
      
      await this.resourceMonitor.initialize();
      
      // Inicia monitoreo adaptativo basado en actividad
      this.startAdaptiveMonitoring();
      
      // Verificación inicial de batería
      await this.checkBatteryStatus();
      
      // Inicia verificación periódica de batería
      this.batteryCheckInterval = setInterval(
        this.checkBatteryStatus.bind(this), 
        60000 // Cada minuto
      );
      
      // Notifica inicialización completa
      console.log('Servicio de sostenibilidad inicializado');
    } catch (error) {
      console.error('Error al inicializar el servicio de sostenibilidad:', error);
    }
  }

  /**
   * Inicia monitoreo adaptativo basado en actividad del usuario
   */
  private startAdaptiveMonitoring(): void {
    // Determina frecuencia de muestreo basada en modo de energía
    const samplingRate = this.getSamplingRateForMode(this.currentEnergyMode);
    
    // Inicia monitoreo periódico
    this.monitoringInterval = setInterval(async () => {
      try {
        // Obtiene métricas actuales
        const metrics = await this.getCurrentMetrics();
        
        // Actualiza estado y publica evento
        this.updateSustainabilityState(metrics);
        
        // Detecta umbrales y ajusta modo si es necesario
        this.detectResourceThresholds(metrics);
      } catch (error) {
        console.error('Error en monitoreo de recursos:', error);
      }
    }, samplingRate);
  }

  /**
   * Obtiene la frecuencia de muestreo adecuada para el modo de energía
   */
  private getSamplingRateForMode(mode: EnergyMode): number {
    switch (mode) {
      case 'ultraSaving':
        return MONITORING_CONFIG.lowActivitySamplingRate * 3; // Muy infrecuente
      case 'lowPower':
        return MONITORING_CONFIG.lowActivitySamplingRate;
      case 'highPerformance':
        return MONITORING_CONFIG.defaultSamplingRate / 2; // Más frecuente
      case 'standard':
      default:
        return MONITORING_CONFIG.defaultSamplingRate;
    }
  }

  /**
   * Chequea el estado de la batería y ajusta el modo si es necesario
   */
  private async checkBatteryStatus(): Promise<void> {
    try {
      // Obtiene información de batería vía Electron
      await app.whenReady();
      // Mock de powerMonitor.getSystemPowerInfo para compatibilidad
      const batteryInfo = { percent: 100, charging: true };
      
      const batteryLevel = batteryInfo.percent;
      const isCharging = batteryInfo.charging;
      
      // Detecta situaciones de batería baja
      const wasLowBattery = this.isLowBattery;
      if (!isCharging) {
        if (batteryLevel <= MONITORING_CONFIG.batteryThresholds.critical) {
          this.isLowBattery = true;
          
          // Cambia a modo ultra ahorro si está habilitado el modo automático
          if (this.autoModeEnabled && this.currentEnergyMode !== 'ultraSaving') {
            this.setEnergyMode('ultraSaving', true);
          }
        } else if (batteryLevel <= MONITORING_CONFIG.batteryThresholds.low) {
          this.isLowBattery = true;
          
          // Cambia a modo bajo consumo si no está ya en modo más conservador
          if (this.autoModeEnabled && 
              this.currentEnergyMode !== 'lowPower' && 
              this.currentEnergyMode !== 'ultraSaving') {
            this.setEnergyMode('lowPower', true);
          }
        } else {
          this.isLowBattery = false;
          
          // Si salimos de estado de batería baja y estaba en modo automático,
          // volvemos a modo estándar
          if (wasLowBattery && this.autoModeEnabled && 
             (this.currentEnergyMode === 'lowPower' || 
              this.currentEnergyMode === 'ultraSaving')) {
            this.setEnergyMode('standard', true);
          }
        }
      } else if (isCharging && wasLowBattery && this.autoModeEnabled) {
        // Si estaba en batería baja y ahora está cargando, vuelve a modo estándar
        this.isLowBattery = false;
        if (this.currentEnergyMode === 'lowPower' || 
            this.currentEnergyMode === 'ultraSaving') {
          this.setEnergyMode('standard', true);
        }
      }
      
      // Emite evento de cambio de estado de batería
      eventBus.emit(SystemEventType.BATTERY_STATUS_CHANGED, {
        level: batteryLevel,
        charging: isCharging,
        isLow: this.isLowBattery
      });
      
    } catch (error) {
      console.error('Error al verificar estado de batería:', error);
    }
  }

  /**
   * Obtiene las métricas actuales de recursos y consumo
   */
  public async getCurrentMetrics(): Promise<ResourceUsageMetrics> {
    return await this.resourceMonitor.getMetrics();
  }

  /**
   * Estima el consumo energético basado en uso de recursos
   */
  public estimatePowerConsumption(metrics: ResourceUsageMetrics): PowerConsumptionMetrics {
    // Factores de conversión aproximados (varían por hardware)
    const CPU_POWER_FACTOR = 0.5; // mW por % de CPU en dispositivo típico
    const MEMORY_POWER_FACTOR = 0.05; // mW por MB usado
    const DISK_POWER_FACTOR = 0.1; // mW por operación
    const NETWORK_POWER_FACTOR = 0.05; // mW por KB transferido
    const DISPLAY_POWER_BASE = 1000; // mW base para pantalla (estimado)
    
    // Cálculo de componentes individuales
    const cpuPower = metrics.cpu * CPU_POWER_FACTOR;
    const memoryPower = (metrics.memory.used / (1024 * 1024)) * MEMORY_POWER_FACTOR;
    
    // Cálculo para disco (si está disponible)
    const diskPower = metrics.disk ? 
      ((metrics.disk.reads + metrics.disk.writes) * DISK_POWER_FACTOR) : 0;
    
    // Cálculo para red (si está disponible)
    const networkTransferred = metrics.network ? 
      ((metrics.network.sent + metrics.network.received) / 1024) : 0;
    const networkPower = networkTransferred * NETWORK_POWER_FACTOR;
    
    // Estimación básica para pantalla (podría refinarse)
    // Asume modo oscuro reduce consumo en OLED/AMOLED
    let theme = 'system';
    try {
      if (configManager.isInitialized()) {
        theme = configManager.getUserPreferences().theme || 'system';
      }
    } catch (configError) {
      // Usa el tema por defecto si configManager no está listo
      console.error('Error al obtener preferencias de usuario:', configError);
    }
    const displayPower = theme === 'dark' ? DISPLAY_POWER_BASE * 0.8 : DISPLAY_POWER_BASE;
    
    // Potencia total estimada
    const totalPower = cpuPower + memoryPower + diskPower + networkPower + displayPower;
    
    // Estimación de CO2 (factor aproximado: 0.5g CO2 por Wh)
    const CO2_FACTOR = 0.0005; // gramos por mWh
    const co2Equivalent = totalPower * CO2_FACTOR;
    
    // Cálculo de ratio de eficiencia (0-1, donde 1 es más eficiente)
    // Basado en comparación con línea base para operaciones similares
    const BASELINE_POWER = 2500; // mW para aplicación similar sin optimizaciones
    const energyEfficiencyRatio = Math.max(0, Math.min(1, 1 - (totalPower / BASELINE_POWER)));
    
    return {
      totalPower,
      components: {
        cpu: cpuPower,
        memory: memoryPower,
        disk: diskPower,
        network: networkPower,
        display: displayPower
      },
      co2Equivalent,
      energyEfficiencyRatio
    };
  }

  /**
   * Actualiza estado general de sostenibilidad y emite métricas
   */
  private updateSustainabilityState(metrics: ResourceUsageMetrics): void {
    // Estima consumo energético
    const powerMetrics = this.estimatePowerConsumption(metrics);
    
    // Calcula energía consumida desde última actualización
    // (potencia * tiempo = energía)
    const samplingRate = this.getSamplingRateForMode(this.currentEnergyMode);
    const hourFraction = samplingRate / (3600 * 1000); // convertir ms a fracción de hora
    const energyInPeriod = powerMetrics.totalPower * hourFraction; // mWh
    
    // Actualiza totales de sesión
    this.totalEnergyUsed += energyInPeriod;
    
    // Estima ahorro vs. aplicación no optimizada
    // Baseline es energía que consumiría sin optimizaciones
    const baselineEnergy = 2500 * hourFraction; // 2500mW baseline * tiempo
    this.energySaved += Math.max(0, baselineEnergy - energyInPeriod);
    
    // Emite evento con métricas actualizadas
    eventBus.emit(SustainabilityEventType.METRICS_UPDATED, {
      ...powerMetrics,
      batteryImpact: this.isLowBattery ? "high" : "normal" as "high" | "normal",
      session: {
        duration: Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000),
        totalEnergyUsed: this.totalEnergyUsed,
        energySaved: this.energySaved,
        dataTransferred: this.dataTransferred
      }
    });
  }

  /**
   * Detecta si se superan umbrales de recursos y reacciona
   */
  private detectResourceThresholds(metrics: ResourceUsageMetrics): void {
    // Verifica umbrales de CPU
    if (metrics.cpu >= MONITORING_CONFIG.resourceThresholds.cpu.critical) {
      // Emite evento para que sistema pueda reaccionar
      eventBus.emit(SystemEventType.RESOURCE_THRESHOLD_REACHED, {
        resourceType: 'cpu',
        currentValue: metrics.cpu,
        threshold: MONITORING_CONFIG.resourceThresholds.cpu.critical
      });
      
      // Si está en modo automático, cambia a modo de bajo consumo
      if (this.autoModeEnabled && 
          this.currentEnergyMode !== 'lowPower' && 
          this.currentEnergyMode !== 'ultraSaving') {
        this.setEnergyMode('lowPower', true);
        eventBus.emit(SustainabilityEventType.ENERGY_MODE_TRIGGERED, {
          mode: 'lowPower',
          reason: 'highCpuUsage',
          automatic: true
        });
      }
    }
    
    // Verifica umbrales de memoria
    if (metrics.memory.percentage >= MONITORING_CONFIG.resourceThresholds.memory.critical) {
      eventBus.emit(SystemEventType.RESOURCE_THRESHOLD_REACHED, {
        resourceType: 'memory',
        currentValue: metrics.memory.percentage,
        threshold: MONITORING_CONFIG.resourceThresholds.memory.critical
      });
      
      // Sugerencia de optimización
      eventBus.emit(SustainabilityEventType.OPTIMIZATION_SUGGESTED, {
        type: 'memoryUsage',
        suggestion: 'Alto uso de memoria detectado. Considere cerrar documentos no utilizados.'
      });
    }
  }

  /**
   * Establece el modo de energía de la aplicación
   */
  public async setEnergyMode(mode: EnergyMode, isAutomatic: boolean = false): Promise<void> {
    // Guarda modo anterior para comparación
    const previousMode = this.currentEnergyMode;
    
    // Actualiza modo actual
    this.currentEnergyMode = mode;
    
    // Actualiza en preferencias si no es un cambio automático temporal
    if (!isAutomatic) {
      await configManager.updateUserPreferences({ energyMode: mode });
    }
    
    // Aplica configuraciones específicas del modo
    this.applyEnergyModeSettings(mode);
    
    // Ajusta intervalo de monitoreo según nuevo modo
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.startAdaptiveMonitoring();
    }
    
    // Emite evento de cambio de modo de energía
    eventBus.emit(SystemEventType.ENERGY_MODE_CHANGED, {
      previousMode,
      currentMode: mode,
      isAutomatic,
      configApplied: ENERGY_MODE_CONFIGS[mode].features
    });
    
    console.log(`Modo de energía cambiado a ${mode}${isAutomatic ? ' (automático)' : ''}`);
  }

  /**
   * Aplica configuraciones específicas del modo de energía
   */
  private applyEnergyModeSettings(mode: EnergyMode): void {
    // Obtiene configuraciones para este modo
    const config = ENERGY_MODE_CONFIGS[mode].features;
    
    // Aplica configuraciones específicas
    // (estas serían implementadas en los componentes relevantes)
    // Aquí solo notificamos los cambios vía eventos
    
    // Si hay cambio en intervalo de autoguardado, notifica
    if (config.autosaveInterval) {
      eventBus.emit(SustainabilityEventType.CONFIG_AUTOSAVE_INTERVAL_CHANGED, {
        interval: typeof config.autosaveInterval === 'number' ? config.autosaveInterval : 
          typeof config.autosaveInterval === 'string' ? parseInt(config.autosaveInterval, 10) : 30000
      });
    }
    
    // Notifica cambios en renderizado UI
    eventBus.emit(SustainabilityEventType.UI_RENDER_OPTIMIZATION_CHANGED, {
      level: typeof config.renderOptimization === 'string' ? config.renderOptimization : String(config.renderOptimization),
      animations: typeof config.animations === 'boolean' ? config.animations : config.animations === 'true'
    });
    
    // Notifica a servicios de IA
    eventBus.emit(SustainabilityEventType.AI_CONFIG_CHANGED, {
      suggestions: typeof config.aiSuggestions === 'boolean' ? config.aiSuggestions : config.aiSuggestions === 'true'
    });
    
    // Notifica al sistema de cache
    eventBus.emit(SustainabilityEventType.SYSTEM_CACHE_TTL_CHANGED, {
      ttl: typeof config.cacheTTL === 'number' ? config.cacheTTL : typeof config.cacheTTL === 'string' ? parseInt(config.cacheTTL, 10) : 3600000
    });
  }

  /**
   * Obtiene el estado actual del sistema energético
   */
  public async getSystemEnergyState(): Promise<SystemEnergyState> {
    // Obtiene información de batería
    await app.whenReady();
    // Mock de powerMonitor.getSystemPowerInfo para compatibilidad
    const batteryInfo = { percent: 100, charging: true };
    
    return {
      currentMode: this.currentEnergyMode,
      batteryStatus: {
        level: batteryInfo.percent,
        charging: batteryInfo.charging,
        lowPowerMode: this.isLowBattery
      },
      recommendedMode: this.getRecommendedMode(batteryInfo),
      availableModes: ['standard', 'lowPower', 'ultraSaving', 'highPerformance'],
      autoModeEnabled: this.autoModeEnabled
    };
  }

  /**
   * Obtiene el modo de energía actual
   */
  public getCurrentEnergyMode(): EnergyMode {
    return this.currentEnergyMode;
  }

  /**
   * Genera un informe completo de sostenibilidad
   */
  public async generateSustainabilityReport(): Promise<any> {
    const metrics = await this.getMetrics();
    const energyState = await this.getSystemEnergyState();
    
    return {
      timestamp: new Date().toISOString(),
      metrics,
      energyState,
      session: {
        duration: Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000),
        totalEnergyUsed: this.totalEnergyUsed,
        energySaved: this.energySaved,
        dataTransferred: this.dataTransferred
      },
      recommendations: [
        {
          type: "energy",
          description: "Recomendaciones de energía",
          suggestedMode: energyState.recommendedMode
        }
      ]
    };
  }

  /**
   * Obtiene métricas de sostenibilidad
   */
  public async getMetrics(): Promise<any> {
    const resourceMetrics = await this.getCurrentMetrics();
    const powerMetrics = this.estimatePowerConsumption(resourceMetrics);
    
    return {
      ...powerMetrics,
      resources: resourceMetrics,
      session: {
        duration: Math.floor((new Date().getTime() - this.sessionStartTime.getTime()) / 1000),
        totalEnergyUsed: this.totalEnergyUsed,
        energySaved: this.energySaved
      }
    };
  }

  /**
   * Determina el modo de energía recomendado según estado actual
   */
  private getRecommendedMode(batteryInfo: any): EnergyMode {
    // Si está cargando, modo estándar o alto rendimiento
    if (batteryInfo.charging) {
      return batteryInfo.percent > 80 ? 'highPerformance' : 'standard';
    }
    
    // Según nivel de batería
    if (batteryInfo.percent <= MONITORING_CONFIG.batteryThresholds.critical) {
      return 'ultraSaving';
    } else if (batteryInfo.percent <= MONITORING_CONFIG.batteryThresholds.low) {
      return 'lowPower';
    }
    
    // Por defecto, modo estándar
    return 'standard';
  }

  /**
   * Activa/desactiva el modo automático de gestión energética
   */
  public async setAutoModeEnabled(enabled: boolean): Promise<void> {
    this.autoModeEnabled = enabled;
    
    // Si se activa, aplica inmediatamente el modo recomendado
    if (enabled) {
      await app.whenReady();
      // Mock de powerMonitor.getSystemPowerInfo para compatibilidad
      const batteryInfo = { percent: 100, charging: true };
      const recommendedMode = this.getRecommendedMode(batteryInfo);
      
      if (recommendedMode !== this.currentEnergyMode) {
        await this.setEnergyMode(recommendedMode, true);
      }
    }
  }

  /**
   * Registra eventos relacionados con sostenibilidad
   */
  private registerEventListeners(): void {
    // Cuando se actualizan preferencias de usuario
    eventBus.on(SystemEventType.PREFERENCES_UPDATED, (data: { preferences: Partial<UserPreferences> }) => {
      if (data.preferences.energyMode && data.preferences.energyMode !== this.currentEnergyMode) {
        this.setEnergyMode(data.preferences.energyMode);
      }
    });
    
    // Cuando cambia la conectividad
    eventBus.on(SystemEventType.CONNECTIVITY_CHANGED, (data: { online: boolean }) => {
      // Ajusta comportamiento según conectividad
      console.log(`Conectividad cambiada: ${data.online ? 'online' : 'offline'}`);
    });
    
    // Eventos de transferencia de datos para seguimiento
    eventBus.on(SustainabilityEventType.NETWORK_DATA_SENT, (data: { bytes: number; optimizedBytes: number }) => {
      this.dataTransferred.sent += data.bytes;
      this.dataTransferred.saved += (data.optimizedBytes - data.bytes);
    });
    
    eventBus.on(SustainabilityEventType.NETWORK_DATA_RECEIVED, (data: { bytes: number }) => {
      this.dataTransferred.received += data.bytes;
    });
  }

  /**
   * Limpia recursos al cerrar la aplicación
   */
  public dispose(): void {
    // Limpia intervalos
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.batteryCheckInterval) {
      clearInterval(this.batteryCheckInterval);
    }
    
    // Libera recursos del monitor
    this.resourceMonitor.dispose();
    
    console.log('Servicio de sostenibilidad detenido.');
  }
}

// Exporta instancia singleton
export const sustainabilityService = new SustainabilityService();