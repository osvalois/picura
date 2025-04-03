import { ipcMain } from 'electron';

// Definimos un tipo para el servicio de IA
// Esta interfaz debe ser implementada por el servicio real
interface AIService {
  generateSuggestions(content: string, context?: any): Promise<string[]>;
  analyzeDocument(documentId: string): Promise<DocumentAnalysis>;
  extractKeywords(text: string): Promise<string[]>;
  generateSummary(text: string, maxLength?: number): Promise<string>;
  translateText(text: string, targetLanguage: string): Promise<string>;
  checkGrammar(text: string): Promise<GrammarCheckResult>;
  getMode(): Promise<AIMode>;
  setMode(mode: AIMode): Promise<boolean>;
  isAvailable(): Promise<boolean>;
}

// Tipos de datos para AI
interface DocumentAnalysis {
  topics: string[];
  sentiment: number;
  readability: {
    score: number;
    grade: string;
  };
  recommendations: string[];
  wordCount: number;
  estimatedReadTime: number;
}

interface GrammarCheckResult {
  corrections: Array<{
    offset: number;
    length: number;
    message: string;
    replacements: string[];
    rule: string;
    severity: 'error' | 'warning' | 'suggestion';
  }>;
  score: number;
}

type AIMode = 'disabled' | 'minimal' | 'standard' | 'advanced';

/**
 * Configura manejadores IPC para operaciones de IA
 * Implementa funcionalidades optimizadas para eficiencia energética
 */
export function setupAIHandlers(aiService: AIService) {
  // Helper function to safely register handlers
  const safelyRegisterHandler = (channel: string, handler: any) => {
    try {
      // Remove any existing handler first
      ipcMain.removeHandler(channel);
      // Register the new handler
      ipcMain.handle(channel, handler);
    } catch (error) {
      console.error(`Error registering handler for ${channel}:`, error);
    }
  };

  // Generar sugerencias
  safelyRegisterHandler('ai:generateSuggestions', async (_: any, args: {
    content: string,
    context?: any
  }) => {
    try {
      const { content, context } = args;
      return await aiService.generateSuggestions(content, context);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw new Error('Failed to generate suggestions');
    }
  });

  // Analizar documento
  safelyRegisterHandler('ai:analyzeDocument', async (_: any, documentId: string) => {
    try {
      return await aiService.analyzeDocument(documentId);
    } catch (error) {
      console.error(`Error analyzing document ${documentId}:`, error);
      throw new Error('Failed to analyze document');
    }
  });

  // Extraer palabras clave
  safelyRegisterHandler('ai:extractKeywords', async (_: any, text: string) => {
    try {
      return await aiService.extractKeywords(text);
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw new Error('Failed to extract keywords');
    }
  });

  // Generar resumen
  safelyRegisterHandler('ai:generateSummary', async (_: any, args: {
    text: string,
    maxLength?: number
  }) => {
    try {
      const { text, maxLength } = args;
      return await aiService.generateSummary(text, maxLength);
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  });

  // Traducir texto
  safelyRegisterHandler('ai:translateText', async (_: any, args: {
    text: string,
    targetLanguage: string
  }) => {
    try {
      const { text, targetLanguage } = args;
      return await aiService.translateText(text, targetLanguage);
    } catch (error) {
      console.error(`Error translating text to ${args.targetLanguage}:`, error);
      throw new Error('Failed to translate text');
    }
  });

  // Revisar gramática
  safelyRegisterHandler('ai:checkGrammar', async (_: any, text: string) => {
    try {
      return await aiService.checkGrammar(text);
    } catch (error) {
      console.error('Error checking grammar:', error);
      throw new Error('Failed to check grammar');
    }
  });

  // Obtener modo de IA
  safelyRegisterHandler('ai:getMode', async () => {
    try {
      return await aiService.getMode();
    } catch (error) {
      console.error('Error getting AI mode:', error);
      throw new Error('Failed to get AI mode');
    }
  });

  // Establecer modo de IA
  safelyRegisterHandler('ai:setMode', async (_: any, mode: AIMode) => {
    try {
      return await aiService.setMode(mode);
    } catch (error) {
      console.error(`Error setting AI mode to ${mode}:`, error);
      throw new Error('Failed to set AI mode');
    }
  });

  // Verificar disponibilidad de IA
  safelyRegisterHandler('ai:isAvailable', async () => {
    try {
      return await aiService.isAvailable();
    } catch (error) {
      console.error('Error checking AI availability:', error);
      throw new Error('Failed to check AI availability');
    }
  });
}