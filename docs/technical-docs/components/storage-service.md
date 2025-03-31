# Storage Service

## Descripción General

El Storage Service es el componente central de Picura MD que gestiona todas las operaciones de persistencia y almacenamiento. Proporciona una capa de abstracción entre el sistema de archivos local, bases de datos y potencialmente servicios remotos, optimizada para eficiencia, sostenibilidad y seguridad de datos.

## Propósito y Responsabilidades

El Storage Service cumple las siguientes funciones principales:

1. **Persistencia de Documentos**: Almacenamiento eficiente y confiable de contenido Markdown
2. **Gestión de Metadatos**: Almacenamiento estructurado de información asociada a documentos
3. **Caching Estratégico**: Optimización de acceso a datos frecuentes
4. **Gestión de Recursos**: Administración eficiente de archivos relacionados (imágenes, adjuntos)
5. **Operaciones de Backup**: Respaldo seguro y restauración de datos
6. **Compresión y Deduplicación**: Minimización de espacio utilizado con técnicas optimizadas
7. **Aislamiento de Almacenamiento**: Abstracción para independizar aplicación de mecanismos específicos

## Arquitectura Interna

### Diagrama de Componentes

```
+------------------------------------------------------------------+
|                                                                  |
|                        STORAGE SERVICE                           |
|                                                                  |
| +------------------------+       +-------------------------+     |
| |                        |       |                         |     |
| |  File System Manager   |       |  Database Manager       |     |
| |  - DocumentStore       |       |  - MetadataStore        |     |
| |  - AssetManager        |<----->|  - ConfigStore          |     |
| |  - PathResolver        |       |  - IndexStore           |     |
| |  - WatcherService      |       |  - QueryProcessor       |     |
| |                        |       |                         |     |
| +------------------------+       +-------------------------+     |
|            ^                                 ^                   |
|            |                                 |                   |
|            v                                 v                   |
| +------------------------+       +-------------------------+     |
| |                        |       |                         |     |
| |  Cache Manager         |       |  Storage Optimizer      |     |
| |  - MemoryCache         |       |  - CompressionEngine    |     |
| |  - PersistentCache     |<----->|  - Deduplicator         |     |
| |  - CachePolicy         |       |  - SpaceAnalyzer        |     |
| |  - InvalidationPolicy  |       |  - RetentionManager     |     |
| |                        |       |                         |     |
| +------------------------+       +-------------------------+     |
|                                                                  |
+------------------------------------------------------------------+
                |                                |
                v                                v
    +-------------------------+    +---------------------------+
    |                         |    |                           |
    | Local System            |    | Other Services            |
    | - File System           |    | - Sync Service            |
    | - SQLite                |    | - Document Core Service   |
    | - OS Storage APIs       |    | - Search Service          |
    |                         |    | - Sustainability Monitor  |
    +-------------------------+    +---------------------------+
```

### Subcomponentes

#### File System Manager

**Responsabilidad**: Gestión de interacciones con el sistema de archivos local.

**Componentes Clave**:
- **DocumentStore**: Almacenamiento y recuperación de documentos Markdown
- **AssetManager**: Gestión de recursos relacionados (imágenes, archivos adjuntos)
- **PathResolver**: Resolución y manipulación de rutas de archivos
- **WatcherService**: Detección de cambios externos en el sistema de archivos

**Características Sostenibles**:
- Operaciones I/O agrupadas para minimizar accesos a disco
- Escritura diferida con estrategias inteligentes de flush
- Limitación de eventos de vigilancia según actividad
- Lectura predictiva basada en patrones de acceso

#### Database Manager

**Responsabilidad**: Gestión de datos estructurados mediante base de datos local.

**Componentes Clave**:
- **MetadataStore**: Almacenamiento de metadatos de documentos
- **ConfigStore**: Persistencia de configuraciones y preferencias
- **IndexStore**: Almacenamiento de índices para búsqueda
- **QueryProcessor**: Procesamiento eficiente de consultas

**Características Sostenibles**:
- Esquemas optimizados para minimizar espacio
- Índices selectivos según patrones de acceso
- Agrupación de transacciones para eficiencia
- Compresión transparente de datos

#### Cache Manager

**Responsabilidad**: Optimización del acceso a datos mediante diferentes niveles de caché.

**Componentes Clave**:
- **MemoryCache**: Caché en memoria para acceso ultrarrápido
- **PersistentCache**: Caché persistente en disco para datos frecuentes
- **CachePolicy**: Estrategias adaptativas de caching
- **InvalidationPolicy**: Políticas inteligentes de invalidación

**Características Sostenibles**:
- Ajuste dinámico de tamaño según disponibilidad de memoria
- Priorización de contenido según frecuencia y costo de regeneración
- Políticas de expiración adaptativas según tipo de contenido
- Compresión en memoria para datos poco accedidos

#### Storage Optimizer

**Responsabilidad**: Maximizar eficiencia de almacenamiento mediante técnicas de optimización.

**Componentes Clave**:
- **CompressionEngine**: Motor adaptativo de compresión
- **Deduplicator**: Identificación y eliminación de redundancias
- **SpaceAnalyzer**: Análisis de uso de espacio y oportunidades de optimización
- **RetentionManager**: Gestión del ciclo de vida de datos según políticas

**Características Sostenibles**:
- Compresión adaptativa según tipo de contenido y disponibilidad de CPU
- Deduplicación incremental durante operaciones de bajo uso
- Análisis periódico programado en momentos de inactividad
- Políticas de retención basadas en relevancia y frecuencia de acceso

## Interfaces y Dependencias

### Interfaces Externas

| Interfaz | Tipo | Descripción |
|----------|------|-------------|
| `IStorageService` | Pública | API principal para operaciones de almacenamiento |
| `IDocumentStorage` | Pública | Operaciones específicas para documentos |
| `IMetadataStorage` | Pública | Operaciones para metadatos y configuración |
| `IAssetStorage` | Pública | Gestión de recursos relacionados |
| `ICacheControl` | Pública | Control explícito de comportamiento de caché |
| `IStorageMetrics` | Pública | Información sobre uso y rendimiento |
| `IStorageOptimizer` | Pública | Operaciones explícitas de optimización |
| `IBackupManager` | Pública | Operaciones de respaldo y restauración |

### API Pública Principal

```typescript
interface IStorageService {
  // Operaciones de documentos
  getDocument(id: string): Promise<DocumentContent>;
  saveDocument(document: DocumentData): Promise<string>;
  updateDocument(id: string, changes: DocumentChanges): Promise<void>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Operaciones de metadatos
  getMetadata(id: string): Promise<Metadata>;
  updateMetadata(id: string, metadata: Partial<Metadata>): Promise<Metadata>;
  queryMetadata(query: MetadataQuery): Promise<MetadataQueryResult>;
  
  // Gestión de assets
  saveAsset(data: AssetData): Promise<string>;
  getAsset(id: string): Promise<AssetContent>;
  linkAsset(assetId: string, documentId: string): Promise<void>;
  
  // Control de caché
  invalidateCache(target: CacheTarget): Promise<void>;
  primeCache(items: CacheItem[]): Promise<void>;
  getCacheStats(): CacheStatistics;
  
  // Optimización
  runOptimization(type: OptimizationType): Promise<OptimizationResult>;
  getStorageMetrics(): StorageMetrics;
  
  // Backup
  createBackup(options?: BackupOptions): Promise<BackupInfo>;
  restoreBackup(backupId: string): Promise<RestoreResult>;
  
  // Eventos
  on(event: StorageEvent, handler: EventHandler): Unsubscribe;
}
```

### Dependencias

| Componente | Propósito | Interacción |
|------------|-----------|-------------|
| Document Core Service | Cliente principal | Solicitudes de almacenamiento/recuperación |
| Search Service | Indexación | Acceso a contenido para indexación |
| Sync Service | Sincronización | Operaciones de sincronización con servicios externos |
| Sustainability Monitor | Monitoreo de recursos | Reporte de métricas, recepción de directivas |

## Flujos de Trabajo Principales

### Almacenamiento de Documento

1. Se recibe solicitud de almacenamiento con contenido y metadatos
2. Storage Optimizer analiza contenido para compresión óptima
3. Metadatos se procesan para almacenamiento estructurado en Database Manager
4. Contenido se comprime según estrategia seleccionada
5. File System Manager almacena contenido con operaciones optimizadas
6. Cache Manager actualiza entradas relevantes
7. Se notifica éxito y devuelve identificador

### Recuperación de Documento

1. Se recibe solicitud de recuperación con identificador
2. Cache Manager verifica disponibilidad en caché
3. Si existe en caché válida, se devuelve inmediatamente
4. Si no, File System Manager localiza y recupera contenido
5. Storage Optimizer descomprime si es necesario
6. Database Manager recupera metadatos asociados
7. Se actualiza caché con contenido recuperado
8. Se devuelve documento completo con metadatos

### Optimización de Almacenamiento

1. Se inicia tarea de optimización (manual o programada)
2. SpaceAnalyzer identifica áreas de oportunidad
3. CompressionEngine recomprime contenido con configuración actual
4. Deduplicator identifica y consolida redundancias
5. RetentionManager aplica políticas de retención
6. Se actualiza Database Manager con nuevas referencias
7. Se reportan métricas de mejora y espacio recuperado

## Estrategias de Sostenibilidad

### Optimización de I/O

1. **Operaciones Agrupadas**
   - Escrituras por lotes para minimizar operaciones de disco
   - Lectura anticipativa para contenido probable
   - Actualización diferida para cambios frecuentes

2. **Acceso Inteligente**
   - Carga parcial de documentos grandes
   - Estrategias de prefetch basadas en patrones
   - Priorización de I/O según contexto de usuario

3. **Minimización de Actividad de Disco**
   - Planificación de operaciones en bloques
   - Retraso adaptativo de operaciones no críticas
   - Coordinación con otros servicios para distribución de carga

### Compresión Adaptativa

| Tipo de Contenido | Algoritmo Preferido | Nivel de Compresión | Justificación |
|-------------------|---------------------|---------------------|---------------|
| Texto Markdown | zlib | 6-9 (adaptativo) | Balance CPU/compresión, excelente para texto |
| Imágenes sin pérdida | PNG optimizado | Adaptativo | Mantenimiento de calidad con tamaño reducido |
| Imágenes con pérdida permitida | WebP | 75-90% calidad | Excelente reducción con calidad aceptable |
| Metadatos | LZ4 | Rápido | Acceso frecuente requiere descompresión rápida |
| Datos binarios | zstd | 3-19 (adaptativo) | Excelente ratio general, CPU eficiente |

### Estrategias de Deduplicación

1. **Deduplicación de Bloques**
   - Identificación de fragmentos comunes entre documentos
   - Almacenamiento de referencias en lugar de duplicados
   - Granularidad adaptativa según tipo de contenido

2. **Deduplicación de Recursos**
   - Detección de imágenes y archivos adjuntos idénticos
   - Normalización de formatos para mejorar coincidencias
   - Referencias múltiples a recursos únicos

3. **Análisis de Similitud**
   - Detección de contenido altamente similar pero no idéntico
   - Sugerencias de consolidación para usuarios
   - Optimización de almacenamiento diferencial

### Políticas de Caché

| Nivel | Ubicación | Estrategia | Finalidad |
|-------|-----------|------------|-----------|
| L1 | Memoria RAM | LRU con ajuste dinámico | Acceso ultrarrápido a documentos activos |
| L2 | Memoria comprimida | LFU con aging | Extender caché efectiva sin impacto excesivo en RAM |
| L3 | Disco SSD/rápido | Algoritmo ARC | Balance entre recencia y frecuencia para disco |
| L4 | Representaciones | FIFO con TTL | Vistas renderizadas y transformaciones costosas |

### Métricas de Sostenibilidad

El Storage Service expone las siguientes métricas al Sustainability Monitor:

- Operaciones de I/O por segundo (clasificadas por tipo)
- Ratio de compresión efectiva por tipo de contenido
- Espacio ahorrado por deduplicación
- Efectividad de caché (hit ratio, eviction rate)
- Latencia promedio por tipo de operación

## Adaptación a Recursos

### Modos de Operación

| Modo | Activación | Adaptaciones |
|------|------------|--------------|
| **Estándar** | Condiciones normales | Balance entre rendimiento y eficiencia |
| **Ahorro** | Batería baja, espacio limitado | Mayor compresión, caché reducida, I/O mínimo |
| **Rendimiento** | Conectado a energía, recursos abundantes | Caché expansiva, prefetch agresivo, compresión ligera |
| **Viaje** | Modo fuera de línea | Priorización de contenido esencial, compresión máxima |

### Detección de Recursos

- Monitoreo de estado de batería y fuente de energía
- Análisis de espacio disponible en almacenamiento
- Evaluación de memoria disponible para cachés
- Detección de tipo de almacenamiento (SSD vs. HDD)

### Estrategias Adaptativas

- Ajuste dinámico de niveles de compresión según CPU disponible
- Escalado de caché según memoria disponible
- Modificación de patrones de I/O según tipo de almacenamiento
- Reprogramación de tareas de optimización según recursos

## Seguridad de Datos

### Protección de Datos

1. **Integridad**
   - Checksums para verificación de contenido
   - Transacciones atómicas para operaciones críticas
   - Journaling para recuperación ante interrupciones

2. **Aislamiento**
   - Separación estricta entre datos de usuario y sistema
   - Permisos mínimos necesarios en sistema de archivos
   - Verificación de límites en todas las operaciones

3. **Cifrado**
   - Cifrado transparente para contenido sensible (opt-in)
   - Securización de metadatos críticos
   - Soporte para cifrado a nivel de sistema de archivos

### Backup y Recuperación

1. **Estrategias de Backup**
   - Copias de seguridad incrementales automáticas
   - Respaldos completos programados
   - Exportación segura para almacenamiento externo

2. **Mecanismos de Recuperación**
   - Recuperación granular a nivel de documento
   - Restauración completa de bibliotecas
   - Importación verificada desde fuentes externas

3. **Protección contra Corrupción**
   - Detección temprana de inconsistencias
   - Copias de seguridad rotativas
   - Verificación periódica de integridad

## Configuraciones y Tunables

### Parámetros Configurables

| Parámetro | Propósito | Valores Recomendados |
|-----------|-----------|----------------------|
| `compressionLevel` | Control de nivel de compresión | Auto (default), 1-9, o específicos por tipo |
| `cacheSize` | Tamaño total de caché en memoria | 5-20% de RAM disponible |
| `persistentCacheSize` | Tamaño de caché en disco | 100MB-1GB según disponibilidad |
| `ioScheduling` | Estrategia de programación I/O | Adaptive (default), Performance, Efficiency |
| `deduplicationMode` | Nivel de deduplicación | Basic, Enhanced, Aggressive |
| `optimizationSchedule` | Cuándo ejecutar optimizaciones | Idle, Daily, Weekly, Manual |
| `backupFrequency` | Frecuencia de respaldos automáticos | Daily, Weekly, Monthly, Manual |

### Configuración Avanzada

```json
{
  "storage": {
    "compression": {
      "markdown": {
        "algorithm": "zlib",
        "level": "adaptive",
        "threshold": 1024
      },
      "images": {
        "algorithm": "auto",
        "quality": 85,
        "convertToWebP": true
      }
    },
    "cache": {
      "memory": {
        "maxSizeMB": 256,
        "ttlMinutes": 30,
        "priorityDocuments": ["recent", "pinned"]
      },
      "disk": {
        "maxSizeMB": 512,
        "location": "auto",
        "cleanupThreshold": 0.9
      }
    },
    "optimization": {
      "deduplication": {
        "blockSize": 4096,
        "minBlocksForDedup": 3,
        "similarityThreshold": 0.9
      },
      "schedule": {
        "mode": "smart",
        "idleTimeBeforeRun": "10m",
        "maxRuntime": "5m",
        "batteryMinimum": 30
      }
    }
  }
}
```

## Manejo de Casos Especiales

### Documentos Grandes

- División automática en fragmentos gestionables
- Carga y modificación parcial eficiente
- Metadatos especiales para navegación eficiente
- Compresión por bloques para acceso aleatorio

### Contenido Mixto Rico

- Gestión optimizada de documentos con múltiples recursos
- Estrategias de carga diferida para contenido embebido
- Procesamiento paralelo de activos relacionados
- Vinculación eficiente con minimización de redundancia

### Operación en Dispositivos Limitados

- Detección de capacidades de dispositivo
- Escalado dinámico de funcionalidades
- Priorización estricta para recursos críticos
- Modos degradados con funcionalidad esencial

## Mecanismos de Extensibilidad

### Sistemas de Almacenamiento Alternativos

El Storage Service permite adaptadores personalizados para:

1. **Sistemas de Archivos Alternativos**
   - Integración con almacenamiento en nube (mediante Sync Service)
   - Sistemas de archivos distribuidos
   - Soluciones personalizadas de almacenamiento

2. **Bases de Datos Alternativas**
   - Opciones NoSQL para metadatos especializados
   - Bases de datos relacionales externas
   - Sistemas de almacenamiento de objetos

### API de Extensión

```typescript
interface StorageAdapter {
  id: string;
  name: string;
  capabilities: StorageCapability[];
  
  // Operaciones básicas
  initialize(config: AdapterConfig): Promise<void>;
  connect(): Promise<ConnectionStatus>;
  disconnect(): Promise<void>;
  
  // Implementación de almacenamiento
  read(location: ResourceLocation): Promise<ResourceContent>;
  write(location: ResourceLocation, content: ResourceContent): Promise<void>;
  delete(location: ResourceLocation): Promise<boolean>;
  list(path: string, options?: ListOptions): Promise<ResourceInfo[]>;
  
  // Metadatos y estado
  getMetrics(): AdapterMetrics;
  getSupportedFeatures(): Feature[];
  
  // Hooks para optimización
  onOptimize?(type: OptimizationType): Promise<OptimizationResult>;
  onBackup?(options: BackupOptions): Promise<BackupResult>;
}

// Ejemplo: Registro de adaptador personalizado
storageService.registerAdapter(new CloudStorageAdapter({
  id: 'efficient-cloud-storage',
  region: 'nearest',
  compressionEnabled: true,
  sustainabilityOptimized: true
}));
```

## Rendimiento y Escalabilidad

### Objetivos de Rendimiento

- Carga de documento pequeño (<50KB): <50ms
- Carga de documento mediano (50KB-1MB): <200ms
- Guardado de documento: <100ms para confirmación
- Búsqueda en metadatos: <50ms para resultados iniciales
- Operaciones por segundo sostenibles: >100 para uso típico

### Optimizaciones de Rendimiento

1. **Paralelización Selectiva**
   - Operaciones I/O no bloqueantes
   - Procesamiento concurrente donde beneficia
   - Coordinación para evitar contención

2. **Minimización de Serialización**
   - Formatos binarios eficientes para almacenamiento interno
   - Transferencia de buffer directa cuando es posible
   - Conversiones diferidas a formatos de presentación

3. **Locality of Reference**
   - Agrupación de datos relacionados en almacenamiento
   - Predicción de acceso para prefetch eficiente
   - Minimización de saltos en patrón de acceso a disco

### Límites y Escalabilidad

| Dimensión | Límite Práctico | Estrategia de Escalado |
|-----------|-----------------|------------------------|
| Tamaño de documento | 100MB | Fragmentación automática |
| Documentos totales | 100,000+ | Indexación jerárquica, carga bajo demanda |
| Operaciones concurrentes | 50+ | Pool de workers, priorización |
| Almacenamiento total | Limitado por dispositivo | Políticas de retención, sugerencias de limpieza |

## Monitoreo y Diagnóstico

### Logging y Telemetría

- Registro detallado de operaciones críticas (opt-in)
- Métricas de rendimiento y utilización
- Detección y registro de anomalías
- Rotación eficiente de logs para minimizar impacto

### Herramientas de Diagnóstico

- Verificación de integridad de almacenamiento
- Análisis de fragmentación y oportunidades de optimización
- Estadísticas detalladas de uso de caché
- Pruebas de rendimiento integradas

## Pruebas y Calidad

### Estrategia de Testing

1. **Tests Unitarios**
   - Verificación de algoritmos de compresión y deduplicación
   - Pruebas de políticas de caché
   - Simulación de condiciones de recursos variables

2. **Tests de Integración**
   - Flujos completos con otros componentes
   - Operaciones concurrentes y bajo carga
   - Interacción con sistema de archivos real

3. **Tests de Rendimiento**
   - Benchmarks de operaciones críticas
   - Mediciones de consumo de recursos
   - Simulación de condiciones de dispositivo variadas

4. **Tests de Resiliencia**
   - Recuperación ante interrupciones
   - Comportamiento con almacenamiento corrupto
   - Manejo de condiciones de espacio limitado

## Evolución Futura

### Roadmap de Características

1. **Almacenamiento Predictivo**
   - Anticipación inteligente de necesidades de usuario
   - Precarga y preoptimización basada en comportamiento
   - Gestión dinámica basada en patrones detectados

2. **Federación de Almacenamiento**
   - Integración transparente con múltiples ubicaciones
   - Migración automática según uso y disponibilidad
   - Vista unificada de contenido distribuido

3. **Optimización Colaborativa**
   - Deduplicación entre usuarios (con privacidad)
   - Compartición eficiente de recursos comunes
   - Optimizaciones específicas para equipos

4. **Análisis Avanzado de Espacio**
   - Visualizaciones intuitivas de uso de almacenamiento
   - Recomendaciones específicas para optimización
   - Predicción de necesidades futuras

### Investigación en Desarrollo

- Algoritmos de compresión adaptativa de próxima generación
- Técnicas avanzadas de deduplicación semántica
- Integración con sistemas de archivos específicos para sostenibilidad
- Modelos predictivos para comportamiento de almacenamiento

## Referencias

### Documentos Relacionados
- [Diagrama de Componentes](../architecture/component-diagram.md)
- [Flujo de Datos](../architecture/data-flow.md)
- [Document Core Service](document-core-service.md)
- [Sustainability Design](../architecture/sustainability-design.md)

### Estándares y Especificaciones
- SQLite Database File Format
- Efficient compression algorithms (zlib, zstd, LZ4)
- File system best practices
- Green Storage Principles (Green Software Foundation)