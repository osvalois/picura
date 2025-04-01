/**
 * Tipos relacionados con asistente de IA
 */

export type AIOperationType = 
  | 'textGeneration'
  | 'textCompletion'
  | 'summarization'
  | 'suggestions'
  | 'formatting'
  | 'analysis'
  | 'correction';

export type AIModelType = 
  | 'local' 
  | 'openai' 
  | 'anthropic' 
  | 'offline';

export interface AIPrompt {
  text: string;
  context?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  operation: AIOperationType;
}

export interface AIResponse {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  energyImpact: number;  // Estimación del consumo energético (0-1)
  processingTime: number; // tiempo en ms
  model: string;
  processingLocation: 'local' | 'remote';
}

export interface AICompletionOptions {
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  model?: string;
  provider?: AIModelType;
  prioritizeLocalProcessing?: boolean;
}

export interface AIServiceConfig {
  enabled: boolean;
  provider: AIModelType;
  defaultModel: string;
  apiKey?: string;
  endpoint?: string;
  defaultSystemPrompt: string;
  contextSize: number;
  temperatureDefault: number;
  maxTokensDefault: number;
  localProcessingFirst: boolean;
  offlineModelPath?: string;
  suggestionConfidence: number;  // Umbral de confianza para sugerencias (0-1)
  energyProfile: {
    lowPowerMode: {
      enabled: boolean;
      maxTokens: number;
      contextSize: number;
    };
    ultraSavingMode: {
      enabled: boolean;
    };
  };
}

export interface AISuggestion {
  id: string;
  text: string;
  confidence: number;
  replacementStart?: number;
  replacementEnd?: number;
  energy: number; // Consumo estimado (0-1)
  contextualRelevance: number; // Relevancia contextual (0-1)
  type: 'completion' | 'correction' | 'enhancement' | 'formatting' | 'citation';
}

export interface AIUsageStats {
  tokensUsed: number;
  requestsCount: number;
  localRequestsCount: number;
  remoteRequestsCount: number;
  energySaved: number;
  averageLatency: number;
  lastUsed: Date;
}

export interface AIContext {
  documentId?: string;  // Marked as optional
  documentTitle?: string;  // Marked as optional
  precedingText: string;
  followingText: string;
  metadata?: Record<string, any>;
}