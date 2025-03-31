import React from 'react';
import { SearchResult, SearchStats } from '../../../shared/types/SearchTypes';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';

interface SearchResultsProps {
  results: SearchResult[];
  stats: SearchStats;
  onResultClick: (documentId: string) => void;
  isLoading?: boolean;
  query: string;
}

/**
 * Visualización de resultados de búsqueda optimizada para sostenibilidad
 */
const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  stats,
  onResultClick,
  isLoading = false,
  query
}) => {
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Si está cargando, muestra indicador
  if (isLoading) {
    return (
      <div className="search-results-loading p-4 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Si no hay resultados, muestra mensaje
  if (results.length === 0) {
    return (
      <div className="search-results-empty p-8 text-center">
        {query ? (
          <>
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">
              <span role="img" aria-label="Searching">🔎</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No hay documentos que coincidan con "{query}"
            </p>
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Ingresa un término de búsqueda para empezar
          </p>
        )}
      </div>
    );
  }
  
  // Función para resaltar coincidencias en texto
  const highlightMatches = (text: string, searchTerms: string[]): JSX.Element => {
    if (!text || searchTerms.length === 0 || currentEnergyMode === 'ultraSaving') {
      return <>{text}</>;
    }
    
    // Construye expresión regular para todos los términos
    const regex = new RegExp(
      searchTerms.map(term => 
        term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escapa caracteres especiales
      ).join('|'), 
      'gi'
    );
    
    // Divide texto en coincidencias y no coincidencias
    const parts = text.split(regex);
    const matches = text.match(regex) || [];
    
    // Combina partes con coincidencias resaltadas
    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {matches[i] && <mark className="bg-yellow-200 dark:bg-yellow-800">{matches[i]}</mark>}
          </React.Fragment>
        ))}
      </>
    );
  };
  
  // Formatea fecha para mostrar
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      // Si es hoy, muestra hora
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return `Hoy, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Si es ayer, muestra "Ayer"
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Ayer, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Para fechas más antiguas, muestra fecha completa
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Extrae términos de búsqueda para resaltado
  const searchTerms = Object.keys(stats.termFrequency);
  
  return (
    <div className="search-results">
      {/* Cabecera de resultados con estadísticas */}
      <div className="results-header p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="results-count text-sm text-gray-600 dark:text-gray-400">
          {stats.totalResults} resultado{stats.totalResults !== 1 ? 's' : ''} 
          {query && <span> para <strong>"{query}"</strong></span>}
        </div>
        
        {/* Optimización: Mostrar estadísticas solo en modo estándar o alto rendimiento */}
        {(currentEnergyMode === 'standard' || currentEnergyMode === 'highPerformance') && (
          <div className="results-stats text-xs text-gray-500 dark:text-gray-500">
            Búsqueda en {stats.searchTime.toFixed(2)}ms | 
            Eficiencia: {Math.round(stats.efficiency * 100)}%
          </div>
        )}
      </div>
      
      {/* Lista de resultados */}
      <div className="results-list divide-y divide-gray-200 dark:divide-gray-700">
        {results.map((result) => (
          <div 
            key={result.documentId}
            className="result-item p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => onResultClick(result.documentId)}
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {highlightMatches(result.title, searchTerms)}
              </h3>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                {formatDate(result.timestamp)}
              </div>
            </div>
            
            {/* Optimización: Mostrar autor solo en modos no ultra ahorro */}
            {result.author && currentEnergyMode !== 'ultraSaving' && (
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {result.author}
              </div>
            )}
            
            {/* Fragmento de contenido */}
            {result.snippet && (
              <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {highlightMatches(result.snippet, searchTerms)}
              </div>
            )}
            
            {/* Optimización: Mostrar etiquetas solo en modos no bajo consumo */}
            {result.tags && result.tags.length > 0 && currentEnergyMode !== 'ultraSaving' && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Optimización: Mostrar puntuación solo en modo de alto rendimiento */}
            {currentEnergyMode === 'highPerformance' && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Puntuación: {result.score.toFixed(2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;