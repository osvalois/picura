import { v4 as uuidv4 } from 'uuid';
import { 
  AIPrompt, 
  AIResponse, 
  AICompletionOptions, 
  AIServiceConfig,
  AISuggestion,
  AIUsageStats,
  AIContext,
  AIModelType
} from '../../shared/types/AITypes';
import { eventBus } from '../../core/events/EventBus';
import { AIEventType, SystemEventType } from '../../core/events/EventTypes';
import { debounce } from '../../renderer/utils/performanceUtils';
import { storageService } from '../storage/StorageService';

/**
 * Servicio de IA con optimizaciones de sostenibilidad
 * Adapta comportamiento según modo de energía y recursos disponibles
 */
export class AIService {
  private initialized: boolean = false;
  private config: AIServiceConfig = {
    enabled: true,
    provider: 'local',
    defaultModel: 'tinyllm',
    defaultSystemPrompt: 'Eres un asistente útil y conciso para redacción de documentos.',
    contextSize: 2000,
    temperatureDefault: 0.7,
    maxTokensDefault: 1500,
    localProcessingFirst: true,
    suggestionConfidence: 0.75,
    energyProfile: {
      lowPowerMode: {
        enabled: true,
        maxTokens: 500,
        contextSize: 1000
      },
      ultraSavingMode: {
        enabled: false
      }
    }
  };
  private stats: AIUsageStats = {
    tokensUsed: 0,
    requestsCount: 0,
    localRequestsCount: 0,
    remoteRequestsCount: 0,
    energySaved: 0,
    averageLatency: 0,
    lastUsed: new Date()
  };
  private currentEnergyMode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance' = 'standard';
  private localModel: any = null; // Referencia a modelo local (en implementación real)
  private apiClients: Map<AIModelType, any> = new Map();
  private suggestionCache: Map<string, AISuggestion[]> = new Map();

  constructor() {
    // Inicialización básica
  }

  /**
   * Inicializa el servicio de IA
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Carga configuración desde almacenamiento
      await this.loadConfig();
      
      // Inicializa modelo local si está habilitado
      if (this.config.localProcessingFirst) {
        await this.initLocalModel();
      }
      
      // Inicializa clientes API si están configurados
      await this.initAPIClients();
      
      // Suscribe a eventos del sistema
      this.subscribeToEvents();
      
      // Carga estadísticas de uso
      await this.loadStats();
      
      this.initialized = true;
      console.log('Servicio de IA inicializado');
    } catch (error) {
      console.error('Error inicializando servicio de IA:', error);
      // No propagamos error para permitir funcionar sin IA
    }
  }

  /**
   * Carga configuración desde almacenamiento
   */
  private async loadConfig(): Promise<void> {
    try {
      const storedConfig = await storageService.getCache<AIServiceConfig>('ai_config');
      
      if (storedConfig) {
        this.config = {
          ...this.config, // Valores por defecto
          ...storedConfig, // Valores almacenados
        };
        
        console.log('Configuración de IA cargada');
      }
    } catch (error) {
      console.error('Error cargando configuración de IA:', error);
    }
  }

  /**
   * Guarda configuración en almacenamiento
   */
  private async saveConfig(): Promise<void> {
    try {
      await storageService.setCache('ai_config', this.config);
    } catch (error) {
      console.error('Error guardando configuración de IA:', error);
    }
  }

  /**
   * Inicializa modelo local
   */
  private async initLocalModel(): Promise<void> {
    // En una implementación real, cargaríamos un modelo de ML ligero para procesamiento local
    // Para este MVP, simulamos un modelo local
    
    console.log('Modelo local de IA inicializado');
    
    // Simula carga de modelo
    this.localModel = {
      generate: async (prompt: string, _: any) => {
        // Simulación de generación local
        return {
          text: `Respuesta simulada para: ${prompt.substring(0, 20)}...`,
          tokenCount: prompt.split(/\s+/).length * 2
        };
      }
    };
  }

  /**
   * Inicializa clientes API para modelos remotos
   */
  private async initAPIClients(): Promise<void> {
    // En implementación real, inicializaríamos clientes para OpenAI, etc.
    // Para este MVP, simulamos clientes
    
    this.apiClients.set('openai', {
      generate: async (prompt: string, _: any) => {
        // Simulación de llamada a OpenAI
        return {
          text: `Respuesta simulada de OpenAI para: ${prompt.substring(0, 20)}...`,
          usage: {
            prompt_tokens: prompt.split(/\s+/).length,
            completion_tokens: prompt.split(/\s+/).length / 2,
            total_tokens: prompt.split(/\s+/).length * 1.5
          }
        };
      }
    });
    
    this.apiClients.set('anthropic', {
      generate: async (prompt: string, _: any) => {
        // Simulación de llamada a Anthropic
        return {
          text: `Respuesta simulada de Anthropic para: ${prompt.substring(0, 20)}...`,
          usage: {
            input_tokens: prompt.split(/\s+/).length,
            output_tokens: prompt.split(/\s+/).length / 2,
            total_tokens: prompt.split(/\s+/).length * 1.5
          }
        };
      }
    });
    
    console.log('Clientes API de IA inicializados');
  }

  /**
   * Verifica si el valor es un modo de energía válido
   */
  private isValidEnergyMode(mode: any): mode is 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance' {
    return ['standard', 'lowPower', 'ultraSaving', 'highPerformance'].includes(mode);
  }

  /**
   * Suscribe a eventos del sistema
   */
  private subscribeToEvents(): void {
    // Actualiza comportamiento cuando cambia el modo de energía
    eventBus.on(SystemEventType.ENERGY_MODE_CHANGED, (data) => {
      const modeValue = data.mode || data.currentMode;
      // Validamos que el modo sea uno de los valores permitidos
      if (this.isValidEnergyMode(modeValue)) {
        this.setEnergyMode(modeValue);
      } else {
        console.warn(`Modo de energía no reconocido: ${modeValue}, usando 'standard' por defecto`);
        this.setEnergyMode('standard');
      }
    });
    
    // Monitorea batería
    eventBus.on(SystemEventType.BATTERY_STATUS_CHANGED, (data) => {
      // Si batería baja, optimiza IA
      if (data.level < 0.15 && !(data.isCharging || data.charging)) {
        // Reduzcamos uso de recursos con batería crítica
        this.currentEnergyMode = 'ultraSaving';
      }
    });
  }

  /**
   * Carga estadísticas de uso desde almacenamiento
   */
  private async loadStats(): Promise<void> {
    try {
      const storedStats = await storageService.getCache<AIUsageStats>('ai_stats');
      
      if (storedStats) {
        this.stats = {
          ...storedStats,
          lastUsed: new Date(storedStats.lastUsed)
        };
      }
    } catch (error) {
      console.error('Error cargando estadísticas de IA:', error);
    }
  }

  /**
   * Guarda estadísticas de uso en almacenamiento
   */
  private async saveStats(): Promise<void> {
    try {
      await storageService.setCache('ai_stats', this.stats);
    } catch (error) {
      console.error('Error guardando estadísticas de IA:', error);
    }
  }

  /**
   * Actualiza estadísticas de uso
   */
  private updateStats(
    tokensUsed: number,
    isLocal: boolean,
    latency: number,
    energySaved: number
  ): void {
    this.stats.tokensUsed += tokensUsed;
    this.stats.requestsCount += 1;
    
    if (isLocal) {
      this.stats.localRequestsCount += 1;
    } else {
      this.stats.remoteRequestsCount += 1;
    }
    
    // Actualiza latencia promedio ponderada
    this.stats.averageLatency = 
      (this.stats.averageLatency * (this.stats.requestsCount - 1) + latency) / 
      this.stats.requestsCount;
    
    this.stats.energySaved += energySaved;
    this.stats.lastUsed = new Date();
    
    // Guarda de manera diferida para no consumir recursos
    debounce(() => {
      this.saveStats();
    }, 10000)();
  }

  /**
   * Genera texto con IA, optimizando según modo de energía
   */
  public async generateText(
    prompt: AIPrompt,
    options?: AICompletionOptions
  ): Promise<AIResponse> {
    this.ensureInitialized();
    this.ensureEnabled();
    
    // Evento de inicio de procesamiento
    eventBus.emit(AIEventType.AI_PROCESSING_STARTED, {
      operation: prompt.operation,
      processingType: options?.prioritizeLocalProcessing || this.config.localProcessingFirst ? 
        'local' : 'remote'
    });
    
    try {
      // Medimos tiempo de ejecución
      const startTime = performance.now();
      
      // Aplicamos configuración según modo de energía
      const adaptedPrompt = this.adaptPromptForEnergyMode(prompt);
      const adaptedOptions = this.adaptOptionsForEnergyMode(options);
      
      // Decide modelo a utilizar
      let result: AIResponse;
      const useLocalProcessing = 
        (adaptedOptions?.prioritizeLocalProcessing || this.config.localProcessingFirst) && 
        this.localModel && 
        (this.currentEnergyMode !== 'highPerformance' || !adaptedOptions?.provider);
      
      if (useLocalProcessing) {
        // Procesamiento local
        result = await this.generateWithLocalModel(adaptedPrompt, adaptedOptions);
      } else {
        // Procesamiento remoto con API
        result = await this.generateWithRemoteAPI(adaptedPrompt, adaptedOptions);
      }
      
      // Calculamos métricas
      const processingTime = performance.now() - startTime;
      result.processingTime = processingTime;
      
      // Actualiza estadísticas
      this.updateStats(
        result.totalTokens,
        result.processingLocation === 'local',
        processingTime,
        this.calculateEnergySaved(result)
      );
      
      // Evento de finalización de procesamiento
      eventBus.emit(AIEventType.AI_PROCESSING_COMPLETED, {
        operation: prompt.operation,
        tokensUsed: result.totalTokens,
        processingTime: processingTime,
        processingLocation: result.processingLocation
      });
      
      return result;
    } catch (error) {
      console.error('Error generando texto con IA:', error);
      
      // Evento de error de procesamiento
      eventBus.emit(AIEventType.AI_PROCESSING_FAILED, {
        operation: prompt.operation,
        error: (error as Error).message
      });
      
      throw error;
    }
  }

  /**
   * Genera usando modelo local
   */
  private async generateWithLocalModel(
    prompt: AIPrompt,
    options?: AICompletionOptions
  ): Promise<AIResponse> {
    if (!this.localModel) {
      throw new Error('Modelo local no disponible');
    }
    
    try {
      // En una implementación real, invocaríamos el modelo local
      const modelResult = await this.localModel.generate(
        this.formatPromptForModel(prompt, 'local'),
        {
          maxTokens: options?.maxTokens || this.config.maxTokensDefault,
          temperature: options?.temperature || this.config.temperatureDefault,
          stopSequences: options?.stopSequences
        }
      );
      
      // Calcula métricas de tokens (estimado)
      const promptTokens = prompt.text.split(/\s+/).length;
      const completionTokens = modelResult.text.split(/\s+/).length;
      
      return {
        text: modelResult.text,
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        energyImpact: 0.2, // Impacto energético bajo para procesamiento local
        processingTime: 0, // Se actualiza después
        model: 'local-model',
        processingLocation: 'local'
      };
    } catch (error) {
      console.error('Error con modelo local:', error);
      throw error;
    }
  }

  /**
   * Genera usando API remota
   */
  private async generateWithRemoteAPI(
    prompt: AIPrompt,
    options?: AICompletionOptions
  ): Promise<AIResponse> {
    // Determina proveedor
    const provider = options?.provider || this.config.provider;
    
    // Si estamos en modo ultra ahorro, verifica si está permitido
    if (this.currentEnergyMode === 'ultraSaving' && 
        !this.config.energyProfile.ultraSavingMode.enabled) {
      throw new Error('API remota deshabilitada en modo de ahorro máximo');
    }
    
    // Verifica si tenemos cliente para este proveedor
    if (!this.apiClients.has(provider)) {
      throw new Error(`Proveedor de IA no disponible: ${provider}`);
    }
    
    try {
      const client = this.apiClients.get(provider);
      
      // En una implementación real, invocaríamos la API
      const apiResult = await client.generate(
        this.formatPromptForModel(prompt, provider),
        {
          model: options?.model || this.config.defaultModel,
          max_tokens: options?.maxTokens || this.config.maxTokensDefault,
          temperature: options?.temperature || this.config.temperatureDefault,
          stop: options?.stopSequences
        }
      );
      
      // Extrae métricas según proveedor
      let promptTokens, completionTokens, totalTokens;
      
      if (provider === 'openai') {
        promptTokens = apiResult.usage.prompt_tokens;
        completionTokens = apiResult.usage.completion_tokens;
        totalTokens = apiResult.usage.total_tokens;
      } else if (provider === 'anthropic') {
        promptTokens = apiResult.usage.input_tokens;
        completionTokens = apiResult.usage.output_tokens;
        totalTokens = apiResult.usage.total_tokens;
      } else {
        // Estimación genérica
        promptTokens = prompt.text.split(/\s+/).length;
        completionTokens = apiResult.text.split(/\s+/).length;
        totalTokens = promptTokens + completionTokens;
      }
      
      return {
        text: apiResult.text,
        promptTokens,
        completionTokens,
        totalTokens,
        energyImpact: 0.8, // Impacto energético alto para API remota
        processingTime: 0, // Se actualiza después
        model: options?.model || this.config.defaultModel,
        processingLocation: 'remote'
      };
    } catch (error) {
      console.error(`Error con API ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene sugerencias de IA para el texto actual
   * Optimizado para bajo consumo energético
   */
  public async getSuggestions(
    context: AIContext,
    options?: AICompletionOptions
  ): Promise<AISuggestion[]> {
    this.ensureInitialized();
    this.ensureEnabled();
    
    // Si estamos en modo ultra ahorro, no generamos sugerencias
    if (this.currentEnergyMode === 'ultraSaving') {
      return [];
    }
    
    try {
      // Crea clave de caché basada en contexto
      const cacheKey = this.createContextCacheKey(context);
      
      // Verifica caché (excepto en modo alto rendimiento)
      if (this.currentEnergyMode !== 'highPerformance' && this.suggestionCache.has(cacheKey)) {
        return this.suggestionCache.get(cacheKey) || [];
      }
      
      // Prepara prompt para sugerencias
      const prompt: AIPrompt = {
        text: context.precedingText,
        context: `${context.precedingText}\n[CURSOR]\n${context.followingText}`,
        systemPrompt: 'Eres un asistente que sugiere mejoras específicas y contextuales para documentos markdown. Genera 3 sugerencias relevantes, concisas y constructivas.',
        operation: 'suggestions',
        maxTokens: this.currentEnergyMode === 'lowPower' ? 300 : 500
      };
      
      // Genera sugerencias
      const response = await this.generateText(prompt, {
        ...options,
        temperature: 0.7, // Mayor creatividad para sugerencias
        prioritizeLocalProcessing: true // Preferimos procesamiento local para sugerencias
      });
      
      // Procesa respuesta para extraer sugerencias
      const suggestions = this.parseSuggestions(response.text, context);
      
      // Filtra por confianza
      const confidenceThreshold = this.currentEnergyMode === 'lowPower' ? 
        this.config.suggestionConfidence + 0.1 : // Más estricto en modo bajo consumo
        this.config.suggestionConfidence;
      
      const filteredSuggestions = suggestions
        .filter(s => s.confidence >= confidenceThreshold)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, this.currentEnergyMode === 'lowPower' ? 2 : 5); // Límite según modo energía
      
      // Guarda en caché
      this.suggestionCache.set(cacheKey, filteredSuggestions);
      
      // Limpia caché si es grande
      if (this.suggestionCache.size > 50) {
        // Elimina entradas aleatorias
        const keys = Array.from(this.suggestionCache.keys());
        for (let i = 0; i < 10 && keys.length > 0; i++) {
          const randomKey = keys[Math.floor(Math.random() * keys.length)];
          if (randomKey !== undefined) {
            this.suggestionCache.delete(randomKey);
          }
        }
      }
      
      // Emite evento de sugerencias listas
      eventBus.emit(AIEventType.AI_SUGGESTION_READY, {
        count: filteredSuggestions.length,
        energy: response.energyImpact
      });
      
      return filteredSuggestions;
    } catch (error) {
      console.error('Error generando sugerencias:', error);
      return [];
    }
  }

  /**
   * Parsea sugerencias del texto generado
   */
  private parseSuggestions(text: string, _: AIContext): AISuggestion[] {
    // En una implementación real, analizaríamos la respuesta de IA
    // Para este MVP, generamos sugerencias simuladas
    
    const suggestions: AISuggestion[] = [];
    
    // Simulación de extracción de sugerencias
    const lines = text.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i];
      if (line !== undefined) {
        suggestions.push({
          id: uuidv4(),
          text: line,
          confidence: 0.7 + Math.random() * 0.3, // Entre 0.7 y 1.0
          energy: 0.3, // Bajo consumo
          contextualRelevance: 0.8, // Alta relevancia
          type: i % 2 === 0 ? 'enhancement' : 'completion'
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Genera resumen de documento
   */
  public async summarizeDocument(
    content: string,
    options?: AICompletionOptions
  ): Promise<string> {
    this.ensureInitialized();
    this.ensureEnabled();
    
    // Si el contenido es muy corto, no generamos resumen
    if (content.length < 200) {
      return 'El documento es demasiado corto para generar un resumen.';
    }
    
    // Limita tamaño en modo bajo consumo
    const maxContentLength = this.currentEnergyMode === 'lowPower' ? 5000 : 
                            this.currentEnergyMode === 'ultraSaving' ? 2000 : 10000;
    
    const truncatedContent = content.length > maxContentLength ? 
      content.substring(0, maxContentLength) + '...' : content;
    
    const prompt: AIPrompt = {
      text: truncatedContent,
      systemPrompt: 'Genera un resumen conciso del siguiente documento, capturando los puntos principales y la estructura.',
      operation: 'summarization',
      maxTokens: this.currentEnergyMode === 'lowPower' ? 100 : 
                this.currentEnergyMode === 'ultraSaving' ? 50 : 200
    };
    
    try {
      const response = await this.generateText(prompt, options);
      return response.text;
    } catch (error) {
      console.error('Error generando resumen:', error);
      return 'No se pudo generar un resumen en este momento.';
    }
  }

  /**
   * Adapta prompt según modo de energía
   */
  private adaptPromptForEnergyMode(prompt: AIPrompt): AIPrompt {
    const adaptedPrompt = { ...prompt };
    
    if (this.currentEnergyMode === 'lowPower') {
      // Reduce tamaño de contexto
      if (prompt.context && prompt.context.length > this.config.energyProfile.lowPowerMode.contextSize) {
        adaptedPrompt.context = prompt.context.substring(0, this.config.energyProfile.lowPowerMode.contextSize);
      }
      
      // Ajusta máximo de tokens
      adaptedPrompt.maxTokens = Math.min(
        prompt.maxTokens || this.config.maxTokensDefault,
        this.config.energyProfile.lowPowerMode.maxTokens
      );
    } else if (this.currentEnergyMode === 'ultraSaving') {
      // Reduce drásticamente contexto
      if (prompt.context) {
        adaptedPrompt.context = prompt.context.substring(0, 500);
      }
      
      // Límite muy bajo de tokens
      adaptedPrompt.maxTokens = 100;
    }
    
    return adaptedPrompt;
  }

  /**
   * Adapta opciones según modo de energía
   */
  private adaptOptionsForEnergyMode(options?: AICompletionOptions): AICompletionOptions {
    const adaptedOptions = { ...options };
    
    if (this.currentEnergyMode === 'lowPower') {
      // Prioriza procesamiento local
      adaptedOptions.prioritizeLocalProcessing = true;
      
      // Ajusta máximo de tokens
      if (adaptedOptions.maxTokens) {
        adaptedOptions.maxTokens = Math.min(
          adaptedOptions.maxTokens,
          this.config.energyProfile.lowPowerMode.maxTokens
        );
      } else {
        adaptedOptions.maxTokens = this.config.energyProfile.lowPowerMode.maxTokens;
      }
    } else if (this.currentEnergyMode === 'ultraSaving') {
      // Fuerza procesamiento local
      adaptedOptions.prioritizeLocalProcessing = true;
      
      // Límite mínimo de tokens
      adaptedOptions.maxTokens = 100;
    } else if (this.currentEnergyMode === 'highPerformance') {
      // Usa preferencia de usuario para API
      adaptedOptions.prioritizeLocalProcessing = false;
      
      // Máximos tokens permitidos
      if (!adaptedOptions.maxTokens) {
        adaptedOptions.maxTokens = this.config.maxTokensDefault;
      }
    }
    
    return adaptedOptions;
  }

  /**
   * Formatea prompt según modelo
   */
  private formatPromptForModel(prompt: AIPrompt, provider: AIModelType | string): string {
    // En implementación real, adaptaríamos formato según proveedor
    // Para este MVP, simplemente adaptamos prompt a cada tipo de modelo
    
    const systemPrompt = prompt.systemPrompt || this.config.defaultSystemPrompt;
    
    if (provider === 'openai') {
      // Formato para modelos GPT
      return `${systemPrompt}\n\n${prompt.context ? 'Contexto: ' + prompt.context + '\n\n' : ''}${prompt.text}`;
    } else if (provider === 'anthropic') {
      // Formato para Claude
      return `${systemPrompt}\n\n${prompt.context ? 'Contexto: ' + prompt.context + '\n\n' : ''}Humano: ${prompt.text}\n\nAsistente:`;
    } else {
      // Formato genérico
      return `${systemPrompt}\n\n${prompt.context ? prompt.context + '\n\n' : ''}${prompt.text}`;
    }
  }

  /**
   * Crea clave de caché para contexto
   */
  private createContextCacheKey(context: AIContext): string {
    // Usamos parte del texto para crear clave única
    const precedingMd5 = this.simpleHash(context.precedingText.slice(-100));
    const followingMd5 = this.simpleHash(context.followingText.slice(0, 100));
    return `${precedingMd5}_${followingMd5}`;
  }

  /**
   * Función hash simple para caché
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convierte a entero de 32 bits
    }
    return hash.toString(16);
  }

  /**
   * Calcula energía ahorrada
   */
  private calculateEnergySaved(result: AIResponse): number {
    // Cálculo simple: si usamos procesamiento local vs. remoto
    if (result.processingLocation === 'local') {
      // Estimamos el ahorro como diferencia entre impacto local vs. remoto
      return 0.6 * result.totalTokens / 1000; // ~60% de ahorro
    }
    
    return 0;
  }

  /**
   * Actualiza el modo de energía
   */
  public setEnergyMode(mode: 'standard' | 'lowPower' | 'ultraSaving' | 'highPerformance'): void {
    if (this.currentEnergyMode === mode) return;
    
    this.currentEnergyMode = mode;
    console.log(`Modo de energía de IA cambiado a: ${mode}`);
    
    // En modo ultra ahorro, limpia caché
    if (mode === 'ultraSaving') {
      this.suggestionCache.clear();
    }
    
    // Emite evento de cambio de modo
    eventBus.emit(AIEventType.AI_MODE_CHANGED, { mode });
  }

  /**
   * Obtiene estadísticas de uso
   */
  public getUsageStats(): AIUsageStats {
    return { ...this.stats };
  }

  /**
   * Obtiene estado del servicio
   */
  public getServiceStatus(): {
    enabled: boolean;
    currentProvider: string;
    localModelAvailable: boolean;
    energyMode: string;
    energySaved: number;
  } {
    return {
      enabled: this.config.enabled,
      currentProvider: this.config.provider,
      localModelAvailable: !!this.localModel,
      energyMode: this.currentEnergyMode,
      energySaved: this.stats.energySaved
    };
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('AIService no inicializado. Llame a initialize() primero.');
    }
  }

  /**
   * Verifica que el servicio esté habilitado
   */
  private ensureEnabled(): void {
    if (!this.config.enabled) {
      throw new Error('Servicio de IA deshabilitado. Habilite en configuración.');
    }
    
    // En modo ultra ahorro, verifica si está permitido
    if (this.currentEnergyMode === 'ultraSaving' && 
        !this.config.energyProfile.ultraSavingMode.enabled) {
      throw new Error('IA deshabilitada en modo de ahorro máximo');
    }
  }

  /**
   * Habilita o deshabilita el servicio
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  /**
   * Libera recursos
   */
  public async dispose(): Promise<void> {
    // Guarda estadísticas
    await this.saveStats();
    
    // Limpia caché
    this.suggestionCache.clear();
    
    // En una implementación real, liberaríamos modelo local
    this.localModel = null;
    
    this.initialized = false;
    
    console.log('Servicio de IA liberado');
  }
}

// Exporta instancia singleton para uso compartido
export const aiService = new AIService();