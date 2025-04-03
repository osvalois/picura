import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';

type EditorMode = 'basic' | 'standard' | 'advanced';
type DocumentSize = 'small' | 'medium' | 'large' | 'very_large';
type EditorComponents = {
  BasicEditor: React.ComponentType<any>;
  StandardEditor: React.ComponentType<any>;
  AdvancedEditor: React.ComponentType<any>;
};

type EditorLoadStatus = {
  basic: boolean;
  standard: boolean;
  advanced: boolean;
};

interface UseEditorRendererProps {
  editorMode: EditorMode;
  documentSize: DocumentSize;
  editors: EditorComponents;
  editorStatus: any; // Para evitar el error de TS6133
  editorPromises: {
    basicEditorPromise: Promise<any>;
    standardEditorPromise: Promise<any>;
    advancedEditorPromise: Promise<any>;
  };
  currentEnergyMode: string;
  isLoading: boolean;
}

interface UseEditorRendererResult {
  EditorComponent: React.ComponentType<any>;
  editorRef: React.RefCallback<Element>;
  isEditorVisible: boolean;
  editorKey: string;
  preloadEditors: () => void;
}

/**
 * Hook para gestionar la renderización y carga optimizada de los editores
 */
export function useEditorRenderer({
  editorMode,
  documentSize,
  editors,
  editorStatus: _, // Ignoramos este parámetro
  editorPromises,
  currentEnergyMode,
  isLoading
}: UseEditorRendererProps): UseEditorRendererResult {
  // Referencias para los componentes cargados
  const loadedEditorsRef = useRef<EditorLoadStatus>({
    basic: false,
    standard: false,
    advanced: false
  });
  
  // Observador de intersección para optimizar renderizado
  const [editorRef, isEditorVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px',
    freezeOnceVisible: true
  });

  // Seleccionamos el componente de editor basado en el modo
  const EditorComponent = useMemo(() => {
    // Selecciona el componente adecuado
    let Component;
    switch (editorMode) {
      case 'basic':
        Component = editors.BasicEditor;
        break;
      case 'advanced':
        Component = editors.AdvancedEditor;
        break;
      default:
        Component = editors.StandardEditor;
    }
    return Component;
  }, [editorMode, editors]);
  
  // Clave única para el componente actual (evita parpadeos en cambios)
  const editorKey = useMemo(() => 
    `editor-${editorMode}-${documentSize}`, 
    [editorMode, documentSize]);

  // Precarga de componentes de editor
  const preloadEditors = useCallback(() => {
    // Crear una copia del estado actual para evitar mutaciones directas
    const newLoadedState = { ...loadedEditorsRef.current };
    
    // Marcar el editor actual como cargado
    if (editorMode === 'basic') {
      newLoadedState.basic = true;
    } else if (editorMode === 'advanced') {
      newLoadedState.advanced = true;
    } else {
      newLoadedState.standard = true;
    }
    
    // Actualizar la referencia
    loadedEditorsRef.current = newLoadedState;
  
    // Pre-carga de editores en segundo plano para modo de alto rendimiento
    if (currentEnergyMode === 'highPerformance' && !isLoading) {
      setTimeout(() => {
        // Precarga con manejo de errores para evitar problemas
        Promise.all([
          !newLoadedState.basic ? editorPromises.basicEditorPromise.catch(() => {}) : Promise.resolve(),
          !newLoadedState.standard ? editorPromises.standardEditorPromise.catch(() => {}) : Promise.resolve(),
          !newLoadedState.advanced ? editorPromises.advancedEditorPromise.catch(() => {}) : Promise.resolve()
        ]);
      }, 2000);
    }
    
    // Limpiar el timer si es necesario
    return null; // Para satisfacer el tipo React.ReactNode
  }, [
    editorMode, 
    currentEnergyMode, 
    isLoading, 
    editorPromises.basicEditorPromise, 
    editorPromises.standardEditorPromise, 
    editorPromises.advancedEditorPromise
  ]);

  // Efecto para precargar editores cuando cambie el modo
  useEffect(() => {
    preloadEditors();
  }, [editorMode, currentEnergyMode, preloadEditors]);

  return {
    EditorComponent,
    editorRef,
    isEditorVisible,
    editorKey,
    preloadEditors
  };
}