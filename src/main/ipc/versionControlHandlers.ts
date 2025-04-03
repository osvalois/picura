import { ipcMain } from 'electron';

// Definimos un tipo para el servicio de control de versiones
// Esta interfaz debe ser implementada por el servicio real
interface VersionControlService {
  initialize(repoPath: string): Promise<boolean>;
  getStatus(): Promise<any>;
  commit(message: string, files?: string[]): Promise<any>;
  push(): Promise<any>;
  pull(): Promise<any>;
  checkout(branch: string): Promise<any>;
  createBranch(name: string): Promise<any>;
  getHistory(path?: string, limit?: number): Promise<any>;
  getDiff(path?: string): Promise<any>;
  trackDocument(documentId: string, path: string): Promise<boolean>;
  getDocumentHistory(documentId: string): Promise<any[]>;
  revertDocument(documentId: string, version: string): Promise<boolean>;
  isRepositoryInitialized(): Promise<boolean>;
}

/**
 * Configura manejadores IPC para operaciones de control de versiones
 * Optimizado para operaciones Git y seguimiento de documentos
 */
export function setupVersionControlHandlers(versionControlService: VersionControlService) {
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

  // Inicializar repositorio
  safelyRegisterHandler('versionControl:initialize', async (_: any, repoPath: string) => {
    try {
      return await versionControlService.initialize(repoPath);
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw new Error('Failed to initialize repository');
    }
  });

  // Obtener estado del repositorio
  safelyRegisterHandler('versionControl:getStatus', async () => {
    try {
      return await versionControlService.getStatus();
    } catch (error) {
      console.error('Error getting repository status:', error);
      throw new Error('Failed to get repository status');
    }
  });

  // Hacer commit de cambios
  safelyRegisterHandler('versionControl:commit', async (_: any, args: {
    message: string,
    files?: string[]
  }) => {
    try {
      const { message, files } = args;
      return await versionControlService.commit(message, files);
    } catch (error) {
      console.error('Error committing changes:', error);
      throw new Error('Failed to commit changes');
    }
  });

  // Enviar cambios al remoto (push)
  safelyRegisterHandler('versionControl:push', async () => {
    try {
      return await versionControlService.push();
    } catch (error) {
      console.error('Error pushing changes:', error);
      throw new Error('Failed to push changes');
    }
  });

  // Traer cambios del remoto (pull)
  safelyRegisterHandler('versionControl:pull', async () => {
    try {
      return await versionControlService.pull();
    } catch (error) {
      console.error('Error pulling changes:', error);
      throw new Error('Failed to pull changes');
    }
  });

  // Cambiar de rama
  safelyRegisterHandler('versionControl:checkout', async (_: any, branch: string) => {
    try {
      return await versionControlService.checkout(branch);
    } catch (error) {
      console.error(`Error checking out branch ${branch}:`, error);
      throw new Error('Failed to checkout branch');
    }
  });

  // Crear nueva rama
  safelyRegisterHandler('versionControl:createBranch', async (_: any, name: string) => {
    try {
      return await versionControlService.createBranch(name);
    } catch (error) {
      console.error(`Error creating branch ${name}:`, error);
      throw new Error('Failed to create branch');
    }
  });

  // Obtener historial de commits
  safelyRegisterHandler('versionControl:getHistory', async (_: any, args: {
    path?: string,
    limit?: number
  }) => {
    try {
      const { path, limit } = args;
      return await versionControlService.getHistory(path, limit);
    } catch (error) {
      console.error('Error getting commit history:', error);
      throw new Error('Failed to get commit history');
    }
  });

  // Obtener diferencias (diff)
  safelyRegisterHandler('versionControl:getDiff', async (_: any, path?: string) => {
    try {
      return await versionControlService.getDiff(path);
    } catch (error) {
      console.error('Error getting diff:', error);
      throw new Error('Failed to get diff');
    }
  });

  // Seguimiento de documento
  safelyRegisterHandler('versionControl:trackDocument', async (_: any, args: {
    documentId: string,
    path: string
  }) => {
    try {
      const { documentId, path } = args;
      return await versionControlService.trackDocument(documentId, path);
    } catch (error) {
      console.error(`Error tracking document ${args.documentId}:`, error);
      throw new Error('Failed to track document');
    }
  });

  // Obtener historial de documento
  safelyRegisterHandler('versionControl:getDocumentHistory', async (_: any, documentId: string) => {
    try {
      return await versionControlService.getDocumentHistory(documentId);
    } catch (error) {
      console.error(`Error getting history for document ${documentId}:`, error);
      throw new Error('Failed to get document history');
    }
  });

  // Revertir documento a versión anterior
  safelyRegisterHandler('versionControl:revertDocument', async (_: any, args: {
    documentId: string,
    version: string
  }) => {
    try {
      const { documentId, version } = args;
      return await versionControlService.revertDocument(documentId, version);
    } catch (error) {
      console.error(`Error reverting document ${args.documentId} to version ${args.version}:`, error);
      throw new Error('Failed to revert document');
    }
  });

  // Verificar si el repositorio está inicializado
  safelyRegisterHandler('versionControl:isInitialized', async () => {
    try {
      return await versionControlService.isRepositoryInitialized();
    } catch (error) {
      console.error('Error checking repository initialization:', error);
      throw new Error('Failed to check repository status');
    }
  });
}