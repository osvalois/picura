import React, { useState, useEffect } from 'react';
import { Document } from '../../../shared/types/Document';
import { EnergyMode } from '../../../shared/types/SustainabilityMetrics';

interface NavigationSidebarProps {
  currentDocument?: Document | null;
  documents: Document[];
  folders: { path: string; name: string; count: number }[];
  recentDocuments: Document[];
  onDocumentSelect: (id: string) => void;
  onCreateDocument: () => void;
  onImportFiles: () => void;
  onImportFolder: () => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  energyMode: EnergyMode;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

/**
 * Barra lateral de navegación con optimizaciones para sostenibilidad
 */
const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentDocument,
  documents,
  folders,
  recentDocuments,
  onDocumentSelect,
  onCreateDocument,
  onImportFiles,
  onImportFolder,
  onOpenFile,
  onOpenFolder,
  energyMode,
  searchTerm,
  onSearchChange
}) => {
  // Estado local
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'folders'>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Optimizaciones según modo de energía
  const isLowPowerMode = energyMode === 'lowPower' || energyMode === 'ultraSaving';
  
  // Ajusta la vista inicial según el modo de energía
  useEffect(() => {
    // En modo de bajo consumo, muestra solo recientes por defecto
    if (isLowPowerMode && activeTab === 'all') {
      setActiveTab('recent');
    }
  }, [energyMode, isLowPowerMode, activeTab]);
  
  // Función para alternar expansión de carpetas
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };
  
  // Filtra documentos según búsqueda
  const filteredDocuments = searchTerm.trim() === '' 
    ? documents 
    : documents.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
  
  // Renderiza los documentos en una carpeta con diseño mejorado
  const renderFolderDocuments = (folderPath: string) => {
    // Solo renderiza si la carpeta está expandida
    if (!expandedFolders.has(folderPath)) return null;
    
    const folderDocs = filteredDocuments.filter(doc => doc.path === folderPath);
    
    return (
      <div className="ml-5 mt-1 space-y-1 pl-2 border-l border-gray-200 dark:border-gray-700">
        {folderDocs.map(doc => (
          <div 
            key={doc.id}
            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
              currentDocument?.id === doc.id 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-transparent'
            }`}
            onClick={() => onDocumentSelect(doc.id)}
          >
            <div className="shrink-0 w-5 h-5 mr-2">
              <svg className={`w-full h-full ${
                currentDocument?.id === doc.id 
                  ? 'text-blue-500 dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="truncate text-sm font-medium">{doc.title}</span>
          </div>
        ))}
        
        {folderDocs.length === 0 && (
          <div className="py-3 px-2 flex flex-col items-center justify-center text-center">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No hay documentos en esta carpeta
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Estado para mostrar/ocultar el menú de acción
  const [showActionMenu, setShowActionMenu] = useState(false);

  return (
    <div className="navigation-sidebar w-64 h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Cabecera con nueva barra superior */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        {/* Título y botón de acciones principal */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">Documentos</h2>
          </div>
          
          <div className="relative">
            <button 
              className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30 transition-colors flex items-center justify-center shadow-sm"
              onClick={() => setShowActionMenu(!showActionMenu)}
              title="Acciones"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            
            {/* Menú desplegable de acciones */}
            {showActionMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1 rounded-md bg-white dark:bg-gray-800 shadow-xs" role="menu" aria-orientation="vertical">
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    onClick={onCreateDocument}
                    role="menuitem"
                  >
                    <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Nuevo documento
                  </button>
                  
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    onClick={onOpenFile}
                    role="menuitem"
                  >
                    <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                    Abrir archivo
                  </button>
                  
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    onClick={onOpenFolder}
                    role="menuitem"
                  >
                    <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Abrir carpeta
                  </button>
                  
                  <hr className="border-gray-200 dark:border-gray-700 my-1" />
                  
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    onClick={onImportFiles}
                    role="menuitem"
                  >
                    <svg className="w-5 h-5 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Importar archivos
                  </button>
                  
                  <button
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    onClick={onImportFolder}
                    role="menuitem"
                  >
                    <svg className="w-5 h-5 mr-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9" />
                    </svg>
                    Importar carpeta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Barra flotante de acciones rápidas */}
        <div className="px-4 pb-4 flex items-center space-x-2">
          <button
            className="flex-1 p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400 transition-colors shadow-sm"
            onClick={onCreateDocument}
            title="Nuevo documento"
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="ml-1 text-xs font-medium">Nuevo</span>
            </div>
          </button>
          
          <button
            className="flex-1 p-2 rounded-md bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-800/30 text-green-600 dark:text-green-400 transition-colors shadow-sm"
            onClick={onOpenFile}
            title="Abrir archivo"
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              <span className="ml-1 text-xs font-medium">Abrir</span>
            </div>
          </button>
          
          <button
            className="flex-1 p-2 rounded-md bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30 text-purple-600 dark:text-purple-400 transition-colors shadow-sm"
            onClick={onOpenFolder}
            title="Abrir carpeta"
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="ml-1 text-xs font-medium">Carpeta</span>
            </div>
          </button>
        </div>
        
        {/* Barra de búsqueda rediseñada */}
        <div className="px-4 pb-4">
          <div className={`flex items-center bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 ${isSearchFocused ? 'ring-2 ring-blue-500 border-transparent' : ''} transition-all`}>
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar documentos..."
              className="bg-transparent w-full ml-2 outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <button 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => onSearchChange('')}
                title="Limpiar búsqueda"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Pestañas de navegación rediseñadas */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-1">
        <button
          className={`flex-1 py-2.5 text-sm font-medium rounded-t-md transition-colors ${
            activeTab === 'all' 
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Todos
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-medium rounded-t-md transition-colors ${
            activeTab === 'recent' 
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
          onClick={() => setActiveTab('recent')}
        >
          Recientes
        </button>
        <button
          className={`flex-1 py-2.5 text-sm font-medium rounded-t-md transition-colors ${
            activeTab === 'folders' 
              ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
          }`}
          onClick={() => setActiveTab('folders')}
        >
          Carpetas
        </button>
      </div>
      
      {/* Contenido principal - optimizado según pestaña activa */}
      <div className="flex-grow overflow-y-auto px-3 py-4">
        {/* Vista de todos los documentos */}
        {activeTab === 'all' && (
          <div className="space-y-2">
            {searchTerm && (
              <div className="flex items-center px-2 py-1.5 mb-2 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {filteredDocuments.length} resultado{filteredDocuments.length !== 1 ? 's' : ''} para "{searchTerm}"
              </div>
            )}
            
            {filteredDocuments.map(doc => (
              <div 
                key={doc.id}
                className={`flex items-center p-2.5 rounded-md cursor-pointer transition-all duration-150 ${
                  currentDocument?.id === doc.id 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 shadow-sm' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                }`}
                onClick={() => onDocumentSelect(doc.id)}
              >
                <div className="shrink-0 w-8 h-8 mr-3 flex items-center justify-center rounded-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <svg className={`w-4 h-4 ${
                    currentDocument?.id === doc.id 
                      ? 'text-blue-500 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-grow min-w-0">
                  <div className={`text-sm font-medium truncate ${
                    currentDocument?.id === doc.id 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {doc.title}
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    <svg className="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {doc.path === '/' ? 'Raíz' : doc.path}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {searchTerm ? 'No se encontraron documentos' : 'No hay documentos'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  {searchTerm 
                    ? 'Prueba con otros términos de búsqueda o crea un nuevo documento.' 
                    : 'Crea un nuevo documento o importa archivos existentes para comenzar.'}
                </p>
                {searchTerm ? (
                  <button 
                    className="mt-4 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                    onClick={() => onSearchChange('')}
                  >
                    Limpiar búsqueda
                  </button>
                ) : (
                  <button 
                    className="mt-4 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                    onClick={onCreateDocument}
                  >
                    Crear documento
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Vista de documentos recientes */}
        {activeTab === 'recent' && (
          <div className="space-y-2">
            {recentDocuments.length > 0 ? (
              <>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium pl-2 mb-1">
                  Modificados recientemente
                </h3>
                {recentDocuments.map(doc => (
                  <div 
                    key={doc.id}
                    className={`flex items-center p-2.5 rounded-md cursor-pointer transition-all duration-150 ${
                      currentDocument?.id === doc.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 shadow-sm' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent'
                    }`}
                    onClick={() => onDocumentSelect(doc.id)}
                  >
                    <div className="shrink-0 w-8 h-8 mr-3 flex items-center justify-center rounded-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <svg className={`w-4 h-4 ${
                        currentDocument?.id === doc.id 
                          ? 'text-blue-500 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        currentDocument?.id === doc.id 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {doc.title}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        <svg className="w-3 h-3 mr-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  No hay documentos recientes
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Los documentos que abras o edites aparecerán aquí para un acceso rápido.
                </p>
                <button 
                  className="mt-4 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  onClick={onCreateDocument}
                >
                  Crear documento
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Vista de carpetas */}
        {activeTab === 'folders' && (
          <div className="space-y-2">
            {/* Encabezado para folders */}
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium pl-2 mb-1">
              Organización
            </h3>
            
            {/* Raíz */}
            <div>
              <div 
                className={`flex items-center p-2.5 rounded-md cursor-pointer transition-colors ${
                  expandedFolders.has('/') 
                    ? 'bg-blue-50/80 dark:bg-blue-900/10' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => toggleFolder('/')}
              >
                <div className={`w-5 h-5 mr-2 flex items-center justify-center transition-transform duration-200 ${expandedFolders.has('/') ? 'rotate-90' : ''}`}>
                  <svg 
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 flex items-center justify-center mr-2">
                  <svg className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">Raíz</span>
                
                <div className="ml-auto px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {filteredDocuments.filter(doc => doc.path === '/').length}
                </div>
              </div>
              {renderFolderDocuments('/')}
            </div>
            
            {/* Otras carpetas */}
            {folders
              .filter(folder => folder.path !== '/')
              .map(folder => (
                <div key={folder.path}>
                  <div 
                    className={`flex items-center p-2.5 rounded-md cursor-pointer transition-colors ${
                      expandedFolders.has(folder.path) 
                        ? 'bg-blue-50/80 dark:bg-blue-900/10' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => toggleFolder(folder.path)}
                  >
                    <div className={`w-5 h-5 mr-2 flex items-center justify-center transition-transform duration-200 ${expandedFolders.has(folder.path) ? 'rotate-90' : ''}`}>
                      <svg 
                        className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center mr-2">
                      <svg className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    
                    <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{folder.name}</span>
                    
                    <div className="ml-auto px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {filteredDocuments.filter(doc => doc.path === folder.path).length}
                    </div>
                  </div>
                  {renderFolderDocuments(folder.path)}
                </div>
              ))}
            
            {folders.length <= 1 && (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sin estructura de carpetas
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  Organiza tus documentos en carpetas para mantener tu trabajo bien estructurado.
                </p>
                <button 
                  className="mt-4 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  onClick={onOpenFolder}
                >
                  Abrir carpeta
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Información de sostenibilidad mejorada */}
      <div className="py-3 px-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            energyMode === 'highPerformance' ? 'bg-orange-500' : 
            energyMode === 'standard' ? 'bg-blue-500' : 
            energyMode === 'lowPower' ? 'bg-green-500' : 'bg-green-700'
          }`}></div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {energyMode === 'highPerformance' ? 'Alto rendimiento' : 
                 energyMode === 'standard' ? 'Estándar' : 
                 energyMode === 'lowPower' ? 'Ahorro de energía' : 
                 'Ultra ahorro'}
              </span>
              
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Picura MD
              </span>
            </div>
            
            <div className="mt-1 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-500 ${
                energyMode === 'highPerformance' ? 'bg-orange-500 w-[95%]' : 
                energyMode === 'standard' ? 'bg-blue-500 w-[75%]' : 
                energyMode === 'lowPower' ? 'bg-green-500 w-[50%]' : 'bg-green-700 w-[25%]'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationSidebar;