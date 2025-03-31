import { ipcMain } from 'electron';

// Definimos un tipo para el servicio de búsqueda
// Esta interfaz debe ser implementada por el servicio real
interface SearchService {
  searchDocuments(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  indexDocument(document: any): Promise<boolean>;
  removeDocument(documentId: string): Promise<boolean>;
  getRecentSearches(limit?: number): Promise<string[]>;
  saveRecentSearch(query: string): Promise<void>;
  clearRecentSearches(): Promise<void>;
  rebuildIndex(): Promise<boolean>;
}

// Tipos de datos para búsqueda
interface SearchOptions {
  filters?: {
    tags?: string[];
    path?: string;
    dateRange?: {
      from?: Date;
      to?: Date;
    };
    metadata?: Record<string, any>;
  };
  sortBy?: 'relevance' | 'date' | 'title';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface SearchResult {
  documentId: string;
  title: string;
  path: string;
  snippet: string;
  matchCount: number;
  relevanceScore: number;
  tags?: string[];
  updatedAt?: Date;
}

/**
 * Configura manejadores IPC para operaciones de búsqueda
 * Optimizado para rendimiento y sostenibilidad
 */
export function setupSearchHandlers(searchService: SearchService) {
  // Buscar documentos
  ipcMain.handle('search:documents', async (_, args: {
    query: string,
    options?: SearchOptions
  }) => {
    try {
      const { query, options } = args;
      return await searchService.searchDocuments(query, options);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  });

  // Indexar documento
  ipcMain.handle('search:indexDocument', async (_, document: any) => {
    try {
      return await searchService.indexDocument(document);
    } catch (error) {
      console.error('Error indexing document:', error);
      throw new Error('Failed to index document');
    }
  });

  // Eliminar documento del índice
  ipcMain.handle('search:removeDocument', async (_, documentId: string) => {
    try {
      return await searchService.removeDocument(documentId);
    } catch (error) {
      console.error(`Error removing document ${documentId} from index:`, error);
      throw new Error('Failed to remove document from index');
    }
  });

  // Obtener búsquedas recientes
  ipcMain.handle('search:getRecentSearches', async (_, limit?: number) => {
    try {
      return await searchService.getRecentSearches(limit);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      throw new Error('Failed to get recent searches');
    }
  });

  // Guardar búsqueda reciente
  ipcMain.handle('search:saveRecentSearch', async (_, query: string) => {
    try {
      await searchService.saveRecentSearch(query);
      return true;
    } catch (error) {
      console.error(`Error saving recent search "${query}":`, error);
      throw new Error('Failed to save recent search');
    }
  });

  // Limpiar búsquedas recientes
  ipcMain.handle('search:clearRecentSearches', async () => {
    try {
      await searchService.clearRecentSearches();
      return true;
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      throw new Error('Failed to clear recent searches');
    }
  });

  // Reconstruir índice de búsqueda
  ipcMain.handle('search:rebuildIndex', async () => {
    try {
      return await searchService.rebuildIndex();
    } catch (error) {
      console.error('Error rebuilding search index:', error);
      throw new Error('Failed to rebuild search index');
    }
  });
}