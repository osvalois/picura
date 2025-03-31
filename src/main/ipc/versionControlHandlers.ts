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
  // Inicializar repositorio
  ipcMain.handle('versionControl:initialize', async (_, repoPath: string) => {
    try {
      return await versionControlService.initialize(repoPath);
    } catch (error) {
      console.error('Error initializing repository:', error);
      throw new Error('Failed to initialize repository');
    }
  });

  // Obtener estado del repositorio
  ipcMain.handle('versionControl:getStatus', async () => {
    try {
      return await versionControlService.getStatus();
    } catch (error) {
      console.error('Error getting repository status:', error);
      throw new Error('Failed to get repository status');
    }
  });

  // Hacer commit de cambios
  ipcMain.handle('versionControl:commit', async (_, args: {
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
  ipcMain.handle('versionControl:push', async () => {
    try {
      return await versionControlService.push();
    } catch (error) {
      console.error('Error pushing changes:', error);
      throw new Error('Failed to push changes');
    }
  });

  // Traer cambios del remoto (pull)
  ipcMain.handle('versionControl:pull', async () => {
    try {
      return await versionControlService.pull();
    } catch (error) {
      console.error('Error pulling changes:', error);
      throw new Error('Failed to pull changes');
    }
  });

  // Cambiar de rama
  ipcMain.handle('versionControl:checkout', async (_, branch: string) => {
    try {
      return await versionControlService.checkout(branch);
    } catch (error) {
      console.error(`Error checking out branch ${branch}:`, error);
      throw new Error('Failed to checkout branch');
    }
  });

  // Crear nueva rama
  ipcMain.handle('versionControl:createBranch', async (_, name: string) => {
    try {
      return await versionControlService.createBranch(name);
    } catch (error) {
      console.error(`Error creating branch ${name}:`, error);
      throw new Error('Failed to create branch');
    }
  });

  // Obtener historial de commits
  ipcMain.handle('versionControl:getHistory', async (_, args: {
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
  ipcMain.handle('versionControl:getDiff', async (_, path?: string) => {
    try {
      return await versionControlService.getDiff(path);
    } catch (error) {
      console.error('Error getting diff:', error);
      throw new Error('Failed to get diff');
    }
  });

  // Seguimiento de documento
  ipcMain.handle('versionControl:trackDocument', async (_, args: {
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
  ipcMain.handle('versionControl:getDocumentHistory', async (_, documentId: string) => {
    try {
      return await versionControlService.getDocumentHistory(documentId);
    } catch (error) {
      console.error(`Error getting history for document ${documentId}:`, error);
      throw new Error('Failed to get document history');
    }
  });

  // Revertir documento a versión anterior
  ipcMain.handle('versionControl:revertDocument', async (_, args: {
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
  ipcMain.handle('versionControl:isInitialized', async () => {
    try {
      return await versionControlService.isRepositoryInitialized();
    } catch (error) {
      console.error('Error checking repository initialization:', error);
      throw new Error('Failed to check repository status');
    }
  });
}