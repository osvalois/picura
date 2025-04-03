import { useState, useRef, useCallback, useEffect } from 'react';
import { Document } from '../../shared/types/Document';
import { useDocumentContext } from '../contexts/DocumentContext';
import { useSustainabilityContext } from '../contexts/SustainabilityContext';
// Evitamos importar directamente de Electron para compatibilidad web/electron
// import { ipcRenderer } from 'electron';

interface FileLoaderOptions {
  onLoadStart?: () => void;
  onLoadProgress?: (progress: number) => void;
  onLoadComplete?: (documents: Document[]) => void;
  onLoadError?: (error: Error) => void;
  adaptToEnergyMode?: boolean;
  maxConcurrent?: number;
}

interface FileLoaderResult {
  selectedFiles: File[];
  selectedDocuments: Document[];
  loadingProgress: number;
  isLoading: boolean;
  error: Error | null;
  selectFiles: (files: File[]) => void;
  loadFiles: (files: File[]) => Promise<Document[]>;
  openFileDialog: () => Promise<void>;
  openFolderDialog: () => Promise<void>;
  resetState: () => void;
  cancelLoading: () => void;
}

/**
 * Hook personalizado para gestionar la carga de archivos de manera eficiente y optimizada.
 * Implementa carga por lotes, progresiva y controlada según el modo de energía.
 */
export function useFileLoader(options: FileLoaderOptions = {}): FileLoaderResult {
  // Opciones
  const {
    onLoadStart,
    onLoadProgress,
    onLoadComplete,
    onLoadError,
    adaptToEnergyMode = true,
    maxConcurrent: userMaxConcurrent
  } = options;

  // Estado interno
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Referencias para control
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeTasksRef = useRef<number>(0);
  const pendingTasksRef = useRef<File[]>([]);

  // Contextos
  const documentContext = useDocumentContext();
  const { openFile, openFolder } = documentContext;
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Función auxiliar para importar archivo (simulada)
  const importFile = async (path: string, folderPath: string): Promise<Document | null> => {
    try {
      // Usar openSpecificFile como alternativa a importFile
      return await documentContext.openSpecificFile(path);
    } catch (error) {
      console.error('Error importing file:', error);
      return null;
    }
  };

  // Determina el número máximo de tareas concurrentes según el modo de energía
  const getMaxConcurrent = useCallback(() => {
    if (userMaxConcurrent) return userMaxConcurrent;
    
    if (adaptToEnergyMode) {
      switch (currentEnergyMode) {
        case 'ultraSaving':
          return 1; // Secuencial
        case 'lowPower':
          return 2; // Poco paralelismo
        case 'standard':
          return 4; // Paralelismo moderado
        case 'highPerformance':
          return 8; // Alto paralelismo
        default:
          return 4;
      }
    }
    
    return 4; // Valor por defecto
  }, [adaptToEnergyMode, currentEnergyMode, userMaxConcurrent]);

  // Cancelar cualquier operación en curso
  const cancelLoading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    activeTasksRef.current = 0;
    pendingTasksRef.current = [];
    setIsLoading(false);
  }, []);

  // Reiniciar estado
  const resetState = useCallback(() => {
    cancelLoading();
    setSelectedFiles([]);
    setSelectedDocuments([]);
    setLoadingProgress(0);
    setError(null);
  }, [cancelLoading]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      cancelLoading();
    };
  }, [cancelLoading]);

  // Procesar un lote de archivos
  const processBatch = useCallback(async () => {
    if (
      !isLoading || 
      activeTasksRef.current >= getMaxConcurrent() || 
      pendingTasksRef.current.length === 0 ||
      !abortControllerRef.current
    ) {
      return;
    }

    // Tomamos un archivo de la cola
    const file = pendingTasksRef.current.shift();
    if (!file) return;

    // Incrementamos conteo de tareas activas
    activeTasksRef.current++;

    try {
      // Carga el archivo
      const document = await importFile(file.path || file.name, '/');
      
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Actualiza documentos seleccionados
      if (document) {
        setSelectedDocuments(prev => [...prev, document]);
      }

      // Actualiza progreso
      const pendingCount = pendingTasksRef.current.length;
      const totalCount = selectedFiles.length;
      const processedCount = totalCount - pendingCount - activeTasksRef.current + 1;
      const progress = Math.round((processedCount / totalCount) * 100);
      
      setLoadingProgress(progress);
      
      if (onLoadProgress) {
        onLoadProgress(progress);
      }

      // Verificamos si es el último archivo
      if (pendingCount === 0 && activeTasksRef.current === 1) {
        setIsLoading(false);
        setLoadingProgress(100);
        
        if (onLoadComplete) {
          onLoadComplete([...selectedDocuments, document].filter(Boolean) as Document[]);
        }
      }
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      console.error('Error procesando archivo:', err);
      setError(err instanceof Error ? err : new Error('Error procesando archivo'));
      
      if (onLoadError && err instanceof Error) {
        onLoadError(err);
      }
    } finally {
      // Reducimos conteo de tareas activas
      activeTasksRef.current--;
      
      // Procesamos el siguiente archivo
      processBatch();
    }
  }, [
    isLoading, getMaxConcurrent, importFile, selectedFiles.length,
    selectedDocuments, onLoadProgress, onLoadComplete, onLoadError
  ]);

  // Procesar archivos en lotes
  useEffect(() => {
    if (isLoading && pendingTasksRef.current.length > 0) {
      // Iniciamos tantas tareas como permita el paralelismo máximo
      const maxConcurrent = getMaxConcurrent();
      const tasksToStart = Math.min(
        maxConcurrent - activeTasksRef.current,
        pendingTasksRef.current.length
      );
      
      for (let i = 0; i < tasksToStart; i++) {
        processBatch();
      }
    }
  }, [isLoading, processBatch, getMaxConcurrent]);

  // Seleccionar archivos para procesamiento
  const selectFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    setLoadingProgress(0);
    setError(null);
  }, []);

  // Cargar archivos seleccionados
  const loadFiles = useCallback(async (files: File[]): Promise<Document[]> => {
    if (files.length === 0) {
      return [];
    }
    
    // Cancelamos cualquier operación en curso
    cancelLoading();
    
    // Inicializamos nuevos controladores
    setIsLoading(true);
    setLoadingProgress(0);
    setError(null);
    setSelectedFiles(files);
    setSelectedDocuments([]);
    
    // Configuración para la nueva carga
    abortControllerRef.current = new AbortController();
    activeTasksRef.current = 0;
    pendingTasksRef.current = [...files];
    
    if (onLoadStart) {
      onLoadStart();
    }
    
    // Creamos una promesa que se resolverá cuando todos los archivos estén procesados
    return new Promise<Document[]>((resolve, reject) => {
      // Configuramos una función que verificará periódicamente si ha terminado
      const checkCompletion = () => {
        // Si se canceló, rechazamos la promesa
        if (!abortControllerRef.current || abortControllerRef.current.signal.aborted) {
          reject(new Error('Carga cancelada'));
          return;
        }
        
        // Si todavía hay archivos pendientes o tareas activas, programamos otra verificación
        if (pendingTasksRef.current.length > 0 || activeTasksRef.current > 0) {
          setTimeout(checkCompletion, 100);
          return;
        }
        
        // Si ya no hay nada pendiente, resolvemos con los documentos cargados
        resolve(selectedDocuments);
      };
      
      // Iniciamos la verificación
      checkCompletion();
    });
  }, [cancelLoading, onLoadStart, selectedDocuments]);

  // Abrir diálogo para seleccionar archivos
  const openFileDialog = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      setError(null);
      
      const document = await openFile();
      
      if (document) {
        setSelectedDocuments([document]);
        
        if (onLoadComplete) {
          onLoadComplete([document]);
        }
      }
      
      setLoadingProgress(100);
    } catch (err) {
      console.error('Error opening file dialog:', err);
      setError(err instanceof Error ? err : new Error('Error opening file dialog'));
      
      if (onLoadError && err instanceof Error) {
        onLoadError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [openFile, onLoadComplete, onLoadError]);

  // Abrir diálogo para seleccionar carpeta
  const openFolderDialog = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);
      setError(null);
      
      // Llamar a openFolder con opciones compatibles
      const result = await openFolder({
        recursive: true,
        preserveStructure: true
      });
      
      // Simulamos progreso completo ya que no podemos usar loadProgressCallback
      setLoadingProgress(100);
      if (onLoadProgress) {
        onLoadProgress(100);
      }
      
      if (result && result.documents) {
        setSelectedDocuments(result.documents);
        
        if (onLoadComplete) {
          onLoadComplete(result.documents);
        }
      }
      
      setLoadingProgress(100);
    } catch (err) {
      console.error('Error opening folder dialog:', err);
      setError(err instanceof Error ? err : new Error('Error opening folder dialog'));
      
      if (onLoadError && err instanceof Error) {
        onLoadError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [openFolder, onLoadProgress, onLoadComplete, onLoadError]);

  return {
    selectedFiles,
    selectedDocuments,
    loadingProgress,
    isLoading,
    error,
    selectFiles,
    loadFiles,
    openFileDialog,
    openFolderDialog,
    resetState,
    cancelLoading
  };
}