import React, { useState } from 'react';

interface ToolbarProps {
  documentId?: string | undefined;
  documentTitle?: string | undefined;
  onSave: (isAutoSave?: boolean) => Promise<void>;
  isSaving: boolean;
  editorMode: 'basic' | 'standard' | 'advanced';
  onEditorModeChange: (mode: 'basic' | 'standard' | 'advanced') => void;
  readOnly: boolean;
  saveStatus: 'idle' | 'pending' | 'success' | 'error';
  documentSize?: 'small' | 'medium' | 'large' | 'very_large' | undefined;
}

/**
 * Barra de herramientas principal del editor con funcionalidades optimizadas
 * para eficiencia y sostenibilidad
 */
const Toolbar: React.FC<ToolbarProps> = ({
  documentId,
  documentTitle = 'Documento sin título',
  onSave,
  isSaving,
  editorMode,
  onEditorModeChange,
  readOnly,
  saveStatus,
  documentSize
}) => {
  const [showModeSelector, setShowModeSelector] = useState(false);
  
  return (
    <div className="editor-toolbar flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Título del documento */}
      <div className="document-title flex-grow max-w-md truncate text-gray-800 dark:text-gray-200 font-medium">
        {documentTitle || 'Documento sin título'}
        {documentId && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{documentId.substring(0, 8)}</span>}
        {documentSize && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {documentSize === 'very_large' ? 'Documento muy grande' :
             documentSize === 'large' ? 'Documento grande' :
             documentSize === 'medium' ? 'Documento mediano' : ''}
          </span>
        )}
      </div>
      
      {/* Acciones centrales */}
      <div className="flex space-x-2 mx-4">
        {/* Selector de modo de edición */}
        <div className="relative">
          <button 
            className="px-3 py-1 rounded text-sm bg-blue-500 text-white flex items-center"
            onClick={() => setShowModeSelector(!showModeSelector)}
          >
            <span>Modo: {editorMode.charAt(0).toUpperCase() + editorMode.slice(1)}</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showModeSelector && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
              <ul>
                <li 
                  className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${editorMode === 'basic' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  onClick={() => {
                    onEditorModeChange('basic');
                    setShowModeSelector(false);
                  }}
                >
                  <div className="font-medium">Básico</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Editor simplificado para principiantes</div>
                </li>
                <li 
                  className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${editorMode === 'standard' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  onClick={() => {
                    onEditorModeChange('standard');
                    setShowModeSelector(false);
                  }}
                >
                  <div className="font-medium">Estándar</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Editor balanceado para la mayoría de usuarios</div>
                </li>
                <li 
                  className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${editorMode === 'advanced' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                  onClick={() => {
                    onEditorModeChange('advanced');
                    setShowModeSelector(false);
                  }}
                >
                  <div className="font-medium">Avanzado</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Funcionalidades adicionales para expertos</div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Acciones de documento */}
      <div className="flex space-x-2">
        <button
          onClick={() => onSave()}
          disabled={readOnly || isSaving}
          className={`px-3 py-1 rounded text-sm ${
            saveStatus === 'success' ? 'bg-green-600' :
            saveStatus === 'error' ? 'bg-red-500' :
            saveStatus === 'pending' ? 'bg-yellow-500' :
            'bg-green-500 hover:bg-green-600'
          } text-white disabled:opacity-50 flex items-center`}
        >
          {isSaving || saveStatus === 'pending' ? (
            <>
              <span className="flex h-4 w-4 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              Guardando
            </>
          ) : saveStatus === 'success' ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Guardado
            </>
          ) : saveStatus === 'error' ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Error
            </>
          ) : (
            'Guardar'
          )}
        </button>
        
        <button
          className="px-3 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Exportar
        </button>
        
        <div className="relative group">
          <button className="px-2 py-1 rounded text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          <div className="absolute right-0 mt-1 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
            <ul className="py-1">
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                Compartir
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                Propiedades
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400">
                Eliminar
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;