import React, { useRef, useState } from 'react';
import { ContentType } from '../utils/contentTypes';
import { ViewerSettings } from '../utils/viewerConfig';
import { 
  MarkdownRenderer, 
  HtmlRenderer, 
  MermaidRenderer, 
  CodeRenderer, 
  MediaRenderer 
} from '../renderers';
import FallbackTextRenderer from '../renderers/FallbackTextRenderer';

interface ContentRendererProps {
  content: string;
  contentType: ContentType;
  settings: ViewerSettings;
  filename?: string | undefined;
  zoomLevel: number;
  onLinkClick?: (url: string, event: React.MouseEvent) => void;
  onImageClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
  onCopyCode?: (code: string) => void;
  className?: string;
}

/**
 * Componente para renderizar diferentes tipos de contenido
 */
const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  contentType,
  settings,
  filename,
  zoomLevel,
  onLinkClick = undefined,
  onImageClick = undefined,
  onCopyCode = undefined,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  // For future error handling
  const [renderError] = useState<Error | null>(null);
  
  // Determina el renderizador según el tipo de contenido
  const renderContent = () => {
    switch (contentType) {
      case 'markdown':
        return (
          <MarkdownRenderer
            content={content}
            settings={settings}
            onLinkClick={onLinkClick}
            onImageClick={onImageClick}
            onCopyCode={onCopyCode}
          />
        );
        
      case 'html':
        return (
          <HtmlRenderer
            content={content}
            settings={settings}
            onLinkClick={onLinkClick}
            onImageClick={onImageClick}
          />
        );
        
      case 'mermaid':
        return (
          <MermaidRenderer
            content={content}
            settings={settings}
          />
        );
        
      case 'code':
        return (
          <CodeRenderer
            content={content}
            settings={settings}
            fileName={filename}
            onCopy={onCopyCode}
          />
        );
        
      case 'image':
        // Detectar tipo de URL de imagen
        return (
          <MediaRenderer
            url={content}
            type="image"
            settings={settings}
            onImageClick={onImageClick}
          />
        );
        
      case 'mixed':
        // Para contenido mixto, usamos Markdown como mejor opción
        return (
          <MarkdownRenderer
            content={content}
            settings={settings}
            onLinkClick={onLinkClick}
            onImageClick={onImageClick}
            onCopyCode={onCopyCode}
          />
        );
        
      case 'unknown':
      default:
        // Para contenido desconocido, mostramos como texto
        return (
          <div className="p-4 bg-white dark:bg-gray-900 rounded-md overflow-auto font-mono text-sm whitespace-pre-wrap">
            {content}
          </div>
        );
    }
  };
  
  return (
    <div
      ref={contentRef}
      className={`content-renderer overflow-auto ${className}`}
      style={{
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left',
        width: `${100 / zoomLevel}%`,
        height: `${100 / zoomLevel}%`
      }}
    >
      {renderError ? (
        <FallbackTextRenderer 
          content={content}
          settings={settings}
          title={`Error al renderizar contenido ${contentType}`}
          error={renderError}
        />
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default ContentRenderer;