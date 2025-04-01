import React, { useState, useEffect, useRef } from 'react';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';
import { debounce } from '../../../utils/performanceUtils';

interface StandardEditorProps {
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
 * Editor estándar con balance entre facilidad de uso y funcionalidades avanzadas
 * Optimizado para escritores con consideraciones de sostenibilidad
 */
const StandardEditor: React.FC<StandardEditorProps> = ({
  content,
  onChange,
  onSave,
  onSelectionChange,
  readOnly,
  energyMode,
  fontSize,
  fontFamily,
  lineNumbers,
  tabSize
}) => {
  // Referencias DOM
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Estado
  const [editMode, setEditMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [renderedContent, setRenderedContent] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  
  // Optimizaciones para sostenibilidad
  const isHighPerformanceMode = energyMode === 'highPerformance';
  const isLowPowerMode = energyMode === 'lowPower' || energyMode === 'ultraSaving';
  
  // Renderiza previsualización con optimizaciones agresivas para fluidez
  useEffect(() => {
    // Optimización: Mostramos el editor de forma inmediata sin previsualización
    // Solo renderizamos previsualización cuando es necesario
    if (editMode === 'edit') {
      return; // No renderiza en modo edición para máxima fluidez
    }
    
    let isMounted = true; // Para prevenir actualización de estado en componentes desmontados
    const contentLength = content.length;
    
    // Método para renderizado inmediato y progresivo optimizado
    const renderMarkdownChunked = async () => {
      // Usamos una estrategia de renderizado inmediato para mejor UX
      try {
        // IMPORTANTE: Primero mostramos el contenido crudo para tener algo inmediato
        if (isMounted && contentLength > 50000) {
          // Para documentos grandes, mostramos contenido sin procesar inicialmente
          setRenderedContent(`<pre class="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">${content.substring(0, 5000)}...</pre>
            <div class="text-gray-500 flex items-center justify-center py-2 my-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
              <svg class="animate-spin mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Formato en proceso...
            </div>`);
        }
        
        // Usamos web worker para documentos grandes si está disponible
        if (window.Worker && contentLength > 200000) {
          // Simulamos worker para este MVP - en implementación real usaríamos un worker real
          setTimeout(() => {
            if (isMounted) {
              const rendered = renderMarkdownOptimized(content);
              setRenderedContent(rendered);
            }
          }, 50);
        } else {
          // Para renderizado inmediato priorizamos velocidad sobre precisión
          // Usamos requestAnimationFrame para asegurar que se ejecuta después del paint
          requestAnimationFrame(() => {
            if (isMounted) {
              // Para documentos pequeños y medianos, renderizamos todo de una vez
              if (contentLength < 100000 || isHighPerformanceMode) {
                const rendered = renderMarkdownOptimized(content);
                setRenderedContent(rendered);
              } else {
                // Para documentos grandes, usamos renderizado por chunks pero más agresivo
                renderInChunks(content, contentLength > 500000 ? 5 : 3);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error rendering markdown:', error);
        // Fallback a renderizado simple en caso de error
        if (isMounted) {
          setRenderedContent(`<pre class="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">${content}</pre>
            <div class="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-2 mt-4 rounded-md text-sm">
              Error al renderizar vista previa
            </div>`);
        }
      }
    };
    
    // Nueva función de renderizado optimizada con mejor rendimiento
    const renderMarkdownOptimized = (text: string): string => {
      // Optimizamos primero agrupando transformaciones similares
      
      // Escapamos caracteres HTML para evitar inyección
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // Procesamos en lotes para mejor rendimiento
      
      // 1. Procesamos bloques especiales primero (código, tablas)
      text = text
        // Bloques de código
        .replace(/```(?:(\w+)\n)?([\s\S]*?)```/g, (_, lang, code) => 
          `<div class="code-block"><pre class="rounded-md bg-gray-100 dark:bg-gray-800 p-4 my-4 overflow-x-auto"><code class="${lang ? `language-${lang}` : ''}">${code.trim()}</code></pre></div>`
        )
        // Tablas (procesamiento simplificado para mejor rendimiento)
        .replace(/^\|(.+)\|$/gm, (match) => {
          if (match.includes('|')) {
            return `<div class="table-block"><div class="overflow-x-auto my-4"><table class="w-full border-collapse">${match}</table></div></div>`;
          }
          return match;
        });
      
      // 2. Procesamos encabezados (patrones más frecuentes primero)
      text = text
        .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold my-4">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold my-5">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold my-6 pb-2 border-b border-gray-200 dark:border-gray-700">$1</h1>')
        .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold my-3">$1</h4>')
        .replace(/^##### (.+)$/gm, '<h5 class="text-base font-bold my-2">$1</h5>')
        .replace(/^###### (.+)$/gm, '<h6 class="text-sm font-bold my-2">$1</h6>');
      
      // 3. Procesamos formato de texto (optimizado)
      text = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/~~(.+?)~~/g, '<del class="line-through">$1</del>')
        .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-pink-600 dark:text-pink-400 text-sm font-mono">$1</code>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
      
      // 4. Procesamos listas (optimizado)
      text = text
        .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/^\* (.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
        .replace(/^\d+\. (.+)$/gm, '<li class="ml-5 list-decimal">$1</li>')
        .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-start my-2 ml-5"><input type="checkbox" class="mt-1 mr-2" disabled /><span>$1</span></div>')
        .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-start my-2 ml-5"><input type="checkbox" class="mt-1 mr-2" checked disabled /><span class="line-through">$1</span></div>');
      
      // 5. Procesamos elementos restantes
      text = text
        .replace(/^> (.+)$/gm, '<blockquote class="pl-4 border-l-4 border-gray-300 dark:border-gray-600 italic my-4">$1</blockquote>')
        .replace(/^---$/gm, '<hr class="my-6 border-t border-gray-200 dark:border-gray-700" />')
        .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" loading="lazy" />');
      
      // 6. Procesamos párrafos (última operación)
      text = '<p class="my-4">' + text.replace(/\n\n/g, '</p><p class="my-4">') + '</p>';
      
      // 7. Clase contenedora para estilos consistentes
      return `<div class="markdown-content text-gray-800 dark:text-gray-200">${text}</div>`;
    };
    
    // Renderizado en chunks optimizado para fluidez
    const renderInChunks = (text: string, numberOfChunks: number) => {
      const chunkSize = Math.ceil(text.length / numberOfChunks);
      
      // Realiza primer renderizado inmediato para feedback visual rápido
      const firstChunk = text.substring(0, chunkSize);
      const initialRendered = renderMarkdownOptimized(firstChunk);
      setRenderedContent(initialRendered + 
        `<div class="loading-indicator flex items-center justify-center py-2 my-2 text-gray-500">
          <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando más contenido...
        </div>`);
      
      // Programa render completo para el siguiente frame
      requestAnimationFrame(() => {
        if (!isMounted) return;
        // Renderiza todo el contenido de una vez
        const fullRendered = renderMarkdownOptimized(text);
        setRenderedContent(fullRendered);
      });
    };
    
    // Renderizado inmediato para mejor UX
    renderMarkdownChunked();
    
    // Limpieza cuando el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [content, editMode, isLowPowerMode, isHighPerformanceMode]);
  
  // Actualiza estadísticas de selección con debounce para optimizar rendimiento
  const updateSelectionStats = debounce(() => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const selectedText = textarea.value.substring(
      textarea.selectionStart, textarea.selectionEnd
    );
    
    if (selectedText) {
      const characters = selectedText.length;
      const words = selectedText.trim().split(/\s+/).filter(Boolean).length;
      const lines = selectedText.split(/\n/).length;
      
      onSelectionChange({ characters, words, lines });
    } else {
      onSelectionChange({ characters: 0, words: 0, lines: 0 });
    }
  }, isLowPowerMode ? 500 : 200);
  
  // Maneja cambios en el contenido
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Solo procesa sugerencias en modos de rendimiento y estándar
    if (!isLowPowerMode) {
      processSuggestions(e.target.value, e.target.selectionStart);
    }
  };
  
  // Procesa sugerencias basadas en el contexto
  const processSuggestions = (text: string, position: number) => {
    // En una implementación real, usaríamos análisis más sofisticado
    // Para MVP, ofrece sugerencias básicas de Markdown
    
    // Encuentra última palabra antes del cursor
    const textBeforeCursor = text.substring(0, position);
    const lastWord = textBeforeCursor.split(/\s/).pop() || '';
    
    // Sugerencias contextuales simples
    if (lastWord === '#') {
      setSuggestions(['# Título', '## Subtítulo', '### Sección']);
      setShowSuggestions(true);
    } else if (lastWord === '-') {
      setSuggestions(['- Elemento de lista', '- [ ] Tarea pendiente']);
      setShowSuggestions(true);
    } else if (lastWord === '[') {
      setSuggestions(['[texto](url)']);
      setShowSuggestions(true);
    } else if (lastWord.startsWith('```')) {
      setSuggestions(['```javascript', '```typescript', '```python', '```html']);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  // Maneja atajos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Guarda con Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }
    
    // Maneja sugerencias si están visibles
    if (showSuggestions && (e.key === 'Tab' || e.key === 'Enter')) {
      e.preventDefault();
      if (suggestions.length > 0) {
        // Aplica primera sugerencia
        const textarea = editorRef.current;
        if (textarea) {
          const pos = textarea.selectionStart;
          const textBefore = textarea.value.substring(0, pos);
          const lastWord = textBefore.split(/\s/).pop() || '';
          const replacement = suggestions[0];
          
          // Reemplaza la palabra actual con la sugerencia
          const newValue = textBefore.substring(0, textBefore.length - lastWord.length) + 
                        replacement + 
                        textarea.value.substring(pos);
          
          onChange(newValue);
          
          // Posiciona cursor al final de la sugerencia
          setTimeout(() => {
            if (replacement) {
              const newPos = pos - lastWord.length + replacement.length;
              textarea.selectionStart = textarea.selectionEnd = newPos;
              textarea.focus();
            }
          }, 0);
        }
        
        setShowSuggestions(false);
        return;
      }
    }
    
    // Cierra sugerencias con Escape
    if (e.key === 'Escape' && showSuggestions) {
      setShowSuggestions(false);
      return;
    }
    
    // Soporta tabulaciones
    if (e.key === 'Tab' && !showSuggestions) {
      e.preventDefault();
      
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Si hay selección múltiple, indenta las líneas seleccionadas
      if (start !== end) {
        const selectedText = textarea.value.substring(start, end);
        const lines = selectedText.split('\n');
        
        // Agrega indentación a cada línea
        const spaces = ' '.repeat(tabSize);
        const indentedText = lines.map(line => spaces + line).join('\n');
        
        const newValue = 
          textarea.value.substring(0, start) + 
          indentedText + 
          textarea.value.substring(end);
        
        onChange(newValue);
        
        // Ajusta selección a texto indentado
        setTimeout(() => {
          textarea.selectionStart = start;
          textarea.selectionEnd = start + indentedText.length;
        }, 0);
      } else {
        // Inserta tabulación en posición actual
        const spaces = ' '.repeat(tabSize);
        const newValue = 
          textarea.value.substring(0, start) + 
          spaces + 
          textarea.value.substring(end);
        
        onChange(newValue);
        
        // Posiciona cursor después de la tabulación
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + tabSize;
        }, 0);
      }
    }
  };
  
  // Actualiza posición del cursor para referencia
  const handleSelectionChange = () => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    const lastLine = lines[lines.length - 1] || '';
    const column = lastLine.length + 1;
    
    setCursorPosition({ line: lines.length, column });
    updateSelectionStats();
  };
  
  // Memoizamos los botones de la barra de herramientas para prevenir re-renders innecesarios
  const EditorToolbar = React.memo(() => (
    <div className="editor-toolbar p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setEditMode('edit')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            editMode === 'edit' 
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
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
          onClick={() => setEditMode('split')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            editMode === 'split' 
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          aria-label="Modo dividido"
        >
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Split
          </div>
        </button>
        <button
          onClick={() => setEditMode('preview')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            editMode === 'preview' 
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          aria-label="Modo vista previa"
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
      
      <div className="hidden md:flex ml-4 text-xs text-gray-500 dark:text-gray-400 items-center bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>{`L${cursorPosition.line}:C${cursorPosition.column}`}</span>
      </div>
      
      <div className="flex-grow" />
      
      <button
        onClick={onSave}
        disabled={readOnly}
        className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white disabled:opacity-50 shadow-sm hover:bg-green-700 transition-colors"
        aria-label="Guardar documento"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Guardar
      </button>
    </div>
  ));
  
  // Memoizamos el componente de numeración de líneas
  const LineNumbers = React.memo(({ count, fontSize }: { count: number, fontSize: number }) => (
    <div 
      className="absolute left-0 top-0 text-right pr-2 select-none text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 h-full overflow-hidden border-r border-gray-200 dark:border-gray-700/50"
      style={{ width: '3rem', fontSize: `${fontSize}px`, lineHeight: '1.6' }}
    >
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="line-number">{i + 1}</div>
      ))}
    </div>
  ));
  
  // Memoizamos las sugerencias
  const Suggestions = React.memo(() => (
    showSuggestions && suggestions.length > 0 ? (
      <div className="suggestions absolute left-16 transform -translate-y-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-10">
        <div className="p-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          Sugerencias
        </div>
        <ul>
          {suggestions.map((suggestion, index) => (
            <li 
              key={index}
              className="px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-sm"
              onClick={() => {
                // Implementar inserción de sugerencia
                const textarea = editorRef.current;
                if (textarea) {
                  const pos = textarea.selectionStart;
                  const textBefore = textarea.value.substring(0, pos);
                  const lastWord = textBefore.split(/\s/).pop() || '';
                  
                  // Reemplaza la palabra actual con la sugerencia
                  const newValue = textBefore.substring(0, textBefore.length - lastWord.length) + 
                                suggestion + 
                                textarea.value.substring(pos);
                  
                  onChange(newValue);
                  
                  // Posiciona cursor al final de la sugerencia
                  requestAnimationFrame(() => {
                    const newPos = pos - lastWord.length + suggestion.length;
                    textarea.selectionStart = textarea.selectionEnd = newPos;
                    textarea.focus();
                  });
                }
                setShowSuggestions(false);
              }}
            >
              <span className="text-blue-500 dark:text-blue-400 mr-2">{index === 0 ? '↵' : '⇥'}</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    ) : null
  ));
  
  // Número de líneas del contenido (calculado una sola vez)
  const lineCount = React.useMemo(() => content.split('\n').length, [content]);
  
  return (
    <div className="standard-editor h-full flex flex-col">
      <EditorToolbar />
      
      <div className={`editor-content-wrapper flex-grow ${editMode === 'split' ? 'flex' : 'block'}`}>
        {(editMode === 'edit' || editMode === 'split') && (
          <div className={`editor-pane relative ${editMode === 'split' ? 'w-1/2' : 'w-full h-full'}`}>
            <div className="relative h-full">
              {lineNumbers && <LineNumbers count={lineCount} fontSize={fontSize} />}
              
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onSelect={handleSelectionChange}
                onClick={handleSelectionChange}
                readOnly={readOnly}
                className={`w-full h-full p-4 focus:outline-none font-mono dark:bg-gray-900 dark:text-gray-100 ${lineNumbers ? 'pl-12' : ''}`}
                style={{ 
                  fontSize: `${fontSize}px`,
                  fontFamily,
                  lineHeight: '1.6',
                  resize: 'none',
                  tabSize: `${tabSize}`,
                  caretColor: 'blue', // Mejora visibilidad del cursor
                }}
                placeholder="Escribe tu documento en Markdown aquí..."
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                data-gramm="false" // Deshabilita Grammarly y similares para mejor rendimiento
              />
              
              <Suggestions />
            </div>
          </div>
        )}
        
        {(editMode === 'preview' || editMode === 'split') && (
          <div 
            ref={previewRef}
            className={`markdown-preview p-4 overflow-auto ${editMode === 'split' ? 'w-1/2' : 'w-full h-full'}`}
            style={{ fontSize: `${fontSize}px`, fontFamily }}
            dangerouslySetInnerHTML={{ 
              __html: renderedContent || 
                '<p class="my-4 text-gray-400 dark:text-gray-500 italic">Vista previa aparecerá aquí...</p>' 
            }}
          />
        )}
      </div>
    </div>
  );
};

export default StandardEditor;