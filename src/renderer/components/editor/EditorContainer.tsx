import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentContext } from '../../contexts/DocumentContext';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import StatusBar from './statusBar/StatusBar';
import Toolbar from './toolbar/Toolbar';
import EnergyModeSelector from '../common/EnergyModeSelector';
import SaveNotification from './ui/SaveNotification';
import EditorLoader from './core/EditorLoader';
import { useEditorPreference } from './hooks/useEditorPreference';
import { useEditorManager } from './hooks/useEditorManager';

interface EditorContainerProps {
  documentId?: string;
  initialContent?: string;
  readOnly?: boolean;
  showToolbar?: boolean;
  showStatusBar?: boolean;
}

/**
 * EditorContainer es el componente principal que coordina la carga y edición de documentos.
 * Integra múltiples componentes y hooks especializados para ofrecer una experiencia
 * de edición optimizada y eficiente.
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
    currentDocument
  } = useDocumentContext();

  const {
    currentEnergyMode,
    sustainabilityMetrics,
    setEnergyMode
  } = useSustainabilityContext();

  const { preferences, profileType } = useUserPreferences();
  
  // Gestiona preferencias y modos del editor
  const { editorMode, setEditorMode, preferences: editorPreferences } = useEditorPreference({
    initialEditorMode: preferences.editorMode,
    profileType,
    currentEnergyMode
  });

  // Control para forzar la finalización de carga
  const [forceLoadComplete, setForceLoadComplete] = useState(false);

  // Gestiona el contenido del editor, guardado y selección
  const {
    content,
    wordCount,
    isSaving,
    saveStatus,
    selectionStats,
    showSaveNotification,
    handleContentChange,
    handleSave,
    handleSelectionChange
  } = useEditorManager({
    document: currentDocument,
    initialContent,
    readOnly,
    autoSave: preferences.autosave,
    currentEnergyMode,
    onSave: async (isAutoSave) => {
      if (!currentDocument?.id) return;
      
      try {
        await updateDocument(
          currentDocument.id,
          { content },
          {
            immediate: !isAutoSave,
            isAutosave: isAutoSave || false
          }
        );
        return Promise.resolve();
      } catch (error) {
        console.error('Failed to save document:', error);
        return Promise.reject(error);
      }
    }
  });

  // Manejo del cambio de modo de energía
  const handleEnergyModeChange = useCallback(async (mode: string) => {
    try {
      await setEnergyMode(mode as any);
      return Promise.resolve();
    } catch (error) {
      console.error('Error al cambiar el modo de energía:', error);
      return Promise.reject(error);
    }
  }, [setEnergyMode]);

  // Fuerza finalización de carga si así se solicita
  useEffect(() => {
    if (forceLoadComplete) {
      // Reiniciamos el estado de forzado después de un tiempo
      const timer = setTimeout(() => {
        setForceLoadComplete(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [forceLoadComplete]);

  // Renderiza la barra de herramientas
  const renderToolbar = useCallback(() => (
    showToolbar && (
      <Toolbar
        documentId={currentDocument?.id}
        documentTitle={currentDocument?.title}
        onSave={handleSave}
        isSaving={isSaving}
        editorMode={editorMode}
        onEditorModeChange={setEditorMode}
        readOnly={readOnly}
        saveStatus={saveStatus}
        documentSize={currentDocument ? 
          (currentDocument.content.length > 1000000 ? 'very_large' :
           currentDocument.content.length > 500000 ? 'large' :
           currentDocument.content.length > 100000 ? 'medium' : 'small') : 
          (initialContent.length > 1000000 ? 'very_large' :
           initialContent.length > 500000 ? 'large' :
           initialContent.length > 100000 ? 'medium' : 'small')}
      />
    )
  ), [
    showToolbar, currentDocument, handleSave, isSaving, 
    editorMode, setEditorMode, readOnly, saveStatus, initialContent.length
  ]);

  // Renderiza la barra de estado
  const renderStatusBar = useCallback(() => (
    showStatusBar && (
      <StatusBar
        wordCount={wordCount}
        selectionStats={selectionStats}
        energyMode={currentEnergyMode}
        sustainabilityMetrics={currentDocument?.metadata?.sustainability ? {
          storageSize: currentDocument.metadata.sustainability.optimizedSize,
          optimizationLevel: currentDocument.metadata.sustainability.contentReuseFactor * 100,
          compressionRatio: currentDocument.metadata.sustainability.originalSize / currentDocument.metadata.sustainability.optimizedSize,
          energyImpact: {
            current: currentDocument.metadata.sustainability.editingEnergyUsage,
            average: currentDocument.metadata.sustainability.syncEnergyCost
          }
        } : undefined}
        showEnergyMetrics={preferences.sustainabilityMetricsVisible}
      />
    )
  ), [
    showStatusBar, wordCount, selectionStats, currentEnergyMode, 
    currentDocument?.metadata?.sustainability, preferences.sustainabilityMetricsVisible
  ]);

  return (
    <div className="editor-container-root w-full h-full">
      {/* Loader principal del editor con prefetch y optimizaciones */}
      <EditorLoader
        documentId={currentDocId}
        initialContent={initialContent}
        getDocument={getDocument}
        currentEnergyMode={currentEnergyMode}
        editorMode={editorMode}
        onForceLoad={() => setForceLoadComplete(true)}
        renderToolbar={renderToolbar}
        renderStatusBar={renderStatusBar}
        editorProps={{
          // Props para los editores
          onChange: handleContentChange,
          onSave: handleSave,
          onSelectionChange: handleSelectionChange,
          readOnly,
          fontSize: editorPreferences.fontSize,
          fontFamily: editorPreferences.fontFamily,
          lineNumbers: editorPreferences.lineNumbers,
          tabSize: editorPreferences.tabSize,
        }}
      />
      
      {/* Notificaciones y elementos flotantes */}
      <SaveNotification 
        show={showSaveNotification} 
        status={saveStatus === 'pending' ? 'saving' : saveStatus === 'error' ? 'error' : 'success'}
      />
      
      {/* Selector de modo de energía flotante */}
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
  );
};

export default EditorContainer;