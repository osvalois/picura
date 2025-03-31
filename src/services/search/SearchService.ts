import { Document } from '../../shared/types/Document';
import { SearchResult, SearchOptions, SearchStats } from '../../shared/types/SearchTypes';
import { documentService } from '../document/DocumentService';
import { EventBus } from '../../core/events/EventBus';
import { eventBus } from '../../core/events/EventBus';
import { UIEventType, DocumentEventType } from '../../core/events/EventTypes';
import { APP_CONSTANTS } from '../../config/defaults';

/**
 * Servicio para búsqueda eficiente de documentos
 * Implementa técnicas optimizadas para bajo consumo de recursos
 */
export class SearchService {
  private initialized: boolean = false;
  private searchIndex: Map<string, Set<string>> = new Map();
  private documentCache: Map<string, { title: string, path: string, tags: string[] }> = new Map();
  private indexingQueue: string[] = [];
  private isIndexing: boolean = false;
  private indexingTimeout: NodeJS.Timeout | null = null;
  private indexVersion: number = 0;
  private termStats: Map<string, { count: number, documents: number }> = new Map();

  constructor() {}

  /**
   * Inicializa el servicio de búsqueda
   */
  public async initialize(): Promise<void> {
    try {
      // Construye índice inicial con documentos existentes
      await this.rebuildSearchIndex();
      
      // Registra escuchas para eventos relevantes
      this.registerEventListeners();
      
      this.initialized = true;
      console.log('Servicio de búsqueda inicializado');
    } catch (error) {
      console.error('Error inicializando servicio de búsqueda:', error);
      throw error;
    }
  }

  /**
   * Reconstruye el índice de búsqueda completo
   */
  public async rebuildSearchIndex(): Promise<void> {
    try {
      // Limpia índices existentes
      this.searchIndex.clear();
      this.documentCache.clear();
      this.termStats.clear();
      
      // Obtiene todos los documentos
      const documents = await documentService.listDocuments();
      
      // Indexa documentos en bloques para evitar bloquear el hilo principal
      for (let i = 0; i < documents.length; i += APP_CONSTANTS.indexingBatchSize) {
        const batch = documents.slice(i, i + APP_CONSTANTS.indexingBatchSize);
        await this.indexDocumentBatch(batch);
      }
      
      // Incrementa versión del índice
      this.indexVersion++;
      
      console.log(`Índice de búsqueda reconstruido: ${documents.length} documentos`);
    } catch (error) {
      console.error('Error reconstruyendo índice de búsqueda:', error);
      throw error;
    }
  }

  /**
   * Indexa un lote de documentos
   */
  private async indexDocumentBatch(documents: Document[]): Promise<void> {
    for (const document of documents) {
      await this.indexDocument(document);
    }
  }

  /**
   * Indexa un único documento
   */
  public async indexDocument(document: Document): Promise<void> {
    try {
      // Prepara texto para indexación
      const title = document.title.toLowerCase();
      const content = document.content.toLowerCase();
      const tags = document.tags.map(tag => tag.toLowerCase());
      
      // Tokeniza el contenido
      const titleTokens = this.tokenize(title);
      const contentTokens = this.tokenize(content);
      const allTokens = new Set([...titleTokens, ...contentTokens, ...tags]);
      
      // Guarda metadata en caché para búsquedas rápidas
      this.documentCache.set(document.id, {
        title: document.title,
        path: document.path,
        tags: document.tags
      });
      
      // Actualiza índice de términos
      for (const token of allTokens) {
        // Ignora tokens muy cortos o muy comunes
        if (token.length < 2) continue;
        
        // Agrega documento al índice invertido para este token
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set());
        }
        this.searchIndex.get(token)?.add(document.id);
        
        // Actualiza estadísticas del término
        if (!this.termStats.has(token)) {
          this.termStats.set(token, { count: 0, documents: 0 });
        }
        const stats = this.termStats.get(token)!;
        stats.documents++;
        stats.count += this.countOccurrences(content, token);
      }
    } catch (error) {
      console.error(`Error indexando documento ${document.id}:`, error);
    }
  }

  /**
   * Elimina un documento del índice
   */
  public removeDocumentFromIndex(documentId: string): void {
    // Elimina de caché
    this.documentCache.delete(documentId);
    
    // Elimina de índice invertido
    for (const [term, docSet] of this.searchIndex.entries()) {
      if (docSet.has(documentId)) {
        docSet.delete(documentId);
        
        // Actualiza estadísticas
        if (this.termStats.has(term)) {
          const stats = this.termStats.get(term)!;
          stats.documents--;
          
          // Limpia término si ya no está en ningún documento
          if (stats.documents <= 0) {
            this.termStats.delete(term);
            this.searchIndex.delete(term);
          }
        }
      }
    }
  }

  /**
   * Realiza una búsqueda en el índice
   */
  public async search(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    if (!this.initialized) {
      throw new Error('SearchService no inicializado. Llame a initialize() primero.');
    }
    
    // Si no hay query, devuelve lista vacía
    if (!query.trim()) {
      return [];
    }
    
    // Prepara opciones de búsqueda
    const {
      limit = 50,
      path,
      includeTags = true,
      includeContent = true,
      caseSensitive = false,
      sortBy = 'relevance'
    } = options;
    
    try {
      // Tokeniza la consulta
      const queryTokens = this.tokenize(caseSensitive ? query : query.toLowerCase());
      
      // Obtiene IDs de documentos que contienen los tokens de búsqueda
      const matchingDocIds = this.findMatchingDocuments(queryTokens, path);
      
      // Si no hay coincidencias, devuelve lista vacía
      if (matchingDocIds.length === 0) {
        return [];
      }
      
      // Carga documentos y calcula relevancia
      const results: SearchResult[] = [];
      for (const docId of matchingDocIds) {
        const doc = await documentService.getDocument(docId);
        
        if (!doc) continue;
        
        // Extracto de texto donde aparece la búsqueda
        const excerpt = includeContent ? this.generateExcerpt(doc.content, queryTokens, caseSensitive) : '';
        
        // Calcula puntuación de relevancia
        const score = this.calculateRelevance(doc, queryTokens, caseSensitive);
        
        results.push({
          documentId: doc.id,
          id: doc.id,
          title: doc.title,
          path: doc.path,
          excerpt,
          snippet: excerpt,
          score,
          matches: this.generateSearchMatches(doc, queryTokens, caseSensitive),
          tags: includeTags ? doc.tags : [],
          timestamp: (typeof doc.updatedAt === 'string' ? doc.updatedAt : doc.updatedAt?.toISOString()) || new Date().toISOString()
        });
      }
      
      // Ordena resultados
      this.sortResults(results, sortBy);
      
      // Limita cantidad de resultados
      const limitedResults = results.slice(0, limit);
      
      // Emite evento de búsqueda realizada
      eventBus.emit(UIEventType.SEARCH_PERFORMED, {
        query,
        resultCount: limitedResults.length,
        totalMatches: matchingDocIds.length
      });
      
      return limitedResults;
    } catch (error) {
      console.error('Error realizando búsqueda:', error);
      return [];
    }
  }

  /**
   * Divide texto en tokens para búsqueda
   */
  private tokenize(text: string): string[] {
    // Divide por espacios y elimina signos de puntuación
    return text
      .replace(/[^\p{L}\p{N}\s]/gu, ' ') // Elimina caracteres que no sean letras, números o espacios
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  /**
   * Cuenta ocurrencias de un término en un texto
   */
  private countOccurrences(text: string, term: string): number {
    let count = 0;
    let pos = text.indexOf(term);
    
    while (pos !== -1) {
      count++;
      pos = text.indexOf(term, pos + 1);
    }
    
    return count;
  }

  /**
   * Encuentra documentos que coinciden con los términos de búsqueda
   */
  private findMatchingDocuments(queryTokens: string[], path?: string): string[] {
    // Si no hay tokens de búsqueda, devuelve lista vacía
    if (queryTokens.length === 0) {
      return [];
    }
    
    // Obtiene conjuntos de documentos para cada token
    const docSets: Set<string>[] = [];
    for (const token of queryTokens) {
      if (this.searchIndex.has(token)) {
        docSets.push(this.searchIndex.get(token)!);
      }
    }
    
    // Si no hay coincidencias, devuelve lista vacía
    if (docSets.length === 0) {
      return [];
    }
    
    // Encuentra la intersección de todos los conjuntos
    // (documentos que contienen todos los tokens)
    let result: string[];
    if (docSets.length === 1) {
      // Si solo hay un token, usa esos documentos
      result = Array.from(docSets[0]);
    } else {
      // Intersección de documentos que contienen todos los tokens
      const intersection = new Set(docSets[0]);
      for (let i = 1; i < docSets.length; i++) {
        for (const docId of intersection) {
          if (!docSets[i].has(docId)) {
            intersection.delete(docId);
          }
        }
      }
      result = Array.from(intersection);
    }
    
    // Filtra por ruta si se especificó
    if (path) {
      result = result.filter(docId => {
        const docInfo = this.documentCache.get(docId);
        return docInfo && docInfo.path === path;
      });
    }
    
    return result;
  }

  /**
   * Genera un extracto del contenido que muestra el contexto de la búsqueda
   */
  private generateExcerpt(content: string, queryTokens: string[], caseSensitive: boolean): string {
    const contentToSearch = caseSensitive ? content : content.toLowerCase();
    const maxExcerptLength = 150;
    
    // Busca la primera ocurrencia de cualquier token
    let bestPos = -1;
    let bestToken = '';
    
    for (const token of queryTokens) {
      const pos = contentToSearch.indexOf(token);
      if (pos !== -1 && (bestPos === -1 || pos < bestPos)) {
        bestPos = pos;
        bestToken = token;
      }
    }
    
    if (bestPos === -1) {
      // No se encontró ningún token, devuelve el inicio del documento
      return content.length > maxExcerptLength
        ? content.substring(0, maxExcerptLength) + '...'
        : content;
    }
    
    // Encuentra el inicio del extracto (inicio de oración o párrafo)
    let startPos = Math.max(0, bestPos - 60);
    const endPos = Math.min(content.length, bestPos + bestToken.length + 60);
    
    // Avanza hasta el inicio de una palabra
    while (startPos > 0 && contentToSearch[startPos] !== ' ' && 
           contentToSearch[startPos] !== '\n') {
      startPos--;
    }
    
    // Extrae el fragmento
    let excerpt = content.substring(startPos, endPos);
    
    // Añade elipsis si es necesario
    if (startPos > 0) {
      excerpt = '...' + excerpt;
    }
    if (endPos < content.length) {
      excerpt = excerpt + '...';
    }
    
    return excerpt;
  }

  /**
   * Calcula puntuación de relevancia para un documento
   */
  private calculateRelevance(doc: Document, queryTokens: string[], caseSensitive: boolean): number {
    const title = caseSensitive ? doc.title : doc.title.toLowerCase();
    const content = caseSensitive ? doc.content : doc.content.toLowerCase();
    const tags = caseSensitive ? doc.tags : doc.tags.map(t => t.toLowerCase());
    
    let score = 0;
    
    for (const token of queryTokens) {
      // Coincidencia en título (mayor peso)
      if (title.includes(token)) {
        score += 10;
        
        // Coincidencia exacta con título
        if (title === token) {
          score += 50;
        }
      }
      
      // Coincidencia en tags (peso medio-alto)
      if (tags.some(tag => tag.includes(token))) {
        score += 7;
        
        // Coincidencia exacta con tag
        if (tags.includes(token)) {
          score += 15;
        }
      }
      
      // Coincidencia en contenido (peso según frecuencia)
      const contentMatches = this.countOccurrences(content, token);
      score += Math.min(contentMatches, 10); // Limita a 10 para evitar sesgos
      
      // Analiza la especificidad del término usando estadísticas
      if (this.termStats.has(token)) {
        const stats = this.termStats.get(token)!;
        // Términos menos comunes tienen mayor valor
        score += 5 * (1 - Math.min(1, stats.documents / 100));
      }
    }
    
    // Normaliza puntuación
    return Math.min(100, score);
  }

  /**
   * Genera objetos SearchMatch para un documento
   */
  private generateSearchMatches(doc: Document, queryTokens: string[], caseSensitive: boolean): SearchResult['matches'] {
    const title = caseSensitive ? doc.title : doc.title.toLowerCase();
    const content = caseSensitive ? doc.content : doc.content.toLowerCase();
    
    const matches: SearchResult['matches'] = [];
    
    for (const token of queryTokens) {
      // Coincidencias en título
      let titlePositions: number[] = [];
      let pos = title.indexOf(token);
      while (pos !== -1) {
        titlePositions.push(pos);
        pos = title.indexOf(token, pos + 1);
      }
      
      if (titlePositions.length > 0) {
        matches.push({
          field: 'title',
          term: token,
          count: titlePositions.length,
          positions: titlePositions
        });
      }
      
      // Coincidencias en contenido
      let contentPositions: number[] = [];
      pos = content.indexOf(token);
      while (pos !== -1) {
        contentPositions.push(pos);
        pos = content.indexOf(token, pos + 1);
      }
      
      if (contentPositions.length > 0) {
        matches.push({
          field: 'content',
          term: token,
          count: contentPositions.length,
          positions: contentPositions
        });
      }
    }
    
    return matches;
  }

  /**
   * Ordena resultados según criterio especificado
   */
  private sortResults(results: SearchResult[], sortBy: string): void {
    switch (sortBy) {
      case 'relevance':
        // Mayor relevancia primero
        results.sort((a, b) => b.score - a.score);
        break;
      case 'matches':
        // Mayor número de coincidencias primero
        results.sort((a, b) => b.matches.length - a.matches.length);
        break;
      case 'title':
        // Orden alfabético por título
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Por defecto, relevancia
        results.sort((a, b) => b.score - a.score);
    }
  }

  /**
   * Encola un documento para indexación asíncrona
   */
  public queueDocumentForIndexing(documentId: string): void {
    // Añade a la cola si no está ya
    if (!this.indexingQueue.includes(documentId)) {
      this.indexingQueue.push(documentId);
    }
    
    // Inicia proceso de indexación si no está en marcha
    this.startIndexingProcess();
  }

  /**
   * Inicia procesamiento asíncrono de la cola de indexación
   */
  private startIndexingProcess(): void {
    // Si ya está indexando o no hay elementos, no hace nada
    if (this.isIndexing || this.indexingQueue.length === 0) {
      return;
    }
    
    this.isIndexing = true;
    
    // Programa procesamiento para no bloquear hilo principal
    this.indexingTimeout = setTimeout(async () => {
      // Procesa un lote de documentos
      const batch = this.indexingQueue.splice(0, APP_CONSTANTS.indexingBatchSize);
      
      for (const docId of batch) {
        try {
          const doc = await documentService.getDocument(docId);
          if (doc) {
            // Elimina versión anterior y añade nueva
            this.removeDocumentFromIndex(docId);
            await this.indexDocument(doc);
          }
        } catch (error) {
          console.error(`Error indexando documento ${docId}:`, error);
        }
      }
      
      // Incrementa versión del índice
      this.indexVersion++;
      
      // Verifica si quedan más documentos por procesar
      this.isIndexing = false;
      if (this.indexingQueue.length > 0) {
        this.startIndexingProcess();
      }
    }, 100);
  }

  /**
   * Registra escuchas para eventos relevantes
   */
  private registerEventListeners(): void {
    // Reindexar documento al guardar
    eventBus.on(DocumentEventType.DOCUMENT_SAVED, (data: { documentId: string }) => {
      this.queueDocumentForIndexing(data.documentId);
    });
    
    // Eliminar documento del índice al eliminar
    eventBus.on(DocumentEventType.DOCUMENT_DELETED, (data: { documentId: string }) => {
      this.removeDocumentFromIndex(data.documentId);
      this.indexVersion++;
    });
    
    // Reindexar al actualizar metadatos
    eventBus.on(DocumentEventType.DOCUMENT_METADATA_UPDATED, (data: { documentId: string }) => {
      this.queueDocumentForIndexing(data.documentId);
    });
  }

  /**
   * Obtiene estadísticas del índice de búsqueda
   */
  public getIndexStats(): {
    indexedDocuments: number;
    uniqueTerms: number;
    indexVersion: number;
    pendingDocuments: number;
  } {
    return {
      indexedDocuments: this.documentCache.size,
      uniqueTerms: this.searchIndex.size,
      indexVersion: this.indexVersion,
      pendingDocuments: this.indexingQueue.length
    };
  }

  /**
   * Libera recursos
   */
  public dispose(): void {
    if (this.indexingTimeout) {
      clearTimeout(this.indexingTimeout);
    }
    
    this.searchIndex.clear();
    this.documentCache.clear();
    this.termStats.clear();
    this.indexingQueue = [];
    this.isIndexing = false;
    this.initialized = false;
  }
}

// Exporta instancia singleton
export const searchService = new SearchService();