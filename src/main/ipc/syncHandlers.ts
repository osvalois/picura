import { ipcMain } from 'electron';

// Definimos un tipo para el servicio de sincronización
// Esta interfaz debe ser implementada por el servicio real
interface SyncService {
  initialize(options?: SyncOptions): Promise<boolean>;
  sync(documentId?: string): Promise<SyncResult>;
  getStatus(): Promise<SyncStatus>;
  enableSync(enabled: boolean): Promise<boolean>;
  setRemote(url: string, token?: string): Promise<boolean>;
  resolveConflict(documentId: string, resolution: ConflictResolution): Promise<boolean>;
  getPendingChanges(): Promise<PendingChange[]>;
  getLastSyncTimestamp(): Promise<number>;
  isConfigured(): Promise<boolean>;
}

// Tipos de datos para sincronización
interface SyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  conflictStrategy?: 'ask' | 'remote' | 'local' | 'newest';
  remoteUrl?: string;
  token?: string;
}

interface SyncResult {
  success: boolean;
  documentsChanged: number;
  conflicts: Array<{
    documentId: string;
    localVersion: string;
    remoteVersion: string;
    conflictType: 'content' | 'metadata' | 'both';
  }>;
  errors: Array<{
    documentId: string;
    error: string;
  }>;
  timestamp: number;
}

interface SyncStatus {
  enabled: boolean;
  lastSync: number;
  isSyncing: boolean;
  pendingChanges: number;
  conflicts: number;
  remoteConfigured: boolean;
}

type ConflictResolution = 'local' | 'remote' | 'merge';

interface PendingChange {
  documentId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
}

/**
 * Configura manejadores IPC para operaciones de sincronización
 * Optimizado para eficiencia en redes y recursos
 */
export function setupSyncHandlers(syncService: SyncService) {
  // Helper function to safely register handlers
  const safelyRegisterHandler = (channel: string, handler: any) => {
    try {
      // Remove any existing handler first
      ipcMain.removeHandler(channel);
      // Register the new handler
      ipcMain.handle(channel, handler);
    } catch (error) {
      console.error(`Error registering handler for ${channel}:`, error);
    }
  };

  // Inicializar servicio de sincronización
  safelyRegisterHandler('sync:initialize', async (_: any, options?: SyncOptions) => {
    try {
      return await syncService.initialize(options);
    } catch (error) {
      console.error('Error initializing sync service:', error);
      throw new Error('Failed to initialize sync service');
    }
  });

  // Sincronizar documentos
  safelyRegisterHandler('sync:sync', async (_: any, documentId?: string) => {
    try {
      return await syncService.sync(documentId);
    } catch (error) {
      console.error('Error syncing documents:', error);
      throw new Error('Failed to sync documents');
    }
  });

  // Obtener estado de sincronización
  safelyRegisterHandler('sync:getStatus', async () => {
    try {
      return await syncService.getStatus();
    } catch (error) {
      console.error('Error getting sync status:', error);
      throw new Error('Failed to get sync status');
    }
  });

  // Habilitar/deshabilitar sincronización
  safelyRegisterHandler('sync:enable', async (_: any, enabled: boolean) => {
    try {
      return await syncService.enableSync(enabled);
    } catch (error) {
      console.error(`Error ${enabled ? 'enabling' : 'disabling'} sync:`, error);
      throw new Error(`Failed to ${enabled ? 'enable' : 'disable'} sync`);
    }
  });

  // Establecer remoto
  safelyRegisterHandler('sync:setRemote', async (_: any, args: {
    url: string,
    token?: string
  }) => {
    try {
      const { url, token } = args;
      return await syncService.setRemote(url, token);
    } catch (error) {
      console.error('Error setting remote:', error);
      throw new Error('Failed to set remote');
    }
  });

  // Resolver conflicto
  safelyRegisterHandler('sync:resolveConflict', async (_: any, args: {
    documentId: string,
    resolution: ConflictResolution
  }) => {
    try {
      const { documentId, resolution } = args;
      return await syncService.resolveConflict(documentId, resolution);
    } catch (error) {
      console.error(`Error resolving conflict for document ${args.documentId}:`, error);
      throw new Error('Failed to resolve conflict');
    }
  });

  // Obtener cambios pendientes
  safelyRegisterHandler('sync:getPendingChanges', async () => {
    try {
      return await syncService.getPendingChanges();
    } catch (error) {
      console.error('Error getting pending changes:', error);
      throw new Error('Failed to get pending changes');
    }
  });

  // Obtener timestamp de última sincronización
  safelyRegisterHandler('sync:getLastSyncTimestamp', async () => {
    try {
      return await syncService.getLastSyncTimestamp();
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      throw new Error('Failed to get last sync timestamp');
    }
  });

  // Verificar si está configurado
  safelyRegisterHandler('sync:isConfigured', async () => {
    try {
      return await syncService.isConfigured();
    } catch (error) {
      console.error('Error checking sync configuration:', error);
      throw new Error('Failed to check sync configuration');
    }
  });
}