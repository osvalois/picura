import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentContext } from '../../contexts/DocumentContext';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import { useContentRenderer, useViewerSettings, useInteractivity } from './hooks';
import { ViewerToolbar, ViewerControls, ViewerNotification } from './ui';
import ContentRenderer from './core/ContentRenderer';
import { defaultViewerSettings } from './utils/viewerConfig';
// import { detectContentType } from './utils/contentTypes';

interface DocumentViewerProps {
  documentId?: string;
  initialContent?: string;
  filename?: string | undefined;
  showToolbar?: boolean;
  showControls?: boolean;
  darkMode?: boolean;
  className?: string;
  onSwitchToEditor?: () => void;
}

/**
 * Componente principal para visualizar documentos con soporte para múltiples formatos
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  initialContent = '',
  filename,
  showToolbar = true,
  showControls = true,
  darkMode = false,
  className = '',
  onSwitchToEditor
}) => {
  // Obtiene ID del documento de la URL si no se proporciona como prop
  const { id: urlId } = useParams<{ id: string }>();
  const currentDocId = documentId || urlId;

  // Contextos
  const { getDocument, currentDocument } = useDocumentContext();
  const { currentEnergyMode } = useSustainabilityContext();

  // Estado local
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [docFilename, setDocFilename] = useState<string | undefined>(filename);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    visible: boolean;
  } | null>(null);

  // Referencias
  const containerRef = useRef<HTMLDivElement>(null);

  // Configuración del visor
  const { settings, updateSettings, /* resetSettings, */ toggleDarkMode } = useViewerSettings({
    initialSettings: {
      ...defaultViewerSettings,
      // Adapta la configuración según el modo de energía
      enableSyntaxHighlighting: currentEnergyMode !== 'ultraSaving',
      showLineNumbers: currentEnergyMode !== 'ultraSaving'
    },
    darkMode
  });

  // Procesamiento de contenido
  const { contentType, processedContent, isProcessing, renderError } = useContentRenderer({
    content,
    filename: docFilename,
    settings
  });

  // Interactividad del visor
  const {
    /* activeElementId, */
    zoomLevel,
    handleLinkClick,
    handleImageClick,
    handleCopyCode,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    handleKeyDown
  } = useInteractivity({
    content,
    enableLinks: settings.enableLinks,
    onLinkClick: (url) => {
      // Navegar a enlaces internos o abrir enlaces externos
      if (url.startsWith('#')) {
        // Enlaces internos se manejan automáticamente
      } else if (url.startsWith('http') || url.startsWith('https')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
    onImageLoad: (url, dimensions) => {
      console.log(`Imagen cargada: ${url}, dimensiones: ${dimensions.width}x${dimensions.height}`);
    },
    onCodeCopy: (/* code */) => {
      setNotification({
        message: 'Código copiado al portapapeles',
        type: 'success',
        visible: true
      });
    },
    maxZoomLevel: 3
  });

  // Cargar documento si se proporciona un ID
  useEffect(() => {
    if (!currentDocId) {
      // Si no hay ID pero hay contenido inicial, detectar el tipo
      if (initialContent) {
        setContent(initialContent);
      }
      return;
    }

    // Carga el documento
    const loadDocument = async () => {
      try {
        const doc = await getDocument(currentDocId);

        if (doc) {
          setContent(doc.content);
          setTitle(doc.title);
          setDocFilename(doc.path.split('/').pop() || undefined);
        } else {
          setNotification({
            message: `No se pudo encontrar el documento con ID: ${currentDocId}`,
            type: 'error',
            visible: true
          });
        }
      } catch (error) {
        console.error('Error loading document:', error);
        setNotification({
          message: `Error al cargar el documento: ${(error as Error).message || 'Error desconocido'}`,
          type: 'error',
          visible: true
        });
      }
    };

    loadDocument();
  }, [currentDocId, getDocument, initialContent]);

  // Actualizar contenido cuando el documento actual cambia
  useEffect(() => {
    if (currentDocument && (!currentDocId || currentDocument.id === currentDocId)) {
      setContent(currentDocument.content);
      setTitle(currentDocument.title);
      setDocFilename(currentDocument.path.split('/').pop() || undefined);
    }
  }, [currentDocument, currentDocId]);

  // Efecto para manejar eventos de teclado globales
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Prevenir comportamiento por defecto para nuestros atajos
      if (
        (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) ||
        e.key === 'F11'
      ) {
        e.preventDefault();
      }

      // Manejar zoom con atajos de teclado
      if (e.ctrlKey) {
        if (e.key === '+' || e.key === '=') {
          increaseZoom();
        } else if (e.key === '-') {
          decreaseZoom();
        } else if (e.key === '0') {
          resetZoom();
        }
      }

      // Pantalla completa
      if (e.key === 'F11') {
        toggleFullscreen();
      }
    };

    // Agregar escucha de eventos
    window.addEventListener('keydown', handleGlobalKeyDown);

    // Limpiar escucha al desmontar
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [increaseZoom, decreaseZoom, resetZoom]);

  // Alternar pantalla completa
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Imprimir documento
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Si está procesando, mostrar indicador de carga
  if (isProcessing) {
    return (
      <div className="flex justify-center items-center h-full w-full bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando documento...</p>
        </div>
      </div>
    );
  }

  // Si hay error de renderizado, mostrar mensaje y permitir descarga del contenido
  if (renderError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
        <h3 className="text-lg font-medium mb-2">Error al renderizar el documento</h3>
        <p className="mb-4">{renderError}</p>
        <div className="flex space-x-2 mb-4">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              // Crear un blob y descargarlo como archivo
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = docFilename || 'document.md';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Descargar contenido
          </button>
          {onSwitchToEditor && (
            <button
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={onSwitchToEditor}
            >
              Abrir en editor
            </button>
          )}
        </div>
        <pre className="bg-white dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
          {content.substring(0, 500)}{content.length > 500 ? '...' : ''}
        </pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`document-viewer flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0} // Para poder recibir eventos de teclado
    >
      {/* Barra de herramientas */}
      {showToolbar && (
        <ViewerToolbar
          title={title}
          filename={docFilename}
          settings={settings}
          zoomLevel={zoomLevel}
          onZoomIn={increaseZoom}
          onZoomOut={decreaseZoom}
          onZoomReset={resetZoom}
          onToggleTheme={toggleDarkMode}
          onSettingsChange={updateSettings}
        />
      )}

      {/* Área de contenido */}
      <div className="flex-grow overflow-hidden relative">
        <ContentRenderer
          content={processedContent}
          contentType={contentType}
          settings={settings}
          filename={docFilename}
          zoomLevel={zoomLevel}
          onLinkClick={(url, _event) => {
            handleLinkClick(url as any);
          }}
          onImageClick={handleImageClick}
          onCopyCode={handleCopyCode}
          className="h-full"
        />

        {/* Notificación */}
        {notification && notification.visible && (
          <ViewerNotification
            message={notification.message}
            type={notification.type}
            onDismiss={() => setNotification(null)}
          />
        )}
      </div>

      {/* Controles flotantes */}
      {showControls && (
        <ViewerControls
          zoomLevel={zoomLevel}
          onZoomIn={increaseZoom}
          onZoomOut={decreaseZoom}
          onZoomReset={resetZoom}
          onFullscreen={toggleFullscreen}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

export default DocumentViewer;