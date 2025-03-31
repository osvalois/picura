import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { SustainabilityProvider, useSustainabilityContext } from '../contexts/SustainabilityContext';
import { DocumentProvider, useDocumentContext } from '../contexts/DocumentContext';
import NavigationSidebar from './navigation/NavigationSidebar';
import SustainabilityIndicator from './common/SustainabilityIndicator';
import { EnergyMode } from '../../shared/types/SustainabilityMetrics';
import { Document } from '../../shared/types/Document';
import { DocumentAPI } from '../utils/ipcAPI';

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
    openSpecificFile,
    setActiveDocument,
    isLoading: documentLoading 
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
  
  // Inicialización de la aplicación y carga de datos
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const docs = await listDocuments();
        setDocuments(docs);
        
        // Analiza carpetas de documentos de forma optimizada
        const pathCountMap = new Map<string, number>();
        docs.forEach(doc => {
          const path = doc.path;
          pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
        });
        
        const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
          const segments = path.split('/').filter(Boolean);
          const name = segments.length > 0 ? segments[segments.length - 1] : 'Raíz';
          return { path, name, count };
        });
        
        setFolders(folderData);
        
        // Indica que la aplicación está lista
        setIsAppReady(true);
      } catch (error) {
        console.error("Error initializing app data:", error);
        // Aun con error, marcamos como listo para mostrar la UI
        setIsAppReady(true);
      }
    };
    
    initializeApp();
    
    // Efecto de limpieza en caso de desmontaje
    return () => {
      // Limpieza si es necesario
    };
  }, [listDocuments]);
  
  // Manejadores de eventos optimizados con useCallback para memoización
  const handleDocumentSelect = useCallback(async (id: string) => {
    try {
      await setActiveDocument(id);
    } catch (error) {
      console.error(`Error selecting document ${id}:`, error);
    }
  }, [setActiveDocument]);
  
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
        // Actualiza lista de documentos
        setDocuments(prev => [newDocument, ...prev]);
        
        // Actualiza contador de carpetas de forma eficiente
        setFolders(prev => {
          const rootFolder = prev.find(f => f.path === '/');
          if (rootFolder) {
            return prev.map(f => 
              f.path === '/' ? { ...f, count: f.count + 1 } : f
            );
          } else {
            return [...prev, { path: '/', name: 'Raíz', count: 1 }];
          }
        });
        
        // Selecciona automáticamente el nuevo documento
        await setActiveDocument(newDocument.id);
      }
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsCreatingDocument(false);
    }
  }, [createDocument, setActiveDocument]);
  
  // Función auxiliar memoizada para actualizar carpetas
  const updateFolders = useCallback((docs: Document[], newFolders: string[] = []) => {
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
    
    const folderData = Array.from(pathCountMap.entries()).map(([path, count]) => {
      const segments = path.split('/').filter(Boolean);
      const name = segments.length > 0 ? segments[segments.length - 1] : 'Raíz';
      return { path, name, count };
    });
    
    setFolders(folderData);
  }, []);
  
  const handleImportFiles = useCallback(async () => {
    try {
      const importedDocs = await DocumentAPI.importFiles();
      if (importedDocs && importedDocs.length > 0) {
        // Refresca la lista de documentos
        const docs = await listDocuments();
        setDocuments(docs);
        
        // Actualiza carpetas
        updateFolders(docs);
      }
    } catch (error) {
      console.error("Error importing files:", error);
    }
  }, [DocumentAPI, listDocuments, updateFolders]);
  
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
        
        // Actualiza carpetas
        updateFolders(docs, result.folders);
      }
    } catch (error) {
      console.error("Error importing folder:", error);
    }
  }, [DocumentAPI, listDocuments, updateFolders]);
  
  const handleOpenFile = useCallback(async () => {
    try {
      await openFile();
      
      // Refresca la lista de documentos
      const docs = await listDocuments();
      setDocuments(docs);
      
      // Actualiza carpetas
      updateFolders(docs);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  }, [openFile, listDocuments, updateFolders]);
  
  const handleOpenFolder = useCallback(async () => {
    try {
      const result = await openFolder();
      
      if (result && result.documents.length > 0) {
        // Refresca la lista de documentos
        const docs = await listDocuments();
        setDocuments(docs);
        
        // Actualiza carpetas
        updateFolders(docs, result.folders);
      }
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  }, [openFolder, listDocuments, updateFolders]);
  
  // Maneja el cambio de modo de energía - memoizado para evitar re-renderizados
  const handleSetEnergyMode = useCallback((mode: string) => {
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
  
  // Detecta si la app está cargando
  const isLoading = documentLoading || !isAppReady;

  // Renderizado condicional para mostrar el asistente de IA
  const renderAIAssistant = useCallback(() => {
    if (!showAI) return null;
    
    return (
      <div className="fixed right-4 bottom-16 z-50 w-80 h-96 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out">
        <Suspense fallback={<LoadingFallback />}>
          <AIAssistant 
            documentId={currentDocument?.id}
            content={currentDocument?.content || ''}
            onClose={handleToggleAI}
            energyMode={currentEnergyMode}
          />
        </Suspense>
      </div>
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
      <header className="app-header flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
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
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">Picura</h1>
          <div className="ml-2 flex items-center">
            <span className="text-xs bg-gradient-to-r from-green-100 to-green-50 dark:from-green-800 dark:to-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                <span>Sostenible</span>
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
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-300">Cargando contenido...</p>
              </div>
            </div>
          ) : currentDocument ? (
            <Suspense fallback={<LoadingFallback />}>
              {viewMode === 'edit' ? (
                <EditorContainer
                  documentId={currentDocument.id}
                  initialContent={currentDocument.content}
                  readOnly={false}
                  showToolbar={true}
                  showStatusBar={true}
                />
              ) : (
                <DocumentViewer
                  document={currentDocument}
                  energyMode={currentEnergyMode}
                  renderOptions={{
                    showMetadata: true,
                    showOutline: true,
                    fontSize: 16,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                  }}
                />
              )}
            </Suspense>
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
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleCreateDocument}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    disabled={isCreatingDocument}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      {isCreatingDocument ? 'Creando...' : 'Nuevo documento'}
                    </div>
                  </button>
                  <button
                    onClick={handleOpenFile}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                      Abrir archivo
                    </div>
                  </button>
                  <button
                    onClick={handleOpenFolder}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      Abrir carpeta
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
        
        {/* Asistente de IA flotante */}
        {renderAIAssistant()}
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