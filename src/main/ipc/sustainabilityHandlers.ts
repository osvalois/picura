import { ipcMain } from 'electron';
import { SustainabilityService } from '../../services/sustainability/SustainabilityService';
import { EnergyMode } from '../../shared/types/SustainabilityMetrics';

/**
 * Configura manejadores IPC para operaciones relacionadas con sostenibilidad
 * Implementa eventos optimizados para monitoreo y ajuste de recursos
 */
export function setupSustainabilityHandlers(sustainabilityService: SustainabilityService) {
  // Obtener métricas de sostenibilidad actuales
  ipcMain.handle('sustainability:getMetrics', async () => {
    try {
      return await sustainabilityService.getMetrics();
    } catch (error) {
      console.error('Error getting sustainability metrics:', error);
      throw new Error('Failed to retrieve sustainability metrics');
    }
  });

  // Obtener modo de energía actual
  ipcMain.handle('sustainability:getEnergyMode', () => {
    try {
      return sustainabilityService.getCurrentEnergyMode();
    } catch (error) {
      console.error('Error getting energy mode:', error);
      throw new Error('Failed to get current energy mode');
    }
  });

  // Establecer modo de energía
  ipcMain.handle('sustainability:setEnergyMode', async (_, mode: EnergyMode) => {
    try {
      return await sustainabilityService.setEnergyMode(mode);
    } catch (error) {
      console.error(`Error setting energy mode to ${mode}:`, error);
      throw new Error('Failed to set energy mode');
    }
  });

  // Generar informe de sostenibilidad
  ipcMain.handle('sustainability:generateReport', async () => {
    try {
      return await sustainabilityService.generateSustainabilityReport();
    } catch (error) {
      console.error('Error generating sustainability report:', error);
      throw new Error('Failed to generate sustainability report');
    }
  });

  // Obtener historial de métricas
  ipcMain.handle('sustainability:getMetricsHistory', async (_, args: {
    timeRange?: 'hour' | 'day' | 'week' | 'month',
    limit?: number
  }) => {
    try {
      const { timeRange = 'day', limit = 100 } = args;
      return await sustainabilityService.getMetricsHistory(timeRange, limit);
    } catch (error) {
      console.error('Error getting metrics history:', error);
      throw new Error('Failed to retrieve metrics history');
    }
  });

  // Obtener sugerencias de optimización
  ipcMain.handle('sustainability:getOptimizationSuggestions', async () => {
    try {
      return await sustainabilityService.getOptimizationSuggestions();
    } catch (error) {
      console.error('Error getting optimization suggestions:', error);
      throw new Error('Failed to get optimization suggestions');
    }
  });

  // Obtener estado de batería
  ipcMain.handle('sustainability:getBatteryStatus', async () => {
    try {
      return await sustainabilityService.getBatteryStatus();
    } catch (error) {
      console.error('Error getting battery status:', error);
      throw new Error('Failed to get battery status');
    }
  });

  // Iniciar monitoreo intensivo (temporal)
  ipcMain.handle('sustainability:startIntensiveMonitoring', async (_, duration: number = 60000) => {
    try {
      return await sustainabilityService.startIntensiveMonitoring(duration);
    } catch (error) {
      console.error('Error starting intensive monitoring:', error);
      throw new Error('Failed to start intensive resource monitoring');
    }
  });

  // Detener monitoreo intensivo
  ipcMain.handle('sustainability:stopIntensiveMonitoring', async () => {
    try {
      return await sustainabilityService.stopIntensiveMonitoring();
    } catch (error) {
      console.error('Error stopping intensive monitoring:', error);
      throw new Error('Failed to stop intensive resource monitoring');
    }
  });
}