/**
 * Tipos relacionados con la búsqueda de documentos
 */

export type SearchFilterType = 'tag' | 'date' | 'author' | 'status' | 'template';

export interface SearchFilter {
  type: SearchFilterType;
  value: string | string[] | Date | [Date, Date];
  negate?: boolean;
}

export interface SearchOptions {
  filters?: SearchFilter[] | undefined;
  sortBy?: 'relevance' | 'date' | 'title' | 'author' | undefined;
  sortDirection?: 'asc' | 'desc' | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  searchFields?: Array<'title' | 'content' | 'tags' | 'metadata'> | undefined;
  exactMatch?: boolean | undefined;
  caseSensitive?: boolean | undefined;
  includeContent?: boolean | undefined;
  highlightResults?: boolean | undefined;
  smartSearch?: boolean | undefined; // Búsqueda semántica o con sinónimos
  contentPreview?: boolean | undefined; // Incluir fragmento de texto con coincidencia
  path?: string | undefined; // Ruta específica para buscar
  includeTags?: boolean | undefined; // Incluir etiquetas en los resultados
}

export interface SearchResult {
  documentId: string;
  id?: string; // ID del documento
  title: string;
  path?: string;
  score: number; // Puntuación de relevancia
  matches: SearchMatch[];
  timestamp: string; // Fecha de última modificación
  snippet?: string; // Fragmento de texto con coincidencia
  excerpt?: string; // Alias para snippet/extracto de texto
  author?: string;
  tags?: string[];
}

export interface SearchMatch {
  field: string;
  term: string;
  count: number;
  positions: number[];
  highlights?: { start: number; end: number }[];
}

export interface SearchStats {
  totalResults: number;
  searchTime: number; // en ms
  indexSize: number; // en bytes
  termFrequency: Record<string, number>;
  lastIndexUpdate: string;
  efficiency: number; // Medida de optimización (0-1)
}

export interface SearchIndex {
  id: string;
  version: number;
  lastUpdated: string;
  documentCount: number;
  fields: string[];
  tokenCount: number;
  size: number; // bytes
  sustainability: {
    compressionRatio: number;
    queryEfficiency: number;
  };
}

export interface SearchSuggestion {
  term: string;
  frequency: number;
  type: 'correction' | 'synonym' | 'related' | 'recent';
}