import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { app, dialog } from 'electron';
import { Document, DocumentMetadata, DocumentVersion, MarkdownFormat } from '../../shared/types/Document';
import { eventBus } from '../../core/events/EventBus';
import { DocumentEventType } from '../../core/events/EventTypes';
import { PATHS, APP_CONSTANTS } from '../../config/defaults';

/**
 * Servicio principal para gestión de documentos Markdown
 * Implementa funcionalidades CRUD y optimizaciones para sostenibilidad
 */
export class DocumentService {
  // Métodos stub para implementaciones futuras
  public updateMetadata(id: string, metadata: Partial<any>): Promise<any> {
    return this.updateDocument(id, { metadata });
  }
  
  public updateDocumentPath(id: string, newPath: string): Promise<any> {
    return this.updateDocument(id, { path: newPath });
  }
  
  public updateTags(id: string, tags: string[]): Promise<any> {
    return this.updateDocument(id, { tags });
  }
  
  public getDocumentStats(): Promise<any> {
    return Promise.resolve({
      totalDocuments: 0,
      totalSize: 0,
      averageSize: 0,
      categories: {}
    });
  }
  
  public invalidateCache(documentId?: string): void {
    if (documentId) {
      this.documentsCache.delete(documentId);
    } else {
      this.documentsCache.clear();
    }
  }

  /**
   * Importa un archivo Markdown del sistema de archivos
   * Implementa procesamiento eficiente y sostenible
   */
  public async importFile(filePath: string, targetPath: string = '/'): Promise<Document> {
    this.ensureInitialized();
    
    try {
      // Leer contenido del archivo
      const content = await fs.promises.readFile(filePath, 'utf8');
      const fileName = path.basename(filePath);
      const title = fileName.replace(/\.[^/.]+$/, ''); // Elimina extensión
      
      // Crea documento nuevo con el contenido importado
      const document = await this.createDocument(
        title,
        content,
        targetPath,
        this.detectMarkdownFormat(content),
        this.extractTagsFromContent(content)
      );
      
      // Actualiza metadatos con información sobre la importación
      const stats = await fs.promises.stat(filePath);
      const updatedMetadata = {
        ...document.metadata,
        importSource: {
          originalPath: filePath,
          importedAt: new Date().toISOString(),
          originalSize: stats.size,
          originalModified: stats.mtime.toISOString()
        }
      };
      
      await this.updateMetadata(document.id, updatedMetadata);
      
      // Emite evento de importación
      eventBus.emit(DocumentEventType.DOCUMENT_IMPORTED, { 
        documentId: document.id,
        sourcePath: filePath,
        format: document.format || document.metadata?.format || 'markdown' // Aseguramos que siempre haya un valor
      });
      
      return document;
    } catch (error) {
      console.error(`Error importando archivo ${filePath}:`, error);
      throw new Error(`No se pudo importar el archivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Importa múltiples archivos en un lote
   * Optimizado para consumo eficiente de recursos
   */
  public async importFiles(filePaths: string[], targetPath: string = '/'): Promise<Document[]> {
    this.ensureInitialized();
    
    // Importación en lotes para optimizar recursos
    const documents: Document[] = [];
    const batchSize = 5; // Procesar archivos en lotes de 5
    
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize);
      const batchPromises = batch.map(filePath => this.importFile(filePath, targetPath));
      
      // Procesa lote y espera a que termine antes de siguiente lote
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Filtra resultados exitosos
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          documents.push(result.value);
        } else {
          console.error(`Error importando ${batch[index]}:`, result.reason);
        }
      });
      
      // Pausa breve entre lotes para permitir que el sistema responda
      // y evitar sobrecargar recursos
      if (i + batchSize < filePaths.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return documents;
  }
  
  /**
   * Importa una carpeta completa de archivos Markdown
   * Implementa procesamiento recursivo eficiente
   */
  public async importFolder(
    folderPath: string, 
    targetPath: string = '/',
    options: { recursive?: boolean; preserveStructure?: boolean } = {}
  ): Promise<{ documents: Document[]; folders: string[] }> {
    this.ensureInitialized();
    
    const { recursive = true, preserveStructure = true } = options;
    const documents: Document[] = [];
    const folders: string[] = [];
    
    try {
      // Lee contenido de la carpeta
      const files = await fs.promises.readdir(folderPath, { withFileTypes: true });
      const markdownFiles: string[] = [];
      
      // Procesa archivos y carpetas
      for (const file of files) {
        const fullPath = path.join(folderPath, file.name);
        
        if (file.isDirectory() && recursive) {
          // Si es directorio y recursivo está habilitado
          let newTargetPath = targetPath;
          
          if (preserveStructure) {
            // Crear la misma estructura de carpetas en la app
            newTargetPath = path.join(targetPath, file.name);
            folders.push(newTargetPath);
          }
          
          // Procesa carpeta recursivamente
          const result = await this.importFolder(fullPath, newTargetPath, options);
          documents.push(...result.documents);
          folders.push(...result.folders);
        } else if (file.isFile() && /\.(md|markdown)$/i.test(file.name)) {
          // Si es archivo Markdown, lo añade a la lista para procesamiento en lote
          markdownFiles.push(fullPath);
        }
      }
      
      // Procesa archivos Markdown en lotes
      if (markdownFiles.length > 0) {
        const importedDocs = await this.importFiles(markdownFiles, targetPath);
        documents.push(...importedDocs);
      }
      
      return { documents, folders };
    } catch (error) {
      console.error(`Error importando carpeta ${folderPath}:`, error);
      throw new Error(`No se pudo importar la carpeta: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Muestra diálogo para seleccionar archivos y los importa
   */
  public async showImportFileDialog(parentWindow: Electron.BrowserWindow): Promise<Document[]> {
    const result = await dialog.showOpenDialog(parentWindow, {
      title: 'Importar archivos Markdown',
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
      properties: ['openFile', 'multiSelections']
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }
    
    return this.importFiles(result.filePaths);
  }
  
  /**
   * Muestra diálogo para seleccionar carpeta y la importa
   */
  public async showImportFolderDialog(
    parentWindow: Electron.BrowserWindow,
    options: { recursive?: boolean; preserveStructure?: boolean } = {}
  ): Promise<{ documents: Document[]; folders: string[] }> {
    const result = await dialog.showOpenDialog(parentWindow, {
      title: 'Importar carpeta de documentos',
      properties: ['openDirectory']
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return { documents: [], folders: [] };
    }
    
    return this.importFolder(result.filePaths[0], '/', options);
  }
  
  /**
   * Muestra diálogo para abrir archivo(s) Markdown
   * Optimizado para rendimiento y eficiencia energética
   * Con manejo mejorado de errores
   */
  public async showOpenFileDialog(parentWindow: Electron.BrowserWindow): Promise<Document | null> {
    try {
      // Muestra diálogo nativo de selección de archivo
      const result = await dialog.showOpenDialog(parentWindow, {
        title: 'Abrir archivo Markdown',
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        properties: ['openFile']
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }
      
      const filePath = result.filePaths[0];
      
      // Verifica que el archivo exista y sea legible
      try {
        const stats = await fs.promises.stat(filePath);
        if (!stats.isFile()) {
          throw new Error(`La ruta seleccionada no es un archivo: ${filePath}`);
        }
      } catch (fileError) {
        console.error(`Error accediendo a archivo ${filePath}:`, fileError);
        throw new Error(`No se puede acceder al archivo seleccionado: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
      }
      
      try {
        // Importa el archivo seleccionado con manejo mejorado
        const document = await this.importFile(filePath);
        
        if (!document || !document.id) {
          throw new Error('Error importando documento: estructura inválida');
        }
        
        // Establece el documento como activo
        return await this.setActiveDocument(document.id);
      } catch (importError) {
        console.error(`Error procesando archivo ${filePath}:`, importError);
        
        // Muestra un mensaje más amigable al usuario
        throw new Error(`No se pudo abrir el archivo. ${importError instanceof Error ? importError.message : 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error en diálogo de apertura:', error);
      throw new Error(`No se pudo abrir el archivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Muestra diálogo para abrir una carpeta con documentos Markdown
   * Implementa estrategia progresiva de carga para óptima experiencia
   */
  public async showOpenFolderDialog(
    parentWindow: Electron.BrowserWindow,
    options: { 
      recursive?: boolean; 
      preserveStructure?: boolean;
      loadProgressCallback?: (loaded: number, total: number) => void;
    } = {}
  ): Promise<{ rootFolder: string; documents: Document[]; folders: string[] }> {
    try {
      const result = await dialog.showOpenDialog(parentWindow, {
        title: 'Abrir carpeta de documentos',
        properties: ['openDirectory']
      });
      
      if (result.canceled || result.filePaths.length === 0) {
        return { rootFolder: '', documents: [], folders: [] };
      }
      
      const rootFolder = result.filePaths[0];
      
      // Configura opciones por defecto si no se proporcionan
      const importOptions = {
        recursive: options.recursive !== undefined ? options.recursive : true,
        preserveStructure: options.preserveStructure !== undefined ? options.preserveStructure : true
      };
      
      // Importa la carpeta con los documentos
      const result2 = await this.importFolder(rootFolder, '/', importOptions);
      
      return {
        rootFolder,
        documents: result2.documents,
        folders: result2.folders
      };
    } catch (error) {
      console.error('Error abriendo carpeta:', error);
      throw new Error(`No se pudo abrir la carpeta: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Abre un archivo específico desde su ruta en el sistema
   * Optimizado para apertura directa sin diálogo con carga progresiva
   * Implementa carga rápida y renderizado optimizado
   */
  public async openFile(filePath: string): Promise<Document | null> {
    this.ensureInitialized();
    
    try {
      // Validaciones rápidas primero para fallo temprano
      if (!filePath || typeof filePath !== 'string') {
        throw new Error('Ruta de archivo inválida o vacía');
      }
      
      // Normaliza la ruta para evitar problemas con separadores
      const normalizedPath = path.normalize(filePath);
      
      // Verifica que sea un archivo Markdown por extensión (verificación rápida)
      if (!/\.(md|markdown)$/i.test(normalizedPath)) {
        throw new Error('El archivo no es un documento Markdown válido');
      }
      
      // Validación asíncrona en paralelo para optimizar tiempo
      const [fileStats] = await Promise.all([
        fs.promises.stat(normalizedPath).catch(err => {
          throw new Error(`El archivo ${normalizedPath} no existe o no se puede acceder`);
        })
      ]);
      
      // Verifica que sea un archivo (no directorio)
      if (!fileStats.isFile()) {
        throw new Error(`La ruta ${normalizedPath} no es un archivo`);
      }
      
      // Verifica tamaño razonable (evita archivos demasiado grandes)
      const MAX_SIZE = 15 * 1024 * 1024; // 15MB
      if (fileStats.size > MAX_SIZE) {
        throw new Error(`El archivo es demasiado grande (${(fileStats.size / 1024 / 1024).toFixed(2)}MB). Máximo recomendado: 15MB`);
      }
      
      // Para archivos grandes, implementa carga progresiva
      let document: Document;
      
      if (fileStats.size > 1 * 1024 * 1024) { // Si es mayor a 1MB
        // Lee el contenido del archivo en partes
        document = await this.importLargeFile(normalizedPath, fileStats.size);
      } else {
        // Para archivos pequeños, usa el método estándar
        document = await this.importFile(normalizedPath);
      }
      
      if (!document || !document.id) {
        throw new Error('Error importando documento: estructura inválida');
      }
      
      // Establece como documento activo y devuelve resultado
      return await this.setActiveDocument(document.id);
    } catch (error) {
      console.error(`Error abriendo archivo ${filePath}:`, error);
      throw new Error(`Error al abrir archivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Importa archivo grande con carga progresiva
   * Optimizado para rendimiento y memoria
   */
  private async importLargeFile(filePath: string, fileSize: number): Promise<Document> {
    // Genera ID único para el documento
    const id = uuidv4();
    const fileName = path.basename(filePath);
    const title = fileName.replace(/\.[^/.]+$/, '');
    
    try {
      // Abre el archivo para lectura por partes
      const fileHandle = await fs.promises.open(filePath, 'r');
      
      // Lee primeros 100KB para mostrar rápidamente
      const PREVIEW_SIZE = 100 * 1024; // 100KB
      const buffer = Buffer.alloc(Math.min(PREVIEW_SIZE, fileSize));
      await fileHandle.read(buffer, 0, buffer.length, 0);
      const previewContent = buffer.toString('utf8');
      
      // Crea documento con contenido parcial
      const now = new Date().toISOString();
      const initialDocument: Document = {
        id,
        title,
        content: previewContent,
        createdAt: now,
        updatedAt: now,
        path: '/',
        tags: this.extractTagsFromContent(previewContent),
        metadata: {
          author: 'Usuario',
          wordCount: this.countWords(previewContent),
          readingTime: Math.max(1, Math.round(this.countWords(previewContent) / 200)),
          format: this.detectMarkdownFormat(previewContent),
          isPartialContent: true, // Marca que el contenido está incompleto
          totalSize: fileSize,
          loadedSize: buffer.length,
          sustainability: {
            optimizedSize: buffer.length,
            originalSize: fileSize,
            contentReuseFactor: 1.0,
            editingEnergyUsage: 0,
            syncEnergyCost: 0
          },
          custom: {
            sourceFilePath: filePath // Guardamos ruta original para carga completa posterior
          }
        },
        version: 1
      };
      
      // Guarda referencia del documento en caché
      this.documentsCache.set(id, initialDocument);
      
      // Inicia carga completa en segundo plano
      this.loadFullContentInBackground(fileHandle, id, filePath, fileSize, buffer.length);
      
      return initialDocument;
    } catch (error) {
      console.error(`Error cargando archivo grande ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Carga el contenido completo de un archivo grande en segundo plano
   * Sin bloquear la interfaz de usuario
   */
  private async loadFullContentInBackground(
    fileHandle: fs.promises.FileHandle,
    documentId: string, 
    filePath: string,
    totalSize: number,
    alreadyLoaded: number
  ): Promise<void> {
    try {
      // Obtén el documento actual de la caché
      const document = this.documentsCache.get(documentId);
      if (!document) {
        throw new Error(`Documento ${documentId} no encontrado en caché`);
      }
      
      // Lee el archivo completo
      const fullContent = await fs.promises.readFile(filePath, 'utf8');
      
      // Actualiza documento con contenido completo
      const updatedDocument: Document = {
        ...document,
        content: fullContent,
        metadata: {
          ...document.metadata,
          isPartialContent: false,
          wordCount: this.countWords(fullContent),
          readingTime: Math.max(1, Math.round(this.countWords(fullContent) / 200)),
          loadedSize: totalSize,
        }
      };
      
      // Actualiza la caché
      this.documentsCache.set(documentId, updatedDocument);
      
      // Guarda el documento completo
      await this.saveDocument(updatedDocument);
      
      // Emite evento de carga completa
      eventBus.emit(DocumentEventType.DOCUMENT_CONTENT_LOADED, { 
        documentId, 
        contentSize: totalSize 
      });
      
      // Cierra el manejador de archivo
      await fileHandle.close();
    } catch (error) {
      console.error(`Error cargando contenido completo para ${documentId}:`, error);
      try {
        await fileHandle.close();
      } catch (closeError) {
        console.error(`Error cerrando archivo:`, closeError);
      }
    }
  }
  private documentsPath: string;
  private documentsCache: Map<string, Document> = new Map();
  private documentVersionsCache: Map<string, DocumentVersion[]> = new Map();
  private activeDocument: Document | null = null;
  private initialized: boolean = false;

  constructor() {
    // Inicializa ruta base para documentos
    this.documentsPath = path.join(app.getPath('userData'), PATHS.documents);
  }

  /**
   * Inicializa el servicio de documentos y verifica la estructura de directorios
   */
  public async initialize(): Promise<void> {
    try {
      // Asegura que exista el directorio de documentos
      await fs.promises.mkdir(this.documentsPath, { recursive: true });
      
      // Verifica permisos de escritura
      try {
        const testFile = path.join(this.documentsPath, '.test_write');
        await fs.promises.writeFile(testFile, 'test', 'utf8');
        await fs.promises.unlink(testFile);
      } catch (writeError) {
        console.error('Error: No hay permisos de escritura en el directorio de documentos:', writeError);
        throw new Error('No hay permisos de escritura en el directorio de documentos');
      }
      
      // Intenta limpiar archivos temporales que pudieron quedar de sesiones anteriores
      try {
        const files = await fs.promises.readdir(this.documentsPath);
        const tempFiles = files.filter(file => file.endsWith('.tmp'));
        
        for (const tempFile of tempFiles) {
          try {
            await fs.promises.unlink(path.join(this.documentsPath, tempFile));
            console.log(`Archivo temporal eliminado: ${tempFile}`);
          } catch (err) {
            console.warn(`No se pudo eliminar archivo temporal: ${tempFile}`, err);
          }
        }
      } catch (err) {
        console.warn('Error buscando archivos temporales:', err);
      }
      
      // Inicializa cache con documentos existentes (bajo demanda)
      // No carga todos para optimizar memoria y arranque
      
      this.initialized = true;
      console.log(`Servicio de documentos inicializado en: ${this.documentsPath}`);
    } catch (error) {
      console.error('Error inicializando servicio de documentos:', error);
      this.initialized = false;
      throw new Error(`Error de inicialización: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Crea un nuevo documento
   */
  public async createDocument(
    title: string,
    content: string = '',
    path: string = '',
    format: MarkdownFormat = 'gfm',
    tags: string[] = []
  ): Promise<Document> {
    this.ensureInitialized();
    
    // Genera ID único
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Analiza document para métricas iniciales
    const wordCount = this.countWords(content);
    const readingTime = Math.max(1, Math.round(wordCount / 200)); // ~200 palabras por minuto
    
    // Crea metadatos iniciales
    const metadata: DocumentMetadata = {
      author: 'Usuario', // En versión real, obtendríamos de usuario activo
      wordCount,
      readingTime,
      format,
      sustainability: {
        optimizedSize: Buffer.from(content).length,
        originalSize: Buffer.from(content).length,
        contentReuseFactor: 1.0,
        editingEnergyUsage: 0,
        syncEnergyCost: 0
      },
      custom: {}
    };
    
    // Crea objeto de documento
    const document: Document = {
      id,
      title,
      content,
      createdAt: now,
      updatedAt: now,
      path: path,
      tags,
      metadata,
      version: 1
    };
    
    // Guarda el documento
    await this.saveDocument(document);
    
    // Actualiza cache
    this.documentsCache.set(id, document);
    this.documentVersionsCache.set(id, [
      this.createVersionFromDocument(document, 'Versión inicial')
    ]);
    
    // Emite evento de creación
    eventBus.emit(DocumentEventType.DOCUMENT_CREATED, { documentId: id });
    
    return document;
  }

  /**
   * Obtiene un documento por su ID
   */
  public async getDocument(id: string): Promise<Document> {
    this.ensureInitialized();
    
    // Verifica si está en cache
    if (this.documentsCache.has(id)) {
      return this.documentsCache.get(id)!;
    }
    
    // Si no está en cache, intenta cargar desde disco
    try {
      const documentPath = this.getDocumentFilePath(id);
      
      // Verifica si el archivo existe
      try {
        await fs.promises.access(documentPath, fs.constants.F_OK);
      } catch (err) {
        throw new Error(`Archivo para documento ${id} no existe`);
      }
      
      // Lee el archivo
      const content = await fs.promises.readFile(documentPath, 'utf8');
      
      // Valida que el contenido no esté vacío
      if (!content || content.trim() === '') {
        throw new Error(`Archivo para documento ${id} está vacío`);
      }
      
      // Intenta parsear el JSON con mejor manejo de errores
      let document: Document;
      try {
        document = JSON.parse(content) as Document;
      } catch (parseError) {
        console.error(`Error parseando JSON para documento ${id}:`, parseError);
        throw new Error(`Formato JSON inválido para documento ${id}`);
      }
      
      // Valida que el documento tenga estructura correcta
      if (!document || !document.id || !document.title) {
        throw new Error(`Estructura de documento ${id} es inválida`);
      }
      
      // Actualiza cache
      this.documentsCache.set(id, document);
      
      return document;
    } catch (error) {
      console.error(`Error cargando documento ${id}:`, error);
      throw new Error(`Documento con ID ${id} no encontrado: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Actualiza un documento existente
   */
  public async updateDocument(
    id: string,
    updates: Partial<Omit<Document, 'id' | 'createdAt'>> & { version?: number },
    createVersion: boolean = true
  ): Promise<Document> {
    this.ensureInitialized();
    
    // Obtiene documento actual
    const document = await this.getDocument(id);
    const oldContent = document.content;
    
    // Aplica actualizaciones
    const updatedDocument: Document = {
      ...document,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Si cambió el contenido, actualiza metadatos relacionados
    if (updates.content && updates.content !== oldContent) {
      const wordCount = this.countWords(updates.content);
      const readingTime = Math.max(1, Math.round(wordCount / 200));
      
      // Actualiza métricas de sostenibilidad
      const originalSize = Buffer.from(updates.content).length;
      const optimizedSize = this.optimizeContent(updates.content).length;
      
      updatedDocument.metadata = {
        ...updatedDocument.metadata,
        wordCount,
        readingTime,
        sustainability: {
          ...updatedDocument.metadata.sustainability!,
          optimizedSize,
          originalSize,
          // Incrementamos energía usada en edición (estimación)
          editingEnergyUsage: (updatedDocument.metadata.sustainability?.editingEnergyUsage || 0) + 0.01,
        }
      };
      
      // Incrementa versión si es necesario
      if (createVersion) {
        updatedDocument.version = document.version + 1;
      }
    }
    
    // Guarda documento actualizado
    await this.saveDocument(updatedDocument);
    
    // Actualiza cache
    this.documentsCache.set(id, updatedDocument);
    
    // Si se debe crear versión, lo hacemos
    if (createVersion && updates.content && updates.content !== oldContent) {
      await this.createDocumentVersion(updatedDocument, `Actualización ${updatedDocument.version}`);
    }
    
    // Emite evento de actualización
    eventBus.emit(DocumentEventType.DOCUMENT_UPDATED, { 
      documentId: id,
      changeType: updates.content ? (updates.metadata ? 'both' : 'content') : 'metadata'
    });
    
    return updatedDocument;
  }

  /**
   * Guarda un documento al disco de manera optimizada y segura
   * Implementa estrategia para evitar corrupción de archivos
   */
  private async saveDocument(document: Document): Promise<void> {
    // Asegura que el directorio de documentos existe
    await fs.promises.mkdir(this.documentsPath, { recursive: true });
    
    const documentPath = this.getDocumentFilePath(document.id);
    const tempPath = `${documentPath}.tmp`;
    
    try {
      // Verifica que el documento tiene los campos requeridos
      if (!document.id || !document.title) {
        throw new Error(`Intento de guardar documento con estructura inválida: ${document.id}`);
      }
      
      // Optimiza contenido antes de guardar si es necesario
      let dataToSave: string;
      if (document.content.length > 1000) { // Solo optimiza si vale la pena
        const optimizedContent = this.optimizeContent(document.content);
        const documentToSave = { ...document, _optimizedContent: optimizedContent };
        dataToSave = JSON.stringify(documentToSave);
      } else {
        dataToSave = JSON.stringify(document);
      }
      
      // Validamos que el JSON sea válido antes de guardar
      try {
        JSON.parse(dataToSave);
      } catch (err) {
        throw new Error(`JSON inválido generado para documento ${document.id}`);
      }
      
      // Guarda primero a un archivo temporal
      await fs.promises.writeFile(tempPath, dataToSave, 'utf8');
      
      // Verifica que se guardó correctamente
      const savedContent = await fs.promises.readFile(tempPath, 'utf8');
      if (!savedContent || savedContent.trim() === '') {
        throw new Error(`Archivo temporal vacío para documento ${document.id}`);
      }
      
      // Intenta parsear para verificar integridad
      JSON.parse(savedContent);
      
      // Si todo está bien, realiza un reemplazo atómico
      if (process.platform === 'win32') {
        // En Windows, primero elimina el destino si existe
        try {
          await fs.promises.access(documentPath);
          await fs.promises.unlink(documentPath);
        } catch (err) {
          // No hay problema si no existía
        }
      }
      
      // Renombra el temporal al final
      await fs.promises.rename(tempPath, documentPath);
      
      // Emite evento de guardado
      eventBus.emit(DocumentEventType.DOCUMENT_SAVED, { 
        documentId: document.id,
        path: document.path || this.getDocumentFilePath(document.id),
        size: Buffer.from(dataToSave).length,
        isAutosave: false
      });
    } catch (error) {
      console.error(`Error guardando documento ${document.id}:`, error);
      
      // Limpia archivo temporal si hubo error
      try {
        await fs.promises.access(tempPath);
        await fs.promises.unlink(tempPath);
      } catch (err) {
        // Ignora error si no existe
      }
      
      throw error;
    }
  }

  /**
   * Elimina un documento
   */
  public async deleteDocument(id: string): Promise<void> {
    this.ensureInitialized();
    
    const documentPath = this.getDocumentFilePath(id);
    
    try {
      // Verifica que exista
      await fs.promises.access(documentPath);
      
      // Elimina archivo
      await fs.promises.unlink(documentPath);
      
      // Elimina de cache
      this.documentsCache.delete(id);
      this.documentVersionsCache.delete(id);
      
      // Si era el documento activo, lo limpia
      if (this.activeDocument?.id === id) {
        this.activeDocument = null;
      }
      
      // Emite evento de eliminación
      eventBus.emit(DocumentEventType.DOCUMENT_DELETED, { documentId: id });
    } catch (error) {
      console.error(`Error eliminando documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Establece el documento activo actual
   */
  public async setActiveDocument(id: string): Promise<Document> {
    this.ensureInitialized();
    
    const document = await this.getDocument(id);
    this.activeDocument = document;
    
    // Emite evento de selección
    eventBus.emit(DocumentEventType.DOCUMENT_SELECTED, { documentId: id });
    
    return document;
  }

  /**
   * Obtiene el documento activo actual
   */
  public getActiveDocument(): Document | null {
    return this.activeDocument;
  }

  /**
   * Crea una nueva versión de un documento
   */
  private async createDocumentVersion(
    document: Document,
    commitMessage?: string
  ): Promise<DocumentVersion> {
    const version = this.createVersionFromDocument(document, commitMessage);
    
    // Obtiene versiones existentes o inicializa
    if (!this.documentVersionsCache.has(document.id)) {
      this.documentVersionsCache.set(document.id, []);
    }
    
    const versions = this.documentVersionsCache.get(document.id)!;
    versions.push(version);
    
    // Limita a un número máximo de versiones en memoria (podríamos guardarlas en disco)
    if (versions.length > 20) {
      versions.shift(); // Elimina la más antigua
    }
    
    // Emite evento de versión creada
    eventBus.emit(DocumentEventType.VERSION_CREATED, { 
      documentId: document.id,
      versionId: version.id,
      comment: version.commitMessage
    });
    
    return version;
  }

  /**
   * Crea un objeto de versión a partir de un documento
   */
  private createVersionFromDocument(
    document: Document,
    commitMessage?: string
  ): DocumentVersion {
    return {
      id: uuidv4(),
      documentId: document.id,
      content: document.content,
      commitMessage,
      timestamp: new Date().toISOString(),
      version: document.version,
      author: document.metadata.author,
      sustainabilityMetrics: {
        diffSize: 0, // En implementación real calcularíamos diferencia
        compressionRatio: document.metadata.sustainability ? 
          document.metadata.sustainability.optimizedSize / document.metadata.sustainability.originalSize : 1.0
      }
    };
  }

  /**
   * Obtiene la lista de versiones de un documento
   */
  public async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    this.ensureInitialized();
    
    // Si no tenemos versiones en cache, devolvemos lista vacía
    // En implementación real cargaríamos de base de datos/disco
    if (!this.documentVersionsCache.has(documentId)) {
      return [];
    }
    
    return this.documentVersionsCache.get(documentId)!;
  }

  /**
   * Restaura una versión anterior de un documento
   */
  public async restoreVersion(
    documentId: string,
    versionId: string
  ): Promise<Document> {
    this.ensureInitialized();
    
    // Verifica que exista el documento
    const document = await this.getDocument(documentId);
    
    // Busca la versión
    const versions = await this.getDocumentVersions(documentId);
    const versionToRestore = versions.find(v => v.id === versionId);
    
    if (!versionToRestore) {
      throw new Error(`Versión ${versionId} no encontrada para documento ${documentId}`);
    }
    
    // Restaura contenido pero incrementa número de versión
    const restoredDocument = await this.updateDocument(documentId, {
      content: versionToRestore.content,
      version: document.version + 1
    });
    
    // Emite evento de restauración
    eventBus.emit(DocumentEventType.VERSION_RESTORED, { 
      documentId,
      versionId
    });
    
    return restoredDocument;
  }

  /**
   * Lista todos los documentos disponibles
   * Implementación eficiente que carga metadatos bajo demanda
   * con manejo mejorado de errores para archivos corruptos
   */
  public async listDocuments(): Promise<Document[]> {
    this.ensureInitialized();
    
    try {
      // Asegura que el directorio existe
      try {
        await fs.promises.access(this.documentsPath, fs.constants.F_OK);
      } catch (err) {
        // Si no existe, crea el directorio
        await fs.promises.mkdir(this.documentsPath, { recursive: true });
        console.log(`Directorio de documentos creado en: ${this.documentsPath}`);
        return []; // No hay documentos aún
      }
      
      // Lista archivos en directorio de documentos
      const files = await fs.promises.readdir(this.documentsPath);
      const documentFiles = files.filter(file => file.endsWith('.json'));
      
      // Carga documentos que no estén ya en cache
      const documents: Document[] = [];
      const loadPromises: Promise<void>[] = [];
      
      // Procesamiento en lotes para mejor rendimiento
      for (const file of documentFiles) {
        const id = path.basename(file, '.json');
        
        if (this.documentsCache.has(id)) {
          documents.push(this.documentsCache.get(id)!);
        } else {
          // Creamos una promesa que maneja sus propios errores sin rechazar
          const loadPromise = (async () => {
            try {
              const filePath = path.join(this.documentsPath, file);
              
              // Verifica tamaño del archivo para evitar archivos vacíos
              const stats = await fs.promises.stat(filePath);
              if (stats.size === 0) {
                console.warn(`Archivo vacío encontrado: ${file}. Saltando.`);
                return;
              }
              
              // Lee y procesa el documento
              const content = await fs.promises.readFile(filePath, 'utf8');
              if (!content || content.trim() === '') {
                console.warn(`Contenido vacío en ${file}. Saltando.`);
                return;
              }
              
              let doc: Document;
              try {
                doc = JSON.parse(content) as Document;
                // Verifica estructura básica
                if (!doc.id || !doc.title) {
                  console.warn(`Estructura inválida en ${file}. Saltando.`);
                  return;
                }
                documents.push(doc);
                this.documentsCache.set(id, doc);
              } catch (parseError) {
                console.error(`Error parseando JSON para ${file}:`, parseError);
                // Opcionalmente, aquí podríamos reparar o eliminar el archivo corrupto
              }
            } catch (error) {
              console.error(`Error procesando documento ${id}:`, error);
              // No propaga el error, permite continuar con otros documentos
            }
          })();
          
          loadPromises.push(loadPromise);
        }
      }
      
      // Espera a que todos los documentos se carguen (o fallen)
      await Promise.all(loadPromises);
      
      // Ordena por fecha de actualización (más recientes primero)
      return documents.sort((a, b) => {
        try {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        } catch (error) {
          // En caso de fechas inválidas
          return 0; 
        }
      });
    } catch (error) {
      console.error('Error listando documentos:', error);
      // Devuelve array vacío en lugar de lanzar error
      return [];
    }
  }

  /**
   * Busca documentos por texto
   * Implementación simple, en versión real usaríamos índice de búsqueda
   */
  public async searchDocuments(query: string): Promise<Document[]> {
    this.ensureInitialized();
    
    if (!query.trim()) {
      return [];
    }
    
    const documents = await this.listDocuments();
    const normalizedQuery = query.toLowerCase();
    
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(normalizedQuery) ||
      doc.content.toLowerCase().includes(normalizedQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
    );
  }

  /**
   * Cuenta palabras en un texto de manera eficiente
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  /**
   * Optimiza contenido para almacenamiento eficiente
   * En implementación real, aplicaríamos compresión
   */
  private optimizeContent(content: string): string {
    // Simulación de optimización - en implementación real
    // aplicaríamos compresión real u otras técnicas
    return content;
  }

  /**
   * Obtiene la ruta completa a un archivo de documento
   */
  private getDocumentFilePath(id: string): string {
    return path.join(this.documentsPath, `${id}.json`);
  }

  /**
   * Verifica que el servicio esté inicializado
   * Si no está inicializado, intenta inicializarlo automáticamente
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      try {
        // Intentamos inicializar automáticamente en lugar de fallar
        this.initialize().catch(error => {
          console.error('Error inicializando automáticamente DocumentService:', error);
          throw new Error('DocumentService no inicializado. Llame a initialize() primero.');
        });
      } catch (error) {
        console.error('Error en la inicialización automática:', error);
        throw new Error('DocumentService no inicializado. Error en inicialización automática.');
      }
    }
  }

  /**
   * Detecta formato de Markdown en base al contenido
   */
  private detectMarkdownFormat(content: string): MarkdownFormat {
    // Detección simple basada en características del contenido
    if (content.includes('<table>') || content.includes('```mermaid')) {
      return 'gfm'; // GitHub Flavored Markdown
    } else if (content.includes('<script>') || content.includes('```math')) {
      return 'custom'; // Formato extendido/personalizado
    } else if (content.match(/^\[.*\]:\s*\S+$/m)) { // Referencias
      return 'commonmark';
    } else {
      return 'markdown'; // Markdown básico
    }
  }

  /**
   * Extrae etiquetas del contenido del documento
   */
  private extractTagsFromContent(content: string): string[] {
    const tags = new Set<string>();
    
    // Buscar hashtags en el contenido
    const hashtagRegex = /(?:^|\s)#([\w\-]+)/g;
    let match;
    while ((match = hashtagRegex.exec(content)) !== null) {
      if (match[1] && match[1].length > 1) { // Evitar caracteres únicos
        tags.add(match[1].toLowerCase());
      }
    }
    
    // Buscar etiquetas en frontmatter YAML
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const frontmatter = content.match(frontmatterRegex);
    if (frontmatter) {
      const tagsLine = frontmatter[1].match(/tags:\s*\[([^\]]*)\]/i);
      if (tagsLine) {
        const tagsStr = tagsLine[1];
        tagsStr.split(',').map(tag => tag.trim()).filter(Boolean).forEach(tag => {
          // Limpia comillas si existen
          const cleanTag = tag.replace(/["']/g, '');
          if (cleanTag) tags.add(cleanTag.toLowerCase());
        });
      }
    }
    
    return Array.from(tags);
  }

  /**
   * Libera recursos
   */
  public dispose(): void {
    this.documentsCache.clear();
    this.documentVersionsCache.clear();
    this.activeDocument = null;
    this.initialized = false;
  }
}

// Exporta instancia singleton para uso compartido
export const documentService = new DocumentService();