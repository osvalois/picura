/**
 * Tipos de contenido que soporta el visor
 */
export type ContentType = 
  | 'markdown'
  | 'html'
  | 'mermaid'
  | 'image'
  | 'pdf'
  | 'code'
  | 'mixed'
  | 'unknown';

/**
 * Detecta el tipo de contenido basado en el texto o extensión.
 * 
 * @param content Contenido a analizar
 * @param filename Nombre de archivo opcional para ayudar a determinar el tipo
 * @returns Tipo de contenido detectado
 */
export function detectContentType(content: string, filename?: string): ContentType {
  // Si no hay contenido, no podemos determinar el tipo
  if (!content || content.trim() === '') {
    return 'unknown';
  }

  // Verificar por extensión de archivo primero
  if (filename) {
    const extension = filename.toLowerCase().split('.').pop();
    
    if (extension === 'md' || extension === 'markdown') {
      return 'markdown';
    }
    if (extension === 'html' || extension === 'htm') {
      return 'html';
    }
    if (extension === 'mmd' || extension === 'mermaid') {
      return 'mermaid';
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return 'image';
    }
    if (extension === 'pdf') {
      return 'pdf';
    }
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php'].includes(extension || '')) {
      return 'code';
    }
  }

  // Análisis de contenido
  const trimmedContent = content.trim();
  
  // Detectar HTML
  if (
    (trimmedContent.startsWith('<!DOCTYPE html>') || 
     trimmedContent.startsWith('<html') ||
     (trimmedContent.includes('<body') && trimmedContent.includes('</body>'))) ||
    (/<[a-z][\s\S]*>/i.test(trimmedContent) && /<\/[a-z][\s\S]*>/i.test(trimmedContent))
  ) {
    return 'html';
  }
  
  // Detectar Mermaid
  if (
    trimmedContent.startsWith('graph ') ||
    trimmedContent.startsWith('flowchart ') ||
    trimmedContent.startsWith('sequenceDiagram') ||
    trimmedContent.startsWith('classDiagram') ||
    trimmedContent.startsWith('stateDiagram') ||
    trimmedContent.startsWith('gantt') ||
    trimmedContent.startsWith('pie') ||
    trimmedContent.startsWith('er ')
  ) {
    return 'mermaid';
  }
  
  // Detectar Markdown (basándonos en caracteres comunes de Markdown)
  const markdownPatterns = [
    /^#+\s+.+$/m,          // Encabezados
    /^[*-]\s+.+$/m,        // Listas
    /^>\s+.+$/m,           // Citas
    /\[.+\]\(.+\)/,        // Enlaces
    /!\[.+\]\(.+\)/,       // Imágenes
    /^\s*```[\s\S]*```\s*$/m, // Bloques de código
    /\*\*.+\*\*/,          // Texto en negrita
    /\*.+\*/,              // Texto en cursiva
    /^---+$/m,             // Líneas horizontales
    /^===+$/m,             // Líneas horizontales alternativas
    /\|\s+.+\s+\|/         // Tablas
  ];
  
  const markdownMatchCount = markdownPatterns.filter(pattern => pattern.test(trimmedContent)).length;
  
  // Si tiene suficientes patrones de Markdown, consideramos que es Markdown
  if (markdownMatchCount >= 2) {
    return 'markdown';
  }
  
  // Verificar si es código basado en la presencia de ciertos patrones
  const codePatterns = [
    /function\s+\w+\s*\([^)]*\)\s*{/,         // Declaraciones de función en JS, C, etc.
    /class\s+\w+(\s+extends\s+\w+)?\s*{/,     // Clases en JS, Java, etc.
    /import\s+.*\s+from\s+['"].+['"]/,        // Importaciones ES6
    /const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=/, // Declaraciones de variables
    /^\s*<\?php/,                            // PHP
    /^\s*def\s+\w+\s*\(/,                    // Python/Ruby
    /^\s*#include/,                          // C/C++
    /^\s*package\s+\w+/,                     // Java/Go
    /^\s*using\s+\w+/                        // C#
  ];
  
  const codeMatchCount = codePatterns.filter(pattern => pattern.test(trimmedContent)).length;
  
  if (codeMatchCount >= 1) {
    return 'code';
  }
  
  // Si contiene algunas características de Markdown pero también otras cosas, puede ser contenido mixto
  if (markdownMatchCount >= 1) {
    return 'mixed';
  }
  
  // Si no podemos determinar el tipo, asumimos contenido desconocido
  return 'unknown';
}

/**
 * Extraer bloques de Mermaid de contenido Markdown
 */
export function extractMermaidBlocks(content: string): string[] {
  const blocks: string[] = [];
  const regex = /```mermaid\n([\s\S]*?)\n```/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
      blocks.push(match[1].trim());
    }
  }
  
  return blocks;
}