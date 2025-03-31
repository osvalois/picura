import { ResourceUsageMetrics } from '../../shared/types/SustainabilityMetrics';
import { app } from 'electron';
import os from 'os';

/**
 * Monitor de recursos del sistema optimizado para eficiencia
 * Recopila métricas de uso de CPU, memoria, batería y red
 */
export class ResourceMonitor {
  private lastCPUUsage: NodeJS.CpuUsage | null = null;
  private lastNetworkUsage: { sent: number; received: number } | null = null;
  private lastUsageTimestamp: number = 0;
  private initialized: boolean = false;

  /**
   * Inicializa el monitor de recursos
   */
  public async initialize(): Promise<void> {
    // Espera a que la aplicación esté lista
    await app.whenReady();
    
    // Inicializa mediciones base
    this.lastCPUUsage = process.cpuUsage();
    this.lastUsageTimestamp = Date.now();
    
    try {
      // Intentamos obtener uso de red inicial (si está disponible)
      // Esto varía según plataforma
      const networkStats = await this.getNetworkStats();
      if (networkStats) {
        this.lastNetworkUsage = networkStats;
      }
    } catch (error) {
      console.error('Error al inicializar estadísticas de red:', error);
      // Continúa sin estadísticas de red si no están disponibles
    }
    
    this.initialized = true;
    console.log('Monitor de recursos inicializado');
  }

  /**
   * Obtiene las métricas de recursos actuales
   */
  public async getMetrics(): Promise<ResourceUsageMetrics> {
    if (!this.initialized) {
      // Intenta inicializar si no está ya inicializado
      try {
        await this.initialize();
      } catch (error) {
        console.warn('Inicialización automática de ResourceMonitor falló:', error);
        // Usa valores predeterminados
        return {
          timestamp: Date.now(),
          cpu: 0,
          memory: {
            total: os.totalmem(),
            used: 0,
            percentage: 0
          }
        };
      }
    }

    const currentTime = Date.now();
    const currentCPUUsage = process.cpuUsage();
    
    // Calcula uso de CPU desde última medición
    const cpuPercent = this.calculateCPUPercent(
      this.lastCPUUsage!, 
      currentCPUUsage,
      currentTime - this.lastUsageTimestamp
    );
    
    // Actualiza referencias para próxima medición
    this.lastCPUUsage = currentCPUUsage;
    this.lastUsageTimestamp = currentTime;
    
    // Obtiene información de memoria
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Construye métricas base
    const metrics: ResourceUsageMetrics = {
      timestamp: currentTime,
      cpu: cpuPercent,
      memory: {
        total: totalMem,
        used: usedMem,
        percentage: (usedMem / totalMem) * 100
      }
    };
    
    // Agrega métricas de red si están disponibles
    try {
      const networkInfo = await this.getNetworkUsage();
      if (networkInfo) {
        metrics.network = networkInfo;
      }
    } catch (error) {
      console.error('Error al obtener información de red:', error);
      // Continúa sin información de red
    }
    
    // Agrega métricas de disco si están disponibles
    try {
      const diskInfo = await this.getDiskUsage();
      if (diskInfo) {
        metrics.disk = diskInfo;
      }
    } catch (error) {
      console.error('Error al obtener información de disco:', error);
      // Continúa sin información de disco
    }
    
    return metrics;
  }

  /**
   * Calcula el porcentaje de uso de CPU
   */
  private calculateCPUPercent(
    startUsage: NodeJS.CpuUsage,
    endUsage: NodeJS.CpuUsage,
    elapsedMs: number
  ): number {
    // Calcula microsegundos de CPU usados
    const userUsageMicros = endUsage.user - startUsage.user;
    const systemUsageMicros = endUsage.system - startUsage.system;
    const totalUsageMicros = userUsageMicros + systemUsageMicros;
    
    // Convierte a porcentaje, considerando múltiples cores
    const cpuCount = os.cpus().length;
    const elapsedMicros = elapsedMs * 1000; // ms a microsegundos
    const totalPossibleMicros = elapsedMicros * cpuCount;
    
    // Calcula porcentaje (limitado a 100% por núcleo en total)
    const cpuPercent = Math.min(
      (totalUsageMicros / totalPossibleMicros) * 100,
      100
    );
    
    return cpuPercent;
  }

  // Se elimina la función getBatteryInfo ya que no es compatible con la estructura actual

  /**
   * Obtiene estadísticas actuales de red
   * Este es un enfoque simplificado, podría expandirse según plataforma
   */
  private async getNetworkStats(): Promise<{ sent: number; received: number } | null> {
    // Esta implementación es un placeholder
    // En una implementación real, usaríamos APIs específicas de plataforma
    // o módulos como 'network' o 'systeminformation' para Node.js
    
    try {
      // Simulamos obtención de estadísticas
      // En implementación real, obtendríamos datos del OS
      return {
        sent: 0,
        received: 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de red:', error);
      return null;
    }
  }

  /**
   * Calcula uso de red desde última medición
   */
  private async getNetworkUsage(): Promise<{ sent: number; received: number } | null> {
    try {
      const currentStats = await this.getNetworkStats();
      if (!currentStats || !this.lastNetworkUsage) {
        return null;
      }
      
      // Calcula bytes enviados/recibidos desde última medición
      const sent = Math.max(0, currentStats.sent - this.lastNetworkUsage.sent);
      const received = Math.max(0, currentStats.received - this.lastNetworkUsage.received);
      
      // Actualiza para próxima medición
      this.lastNetworkUsage = currentStats;
      
      return {
        sent,
        received
      };
    } catch (error) {
      console.error('Error al calcular uso de red:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de uso de disco
   * Implementación simple que podría expandirse
   */
  private async getDiskUsage(): Promise<{ reads: number; writes: number } | null> {
    // En implementación real, mediríamos operaciones I/O reales
    // Por ahora usamos estimaciones simples
    try {
      // Placeholder - en implementación real usaríamos APIs como
      // fs.statfs o módulos como 'diskusage'
      return {
        reads: 0,
        writes: 0
      };
    } catch (error) {
      console.error('Error al obtener uso de disco:', error);
      return null;
    }
  }

  /**
   * Libera recursos al detener el monitor
   */
  public dispose(): void {
    this.lastCPUUsage = null;
    this.lastNetworkUsage = null;
    this.initialized = false;
  }
}