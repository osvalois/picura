/**
 * Utilidades para optimización de rendimiento y sostenibilidad
 */

/**
 * Implementación optimizada de debounce para reducir actualizaciones frecuentes
 * @param func Función a ejecutar
 * @param wait Tiempo de espera en ms
 * @param immediate Ejecutar inmediatamente en primera llamada
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    const callNow = immediate && !timeout;
    
    // Limpia timeout existente
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // Configura nuevo timeout
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func(...args);
    }, wait);
    
    // Si es inmediato y no hay timeout activo, ejecuta
    if (callNow) func(...args);
  };
}

/**
 * Implementación optimizada de throttle para limitar frecuencia de ejecución
 * @param func Función a ejecutar
 * @param limit Límite de tiempo en ms
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    // Si está en throttle, guarda argumentos para última ejecución
    if (inThrottle) {
      lastArgs = args;
      lastThis = this;
      return;
    }
    
    // Ejecuta inmediatamente
    func.apply(this, args);
    inThrottle = true;
    
    // Programa fin de throttle
    setTimeout(() => {
      inThrottle = false;
      
      // Si hay argumentos pendientes, ejecuta
      if (lastArgs) {
        func.apply(lastThis, lastArgs);
        lastArgs = null;
        lastThis = null;
      }
    }, limit);
  };
}

/**
 * Ejecuta una función sólo cuando el navegador esté inactivo
 * @param callback Función a ejecutar
 * @param fallbackTimeout Timeout de fallback en ms
 */
export function runWhenIdle(
  callback: () => void,
  fallbackTimeout: number = 1000
): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    // Usa requestIdleCallback si está disponible
    window.requestIdleCallback(() => callback(), { timeout: fallbackTimeout });
  } else {
    // Fallback a setTimeout
    setTimeout(callback, fallbackTimeout);
  }
}

/**
 * Mide el tiempo de ejecución de una función
 * @param func Función a medir
 * @param label Etiqueta para el log
 */
export function measureExecutionTime<T extends (...args: any[]) => any>(
  func: T,
  label: string = 'Execution time'
): (...args: Parameters<T>) => ReturnType<T> {
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = func.apply(this, args);
    const end = performance.now();
    
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
}

/**
 * Agrupa actualizaciones de estado para reducir renderizados
 * Similar a batch update de React pero personalizado
 * @param updates Funciones de actualización a ejecutar en batch
 */
export function batchUpdates(updates: Array<() => void>): void {
  // Si ReactDOM.unstable_batchedUpdates está disponible, usarlo
  if (typeof window !== 'undefined' && 
      window.ReactDOM && 
      window.ReactDOM.unstable_batchedUpdates) {
    window.ReactDOM.unstable_batchedUpdates(() => {
      updates.forEach(update => update());
    });
  } else {
    // Fallback a ejecución secuencial
    updates.forEach(update => update());
  }
}

/**
 * Retrasa una operación para no bloquear el hilo principal
 * @param chunks Array de elementos a procesar
 * @param processor Función de procesamiento por elemento
 * @param chunkSize Tamaño del chunk
 * @param delay Retraso entre chunks en ms
 */
export async function processInChunks<T, R>(
  chunks: T[],
  processor: (item: T) => R,
  chunkSize: number = 10,
  delay: number = 0
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < chunks.length; i += chunkSize) {
    // Procesa un chunk
    const chunk = chunks.slice(i, i + chunkSize);
    const chunkResults = chunk.map(processor);
    results.push(...chunkResults);
    
    // Si no es el último chunk, espera
    if (i + chunkSize < chunks.length && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
}

/**
 * Detecta si el dispositivo está en modo de batería baja
 * @returns Promise<boolean> True si está en modo de batería baja
 */
export async function isLowPowerMode(): Promise<boolean> {
  // Intenta obtener información de batería
  if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
    try {
      const battery = await (navigator as any).getBattery();
      
      // Considera batería baja si está descargando y nivel < 20%
      if (!battery.charging && battery.level < 0.2) {
        return true;
      }
    } catch (error) {
      console.error('Error detecting battery status:', error);
    }
  }
  
  // Si detecta media query prefers-reduced-data, asume modo de ahorro
  if (typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-data: reduce)').matches) {
    return true;
  }
  
  // Sin información suficiente, asume falso
  return false;
}

// Función para medir y reportar uso de memoria
export function reportMemoryUsage(label: string = 'Memory usage'): void {
  if (typeof window !== 'undefined' && 
      window.performance && 
      'memory' in window.performance) {
    const memory = (window.performance as any).memory;
    
    console.log(`${label}:`, {
      totalJSHeapSize: `${(memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)} MB`,
      usedJSHeapSize: `${(memory.usedJSHeapSize / (1024 * 1024)).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)} MB`,
    });
  }
}