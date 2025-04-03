import { EnergyMode } from '../../../../shared/types/SustainabilityMetrics';

// Tamaños de documentos para optimizaciones
export const DOC_SIZE = {
  SMALL: 30000,    // ~30KB
  MEDIUM: 100000,  // ~100KB
  LARGE: 500000,   // ~500KB
  VERY_LARGE: 1000000 // ~1MB
};

export type DocumentSize = 'small' | 'medium' | 'large' | 'very_large';

/**
 * Determina el tamaño de un documento basado en la longitud de su contenido
 */
export function determineDocumentSize(contentLength: number): DocumentSize {
  if (contentLength > DOC_SIZE.VERY_LARGE) {
    return 'very_large';
  } else if (contentLength > DOC_SIZE.LARGE) {
    return 'large';
  } else if (contentLength > DOC_SIZE.MEDIUM) {
    return 'medium';
  } else {
    return 'small';
  }
}

interface LoadStrategy {
  progressive: boolean;
  initialChunkSize: number;
  chunkLoadDelay: number;
  size: DocumentSize;
}

/**
 * Determina la estrategia óptima para cargar un documento basado en su tamaño
 * y el modo de energía. Adapta la carga para optimizar velocidad vs eficiencia
 * energética.
 */
export function getLoadStrategy(contentLength: number, energyMode: EnergyMode): LoadStrategy {
  if (contentLength > DOC_SIZE.VERY_LARGE) {
    return {
      progressive: true,
      initialChunkSize: energyMode === 'ultraSaving' ? 3000 :
        energyMode === 'lowPower' ? 5000 : 10000,
      chunkLoadDelay: energyMode === 'ultraSaving' ? 500 :
        energyMode === 'lowPower' ? 300 :
          energyMode === 'standard' ? 150 : 50,
      size: 'very_large'
    };
  } else if (contentLength > DOC_SIZE.LARGE) {
    return {
      progressive: true,
      initialChunkSize: energyMode === 'ultraSaving' ? 5000 :
        energyMode === 'lowPower' ? 10000 : 20000,
      chunkLoadDelay: energyMode === 'ultraSaving' ? 300 :
        energyMode === 'lowPower' ? 150 :
          energyMode === 'standard' ? 80 : 0,
      size: 'large'
    };
  } else if (contentLength > DOC_SIZE.MEDIUM) {
    return {
      progressive: energyMode !== 'highPerformance',
      initialChunkSize: energyMode === 'ultraSaving' ? 10000 : 20000,
      chunkLoadDelay: energyMode === 'ultraSaving' ? 150 :
        energyMode === 'lowPower' ? 80 : 0,
      size: 'medium'
    };
  } else {
    return {
      progressive: false,
      initialChunkSize: contentLength,
      chunkLoadDelay: 0,
      size: 'small'
    };
  }
}

/**
 * Intervalos de tiempo para autoguardado adaptados al modo de energía
 */
export const autosaveIntervals = {
  highPerformance: 10000,  // 10 segundos
  standard: 30000,         // 30 segundos
  lowPower: 60000,         // 1 minuto
  ultraSaving: 300000      // 5 minutos
};