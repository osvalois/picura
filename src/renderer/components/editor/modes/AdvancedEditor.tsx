import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';
import { debounce } from '../../../utils/performanceUtils';

interface AdvancedEditorProps {
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
 * Editor avanzado con características técnicas y optimizaciones para desarrolladores
 * Implementa funcionalidades avanzadas manteniendo sostenibilidad
 */
const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
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
  const [editMode, setEditMode] = useState<'split' | 'edit' | 'preview'>('edit');
  const [renderedContent, setRenderedContent] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(true);
  const [highlightedContent, setHighlightedContent] = useState('');
  const [editorWidth, setEditorWidth] = useState<number | null>(null);
  const [showOutline, setShowOutline] = useState(true);
  const [outline, setOutline] = useState<{level: number, text: string, line: number}[]>([]);
  
  // Optimizaciones para sostenibilidad
  const isHighPerformanceMode = energyMode === 'highPerformance';
  const isLowPowerMode = energyMode === 'lowPower' || energyMode === 'ultraSaving';
  
  // Función para extraer el outline del documento
  useEffect(() => {
    if (!showOutline) return;
    
    // Busca encabezados (# Heading) para el esquema
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headers: {level: number, text: string, line: number}[] = [];
    let match;
    let lineCount = 0;
    
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Resetea regex para buscar en cada línea
      headingRegex.lastIndex = 0;
      match = headingRegex.exec(line);
      if (match) {
        headers.push({
          level: match[1].length,
          text: match[2],
          line: i + 1
        });
      }
    }
    
    setOutline(headers);
  }, [content, showOutline]);
  
  // Renderiza el contenido markdown con resaltado de sintaxis
  useEffect(() => {
    let isMounted = true;
    const contentLength = content.length;

    const renderMarkdown = async () => {
      try {
        // Implementación mejorada con mayor compatibilidad markdown
        // Escapamos caracteres HTML para evitar inyección
        const safeText = content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        // Usamos procesamiento por etapas para mejor rendimiento
        const processCodeBlocks = () => {
          return safeText.replace(/```([^\n]*)\n([\s\S]*?)```/g, (match, language, code) => {
            return `<pre class="bg-gray-50 dark:bg-gray-800 p-4 rounded-md my-4 overflow-x-auto ${language ? `language-${language}` : ''}"><code>${code}</code></pre>`;
          });
        };

        const processHeadings = (text: string) => {
          return text
            .replace(/^# (.+)$/gm, '<h1 id="$1" class="text-2xl font-bold my-4 border-b pb-1 border-gray-200 dark:border-gray-700">$1</h1>')
            .replace(/^## (.+)$/gm, '<h2 id="$1" class="text-xl font-bold my-3">$1</h2>')
            .replace(/^### (.+)$/gm, '<h3 id="$1" class="text-lg font-bold my-2">$1</h3>')
            .replace(/^#### (.+)$/gm, '<h4 id="$1" class="text-base font-bold my-2">$1</h4>')
            .replace(/^##### (.+)$/gm, '<h5 id="$1" class="text-sm font-bold my-1">$1</h5>')
            .replace(/^###### (.+)$/gm, '<h6 id="$1" class="text-xs font-bold my-1">$1</h6>');
        };

        const processInlineFormats = (text: string) => {
          return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/~~(.+?)~~/g, '<del class="text-gray-500 dark:text-gray-400">$1</del>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-red-600 dark:text-red-400">$1</code>');
        };

        const processLinks = (text: string) => {
          return text
            .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded" />')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
        };

        const processList = (text: string) => {
          return text
            .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
            .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
        };

        // Para documentos grandes, usamos procesamiento por etapas
        let rendered;
        
        if (contentLength > 50000 && !isHighPerformanceMode) {
          // Usamos requestAnimationFrame y chunks para mejor rendimiento
          if (isMounted) {
            // Mostrar indicador de carga
            setRenderedContent('<div class="animate-pulse flex space-x-4 items-center justify-center py-8"><span>Procesando documento...</span></div>');
            
            // Procesamos en etapas utilizando requestAnimationFrame
            requestAnimationFrame(() => {
              if (!isMounted) return;
              
              const step1 = processCodeBlocks();
              
              requestAnimationFrame(() => {
                if (!isMounted) return;
                
                const step2 = processHeadings(step1);
                
                requestAnimationFrame(() => {
                  if (!isMounted) return;
                  
                  const step3 = processInlineFormats(step2);
                  
                  requestAnimationFrame(() => {
                    if (!isMounted) return;
                    
                    const step4 = processLinks(step3);
                    
                    requestAnimationFrame(() => {
                      if (!isMounted) return;
                      
                      const step5 = processList(step4);
                      const final = step5.replace(/\n\n/g, '<br /><br />');
                      
                      setRenderedContent(final);
                    });
                  });
                });
              });
            });
          }
        } else {
          // Para documentos pequeños, procesamos todo de una vez
          rendered = processCodeBlocks();
          rendered = processHeadings(rendered);
          rendered = processInlineFormats(rendered);
          rendered = processLinks(rendered);
          rendered = processList(rendered);
          rendered = rendered.replace(/\n\n/g, '<br /><br />');
          
          if (isMounted) {
            setRenderedContent(rendered);
          }
        }
      } catch (error) {
        console.error('Error en markdown:', error);
      }
    };
    
    // Función para resaltar sintaxis
    const highlightSyntax = () => {
      if (!syntaxHighlighting) {
        setHighlightedContent('');
        return;
      }
      
      try {
        // Implementación mejorada con detección de lenguajes comunes
        // y mejor estructura para rendimiento
        
        // Función para aplicar resaltado por tipo
        const highlightByType = () => {
          // Pre-procesamos para rendimiento
          const lines = content.split('\n');
          const processed = lines.map(line => {
            // Encabezados
            if (/^#{1,6}\s+.+$/.test(line)) {
              return `<span class="text-blue-600 dark:text-blue-400">${line}</span>`;
            }
            // Enlaces
            else if (line.includes('[') && line.includes('](')) {
              return line.replace(/\[(.+?)\]\((.+?)\)/g, 
                '<span class="text-green-600 dark:text-green-400">[$1]</span><span class="text-purple-600 dark:text-purple-400">($2)</span>');
            }
            // Listas
            else if (/^(-|\d+\.)\s+.+$/.test(line)) {
              return line.replace(/^(-|\d+\.)\s+(.+)$/, 
                '<span class="text-purple-600 dark:text-purple-400">$1</span> $2');
            }
            // Código en bloque - solo marca la línea de apertura/cierre
            else if (line.startsWith('```')) {
              const match = line.match(/```(\w*)$/);
              if (match && match[1]) {
                // Resaltamos el lenguaje
                return '<span class="text-orange-600 dark:text-orange-400">```</span><span class="text-green-600 dark:text-green-400">' + match[1] + '</span>';
              }
              return `<span class="text-gray-700 dark:text-gray-300">${line}</span>`;
            }
            // Procesamos todas las líneas para negrita/cursiva/código
            return line
              .replace(/\*\*(.+?)\*\*/g, '<span class="text-yellow-600 dark:text-yellow-400">**$1**</span>')
              .replace(/\*(.+?)\*/g, '<span class="text-yellow-500 dark:text-yellow-300">*$1*</span>')
              .replace(/`([^`]+)`/g, '<span class="text-red-600 dark:text-red-400">`$1`</span>');
          });
          
          return processed.join('\n');
        };
        
        // Usamos debounce y optimización para documentos grandes
        if (content.length > 50000 && !isHighPerformanceMode) {
          if (isMounted) {
            requestAnimationFrame(() => {
              if (isMounted) {
                const highlighted = highlightByType();
                setHighlightedContent(highlighted);
              }
            });
          }
        } else {
          const highlighted = highlightByType();
          setHighlightedContent(highlighted);
        }
      } catch (error) {
        console.error('Error aplicando resaltado de sintaxis:', error);
        // En caso de error, dejamos el contenido sin resaltado
        setHighlightedContent('');
      }
    };
    
    // Optimizaciones según modo de energía
    const delay = isLowPowerMode ? 1000 : 
                 isHighPerformanceMode ? 0 : 300;
    
    // Si estamos en modo de vista previa, renderiza markdown
    if (editMode !== 'edit') {
      const timer = setTimeout(renderMarkdown, delay);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    
    // Si estamos en modo edición, aplica resaltado de sintaxis
    // excepto en modo ultra ahorro
    if (editMode === 'edit' && energyMode !== 'ultraSaving') {
      const timer = setTimeout(highlightSyntax, delay);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    
    // Función de limpieza por defecto
    return () => {
      isMounted = false;
    };
  }, [content, editMode, syntaxHighlighting, isLowPowerMode, isHighPerformanceMode, energyMode]);
  
  // Actualiza estadísticas de selección con debounce para rendimiento
  const updateSelectionStats = useCallback(
    debounce(() => {
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
    }, isLowPowerMode ? 500 : 150),
    [isLowPowerMode, onSelectionChange]
  );
  
  // Maneja cambios en el contenido
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  // Maneja atajos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Guarda con Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
      return;
    }
    
    // Soporta tabulaciones
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Si hay selección múltiple, indenta las líneas seleccionadas
      if (start !== end) {
        const selectedText = textarea.value.substring(start, end);
        const lines = selectedText.split('\n');
        
        // Indenta o desindenta según shift key
        if (e.shiftKey) {
          // Quita una tabulación al inicio de cada línea si existe
          const dedentedText = lines
            .map(line => line.startsWith(' '.repeat(tabSize)) 
              ? line.substring(tabSize) 
              : line)
            .join('\n');
          
          const newValue = 
            textarea.value.substring(0, start) + 
            dedentedText + 
            textarea.value.substring(end);
          
          onChange(newValue);
          
          // Ajusta selección para texto desindentado
          setTimeout(() => {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + dedentedText.length;
          }, 0);
        } else {
          // Agrega indentación a cada línea
          const spaces = ' '.repeat(tabSize);
          const indentedText = lines.map(line => spaces + line).join('\n');
          
          const newValue = 
            textarea.value.substring(0, start) + 
            indentedText + 
            textarea.value.substring(end);
          
          onChange(newValue);
          
          // Ajusta selección para texto indentado
          setTimeout(() => {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + indentedText.length;
          }, 0);
        }
      } else {
        // Inserta tabulación en posición actual si no hay shift
        if (!e.shiftKey) {
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
    }
  };
  
  // Actualiza posición del cursor
  const handleSelectionChange = () => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    
    setCursorPosition({ line, column });
    updateSelectionStats();
  };
  
  // Navegación a línea desde el esquema
  const navigateToLine = (lineNumber: number) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const lines = textarea.value.split('\n');
    let position = 0;
    
    // Calcula la posición del cursor
    for (let i = 0; i < lineNumber - 1; i++) {
      if (i < lines.length) {
        position += lines[i].length + 1; // +1 para el carácter de nueva línea
      }
    }
    
    // Establece posición del cursor y enfoca
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = position;
    
    // Asegura que la línea sea visible (auto-scroll)
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
    const scrollPosition = (lineNumber - 1) * lineHeight;
    textarea.scrollTop = scrollPosition;
    
    // Actualiza estado
    handleSelectionChange();
  };
  
  // Implementa envolvente de selección con caracteres especiales
  const wrapSelection = (before: string, after: string = before) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    // Inserta los caracteres de envoltura
    const newText = before + selectedText + after;
    const newValue = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    onChange(newValue);
    
    // Reposiciona el cursor manteniendo la selección
    setTimeout(() => {
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = end + before.length;
      textarea.focus();
    }, 0);
  };
  
  // Inserta plantilla para bloque de código
  const insertCodeBlock = (language: string = '') => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const codeBlockTemplate = `\`\`\`${language}\n${selectedText}\n\`\`\`\n`;
    const newValue = 
      textarea.value.substring(0, start) + 
      codeBlockTemplate + 
      textarea.value.substring(end);
    
    onChange(newValue);
    
    // Posiciona el cursor dentro del bloque
    const cursorPosition = start + 3 + language.length + 1; // después de ```lang\n
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = cursorPosition;
      textarea.focus();
    }, 0);
  };
  
  // Calcula el estilo de indentación para el esquema
  const getOutlineItemStyle = (level: number) => {
    return {
      paddingLeft: `${level * 0.75}rem`,
      fontSize: `${Math.max(0.7, 1 - level * 0.1)}rem`
    };
  };
  
  return (
    <div className="advanced-editor h-full flex flex-col">
      <div className="editor-toolbar flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex space-x-2">
          <button
            onClick={() => setEditMode('edit')}
            className={`px-3 py-1 rounded text-sm ${editMode === 'edit' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Editar
          </button>
          <button
            onClick={() => setEditMode('split')}
            className={`px-3 py-1 rounded text-sm ${editMode === 'split' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Split
          </button>
          <button
            onClick={() => setEditMode('preview')}
            className={`px-3 py-1 rounded text-sm ${editMode === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Preview
          </button>
        </div>
        
        <div className="mx-2 h-5 border-l border-gray-300 dark:border-gray-600"></div>
        
        <div className="format-buttons flex space-x-1">
          <button 
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Negrita"
            onClick={() => wrapSelection('**')}
          >
            <strong>B</strong>
          </button>
          <button 
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Cursiva"
            onClick={() => wrapSelection('*')}
          >
            <em>I</em>
          </button>
          <button 
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Código inline"
            onClick={() => wrapSelection('`')}
          >
            <code>{'<>'}</code>
          </button>
          <button 
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Bloque de código"
            onClick={() => insertCodeBlock()}
          >
            <span>{ '```' }</span>
          </button>
          <button 
            className="p-1 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Enlace"
            onClick={() => wrapSelection('[', '](url)')}
          >
            <span>🔗</span>
          </button>
        </div>
        
        <div className="flex-grow"></div>
        
        <div className="cursor-position mr-4 text-xs text-gray-500 dark:text-gray-400">
          {`Línea: ${cursorPosition.line}, Columna: ${cursorPosition.column}`}
        </div>
        
        <div className="toggles flex space-x-2 mr-4">
          <label className="flex items-center text-xs text-gray-700 dark:text-gray-300">
            <input 
              type="checkbox" 
              className="mr-1" 
              checked={syntaxHighlighting}
              onChange={() => setSyntaxHighlighting(!syntaxHighlighting)}
              disabled={isLowPowerMode}
            />
            Resaltado
          </label>
          
          <label className="flex items-center text-xs text-gray-700 dark:text-gray-300">
            <input 
              type="checkbox" 
              className="mr-1" 
              checked={showOutline}
              onChange={() => setShowOutline(!showOutline)}
            />
            Esquema
          </label>
        </div>
        
        <button
          onClick={onSave}
          disabled={readOnly}
          className="px-3 py-1 rounded text-sm bg-green-500 text-white disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
      
      <div className="flex-grow flex overflow-hidden">
        {/* Panel de esquema */}
        {showOutline && (
          <div className="outline-panel w-48 p-2 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <h3 className="text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Esquema</h3>
            {outline.length > 0 ? (
              <ul className="text-sm">
                {outline.map((item, index) => (
                  <li 
                    key={index} 
                    style={getOutlineItemStyle(item.level)}
                    className="py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={() => navigateToLine(item.line)}
                    title={`Línea ${item.line}`}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No hay encabezados en el documento
              </p>
            )}
          </div>
        )}
        
        <div className={`editor-content-wrapper flex-grow overflow-hidden ${editMode === 'split' ? 'flex' : 'block'}`}>
          {/* Panel de edición */}
          {(editMode === 'edit' || editMode === 'split') && (
            <div 
              className={`editor-pane ${editMode === 'split' ? 'w-1/2' : 'w-full'} overflow-auto`}
              ref={node => {
                if (node && !editorWidth) {
                  setEditorWidth(node.clientWidth);
                }
              }}
            >
              <div className="relative h-full">
                {/* Textarea para edición */}
                <textarea
                  ref={editorRef}
                  value={content}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onSelect={handleSelectionChange}
                  onClick={handleSelectionChange}
                  readOnly={readOnly}
                  className="w-full h-full p-4 focus:outline-none font-mono dark:bg-gray-900 dark:text-gray-100"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    fontFamily,
                    lineHeight: '1.6',
                    resize: 'none',
                    tabSize: `${tabSize}`,
                    opacity: syntaxHighlighting ? '0' : '1',
                    position: syntaxHighlighting ? 'absolute' : 'static'
                  }}
                  placeholder="Escribe tu documento en Markdown aquí..."
                />
                
                {/* Capa de resaltado de sintaxis */}
                {syntaxHighlighting && (
                  <div 
                    className="syntax-highlighting absolute left-0 top-0 w-full p-4 font-mono whitespace-pre-wrap pointer-events-none"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      fontFamily,
                      lineHeight: '1.6',
                      tabSize: `${tabSize}`
                    }}
                    dangerouslySetInnerHTML={{ __html: highlightedContent || content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />') }}
                  />
                )}
                
                {/* Numeración de líneas */}
                {lineNumbers && (
                  <div 
                    className="absolute left-0 top-0 text-right pr-2 select-none text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 h-full overflow-hidden"
                    style={{ 
                      width: '3rem', 
                      fontSize: `${fontSize}px`, 
                      lineHeight: '1.6',
                      paddingTop: '1rem'
                    }}
                  >
                    {content.split('\n').map((_, i) => (
                      <div key={i} className="line-number">{i + 1}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Panel de vista previa */}
          {(editMode === 'preview' || editMode === 'split') && (
            <div 
              ref={previewRef}
              className={`markdown-preview overflow-auto p-4 dark:bg-gray-900 dark:text-gray-100 ${editMode === 'split' ? 'w-1/2' : 'w-full h-full'}`}
              style={{ fontSize: `${fontSize}px`, fontFamily }}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditor;