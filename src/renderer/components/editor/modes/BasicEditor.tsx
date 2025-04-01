import React, { useState, useEffect, useRef } from 'react';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';

interface BasicEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  onSave: () => void;
  onSelectionChange: (stats: { characters: number; words: number; lines: number }) => void;
  readOnly: boolean;
  energyMode: EnergyMode;
  fontSize: number;
  fontFamily: string;
  lineNumbers: boolean;
  tabSize: number;
}

/**
 * Editor básico optimizado para usuarios no técnicos
 * Ofrece experiencia WYSIWYG simplificada con sostenibilidad
 */
const BasicEditor: React.FC<BasicEditorProps> = ({
  content,
  onChange,
  onSave,
  readOnly,
  fontSize,
  fontFamily,
  tabSize
}) => {
  // Referencias DOM
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Estado
  const [editMode, setEditMode] = useState<'edit' | 'preview'>('edit');
  const [renderedContent, setRenderedContent] = useState('');
  
  // Renderiza el contenido markdown a HTML con optimizaciones
  useEffect(() => {
    // Si estamos en modo edición, salimos temprano para ahorrar recursos
    if (editMode === 'edit') return;
    
    let isMounted = true;
    
    const renderMarkdown = () => {
      if (!isMounted) return;
      
      // Renderizamos inmediatamente para mejor UX
      try {
        // Versión optimizada con mejor rendimiento
        // Escapamos caracteres HTML para evitar inyección
        const safeText = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
          
        // Aplicamos optimizaciones en lotes para mejor rendimiento
        const rendered = safeText
          // Encabezados
          .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
          .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
          .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
          // Formato de texto
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          // Enlaces
          .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
          // Listas
          .replace(/^\* (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
          .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
          // Párrafos
          .replace(/\n\n/g, '</p><p class="my-3">');
        
        // Contenedor
        const wrappedContent = '<div class="markdown-content"><p class="my-3">' + rendered + '</p></div>';
        
        if (isMounted) {
          setRenderedContent(wrappedContent);
        }
      } catch (error) {
        console.error('Error rendering markdown:', error);
        if (isMounted) {
          // Fallback seguro
          setRenderedContent(`<div class="p-4 text-gray-800">${content}</div>`);
        }
      }
    };
    
    // Uso de requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(renderMarkdown);
    
    return () => {
      isMounted = false;
    };
  }, [content, editMode]);
  
  // Maneja cambios en el contenido
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Actualiza estadísticas de selección
    // En modo básico no enviamos información de selección para optimizar
  };
  
  // Maneja atajos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Guarda con Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
    }
    
    // Soporta tabulaciones
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const spaces = ' '.repeat(tabSize);
      const value = target.value;
      
      onChange(
        value.substring(0, start) + spaces + value.substring(end)
      );
      
      // Restablece la posición del cursor
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + tabSize;
      }, 0);
    }
  };
  
  // Memoizamos los botones de la barra de herramientas
  const EditorToolbar = React.memo(() => (
    <div className="editor-toolbar flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex space-x-2">
        <button
          onClick={() => setEditMode('edit')}
          className={`px-3 py-1 rounded text-sm ${editMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          aria-label="Modo edición"
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </div>
        </button>
        <button
          onClick={() => setEditMode('preview')}
          className={`px-3 py-1 rounded text-sm ${editMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          aria-label="Vista previa"
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Vista previa
          </div>
        </button>
      </div>
      
      <div className="flex-grow" />
      
      <button
        onClick={onSave}
        disabled={readOnly}
        className="flex items-center px-3 py-1 rounded text-sm bg-green-500 text-white disabled:opacity-50"
        aria-label="Guardar documento"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Guardar
      </button>
    </div>
  ));
  
  // Componente de edición optimizado
  const Editor = React.memo(() => (
    <textarea
      ref={editorRef as unknown as React.RefObject<HTMLTextAreaElement>}
      value={content}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      className="w-full h-full p-4 focus:outline-none font-mono dark:bg-gray-900 dark:text-gray-100"
      style={{ 
        fontSize: `${fontSize}px`,
        fontFamily,
        lineHeight: '1.6',
        resize: 'none',
        tabSize: `${tabSize}`,
        caretColor: 'blue' // Mejor visibilidad del cursor
      }}
      placeholder="Escribe tu documento aquí..."
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      data-gramm="false" // Deshabilita herramientas como Grammarly para mejor rendimiento
    />
  ));
  
  // Componente de vista previa optimizado con transición suave y carga forzada
  const Preview = React.memo(() => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [forceShow, setForceShow] = React.useState(false);
    
    React.useEffect(() => {
      // Simular tiempo mínimo de carga para evitar parpadeo
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      // Timeout de seguridad para forzar visualización aunque el contenido no esté listo
      const forceTimer = setTimeout(() => {
        setForceShow(true);
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(forceTimer);
      };
    }, [renderedContent]);
    
    return (
      <div 
        ref={previewRef}
        className="markdown-preview w-full h-full p-4 overflow-auto dark:bg-gray-900 dark:text-gray-100 relative"
        style={{ fontSize: `${fontSize}px`, fontFamily }}
      >
        {/* Skeleton placeholder mientras carga */}
        {(isLoading || !renderedContent) && !forceShow && (
          <div className="absolute inset-0 p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          </div>
        )}
        
        {/* Contenido renderizado con fade-in */}
        <div 
          className={`transition-opacity duration-300 ${isLoading && !forceShow ? 'opacity-0' : 'opacity-100'}`}
          dangerouslySetInnerHTML={{ __html: renderedContent || '<p class="text-gray-400 dark:text-gray-500">La vista previa aparecerá aquí...</p>' }}
        />
      </div>
    );
  });
  
  return (
    <div className="basic-editor h-full flex flex-col">
      <EditorToolbar />
      
      <div className="editor-content-wrapper flex-grow overflow-auto">
        {editMode === 'edit' ? <Editor /> : <Preview />}
      </div>
    </div>
  );
};

export default BasicEditor;