import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Document, DocumentChanges, DocumentMetadata } from '../../shared/types/Document';
import { useSustainabilityContext } from './SustainabilityContext';

// API del contexto
interface DocumentContextType {
  // Operaciones CRUD
  getDocument: (id: string) => Promise<Document | null>;
  createDocument: (title: string, initialContent: string, metadata: Partial<DocumentMetadata>, path: string) => Promise<Document | null>;
  updateDocument: (id: string, changes: DocumentChanges, options?: { immediate?: boolean; isAutosave?: boolean }) => Promise<boolean>;
  saveDocument: (id: string) => Promise<boolean>;
  deleteDocument: (id: string, options?: { immediate?: boolean }) => Promise<boolean>;
  // Operaciones de metadatos
  updateMetadata: (id: string, metadata: Partial<DocumentMetadata>) => Promise<boolean>;
  // Operaciones de navegación
  listDocuments: (folderPath?: string) => Promise<Document[]>;
  // Operaciones de apertura de archivos
  openFile: () => Promise<Document | null>;
  openFolder: (options?: { recursive?: boolean; preserveStructure?: boolean }) => Promise<{ rootFolder: string; documents: Document[]; folders: string[] }>;
  openSpecificFile: (filePath: string) => Promise<Document | null>;
  // Gestión de documento activo
  setActiveDocument: (id: string) => Promise<Document | null>;
  getActiveDocument: () => Promise<Document | null>;
  // Estado
  currentDocument: Document | null;
  recentDocuments: Document[];
  isLoading: boolean;
  error: string | null;
}

// Clase adaptadora para los métodos de document que faltan en la API
class DocumentAdapter {
  private api: Window['api'];
  private activeDocumentId: string | null = null;
  
  constructor() {
    this.api = window.api;
  }
  
  async getRecentDocuments(): Promise<Document[]> {
    // Intenta recuperar documentos recientes usando list
    try {
      if (this.api?.document?.list) {
        try {
          const docs = await this.api.document.list('/') as Document[];
          return docs || [];
        } catch (listError) {
          console.error('Error específico en list:', listError);
          
          // En caso de error de IPC, podríamos ofrecer documentos de ejemplo
          return this.getFallbackDocuments();
        }
      } else {
        console.warn('API document.list no está disponible');
        return this.getFallbackDocuments();
      }
    } catch (error) {
      console.error('Error getting recent documents:', error);
      return this.getFallbackDocuments();
    }
  }
  
  // Proporciona documentos de respaldo para cuando el sistema falla
  private getFallbackDocuments(): Document[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'fallback-1',
        title: 'Documento de ejemplo',
        content: '# Documento de ejemplo\n\nEste es un documento creado cuando no se pueden cargar documentos reales.',
        createdAt: now,
        updatedAt: now,
        path: '/',
        tags: ['ejemplo'],
        metadata: {
          author: 'Sistema',
          wordCount: 15,
          readingTime: 1,
          format: 'markdown',
          sustainability: {
            optimizedSize: 100,
            originalSize: 100,
            contentReuseFactor: 1.0,
            editingEnergyUsage: 0,
            syncEnergyCost: 0
          },
          custom: {}
        },
        version: 1
      }
    ];
  }
  
  async openFile(): Promise<Document | null> {
    // Simulamos abrir un archivo utilizando importFiles
    try {
      const importedFiles = await this.api.document.importFiles();
      if (importedFiles && importedFiles.length > 0) {
        return importedFiles[0] as Document;
      }
      return null;
    } catch (error) {
      console.error('Error opening file:', error);
      return null;
    }
  }
  
  async openFolder(options?: any): Promise<{ rootFolder: string; documents: Document[]; folders: string[] }> {
    // Usamos el método existente importFolder
    try {
      return await this.api.document.importFolder(options) as { rootFolder: string; documents: Document[]; folders: string[] };
    } catch (error) {
      console.error('Error opening folder:', error);
      return { rootFolder: '', documents: [], folders: [] };
    }
  }
  
  async openSpecificFile(filePath: string): Promise<Document | null> {
    // Simulamos abrir un archivo específico usando importFile
    try {
      return await this.api.document.importFile({ path: filePath }) as Document;
    } catch (error) {
      console.error(`Error opening specific file ${filePath}:`, error);
      return null;
    }
  }
  
  async setActive(documentId: string): Promise<Document | null> {
    // Almacenamos el ID activo y obtenemos el documento
    try {
      this.activeDocumentId = documentId;
      return await this.api.document.get(documentId) as Document;
    } catch (error) {
      console.error(`Error setting active document ${documentId}:`, error);
      return null;
    }
  }
  
  async getActive(): Promise<Document | null> {
    // Retornamos el documento activo basado en el ID almacenado
    try {
      if (this.activeDocumentId) {
        return await this.api.document.get(this.activeDocumentId) as Document;
      }
      return null;
    } catch (error) {
      console.error('Error getting active document:', error);
      return null;
    }
  }
}

// Valores por defecto
const defaultContextValue: DocumentContextType = {
  getDocument: async () => null,
  createDocument: async () => null,
  updateDocument: async () => false,
  saveDocument: async () => false,
  deleteDocument: async () => false,
  updateMetadata: async () => false,
  listDocuments: async () => [],
  openFile: async () => null,
  openFolder: async () => ({ rootFolder: '', documents: [], folders: [] }),
  openSpecificFile: async () => null,
  setActiveDocument: async () => null,
  getActiveDocument: async () => null,
  currentDocument: null,
  recentDocuments: [],
  isLoading: false,
  error: null,
};

// Creación del contexto
const DocumentContext = createContext<DocumentContextType>(defaultContextValue);

// Props para el proveedor
interface DocumentProviderProps {
  children: ReactNode;
  maxRecentDocuments?: number;
}

/**
 * Proveedor del contexto de documentos
 * Gestiona operaciones de documentos con optimizaciones de sostenibilidad
 */
export const DocumentProvider: React.FC<DocumentProviderProps> = ({ 
  children,
  maxRecentDocuments = 10
}) => {
  // Estado
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Instancia del adaptador
  const [adapter] = useState(() => new DocumentAdapter());
  
  // Contexto de sostenibilidad para adaptar comportamiento
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Carga inicial
  useEffect(() => {
    // Cargar documentos recientes
    const loadRecentDocuments = async () => {
      try {
        const docs = await adapter.getRecentDocuments();
        setRecentDocuments(docs);
      } catch (error) {
        console.error('Error loading recent documents:', error);
      }
    };
    
    loadRecentDocuments();
  }, [adapter]);
  
  // Actualiza documentos recientes
  const updateRecentDocuments = (document: Document) => {
    setRecentDocuments(prev => {
      // Elimina si ya existe
      const filtered = prev.filter(doc => doc.id !== document.id);
      
      // Agrega al inicio
      const updated = [document, ...filtered];
      
      // Limita cantidad
      return updated.slice(0, maxRecentDocuments);
    });
  };
  
  // Obtiene un documento por su ID
  const getDocument = async (id: string): Promise<Document | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (window.api?.document) {
        const document = await window.api.document.get(id) as Document;
        
        if (document) {
          setCurrentDocument(document);
          updateRecentDocuments(document);
        }
        
        return document;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      setError('Error getting document');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Crea un nuevo documento
  const createDocument = async (
    title: string = 'Untitled Document',
    initialContent: string = '',
    metadata: Partial<DocumentMetadata> = {},
    path: string = '/'
  ): Promise<Document | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (window.api?.document) {
        const document = await window.api.document.create({
          title,
          initialContent,
          metadata,
          path
        }) as Document;
        
        if (document) {
          setCurrentDocument(document);
          updateRecentDocuments(document);
        }
        
        return document;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating document:', error);
      setError('Error creating document');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Actualiza un documento existente
  const updateDocument = async (
    id: string,
    changes: DocumentChanges,
    options: { immediate?: boolean; isAutosave?: boolean } = {}
  ): Promise<boolean> => {
    try {
      // Solo muestra loading para actualizaciones inmediatas no autosave
      if (options.immediate && !options.isAutosave) {
        setIsLoading(true);
      }
      
      setError(null);
      
      // Adapta opciones según modo de energía
      const adaptedOptions = { ...options };
      
      // En modos de bajo consumo, prioriza eficiencia sobre inmediatez
      // a menos que se especifique explícitamente
      if (currentEnergyMode === 'lowPower' || currentEnergyMode === 'ultraSaving') {
        if (adaptedOptions.immediate === undefined) {
          adaptedOptions.immediate = false;
        }
      }
      
      if (window.api?.document) {
        const success = await window.api.document.update({
          id,
          changes,
          options: adaptedOptions
        });
        
        // Actualiza documento actual si corresponde
        if (success && currentDocument?.id === id) {
          setCurrentDocument(prev => {
            if (!prev) return null;
            
            return {
              ...prev,
              ...changes,
              metadata: {
                ...prev.metadata,
                ...(changes.metadata || {})
              }
            };
          });
        }
        
        return success;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Error updating document');
      return false;
    } finally {
      // Solo finaliza loading para actualizaciones inmediatas no autosave
      if (options.immediate && !options.isAutosave) {
        setIsLoading(false);
      }
    }
  };
  
  // Guarda explícitamente un documento (wrapper para updateDocument)
  const saveDocument = async (id: string): Promise<boolean> => {
    // Si el documento actual está cargado y coincide con el ID
    if (currentDocument && currentDocument.id === id) {
      return updateDocument(id, {}, { immediate: true });
    }
    
    return false;
  };
  
  // Elimina un documento
  const deleteDocument = async (
    id: string,
    options: { immediate?: boolean } = {}
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Adapta opciones según modo de energía
      const adaptedOptions = { ...options };
      
      // En modos de bajo consumo, prioriza eficiencia sobre inmediatez
      if (currentEnergyMode === 'lowPower' || currentEnergyMode === 'ultraSaving') {
        if (adaptedOptions.immediate === undefined) {
          adaptedOptions.immediate = false;
        }
      }
      
      if (window.api?.document) {
        const success = await window.api.document.delete({
          id,
          options: adaptedOptions
        });
        
        if (success) {
          // Si era el documento actual, limpia
          if (currentDocument?.id === id) {
            setCurrentDocument(null);
          }
          
          // Actualiza lista de recientes
          setRecentDocuments(prev => prev.filter(doc => doc.id !== id));
        }
        
        return success;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Error deleting document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Actualiza metadatos de un documento
  const updateMetadata = async (
    id: string,
    metadata: Partial<DocumentMetadata>
  ): Promise<boolean> => {
    return updateDocument(id, { metadata }, { immediate: true });
  };
  
  // Lista documentos en una carpeta
  const listDocuments = async (folderPath: string = '/'): Promise<Document[]> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (window.api?.document) {
        try {
          const documents = await window.api.document.list(folderPath) as Document[];
          return documents || [];
        } catch (apiError) {
          console.error('API error listing documents:', apiError);
          
          // Intenta usar el adaptador como fallback
          if (adapter) {
            console.log('Intentando usar adaptador para obtener documentos');
            return await adapter.getRecentDocuments();
          }
          
          throw apiError;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error listing documents:', error);
      setError('Error listing documents');
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Implementación de nuevas operaciones de archivos usando el adaptador
  const openFile = async (): Promise<Document | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const document = await adapter.openFile();
      
      if (document) {
        setCurrentDocument(document);
        updateRecentDocuments(document);
      }
      
      return document;
    } catch (error) {
      console.error('Error opening file:', error);
      setError('Error opening file');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const openFolder = async (options?: {
    recursive?: boolean;
    preserveStructure?: boolean;
  }): Promise<{ rootFolder: string; documents: Document[]; folders: string[] }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await adapter.openFolder(options);
      
      // Actualiza cache de documentos recientes con los nuevos documentos
      if (result && result.documents && result.documents.length > 0) {
        // Selecciona el primer documento como activo
        const firstDoc = result.documents[0];
        // Only set the current document if firstDoc exists
        if (firstDoc) {
          setCurrentDocument(firstDoc);
        }
        
        // Actualiza documentos recientes
        result.documents.forEach((doc: Document) => {
          updateRecentDocuments(doc);
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error opening folder:', error);
      setError('Error opening folder');
      return { rootFolder: '', documents: [], folders: [] };
    } finally {
      setIsLoading(false);
    }
  };
  
  const openSpecificFile = async (filePath: string): Promise<Document | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const document = await adapter.openSpecificFile(filePath);
      
      if (document) {
        setCurrentDocument(document);
        updateRecentDocuments(document);
      }
      
      return document;
    } catch (error) {
      console.error(`Error opening file ${filePath}:`, error);
      setError('Error opening specific file');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const setActiveDocument = async (id: string): Promise<Document | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const document = await adapter.setActive(id);
      
      if (document) {
        setCurrentDocument(document);
        updateRecentDocuments(document);
      }
      
      return document;
    } catch (error) {
      console.error(`Error setting active document ${id}:`, error);
      setError('Error setting active document');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getActiveDocument = async (): Promise<Document | null> => {
    try {
      const document = await adapter.getActive();
      
      if (document && document.id !== currentDocument?.id) {
        setCurrentDocument(document);
      }
      
      return document;
    } catch (error) {
      console.error('Error getting active document:', error);
      return currentDocument;
    }
  };

  // Valor del contexto
  const contextValue: DocumentContextType = {
    getDocument,
    createDocument,
    updateDocument,
    saveDocument,
    deleteDocument,
    updateMetadata,
    listDocuments,
    openFile,
    openFolder,
    openSpecificFile,
    setActiveDocument,
    getActiveDocument,
    currentDocument,
    recentDocuments,
    isLoading,
    error,
  };
  
  return (
    <DocumentContext.Provider value={contextValue}>
      {children}
    </DocumentContext.Provider>
  );
};

// Hook personalizado para acceder al contexto
export const useDocumentContext = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  
  return context;
};

export default DocumentContext;