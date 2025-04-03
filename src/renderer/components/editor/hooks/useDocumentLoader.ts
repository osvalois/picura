import { useState, useEffect, useRef } from 'react';
import { Document } from '../../../../shared/types/Document';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';
import { determineDocumentSize, getLoadStrategy } from '../utils/documentUtils';
import { countWords } from '../utils/textUtils';

interface UseDocumentLoaderProps {
  documentId?: string | undefined;
  initialContent?: string;
  getDocument: (id: string) => Promise<Document | null>;
  currentEnergyMode: EnergyMode;
  prefetchEditors?: (() => void) | undefined;
}

interface UseDocumentLoaderResult {
  document: Document | null;
  content: string;
  isLoading: boolean;
  loadState: {
    status: 'initial' | 'loading' | 'partial' | 'complete' | 'error';
    progress: number;
    error: string | null;
    stable: boolean;
  };
  loadingProgress: number;
  documentSize: 'small' | 'medium' | 'large' | 'very_large';
  wordCount: number;
}

/**
 * Hook personalizado para gestionar la carga de documentos con múltiples estrategias
 * optimizadas según el tamaño del documento y el modo de energía.
 */
export function useDocumentLoader({
  documentId,
  initialContent = '',
  getDocument,
  currentEnergyMode,
  prefetchEditors
}: UseDocumentLoaderProps): UseDocumentLoaderResult {
  // Estado local para gestionar la carga del documento
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(!!documentId);
  const [wordCount, setWordCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [documentSize, setDocumentSize] = useState<'small' | 'medium' | 'large' | 'very_large'>('small');
  const [loadState, setLoadState] = useState({
    status: 'initial' as 'initial' | 'loading' | 'partial' | 'complete' | 'error',
    progress: 0,
    error: null as string | null,
    stable: false
  });

  // Referencias para control de ciclo de vida y operaciones asíncronas
  const isMounted = useRef(true);
  const currentLoadOperation = useRef<Symbol | null>(null);
  const loadOperationRef = useRef<AbortController | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Limpia todos los timeouts activos
  const clearTimeouts = () => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  };

  // Actualiza el conteo de palabras de manera optimizada
  const updateWordCount = (doc: Document, operationId: Symbol) => {
    // Si ya tenemos conteo en metadatos, usamos ese
    if (doc.metadata?.wordCount) {
      setWordCount(doc.metadata.wordCount);
      return;
    }

    // Estimación inicial rápida
    setWordCount(Math.floor(doc.content.length / 5.5));

    // Conteo exacto en segundo plano
    const scheduleExactCount = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          if (isMounted.current && currentLoadOperation.current === operationId) {
            setWordCount(countWords(doc.content));
          }
        });
      } else {
        setTimeout(() => {
          if (isMounted.current && currentLoadOperation.current === operationId) {
            setWordCount(countWords(doc.content));
          }
        }, 200);
      }
    };

    scheduleExactCount();
  };

  // Actualiza un documento completo en una sola operación
  const updateFullDocument = (doc: Document, operationId: Symbol) => {
    if (!isMounted.current || currentLoadOperation.current !== operationId) return;

    // Actualizamos en un único batch para animación fluida
    const updateUI = () => {
      // Primero actualizamos progreso visual
      setLoadingProgress(100);

      // Luego contenido y estado
      setContent(doc.content);
      setLoadState({
        status: 'complete',
        progress: 100,
        error: null,
        stable: true
      });
      setIsLoading(false);

      // Conteo de palabras
      updateWordCount(doc, operationId);
    };

    requestAnimationFrame(updateUI);
  };

  // Actualiza un documento grande progresivamente
  const updateProgressiveDocument = (doc: Document, loadStrategy: any, operationId: Symbol) => {
    if (!isMounted.current || currentLoadOperation.current !== operationId) return;

    // Tamaño del fragmento inicial
    const initialChunkSize = Math.min(doc.content.length, loadStrategy.initialChunkSize);

    // Paso 1: Carga inicial parcial (40%)
    const loadInitialChunk = () => {
      setContent(doc.content.substring(0, initialChunkSize));
      setLoadState(prev => ({
        ...prev,
        status: 'partial',
        progress: 40
      }));
      setLoadingProgress(40);
      setWordCount(Math.floor(doc.content.length / 5.5));

      // Programamos siguiente paso
      requestAnimationFrame(loadCompleteContent);
    };

    // Paso 2: Carga completa (90%)
    const loadCompleteContent = () => {
      if (!isMounted.current || currentLoadOperation.current !== operationId) return;

      setLoadingProgress(90);
      setLoadState(prev => ({
        ...prev,
        status: 'partial',
        progress: 90
      }));

      // Cargamos todo el contenido
      setContent(doc.content);

      // Programamos finalización
      requestAnimationFrame(finalizeLoading);
    };

    // Paso 3: Finalización (100%)
    const finalizeLoading = () => {
      if (!isMounted.current || currentLoadOperation.current !== operationId) return;

      setLoadingProgress(100);
      setLoadState({
        status: 'complete',
        progress: 100,
        error: null,
        stable: true
      });
      setIsLoading(false);

      // Conteo exacto en segundo plano
      if (!doc.metadata?.wordCount && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          if (isMounted.current && currentLoadOperation.current === operationId) {
            setWordCount(countWords(doc.content));
          }
        });
      }
    };

    // Iniciamos secuencia
    requestAnimationFrame(loadInitialChunk);
  };

  // Manejo unificado de errores de carga
  const handleDocumentLoadError = (error: Error, docId: string, operationId: Symbol, timeoutId: NodeJS.Timeout) => {
    console.error('Error al cargar el documento:', error);

    // Verificamos si la operación fue abortada intencionalmente
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Operación de carga cancelada intencionalmente');
      return;
    }

    // Si es un timeout, reintentamos una vez más
    if (error.message === 'Tiempo de espera agotado al obtener el documento') {
      console.warn('Reintentando carga del documento sin timeout...');
      retryDocumentLoad(docId, operationId, timeoutId);
      return;
    }

    // Cualquier otro error
    if (!isMounted.current) return;

    setLoadState({
      status: 'error',
      progress: 0,
      error: error.message || 'Error desconocido al cargar el documento',
      stable: true
    });
    setIsLoading(false);
    clearTimeout(timeoutId);
  };

  // Último intento de carga tras timeout
  const retryDocumentLoad = async (docId: string, operationId: Symbol, timeoutId: NodeJS.Timeout) => {
    try {
      const doc = await getDocument(docId);

      if (doc && isMounted.current && currentLoadOperation.current === operationId) {
        requestAnimationFrame(() => {
          if (!isMounted.current || currentLoadOperation.current !== operationId) return;

          setDocument(doc);
          setContent(doc.content);
          setWordCount(doc.metadata?.wordCount || Math.floor(doc.content.length / 5.5));
          setDocumentSize(determineDocumentSize(doc.content.length));

          setLoadState({
            status: 'complete',
            progress: 100,
            error: null,
            stable: true
          });
          setIsLoading(false);
          setLoadingProgress(100);
        });

        clearTimeout(timeoutId);
      }
    } catch (finalError) {
      if (!isMounted.current) return;

      console.error('Error final al cargar el documento:', finalError);

      setLoadState({
        status: 'error',
        progress: 0,
        error: 'No se pudo cargar el documento después de múltiples intentos',
        stable: true
      });
      setIsLoading(false);

      clearTimeout(timeoutId);
    }
  };

  // Efecto principal para cargar el documento cuando cambia el ID
  useEffect(() => {
    // Si no hay un ID válido, procesamos initialContent directamente
    if (!documentId) {
      if (initialContent) {
        // Actualizamos el contenido inmediatamente
        setContent(initialContent);

        // Calculamos tamaño de documento
        const size = determineDocumentSize(initialContent.length);
        setDocumentSize(size);

        // Estimamos el conteo de palabras - diferido para documentos grandes
        if (initialContent.length > 100000 && currentEnergyMode !== 'highPerformance') {
          const approxWordCount = Math.floor(initialContent.length / 5.5);
          setWordCount(approxWordCount);

          // Programamos el conteo exacto para cuando el sistema esté inactivo
          const scheduleExactCount = () => {
            if ('requestIdleCallback' in window) {
              window.requestIdleCallback(() => setWordCount(countWords(initialContent)));
            } else {
              setTimeout(() => setWordCount(countWords(initialContent)), 100);
            }
          };
          scheduleExactCount();
        } else {
          setWordCount(countWords(initialContent));
        }
      }

      // Marcamos la carga como completa
      setLoadState({
        status: 'complete',
        progress: 100,
        error: null,
        stable: true
      });
      setIsLoading(false);
      setLoadingProgress(100);

      // Precargamos editores en segundo plano
      if (prefetchEditors) {
        prefetchEditors();
      }
      return;
    }

    // Control de operación: ID único y controlador para cancelación
    const newLoadId = Symbol(`load-${documentId}-${Date.now()}`);
    currentLoadOperation.current = newLoadId;

    if (loadOperationRef.current) {
      loadOperationRef.current.abort();
    }

    const abortController = new AbortController();
    loadOperationRef.current = abortController;

    // Función principal de carga
    const loadDocument = async () => {
      // Inicializamos el estado para esta carga
      const initLoading = () => {
        // Agrupamos todos los cambios de estado en una única actualización
        requestAnimationFrame(() => {
          if (!isMounted.current) return;

          setLoadState({
            status: 'loading',
            progress: 0,
            error: null,
            stable: false
          });
          setIsLoading(true);
          setLoadingProgress(0);
        });

        // Limpiamos el contenido si cambiamos a un documento diferente
        if (document && document.id !== documentId) {
          // También incluimos esta limpieza en la misma actualización
          requestAnimationFrame(() => {
            if (!isMounted.current) return;
            setDocument(null);
            setContent('');
          });
        }
      };

      initLoading();

      // Configuramos timeout de seguridad
      clearTimeouts();
      const timeoutId = setTimeout(() => {
        if (currentLoadOperation.current !== newLoadId) return;

        console.warn('Tiempo de carga excedido - mostrando contenido parcial');

        if (document && content) {
          // Agrupamos las actualizaciones de estado
          requestAnimationFrame(() => {
            if (!isMounted.current) return;

            setLoadState({
              status: 'partial',
              progress: loadingProgress,
              error: null,
              stable: true
            });
            setIsLoading(false);
          });
        }
      }, 3500);

      // Iniciamos precarga de editores
      if (prefetchEditors) {
        prefetchEditors();
      }

      try {
        // Obtenemos el documento
        const doc = await getDocument(documentId);

        // Verificamos que la operación no haya sido cancelada
        if (currentLoadOperation.current !== newLoadId || !isMounted.current) {
          return;
        }

        if (!doc) {
          console.error(`Documento con id ${documentId} no encontrado`);

          setLoadState({
            status: 'error',
            progress: 0,
            error: 'Documento no encontrado',
            stable: true
          });
          setIsLoading(false);
          clearTimeout(timeoutId);
          return;
        }

        // Estrategia principal de carga
        const loadContent = () => {
          if (!isMounted.current || currentLoadOperation.current !== newLoadId) return;

          // Actualizamos documento y tamaño
          const loadStrategy = getLoadStrategy(doc.content.length, currentEnergyMode);
          setDocument(doc);
          setDocumentSize(determineDocumentSize(doc.content.length));

          // Decidimos estrategia basada en tamaño y energía
          const isSmallOrHighPerformance = doc.content.length < 500000 || 
                                          currentEnergyMode === 'highPerformance';

          if (isSmallOrHighPerformance) {
            // ESTRATEGIA 1: Carga simple para documentos pequeños o modo alto rendimiento
            updateFullDocument(doc, newLoadId);
          } else {
            // ESTRATEGIA 2: Carga progresiva para documentos grandes
            updateProgressiveDocument(doc, loadStrategy, newLoadId);
          }
        };

        // Sincronizamos con el ciclo de renderizado
        requestAnimationFrame(loadContent);
        clearTimeout(timeoutId);
      } catch (error) {
        handleDocumentLoadError(error as Error, documentId, newLoadId, timeoutId);
      }
    };

    // Lanzamos la carga
    loadDocument();

    // Limpieza
    return () => {
      if (loadOperationRef.current) {
        loadOperationRef.current.abort();
      }
      clearTimeouts();
    };
  }, [documentId, getDocument, currentEnergyMode, initialContent, prefetchEditors]);

  // Efecto para controlar el ciclo de vida del componente
  useEffect(() => {
    // Marcamos como montado
    isMounted.current = true;

    // Limpieza al desmontar
    return () => {
      isMounted.current = false;

      // Limpiamos recursos
      if (loadOperationRef.current) {
        loadOperationRef.current.abort();
      }

      clearTimeouts();
    };
  }, []);

  return {
    document,
    content,
    isLoading,
    loadState,
    loadingProgress,
    documentSize,
    wordCount
  };
}