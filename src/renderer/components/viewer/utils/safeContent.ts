import DOMPurify from 'dompurify';

/**
 * Sanitiza contenido HTML para prevenir ataques XSS
 */
export function sanitizeHtml(content: string): string {
  // Configuración adicional de DOMPurify para permitir ciertas etiquetas SVG y atributos seguros
  const config = {
    ADD_TAGS: ['use', 'pattern', 'defs', 'linearGradient', 'radialGradient', 'stop'],
    ADD_ATTR: ['target', 'rel', 'href', 'xlink:href', 'fill', 'stroke', 'stroke-width', 'd', 'viewBox'],
    ALLOW_DATA_ATTR: true, // Permitir atributos data-*
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  };

  return DOMPurify.sanitize(content, config);
}

/**
 * Procesa bloques de código en HTML para mejorar la seguridad
 * Elimina scripts potencialmente peligrosos
 */
export function processCodeBlocks(html: string): string {
  // Asegura que los bloques de código no contengan scripts ejecutables
  return html.replace(/<code(.*?)>([\s\S]*?)<\/code>/gi, (_match, attributes, content) => {
    // Escapa cualquier HTML que pueda estar dentro del bloque de código
    const escapedContent = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    return `<code${attributes}>${escapedContent}</code>`;
  });
}

/**
 * Verifica si una URL es segura para enlaces
 */
export function isSafeUrl(url: string): boolean {
  // Verifica si la URL no es un javascript: o data: URI malicioso
  return !(
    url.toLowerCase().startsWith('javascript:') || 
    (url.toLowerCase().startsWith('data:') && !url.toLowerCase().startsWith('data:image/'))
  );
}

/**
 * Convierte texto plano a HTML seguro preservando saltos de línea
 */
export function textToSafeHtml(text: string): string {
  return sanitizeHtml(
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
  );
}

/**
 * Extrae una lista de todas las URLs incluidas en el contenido
 */
export function extractUrls(content: string): string[] {
  const urls: string[] = [];
  const urlRegex = /https?:\/\/[^\s)\]"']+/g;
  let match;
  
  while ((match = urlRegex.exec(content)) !== null) {
    if (isSafeUrl(match[0])) {
      urls.push(match[0]);
    }
  }
  
  return urls;
}