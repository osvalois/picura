import React, { useState, useEffect, useRef } from 'react';
import { AISuggestion, AIContext } from '../../../shared/types/AITypes';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import { debounce } from '../../utils/performanceUtils';

interface AIAssistantProps {
  documentId?: string;
  documentTitle?: string;
  editorContent: string;
  cursorPosition: number;
  onSuggestionApply: (suggestion: string, replaceStart?: number, replaceEnd?: number) => void;
  enabled: boolean;
}

/**
 * Componente de asistente de IA optimizado para sostenibilidad
 */
const AIAssistant: React.FC<AIAssistantProps> = ({
  documentId,
  documentTitle,
  editorContent,
  cursorPosition,
  onSuggestionApply,
  enabled
}) => {
  // Estados
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'auto' | 'manual'>('auto');
  const [showAssistant, setShowAssistant] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Contexto de sostenibilidad
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Referencias
  const contextRef = useRef<AIContext | null>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  
  // Deshabilitamos asistente en modo ultra ahorro si está en auto
  const isDisabled = !enabled || (currentEnergyMode === 'ultraSaving' && assistantMode === 'auto');
  
  // Preparamos contexto para IA basado en posición de cursor
  useEffect(() => {
    if (isDisabled || !editorContent) return;
    
    // Crea contexto alrededor del cursor
    const precedingText = editorContent.substring(0, cursorPosition);
    const followingText = editorContent.substring(cursorPosition);
    
    // Limita tamaño de contexto según modo de energía
    const contextLimit = 
      currentEnergyMode === 'ultraSaving' ? 500 : 
      currentEnergyMode === 'lowPower' ? 1000 : 2000;
    
    const context: AIContext = {
      documentId,
      documentTitle,
      precedingText: precedingText.slice(-contextLimit),
      followingText: followingText.slice(0, contextLimit)
    };
    
    contextRef.current = context;
    
    // Si está en modo auto, solicita sugerencias
    if (assistantMode === 'auto') {
      // Debounce para no sobrecargar con cada keystroke
      debouncedGetSuggestions();
    }
  }, [editorContent, cursorPosition, documentId, currentEnergyMode, assistantMode, enabled]);
  
  // Debounce para optimizar rendimiento
  const debouncedGetSuggestions = debounce(() => {
    if (isDisabled || !contextRef.current) return;
    
    // Solicitamos sugerencias al servicio
    getSuggestions(contextRef.current);
  }, currentEnergyMode === 'lowPower' ? 1000 : 500);
  
  // Solicita sugerencias al servicio de IA
  const getSuggestions = async (context: AIContext) => {
    if (isDisabled) return;
    
    setIsLoading(true);
    
    try {
      // En una implementación real, invocaríamos aiService.getSuggestions
      // Para este MVP, simulamos respuesta
      
      // Simulación de latencia
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulación de sugerencias
      const mockSuggestions: AISuggestion[] = [
        {
          id: '1',
          text: 'Considere añadir más detalles sobre las optimizaciones de energía.',
          confidence: 0.85,
          energy: 0.3,
          contextualRelevance: 0.9,
          type: 'enhancement'
        },
        {
          id: '2',
          text: 'Podría mejorar la estructura utilizando encabezados jerárquicos.',
          confidence: 0.78,
          energy: 0.3,
          contextualRelevance: 0.8,
          type: 'enhancement'
        },
        {
          id: '3',
          text: 'Añada ejemplos concretos para ilustrar los conceptos.',
          confidence: 0.72,
          energy: 0.25,
          contextualRelevance: 0.7,
          type: 'enhancement'
        }
      ];
      
      // Si está en modo de bajo consumo, limitamos sugerencias
      const filteredSuggestions = currentEnergyMode === 'lowPower' ? 
        mockSuggestions.slice(0, 2) : mockSuggestions;
      
      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Maneja petición manual
  const handleManualRequest = () => {
    if (isDisabled || !contextRef.current) return;
    
    // Actualiza contexto con prompt personalizado
    const context = {
      ...contextRef.current,
      precedingText: contextRef.current.precedingText + '\n[PROMPT: ' + customPrompt + ']'
    };
    
    // Solicita sugerencias
    getSuggestions(context);
    
    // Limpia prompt
    setCustomPrompt('');
  };
  
  // Maneja envío de formulario de prompt
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleManualRequest();
  };
  
  // Cambia entre modos auto y manual
  const toggleAssistantMode = () => {
    const newMode = assistantMode === 'auto' ? 'manual' : 'auto';
    setAssistantMode(newMode);
    
    // Si cambia a automático, solicita sugerencias inmediatamente
    if (newMode === 'auto' && contextRef.current) {
      getSuggestions(contextRef.current);
    }
  };
  
  // Si está deshabilitado, no mostramos nada
  if (!showAssistant) {
    return (
      <button
        onClick={() => setShowAssistant(true)}
        className="fixed bottom-4 right-4 p-2 bg-blue-500 text-white rounded-full shadow-lg"
        title="Mostrar asistente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
    );
  }
  
  return (
    <div className={`ai-assistant fixed bottom-4 right-4 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${isDisabled ? 'opacity-60' : ''}`}>
      {/* Cabecera */}
      <div className="assistant-header p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Asistente IA</h3>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={toggleAssistantMode}
            className={`p-1 rounded ${assistantMode === 'auto' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            title={assistantMode === 'auto' ? 'Cambiar a modo manual' : 'Cambiar a modo automático'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowAssistant(false)}
            className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Minimizar asistente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Cuerpo */}
      <div className="assistant-body p-3 max-h-60 overflow-y-auto">
        {isDisabled && (
          <div className="text-sm text-center p-4 text-gray-500 dark:text-gray-400">
            {!enabled ? (
              <>El asistente está deshabilitado</>
            ) : (
              <>
                Asistente automático deshabilitado en modo de ahorro máximo.
                Cambie a modo manual o a un modo de energía diferente.
              </>
            )}
          </div>
        )}
        
        {!isDisabled && isLoading && (
          <div className="text-sm text-center p-4 text-gray-500 dark:text-gray-400">
            <svg className="animate-spin h-4 w-4 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando sugerencias...
          </div>
        )}
        
        {!isDisabled && !isLoading && suggestions.length === 0 && (
          <div className="text-sm text-center p-4 text-gray-500 dark:text-gray-400">
            {assistantMode === 'auto' ? (
              <>Escriba para generar sugerencias automáticas</>
            ) : (
              <>Ingrese un prompt para recibir asistencia</>
            )}
          </div>
        )}
        
        {!isDisabled && !isLoading && suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((suggestion) => (
              <li 
                key={suggestion.id}
                className="suggestion-item p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                onClick={() => onSuggestionApply(suggestion.text, suggestion.replacementStart, suggestion.replacementEnd)}
              >
                <p className="text-sm text-gray-800 dark:text-gray-200">{suggestion.text}</p>
                
                {/* Optimización: Mostrar métricas sólo en modo alto rendimiento */}
                {currentEnergyMode === 'highPerformance' && (
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-blue-500 dark:text-blue-300">
                      Confianza: {Math.round(suggestion.confidence * 100)}%
                    </span>
                    <span className="text-xs text-green-500 dark:text-green-300">
                      Energía: {Math.round(suggestion.energy * 100)}%
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Input para modo manual */}
      {!isDisabled && assistantMode === 'manual' && (
        <form onSubmit={handlePromptSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex">
            <input
              ref={promptInputRef}
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-grow px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <button
              type="submit"
              disabled={customPrompt.trim() === ''}
              className="px-3 py-1 bg-blue-500 text-white rounded-r disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </form>
      )}
      
      {/* Footer con modo de energía */}
      <div className="assistant-footer p-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Modo: {assistantMode === 'auto' ? 'Automático' : 'Manual'}
        </span>
        <span className={
          currentEnergyMode === 'highPerformance' ? 'text-red-500 dark:text-red-400' :
          currentEnergyMode === 'standard' ? 'text-blue-500 dark:text-blue-400' :
          currentEnergyMode === 'lowPower' ? 'text-green-500 dark:text-green-400' :
          'text-yellow-500 dark:text-yellow-400'
        }>
          {currentEnergyMode === 'highPerformance' ? 'Alto rendimiento' :
           currentEnergyMode === 'standard' ? 'Estándar' :
           currentEnergyMode === 'lowPower' ? 'Bajo consumo' : 'Ahorro máximo'}
        </span>
      </div>
    </div>
  );
};

export default AIAssistant;