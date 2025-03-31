import { EventType, EventData } from './EventTypes';

// Tipo para los manejadores de eventos
type EventHandler<T = any> = (data: T) => void;

// Opciones para la suscripción a eventos
interface SubscriptionOptions {
  // Si es true, la suscripción se elimina después de la primera ejecución
  once?: boolean;
  // Prioridad del manejador (mayor número = mayor prioridad)
  priority?: number;
}

// Interfaz para desuscribirse de eventos
export interface Disposable {
  dispose: () => void;
}

/**
 * Bus de eventos optimizado para sostenibilidad
 * Implementa patrones para minimizar el impacto de eventos frecuentes
 */
export class EventBus {
  // Almacenamiento de listeners con tipo genérico
  private listeners: Map<EventType, Array<{
    handler: EventHandler;
    options: SubscriptionOptions;
  }>> = new Map();
  
  // Caché de eventos para throttling/debouncing
  private eventThrottleCache: Map<EventType, {
    timer: NodeJS.Timeout | null;
    lastEmitted: number;
    pendingData: any | null;
  }> = new Map();
  
  // Eventos de alto rendimiento que no deberían pasar por optimizaciones
  private highPriorityEvents: Set<EventType> = new Set();
  
  // Configuración por defecto de throttling
  private defaultThrottleTime = 100; // ms
  
  /**
   * Constructor que acepta eventos de alta prioridad
   */
  constructor(highPriorityEvents: EventType[] = []) {
    // Registra eventos que deben procesarse inmediatamente
    this.highPriorityEvents = new Set(highPriorityEvents);
  }
  
  /**
   * Suscribe un manejador a un evento específico
   */
  public on<T extends EventType>(
    eventType: T,
    handler: EventHandler<EventData[T]>,
    options: SubscriptionOptions = {}
  ): Disposable {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    const handlers = this.listeners.get(eventType)!;
    const entry = { handler, options };
    
    handlers.push(entry);
    
    // Ordena por prioridad si es necesario
    if (options.priority) {
      handlers.sort((a, b) => 
        (b.options.priority || 0) - (a.options.priority || 0)
      );
    }
    
    // Retorna un objeto disposable para cancelar la suscripción
    return {
      dispose: () => {
        const index = handlers.indexOf(entry);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Suscribe un manejador que se ejecuta solo una vez
   */
  public once<T extends EventType>(
    eventType: T,
    handler: EventHandler<EventData[T]>,
    options: Omit<SubscriptionOptions, 'once'> = {}
  ): Disposable {
    return this.on(eventType, handler, { ...options, once: true });
  }
  
  /**
   * Emite un evento con sus datos asociados
   * Implementa optimizaciones para reducir impacto en rendimiento
   */
  public emit<T extends EventType>(
    eventType: T,
    data?: EventData[T]
  ): void {
    // Si no hay escuchadores, no hace nada
    if (!this.listeners.has(eventType)) return;
    
    const handlers = this.listeners.get(eventType)!;
    
    // Si es un evento de alta prioridad o de UI, ejecútalo inmediatamente
    if (this.highPriorityEvents.has(eventType) || eventType.startsWith('ui:')) {
      this.executeHandlers(eventType, handlers, data);
      return;
    }
    
    // Para otros eventos, usa throttling para reducir frecuencia
    this.throttleEvent(eventType, data);
  }
  
  /**
   * Emite un evento con throttling para reducir frecuencia
   * Útil para eventos que se disparan muchas veces en poco tiempo
   * (como actualización de métricas o cambios de contenido)
   */
  private throttleEvent<T extends EventType>(
    eventType: T,
    data?: EventData[T],
    throttleTime = this.defaultThrottleTime
  ): void {
    if (!this.eventThrottleCache.has(eventType)) {
      this.eventThrottleCache.set(eventType, {
        timer: null,
        lastEmitted: 0,
        pendingData: null
      });
    }
    
    const cache = this.eventThrottleCache.get(eventType)!;
    const now = Date.now();
    
    // Guarda los datos más recientes
    cache.pendingData = data;
    
    // Si hay un timer activo, no hace nada más
    if (cache.timer) return;
    
    // Si ha pasado suficiente tiempo desde la última emisión, emite inmediatamente
    if (now - cache.lastEmitted > throttleTime) {
      this.executeThrottledEvent(eventType);
      return;
    }
    
    // De lo contrario, programa para emisión futura
    cache.timer = setTimeout(() => {
      this.executeThrottledEvent(eventType);
    }, throttleTime - (now - cache.lastEmitted));
  }
  
  /**
   * Ejecuta un evento throttled con sus últimos datos
   */
  private executeThrottledEvent<T extends EventType>(eventType: T): void {
    const cache = this.eventThrottleCache.get(eventType)!;
    const handlers = this.listeners.get(eventType)!;
    
    // Limpia el temporizador y actualiza timestamp
    if (cache.timer) {
      clearTimeout(cache.timer);
      cache.timer = null;
    }
    
    cache.lastEmitted = Date.now();
    
    // Ejecuta los handlers con los datos más recientes
    this.executeHandlers(eventType, handlers, cache.pendingData);
    
    // Limpia datos pendientes
    cache.pendingData = null;
  }
  
  /**
   * Ejecuta los manejadores de un evento
   */
  private executeHandlers<T extends EventType>(
    eventType: T,
    handlers: Array<{
      handler: EventHandler;
      options: SubscriptionOptions;
    }>,
    data?: any
  ): void {
    // Copia la lista de handlers para evitar problemas si se modifican durante la ejecución
    const handlersToExecute = [...handlers];
    
    // Handlers que se ejecutarán una sola vez
    const oncesIndexes: number[] = [];
    
    // Ejecuta los handlers
    handlersToExecute.forEach((entry, index) => {
      try {
        entry.handler(data);
        
        // Registra si este handler es de una sola vez
        if (entry.options.once) {
          oncesIndexes.push(index);
        }
      } catch (error) {
        console.error(`Error executing event handler for ${eventType}:`, error);
      }
    });
    
    // Elimina los handlers de una sola vez, en orden inverso para no afectar índices
    if (oncesIndexes.length > 0) {
      for (let i = oncesIndexes.length - 1; i >= 0; i--) {
        const indexToRemove = oncesIndexes[i];
        const handlerToRemove = handlersToExecute[indexToRemove];
        
        const originalIndex = handlers.indexOf(handlerToRemove);
        if (originalIndex !== -1) {
          handlers.splice(originalIndex, 1);
        }
      }
    }
  }
  
  /**
   * Elimina todos los manejadores de un evento específico
   */
  public off(eventType: EventType): void {
    this.listeners.delete(eventType);
  }
  
  /**
   * Elimina todos los manejadores de todos los eventos
   */
  public clear(): void {
    this.listeners.clear();
  }
  
  /**
   * Configura un evento como de alta prioridad (sin throttling)
   */
  public setHighPriority(eventType: EventType): void {
    this.highPriorityEvents.add(eventType);
  }
  
  /**
   * Elimina un evento de la lista de alta prioridad
   */
  public clearHighPriority(eventType: EventType): void {
    this.highPriorityEvents.delete(eventType);
  }
  
  /**
   * Configura el tiempo de throttling predeterminado
   */
  public setDefaultThrottleTime(timeMs: number): void {
    this.defaultThrottleTime = timeMs;
  }
}

// Exporta singleton para uso en toda la aplicación
export const eventBus = new EventBus();