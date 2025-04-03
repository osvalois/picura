import React, { Suspense, lazy, memo } from 'react';
import { Document } from '../../../../shared/types/Document';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';
import { useDocumentLoader } from '../hooks/useDocumentLoader';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import ErrorMessage from '../ui/ErrorMessage';
import EditorFallback from '../ui/EditorFallback';
import EditorRenderer from './EditorRenderer';

// Definimos la lógica de prefetch de editores
const prefetchEditor = (importPromise: Promise<any>) => {
  // Permite trackear el estado de carga para optimizaciones
  const status = { loaded: false };
  
  // Prefetch del módulo y marcado cuando está listo
  const promise = importPromise
    .then(module => {
      status.loaded = true;
      return module;
    })
    .catch(error => {
      console.error('Error cargando editor:', error);
      throw error;
    });
  
  return [promise, status] as const;
};

// Definimos los módulos de editores con prefetch controlado
const [basicEditorPromise, basicEditorStatus] = prefetchEditor(import('../modes/BasicEditor'));
const [standardEditorPromise, standardEditorStatus] = prefetchEditor(import('../modes/StandardEditor'));
const [advancedEditorPromise, advancedEditorStatus] = prefetchEditor(import('../modes/AdvancedEditor'));

// Componentes lazy con referencias a los módulos prefetched
const BasicEditor = lazy(() => 
  basicEditorPromise.catch(() => import('../modes/BasicEditor')));
const StandardEditor = lazy(() => 
  standardEditorPromise.catch(() => import('../modes/StandardEditor')));
const AdvancedEditor = lazy(() => 
  advancedEditorPromise.catch(() => import('../modes/AdvancedEditor')));

interface EditorLoaderProps {
  documentId?: string | undefined;
  initialContent?: string;
  getDocument: (id: string) => Promise<Document | null>;
  currentEnergyMode: EnergyMode;
  editorMode: 'basic' | 'standard' | 'advanced';
  editorProps: any; // Props específicas que se pasan al editor
  onForceLoad?: (() => void) | undefined;
  renderToolbar: () => React.ReactNode;
  renderStatusBar: () => React.ReactNode;
}

/**
 * Componente para gestionar la carga de documentos con múltiples estrategias
 * y renderizar el editor apropiado según el modo seleccionado
 */
const EditorLoader: React.FC<EditorLoaderProps> = memo(({
  documentId,
  initialContent = '',
  getDocument,
  currentEnergyMode,
  editorMode,
  editorProps,
  onForceLoad,
  renderToolbar,
  renderStatusBar
}) => {
  // Prefetch optimizado de editores
  const prefetchEditors = () => {
    // Prefetch del editor activo primero
    if (editorMode === 'basic' && !basicEditorStatus.loaded) {
      basicEditorPromise.catch(e => console.warn('Editor prefetch error:', e));
    } else if (editorMode === 'standard' && !standardEditorStatus.loaded) {
      standardEditorPromise.catch(e => console.warn('Editor prefetch error:', e));
    } else if (editorMode === 'advanced' && !advancedEditorStatus.loaded) {
      advancedEditorPromise.catch(e => console.warn('Editor prefetch error:', e));
    }

    // Solo en modo de alto rendimiento, precargamos los otros editores
    if (currentEnergyMode === 'highPerformance') {
      if (editorMode !== 'basic' && !basicEditorStatus.loaded) {
        basicEditorPromise.catch(e => console.warn('Editor prefetch error:', e));
      }
      if (editorMode !== 'standard' && !standardEditorStatus.loaded) {
        standardEditorPromise.catch(e => console.warn('Editor prefetch error:', e));
      }
      if (editorMode !== 'advanced' && !advancedEditorStatus.loaded) {
        advancedEditorPromise.catch(e => console.warn('Editor prefetch error:', e));
      }
    }
  };

  // Usamos el hook de carga de documentos
  const {
    document,
    content,
    isLoading,
    loadState,
    loadingProgress,
    documentSize
  } = useDocumentLoader({
    documentId,
    initialContent,
    getDocument,
    currentEnergyMode,
    prefetchEditors
  });

  // Calculamos el valor del progreso estabilizado para animación fluida
  const normalizedProgress = Math.floor(loadingProgress / 5) * 5;
  
  // Estado de error
  if (loadState.status === 'error') {
    return (
      <ErrorMessage 
        message={loadState.error || "No se pudo cargar el documento. Verifica tu conexión e intenta nuevamente."}
        onRetry={() => window.location.reload()}
      />
    );
  }
  
  // Estado de carga
  if (isLoading && !loadState.stable) {
    // Si tenemos contenido parcial, mostramos el editor con indicador de carga
    if (document && content && content.length > 0 && loadState.status === 'partial') {
      return (
        <div className="editor-container flex flex-col w-full h-full bg-white dark:bg-gray-900 transition-colors duration-200">
          {renderToolbar()}

          <div className="editor-content-wrapper flex-grow overflow-auto relative">
            {/* Editor con componente de renderizado específico */}
            <Suspense fallback={<EditorFallback />}>
              <EditorRenderer
                content={content}
                documentSize={documentSize}
                editorMode={editorMode}
                editors={{ BasicEditor, StandardEditor, AdvancedEditor }}
                editorStatus={{ basicEditorStatus, standardEditorStatus, advancedEditorStatus }}
                editorPromises={{ basicEditorPromise, standardEditorPromise, advancedEditorPromise }}
                currentEnergyMode={currentEnergyMode}
                isLoading={isLoading}
                {...editorProps}
              />
            </Suspense>
          </div>

          {renderStatusBar()}
        </div>
      );
    }

    // En fase inicial de carga, mostramos skeleton
    return (
      <LoadingSkeleton 
        progress={normalizedProgress} 
        currentEnergyMode={currentEnergyMode}
        onCancelLoading={onForceLoad}
      />
    );
  }
  
  // Estado normal (carga completa o contenido inicial)
  return (
    <div 
      className="editor-container flex flex-col w-full h-full bg-white dark:bg-gray-900 transition-colors duration-200" 
      data-size={documentSize}
      data-mode={editorMode}
      data-energy={currentEnergyMode}
    >
      {renderToolbar()}

      <div className="editor-content-wrapper flex-grow overflow-auto relative">
        <Suspense fallback={<EditorFallback />}>
          <EditorRenderer
            content={content}
            documentSize={documentSize}
            editorMode={editorMode}
            editors={{ BasicEditor, StandardEditor, AdvancedEditor }}
            editorStatus={{ basicEditorStatus, standardEditorStatus, advancedEditorStatus }}
            editorPromises={{ basicEditorPromise, standardEditorPromise, advancedEditorPromise }}
            currentEnergyMode={currentEnergyMode}
            isLoading={isLoading}
            {...editorProps}
          />
        </Suspense>
      </div>

      {renderStatusBar()}
    </div>
  );
});

export default EditorLoader;