# Diagrama de Componentes de Picura MD

Este documento detalla la arquitectura modular de Picura MD, describiendo cada componente, sus responsabilidades y las interacciones entre ellos.

## Diagrama General

```
+-----------------------------------------------------------------------+
|                                                                       |
|                     APLICACIÓN PICURA MD (ELECTRON)                   |
|                                                                       |
+-----------------------------------------------------------------------+
                |                                 |
                v                                 v
+-------------------------------+    +-------------------------------+
|                               |    |                               |
|    INTERFAZ DE USUARIO        |    |    SERVICIOS CORE             |
|                               |    |                               |
| +-------------------------+   |    | +-------------------------+   |
| |                         |   |    | |                         |   |
| |   Editor Module         |   |    | |   Document Core Service |   |
| |   (Editor + Toolbar)    |<--|----|-|   (Gestión documentos)  |   |
| |                         |   |    | |                         |   |
| +-------------------------+   |    | +-------------------------+   |
|                               |    |             ^                 |
| +-------------------------+   |    |             |                 |
| |                         |   |    | +-------------------------+   |
| |   Viewer Module         |<--|----|-|   Storage Service       |   |
| |   (Renderizado MD)      |   |    | |   (Persistencia local)  |   |
| |                         |   |    | |                         |   |
| +-------------------------+   |    | +-------------------------+   |
|                               |    |             ^                 |
| +-------------------------+   |    |             |                 |
| |                         |   |    | +-------------------------+   |
| |   Navigation Module     |<--|----|-|   Search Service        |   |
| |   (Explorer + Search UI)|   |    | |   (Indexación, búsqueda)|   |
| |                         |   |    | |                         |   |
| +-------------------------+   |    | +-------------------------+   |
|                               |    |                               |
+-------------------------------+    +-------------------------------+
                |                                 |
                v                                 v
+-------------------------------+    +-------------------------------+
|                               |    |                               |
|    SERVICIOS AUXILIARES       |    |    SERVICIOS DE INTEGRACIÓN   |
|                               |    |                               |
| +-------------------------+   |    | +-------------------------+   |
| |                         |   |    | |                         |   |
| |   AI Assistant          |   |    | |   Sync Service          |   |
| |   (Asistencia contexto) |   |    | |   (Sincronización)      |   |
| |                         |   |    | |                         |   |
| +-------------------------+   |    | +-------------------------+   |
|                               |    |             ^                 |
| +-------------------------+   |    |             |                 |
| |                         |   |    | +-------------------------+   |
| |   Sustainability Monitor|   |    | |   Version Control       |   |
| |   (Métricas, optimiz.)  |   |    | |   Service (Git)         |   |
| |                         |   |    | |                         |   |
| +-------------------------+   |    | +-------------------------+   |
|                               |    |                               |
+-------------------------------+    +-------------------------------+
           |    |    |                          |    |
           v    v    v                          v    v
    +----------------+    +----------------------------------------+
    |                |    |                                        |
    | Sistema Local  |    | Servicios Remotos                      |
    | (Archivos, OS) |    | (GitHub, GitLab, Servicios Cloud)      |
    |                |    |                                        |
    +----------------+    +----------------------------------------+
```

## Descripción de Componentes

### Interfaz de Usuario

#### Editor Module
**Responsabilidad principal**: Proporcionar interfaz para creación y edición de documentos Markdown.

**Subcomponentes**:
- **Editor Core**: Motor de edición de texto con soporte Markdown
- **Toolbar**: Controles y formateadores contextuales
- **Status Bar**: Información de documento y métricas
- **Command Palette**: Acceso rápido a funcionalidades

**Interfaces**:
- Se comunica con Document Core Service para operaciones CRUD
- Utiliza AI Assistant para sugerencias contextuales
- Obtiene métricas del Sustainability Monitor

**Características de sostenibilidad**:
- Renderizado eficiente con actualización selectiva
- Reducción de procesamiento en modo de bajo consumo
- Optimización de recursos según tipo de dispositivo

#### Viewer Module
**Responsabilidad principal**: Renderizar documentos Markdown con alta fidelidad y eficiencia.

**Subcomponentes**:
- **Renderer Engine**: Motor de renderizado Markdown a HTML
- **Preview Controls**: Opciones de visualización (temas, zoom)
- **Export Options**: Funcionalidades para exportación a diferentes formatos

**Interfaces**:
- Recibe contenido del Editor Module o Document Core Service
- Utiliza Storage Service para caching de renderizado

**Características de sostenibilidad**:
- Renderizado incremental para documentos grandes
- Optimización de imágenes durante visualización
- Modos de bajo consumo para dispositivos con batería

#### Navigation Module
**Responsabilidad principal**: Facilitar la navegación y descubrimiento de documentos.

**Subcomponentes**:
- **Explorer**: Visualización jerárquica de documentos
- **Search UI**: Interfaz para búsquedas avanzadas
- **Recent & Favorites**: Acceso rápido a documentos frecuentes

**Interfaces**:
- Utiliza Search Service para operaciones de búsqueda
- Se comunica con Document Core Service para estructura

**Características de sostenibilidad**:
- Carga perezosa de estructura de documentos
- Indexación optimizada para búsquedas frecuentes
- Caching inteligente de resultados de búsqueda

### Servicios Core

#### Document Core Service
**Responsabilidad principal**: Gestión central de documentos y su ciclo de vida.

**Subcomponentes**:
- **Document Manager**: CRUD básico de documentos
- **Metadata Service**: Gestión de metadatos y propiedades
- **Template Engine**: Sistema de plantillas y scaffolding

**Interfaces**:
- Coordina con Storage Service para persistencia
- Provee datos a módulos de UI
- Utiliza Version Control Service para historial

**Características de sostenibilidad**:
- Estrategias de carga diferida para grandes colecciones
- Compresión adaptativa de contenido según contexto
- Minimización de escrituras a disco

#### Storage Service
**Responsabilidad principal**: Persistencia eficiente de documentos y configuraciones.

**Subcomponentes**:
- **File System Adapter**: Interacción optimizada con sistema de archivos
- **SQLite Manager**: Gestión de base de datos local
- **Cache Manager**: Estrategias de caching para rendimiento

**Interfaces**:
- Provee persistencia para Document Core Service
- Gestiona almacenamiento para otros servicios
- Coordina con Sync Service para sincronización

**Características de sostenibilidad**:
- Escritura en lotes para minimizar operaciones I/O
- Deduplicación de contenido donde sea aplicable
- Compresión selectiva según tipo de contenido

#### Search Service
**Responsabilidad principal**: Indexación y búsqueda eficiente de documentos.

**Subcomponentes**:
- **Indexer**: Motor de indexación incremental
- **Query Engine**: Procesamiento de consultas complejas
- **Relevance Ranking**: Algoritmos de clasificación de resultados

**Interfaces**:
- Utiliza Storage Service para persistencia de índices
- Provee resultados a Navigation Module
- Recibe actualizaciones de Document Core Service

**Características de sostenibilidad**:
- Indexación incremental y en segundo plano
- Compresión de índices para eficiencia de almacenamiento
- Optimización de búsquedas según patrones de uso

### Servicios Auxiliares

#### AI Assistant
**Responsabilidad principal**: Proporcionar asistencia contextual inteligente.

**Subcomponentes**:
- **Local Language Model**: Procesamiento lingüístico local
- **Suggestion Engine**: Generación de sugerencias contextuales
- **Format Assistant**: Ayuda con formateado y estructura

**Interfaces**:
- Se integra con Editor Module para sugerencias
- Utiliza Document Core Service para contexto
- Se coordina con Sustainability Monitor para eficiencia

**Características de sostenibilidad**:
- Priorización de procesamiento local vs. remoto
- Ajuste de complejidad según recursos disponibles
- Aprendizaje de patrones locales para reducir procesamiento

**Implementación técnica**:
- Modelos de lenguaje cuantizados para eficiencia
- Sistema de reglas locales para operaciones básicas
- API unificada para modelos locales y remotos
- Mecanismos de caché para resultados frecuentes

#### Sustainability Monitor
**Responsabilidad principal**: Monitoreo y optimización de recursos utilizados.

**Subcomponentes**:
- **Resource Tracker**: Monitoreo de CPU, RAM, I/O, red
- **Optimization Advisor**: Sugerencias de optimización
- **Metrics Dashboard**: Visualización de métricas de sostenibilidad

**Interfaces**:
- Monitorea todos los componentes del sistema
- Proporciona métricas a la interfaz de usuario
- Ajusta configuraciones para optimizar rendimiento

**Características de sostenibilidad**:
- Overhead mínimo de monitoreo
- Análisis predictivo para anticipar consumo de recursos
- Aprendizaje de patrones de uso para optimización proactiva

**Implementación técnica**:
- Sistema de muestreo adaptativo según carga
- Algoritmos eficientes de detección de anomalías
- Motor de políticas para ajustes automáticos
- Visualización de métricas con mínimo impacto visual

### Servicios de Integración

#### Sync Service
**Responsabilidad principal**: Sincronización eficiente con repositorios remotos.

**Subcomponentes**:
- **Sync Manager**: Gestión de operaciones de sincronización
- **Conflict Resolver**: Resolución de conflictos
- **Transfer Optimizer**: Optimización de transferencia de datos

**Interfaces**:
- Coordina con Storage Service para datos locales
- Utiliza Version Control Service para operaciones Git
- Se comunica con servicios remotos (GitHub, GitLab)

**Características de sostenibilidad**:
- Transferencia diferencial minimizando datos enviados
- Sincronización en momentos de baja carga
- Compresión adaptativa según tipo de conexión

**Implementación técnica**:
- Algoritmos de diff optimizados para documentos Markdown
- Protocolos de sincronización con reinicio
- Sistema de priorización basado en relevancia de documentos
- Mecanismos de throttling según condiciones de red

#### Version Control Service
**Responsabilidad principal**: Gestión de historial y versiones de documentos.

**Subcomponentes**:
- **Git Core**: Operaciones básicas de Git
- **History Manager**: Visualización y navegación de historial
- **Branch Manager**: Gestión de ramas y flujos de trabajo

**Interfaces**:
- Provee control de versiones a Document Core Service
- Coordina con Sync Service para operaciones remotas
- Almacena datos a través de Storage Service

**Características de sostenibilidad**:
- Optimización de almacenamiento de deltas
- Políticas de compresión y limpieza de historial
- Clonado parcial para repositorios grandes

**Implementación técnica**:
- Interfaz abstracta sobre Git usando Isomorphic-Git
- Estrategias de commit automático configurable
- Visualización eficiente de diferencias
- Operaciones asíncronas para operaciones pesadas

## Patrones de Comunicación

### Comunicación Interna

Los componentes de Picura MD se comunican principalmente a través de:

1. **Event Bus**: Sistema de publicación-suscripción para comunicación desacoplada
2. **Service Interfaces**: APIs bien definidas para comunicación directa
3. **Shared State**: Estado compartido controlado para datos comunes

Este enfoque asegura:
- Bajo acoplamiento entre componentes
- Extensibilidad para nuevas funcionalidades
- Testabilidad de componentes individuales

#### Implementación del Event Bus

```typescript
// Ejemplo simplificado del Event Bus
class EventBus {
  private listeners: Map<string, Function[]> = new Map();
  
  // Suscripción a eventos
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const callbacks = this.listeners.get(event)!;
    callbacks.push(callback);
    
    // Retorna función para cancelar suscripción
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  // Emisión de eventos con throttling incorporado
  emit(event: string, data: any): void {
    if (!this.listeners.has(event)) return;
    
    // Ejecución eficiente de callbacks
    const callbacks = this.listeners.get(event)!;
    
    // Uso de requestAnimationFrame para UI events
    // o ejecución directa para eventos de sistema
    if (event.startsWith('ui:')) {
      requestAnimationFrame(() => {
        callbacks.forEach(callback => callback(data));
      });
    } else {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// Uso del bus para comunicar componentes
const documentUpdated = (docId, changes) => {
  eventBus.emit('document:updated', { docId, changes });
};

// Optimización de eventos frecuentes
const throttledEmit = throttle((event, data) => {
  eventBus.emit(event, data);
}, 100);
```

### Flujos de Trabajo Principales

#### Flujo de Edición de Documento
1. Usuario interactúa con Editor Module
2. Editor Module notifica cambios a Document Core Service
3. Document Core Service coordina con Storage Service para persistencia
4. AI Assistant proporciona sugerencias contextuales
5. Sustainability Monitor ajusta configuraciones según recursos

**Diagrama de secuencia simplificado**:
```
Usuario    Editor    DocumentCore    StorageService    AIAssistant
   |         |             |               |               |
   |--edita->|             |               |               |
   |         |--notifica-->|               |               |
   |         |             |--persiste---->|               |
   |         |<---actualiza estado---------|               |
   |         |-------------solicita sugerencias----------->|
   |         |<------------devuelve sugerencias------------|
   |<-muestra|             |               |               |
```

#### Flujo de Sincronización
1. Usuario inicia sincronización desde UI
2. Sync Service determina cambios con Version Control Service
3. Se optimizan paquetes de datos para transferencia
4. Se gestionan conflictos con estrategias predefinidas
5. Se actualizan metadatos en Document Core Service

**Diagrama de secuencia simplificado**:
```
Usuario    SyncUI    SyncService    VersionControl    RemoteService
   |         |            |               |                |
   |--inicia->|           |               |                |
   |         |--solicita->|               |                |
   |         |            |--obtiene----->|                |
   |         |            |<-cambios------|                |
   |         |            |--optimiza     |                |
   |         |            |--envía-------------------->|
   |         |            |<-reconcilia----------------|
   |         |<-notifica--|               |                |
   |<-confirma|           |               |                |
```

## Extensibilidad

La arquitectura está diseñada para extensibilidad mediante:

1. **Plugin System**: Puntos de extensión definidos para funcionalidades de terceros
2. **Middleware Pipelines**: Procesamiento extensible para transformaciones de datos
3. **Adapter Pattern**: Interfaces para integración con servicios externos

### Sistema de Plugins

El sistema de plugins permite extender diferentes aspectos de Picura MD:

```typescript
// Interfaz base para plugins
interface Plugin {
  id: string;
  name: string;
  version: string;
  activate(context: PluginContext): Promise<void>;
  deactivate(): Promise<void>;
}

// Contexto proporcionado a los plugins
interface PluginContext {
  // APIs extensibles
  registerCommand(id: string, handler: CommandHandler): Disposable;
  registerDocumentTransformer(transformer: DocumentTransformer): Disposable;
  registerUiComponent(location: UiLocation, component: Component): Disposable;
  registerExporter(format: string, exporter: Exporter): Disposable;
  
  // Acceso a servicios internos (limitado)
  services: {
    documentService: DocumentServiceApi;
    storageService: StorageServiceApi;
    // APIs limitadas y seguras para otros servicios
  }
}
```

Ejemplos de puntos de extensión:

1. **Exportadores personalizados**: Nuevos formatos de exportación
2. **Transformadores de documento**: Procesamiento especializado de contenido
3. **Componentes de UI**: Widgets en ubicaciones predefinidas
4. **Comandos**: Nuevas acciones disponibles en Command Palette

### Gestión de Recursos para Plugins

Para mantener la sostenibilidad con plugins de terceros:

1. **Sandbox de recursos**: Limitación de CPU/memoria para cada plugin
2. **Monitoreo de rendimiento**: Detección de plugins ineficientes
3. **Carga bajo demanda**: Activación sólo cuando se requiere
4. **Permisos granulares**: Control explícito sobre capacidades

## Consideraciones Futuras

Esta arquitectura establece las bases para futuras expansiones:

1. **Colaboración en Tiempo Real**: Estructura para integrar CRDT y operaciones distribuidas
   - Modelo de consistencia eventual
   - Sincronización P2P eficiente
   - Resolución de conflictos automática

2. **IA Avanzada**: Puntos de integración para capacidades más sofisticadas
   - Modelos híbridos local/remoto
   - Asistencia predictiva
   - Análisis semántico de documentos

3. **Análisis Documental**: Extensión del Search Service para análisis semántico
   - Extracción automática de conceptos
   - Recomendaciones basadas en contenido
   - Clustering inteligente de documentos

4. **Federación de Documentos**: Integración con sistemas de documentación distribuidos
   - Protocolos de descubrimiento
   - Sincronización parcial entre sistemas
   - Políticas de compartición configurables

## Especificación de Interfaces Clave

### Document Core Service API

```typescript
interface DocumentService {
  // Operaciones básicas
  getDocument(id: string): Promise<Document>;
  createDocument(template?: string): Promise<Document>;
  updateDocument(id: string, changes: DocumentChanges): Promise<void>;
  deleteDocument(id: string): Promise<void>;
  
  // Gestión de colecciones
  getDocumentsInFolder(folderId: string): Promise<Document[]>;
  moveDocument(id: string, targetFolderId: string): Promise<void>;
  
  // Metadatos
  updateMetadata(id: string, metadata: Metadata): Promise<void>;
  getMetadata(id: string): Promise<Metadata>;
  
  // Eventos
  onDocumentChanged(handler: (doc: Document) => void): Disposable;
  onMetadataChanged(handler: (id: string, metadata: Metadata) => void): Disposable;
}
```

### Storage Service API

```typescript
interface StorageService {
  // Operaciones de bajo nivel
  read(path: string): Promise<Buffer>;
  write(path: string, data: Buffer): Promise<void>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  
  // Operaciones de base de datos
  query<T>(collection: string, filter: object): Promise<T[]>;
  insert<T>(collection: string, document: T): Promise<string>;
  update<T>(collection: string, id: string, changes: Partial<T>): Promise<void>;
  
  // Caché
  getCached<T>(key: string): Promise<T | null>;
  setCached<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidateCache(pattern?: string): Promise<void>;
}
```

## Referencias

- Documentos relacionados:
  - [High-Level Overview](high-level-overview.md)
  - [Technology Stack](technology-stack.md)
  - [Data Flow](data-flow.md)
  - [Componentes Individuales](../components/)

- Estándares aplicados:
  - ISO/IEC/IEEE 42010:2011 (Arquitectura de Software)
  - The C4 Model para visualización de arquitectura
  - Principios de Arquitectura Sostenible (Green Software Foundation)