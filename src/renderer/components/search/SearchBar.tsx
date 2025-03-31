import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchOptions } from '../../../shared/types/SearchTypes';
import { useSustainabilityContext } from '../../contexts/SustainabilityContext';
import { debounce } from '../../utils/performanceUtils';

interface SearchBarProps {
  onSearch: (query: string, options: SearchOptions) => void;
  onClear: () => void;
  isSearching?: boolean;
  initialQuery?: string;
  placeholder?: string;
  showFilters?: boolean;
}

/**
 * Barra de búsqueda con optimizaciones de sostenibilidad
 * Adapta comportamiento según modo de energía
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onClear,
  isSearching = false,
  initialQuery = '',
  placeholder = 'Buscar documentos...',
  showFilters = true
}) => {
  // Estados
  const [query, setQuery] = useState(initialQuery);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<SearchOptions['filters']>([]);
  const [sortBy, setSortBy] = useState<SearchOptions['sortBy']>('relevance');
  const [sortDirection, setSortDirection] = useState<SearchOptions['sortDirection']>('desc');
  const [exactMatch, setExactMatch] = useState(false);
  const [searchInContent, setSearchInContent] = useState(true);
  const [searchInTitles, setSearchInTitles] = useState(true);
  const [searchInTags, setSearchInTags] = useState(true);
  
  // Referencias
  const inputRef = useRef<HTMLInputElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  
  // Contexto de sostenibilidad
  const { currentEnergyMode } = useSustainabilityContext();
  
  // Determina el retraso de búsqueda según modo de energía
  const getDebounceDelay = useCallback(() => {
    const delays = {
      highPerformance: 100,  // 100ms
      standard: 300,         // 300ms
      lowPower: 500,         // 500ms
      ultraSaving: 1000      // 1s
    };
    
    return delays[currentEnergyMode] || delays.standard;
  }, [currentEnergyMode]);
  
  // Búsqueda con debounce para optimizar rendimiento
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (!searchQuery.trim()) {
        onClear();
        return;
      }
      
      // Construye opciones de búsqueda
      const searchFields: Array<'title' | 'content' | 'tags' | 'metadata'> = [];
      if (searchInTitles) searchFields.push('title');
      if (searchInContent) searchFields.push('content');
      if (searchInTags) searchFields.push('tags');
      
      const options: SearchOptions = {
        filters,
        sortBy,
        sortDirection,
        exactMatch,
        searchFields,
        highlightResults: true,
        contentPreview: true,
        smartSearch: currentEnergyMode !== 'ultraSaving',
        limit: currentEnergyMode === 'ultraSaving' ? 10 : 
              currentEnergyMode === 'lowPower' ? 20 : 50
      };
      
      onSearch(searchQuery, options);
    }, getDebounceDelay()),
    [filters, sortBy, sortDirection, exactMatch, searchInContent, searchInTitles, 
     searchInTags, currentEnergyMode, onSearch, onClear, getDebounceDelay]
  );
  
  // Efecto para actualizar debounce al cambiar modo de energía
  useEffect(() => {
    // Recreamos debouncedSearch cuando cambia el modo de energía
    return () => {
      debouncedSearch.cancel();
    };
  }, [currentEnergyMode, debouncedSearch]);
  
  // Efecto para ejecutar búsqueda inicial si hay query
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      debouncedSearch(initialQuery);
    }
  }, [initialQuery, debouncedSearch]);
  
  // Maneja cambios en el input de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (newQuery.trim()) {
      debouncedSearch(newQuery);
    } else {
      onClear();
    }
  };
  
  // Maneja clic en botón de búsqueda
  const handleSearchClick = () => {
    if (query.trim()) {
      // Cancela debounce para búsqueda inmediata
      debouncedSearch.cancel();
      
      // Construye opciones de búsqueda
      const searchFields: Array<'title' | 'content' | 'tags' | 'metadata'> = [];
      if (searchInTitles) searchFields.push('title');
      if (searchInContent) searchFields.push('content');
      if (searchInTags) searchFields.push('tags');
      
      const options: SearchOptions = {
        filters,
        sortBy,
        sortDirection,
        exactMatch,
        searchFields,
        highlightResults: true,
        contentPreview: true,
        smartSearch: currentEnergyMode !== 'ultraSaving',
        limit: currentEnergyMode === 'ultraSaving' ? 10 : 
              currentEnergyMode === 'lowPower' ? 20 : 50
      };
      
      onSearch(query, options);
    }
  };
  
  // Maneja tecla Enter en input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };
  
  // Maneja clic en botón de limpiar
  const handleClearClick = () => {
    setQuery('');
    onClear();
    
    // Enfoca input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Alterna panel de filtros
  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };
  
  // Cierra panel al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterPanelRef.current && 
        !filterPanelRef.current.contains(event.target as Node) &&
        showFilterPanel
      ) {
        setShowFilterPanel(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPanel]);
  
  // Añade filtro de fecha
  const addDateFilter = (startDate: Date, endDate: Date) => {
    // Elimina filtros de fecha existentes
    const existingFilters = filters?.filter(f => f.type !== 'date') || [];
    
    // Añade nuevo filtro de fecha
    setFilters([
      ...existingFilters,
      {
        type: 'date',
        value: [startDate, endDate]
      }
    ]);
    
    // Aplica búsqueda inmediatamente si hay query
    if (query.trim()) {
      handleSearchClick();
    }
  };
  
  // Añade filtro de etiqueta
  const addTagFilter = (tag: string) => {
    // Verifica si ya existe
    const tagFilterIndex = filters?.findIndex(f => 
      f.type === 'tag' && 
      (f.value === tag || (Array.isArray(f.value) && f.value.includes(tag)))
    );
    
    let newFilters = [...(filters || [])];
    
    if (tagFilterIndex !== -1 && tagFilterIndex !== undefined) {
      // Ya existe, lo elimina
      newFilters.splice(tagFilterIndex, 1);
    } else {
      // No existe, lo añade
      newFilters.push({
        type: 'tag',
        value: tag
      });
    }
    
    setFilters(newFilters);
    
    // Aplica búsqueda inmediatamente si hay query
    if (query.trim()) {
      handleSearchClick();
    }
  };
  
  // Elimina todos los filtros
  const clearFilters = () => {
    setFilters([]);
    setSortBy('relevance');
    setSortDirection('desc');
    setExactMatch(false);
    
    // Aplica búsqueda inmediatamente si hay query
    if (query.trim()) {
      handleSearchClick();
    }
  };
  
  // Estilos específicos según modo de energía
  const getEnergyModeStyles = () => {
    if (currentEnergyMode === 'ultraSaving') {
      return 'search-bar-ultra-saving'; // Clase CSS para estilo mínimo
    }
    return '';
  };
  
  return (
    <div className={`search-bar w-full ${getEnergyModeStyles()}`}>
      <div className="flex items-center w-full relative">
        {/* Input de búsqueda */}
        <div className="relative flex-grow">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            disabled={isSearching}
          />
          
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Botón de limpiar */}
          {query && (
            <button
              onClick={handleClearClick}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Limpiar búsqueda"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Botón de búsqueda */}
        <button
          onClick={handleSearchClick}
          disabled={!query.trim() || isSearching}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSearching ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Buscando
            </span>
          ) : 'Buscar'}
        </button>
        
        {/* Botón de filtros (solo si showFilters es true) */}
        {showFilters && (
          <button
            onClick={toggleFilterPanel}
            className={`ml-2 px-2 py-2 text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none ${showFilterPanel ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
            aria-label="Filtros de búsqueda"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Panel de filtros */}
      {showFilters && showFilterPanel && (
        <div 
          ref={filterPanelRef}
          className="filter-panel mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg absolute right-0 z-10 w-80"
        >
          <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Opciones de búsqueda</h3>
          
          {/* Opciones de búsqueda */}
          <div className="space-y-4">
            {/* Tipo de ordenamiento */}
            <div className="form-group">
              <label htmlFor="sortBy" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchOptions['sortBy'])}
                className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="relevance">Relevancia</option>
                <option value="date">Fecha</option>
                <option value="title">Título</option>
                <option value="author">Autor</option>
              </select>
            </div>
            
            {/* Dirección de ordenamiento */}
            <div className="form-group">
              <label htmlFor="sortDirection" className="block text-xs text-gray-700 dark:text-gray-300 mb-1">
                Dirección
              </label>
              <select
                id="sortDirection"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as SearchOptions['sortDirection'])}
                className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
            
            {/* Opciones de coincidencia */}
            <div className="form-group space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="exactMatch"
                  checked={exactMatch}
                  onChange={(e) => setExactMatch(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                />
                <label htmlFor="exactMatch" className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                  Coincidencia exacta
                </label>
              </div>
            </div>
            
            {/* Dónde buscar */}
            <div className="form-group">
              <p className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Buscar en</p>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="searchInTitles"
                    checked={searchInTitles}
                    onChange={(e) => setSearchInTitles(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <label htmlFor="searchInTitles" className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                    Títulos
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="searchInContent"
                    checked={searchInContent}
                    onChange={(e) => setSearchInContent(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <label htmlFor="searchInContent" className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                    Contenido
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="searchInTags"
                    checked={searchInTags}
                    onChange={(e) => setSearchInTags(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <label htmlFor="searchInTags" className="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                    Etiquetas
                  </label>
                </div>
              </div>
            </div>
            
            {/* Filtros aplicados */}
            {filters && filters.length > 0 && (
              <div className="form-group">
                <p className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Filtros aplicados</p>
                <div className="flex flex-wrap gap-1">
                  {filters.map((filter, index) => (
                    <div 
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs flex items-center"
                    >
                      <span>
                        {filter.type === 'tag' && `Tag: ${filter.value}`}
                        {filter.type === 'date' && `Fecha: ${Array.isArray(filter.value) ? 
                          `${new Date(filter.value[0] as Date).toLocaleDateString()} - ${new Date(filter.value[1] as Date).toLocaleDateString()}` : 
                          new Date(filter.value as Date).toLocaleDateString()}`}
                        {filter.type === 'author' && `Autor: ${filter.value}`}
                      </span>
                      <button
                        onClick={() => {
                          const newFilters = [...filters];
                          newFilters.splice(index, 1);
                          setFilters(newFilters);
                          
                          // Aplica búsqueda inmediatamente si hay query
                          if (query.trim()) {
                            handleSearchClick();
                          }
                        }}
                        className="ml-1 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Botones de acción */}
            <div className="flex justify-between">
              <button
                onClick={clearFilters}
                className="text-xs px-2 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Limpiar filtros
              </button>
              <button
                onClick={handleSearchClick}
                disabled={!query.trim() || isSearching}
                className="text-xs px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador de optimizaciones de energía en modo bajo consumo */}
      {(currentEnergyMode === 'lowPower' || currentEnergyMode === 'ultraSaving') && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {currentEnergyMode === 'ultraSaving' ? 
            'Búsqueda optimizada para ahorro máximo de batería. Resultados limitados.' : 
            'Búsqueda optimizada para reducir consumo de energía.'}
        </div>
      )}
    </div>
  );
};

export default SearchBar;