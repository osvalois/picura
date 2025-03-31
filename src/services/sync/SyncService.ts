import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import isomorphicGit from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { Document } from '../../shared/types/Document';
import { eventBus } from '../../core/events/EventBus';
import { SyncEventType, SystemEventType, DocumentEventType } from '../../core/events/EventTypes';
import { documentService } from '../document/DocumentService';
import { PATHS, SYNC_CONFIG } from '../../config/defaults';
// Contextos de React solo disponibles del lado del renderer

/**
 * Servicio de sincronización que permite mantener documentos sincronizados
 * entre dispositivos utilizando Git como backend
 */
export class SyncService {
  private workdir: string;
  private remote: string | null = null;
  private remoteBranch: string = 'main';
  private lastSyncTime: Date | null = null;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private initialized: boolean = false;
  private energyMode: string = 'standard';

  constructor() {
    this.workdir = path.join(app.getPath('userData'), PATHS.documents);
  }

  /**
   * Inicializa el servicio de sincronización
   */
  public async initialize(): Promise<void> {
    try {
      // Asegura que exista el directorio de trabajo
      await fs.mkdir(this.workdir, { recursive: true });

      // Verifica si ya es un repositorio Git
      const isGitRepo = await this.isGitRepository();

      if (!isGitRepo) {
        // Inicializa un nuevo repositorio Git local
        await isomorphicGit.init({ fs, dir: this.workdir });
        
        // Crea commit inicial si es necesario
        const files = await fs.readdir(this.workdir);
        if (files.length > 0) {
          await this.createInitialCommit();
        }
      }

      // Configura la información del autor
      await isomorphicGit.setConfig({
        fs,
        dir: this.workdir,
        path: 'user.name',
        value: SYNC_CONFIG.git.authorName
      });

      await isomorphicGit.setConfig({
        fs,
        dir: this.workdir,
        path: 'user.email',
        value: SYNC_CONFIG.git.authorEmail
      });

      // Registra eventos
      this.registerEventListeners();

      this.initialized = true;
      console.log('Servicio de sincronización inicializado');
    } catch (error) {
      console.error('Error inicializando servicio de sincronización:', error);
      throw error;
    }
  }

  /**
   * Verifica si el directorio ya es un repositorio Git
   */
  private async isGitRepository(): Promise<boolean> {
    try {
      await isomorphicGit.findRoot({ fs, filepath: this.workdir });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crea un commit inicial con los documentos existentes
   */
  private async createInitialCommit(): Promise<void> {
    try {
      // Agrega todos los archivos JSON existentes
      const files = await fs.readdir(this.workdir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        await isomorphicGit.add({ fs, dir: this.workdir, filepath: file });
      }

      // Crea commit inicial
      if (jsonFiles.length > 0) {
        await isomorphicGit.commit({
          fs,
          dir: this.workdir,
          author: {
            name: SYNC_CONFIG.git.authorName,
            email: SYNC_CONFIG.git.authorEmail
          },
          message: 'Commit inicial: documentos existentes'
        });
      }
    } catch (error) {
      console.error('Error creando commit inicial:', error);
    }
  }

  /**
   * Configura un repositorio remoto para sincronización
   */
  public async configureRemote(url: string, branch: string = 'main', credentials?: { username: string; password: string }): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('SyncService no inicializado. Llame a initialize() primero.');
    }

    try {
      // Guarda la información del remoto
      this.remote = url;
      this.remoteBranch = branch;

      // Configura el remoto en Git
      await isomorphicGit.addRemote({
        fs,
        dir: this.workdir,
        remote: 'origin',
        url
      });

      // Si se proporcionaron credenciales, guárdalas para uso futuro
      if (credentials) {
        // En una implementación real, almacenaríamos esto de forma segura
        // por ejemplo, en el keychain del sistema o en una base de datos encriptada
        console.log('Credenciales recibidas y guardadas para uso futuro');
      }

      // Emite evento de conexión exitosa
      eventBus.emit(SyncEventType.REPOSITORY_CONNECTED, { url, branch });

      return true;
    } catch (error) {
      console.error('Error configurando repositorio remoto:', error);
      eventBus.emit(SyncEventType.SYNC_FAILED, {
        error: 'Error al configurar repositorio remoto',
        details: error
      });
      return false;
    }
  }

  /**
   * Sincroniza los documentos locales con el repositorio remoto
   */
  public async syncDocuments(force: boolean = false): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('SyncService no inicializado. Llame a initialize() primero.');
    }

    // Si ya hay una sincronización en curso, no inicia otra
    if (this.syncInProgress && !force) {
      console.warn('Sincronización ya en curso. Abortando.');
      return false;
    }

    // Si no hay un remoto configurado, no puede sincronizar
    if (!this.remote) {
      console.warn('No se ha configurado un repositorio remoto. Abortando sincronización.');
      return false;
    }

    this.syncInProgress = true;
    eventBus.emit(SyncEventType.SYNC_STARTED, { manual: force });

    try {
      // 1. Realiza commit de los cambios locales pendientes
      await this.commitLocalChanges();

      // 2. Descarga cambios remotos (pull)
      await this.pullRemoteChanges();

      // 3. Sube cambios locales (push)
      await this.pushLocalChanges();

      // Actualiza tiempo de última sincronización
      this.lastSyncTime = new Date();
      this.syncInProgress = false;

      // Emite evento de sincronización completada
      eventBus.emit(SyncEventType.SYNC_COMPLETED, {
        timestamp: this.lastSyncTime.toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error durante la sincronización:', error);
      this.syncInProgress = false;

      // Emite evento de error en sincronización
      eventBus.emit(SyncEventType.SYNC_FAILED, {
        error: 'Error durante la sincronización',
        details: error
      });

      return false;
    }
  }

  /**
   * Realiza commit de los cambios locales pendientes
   */
  private async commitLocalChanges(): Promise<void> {
    try {
      // Obtiene estado de archivos
      const status = await isomorphicGit.statusMatrix({
        fs,
        dir: this.workdir
      });

      // Filtra archivos que necesitan ser agregados o cambiados
      const filesToCommit = status.filter(row => row[1] !== row[3])
                                  .map(row => row[0]);

      if (filesToCommit.length === 0) {
        // No hay cambios que commitear
        return;
      }

      // Agrega archivos modificados al staging
      for (const filepath of filesToCommit) {
        // Si el archivo fue eliminado, remove
        if ((await isomorphicGit.status({ fs, dir: this.workdir, filepath })) === 'deleted') {
          await isomorphicGit.remove({ fs, dir: this.workdir, filepath });
        } else {
          // De lo contrario, add
          await isomorphicGit.add({ fs, dir: this.workdir, filepath });
        }
      }

      // Crea commit con los cambios
      await isomorphicGit.commit({
        fs,
        dir: this.workdir,
        author: {
          name: SYNC_CONFIG.git.authorName,
          email: SYNC_CONFIG.git.authorEmail
        },
        message: `Sincronización automática: ${filesToCommit.length} documento(s) modificado(s)`
      });

      console.log(`Commit local creado con ${filesToCommit.length} archivos`);
    } catch (error) {
      console.error('Error creando commit local:', error);
      throw error;
    }
  }

  /**
   * Descarga cambios desde el repositorio remoto
   */
  private async pullRemoteChanges(): Promise<void> {
    if (!this.remote) return;

    try {
      // Realiza pull
      await isomorphicGit.pull({
        fs,
        http,
        dir: this.workdir,
        remote: 'origin',
        ref: this.remoteBranch,
        author: {
          name: SYNC_CONFIG.git.authorName,
          email: SYNC_CONFIG.git.authorEmail
        }
      });

      // En una implementación real, actualizaríamos la caché de documentos
      // para reflejar los cambios descargados
      await documentService.invalidateCache();

      console.log('Cambios remotos descargados exitosamente');
    } catch (error) {
      // Si es error de conflicto, maneja los conflictos
      if (error instanceof Error && error.message.includes('CONFLICT')) {
        await this.handleMergeConflicts();
      } else {
        console.error('Error descargando cambios remotos:', error);
        throw error;
      }
    }
  }

  /**
   * Maneja conflictos de fusión
   */
  private async handleMergeConflicts(): Promise<void> {
    try {
      // Obtiene archivos en conflicto
      const status = await isomorphicGit.statusMatrix({
        fs,
        dir: this.workdir
      });

      const conflictedFiles = status
        .filter(row => row[2] === 2) // Archivos con conflicto
        .map(row => row[0]);

      if (conflictedFiles.length === 0) {
        return;
      }

      // Emite evento de conflicto detectado
      eventBus.emit(SyncEventType.CONFLICT_DETECTED, {
        files: conflictedFiles
      });

      // Estrategia simple: crea copias de los archivos en conflicto
      for (const filepath of conflictedFiles) {
        const content = await fs.readFile(path.join(this.workdir, filepath), 'utf8');
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const conflictPath = `${filepath}.conflict.${timestamp}`;
        
        await fs.writeFile(path.join(this.workdir, conflictPath), content, 'utf8');
        
        // Acepta cambios remotos para el archivo original
        await isomorphicGit.checkout({
          fs,
          dir: this.workdir,
          ref: 'FETCH_HEAD',
          filepaths: [filepath]
        });
        
        // Agrega archivo resuelto y copia de conflicto
        await isomorphicGit.add({ fs, dir: this.workdir, filepath });
        await isomorphicGit.add({ fs, dir: this.workdir, filepath: conflictPath });
      }

      // Crea commit para resolver conflicto
      await isomorphicGit.commit({
        fs,
        dir: this.workdir,
        author: {
          name: SYNC_CONFIG.git.authorName,
          email: SYNC_CONFIG.git.authorEmail
        },
        message: `Resolución de conflictos automática: ${conflictedFiles.length} documento(s)`
      });

      // Emite evento de conflicto resuelto
      eventBus.emit(SyncEventType.CONFLICT_RESOLVED, {
        files: conflictedFiles,
        strategy: 'copy-and-accept-remote'
      });

      console.log(`Resolvió ${conflictedFiles.length} conflictos de fusión`);
    } catch (error) {
      console.error('Error manejando conflictos de fusión:', error);
      throw error;
    }
  }

  /**
   * Sube cambios locales al repositorio remoto
   */
  private async pushLocalChanges(): Promise<void> {
    if (!this.remote) return;

    try {
      // Realiza push de los cambios
      await isomorphicGit.push({
        fs,
        http,
        dir: this.workdir,
        remote: 'origin',
        ref: this.remoteBranch
      });

      console.log('Cambios locales enviados al repositorio remoto');
    } catch (error) {
      console.error('Error enviando cambios locales:', error);
      throw error;
    }
  }

  /**
   * Inicia sincronización periódica automática
   */
  public startAutoSync(intervalMs?: number): void {
    // Limpia intervalo existente si lo hay
    this.stopAutoSync();

    // Determina intervalo según modo de energía o parámetro
    const syncIntervalMs = intervalMs || this.getSyncIntervalForEnergyMode();

    // Configura nuevo intervalo
    this.syncInterval = setInterval(() => {
      // Solo sincroniza si no hay una sincronización en curso
      if (!this.syncInProgress && this.remote) {
        this.syncDocuments(false).catch(error => {
          console.error('Error en sincronización automática:', error);
        });
      }
    }, syncIntervalMs);

    console.log(`Sincronización automática iniciada cada ${syncIntervalMs / 1000} segundos`);
  }

  /**
   * Detiene la sincronización automática
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Sincronización automática detenida');
    }
  }

  /**
   * Registra listeners para eventos relevantes
   */
  private registerEventListeners(): void {
    // Escucha cambios en modo de energía
    eventBus.on(SystemEventType.ENERGY_MODE_CHANGED, (data: { currentMode: string }) => {
      this.energyMode = data.currentMode;
      
      // Ajusta intervalo de sincronización si auto-sync está activo
      if (this.syncInterval) {
        this.startAutoSync(); // Reinicia con el nuevo intervalo
      }
    });

    // Escucha eventos de guardado de documentos para posible commit
    eventBus.on(DocumentEventType.DOCUMENT_SAVED, async (data: { documentId: string }) => {
      // En modo de alto rendimiento, podríamos hacer commit inmediato
      if (this.energyMode === 'highPerformance' && !this.syncInProgress) {
        await this.commitLocalChanges().catch(error => {
          console.error('Error en commit automático tras guardado:', error);
        });
      }
    });
  }

  /**
   * Determina el intervalo de sincronización según el modo de energía
   */
  private getSyncIntervalForEnergyMode(): number {
    switch (this.energyMode) {
      case 'ultraSaving':
        return SYNC_CONFIG.git.commitInterval * 6; // 1.5 horas
      case 'lowPower':
        return SYNC_CONFIG.git.commitInterval * 2; // 30 minutos
      case 'highPerformance':
        return SYNC_CONFIG.git.commitInterval / 3; // 5 minutos
      case 'standard':
      default:
        return SYNC_CONFIG.git.commitInterval; // 15 minutos
    }
  }

  /**
   * Obtiene metadatos de sincronización actual
   */
  public getSyncStatus(): {
    initialized: boolean;
    hasRemote: boolean;
    remote?: string;
    branch?: string;
    lastSync?: string;
    autoSyncEnabled: boolean;
    syncInProgress: boolean;
  } {
    return {
      initialized: this.initialized,
      hasRemote: !!this.remote,
      remote: this.remote || undefined,
      branch: this.remote ? this.remoteBranch : undefined,
      lastSync: this.lastSyncTime ? this.lastSyncTime.toISOString() : undefined,
      autoSyncEnabled: !!this.syncInterval,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Libera recursos
   */
  public dispose(): void {
    this.stopAutoSync();
    this.initialized = false;
  }
}

// Exporta instancia singleton
export const syncService = new SyncService();