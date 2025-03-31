import { setupDocumentHandlers } from './documentHandlers';
import { setupSustainabilityHandlers } from './sustainabilityHandlers';
import { setupVersionControlHandlers } from './versionControlHandlers';
import { setupSearchHandlers } from './searchHandlers';
import { setupAIHandlers } from './aiHandlers';
import { setupSyncHandlers } from './syncHandlers';

/**
 * Configura todos los manejadores IPC de la aplicación
 * Esta función registra todas las comunicaciones entre procesos renderer y main
 * @param services Objeto con los servicios de la aplicación
 */
export function setupIPC(services: {
  documentService: any;
  sustainabilityService: any;
  versionControlService: any;
  searchService: any;
  aiService: any;
  syncService: any;
}) {
  // Registra manejadores para cada servicio principal
  setupDocumentHandlers(services.documentService);
  setupSustainabilityHandlers(services.sustainabilityService);
  setupVersionControlHandlers(services.versionControlService);
  setupSearchHandlers(services.searchService);
  setupAIHandlers(services.aiService);
  setupSyncHandlers(services.syncService);
  
  console.log('IPC handlers established for all services');
}