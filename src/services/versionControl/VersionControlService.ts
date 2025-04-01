import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { VersionInfo, VersionChange, VersionCommitOptions, VersionHistoryOptions, 
  VersionRestoreOptions, VersionDiff, GitSyncStatus } from '../../shared/types/VersionTypes';
import { Document } from '../../shared/types/Document';
import { eventBus } from '../../core/events/EventBus';
import { VersionControlEventType, DocumentEventType } from '../../core/events/EventTypes';
import { PATHS } from '../../config/defaults';
import { storageService } from '../storage/StorageService';
import { documentService } from '../document/DocumentService';
import { processInChunks } from '../../renderer/utils/performanceUtils';

const execFileAsync = promisify(execFile);

/**
 * Servicio de control de versiones con optimizaciones de sostenibilidad
 * Proporciona capacidades de versionado local y sincronización Git
 */
export class VersionControlService {
  private versionsPath: string;
  private gitEnabled: boolean = false;
  private initialized: boolean = false;
  private currentEnergyMode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance' = 'standard';
  private pendingVersions: Map<string, Document> = new Map();
  private versionInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Inicializa ruta base para versiones
    this.versionsPath = path.join(app.getPath('userData'), PATHS.documents, 'versions');
  }

  /**
   * Inicializa el servicio de control de versiones
   */
  public async initialize(gitEnabled = false): Promise<void> {
    if (this.initialized) return;

    try {
      // Asegura que exista el directorio de versiones
      await fs.promises.mkdir(this.versionsPath, { recursive: true });
      
      // Verifica si Git está disponible si se solicita
      this.gitEnabled = gitEnabled && await this.isGitAvailable();
      
      // Inicia intervalo para versiones automáticas
      this.startVersionInterval();
      
      this.initialized = true;
      console.log(`Servicio de control de versiones inicializado (Git: ${this.gitEnabled ? 'habilitado' : 'deshabilitado'})`);
      
      // Emite evento de inicialización
      eventBus.emit(VersionControlEventType.VERSION_CONTROL_INITIALIZED, {
        gitEnabled: this.gitEnabled
      });
    } catch (error) {
      console.error('Error inicializando servicio de control de versiones:', error);
      throw error;
    }
  }

  /**
   * Inicia intervalo para versiones automáticas
   */
  private startVersionInterval(): void {
    // Limpia intervalo existente
    if (this.versionInterval) {
      clearInterval(this.versionInterval);
    }

    // Intervalos adaptados al modo de energía (en ms)
    const intervals = {
      highPerformance: 300000,  // 5 minutos
      standard: 600000,         // 10 minutos
      lowPower: 1800000,        // 30 minutos
      ultraSaving: 3600000      // 60 minutos
    };

    const interval = intervals[this.currentEnergyMode] || intervals.standard;

    // No iniciamos intervalo en modo ultraSaving (solo versiones manuales)
    if (this.currentEnergyMode === 'ultraSaving') {
      console.log('Versiones automáticas deshabilitadas en modo ultra ahorro');
      return;
    }

    // Programa ejecución periódica
    this.versionInterval = setInterval(() => this.processPendingVersions(), interval);
    console.log(`Intervalo de versiones automáticas establecido a ${interval / 60000} minutos`);
  }

  /**
   * Verifica si Git está disponible en el sistema
   */
  private async isGitAvailable(): Promise<boolean> {
    try {
      const { stdout } = await execFileAsync('git', ['--version']);
      console.log(`Git detectado: ${stdout.trim()}`);
      return true;
    } catch (error) {
      console.log('Git no está disponible en el sistema');
      return false;
    }
  }

  /**
   * Crea una versión de un documento
   */
  public async createVersion(
    document: Document,
    options: VersionCommitOptions = {}
  ): Promise<VersionInfo> {
    this.ensureInitialized();

    try {
      // Si está en modo bajo consumo, añade a pendientes en lugar de procesar inmediatamente
      if (this.currentEnergyMode === 'lowPower' || this.currentEnergyMode === 'ultraSaving') {
        this.pendingVersions.set(document.id, document);
        
        // Simulamos retorno de información de versión para no bloquear UI
        return {
          id: uuidv4(),
          documentId: document.id,
          version: document.version,
          timestamp: new Date().toISOString(),
          message: options.message || `Cambios pendientes (versión ${document.version})`,
          changes: [],
          sustainabilityMetrics: {
            diffSize: 0,
            compressionRatio: 1,
            storageImpact: 0
          }
        };
      }

      // Obtiene versión anterior si existe
      const previousVersions = await this.getVersionHistory(document.id, { limit: 1 });
      const previousVersion = previousVersions.length > 0 ? previousVersions[0] : null;
      
      // Analiza cambios desde versión anterior
      const changes = await this.calculateChanges(document, previousVersion || null);
      
      // Genera ID único para la versión
      const versionId = uuidv4();
      const commitMessage = options.message || `Versión ${document.version}`;
      
      // Crea objeto de versión
      const versionInfo: VersionInfo = {
        id: versionId,
        documentId: document.id,
        version: document.version,
        timestamp: new Date().toISOString(),
        message: commitMessage,
        author: document.metadata.author,
        changes,
        sustainabilityMetrics: {
          diffSize: this.calculateDiffSize(changes),
          compressionRatio: 1, // Se calculará después
          storageImpact: 0     // Se calculará después
        }
      };
      
      // Guarda versión
      await this.saveVersion(versionInfo, document);
      
      // Si Git está habilitado, crea commit
      if (this.gitEnabled && !options.skipHooks) {
        await this.createGitCommit(document, versionInfo, options);
      }
      
      // Emite evento de versión creada
      eventBus.emit(DocumentEventType.VERSION_CREATED, {
        documentId: document.id,
        versionId: versionInfo.id,
        comment: versionInfo.message
      });
      
      return versionInfo;
    } catch (error) {
      console.error(`Error creando versión para documento ${document.id}:`, error);
      throw error;
    }
  }

  /**
   * Calcula cambios entre versiones
   */
  private async calculateChanges(
    currentDocument: Document,
    previousVersion: VersionInfo | null
  ): Promise<VersionChange[]> {
    // Para MVP, simplemente registramos el documento completo como cambio
    // En implementación real, calcularíamos un diff real entre contenidos
    
    const changes: VersionChange[] = [{
      id: uuidv4(),
      path: currentDocument.path || `${currentDocument.id}.md`,
      type: previousVersion ? 'modified' : 'added',
      additions: previousVersion ? 1 : currentDocument.content.split('\n').length,
      deletions: 0,
      content: currentDocument.content,
      previousContent: previousVersion ? (previousVersion.changes[0]?.content || '') : ''
    }];
    
    return changes;
  }

  /**
   * Calcula tamaño de diferencias
   */
  private calculateDiffSize(changes: VersionChange[]): number {
    return changes.reduce((total, change) => {
      // Estimación simple del tamaño de diff basado en contenido
      const currentSize = change.content ? Buffer.from(change.content).length : 0;
      const previousSize = change.previousContent ? Buffer.from(change.previousContent).length : 0;
      
      // Si es nuevo, cuenta todo el tamaño; si es modificado, cuenta la diferencia
      if (change.type === 'added') {
        return total + currentSize;
      } else if (change.type === 'modified') {
        return total + Math.abs(currentSize - previousSize);
      } else if (change.type === 'deleted') {
        return total + previousSize;
      }
      
      return total;
    }, 0);
  }

  /**
   * Guarda información de versión
   */
  private async saveVersion(versionInfo: VersionInfo, document: Document): Promise<void> {
    // Crea directorios necesarios
    const documentVersionsPath = path.join(this.versionsPath, document.id);
    await fs.promises.mkdir(documentVersionsPath, { recursive: true });
    
    // Guarda información de versión como JSON
    const versionPath = path.join(documentVersionsPath, `${versionInfo.id}.json`);
    
    // Para ahorrar espacio, no guardamos contenido completo en info de versión
    const versionToSave = { ...versionInfo };
    
    // Guarda contenido actual en archivo separado y lo enlaza
    const contentPath = path.join(documentVersionsPath, `${versionInfo.id}.content.md`);
    await fs.promises.writeFile(contentPath, document.content, 'utf8');
    
    // Optimiza espacio: no duplica contenido en JSON
    versionToSave.changes = versionToSave.changes.map(change => {
      const { content, previousContent, ...rest } = change;
      return {
        ...rest,
        contentPath: contentPath
      };
    });
    
    // Calcula métricas finales de sostenibilidad
    const contentSize = Buffer.from(document.content).length;
    const storedSize = Buffer.from(JSON.stringify(versionToSave)).length + contentSize;
    
    versionToSave.sustainabilityMetrics = {
      ...versionToSave.sustainabilityMetrics,
      compressionRatio: contentSize / storedSize,
      storageImpact: storedSize
    };
    
    // Guarda versión optimizada
    await fs.promises.writeFile(versionPath, JSON.stringify(versionToSave), 'utf8');
    
    // También registra en base de datos para búsqueda rápida
    await storageService.save('document_versions', {
      id: versionInfo.id,
      document_id: document.id,
      version: document.version,
      commit_message: versionInfo.message,
      timestamp: versionInfo.timestamp,
      author: versionInfo.author,
      sustainability_metrics: JSON.stringify(versionToSave.sustainabilityMetrics),
      content_path: contentPath
    });
  }

  /**
   * Crea commit de Git para documento
   */
  private async createGitCommit(
    document: Document,
    _versionInfo: VersionInfo,
    options: VersionCommitOptions
  ): Promise<void> {
    if (!this.gitEnabled) return;
    
    try {
      // Verifica si estamos en un repositorio Git
      const documentPath = path.join(this.versionsPath, '..', `${document.id}.md`);
      const repoPath = path.dirname(documentPath);
      
      // Verifica si el directorio está bajo control Git
      const isGitRepo = await this.isGitRepository(repoPath);
      
      if (!isGitRepo) {
        // Inicializa repositorio si es necesario
        await execFileAsync('git', ['init'], { cwd: repoPath });
        console.log(`Repositorio Git inicializado en ${repoPath}`);
      }
      
      // Guarda contenido actual en archivo para Git
      await fs.promises.writeFile(documentPath, document.content, 'utf8');
      
      // Añade archivo a Git
      await execFileAsync('git', ['add', documentPath], { cwd: repoPath });
      
      // Crea commit
      const commitMessage = options.message || `Versión ${document.version}`;
      await execFileAsync('git', ['commit', '-m', commitMessage], { cwd: repoPath });
      
      console.log(`Commit Git creado para documento ${document.id}: ${commitMessage}`);
      
      // Emite evento de commit Git
      eventBus.emit(VersionControlEventType.GIT_COMMIT_CREATED, {
        documentId: document.id,
        commitMessage
      });
    } catch (error) {
      console.error('Error creando commit Git:', error);
      // No propagamos error para no interrumpir flujo principal
    }
  }

  /**
   * Verifica si un directorio es un repositorio Git
   */
  private async isGitRepository(directory: string): Promise<boolean> {
    try {
      const gitDir = path.join(directory, '.git');
      await fs.promises.access(gitDir, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene historial de versiones de un documento
   */
/**
 * Obtiene historial de versiones de un documento
 */
public async getVersionHistory(
  documentId: string,
  options: VersionHistoryOptions = {}
): Promise<VersionInfo[]> {
  this.ensureInitialized();
  
  try {
    // Crear un objeto de consulta limpio sin valores undefined
    const queryOptions: {
      where?: string;
      params?: any[];
      orderBy?: string;
      limit?: number;
      offset?: number;
    } = {
      where: 'document_id = ?',
      params: [documentId],
      orderBy: 'version DESC'
    };
    
    // Solo añadir estas propiedades si tienen valores
    if (options.limit !== undefined) {
      queryOptions.limit = options.limit;
    }
    
    if (options.offset !== undefined) {
      queryOptions.offset = options.offset;
    }
    
    // Recupera versiones de base de datos para eficiencia
    const dbVersions = await storageService.getAll('document_versions', queryOptions);
    
    if (dbVersions.length === 0) {
      return [];
    }
    
    // Carga información completa de cada versión
    const versions: VersionInfo[] = [];
    
    // Procesa en chunks para no sobrecargar la aplicación
    await processInChunks(dbVersions, async (dbVersion) => {
      try {
        // Carga versión desde archivo
        const versionPath = path.join(this.versionsPath, documentId, `${dbVersion && typeof dbVersion === 'object' && 'id' in dbVersion ? dbVersion.id : 'unknown'}.json`);
        
        let versionInfo: VersionInfo;
        
        try {
          // Intenta cargar desde archivo JSON
          const content = await fs.promises.readFile(versionPath, 'utf8');
          versionInfo = JSON.parse(content);
        } catch (err) {
          // Si falla, reconstruye desde datos en BD
          // Creamos un objeto tipado para acceder a dbVersion
          const typedDbVersion = dbVersion as Record<string, unknown>;
          
          versionInfo = {
            id: typedDbVersion.id as string,
            documentId: documentId,
            version: Number(typedDbVersion.version || 0),
            timestamp: typedDbVersion.timestamp as string || new Date().toISOString(),
            message: (typedDbVersion.commit_message as string) || `Versión ${typedDbVersion.version || 0}`,
            author: typedDbVersion.author as string,
            changes: [],
            sustainabilityMetrics: typedDbVersion.sustainability_metrics ? 
              JSON.parse(typeof typedDbVersion.sustainability_metrics === 'string' ? 
                typedDbVersion.sustainability_metrics as string : '{}') : {
                diffSize: 0,
                compressionRatio: 1,
                storageImpact: 0
              }
          };
        }
        
        // Si se solicita contenido, lo cargamos
        if (options.includeContent) {
          // Verifica si hay ruta de contenido en BD
          const typedDbVersion = dbVersion as Record<string, unknown>;
          const contentPath = typedDbVersion.content_path as string || 
            path.join(this.versionsPath, documentId, `${typedDbVersion.id || 'unknown'}.content.md`);
          
          try {
            const content = await fs.promises.readFile(contentPath, 'utf8');
            
            // Actualiza changes con contenido
            versionInfo.changes = [{
              id: versionInfo.changes[0]?.id || uuidv4(),
              path: typeof contentPath === 'string' ? contentPath : path.join(this.versionsPath, documentId, `${versionInfo.id}.content.md`),
              type: 'modified',
              additions: 0,
              deletions: 0,
              content
            }];
          } catch (err) {
            console.warn(`No se pudo cargar contenido para versión ${versionInfo.id}:`, err);
          }
        }
        
        // Si no se requieren changes y no se pidió contenido, los eliminamos
        if (!options.includeChanges && !options.includeContent) {
          versionInfo.changes = [];
        }
        
        versions.push(versionInfo);
      } catch (err) {
        const typedDbVersion = dbVersion as Record<string, unknown>;
        console.warn(`Error cargando versión ${typedDbVersion.id || 'desconocida'}:`, err);
      }
    }, 5); // Procesa 5 versiones a la vez
    
    // Ordenar por versión descendente
    return versions.sort((a, b) => b.version - a.version);
  } catch (error) {
    console.error(`Error obteniendo historial de versiones para documento ${documentId}:`, error);
    throw error;
  }
}

  /**
   * Restaura una versión anterior de un documento
   */
  public async restoreVersion(
    documentId: string,
    versionId: string,
    options: VersionRestoreOptions = {}
  ): Promise<Document> {
    this.ensureInitialized();
    
    try {
      // Obtiene información de la versión
      const versionInfo = await this.getVersionById(documentId, versionId);
      
      if (!versionInfo) {
        throw new Error(`Versión ${versionId} no encontrada para documento ${documentId}`);
      }
      
      // Obtiene contenido de la versión
      let content = '';
      
      if (versionInfo.changes && 
        versionInfo.changes.length > 0 && 
        versionInfo.changes[0] && 
        versionInfo.changes[0].content !== undefined) {
      content = versionInfo.changes[0].content;
    }
      
      // Obtiene documento actual
      const currentDocument = await documentService.getDocument(documentId);
      
      // Aplica restauración
      const restoredDocument = await documentService.updateDocument(
        documentId,
        {
          content,
          version: currentDocument.version + 1
        },
        options.createNewVersion !== false
      );
      
      // Emite evento de restauración
      eventBus.emit(DocumentEventType.VERSION_RESTORED, {
        documentId,
        versionId
      });
      
      return restoredDocument;
    } catch (error) {
      console.error(`Error restaurando versión ${versionId} para documento ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene una versión específica por ID
   */
  private async getVersionById(documentId: string, versionId: string): Promise<VersionInfo | null> {
    try {
      // Intenta cargar desde base de datos
      const dbVersion = await storageService.getById('document_versions', versionId);
      
      if (!dbVersion) {
        return null;
      }
      
      // Verifica que corresponda al documento correcto
      if (dbVersion && typeof dbVersion === 'object' && 'document_id' in dbVersion && dbVersion.document_id !== documentId) {
        console.warn(`La versión ${versionId} no corresponde al documento ${documentId}`);
        return null;
      }
      
      // Intenta cargar desde archivo JSON
      const versionPath = path.join(this.versionsPath, documentId, `${versionId}.json`);
      
      try {
        const content = await fs.promises.readFile(versionPath, 'utf8');
        const versionInfo = JSON.parse(content) as VersionInfo;
        
        // Carga contenido
        const typedDbVersion = dbVersion as Record<string, unknown>;
        const contentPath = typedDbVersion.content_path as string || 
          path.join(this.versionsPath, documentId, `${versionId}.content.md`);
        
        try {
          const content = await fs.promises.readFile(contentPath, 'utf8');
          
          // Actualiza changes con contenido
          versionInfo.changes = [{
            id: versionInfo.changes[0]?.id || uuidv4(),
            path: typeof contentPath === 'string' ? contentPath : path.join(this.versionsPath, documentId, `${versionInfo.id}.content.md`),
            type: 'modified',
            additions: 0,
            deletions: 0,
            content
          }];
        } catch (err) {
          console.warn(`No se pudo cargar contenido para versión ${versionId}:`, err);
        }
        
        return versionInfo;
      } catch (err) {
        // Si falla, reconstruye desde datos en BD
        // Creamos un objeto tipado para acceder a dbVersion
        const typedDbVersion = dbVersion as Record<string, unknown>;
        
        return {
          id: String(typedDbVersion.id || ''),
          documentId: documentId,
          version: Number(typedDbVersion.version || 0),
          timestamp: String(typedDbVersion.timestamp || new Date().toISOString()),
          message: String(typedDbVersion.commit_message || `Versión ${typedDbVersion.version || 'desconocida'}`),
          author: typedDbVersion.author ? String(typedDbVersion.author) : undefined,
          changes: [],
          sustainabilityMetrics: typedDbVersion.sustainability_metrics ? 
            JSON.parse(typeof typedDbVersion.sustainability_metrics === 'string' ? 
              typedDbVersion.sustainability_metrics as string : '{}') : {
              diffSize: 0,
              compressionRatio: 1,
              storageImpact: 0
            }
        };
      }
    } catch (error) {
      console.error(`Error obteniendo versión ${versionId}:`, error);
      return null;
    }
  }

  /**
   * Calcula diferencias entre dos versiones
   */
  public async calculateDiff(
    documentId: string,
    fromVersionId: string,
    toVersionId: string
  ): Promise<VersionDiff> {
    this.ensureInitialized();
    
    try {
      // Carga ambas versiones
      const fromVersion = await this.getVersionById(documentId, fromVersionId);
      const toVersion = await this.getVersionById(documentId, toVersionId);
      
      if (!fromVersion || !toVersion) {
        throw new Error(`Una o ambas versiones no encontradas`);
      }
      
      // En una implementación real, calcularíamos un diff de texto
      // Para MVP, simplemente comparamos contenidos
      const fromContent = fromVersion.changes[0]?.content || '';
      const toContent = toVersion.changes[0]?.content || '';
      
      // Cálculo básico de cambios
      const changes: VersionChange[] = [];
      
      if (fromContent !== toContent) {
        changes.push({
          id: uuidv4(),
          path: fromVersion.changes[0]?.path || `${documentId}.md`,
          type: 'modified',
          additions: toContent.split('\n').length,
          deletions: fromContent.split('\n').length,
          content: toContent,
          previousContent: fromContent
        });
      }
      
      // Totales
      const diffStats = {
        additions: changes.reduce((sum, c) => sum + c.additions, 0),
        deletions: changes.reduce((sum, c) => sum + c.deletions, 0),
        changedFiles: changes.length
      };
      
      return {
        documentId,
        fromVersion: fromVersion.version,
        toVersion: toVersion.version,
        changes,
        diffStats
      };
    } catch (error) {
      console.error(`Error calculando diff entre versiones:`, error);
      throw error;
    }
  }

  /**
   * Procesa versiones pendientes
   */
  private async processPendingVersions(): Promise<void> {
    if (this.pendingVersions.size === 0) return;
    
    console.log(`Procesando ${this.pendingVersions.size} versiones pendientes`);
    
    const documents = Array.from(this.pendingVersions.values());
    this.pendingVersions.clear();
    
    for (const document of documents) {
      try {
        await this.createVersion(document, {
          message: `Versión automática ${document.version} (diferida)`
        });
      } catch (error) {
        console.error(`Error procesando versión pendiente para ${document.id}:`, error);
      }
    }
  }

  /**
   * Obtiene estado de sincronización Git
   */
  public async getGitSyncStatus(documentId: string): Promise<GitSyncStatus> {
    this.ensureInitialized();
    
    if (!this.gitEnabled) {
      return {
        inSync: false,
        pendingChanges: 0
      };
    }
    
    try {
      // Ruta del documento
      const documentPath = path.join(this.versionsPath, '..', `${documentId}.md`);
      const repoPath = path.dirname(documentPath);
      
      // Verifica si es un repositorio Git
      const isGitRepo = await this.isGitRepository(repoPath);
      
      if (!isGitRepo) {
        return {
          inSync: false,
          pendingChanges: 0
        };
      }
      
      // Obtiene estado de Git
      const { stdout: statusOutput } = await execFileAsync('git', ['status', '--porcelain'], { cwd: repoPath });
      const pendingChanges = statusOutput.split('\n').filter(line => line.trim()).length;
      
      // Obtiene rama actual
      const { stdout: branchOutput } = await execFileAsync('git', ['branch', '--show-current'], { cwd: repoPath });
      const activeBranch = branchOutput.trim();
      
      // Obtiene último commit
      const { stdout: logOutput } = await execFileAsync('git', ['log', '-1', '--format=%cd'], { cwd: repoPath });
      const lastSyncTime = logOutput.trim();
      
      // Lista ramas disponibles
      const { stdout: branchesOutput } = await execFileAsync('git', ['branch'], { cwd: repoPath });
      const availableBranches = branchesOutput.split('\n')
        .map(b => b.trim().replace(/^\*\s+/, ''))
        .filter(Boolean);
      
      // Obtiene URL remota si existe
      let remoteUrl;
      try {
        const { stdout } = await execFileAsync('git', ['remote', 'get-url', 'origin'], { cwd: repoPath });
        remoteUrl = stdout.trim();
      } catch {
        // No hay remoto configurado
      }
      
      return {
        inSync: pendingChanges === 0,
        pendingChanges,
        lastSyncTime,
        activeBranch,
        availableBranches,
        remoteUrl
      };
    } catch (error) {
      console.error(`Error obteniendo estado Git para documento ${documentId}:`, error);
      return {
        inSync: false,
        pendingChanges: 0,
        errorMessage: (error as Error).message
      };
    }
  }

  /**
   * Sincroniza con repositorio Git remoto
   */
  public async syncWithGit(documentId: string, remoteBranch?: string): Promise<GitSyncStatus> {
    this.ensureInitialized();
    
    if (!this.gitEnabled) {
      throw new Error('Git no está habilitado');
    }
    
    try {
      // Ruta del documento
      const documentPath = path.join(this.versionsPath, '..', `${documentId}.md`);
      const repoPath = path.dirname(documentPath);
      
      // Verifica si es un repositorio Git
      const isGitRepo = await this.isGitRepository(repoPath);
      
      if (!isGitRepo) {
        throw new Error('El documento no está en un repositorio Git');
      }
      
      // Verifica que haya un remoto configurado
      try {
        await execFileAsync('git', ['remote', 'get-url', 'origin'], { cwd: repoPath });
      } catch {
        throw new Error('No hay repositorio remoto configurado');
      }
      
      // Realiza pull primero para integrar cambios
      const branch = remoteBranch || 'main';
      await execFileAsync('git', ['pull', 'origin', branch], { cwd: repoPath });
      
      // Luego push
      await execFileAsync('git', ['push', 'origin', branch], { cwd: repoPath });
      
      console.log(`Sincronización Git completada para documento ${documentId}`);
      
      // Emite evento de sincronización
      eventBus.emit(VersionControlEventType.GIT_SYNC_COMPLETED, {
        documentId,
        remoteBranch: branch
      });
      
      // Retorna estado actualizado
      return await this.getGitSyncStatus(documentId);
    } catch (error) {
      console.error(`Error sincronizando con Git para documento ${documentId}:`, error);
      
      // Emite evento de error
      eventBus.emit(VersionControlEventType.GIT_SYNC_ERROR, {
        documentId,
        errorMessage: (error as Error).message
      });
      
      throw error;
    }
  }

  /**
   * Actualiza el modo de energía para optimizar operaciones
   */
  public setEnergyMode(mode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance'): void {
    if (this.currentEnergyMode === mode) return;
    
    this.currentEnergyMode = mode;
    console.log(`Modo de energía de control de versiones cambiado a: ${mode}`);
    
    // Actualiza intervalo de versiones automáticas
    this.startVersionInterval();
    
    // Emite evento
    eventBus.emit(VersionControlEventType.VERSION_CONTROL_ENERGY_MODE_CHANGED, {
      mode
    });
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('VersionControlService no inicializado. Llame a initialize() primero.');
    }
  }

  /**
   * Libera recursos
   */
  public async dispose(): Promise<void> {
    // Procesa versiones pendientes
    await this.processPendingVersions();
    
    // Limpia intervalo
    if (this.versionInterval) {
      clearInterval(this.versionInterval);
      this.versionInterval = null;
    }
    
    this.initialized = false;
    this.pendingVersions.clear();
    
    console.log('Servicio de control de versiones liberado');
  }
}

// Exporta instancia singleton para uso compartido
export const versionControlService = new VersionControlService();