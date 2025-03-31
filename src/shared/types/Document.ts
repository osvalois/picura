export interface Document {
  id: string;
  title: string;
  content: string;
  path: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  tags: string[];
  metadata: DocumentMetadata;
  version: number;
  format?: MarkdownFormat; // Tipo de formato markdown
}

export interface DocumentMetadata {
  author?: string;
  description?: string;
  status?: 'draft' | 'review' | 'final';
  template?: string;
  wordCount?: number;
  readingTime?: number;
  format?: MarkdownFormat;
  
  // Para carga progresiva y optimización
  isPartialContent?: boolean;    // Indica si el contenido está parcialmente cargado
  totalSize?: number;            // Tamaño total del archivo (bytes)
  loadedSize?: number;           // Tamaño cargado hasta el momento (bytes)
  loadProgress?: number;         // Progreso de carga (0-100)
  
  // Ajustes de rendimiento
  renderStrategy?: 'immediate' | 'deferred' | 'progressive' | 'chunked';
  
  sustainability?: {
    optimizedSize: number;
    originalSize: number;
    contentReuseFactor: number;
    editingEnergyUsage: number;
    syncEnergyCost: number;
  };
  custom?: Record<string, any>;
}

export type DocumentChanges = Partial<Omit<Document, 'id' | 'createdAt'>>;

export type MarkdownFormat = 'gfm' | 'commonmark' | 'markdown' | 'custom';

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  commitMessage?: string;
  timestamp: string;
  version: number;
  author?: string;
  sustainabilityMetrics: {
    diffSize: number;
    compressionRatio: number;
  };
}