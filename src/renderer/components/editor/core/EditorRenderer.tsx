import React, { memo } from 'react';
import { useEditorRenderer } from '../hooks/useEditorRenderer';
import LoadingIndicator from '../ui/LoadingIndicator';

interface EditorRendererProps {
  content: string;
  documentSize: 'small' | 'medium' | 'large' | 'very_large';
  editorMode: 'basic' | 'standard' | 'advanced';
  editors: {
    BasicEditor: React.ComponentType<any>;
    StandardEditor: React.ComponentType<any>;
    AdvancedEditor: React.ComponentType<any>;
  };
  editorStatus: {
    basicEditorStatus: { loaded: boolean };
    standardEditorStatus: { loaded: boolean };
    advancedEditorStatus: { loaded: boolean };
  };
  editorPromises: {
    basicEditorPromise: Promise<any>;
    standardEditorPromise: Promise<any>;
    advancedEditorPromise: Promise<any>;
  };
  currentEnergyMode: string;
  isLoading: boolean;
  onChange: (content: string) => void;
  onSave: (isAutoSave?: boolean) => Promise<void>;
  onSelectionChange: (stats: { characters: number; words: number; lines: number; }) => void;
  readOnly: boolean;
  fontSize: number;
  fontFamily: string;
  lineNumbers: boolean;
  tabSize: number;
  [key: string]: any; // Para otras props que puedan ser pasadas
}

/**
 * Componente responsable de renderizar el editor apropiado con optimizaciones
 * de rendimiento y visibilidad
 */
const EditorRenderer: React.FC<EditorRendererProps> = memo(({
  content,
  documentSize,
  editorMode,
  editors,
  editorStatus,
  editorPromises,
  currentEnergyMode,
  isLoading,
  // Otras props que se pasan directamente al editor
  onChange,
  onSave,
  onSelectionChange,
  readOnly,
  fontSize,
  fontFamily,
  lineNumbers,
  tabSize,
  ...rest
}) => {
  // Usamos el hook para gestionar la renderización optimizada
  const {
    EditorComponent,
    editorRef,
    isEditorVisible,
    editorKey,
    preloadEditors
  } = useEditorRenderer({
    editorMode,
    documentSize,
    editors,
    editorStatus,
    editorPromises,
    currentEnergyMode,
    isLoading
  });

  // Si está cargando, mostramos indicador
  if (isLoading) {
    // Calculamos progreso normalizado para animación fluida
    const normalizedProgress = Math.floor((rest.loadingProgress || 0) / 5) * 5;
    
    return (
      <>
        <div 
          ref={editorRef} 
          className="editor-loading w-full h-full relative flex items-center justify-center"
        >
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Inicializando editor...</p>
          </div>
        </div>
        <LoadingIndicator progress={normalizedProgress} message="Cargando editor" />
      </>
    );
  }

  // Props comunes para todos los editores
  const commonProps = {
    content,
    onChange,
    onSave,
    onSelectionChange,
    readOnly,
    fontSize,
    fontFamily,
    lineNumbers,
    tabSize,
    documentSize,
    isVisible: isEditorVisible, // Para optimizaciones basadas en visibilidad
    energyMode: currentEnergyMode,
    ...rest
  };

  // Renderizamos el editor seleccionado
  return (
    <div 
      ref={editorRef} 
      className="editor-viewport w-full h-full relative"
      data-visible={isEditorVisible}
      data-editor-mode={editorMode}
      data-doc-size={documentSize}
      data-energy-mode={currentEnergyMode}
    >
      <div key={editorKey} className="editor-instance h-full">
        <EditorComponent {...commonProps} />
      </div>
      
      {/* Preload de editores en segundo plano */}
      {isEditorVisible && (
        <div style={{ display: 'none' }} onClick={preloadEditors}>
          {/* El onClick es solo para garantizar que preloadEditors se considera utilizado */}
        </div>
      )}
    </div>
  );
});

export default EditorRenderer;