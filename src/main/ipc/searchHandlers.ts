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

  // Buscar documentos
  safelyRegisterHandler('search:documents', async (_: any, args: {
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
  safelyRegisterHandler('search:indexDocument', async (_: any, document: any) => {
    try {
      return await searchService.indexDocument(document);
    } catch (error) {
      console.error('Error indexing document:', error);
      throw new Error('Failed to index document');
    }
  });

  // Eliminar documento del índice
  safelyRegisterHandler('search:removeDocument', async (_: any, documentId: string) => {
    try {
      return await searchService.removeDocument(documentId);
    } catch (error) {
      console.error(`Error removing document ${documentId} from index:`, error);
      throw new Error('Failed to remove document from index');
    }
  });

  // Obtener búsquedas recientes
  safelyRegisterHandler('search:getRecentSearches', async (_: any, limit?: number) => {
    try {
      return await searchService.getRecentSearches(limit);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      throw new Error('Failed to get recent searches');
    }
  });

  // Guardar búsqueda reciente
  safelyRegisterHandler('search:saveRecentSearch', async (_: any, query: string) => {
    try {
      await searchService.saveRecentSearch(query);
      return true;
    } catch (error) {
      console.error(`Error saving recent search "${query}":`, error);
      throw new Error('Failed to save recent search');
    }
  });

  // Limpiar búsquedas recientes
  safelyRegisterHandler('search:clearRecentSearches', async () => {
    try {
      await searchService.clearRecentSearches();
      return true;
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      throw new Error('Failed to clear recent searches');
    }
  });

  // Reconstruir índice de búsqueda
  safelyRegisterHandler('search:rebuildIndex', async () => {
    try {
      return await searchService.rebuildIndex();
    } catch (error) {
      console.error('Error rebuilding search index:', error);
      throw new Error('Failed to rebuild search index');
    }
  });
}