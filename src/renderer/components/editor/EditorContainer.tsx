import React, { useState, useEffect, useRef, useCallback, memo, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { Document } from '../../../shared/types/Document';
import { EnergyMode } from '../../../shared/types/SustainabilityMetrics';
import { useDocumentContext } from '../../contexts/DocumentContext';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import StatusBar from './statusBar/StatusBar';
import Toolbar from './toolbar/Toolbar';
import EnergyModeSelector from '../common/EnergyModeSelector';
import { debounce } from '../../utils/performanceUtils';
import { subscribeToEvent } from '../../utils/ipcAPI';
import { DocumentEventType } from '../../../core/events/EventTypes';

// Carga diferida de editores para mejor rendimiento inicial
const BasicEditor = lazy(() => import('./modes/BasicEditor'));
const StandardEditor = lazy(() => import('./modes/StandardEditor'));
const AdvancedEditor = lazy(() => import('./modes/AdvancedEditor'));

// Fallback para componentes en carga diferida usando skeletons para mejor UX
const EditorFallback = () => (
  <div className="w-full h-full bg-white dark:bg-gray-900 p-4">
    <div className="animate-pulse">
      {/* Skeleton para la barra de herramientas */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>

      {/* Skeleton para el contenido del editor */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>

      {/* Más líneas de contenido */}
      <div className="mt-6 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    </div>
  </div>
);

interface EditorContainerProps {
  documentId?: string;
  initialContent?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  showStatusBar?: boolean;
}

// Tamaños de documentos para optimizaciones
const DOC_SIZE = {
  SMALL: 30000,
  MEDIUM: 100000,
  LARGE: 500000,
  VERY_LARGE: 1000000
};

/**
 * Contenedor principal para el editor de documentos
 * Gestiona múltiples modos de edición adaptados a perfiles de usuario
 * y optimizados para eficiencia energética
 */
const EditorContainer: React.FC<EditorContainerProps> = ({
  documentId,
  initialContent = '',
  readOnly = false,
  showToolbar = true,
  showStatusBar = true,
}) => {
  // Obtiene ID de documento de la URL si no se proporciona como prop
  const { id: urlId } = useParams<{ id: string }>();
  const currentDocId = documentId || urlId;

  // Contextos y estado
  const {
    getDocument,
    updateDocument,
  } = useDocumentContext();

  const {
    currentEnergyMode,
    sustainabilityMetrics,
    setEnergyMode
  } = useSustainabilityContext();

  const { preferences, profileType } = useUserPreferences();

  // Estado local
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(!!currentDocId);
  const [isSaving, setIsSaving] = useState(false);
  const [editorMode, setEditorMode] = useState(preferences.editorMode);
  const [wordCount, setWordCount] = useState(0);
  const [selectionStats, setSelectionStats] = useState({
    characters: 0,
    words: 0,
    lines: 0
  });
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState<'initial' | 'loading' | 'rendering' | 'complete'>('initial');
  const [documentSize, setDocumentSize] = useState<'small' | 'medium' | 'large' | 'very_large'>('small');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Referencias
  const contentRef = useRef(content);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<Symbol | null>(null);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const pendingChangesRef = useRef<boolean>(false);

  // Funciones de utilidad - definimos countWords con useCallback para poder usarla en efectos
  const countWords = useCallback((text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, []);

  // Configuración de autosave adaptada al modo de energía
  const autosaveIntervals = {
    highPerformance: 10000,  // 10 segundos
    standard: 30000,         // 30 segundos
    lowPower: 60000,         // 1 minuto
    ultraSaving: 300000      // 5 minutos
  };

  // Determina estrategia de carga según tamaño y modo de energía
  const getLoadStrategy = useCallback((contentLength: number, energyMode: EnergyMode) => {
    if (contentLength > DOC_SIZE.VERY_LARGE) {
      return {
        progressive: true,
        initialChunkSize: energyMode === 'ultraSaving' ? 3000 :
          energyMode === 'lowPower' ? 5000 : 10000,
        chunkLoadDelay: energyMode === 'ultraSaving' ? 500 :
          energyMode === 'lowPower' ? 300 :
            energyMode === 'standard' ? 150 : 50,
        size: 'very_large' as const
      };
    } else if (contentLength > DOC_SIZE.LARGE) {
      return {
        progressive: true,
        initialChunkSize: energyMode === 'ultraSaving' ? 5000 :
          energyMode === 'lowPower' ? 10000 : 20000,
        chunkLoadDelay: energyMode === 'ultraSaving' ? 300 :
          energyMode === 'lowPower' ? 150 :
            energyMode === 'standard' ? 80 : 0,
        size: 'large' as const
      };
    } else if (contentLength > DOC_SIZE.MEDIUM) {
      return {
        progressive: energyMode !== 'highPerformance',
        initialChunkSize: energyMode === 'ultraSaving' ? 10000 : 20000,
        chunkLoadDelay: energyMode === 'ultraSaving' ? 150 :
          energyMode === 'lowPower' ? 80 : 0,
        size: 'medium' as const
      };
    } else {
      return {
        progressive: false,
        initialChunkSize: contentLength,
        chunkLoadDelay: 0,
        size: 'small' as const
      };
    }
  }, []);

  // Actualiza contenido de referencia cuando cambia
  useEffect(() => {
    contentRef.current = content;
    // Marca cambios pendientes para autosave
    if (document && content !== document.content) {
      pendingChangesRef.current = true;
    }
  }, [content, document]);

  // Estado para controlar los tiempos de carga y errores
  const [loadTimeoutExpired, setLoadTimeoutExpired] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const loadTimeoutRef = useRef<number | null>(null);

  // Efecto para cargar documento cuando cambia el ID
  useEffect(() => {
    // Función para cargar documento (definida dentro del efecto para usar hooks apropiadamente)
    const loadDocumentEffect = async (id: string) => {
      try {
        setIsLoading(true);
        setLoadingStatus('loading');
        setLoadingProgress(0);
        setLoadTimeoutExpired(false);

        // Configuramos un timeout de seguridad para evitar esperas infinitas
        if (loadTimeoutRef.current) {
          window.clearTimeout(loadTimeoutRef.current);
        }

        loadTimeoutRef.current = window.setTimeout(() => {
          // Forzamos a mostrar el editor aunque no tengamos contenido completo
          setLoadTimeoutExpired(true);
          console.warn('Tiempo de carga del documento excedido. Forzando visualización del editor.');

          // Si tenemos documento parcial, es mejor que nada
          if (document) {
            setLoadingStatus('complete');
            setIsLoading(false);
          }
        }, 5000); // 5 segundos máximo de espera

        // Referencia para controlar si el componente aún está montado durante la carga asíncrona
        const loadId = Symbol('load');
        mountedRef.current = loadId;

        // Obtiene el documento con un timeout máximo para asegurar respuesta rápida
        const documentPromise = getDocument(id);
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 2000)); // Reducimos a 2 segundos

        // Carrera entre documento y timeout para asegurar respuesta rápida
        const doc = await Promise.race([documentPromise, timeoutPromise]);

        // Si el componente se desmontó, cancelamos la carga
        if (mountedRef.current !== loadId) return;

        if (doc) {
          // Determina estrategia de carga basada en tamaño y energía
          const loadStrategy = getLoadStrategy(doc.content.length, currentEnergyMode);
          setDocumentSize(loadStrategy.size);

          // Establecer documento inmediatamente
          setDocument(doc);

          // OPTIMIZACIÓN: Muestra contenido inmediatamente sin esperar la carga completa
          const initialContent = doc.content.substring(0,
            Math.min(doc.content.length, loadStrategy.initialChunkSize * 2));
          setContent(initialContent);

          // Actualiza la UI para mostrar que hay contenido
          setLoadingStatus('rendering');
          setLoadingProgress(30);

          // Manejo de carga progresiva para contenido parcial
          const isPartialContent = doc.metadata.isPartialContent;

          // Suscripción a actualizaciones de contenido si es carga parcial
          // Suscripción a actualizaciones de contenido si es carga parcial
          if (isPartialContent) {
            const unsubscribe = subscribeToEvent(DocumentEventType.DOCUMENT_CONTENT_LOADED, (data) => {
              if (data.documentId === id) {
                // Actualiza progreso mientras se carga
                if (data.progress) {
                  setLoadingProgress(data.progress);
                }

                // Carga completada
                if (data.isComplete) {
                  getDocument(id).then(fullDoc => {
                    if (fullDoc && mountedRef.current === loadId) {
                      setDocument(fullDoc);
                      setContent(fullDoc.content);
                      setWordCount(fullDoc.metadata.wordCount || countWords(fullDoc.content));

                      // Actualiza estado para completar la carga
                      setLoadingStatus('complete');
                      setIsLoading(false);

                      // Limpiamos el timeout de seguridad
                      if (loadTimeoutRef.current) {
                        window.clearTimeout(loadTimeoutRef.current);
                        loadTimeoutRef.current = null;
                      }
                    }
                  });

                  // Limpiar suscripción - Check if unsubscribe is a function before calling it
                  if (unsubscribe && typeof unsubscribe === 'function') {
                    unsubscribe();
                  }
                }
              }
            });
          }

          // Carga el resto del contenido con optimizaciones y alta prioridad
          // Usamos Promise con timeout para garantizar que no se bloquee
          Promise.resolve().then(() => {
            // Para documentos grandes, carga inmediatamente todo el contenido
            // pero mantiene la UI responsiva usando microtareas
            setContent(doc.content);

            // Actualiza métricas y estados
            setWordCount(doc.metadata.wordCount || countWords(doc.content));
            setLoadingProgress(100);

            // Completa la carga inmediatamente sin delay adicional innecesario
            if (mountedRef.current === loadId) {
              setLoadingStatus('complete');
              setIsLoading(false);

              // Limpiamos el timeout de seguridad
              if (loadTimeoutRef.current) {
                window.clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
              }
            }
          });
        } else {
          // El documento podría estar aún cargando (timeout) o no existir
          // Continúa esperando el documento original si fue un timeout
          documentPromise.then(doc => {
            if (doc && mountedRef.current === loadId) {
              // Procesa el documento normalmente
              setDocument(doc);
              setContent(doc.content);
              setWordCount(doc.metadata.wordCount || countWords(doc.content));
              setDocumentSize(getLoadStrategy(doc.content.length, currentEnergyMode).size);
              setLoadingStatus('complete');
              setIsLoading(false);

              // Limpiamos el timeout de seguridad
              if (loadTimeoutRef.current) {
                window.clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
              }
            } else if (mountedRef.current === loadId) {
              // Si después de esperar aún no hay documento, mostrar error pero seguir mostrando UI
              console.error(`Document with id ${id} not found`);
              setLoadingStatus('complete');
              setIsLoading(false);

              // Limpiamos el timeout de seguridad
              if (loadTimeoutRef.current) {
                window.clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
              }
            }
          }).catch(error => {
            console.error('Error loading document:', error);
            setLoadingStatus('complete');
            setIsLoading(false);

            // Limpiamos el timeout de seguridad
            if (loadTimeoutRef.current) {
              window.clearTimeout(loadTimeoutRef.current);
              loadTimeoutRef.current = null;
            }
          });
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setLoadingStatus('complete');
        setIsLoading(false);
        setLoadError(true);

        // Mostrar editor incluso con error para permitir uso con contenido vacío
        setLoadTimeoutExpired(true);

        // Limpiamos el timeout de seguridad
        if (loadTimeoutRef.current) {
          window.clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
      }
    };

    if (currentDocId) {
      loadDocumentEffect(currentDocId);
    } else {
      // Si no hay ID pero hay contenido inicial, establecer inmediatamente
      if (initialContent) {
        setContent(initialContent);
        setWordCount(countWords(initialContent));
      }
      setLoadingStatus('complete');
      setIsLoading(false);
    }

    // Limpieza al desmontar
    return () => {
      mountedRef.current = null;
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [currentDocId, getDocument, currentEnergyMode, countWords, getLoadStrategy, initialContent, subscribeToEvent, document]);

  // Ajusta modo de editor basado en perfil y preferencias
  useEffect(() => {
    // Asigna automáticamente según perfil
    switch (profileType) {
      case 'technical':
        setEditorMode('advanced');
        break;
      case 'writer':
        setEditorMode('standard');
        break;
      case 'manager':
        setEditorMode('basic');
        break;
      default:
        setEditorMode(preferences.editorMode || 'standard');
    }
  }, [profileType, preferences.editorMode]);
  // Configura autosave según el modo de energía
  useEffect(() => {
    // Limpia timeout existente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Solo configura si autosave está habilitado
    if (!preferences.autosave || readOnly) return;

    const interval = autosaveIntervals[currentEnergyMode] || autosaveIntervals.standard;

    // Configura nuevo timeout para guardar periódicamente
    const setupSaveTimeout = () => {
      saveTimeoutRef.current = setTimeout(() => {
        // Solo guardamos si hay cambios pendientes y pasó el tiempo mínimo desde el último guardado
        const timeSinceLastSave = Date.now() - lastSaveTimeRef.current;
        if (document?.id && pendingChangesRef.current && timeSinceLastSave >= interval) {
          handleSave(true);
          // Resetea el indicador de cambios pendientes
          pendingChangesRef.current = false;
        }
        setupSaveTimeout();
      }, interval);
    };

    setupSaveTimeout();

    // Limpia en desmontaje
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [document?.id, currentEnergyMode, preferences.autosave, readOnly]);

  // Optimización: solo recalcula palabras cuando sea necesario
  const updateWordCount = useCallback(
    debounce((text: string) => {
      // Optimización para documentos grandes
      if (text.length > DOC_SIZE.LARGE && currentEnergyMode !== 'highPerformance') {
        // Usamos una estimación para documentos muy grandes en modos de ahorro
        const estimatedCount = Math.round(text.length / 5.5);
        setWordCount(estimatedCount);

        // Posponemos cálculo exacto a momento de inactividad del usuario
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            const exactCount = countWords(text);
            setWordCount(exactCount);
          }, { timeout: 2000 });
        } else {
          // Fallback para navegadores sin requestIdleCallback
          setTimeout(() => {
            const exactCount = countWords(text);
            setWordCount(exactCount);
          }, 2000);
        }
      } else {
        // Para documentos normales, calculamos inmediatamente
        const count = countWords(text);
        setWordCount(count);
      }
    }, currentEnergyMode === 'ultraSaving' ? 1000 :
      currentEnergyMode === 'lowPower' ? 500 : 300),
    [countWords, currentEnergyMode]
  );

  // Maneja cambios en el contenido con optimizaciones
  const handleContentChange = useCallback((newContent: string) => {
    // Actualiza estado local inmediatamente
    setContent(newContent);

    // Marca cambios pendientes para autosave
    pendingChangesRef.current = true;

    // Actualiza recuento de palabras (optimizado con debounce)
    updateWordCount(newContent);
  }, [updateWordCount]);

  // Guarda documento con optimizaciones de sostenibilidad
  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!document?.id || readOnly) return;

    try {
      // Actualiza UI para guardado manual
      if (!isAutoSave) {
        setIsSaving(true);
        setSaveStatus('pending');
      }

      // Registra tiempo de guardado
      lastSaveTimeRef.current = Date.now();

      const success = await updateDocument(
        document.id,
        { content: contentRef.current },
        {
          immediate: !isAutoSave, // Procesamiento inmediato si es guardado manual
          isAutosave: isAutoSave
        }
      );

      if (success) {
        // Actualiza UI para guardado exitoso
        if (!isAutoSave) {
          setSaveStatus('success');
          // Muestra notificación por 2 segundos
          setShowSaveNotification(true);
          setTimeout(() => setShowSaveNotification(false), 2000);
        }
      } else {
        console.error('Failed to save document');
        if (!isAutoSave) {
          setSaveStatus('error');
        }
      }
    } catch (error) {
      console.error('Error saving document:', error);
      if (!isAutoSave) {
        setSaveStatus('error');
      }
    } finally {
      if (!isAutoSave) {
        setIsSaving(false);
        // Vuelve a estado inactivo después de un tiempo
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }
  }, [document?.id, readOnly, updateDocument]);

  // Maneja eventos de cambio de selección
  const handleSelectionChange = useCallback((stats: {
    characters: number;
    words: number;
    lines: number;
  }) => {
    setSelectionStats(stats);
  }, []);

  // Manejo del cambio de modo de energía con feedback mejorado
  const handleEnergyModeChange = useCallback(async (mode: EnergyMode) => {
    try {
      await setEnergyMode(mode);

      // Opcionalmente podríamos mostrar una notificación temporal
    } catch (error) {
      console.error('Error al cambiar el modo de energía:', error);
    }
  }, [setEnergyMode]);

  // Referencia a los componentes cargados para evitar recargas innecesarias
  const loadedEditorsRef = useRef<{
    basic: boolean;
    standard: boolean;
    advanced: boolean;
  }>({
    basic: false,
    standard: false,
    advanced: false
  });

  // Pre-carga de editores para mejorar la experiencia de cambio
  useEffect(() => {
    // Marcamos el editor actual como cargado
    if (editorMode === 'basic') {
      loadedEditorsRef.current.basic = true;
    } else if (editorMode === 'advanced') {
      loadedEditorsRef.current.advanced = true;
    } else {
      loadedEditorsRef.current.standard = true;
    }

    // Después de cargar el editor principal, pre-cargamos los otros en segundo plano
    // si estamos en modo de alto rendimiento
    if (currentEnergyMode === 'highPerformance' && !isLoading) {
      setTimeout(() => {
        // Pre-carga silenciosa de otros editores para cambio rápido
        import('./modes/BasicEditor');
        import('./modes/StandardEditor');
        import('./modes/AdvancedEditor');
      }, 2000);
    }
  }, [editorMode, currentEnergyMode, isLoading]);

  // Renderiza el editor adecuado según el modo (memoizado para prevenir re-renders)
  const renderEditor = useCallback(() => {
    // Props comunes para todos los editores
    const commonProps = {
      content,
      onChange: handleContentChange,
      onSave: handleSave,
      onSelectionChange: handleSelectionChange,
      readOnly,
      energyMode: currentEnergyMode,
      fontSize: preferences.fontSize,
      fontFamily: preferences.fontFamily,
      lineNumbers: preferences.lineNumbers,
      tabSize: preferences.tabSize,
    };

    // Renderiza el editor adecuado con Suspense para carga diferida
    return (
      <Suspense fallback={<EditorFallback />}>
        {editorMode === 'basic' ? (
          <BasicEditor {...commonProps} />
        ) : editorMode === 'advanced' ? (
          <AdvancedEditor {...commonProps} />
        ) : (
          <StandardEditor {...commonProps} />
        )}
      </Suspense>
    );
  }, [
    content, handleContentChange, handleSave, handleSelectionChange,
    readOnly, currentEnergyMode, preferences.fontSize, preferences.fontFamily,
    preferences.lineNumbers, preferences.tabSize, editorMode
  ]);

  // Estado de carga optimizado con indicadores visuales refinados y timeouts de seguridad
  if (isLoading && !loadTimeoutExpired && !loadError) {
    // Permite acceso temprano al editor cuando tenemos contenido parcial o si ha pasado cierto tiempo
    const hasPartialContent = content && content.length > 0 && (loadingProgress > 5 || loadTimeoutExpired);

    // Si tenemos contenido para mostrar, no mostramos pantalla de carga completa
    if (hasPartialContent) {
      return (
        <div className="editor-container flex flex-col w-full h-full bg-white dark:bg-gray-900 animate-fadeIn relative">
          {showToolbar && (
            <Toolbar
              documentId={document?.id}
              documentTitle={document?.title}
              onSave={handleSave}
              isSaving={isSaving}
              editorMode={editorMode}
              onEditorModeChange={setEditorMode}
              readOnly={readOnly}
              saveStatus={saveStatus}
              documentSize={documentSize}
            />
          )}

          <div className="editor-content-wrapper flex-grow overflow-auto relative">
            {renderEditor()}

            {/* Indicador de carga parcial mejorado con barra de progreso */}
            <div className="fixed top-0 left-0 right-0 z-20">
              <div className="h-1 bg-blue-100 dark:bg-blue-900/30">
                <div
                  className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md z-50 px-3 py-2 text-sm transition-opacity duration-300">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                  <span className="text-gray-700 dark:text-gray-300">Cargando contenido {loadingProgress > 0 ? `(${loadingProgress}%)` : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {showStatusBar && (
            <StatusBar
            wordCount={wordCount}
            selectionStats={selectionStats}
            energyMode={currentEnergyMode}
            sustainabilityMetrics={document?.metadata?.sustainability ? {
              storageSize: document.metadata.sustainability.optimizedSize,
              optimizationLevel: document.metadata.sustainability.contentReuseFactor * 100,
              compressionRatio: document.metadata.sustainability.originalSize / document.metadata.sustainability.optimizedSize,
              energyImpact: {
                current: document.metadata.sustainability.editingEnergyUsage,
                average: document.metadata.sustainability.syncEnergyCost
              }
            } : undefined}
            showEnergyMetrics={preferences.sustainabilityMetricsVisible}
          />
        )}
        </div>
      );
    }

    // Pantalla de carga mejorada usando skeletons para mejor UX
    return (
      <div className="editor-container min-h-[300px] bg-white dark:bg-gray-900 animate-fadeIn p-4">
        {/* Barra de progreso */}
        <div className="fixed top-0 left-0 right-0 z-20 h-1 bg-blue-100 dark:bg-blue-900/30">
          <div
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{
              width: `${document?.metadata?.isPartialContent
                ? Math.round((document.metadata.loadedSize || 0) / (document.metadata.totalSize || 1) * 100)
                : loadingProgress}%`
            }}
          />
        </div>

        <div className="animate-pulse">
          {/* Skeleton para toolbar */}
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md mb-6"></div>

          {/* Skeleton para título de documento */}
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-3/5 mb-6"></div>

          {/* Skeleton para contenido */}
          <div className="space-y-3 mb-8">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>

        {/* Indicador de estado - discreto en la esquina */}
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-md px-4 py-2 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">
              {loadingStatus === 'loading' ? 'Cargando documento...' :
                loadingStatus === 'rendering' ? 'Procesando contenido...' :
                  'Preparando editor...'}
            </div>
          </div>

          <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
            {document?.metadata?.isPartialContent ?
              `Progreso: ${Math.round((document.metadata.loadedSize || 0) / (document.metadata.totalSize || 1) * 100)}%` :
              loadingProgress > 0 ? `Progreso: ${loadingProgress}%` : ''}
          </div>
        </div>

        {(currentEnergyMode === 'ultraSaving' || currentEnergyMode === 'lowPower') && (
          <div className="mt-4 text-xs text-green-600 dark:text-green-400 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {currentEnergyMode === 'ultraSaving'
              ? 'Modo de ultraahorro activo - Carga optimizada'
              : 'Modo de ahorro activo - Carga progresiva'}
          </div>
        )}

        {/* Botón de carga forzada para mejor UX */}
        {loadingProgress > 10 && loadingStatus === 'loading' && (
          <button
            onClick={() => {
              setLoadingStatus('rendering');
              setIsLoading(false);
            }}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Mostrar contenido parcial
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="editor-container flex flex-col w-full h-full bg-white dark:bg-gray-900 animate-fadeIn">
      {showToolbar && (
        <Toolbar
          documentId={document?.id}
          documentTitle={document?.title}
          onSave={handleSave}
          isSaving={isSaving}
          editorMode={editorMode}
          onEditorModeChange={setEditorMode}
          readOnly={readOnly}
          saveStatus={saveStatus}
          documentSize={documentSize}
        />
      )}

      <div className="editor-content-wrapper flex-grow overflow-auto relative">
        {renderEditor()}

        {/* Notificación de guardado flotante */}
        {showSaveNotification && (
          <div className="absolute top-4 right-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-md shadow-md transition-opacity animate-fadeInSlideDown z-50">
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Documento guardado
            </div>
          </div>
        )}

        {/* Indicador flotante de modo de energía - rediseñado para mejor UX */}
        <div className="absolute bottom-4 right-4 z-10">
          <EnergyModeSelector
            currentMode={currentEnergyMode}
            onChange={handleEnergyModeChange}
            batteryLevel={sustainabilityMetrics?.battery?.level}
            isCharging={sustainabilityMetrics?.battery?.isCharging}
            compact={true}
          />
        </div>
      </div>

      {showStatusBar && (
        <StatusBar
          wordCount={wordCount}
          selectionStats={selectionStats}
          energyMode={currentEnergyMode}
          sustainabilityMetrics={document?.metadata?.sustainability ? {
            storageSize: document.metadata.sustainability.optimizedSize,
            optimizationLevel: document.metadata.sustainability.contentReuseFactor * 100,
            compressionRatio: document.metadata.sustainability.originalSize / document.metadata.sustainability.optimizedSize,
            energyImpact: {
              current: document.metadata.sustainability.editingEnergyUsage,
              average: document.metadata.sustainability.syncEnergyCost
            }
          } : undefined}
          showEnergyMetrics={preferences.sustainabilityMetricsVisible}
        />
      )}
    </div>
  );
};

// Optimización: memoize el componente para prevenir renders innecesarios
export default memo(EditorContainer);