import { useState, useEffect, useMemo } from 'react';
import { detectContentType, ContentType } from '../utils/contentTypes';
import { ViewerSettings } from '../utils/viewerConfig';
import { sanitizeHtml } from '../utils/safeContent';

interface UseContentRendererProps {
  content: string;
  filename?: string | undefined;
  settings: ViewerSettings;
}

interface UseContentRendererResult {
  contentType: ContentType;
  processedContent: string;
  isProcessing: boolean;
  renderError: string | null;
}

/**
 * Hook para detectar y procesar el contenido para renderizado
 */
export function useContentRenderer({
  content,
  filename,
  settings
}: UseContentRendererProps): UseContentRendererResult {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [renderError, setRenderError] = useState<string | null>(null);
  
  // Detecta el tipo de contenido o usa el tipo configurado manualmente
  const contentType = useMemo(() => {
    return settings.contentTypeOverride || detectContentType(content, filename);
  }, [content, filename, settings.contentTypeOverride]);

  // Procesa el contenido según su tipo
  useEffect(() => {
    if (!content) {
      setProcessedContent('');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setRenderError(null);

    try {
      // Procesamiento basado en tipo de contenido
      let processed = content;

      // Sanitiza HTML para prevenir XSS
      if (contentType === 'html' || contentType === 'mixed') {
        processed = sanitizeHtml(processed);
      }

      // El contenido raw se pasa a los renderizadores específicos
      // No hacemos la transformación aquí sino que dejamos que cada renderizador lo maneje
      
      setProcessedContent(processed);
    } catch (error) {
      console.error('Error processing content:', error);
      setRenderError(`Error al procesar el contenido: ${(error as Error).message || 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [content, contentType]);

  return {
    contentType,
    processedContent,
    isProcessing,
    renderError
  };
}