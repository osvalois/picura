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

// Configuración de IPC
interface ElectronAPI {
  document: {
    get: (id: string) => Promise<Document | null>;
    create: (args: {title?: string; initialContent?: string; metadata?: any; path?: string}) => Promise<Document | null>;
    update: (args: {id: string; changes: any; options?: any}) => Promise<boolean>;
    delete: (args: {id: string; options?: any}) => Promise<boolean>;
    list: (folderPath?: string) => Promise<Document[]>;
    openFile: () => Promise<Document | null>;
    openFolder: (options?: any) => Promise<{ rootFolder: string; documents: Document[]; folders: string[] }>;
    openSpecificFile: (filePath: string) => Promise<Document | null>;
    setActive: (documentId: string) => Promise<Document | null>;
    getActive: () => Promise<Document | null>;
    getRecentDocuments?: () => Promise<Document[]>;
    importFiles: () => Promise<Document[]>;
    importFolder: (options?: any) => Promise<{ documents: Document[]; folders: string[] }>;
  };
  config: {
    getUserPreferences: () => Promise<any>;
    updateUserPreferences: (preferences: any) => Promise<any>;
  };
  // Otros servicios según necesidad...
}

// Acceso a API de Electron (definida en preload.js)
declare global {
  interface Window {
    api: ElectronAPI;
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
  
  // Contexto de sostenibilidad para adaptar comportamiento
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Carga inicial
  useEffect(() => {
    // Cargar documentos recientes
    const loadRecentDocuments = async () => {
      try {
        if (window.api && window.api.document.getRecentDocuments) {
          const docs = await window.api.document.getRecentDocuments();
          setRecentDocuments(docs);
        }
      } catch (error) {
        console.error('Error loading recent documents:', error);
      }
    };
    
    loadRecentDocuments();
  }, []);
  
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
      
      if (window.api && window.api.document) {
        const document = await window.api.document.get(id);
        
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
      
      if (window.api && window.api.document) {
        const document = await window.api.document.create({
          title,
          initialContent,
          metadata,
          path
        });
        
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
      
      if (window.api && window.api.document) {
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
      
      if (window.api && window.api.document) {
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
      
      if (window.api && window.api.document) {
        return await window.api.document.list(folderPath);
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
  
  // Implementación de nuevas operaciones de archivos
  const openFile = async (): Promise<Document | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (window.api && window.api.document) {
        const document = await window.api.document.openFile();
        
        if (document) {
          setCurrentDocument(document);
          updateRecentDocuments(document);
        }
        
        return document;
      }
      
      return null;
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
      
      if (window.api && window.api.document) {
        const result = await window.api.document.openFolder(options);
        
        // Actualiza cache de documentos recientes con los nuevos documentos
        if (result && result.documents && result.documents.length > 0) {
          // Selecciona el primer documento como activo
          const firstDoc = result.documents[0];
          setCurrentDocument(firstDoc);
          
          // Actualiza documentos recientes
          result.documents.forEach(doc => {
            updateRecentDocuments(doc);
          });
        }
        
        return result;
      }
      
      return { rootFolder: '', documents: [], folders: [] };
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
      
      if (window.api && window.api.document) {
        const document = await window.api.document.openSpecificFile(filePath);
        
        if (document) {
          setCurrentDocument(document);
          updateRecentDocuments(document);
        }
        
        return document;
      }
      
      return null;
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
      
      if (window.api && window.api.document) {
        const document = await window.api.document.setActive(id);
        
        if (document) {
          setCurrentDocument(document);
          updateRecentDocuments(document);
        }
        
        return document;
      }
      
      return null;
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
      if (window.api && window.api.document) {
        const document = await window.api.document.getActive();
        
        if (document && document.id !== currentDocument?.id) {
          setCurrentDocument(document);
        }
        
        return document;
      }
      
      return currentDocument;
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