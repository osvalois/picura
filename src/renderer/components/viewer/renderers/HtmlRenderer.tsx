import React, { useEffect, useRef } from 'react';
import { ViewerSettings } from '../utils/viewerConfig';
import { sanitizeHtml, processCodeBlocks } from '../utils/safeContent';

interface HtmlRendererProps {
  content: string;
  settings: ViewerSettings;
  onLinkClick?: ((url: string, event: React.MouseEvent) => void) | undefined;
  onImageClick?: ((event: React.MouseEvent<HTMLImageElement>) => void) | undefined;
  className?: string;
}

/**
 * Componente para renderizar contenido HTML de forma segura
 */
const HtmlRenderer: React.FC<HtmlRendererProps> = ({
  content,
  settings,
  onLinkClick,
  onImageClick,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Procesa y sanea el HTML
  const sanitizedHtml = sanitizeHtml(processCodeBlocks(content));

  // Configura enlaces y eventos después de renderizar
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Configura manejadores de eventos para enlaces
    if (onLinkClick) {
      const links = container.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href) {
            onLinkClick(href, e as unknown as React.MouseEvent);
          }
        });
      });
    }

    // Configura manejadores de eventos para imágenes
    if (onImageClick) {
      const images = container.querySelectorAll('img');
      images.forEach((img) => {
        img.addEventListener('click', onImageClick as unknown as EventListener);
        // Limita el tamaño máximo de la imagen
        img.style.maxWidth = '100%';
        img.style.maxHeight = `${settings.maxImageSize}px`;
      });
    }

    // Limpieza de eventos
    return () => {
      if (onLinkClick) {
        const links = container.querySelectorAll('a');
        links.forEach((link) => {
          link.removeEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
              onLinkClick(href, e as unknown as React.MouseEvent);
            }
          });
        });
      }

      if (onImageClick) {
        const images = container.querySelectorAll('img');
        images.forEach((img) => {
          img.removeEventListener('click', onImageClick as unknown as EventListener);
        });
      }
    };
  }, [content, onLinkClick, onImageClick, settings.maxImageSize]);

  // Genera estilos dinámicos para aplicar la configuración del tema
  const dynamicStyle = `
    .html-renderer {
      font-family: ${settings.theme.typography.fontFamily};
      font-size: ${16 * settings.theme.typography.fontSizeFactor}px;
      line-height: ${settings.theme.typography.lineHeight};
      color: ${settings.theme.colors.text};
      background-color: ${settings.theme.colors.background};
      padding: ${settings.theme.spacing.contentPadding};
      max-width: ${settings.theme.spacing.contentMaxWidth};
      margin: 0 auto;
    }
    
    .html-renderer h1, .html-renderer h2, .html-renderer h3, 
    .html-renderer h4, .html-renderer h5, .html-renderer h6 {
      font-family: ${settings.theme.typography.headingFamily};
      color: ${settings.theme.colors.headings};
      margin-top: ${settings.theme.spacing.blockMargin};
      margin-bottom: ${settings.theme.spacing.blockMargin};
    }
    
    .html-renderer a {
      color: ${settings.theme.colors.links};
      text-decoration: none;
    }
    
    .html-renderer a:hover {
      text-decoration: underline;
    }
    
    .html-renderer pre, .html-renderer code {
      background-color: ${settings.theme.colors.codeBackground};
      color: ${settings.theme.colors.codeText};
      border-radius: 4px;
      padding: 0.2em 0.4em;
      font-family: monospace;
    }
    
    .html-renderer pre {
      padding: 1em;
      overflow-x: auto;
    }
    
    .html-renderer blockquote {
      border-left: 4px solid ${settings.theme.colors.blockquoteBorder};
      background-color: ${settings.theme.colors.blockquoteBackground};
      padding: 0.5em 1em;
      margin-left: 0;
    }
    
    .html-renderer table {
      border-collapse: collapse;
      width: 100%;
      margin: ${settings.theme.spacing.blockMargin} 0;
    }
    
    .html-renderer th {
      background-color: ${settings.theme.colors.tableHeaderBackground};
      border: 1px solid ${settings.theme.colors.tableBorder};
      padding: 8px;
      text-align: left;
    }
    
    .html-renderer td {
      border: 1px solid ${settings.theme.colors.tableBorder};
      padding: 8px;
    }
    
    .html-renderer tr:nth-child(even) {
      background-color: ${settings.theme.colors.tableRowAlt};
    }
    
    .html-renderer img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
  `;

  return (
    <div className={`html-renderer ${className}`}>
      <style>{dynamicStyle}</style>
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
};

export default HtmlRenderer;