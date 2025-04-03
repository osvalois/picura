import { MarkdownFormat } from '../../shared/types/Document';

/**
 * Servicio para analizar y preprocesar archivos antes de su importación.
 * Proporciona funcionalidades para optimizar el proceso de carga, detección de formatos,
 * y análisis preliminar de contenido.
 */
export class FileAnalyzerService {
  /**
   * Analiza un archivo y devuelve información sobre su formato, tamaño y características.
   * @param file Archivo a analizar
   * @param options Opciones de análisis
   * @returns Promesa con el resultado del análisis
   */
  public async analyzeFile(
    file: File,
    options: {
      readContent?: boolean;
      detectFormat?: boolean;
      calculateMetrics?: boolean;
    } = {}
  ): Promise<FileAnalysisResult> {
    const { readContent = true, detectFormat = true, calculateMetrics = true } = options;
    
    // Resultado base con información del archivo
    const result: FileAnalysisResult = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified),
      extension: this.getFileExtension(file.name),
      contentType: this.getContentType(file.name, file.type),
      isTextFile: this.isTextFile(file.name, file.type),
      metrics: {
        wordCount: 0,
        charCount: 0,
        lineCount: 0,
        paragraphCount: 0
      }
    };
    
    let content = '';
    
    // Lee el contenido si es necesario (y si es un archivo de texto)
    if (readContent && result.isTextFile) {
      content = await this.readFileContent(file);
      result.preview = this.generatePreview(content, 500);
      
      if (detectFormat && this.isMarkdownFile(file.name)) {
        result.markdownFormat = this.detectMarkdownFormat(content);
        result.frontmatter = this.extractFrontmatter(content);
        result.tags = this.extractTags(content);
      }
      
      if (calculateMetrics) {
        result.metrics = this.calculateContentMetrics(content);
      }
    }
    
    return result;
  }
  
  /**
   * Analiza múltiples archivos en paralelo, optimizando el rendimiento según la cantidad.
   * @param files Lista de archivos a analizar
   * @param options Opciones de análisis
   * @returns Promesa con resultados de análisis
   */
  public async analyzeFiles(
    files: File[],
    options: {
      readContent?: boolean;
      detectFormat?: boolean;
      calculateMetrics?: boolean;
      concurrency?: number;
    } = {}
  ): Promise<FileAnalysisResult[]> {
    const { concurrency = 4, ...analysisOptions } = options;
    
    // Si hay pocos archivos, procesa todos en paralelo
    if (files.length <= concurrency) {
      return Promise.all(files.map(file => this.analyzeFile(file, analysisOptions)));
    }
    
    // Para muchos archivos, usa un enfoque por lotes
    const results: FileAnalysisResult[] = [];
    
    // Divide los archivos en lotes según la concurrencia
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map(file => this.analyzeFile(file, analysisOptions))
      );
      results.push(...batchResults);
      
      // Pequeña pausa entre lotes para permitir que el sistema responda
      if (i + concurrency < files.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }
  
  /**
   * Lee el contenido de un archivo como texto.
   * @param file Archivo a leer
   * @returns Promesa con el contenido del archivo
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Error al leer el archivo: sin datos'));
        }
      };
      
      reader.onerror = (e) => {
        reject(new Error(`Error al leer el archivo: ${reader.error?.message || 'desconocido'}`));
      };
      
      reader.readAsText(file);
    });
  }
  
  /**
   * Genera una previsualización del contenido limitando su longitud.
   * @param content Contenido completo
   * @param maxLength Longitud máxima de la previsualización
   * @returns Previsualización del contenido
   */
  private generatePreview(content: string, maxLength: number = 500): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Busca el fin de una oración o párrafo próximo al límite
    const endPos = content.indexOf('\n\n', maxLength / 2);
    
    if (endPos !== -1 && endPos < maxLength * 1.5) {
      return content.substring(0, endPos) + '...';
    }
    
    // Si no hay párrafo cercano, corta en un punto o espacio
    const periodPos = content.indexOf('. ', maxLength / 2);
    
    if (periodPos !== -1 && periodPos < maxLength * 1.2) {
      return content.substring(0, periodPos + 1) + '...';
    }
    
    // Último recurso: corta en el límite exacto
    return content.substring(0, maxLength) + '...';
  }
  
  /**
   * Detecta el formato de markdown basado en el contenido.
   * @param content Contenido markdown
   * @returns Formato detectado
   */
  private detectMarkdownFormat(content: string): MarkdownFormat {
    // Detección basada en características específicas
    if (content.match(/^```mermaid/m) || content.match(/^<mermaid/m)) {
      return 'gfm'; // GitHub Flavored Markdown (con diagramas mermaid)
    }
    
    if (content.match(/^```math/m) || content.match(/^\$\$/m)) {
      return 'custom'; // Markdown con soporte para matemáticas
    }
    
    if (content.match(/^\[\^.+\]:/m)) {
      return 'commonmark'; // CommonMark con soporte para notas al pie
    }
    
    if (content.match(/^---\n[\s\S]*?\n---/)) {
      return 'gfm'; // Frontmatter YAML es común en GitHub Flavored Markdown
    }
    
    // Por defecto, asumimos markdown estándar
    return 'markdown';
  }
  
  /**
   * Extrae metadatos del frontmatter de un documento markdown.
   * @param content Contenido del archivo
   * @returns Objeto con los metadatos extraídos, o null si no hay frontmatter
   */
  private extractFrontmatter(content: string): Record<string, any> | null {
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch || !frontmatterMatch[1]) {
      return null;
    }
    
    // Extrae pares clave-valor del frontmatter
    const frontmatter: Record<string, any> = {};
    const lines = frontmatterMatch[1].split('\n');
    
    for (const line of lines) {
      // Busca pares clave: valor
      const match = line.match(/^([^:]+):\s*(.+)$/);
      
      if (match && match[1] && match[2]) {
        const key = match[1].trim();
        let value: any = match[2].trim();
        
        // Intenta convertir valores específicos
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (/^\d+$/.test(value)) value = parseInt(value, 10);
        else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
        else if (value.startsWith('[') && value.endsWith(']')) {
          // Intenta parsear arrays
          try {
            value = value.substring(1, value.length - 1)
              .split(',')
              .map(item => item.trim().replace(/^["']|["']$/g, ''));
          } catch {
            // Si falla el parsing, dejamos el valor como string
          }
        }
        
        frontmatter[key] = value;
      }
    }
    
    return Object.keys(frontmatter).length > 0 ? frontmatter : null;
  }
  
  /**
   * Extrae etiquetas (#tags) de un documento markdown.
   * @param content Contenido del documento
   * @returns Array de etiquetas encontradas
   */
  private extractTags(content: string): string[] {
    const tags = new Set<string>();
    
    // Busca etiquetas en frontmatter
    const frontmatter = this.extractFrontmatter(content);
    
    if (frontmatter && frontmatter['tags']) {
      const frontmatterTags = Array.isArray(frontmatter['tags'])
        ? frontmatter['tags']
        : String(frontmatter['tags']).split(/,\s*/);
      
      frontmatterTags.forEach(tag => tags.add(tag.toLowerCase()));
    }
    
    // Busca hashtags en contenido (#tag)
    const hashtagRegex = /(?:^|\s)#([\w\-]+)/g;
    let match;
    
    while ((match = hashtagRegex.exec(content)) !== null) {
      if (match[1] && match[1].length > 1) {
        tags.add(match[1].toLowerCase());
      }
    }
    
    return Array.from(tags);
  }
  
  /**
   * Calcula métricas básicas del contenido.
   * @param content Contenido a analizar
   * @returns Métricas del contenido
   */
  private calculateContentMetrics(content: string): ContentMetrics {
    // Elimina bloques de código para no contar palabras en código
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, '');
    
    // Cuenta líneas
    const lines = content.split('\n');
    const lineCount = lines.length;
    
    // Cuenta párrafos (bloques separados por doble salto de línea)
    const paragraphs = content.split(/\n\s*\n/);
    const paragraphCount = paragraphs.length;
    
    // Cuenta caracteres (excluyendo espacios en blanco)
    const charCount = content.replace(/\s+/g, '').length;
    
    // Cuenta palabras
    const words = contentWithoutCode
      .replace(/#+\s+/g, '') // Elimina encabezados Markdown
      .replace(/!?\[.*?\]\(.*?\)/g, '') // Elimina enlaces Markdown
      .replace(/[*_`~]/g, '') // Elimina marcadores de estilo
      .trim()
      .split(/\s+/);
    
    const wordCount = words.length;
    
    return {
      wordCount,
      charCount,
      lineCount,
      paragraphCount
    };
  }
  
  /**
   * Obtiene la extensión de un archivo.
   * @param fileName Nombre del archivo
   * @returns Extensión del archivo (con punto)
   */
  private getFileExtension(fileName: string): string {
    const match = fileName.match(/\.([^.]*)$/);
    return match ? `.${match[1].toLowerCase()}` : '';
  }
  
  /**
   * Determina el tipo de contenido basado en el nombre y tipo del archivo.
   * @param fileName Nombre del archivo
   * @param fileType Tipo MIME del archivo
   * @returns Tipo de contenido
   */
  private getContentType(fileName: string, fileType: string): string {
    // Si el tipo MIME es específico, lo usamos
    if (fileType && fileType !== 'application/octet-stream') {
      return fileType;
    }
    
    // Si no, inferimos por extensión
    const extension = this.getFileExtension(fileName).toLowerCase();
    
    const extensionMap: Record<string, string> = {
      '.md': 'text/markdown',
      '.markdown': 'text/markdown',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.ts': 'text/typescript',
      '.csv': 'text/csv',
      '.xml': 'application/xml',
      '.yml': 'application/yaml',
      '.yaml': 'application/yaml',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    
    return extensionMap[extension] || 'application/octet-stream';
  }
  
  /**
   * Determina si un archivo es de texto basado en su nombre y tipo.
   * @param fileName Nombre del archivo
   * @param fileType Tipo MIME del archivo
   * @returns true si es un archivo de texto
   */
  private isTextFile(fileName: string, fileType: string): boolean {
    const textTypes = [
      'text/', 'application/json', 'application/xml',
      'application/javascript', 'application/typescript',
      'application/yaml', 'application/x-yaml'
    ];
    
    // Verifica por tipo MIME
    if (fileType) {
      for (const textType of textTypes) {
        if (fileType.startsWith(textType)) {
          return true;
        }
      }
    }
    
    // Verifica por extensión
    const textExtensions = [
      '.md', '.markdown', '.txt', '.json', '.xml', '.html', 
      '.htm', '.css', '.js', '.ts', '.jsx', '.tsx', '.csv',
      '.yaml', '.yml', '.sh', '.bat', '.ps1', '.log'
    ];
    
    const extension = this.getFileExtension(fileName).toLowerCase();
    return textExtensions.includes(extension);
  }
  
  /**
   * Determina si un archivo es de tipo Markdown.
   * @param fileName Nombre del archivo
   * @returns true si es un archivo Markdown
   */
  private isMarkdownFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName).toLowerCase();
    return extension === '.md' || extension === '.markdown';
  }
}

/**
 * Interfaz para los resultados del análisis de archivos.
 */
export interface FileAnalysisResult {
  name: string;
  type: string;
  size: number;
  lastModified: Date;
  extension: string;
  contentType: string;
  isTextFile: boolean;
  preview?: string;
  markdownFormat?: MarkdownFormat;
  frontmatter?: Record<string, any> | null;
  tags?: string[];
  metrics: ContentMetrics;
}

/**
 * Interfaz para métricas de contenido.
 */
export interface ContentMetrics {
  wordCount: number;
  charCount: number;
  lineCount: number;
  paragraphCount: number;
}

// Exporta instancia singleton
export const fileAnalyzerService = new FileAnalyzerService();