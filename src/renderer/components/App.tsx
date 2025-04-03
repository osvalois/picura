import React, { useState, useEffect, useCallback, lazy, Suspense, memo, Component, ErrorInfo, ReactNode } from 'react';
import { SustainabilityProvider, useSustainabilityContext } from '../contexts/SustainabilityContext';
import { DocumentProvider, useDocumentContext } from '../contexts/DocumentContext';
import NavigationSidebar from './navigation/NavigationSidebar';
import SustainabilityIndicator from './common/SustainabilityIndicator';
import { Document } from '../../shared/types/Document';
import { DocumentAPI } from '../utils/ipcAPI';
import { EnergyMode } from '../../shared/types/SustainabilityMetrics';
import { debounce } from '../utils/performanceUtils';
import FileImport from "@/renderer/components/common/FileImport";

// Componente de límite de errores para capturar problemas en los componentes hijos
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error en componente:", error);
    console.error("Stack trace:", errorInfo.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-900 p-6">
          <div className="max-w-md text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Ha ocurrido un error
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {this.state.error?.message || "Error al cargar el componente"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Carga diferida para mejorar rendimiento inicial
const EditorContainer = lazy(() => import('./editor/EditorContainer'));
const DocumentViewer = lazy(() => import('./viewer/DocumentViewer'));
const AIAssistant = lazy(() => import('./ai/AIAssistant'));

// Componente para usar como fallback durante la carga diferida
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Cargando componente...</p>
    </div>
  </div>
);

// Fallback mejorado para editor con mensaje más claro
const EditorLoadingFallback = () => (
  <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
    <div className="bg-gray-50 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-64 animate-pulse"></div>
    </div>
    <div className="flex-grow flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-6 max-w-md text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Preparando el editor</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Estamos cargando todos los componentes necesarios para editar de forma óptima...
        </p>
      </div>
    </div>
  </div>
);

/**
 * Componente principal de la aplicación
 * Implementa la estructura general y gestiona el estado global
 */
const App: React.FC = () => {
  return (
    <SustainabilityProvider>
      <DocumentProvider>
        <Suspense fallback={<LoadingFallback />}>
          <AppContent />
        </Suspense>
      </DocumentProvider>
    </SustainabilityProvider>
  );
};

/**
 * Contenido principal de la aplicación
 * Usa los contextos para acceder a la funcionalidad compartida
 */
const AppContent: React.FC = () => {
  // Acceso a contextos
  const { 
    currentDocument, 
    recentDocuments, 
    listDocuments, 
    createDocument, 
    openFile,
    openFolder,
    setActiveDocument,
  } = useDocumentContext();
  
  const { currentEnergyMode, setEnergyMode, sustainabilityMetrics } = useSustainabilityContext();
  
  // Estado local
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<{ path: string; name: string; count: number }[]>([]);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [darkMode] = useState(false);
  
  // Función que actualiza el estado con los nuevos datos de carpetas
  const setFoldersData = useCallback((docs: Document[], newFolders: string[] = []) => {
    // Uso de Map para optimizar el conteo y evitar múltiples iteraciones
    const pathCountMap = new Map<string, number>();
    docs.forEach(doc => {
      const path = doc.path;
      pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
    });
    
    // Incluir también carpetas nuevas con conteo inicial 0
    newFolders.forEach(path => {
      if (!pathCountMap.has(path)) {
        pathCountMap.set(path, 0);
      }
    });
    
    // Definir explícitamente el tipo de folderData
    const folderData: Array<{ path: string; name: string; count: number }> = 
      Array.from(pathCountMap.entries()).map(([path, count]) => {
        const segments = path.split('/').filter(Boolean);
        
        // Garantizar que name siempre sea un string válido
        let name: string;
        if (segments.length > 0) {
          // Si hay segmentos, tomamos el último y nos aseguramos que no sea undefined
          const lastSegment = segments[segments.length - 1];
          name = lastSegment !== undefined ? lastSegment : 'Sin nombre';
        } else {
          // Si no hay segmentos, usamos 'Raíz' como valor predeterminado
          name = 'Raíz';
        }
        
        return { path, name, count };
      });
    
    // Actualizar el estado directamente
    setFolders(folderData);
  }, []);
  
  // Inicialización de la aplicación y carga de datos
  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones de estado tras desmontaje
    
    const initializeApp = async () => {
      try {
        const docs = await listDocuments();
        
        // Verificamos que el componente sigue montado
        if (!isMounted) return;
        
        // Actualizamos documentos
        setDocuments(docs);
        
        // Procesamos datos de carpetas y actualizamos el estado
        const pathCountMap = new Map<string, number>();
        docs.forEach(doc => {
          const path = doc.path;
          pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
        });
        
        const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
          const segments = path.split('/').filter(Boolean);
          const name = segments.length > 0 ? 
            (segments[segments.length - 1] || 'Sin nombre') : 'Raíz';
          return { path, name, count };
        });
        
        // Actualizamos el estado de carpetas
        setFolders(folderData);
        
        // Indica que la aplicación está lista
        setIsAppReady(true);
      } catch (error) {
        console.error("Error initializing app data:", error);
        // Aun con error, marcamos como listo para mostrar la UI si seguimos montados
        if (isMounted) {
          setIsAppReady(true);
        }
      }
    };
    
    initializeApp();
    
    // Efecto de limpieza en caso de desmontaje
    return () => {
      isMounted = false;
    };
  }, [listDocuments]);
  // Manejadores de eventos optimizados con useCallback y debounce para memoización
  const handleDocumentSelect = useCallback(
    debounce(async (id: string) => {
      try {
        await setActiveDocument(id);
      } catch (error) {
        console.error(`Error selecting document ${id}:`, error);
      }
    }, 300),
    [setActiveDocument]
  );
  
  const handleCreateDocument = useCallback(async () => {
    setIsCreatingDocument(true);
    
    try {
      const newDocument = await createDocument(
        'Nuevo Documento',
        '# Nuevo Documento\n\nComienza a escribir aquí...',
        {
          wordCount: 7,
          readingTime: 1,
          format: 'markdown',
          sustainability: {
            optimizedSize: 45,
            originalSize: 45,
            contentReuseFactor: 1.0,
            editingEnergyUsage: 0,
            syncEnergyCost: 0
          }
        },
        '/'
      );
      
      if (newDocument) {
        // Actualiza lista de documentos y agrega el nuevo
        const updatedDocs = [newDocument, ...documents];
        setDocuments(updatedDocs);
        
        // Procesa y actualiza carpetas
        const pathCountMap = new Map<string, number>();
        updatedDocs.forEach(doc => {
          const path = doc.path;
          pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
        });
        
        const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
          const segments = path.split('/').filter(Boolean);
          const name = segments.length > 0 ? 
            (segments[segments.length - 1] || 'Sin nombre') : 'Raíz';
          return { path, name, count };
        });
        
        setFolders(folderData);
        
        // Selecciona automáticamente el nuevo documento
        await setActiveDocument(newDocument.id);
      }
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsCreatingDocument(false);
    }
  }, [createDocument, setActiveDocument, documents]);
  

  const handleImportFiles = useCallback(async () => {
    try {
      const importedDocs = await DocumentAPI.importFiles();
      if (importedDocs && importedDocs.length > 0) {
        // Refresca la lista de documentos
        const docs = await listDocuments();
        setDocuments(docs);
        
        // Procesa y actualiza carpetas
        const pathCountMap = new Map<string, number>();
        docs.forEach(doc => {
          const path = doc.path;
          pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
        });
        
        const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
          const segments = path.split('/').filter(Boolean);
          const name = segments.length > 0 ? 
            (segments[segments.length - 1] || 'Sin nombre') : 'Raíz';
          return { path, name, count };
        });
        
        setFolders(folderData);
      }
    } catch (error) {
      console.error("Error importing files:", error);
    }
  }, [DocumentAPI, listDocuments]);
  
  const handleImportFolder = useCallback(async () => {
    try {
      const result = await DocumentAPI.importFolder({
        recursive: true,
        preserveStructure: true
      });
      
      if (result && result.documents && result.documents.length > 0) {
        // Refresca la lista de documentos
        const docs = await listDocuments();
        setDocuments(docs);
        
        // Procesa y actualiza carpetas
        const pathCountMap = new Map<string, number>();
        docs.forEach(doc => {
          const path = doc.path;
          pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
        });
        
        // Incluir también carpetas nuevas
        if (result.folders) {
          result.folders.forEach(path => {
            if (!pathCountMap.has(path)) {
              pathCountMap.set(path, 0);
            }
          });
        }
        
        const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
          const segments = path.split('/').filter(Boolean);
          const name = segments.length > 0 ? 
            (segments[segments.length - 1] || 'Sin nombre') : 'Raíz';
          return { path, name, count };
        });
        
        setFolders(folderData);
      }
    } catch (error) {
      console.error("Error importing folder:", error);
    }
  }, [DocumentAPI, listDocuments]);
  
  const handleOpenFile = useCallback(async () => {
    try {
      await openFile();
      
      // Refresca la lista de documentos
      const docs = await listDocuments();
      setDocuments(docs);
      
      // Procesa y actualiza carpetas
      const pathCountMap = new Map<string, number>();
      docs.forEach(doc => {
        const path = doc.path;
        pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
      });
      
      const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
        const segments = path.split('/').filter(Boolean);
        const name = segments.length > 0 ? 
          (segments[segments.length - 1] || 'Sin nombre') : 'Raíz';
        return { path, name, count };
      });
      
      setFolders(folderData);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }, [openFile, listDocuments]);
  
  const handleOpenFolder = useCallback(async () => {
    try {
      const result = await openFolder();
      
      if (result && result.documents.length > 0) {
        // Refresca la lista de documentos
        const docs = await listDocuments();
        setDocuments(docs);
        
        // Procesa y actualiza carpetas
        const pathCountMap = new Map<string, number>();
        docs.forEach(doc => {
          const path = doc.path;
          pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
        });
        
        // Incluir también carpetas nuevas
        if (result.folders) {
          result.folders.forEach(path => {
            if (!pathCountMap.has(path)) {
              pathCountMap.set(path, 0);
            }
          });
        }
        
        const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
          const segments = path.split('/').filter(Boolean);
          const name = segments.length > 0 ? 
            (segments[segments.length - 1] || 'Sin nombre') : 'Raíz';
          return { path, name, count };
        });
        
        setFolders(folderData);
      }
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  }, [openFolder, listDocuments]);
  
  // Maneja el cambio de modo de energía - memoizado para evitar re-renderizados
  const handleSetEnergyMode = useCallback((mode: EnergyMode) => {
    setEnergyMode(mode);
  }, [setEnergyMode]);
  
  // Toggle para el asistente de IA
  const handleToggleAI = useCallback(() => {
    setShowAI(prev => !prev);
  }, []);
  
  // Toggle para colapsar/expandir el sidebar
  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);
  
  // Maneja cambio de modo de visualización
  const handleViewModeChange = useCallback((mode: 'edit' | 'view') => {
    setViewMode(mode);
  }, []);
  
  // Filtra documentos según término de búsqueda - memoizado para evitar recálculos innecesarios
  const filteredDocuments = React.useMemo(() => {
    if (!searchTerm) return documents;
    
    const term = searchTerm.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(term) ||
      doc.content.toLowerCase().includes(term) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }, [documents, searchTerm]);
  
// Componente memoizado del asistente de IA
const AIAssistantWidget = memo(({ 
  document, 
  energyMode, 
  onClose 
}: { 
  document: Document, 
  energyMode: EnergyMode, 
  onClose: () => void 
}) => {
  // Verificamos que tengamos todo lo necesario para renderizar
  if (!document?.id) return null;

  const uniqueKey = `ai-assistant-${document.id}-${Date.now()}`;
  
  return (
    <div className="fixed right-4 bottom-16 z-50 w-80 h-96 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out">
      <Suspense fallback={<LoadingFallback />}>
        <AIAssistant 
          key={uniqueKey}
          documentId={document.id}
          documentContent={document.content || ''}
          onClose={onClose}
          energyMode={energyMode}
          documentTitle={document.title || ''}
          editorContent={document.content || ''}
          cursorPosition={0}
          onSuggestionApply={(suggestion) => console.log('Sugerencia aplicada:', suggestion)}
          enabled={true}
        />
      </Suspense>
    </div>
  );
});

// Renderizador seguro del asistente de IA
const renderAIAssistant = useCallback(() => {
  // Verificación de seguridad: solo renderizamos si tenemos un documento activo
  if (!showAI || !currentDocument?.id) return null;
  
  return (
    <AIAssistantWidget 
      document={currentDocument} 
      energyMode={currentEnergyMode} 
      onClose={handleToggleAI} 
    />
  );
}, [showAI, currentDocument, currentEnergyMode, handleToggleAI]);
  // Renderiza la pantalla inicial de carga
  if (!isAppReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-16 h-16 mb-4 relative">
          <div className="absolute inset-0 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-transparent border-green-400 rounded-full animate-spin-reverse"></div>
        </div>
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Picura</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Iniciando editor sostenible...</p>
      </div>
    );
  }

  return (
    <div className="app-container h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Barra superior */}
      <header className="app-header flex items-center justify-between px-2 py-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={handleToggleSidebar}
            className="mr-3 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
            aria-label={sidebarCollapsed ? "Expandir navegación" : "Colapsar navegación"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-2 flex items-center">
            <span className="text-xs bg-gradient-to-r from-green-100 to-green-50 dark:from-green-800 dark:to-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                <span>Free</span>
              </div>
            </span>
          </div>
          
          {currentDocument && (
            <div className="ml-6 flex items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                {currentDocument.title}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {currentDocument && (
            <div className="flex space-x-1 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => handleViewModeChange('edit')}
              >
                Editar
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'view' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => handleViewModeChange('view')}
              >
                Visualizar
              </button>
            </div>
          )}
          
          <SustainabilityIndicator 
            mode={currentEnergyMode}
            onModeChange={handleSetEnergyMode}
            batteryLevel={sustainabilityMetrics?.battery?.level}
            isCharging={sustainabilityMetrics?.battery?.isCharging}
          />
          
          <button 
            onClick={handleToggleAI}
            className={`p-2 rounded-md transition-colors ${showAI ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'} hover:bg-purple-200 dark:hover:bg-purple-800`}
            aria-label="Asistente IA"
            title="Asistente IA"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Contenido principal */}
      <div className="app-content flex-grow flex overflow-hidden relative">
        {/* Barra de navegación lateral */}
        <div className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'}`}>
          {!sidebarCollapsed && (
            <NavigationSidebar
              currentDocument={currentDocument}
              documents={filteredDocuments}
              folders={folders}
              recentDocuments={recentDocuments}
              onDocumentSelect={handleDocumentSelect}
              onCreateDocument={handleCreateDocument}
              onImportFiles={handleImportFiles}
              onImportFolder={handleImportFolder}
              onOpenFile={handleOpenFile}
              onOpenFolder={handleOpenFolder}
              energyMode={currentEnergyMode}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </div>
        
        {/* Área de contenido principal */}
        <main className="flex-grow overflow-hidden">
          {currentDocument ? (
            viewMode === 'edit' ? (
              <ErrorBoundary>
                <Suspense fallback={<EditorLoadingFallback />}>
                  <EditorContainer
                    key={`editor-${currentDocument.id}`}
                    documentId={currentDocument.id}
                    initialContent={currentDocument.content}
                    readOnly={false}
                    showToolbar={true}
                    showStatusBar={true}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <Suspense fallback={<LoadingFallback />}>
                <DocumentViewer
                  documentId={currentDocument.id}
                  initialContent={currentDocument.content}
                  filename={currentDocument.path.split('/').pop()}
                  showToolbar={true}
                  showControls={true}
                  darkMode={darkMode}
                  onSwitchToEditor={() => setViewMode('edit')}
                />
              </Suspense>
            )
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <div className="text-center max-w-md p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
                <div className="mb-4 text-blue-500 flex justify-center">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Bienvenido a Picura</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Selecciona un documento existente o crea uno nuevo para comenzar a trabajar con este editor Markdown sostenible.</p>
                <div className="flex flex-col items-center gap-6 w-full max-w-md">
                  <button
                    onClick={handleCreateDocument}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    disabled={isCreatingDocument}
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      {isCreatingDocument ? 'Creando...' : 'Nuevo documento'}
                    </div>
                  </button>
                  
                  <div className="w-full">
                    <Suspense fallback={<div className="py-8 text-center text-gray-500">Cargando selector de archivos...</div>}>
                      <FileImport
                        onFilesLoaded={(docs: any) => {
                          if (docs && docs.length > 0 && docs[0]?.id) {
                            handleDocumentSelect(docs[0].id);
                          }
                        }}
                        onError={(err: any) => {
                          console.error('Error importing files:', err);
                        }}
                        enableFolders={true}
                        showPreview={false}
                        className="w-full"
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        
        {/* Asistente de IA flotante */}
        {showAI && currentDocument ? renderAIAssistant() : null}
      </div>
      
      {/* Pie de página */}
      <footer className="app-footer py-2 px-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center bg-white dark:bg-gray-900">
        <div>Picura - Editor sostenible • {new Date().getFullYear()}</div>
        <div className="flex items-center space-x-2">
          {sustainabilityMetrics?.estimatedEnergy && (
            <div className="flex items-center">
              <svg className="w-3.5 h-3.5 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Consumo: {Math.round(sustainabilityMetrics.estimatedEnergy.current)} mW</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;