import React, { useState, useEffect, useRef } from 'react';
import { Document } from '../../../shared/types/Document';
import { EnergyMode } from '../../../shared/types/SustainabilityMetrics';

interface DocumentViewerProps {
  document: Document;
  energyMode: EnergyMode;
  renderOptions?: {
    showMetadata?: boolean;
    showOutline?: boolean;
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    theme?: 'light' | 'dark' | 'auto';
  };
}

/**
 * Visor de documentos optimizado para sostenibilidad
 * Renderiza documentos Markdown con diferentes opciones de visualización
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  energyMode,
  renderOptions = {
    showMetadata: true,
    showOutline: true,
    fontSize: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1.6,
    theme: 'auto'
  }
}) => {
  // Referencias para elementos DOM
  const viewerRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  
  // Estado local
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [outline, setOutline] = useState<{id: string, level: number, text: string}[]>([]);
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const [renderQuality, setRenderQuality] = useState<'high' | 'medium' | 'low'>(
    energyMode === 'highPerformance' ? 'high' : 
    energyMode === 'standard' ? 'medium' : 'low'
  );
  
  // Estado para seguimiento de carga de renderizado
  const [isContentLoading, setIsContentLoading] = useState(true);
  
  // Efecto para renderizar contenido Markdown optimizado según modo de energía
  useEffect(() => {
    let isMounted = true;
    
    const renderMarkdown = async () => {
      // Iniciamos cargando
      if (isMounted) setIsContentLoading(true);
      
      // Actualiza la calidad de renderizado basada en el modo de energía
      const quality = energyMode === 'highPerformance' ? 'high' : 
                    energyMode === 'standard' ? 'medium' : 'low';
      if (isMounted) setRenderQuality(quality);
      
      // Renderizamos el contenido en un worker simulado para no bloquear la UI
      setTimeout(() => {
        if (!isMounted) return;
        
        try {
          // Simula un procesamiento Markdown simple para el MVP
          // En producción usaríamos una biblioteca completa
          let rendered = document.content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
          
          // Aplica diferentes niveles de renderizado según el modo de energía
          if (quality === 'high' || quality === 'medium') {
            rendered = rendered
              .replace(/^# (.+)$/gm, '<h1 id="heading-$1" class="text-3xl font-bold my-6 pb-2 border-b border-gray-200 dark:border-gray-700">$1</h1>')
              .replace(/^## (.+)$/gm, '<h2 id="heading-$1" class="text-2xl font-bold my-5">$1</h2>')
              .replace(/^### (.+)$/gm, '<h3 id="heading-$1" class="text-xl font-bold my-4">$1</h3>')
              .replace(/^#### (.+)$/gm, '<h4 id="heading-$1" class="text-lg font-bold my-3">$1</h4>')
              .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc my-1">$1</li>')
              .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal my-1">$2</li>')
              .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400 text-sm">$1</code>')
              .replace(/```([\s\S]*?)```/g, (match, p1) => {
                return `<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto my-4"><code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
              });
            
            // En calidad alta, agrega características de renderizado adicionales
            if (quality === 'high') {
              rendered = rendered
                .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300">$1</blockquote>')
                .replace(/!\[(.+?)\]\((.+?)\)/g, '<figure class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-md" /><figcaption class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">$1</figcaption></figure>');
            }
            
            // Agrupa elementos de lista
            rendered = rendered
              .replace(/(<li[^>]*>.*<\/li>)(\s*)(<li[^>]*>)/g, '$1$2$3')
              .replace(/(<li[^>]*>.*<\/li>)(?!\s*<li)/g, '<ul>$1</ul>');
          } else {
            // Renderizado básico para modo de bajo consumo
            rendered = rendered
              .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
              .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
              .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
              .replace(/^- (.+)$/gm, '• $1<br />')
              .replace(/^(\d+)\. (.+)$/gm, '$1. $2<br />')
              .replace(/`([^`]+)`/g, '<code>$1</code>')
              .replace(/```([\s\S]*?)```/g, (match, p1) => {
                return `<pre>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
              });
          }
          
          // Párrafos - procesamiento común para todos los modos
          rendered = rendered.replace(/\n\n/g, '</p><p class="my-4">');
          rendered = '<p class="my-4">' + rendered + '</p>';
          
          // Evita párrafos vacíos o anidados
          rendered = rendered
            .replace(/<p>\s*<\/p>/g, '')
            .replace(/<p>\s*<h([1-6])/g, '<h$1')
            .replace(/<\/h([1-6])>\s*<\/p>/g, '</h$1>')
            .replace(/<p>\s*<ul>/g, '<ul>')
            .replace(/<\/ul>\s*<\/p>/g, '</ul>');
          
          if (isMounted) {
            setRenderedContent(rendered);
            
            // Extrae esquema (headings) para navegación
            if (renderOptions.showOutline) {
              extractOutline(document.content);
            }
            
            // Marcamos como cargado después de un mínimo de tiempo para evitar parpadeos
            setTimeout(() => {
              if (isMounted) setIsContentLoading(false);
            }, 100);
          }
        } catch (error) {
          console.error('Error rendering markdown:', error);
          if (isMounted) {
            setRenderedContent(`<div class="p-4 text-red-600 dark:text-red-400">Error al renderizar el contenido</div>`);
            setIsContentLoading(false);
          }
        }
      }, 0);
    };
    
    // Aplicamos un pequeño retraso en modos de bajo consumo
    const delay = energyMode === 'ultraSaving' ? 300 : 0;
    
    const timer = setTimeout(renderMarkdown, delay);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [document.content, energyMode, renderOptions.showOutline]);
  
  // Extrae encabezados para crear esquema de navegación
  const extractOutline = (content: string) => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const headings: {id: string, level: number, text: string}[] = [];
    
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = `heading-${text.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Solo incluir hasta nivel 3 para el esquema
      if (level <= 3) {
        headings.push({ id, level, text });
      }
    }
    
    setOutline(headings);
  };
  
  // Navega a un encabezado específico
  const scrollToHeading = (id: string) => {
    if (viewerRef.current) {
      const element = viewerRef.current.querySelector(`#${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  // Calcula estilo de indentación para esquema
  const getOutlineItemStyle = (level: number) => {
    return { marginLeft: `${(level - 1) * 0.75}rem` };
  };
  
  return (
    <div className="document-viewer h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Encabezado con metadatos */}
      {renderOptions.showMetadata && (
        <div className="document-header p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{document.title}</h1>
              <div className="flex space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                {document.metadata.author && (
                  <div>Autor: {document.metadata.author}</div>
                )}
                <div>Actualizado: {new Date(document.updatedAt).toLocaleDateString()}</div>
                {document.metadata.wordCount && (
                  <div>{document.metadata.wordCount} palabras</div>
                )}
                {document.metadata.readTime && (
                  <div>~{document.metadata.readTime} min de lectura</div>
                )}
              </div>
              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap mt-2 gap-1">
                  {document.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                title="Expandir/Colapsar contenido"
                onClick={() => setIsContentExpanded(!isContentExpanded)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d={isContentExpanded 
                      ? "M20 12H4" 
                      : "M12 4v16m8-8H4"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
      {isContentExpanded && (
        <div className="flex-grow flex overflow-hidden">
          {/* Panel de esquema lateral */}
          {renderOptions.showOutline && outline.length > 0 && (
            <div 
              ref={outlineRef}
              className={`outline-panel w-48 p-4 border-r border-gray-200 dark:border-gray-700 
                         overflow-y-auto flex-shrink-0 ${energyMode === 'ultraSaving' ? 'hidden' : ''}`}
            >
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Contenido</h3>
              <ul className="space-y-2 text-sm">
                {outline.map((item, index) => (
                  <li 
                    key={index}
                    style={getOutlineItemStyle(item.level)}
                    className="truncate"
                  >
                    <button
                      className="hover:text-blue-600 dark:hover:text-blue-400 truncate w-full text-left"
                      onClick={() => scrollToHeading(item.id)}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Visor principal con skeleton durante carga */}
          <div 
            ref={viewerRef}
            className="markdown-viewer flex-grow p-6 overflow-y-auto relative"
            style={{
              fontSize: `${renderOptions.fontSize}px`,
              fontFamily: renderOptions.fontFamily,
              lineHeight: renderOptions.lineHeight
            }}
          >
            {/* Skeleton mientras carga el contenido */}
            {isContentLoading && !renderedContent && (
              <div className="absolute inset-0 p-6 animate-pulse">
                <div className="max-w-3xl mx-auto">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-6"></div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                  </div>
                  
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 mb-4"></div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-5/6"></div>
                  </div>
                  
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-2/3 mb-4"></div>
                  
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-4/5"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Contenido real con transición suave - siempre visible aunque esté cargando 
                para evitar pantalla en blanco si hay problemas de renderizado */}
            <div 
              className={`max-w-3xl mx-auto text-gray-800 dark:text-gray-200 transition-opacity duration-300 ${
                isContentLoading && !renderedContent ? 'opacity-0' : 'opacity-100'
              }`}
              dangerouslySetInnerHTML={{ 
                __html: renderedContent || `<div class="p-4 text-gray-500 dark:text-gray-400">
                  <p>Cargando contenido del documento...</p>
                </div>` 
              }}
            />
          </div>
        </div>
      )}
      
      {/* Pie con información de sostenibilidad */}
      <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex space-x-4">
          <span>Versión {document.version}</span>
          <span>Modo visualización: {renderQuality}</span>
        </div>
        
        {document.metadata.sustainabilityMetrics && (
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span title="Tamaño optimizado">
              {document.metadata.sustainabilityMetrics.compressionRatio.toFixed(1)}x ahorro
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;