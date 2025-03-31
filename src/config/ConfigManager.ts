import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { DEFAULT_USER_PREFERENCES, PATHS } from './defaults';
import { UserPreferences } from '../shared/types/User';

/**
 * Gestiona la configuración de la aplicación con enfoque en sostenibilidad
 */
export class ConfigManager {
  private configPath: string;
  private config: Record<string, any> = {};
  private isLoaded = false;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), PATHS.config);
  }

  /**
   * Inicializa la configuración, cargando o creando el archivo si no existe
   */
  public async initialize(): Promise<void> {
    try {
      await this.ensureConfigDirectory();
      
      if (fs.existsSync(this.configPath)) {
        await this.loadConfig();
      } else {
        // Inicializa con valores predeterminados sostenibles
        this.config = {
          userPreferences: DEFAULT_USER_PREFERENCES,
          firstRun: true,
          installDate: new Date().toISOString(),
          lastRun: new Date().toISOString(),
        };
        
        await this.saveConfig();
      }
      
      this.isLoaded = true;
    } catch (error) {
      console.error('Error initializing config:', error);
      // Fallback a configuración predeterminada en memoria
      this.config = {
        userPreferences: DEFAULT_USER_PREFERENCES,
        firstRun: true,
      };
      this.isLoaded = true;
    }
  }

  /**
   * Obtiene preferencias de usuario con enfoque en sostenibilidad
   */
  public getUserPreferences(): UserPreferences {
    this.ensureLoaded();
    return this.config.userPreferences || { ...DEFAULT_USER_PREFERENCES };
  }
  
  /**
   * Actualiza las preferencias de usuario con enfoque en sostenibilidad
   */
  public async updateUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    this.ensureLoaded();
    
    this.config.userPreferences = {
      ...this.getUserPreferences(),
      ...preferences,
    };
    
    await this.saveConfig();
  }
  
  /**
   * Obtiene un valor de configuración específico
   */
  public get<T>(key: string, defaultValue?: T): T {
    this.ensureLoaded();
    return key in this.config ? this.config[key] : defaultValue;
  }
  
  /**
   * Establece un valor de configuración específico
   */
  public async set<T>(key: string, value: T): Promise<void> {
    this.ensureLoaded();
    this.config[key] = value;
    await this.saveConfig();
  }
  
  /**
   * Resetea configuraciones a valores predeterminados sostenibles
   */
  public async resetToDefaults(): Promise<void> {
    this.ensureLoaded();
    this.config.userPreferences = { ...DEFAULT_USER_PREFERENCES };
    await this.saveConfig();
  }
  
  /**
   * Recarga la configuración del disco
   */
  public async reload(): Promise<void> {
    await this.loadConfig();
  }
  
  /**
   * Verifica si el ConfigManager está inicializado
   */
  public isInitialized(): boolean {
    return this.isLoaded;
  }
  
  /**
   * Asegura que la configuración está cargada
   */
  private ensureLoaded(): void {
    if (!this.isLoaded) {
      throw new Error('Config not loaded. Call initialize() first.');
    }
  }
  
  /**
   * Carga la configuración desde el disco
   */
  private async loadConfig(): Promise<void> {
    try {
      const data = await fs.promises.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(data);
      
      // Actualiza la fecha de último uso
      this.config.lastRun = new Date().toISOString();
      
      // Asegura compatibilidad con nuevas opciones
      if (this.config.userPreferences) {
        this.config.userPreferences = {
          ...DEFAULT_USER_PREFERENCES,
          ...this.config.userPreferences,
        };
      } else {
        this.config.userPreferences = { ...DEFAULT_USER_PREFERENCES };
      }
      
      // Guarda la fecha actualizada
      await this.saveConfig();
    } catch (error) {
      console.error('Error loading config:', error);
      throw error;
    }
  }
  
  /**
   * Guarda la configuración al disco de manera optimizada
   */
  private async saveConfig(): Promise<void> {
    try {
      // Optimización: Guarda solo cuando hay cambios reales
      const configString = JSON.stringify(this.config, null, 2);
      await fs.promises.writeFile(this.configPath, configString, 'utf8');
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }
  
  /**
   * Asegura que el directorio de configuración existe
   */
  private async ensureConfigDirectory(): Promise<void> {
    const configDir = path.dirname(this.configPath);
    
    try {
      await fs.promises.mkdir(configDir, { recursive: true });
    } catch (error) {
      console.error('Error creating config directory:', error);
      throw error;
    }
  }
}

// Exporta instancia singleton para uso a través de la aplicación
export const configManager = new ConfigManager();