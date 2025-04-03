/**
 * Cuenta palabras en un texto de manera eficiente
 * Maneja correctamente espacios múltiples, saltos de línea y otros caracteres especiales
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Valida si ha cambiado realmente el contenido de texto
 */
export function hasContentChanged(currentText: string, newText: string): boolean {
  return currentText !== newText;
}

/**
 * Extrae estadísticas básicas de un texto seleccionado
 */
export function getSelectionStats(selectedText: string): {
  characters: number;
  words: number;
  lines: number;
} {
  if (!selectedText) {
    return {
      characters: 0,
      words: 0,
      lines: 0
    };
  }

  return {
    characters: selectedText.length,
    words: countWords(selectedText),
    lines: selectedText.split('\n').length
  };
}

/**
 * Estima el tiempo de lectura en minutos basado en un texto
 * Considera una velocidad promedio de lectura de 200 palabras por minuto
 */
export function calculateReadingTime(text: string): number {
  const words = countWords(text);
  // 200 palabras por minuto es una velocidad promedio de lectura
  const minutes = words / 200;
  return Math.ceil(minutes);
}

/**
 * Extrae el título de un documento markdown si comienza con encabezado
 * o devuelve un título por defecto
 */
export function extractDocumentTitle(markdown: string, defaultTitle = 'Documento sin título'): string {
  const firstLine = markdown.trim().split('\n')[0];
  if (firstLine && firstLine.startsWith('# ')) {
    return firstLine.substring(2).trim();
  }
  return defaultTitle;
}