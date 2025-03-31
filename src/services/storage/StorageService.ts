import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import Sqlite3 from 'sqlite3';
import sqlite from 'sqlite';
import { Database } from 'sqlite';
const { open } = sqlite;
import { PATHS, DATABASE_CONFIG } from '../../config/defaults';
import { eventBus } from '../../core/events/EventBus';
import { StorageEventType } from '../../core/events/EventTypes';
import { runWhenIdle } from '../../renderer/utils/performanceUtils';

/**
 * Servicio de almacenamiento que implementa persistencia con enfoque sostenible
 * Optimiza operaciones I/O según modo de energía del sistema
 */
export class StorageService {
  private db: Database | null = null;
  private storagePath: string;
  private initialized: boolean = false;
  private pendingWrites: Map<string, { data: any, timestamp: number }> = new Map();
  private writeInterval: NodeJS.Timeout | null = null;
  private optimizationScheduled: boolean = false;
  private currentEnergyMode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance' = 'standard';

  constructor() {
    // Inicializa ruta base para almacenamiento
    this.storagePath = app.getPath('userData');
  }

  /**
   * Inicializa el servicio de almacenamiento
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Asegura que existan directorios necesarios
      await fs.promises.mkdir(path.join(this.storagePath, PATHS.userData), { recursive: true });
      await fs.promises.mkdir(path.join(this.storagePath, PATHS.documents), { recursive: true });
      await fs.promises.mkdir(path.join(this.storagePath, PATHS.templates), { recursive: true });
      await fs.promises.mkdir(path.join(this.storagePath, PATHS.cache), { recursive: true });

      // Inicia SQLite con configuración optimizada
      const dbPath = path.join(this.storagePath, PATHS.database);
      this.db = await open({
        filename: dbPath,
        driver: Sqlite3.Database
      });

      // Configura optimizaciones según el modo de energía
      await this.configureDatabase();

      // Inicia cola de escritura para operaciones agrupadas
      this.startWriteQueue();

      // Programa optimización en momento de baja actividad
      this.scheduleOptimization();

      this.initialized = true;
      console.log('Servicio de almacenamiento inicializado');

      // Emite evento de inicialización
      eventBus.emit(StorageEventType.STORAGE_INITIALIZED, {
        storagePath: this.storagePath
      });
    } catch (error) {
      console.error('Error inicializando servicio de almacenamiento:', error);
      throw error;
    }
  }

  /**
   * Configura la base de datos SQLite con optimizaciones para rendimiento y sostenibilidad
   */
  private async configureDatabase(): Promise<void> {
    if (!this.db) return;

    // Aplicar pragmas de optimización
    for (const [pragma, value] of Object.entries(DATABASE_CONFIG.pragma)) {
      await this.db.run(`PRAGMA ${pragma} = ${value};`);
    }

    // Habilitar opciones según configuración
    if (DATABASE_CONFIG.statements.preparedStatements) {
      // SQLite usa prepared statements automáticamente
      console.log('Prepared statements habilitados');
    }

    if (DATABASE_CONFIG.statements.enableQueryCache) {
      // La caché de consultas ya está habilitada con WAL
      console.log('Caché de consultas habilitada');
    }

    // Crear tablas si no existen
    await this.createSchemas();
  }

  /**
   * Crea las tablas del esquema de base de datos
   */
  private async createSchemas(): Promise<void> {
    if (!this.db) return;

    // Tabla para documentos (metadatos, no contenido completo)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        path TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        tags TEXT,
        metadata TEXT,
        version INTEGER DEFAULT 1,
        content_path TEXT
      );
    `);

    // Tabla para versiones de documentos
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS document_versions (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        commit_message TEXT,
        timestamp TEXT NOT NULL,
        author TEXT,
        sustainability_metrics TEXT,
        content_path TEXT,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      );
    `);

    // Tabla para configuración y preferencias
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // Tabla para caché
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        ttl INTEGER,
        created_at TEXT NOT NULL
      );
    `);

    // Índices para mejorar búsquedas
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at);
      CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
      CREATE INDEX IF NOT EXISTS idx_cache_ttl ON cache(ttl);
    `);
  }

  /**
   * Inicia cola de escritura para operaciones batch
   */
  private startWriteQueue(): void {
    // Limpia intervalo existente
    if (this.writeInterval) {
      clearInterval(this.writeInterval);
    }

    // Intervalos adaptados al modo de energía
    const intervals = {
      highPerformance: 1000, // 1 segundo
      standard: 5000,        // 5 segundos
      lowPower: 15000,       // 15 segundos
      ultraSaving: 30000     // 30 segundos
    };

    const interval = intervals[this.currentEnergyMode] || intervals.standard;

    // Programa ejecución periódica
    this.writeInterval = setInterval(() => this.processPendingWrites(), interval);
  }

  /**
   * Procesa escrituras pendientes en batch
   */
  private async processPendingWrites(): Promise<void> {
    if (!this.db || this.pendingWrites.size === 0) return;

    const now = Date.now();
    const entries = Array.from(this.pendingWrites.entries());
    let processedCount = 0;

    try {
      // Inicia transacción para operaciones batch
      await this.db.run('BEGIN TRANSACTION');

      for (const [key, { data, timestamp }] of entries) {
        // En modo de ultra ahorro, solo procesa entradas con más de 1 minuto
        const ageMs = now - timestamp;
        if (this.currentEnergyMode === 'ultraSaving' && ageMs < 60000) {
          continue;
        }

        // Extrae tabla y id de la clave
        const [table, id] = key.split(':');

        if (table && id) {
          if (data === null) {
            // Es una operación de eliminación
            await this.db.run(`DELETE FROM ${table} WHERE id = ?`, id);
          } else {
            // Es una operación de inserción/actualización
            // Convertimos objeto a formato columnas/valores para SQL
            const columns = Object.keys(data);
            const placeholders = columns.map(() => '?').join(', ');
            const values = columns.map(col => {
              const val = data[col];
              return typeof val === 'object' ? JSON.stringify(val) : val;
            });

            // Intentamos insertar primero
            const sql = `
              INSERT INTO ${table} (${columns.join(', ')})
              VALUES (${placeholders})
              ON CONFLICT(id) DO UPDATE SET
              ${columns.map(col => `${col} = excluded.${col}`).join(', ')}
            `;

            await this.db.run(sql, ...values);
          }

          // Elimina de la cola
          this.pendingWrites.delete(key);
          processedCount++;
        }
      }

      // Confirma transacción
      await this.db.run('COMMIT');

      if (processedCount > 0) {
        console.log(`Procesadas ${processedCount} operaciones de escritura pendientes`);
        
        // Emite evento de escritura batch
        eventBus.emit(StorageEventType.STORAGE_BATCH_PROCESSED, {
          operationsCount: processedCount
        });
      }
    } catch (error) {
      // Revierte cambios en caso de error
      try {
        if (this.db) await this.db.run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error durante rollback:', rollbackError);
      }

      console.error('Error procesando escrituras pendientes:', error);

      // Emite evento de error
      eventBus.emit(StorageEventType.STORAGE_ERROR, {
        errorMessage: (error as Error).message
      });
    }
  }

  /**
   * Programa optimización de base de datos en momentos de baja actividad
   */
  private scheduleOptimization(): void {
    if (this.optimizationScheduled) return;

    this.optimizationScheduled = true;

    // Programa optimización para momento de baja actividad
    runWhenIdle(() => {
      this.optimizeDatabase().catch(err => {
        console.error('Error optimizando base de datos:', err);
      });
      
      this.optimizationScheduled = false;

      // Programa próxima optimización
      const delay = this.currentEnergyMode === 'highPerformance' ? 
        3600000 : // 1 hora en modo alto rendimiento
        24 * 3600000; // 24 horas en otros modos
      
      setTimeout(() => this.scheduleOptimization(), delay);
    }, 10000);
  }

  /**
   * Optimiza la base de datos para mejorar rendimiento
   */
  private async optimizeDatabase(): Promise<void> {
    if (!this.db) return;

    console.log('Optimizando base de datos...');

    try {
      // Fuerza escritura de todas las operaciones pendientes
      await this.processPendingWrites();

      // Ejecuta VACUUM para optimizar espacio
      await this.db.exec('VACUUM;');
      
      // Actualiza estadísticas para optimizar consultas
      await this.db.exec('ANALYZE;');

      // Limpia caché expirada
      const now = new Date().toISOString();
      await this.db.run('DELETE FROM cache WHERE ttl < ?', now);

      console.log('Optimización de base de datos completada');

      // Emite evento de optimización
      eventBus.emit(StorageEventType.STORAGE_OPTIMIZED, {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error durante optimización de base de datos:', error);
      throw error;
    }
  }

  /**
   * Guarda o actualiza un registro en una tabla
   */
  public async save<T extends { id: string }>(table: string, data: T): Promise<void> {
    this.ensureInitialized();

    // Añade a cola de pendientes
    const key = `${table}:${data.id}`;
    this.pendingWrites.set(key, { data, timestamp: Date.now() });

    // En modo de alto rendimiento, procesamos inmediatamente
    if (this.currentEnergyMode === 'highPerformance') {
      await this.processPendingWrites();
    }
  }

  /**
   * Guarda o actualiza un documento (gestión especial de contenido)
   */
  public async saveDocument<T extends { id: string, content: string }>(document: T): Promise<void> {
    this.ensureInitialized();

    try {
      // Maneja contenido por separado para optimizar BD
      const { content, ...metadata } = document;
      const contentPath = path.join(this.storagePath, PATHS.documents, `${document.id}.md`);

      // Guarda contenido como archivo para mejor rendimiento
      await fs.promises.writeFile(contentPath, content, 'utf8');

      // Actualiza registro en BD con referencia al archivo
      await this.save('documents', {
        ...metadata,
        id: document.id,
        content_path: contentPath
      } as any);

      // Emite evento específico para documentos
      eventBus.emit(StorageEventType.DOCUMENT_SAVED, {
        documentId: document.id
      });
    } catch (error) {
      console.error(`Error guardando documento ${document.id}:`, error);
      throw error;
    }
  }

  /**
   * Elimina un registro
   */
  public async delete(table: string, id: string): Promise<void> {
    this.ensureInitialized();

    // Marca para eliminación
    const key = `${table}:${id}`;
    this.pendingWrites.set(key, { data: null, timestamp: Date.now() });

    // En modo de alto rendimiento, procesamos inmediatamente
    if (this.currentEnergyMode === 'highPerformance') {
      await this.processPendingWrites();
    }
  }

  /**
   * Elimina un documento y su contenido
   */
  public async deleteDocument(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      // Obtiene información del documento para encontrar archivo de contenido
      const document = await this.getById('documents', id);
      
      if (document) {
        // Elimina archivo de contenido si existe - tratamos document como Record<string, unknown>
        const typedDoc = document as Record<string, unknown>;
        if (typedDoc.content_path) {
          try {
            await fs.promises.unlink(typedDoc.content_path as string);
          } catch (err) {
            console.warn(`No se pudo eliminar contenido de documento ${id}:`, err);
          }
        }
        
        // Elimina versiones relacionadas
        await this.delete('document_versions', id);
      }
      
      // Elimina registro de documento
      await this.delete('documents', id);

      // Emite evento específico
      eventBus.emit(StorageEventType.DOCUMENT_DELETED, {
        documentId: id
      });
    } catch (error) {
      console.error(`Error eliminando documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un registro por ID
   */
  public async getById<T>(table: string, id: string): Promise<T | null> {
    this.ensureInitialized();

    if (!this.db) return null;

    try {
      const result = await this.db.get(`SELECT * FROM ${table} WHERE id = ?`, id);
      
      if (!result) return null;

      // Convierte campos JSON a objetos
      return this.parseJsonFields(result) as T;
    } catch (error) {
      console.error(`Error obteniendo registro ${id} de ${table}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un documento completo incluyendo contenido
   */
  public async getDocument<T>(id: string): Promise<T | null> {
    this.ensureInitialized();

    try {
      // Obtiene metadatos del documento
      const document = await this.getById<any>('documents', id);
      
      if (!document) return null;

      // Carga contenido desde archivo
      if (document.content_path) {
        try {
          const content = await fs.promises.readFile(document.content_path, 'utf8');
          return { ...document, content } as unknown as T;
        } catch (err) {
          console.warn(`No se pudo cargar contenido de documento ${id}:`, err);
          return { ...document, content: '' } as unknown as T;
        }
      }

      return document as unknown as T;
    } catch (error) {
      console.error(`Error obteniendo documento ${id}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de una tabla
   */
  public async getAll<T>(table: string, options?: {
    orderBy?: string;
    limit?: number;
    offset?: number;
    where?: string;
    params?: any[];
  }): Promise<T[]> {
    this.ensureInitialized();

    if (!this.db) return [];

    try {
      // Construye consulta SQL
      let sql = `SELECT * FROM ${table}`;
      const params: any[] = [];

      if (options?.where) {
        sql += ` WHERE ${options.where}`;
        if (options.params) {
          params.push(...options.params);
        }
      }

      if (options?.orderBy) {
        sql += ` ORDER BY ${options.orderBy}`;
      }

      if (options?.limit) {
        sql += ` LIMIT ?`;
        params.push(options.limit.toString());

        if (options?.offset) {
          sql += ` OFFSET ?`;
          params.push(options.offset.toString());
        }
      }

      const results = await this.db.all(sql, ...params);
      
      // Convierte campos JSON a objetos
      return results.map(row => this.parseJsonFields(row as Record<string, any>)) as T[];
    } catch (error) {
      console.error(`Error obteniendo registros de ${table}:`, error);
      throw error;
    }
  }

  /**
   * Busca documentos por texto
   */
  public async searchDocuments<T>(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<T[]> {
    this.ensureInitialized();

    if (!this.db || !query.trim()) return [];

    try {
      // Construye consulta de búsqueda (para MVP usamos LIKE)
      // En implementación real usaríamos SQLite FTS5 o un índice de búsqueda
      const searchTerm = `%${query}%`;
      let sql = `
        SELECT * FROM documents 
        WHERE title LIKE ? OR tags LIKE ?
        ORDER BY updated_at DESC
      `;
      const params = [searchTerm, searchTerm];
      
      if (options?.limit) {
        sql += ` LIMIT ? OFFSET ?`;
        params.push(options.limit.toString(), (options.offset || 0).toString());
      }

      const results = await this.db.all(sql, ...params);
      
      // Carga contenido para los resultados
      const documents: any[] = [];
      
      for (const doc of results) {
        const document = this.parseJsonFields(doc);
        
        const typedDoc = document as Record<string, unknown>;
        if (typedDoc.content_path) {
          try {
            const content = await fs.promises.readFile(typedDoc.content_path as string, 'utf8');
            if (content.toLowerCase().includes(query.toLowerCase())) {
              documents.push({ ...document, content });
            }
          } catch (err) {
            console.warn(`No se pudo cargar contenido para búsqueda ${typedDoc.id || 'unknown'}:`, err);
          }
        }
      }

      return documents as T[];
    } catch (error) {
      console.error(`Error buscando documentos por "${query}":`, error);
      throw error;
    }
  }

  /**
   * Guarda valor en caché
   */
  public async setCache<T>(key: string, value: T, ttlMs: number = 3600000): Promise<void> {
    this.ensureInitialized();

    if (!this.db) return;

    try {
      // Calcula tiempo de expiración
      const expiresAt = new Date(Date.now() + ttlMs).toISOString();
      
      // Serializa valor
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      // Guarda en caché
      await this.db.run(
        'INSERT OR REPLACE INTO cache (key, value, ttl, created_at) VALUES (?, ?, ?, ?)',
        key, serializedValue, expiresAt, new Date().toISOString()
      );
    } catch (error) {
      console.error(`Error guardando en caché "${key}":`, error);
      // No propagamos error para que la aplicación siga funcionando
    }
  }

  /**
   * Obtiene valor de caché
   */
  public async getCache<T>(key: string): Promise<T | null> {
    this.ensureInitialized();

    if (!this.db) return null;

    try {
      // Obtiene valor y verifica TTL
      const now = new Date().toISOString();
      const cached = await this.db.get(
        'SELECT value FROM cache WHERE key = ? AND ttl > ?',
        key, now
      );
      
      if (!cached) return null;
      
      // Deserializa valor
      try {
        return JSON.parse(cached.value) as T;
      } catch {
        return cached.value as unknown as T;
      }
    } catch (error) {
      console.error(`Error obteniendo de caché "${key}":`, error);
      return null;
    }
  }

  /**
   * Elimina valor de caché
   */
  public async clearCache(key?: string): Promise<void> {
    this.ensureInitialized();

    if (!this.db) return;

    try {
      if (key) {
        // Elimina clave específica
        await this.db.run('DELETE FROM cache WHERE key = ?', key);
      } else {
        // Elimina toda la caché
        await this.db.run('DELETE FROM cache');
      }
    } catch (error) {
      console.error('Error limpiando caché:', error);
    }
  }

  /**
   * Actualiza el modo de energía para optimizar operaciones
   */
  public setEnergyMode(mode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance'): void {
    if (this.currentEnergyMode === mode) return;
    
    this.currentEnergyMode = mode;
    console.log(`Modo de energía de almacenamiento cambiado a: ${mode}`);
    
    // Actualiza intervalo de procesamiento de operaciones
    this.startWriteQueue();
    
    // Emite evento
    eventBus.emit(StorageEventType.STORAGE_ENERGY_MODE_CHANGED, {
      mode
    });
  }

  /**
   * Fuerza procesamiento inmediato de operaciones pendientes
   */
  public async flush(): Promise<void> {
    this.ensureInitialized();
    
    await this.processPendingWrites();
  }

  /**
   * Verifica si una tabla existe
   */
  public async tableExists(table: string): Promise<boolean> {
    this.ensureInitialized();

    if (!this.db) return false;

    const result = await this.db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      table
    );

    return !!result;
  }

  /**
   * Convierte campos JSON almacenados como string a objetos
   */
  private parseJsonFields(row: any): any {
    const result = { ...row };
    
    // Campos conocidos que son JSON
    const jsonFields = ['metadata', 'tags', 'sustainability_metrics'];
    
    for (const field of jsonFields) {
      if (result[field] && typeof result[field] === 'string') {
        try {
          result[field] = JSON.parse(result[field]);
        } catch (e) {
          // Si no es JSON válido, dejamos el valor original
        }
      }
    }
    
    return result;
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('StorageService no inicializado. Llame a initialize() primero.');
    }
  }

  /**
   * Libera recursos
   */
  public async dispose(): Promise<void> {
    // Procesa operaciones pendientes
    await this.processPendingWrites();
    
    // Limpia intervalo
    if (this.writeInterval) {
      clearInterval(this.writeInterval);
      this.writeInterval = null;
    }
    
    // Cierra base de datos
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
    
    this.initialized = false;
    this.pendingWrites.clear();
    
    console.log('Servicio de almacenamiento liberado');
  }
}

// Exporta instancia singleton para uso compartido
export const storageService = new StorageService();