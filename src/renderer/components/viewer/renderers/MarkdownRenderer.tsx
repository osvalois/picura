import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import { ViewerSettings } from '../utils/viewerConfig';
import { isSafeUrl } from '../utils/safeContent';
import { extractMermaidBlocks } from '../utils/contentTypes';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  settings: ViewerSettings;
  onLinkClick?: ((url: string, event: React.MouseEvent) => void) | undefined;
  onImageClick?: ((event: React.MouseEvent<HTMLImageElement>) => void) | undefined;
  onCopyCode?: ((code: string) => void) | undefined;
  className?: string;
}

// Error boundary para capturar errores del renderizador de Markdown
class MarkdownErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
            <h3 className="text-lg font-medium mb-2">Error al renderizar Markdown</h3>
            <p className="mb-4">{this.state.error?.message || 'Error desconocido'}</p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{this.props.children}</pre>
            </div>
          </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Componente para renderizar contenido Markdown con soporte para múltiples extensiones
 * como diagramas Mermaid, fórmulas matemáticas, resaltado de sintaxis, etc.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
                                                             content,
                                                             settings,
                                                             onLinkClick,
                                                             onImageClick,
                                                             onCopyCode,
                                                             className = ''
                                                           }) => {
  const mermaidContainerRef = useRef<HTMLDivElement>(null);

  // Inicializa y configura Mermaid.js
  useEffect(() => {
    if (settings.enableMermaidDiagrams) {
      mermaid.initialize({
        startOnLoad: false,
        theme: settings.theme.colors.background.includes('#0d') ? 'dark' : 'default',
        securityLevel: 'strict',
        fontFamily: settings.theme.typography.fontFamily
      });
    }
  }, [settings.enableMermaidDiagrams, settings.theme]);

  // Renderiza diagramas Mermaid en bloques de código
  useEffect(() => {
    if (!settings.enableMermaidDiagrams || !mermaidContainerRef.current) {
      return;
    }

    const mermaidBlocks = extractMermaidBlocks(content);

    // Limpia los diagramas existentes
    const container = mermaidContainerRef.current;
    container.innerHTML = '';

    // Renderiza cada diagrama encontrado
    mermaidBlocks.forEach((diagram, index) => {
      try {
        const divId = `mermaid-diagram-${index}`;
        const diagramDiv = document.createElement('div');
        diagramDiv.id = divId;
        diagramDiv.className = 'mermaid-diagram mb-4';
        diagramDiv.textContent = diagram;

        container.appendChild(diagramDiv);

        // Renderiza el diagrama
        mermaid.render(
            `mermaid-svg-${index}`,
            diagram,
            (svgCode) => {
              const div = document.getElementById(divId);
              if (div) {
                div.innerHTML = svgCode;
              }
            }
        );
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
      }
    });
  }, [content, settings.enableMermaidDiagrams]);

  // Componentes personalizados para ReactMarkdown
  const components = {
    // Personaliza enlaces
    a: ({ node, ...props }: any) => {
      const { href } = props;

      // Verifica si es un enlace seguro
      if (href && !isSafeUrl(href)) {
        return <span className="unsafe-link">{props.children}</span>;
      }

      return (
          <a
              {...props}
              className="text-primary hover:underline"
              onClick={(e: React.MouseEvent) => {
                if (onLinkClick && href) {
                  onLinkClick(href, e);
                }
              }}
              target={href && (href.startsWith('http') || href.startsWith('www')) ? '_blank' : undefined}
              rel={href && (href.startsWith('http') || href.startsWith('www')) ? 'noopener noreferrer' : undefined}
          />
      );
    },

    // Personaliza imágenes
    img: ({ node, ...props }: any) => {
      const { /* src, */ alt } = props;

      return (
          <img
              {...props}
              className="max-w-full h-auto my-4 rounded-md"
              style={{
                maxHeight: `${settings.maxImageSize}px`
              }}
              alt={alt || 'Imagen'}
              onClick={onImageClick}
          />
      );
    },

    // Personaliza bloques de código con resaltado de sintaxis
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const code = String(children).replace(/\n$/, '');

      // Código en línea
      if (inline) {
        return (
            <code className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded ${className}`} {...props}>
              {children}
            </code>
        );
      }

      // Ignora bloques de mermaid (se renderizarán por separado)
      if (match && match[1] === 'mermaid') {
        return null;
      }

      // Bloques de código con resaltado de sintaxis
      return (
          <div className="relative group">
            {settings.enableSyntaxHighlighting ? (
                <SyntaxHighlighter
                    style={settings.theme.colors.background.includes('#0d') ? vscDarkPlus : vs}
                    language={match ? match[1] : 'text'}
                    showLineNumbers={settings.showLineNumbers}
                    wrapLines={true}
                    customStyle={{
                      margin: '1rem 0',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                    {...props}
                >
                  {code}
                </SyntaxHighlighter>
            ) : (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
            )}

            {/* Botón para copiar código */}
            <button
                className="absolute top-2 right-2 bg-gray-200 dark:bg-gray-700 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onCopyCode && onCopyCode(code)}
                aria-label="Copiar código"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
          </div>
      );
    },

    // Personaliza tablas
    table: ({ node, ...props }: any) => (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
        </div>
    ),

    // Personaliza encabezados de tabla - filtrar isHeader para evitar la advertencia
    th: ({ node, isHeader, ...props }: any) => (
        <th className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-4 py-2 text-left" {...props} />
    ),

    // Personaliza celdas de tabla
    td: ({ node, ...props }: any) => (
        <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
    ),

    // Personaliza citas
    blockquote: ({ node, ...props }: any) => (
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1 my-4 text-gray-700 dark:text-gray-300 italic" {...props} />
    ),

    // Personaliza listas de tareas - filtrar ordered para evitar la advertencia
    li: ({ node, ordered, className, ...props }: any) => {
      if (
          className?.includes('task-list-item') &&
          React.Children.count(props.children) > 0
      ) {
        // Verificar de manera segura si hay propiedades de tipo checkbox
        const firstChild = React.Children.toArray(props.children)[0];
        const isCheckbox =
            typeof firstChild === 'object' &&
            firstChild !== null &&
            'props' in firstChild &&
            firstChild.props?.node?.properties?.type === 'checkbox';

        if (isCheckbox) {
          return (
              <li className="flex items-start space-x-2 my-1" {...props}>
                {props.children}
              </li>
          );
        }
      }

      return <li className="my-1" {...props} />;
    },

    // Personaliza listas ordenadas para manejar correctamente la propiedad ordered
    ol: ({ node, ...props }: any) => (
        <ol className="pl-8 list-decimal my-4" {...props} />
    ),

    // Personaliza listas no ordenadas
    ul: ({ node, ...props }: any) => (
        <ul className="pl-8 list-disc my-4" {...props} />
    ),

    // Personaliza encabezados
    h1: ({ node, ...props }: any) => (
        <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800" {...props} />
    ),

    h2: ({ node, ...props }: any) => (
        <h2 className="text-2xl font-bold mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-800" {...props} />
    ),

    h3: ({ node, ...props }: any) => (
        <h3 className="text-xl font-bold mt-5 mb-3" {...props} />
    ),

    h4: ({ node, ...props }: any) => (
        <h4 className="text-lg font-bold mt-4 mb-2" {...props} />
    ),

    h5: ({ node, ...props }: any) => (
        <h5 className="text-base font-bold mt-4 mb-2" {...props} />
    ),

    h6: ({ node, ...props }: any) => (
        <h6 className="text-sm font-bold mt-4 mb-2 text-gray-600 dark:text-gray-400 uppercase tracking-wider" {...props} />
    ),

    // Personaliza párrafos
    p: ({ node, ...props }: any) => (
        <p className="my-4 leading-relaxed" {...props} />
    ),

    // Personaliza horizontal rules
    hr: ({ node, ...props }: any) => (
        <hr className="my-8 border-t border-gray-300 dark:border-gray-700" {...props} />
    ),

    // Personaliza strong
    strong: ({ node, ...props }: any) => (
        <strong className="font-bold" {...props} />
    ),

    // Personaliza emphasis
    em: ({ node, ...props }: any) => (
        <em className="italic" {...props} />
    ),

    // Personaliza delete/strikethrough
    del: ({ node, ...props }: any) => (
        <del className="line-through" {...props} />
    ),

    // Personaliza input (checkboxes)
    input: ({ node, ...props }: any) => {
      const { checked } = props;

      return (
          <input
              {...props}
              disabled={true}
              className={`mr-1 h-4 w-4 rounded border-gray-300 accent-primary ${
                  checked ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'
              }`}
          />
      );
    }
  };

  return (
      <div className={`markdown-renderer ${className}`}>
        {/* Contenido Markdown principal */}
        <MarkdownErrorBoundary>
          <ReactMarkdown
              // Use the GFM plugin with options to properly render tables and tasks
              remarkPlugins={[
                [remarkGfm, {
                  singleTilde: false,
                  tableCellPadding: true,
                  tablePipeAlign: false
                }],
                ...(settings.enableMathRendering ? [remarkMath] : [])
              ]}
              rehypePlugins={[
                ...(settings.enableMathRendering ? [rehypeKatex] : [])
              ]}
              components={components}
              className="prose dark:prose-invert max-w-none"
              skipHtml={false}
              // Safety features
              transformLinkUri={(uri: string) => (isSafeUrl(uri) ? uri : '')}
          >
            {content}
          </ReactMarkdown>
        </MarkdownErrorBoundary>

        {/* Contenedor para diagramas Mermaid */}
        {settings.enableMermaidDiagrams && (
            <div ref={mermaidContainerRef} className="mermaid-container mt-4" />
        )}
      </div>
  );
};

export default MarkdownRenderer;