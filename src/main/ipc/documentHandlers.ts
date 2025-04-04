import { ipcMain, BrowserWindow } from 'electron';
import { DocumentService } from '../../services/document/DocumentService';
import { DocumentChanges, DocumentMetadata } from '../../shared/types/Document';

/**
 * Configura manejadores IPC para operaciones de documentos
 * Implementa patrones óptimos para rendimiento y sostenibilidad
 */
export function setupDocumentHandlers(documentService: DocumentService) {
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

  // Crear documento
  safelyRegisterHandler('document:create', async (_: any, args: {
    title?: string,
    initialContent?: string,
    metadata?: Partial<DocumentMetadata>,
    path?: string
  }) => {
    try {
      const { title, initialContent, path } = args;
      return await documentService.createDocument(title || "Untitled", initialContent || "", path);
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  });

  // Obtener documento
  safelyRegisterHandler('document:get', async (_: any, id: string) => {
    try {
      return await documentService.getDocument(id);
    } catch (error) {
      console.error(`Error getting document ${id}:`, error);
      throw new Error('Failed to retrieve document');
    }
  });

  // Actualizar documento
  safelyRegisterHandler('document:update', async (_: any, args: {
    id: string,
    changes: DocumentChanges,
    options?: { immediate?: boolean; isAutosave?: boolean }
  }) => {
    try {
      const { id, changes, options } = args;
      const createVersion = options?.isAutosave === true ? false : true;
      return await documentService.updateDocument(id, changes, createVersion);
    } catch (error) {
      console.error(`Error updating document ${args.id}:`, error);
      throw new Error('Failed to update document');
    }
  });

  // Eliminar documento
  safelyRegisterHandler('document:delete', async (_: any, args: {
    id: string,
    options?: { immediate?: boolean }
  }) => {
    try {
      const { id } = args;
      return await documentService.deleteDocument(id);
    } catch (error) {
      console.error(`Error deleting document ${args.id}:`, error);
      throw new Error('Failed to delete document');
    }
  });

  // Listar documentos
  safelyRegisterHandler('document:list', async (_: any, _folderPath?: string) => {
    try {
      return await documentService.listDocuments();
    } catch (error) {
      console.error('Error listing documents:', error);
      throw new Error('Failed to list documents');
    }
  });

  // Actualizar metadatos
  safelyRegisterHandler('document:updateMetadata', async (_: any, args: {
    id: string,
    metadata: Partial<DocumentMetadata>
  }) => {
    try {
      const { id, metadata } = args;
      return await documentService.updateMetadata(id, metadata);
    } catch (error) {
      console.error(`Error updating metadata for document ${args.id}:`, error);
      throw new Error('Failed to update document metadata');
    }
  });

  // Actualizar ruta de documento
  safelyRegisterHandler('document:updatePath', async (_: any, args: {
    id: string,
    newPath: string
  }) => {
    try {
      const { id, newPath } = args;
      return await documentService.updateDocumentPath(id, newPath);
    } catch (error) {
      console.error(`Error updating path for document ${args.id}:`, error);
      throw new Error('Failed to update document path');
    }
  });

  // Actualizar etiquetas
  safelyRegisterHandler('document:updateTags', async (_: any, args: {
    id: string,
    tags: string[]
  }) => {
    try {
      const { id, tags } = args;
      return await documentService.updateTags(id, tags);
    } catch (error) {
      console.error(`Error updating tags for document ${args.id}:`, error);
      throw new Error('Failed to update document tags');
    }
  });

  // Obtener estadísticas de documentos
  safelyRegisterHandler('document:getStats', async () => {
    try {
      return await documentService.getDocumentStats();
    } catch (error) {
      console.error('Error getting document stats:', error);
      throw new Error('Failed to get document statistics');
    }
  });

  // Invalidar caché
  safelyRegisterHandler('document:invalidateCache', async (_: any, documentId?: string) => {
    try {
      documentService.invalidateCache(documentId);
      return true;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      throw new Error('Failed to invalidate cache');
    }
  });

  // Importar archivos
  safelyRegisterHandler('document:importFiles', async (event: any) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        throw new Error('No se pudo determinar la ventana para mostrar el diálogo');
      }
      return await documentService.showImportFileDialog(window);
    } catch (error) {
      console.error('Error importing files:', error);
      throw new Error('Failed to import files');
    }
  });

  // Importar carpeta
  safelyRegisterHandler('document:importFolder', async (event: any, options: any) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        throw new Error('No se pudo determinar la ventana para mostrar el diálogo');
      }
      return await documentService.showImportFolderDialog(window, options);
    } catch (error) {
      console.error('Error importing folder:', error);
      throw new Error('Failed to import folder');
    }
  });

  // Importar archivo específico
  safelyRegisterHandler('document:importFile', async (_: any, args: {
    filePath: string,
    targetPath?: string
  }) => {
    try {
      const { filePath, targetPath } = args;
      return await documentService.importFile(filePath, targetPath);
    } catch (error) {
      console.error(`Error importing file ${args.filePath}:`, error);
      throw new Error('Failed to import file');
    }
  });

  // Abrir archivo (diálogo)
  safelyRegisterHandler('document:openFile', async (event: any) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        throw new Error('No se pudo determinar la ventana para mostrar el diálogo');
      }
      return await documentService.showOpenFileDialog(window);
    } catch (error) {
      console.error('Error opening file:', error);
      throw new Error('Failed to open file');
    }
  });

  // Abrir carpeta (diálogo)
  safelyRegisterHandler('document:openFolder', async (event: any, options: any) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (!window) {
        throw new Error('No se pudo determinar la ventana para mostrar el diálogo');
      }
      return await documentService.showOpenFolderDialog(window, options);
    } catch (error) {
      console.error('Error opening folder:', error);
      throw new Error('Failed to open folder');
    }
  });

  // Abrir archivo específico (sin diálogo)
  safelyRegisterHandler('document:openSpecificFile', async (_: any, filePath: string) => {
    try {
      return await documentService.openFile(filePath);
    } catch (error) {
      console.error(`Error opening file ${filePath}:`, error);
      throw new Error('Failed to open specific file');
    }
  });

  // Establecer documento activo
  safelyRegisterHandler('document:setActive', async (_: any, documentId: string) => {
    try {
      return await documentService.setActiveDocument(documentId);
    } catch (error) {
      console.error(`Error setting active document ${documentId}:`, error);
      throw new Error('Failed to set active document');
    }
  });

  // Obtener documento activo
  safelyRegisterHandler('document:getActive', async () => {
    try {
      return documentService.getActiveDocument();
    } catch (error) {
      console.error('Error getting active document:', error);
      throw new Error('Failed to get active document');
    }
  });
}