# Storage Service

## Descripci�n General

El Storage Service es el componente central de Picura MD que gestiona todas las operaciones de persistencia y almacenamiento. Proporciona una capa de abstracci�n entre el sistema de archivos local, bases de datos y potencialmente servicios remotos, optimizada para eficiencia, sostenibilidad y seguridad de datos.

## Prop�sito y Responsabilidades

El Storage Service cumple las siguientes funciones principales:

1. **Persistencia de Documentos**: Almacenamiento eficiente y confiable de contenido Markdown
2. **Gesti�n de Metadatos**: Almacenamiento estructurado de informaci�n asociada a documentos
3. **Caching Estrat�gico**: Optimizaci�n de acceso a datos frecuentes
4. **Gesti�n de Recursos**: Administraci�n eficiente de archivos relacionados (im�genes, adjuntos)
5. **Operaciones de Backup**: Respaldo seguro y restauraci�n de datos
6. **Compresi�n y Deduplicaci�n**: Minimizaci�n de espacio utilizado con t�cnicas optimizadas
7. **Aislamiento de Almacenamiento**: Abstracci�n para independizar aplicaci�n de mecanismos espec�ficos

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

**Responsabilidad**: Gesti�n de interacciones con el sistema de archivos local.

**Componentes Clave**:
- **DocumentStore**: Almacenamiento y recuperaci�n de documentos Markdown
- **AssetManager**: Gesti�n de recursos relacionados (im�genes, archivos adjuntos)
- **PathResolver**: Resoluci�n y manipulaci�n de rutas de archivos
- **WatcherService**: Detecci�n de cambios externos en el sistema de archivos

**Caracter�sticas Sostenibles**:
- Operaciones I/O agrupadas para minimizar accesos a disco
- Escritura diferida con estrategias inteligentes de flush
- Limitaci�n de eventos de vigilancia seg�n actividad
- Lectura predictiva basada en patrones de acceso

#### Database Manager

**Responsabilidad**: Gesti�n de datos estructurados mediante base de datos local.

**Componentes Clave**:
- **MetadataStore**: Almacenamiento de metadatos de documentos
- **ConfigStore**: Persistencia de configuraciones y preferencias
- **IndexStore**: Almacenamiento de �ndices para b�squeda
- **QueryProcessor**: Procesamiento eficiente de consultas

**Caracter�sticas Sostenibles**:
- Esquemas optimizados para minimizar espacio
- �ndices selectivos seg�n patrones de acceso
- Agrupaci�n de transacciones para eficiencia
- Compresi�n transparente de datos

#### Cache Manager

**Responsabilidad**: Optimizaci�n del acceso a datos mediante diferentes niveles de cach�.

**Componentes Clave**:
- **MemoryCache**: Cach� en memoria para acceso ultrarr�pido
- **PersistentCache**: Cach� persistente en disco para datos frecuentes
- **CachePolicy**: Estrategias adaptativas de caching
- **InvalidationPolicy**: Pol�ticas inteligentes de invalidaci�n

**Caracter�sticas Sostenibles**:
- Ajuste din�mico de tama�o seg�n disponibilidad de memoria
- Priorizaci�n de contenido seg�n frecuencia y costo de regeneraci�n
- Pol�ticas de expiraci�n adaptativas seg�n tipo de contenido
- Compresi�n en memoria para datos poco accedidos

#### Storage Optimizer

**Responsabilidad**: Maximizar eficiencia de almacenamiento mediante t�cnicas de optimizaci�n.

**Componentes Clave**:
- **CompressionEngine**: Motor adaptativo de compresi�n
- **Deduplicator**: Identificaci�n y eliminaci�n de redundancias
- **SpaceAnalyzer**: An�lisis de uso de espacio y oportunidades de optimizaci�n
- **RetentionManager**: Gesti�n del ciclo de vida de datos seg�n pol�ticas

**Caracter�sticas Sostenibles**:
- Compresi�n adaptativa seg�n tipo de contenido y disponibilidad de CPU
- Deduplicaci�n incremental durante operaciones de bajo uso
- An�lisis peri�dico programado en momentos de inactividad
- Pol�ticas de retenci�n basadas en relevancia y frecuencia de acceso

## Interfaces y Dependencias

### Interfaces Externas

| Interfaz | Tipo | Descripci�n |
|----------|------|-------------|
| `IStorageService` | P�blica | API principal para operaciones de almacenamiento |
| `IDocumentStorage` | P�blica | Operaciones espec�ficas para documentos |
| `IMetadataStorage` | P�blica | Operaciones para metadatos y configuraci�n |
| `IAssetStorage` | P�blica | Gesti�n de recursos relacionados |
| `ICacheControl` | P�blica | Control expl�cito de comportamiento de cach� |
| `IStorageMetrics` | P�blica | Informaci�n sobre uso y rendimiento |
| `IStorageOptimizer` | P�blica | Operaciones expl�citas de optimizaci�n |
| `IBackupManager` | P�blica | Operaciones de respaldo y restauraci�n |

### API P�blica Principal

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
  
  // Gesti�n de assets
  saveAsset(data: AssetData): Promise<string>;
  getAsset(id: string): Promise<AssetContent>;
  linkAsset(assetId: string, documentId: string): Promise<void>;
  
  // Control de cach�
  invalidateCache(target: CacheTarget): Promise<void>;
  primeCache(items: CacheItem[]): Promise<void>;
  getCacheStats(): CacheStatistics;
  
  // Optimizaci�n
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

| Componente | Prop�sito | Interacci�n |
|------------|-----------|-------------|
| Document Core Service | Cliente principal | Solicitudes de almacenamiento/recuperaci�n |
| Search Service | Indexaci�n | Acceso a contenido para indexaci�n |
| Sync Service | Sincronizaci�n | Operaciones de sincronizaci�n con servicios externos |
| Sustainability Monitor | Monitoreo de recursos | Reporte de m�tricas, recepci�n de directivas |

## Flujos de Trabajo Principales

### Almacenamiento de Documento

1. Se recibe solicitud de almacenamiento con contenido y metadatos
2. Storage Optimizer analiza contenido para compresi�n �ptima
3. Metadatos se procesan para almacenamiento estructurado en Database Manager
4. Contenido se comprime seg�n estrategia seleccionada
5. File System Manager almacena contenido con operaciones optimizadas
6. Cache Manager actualiza entradas relevantes
7. Se notifica �xito y devuelve identificador

### Recuperaci�n de Documento

1. Se recibe solicitud de recuperaci�n con identificador
2. Cache Manager verifica disponibilidad en cach�
3. Si existe en cach� v�lida, se devuelve inmediatamente
4. Si no, File System Manager localiza y recupera contenido
5. Storage Optimizer descomprime si es necesario
6. Database Manager recupera metadatos asociados
7. Se actualiza cach� con contenido recuperado
8. Se devuelve documento completo con metadatos

### Optimizaci�n de Almacenamiento

1. Se inicia tarea de optimizaci�n (manual o programada)
2. SpaceAnalyzer identifica �reas de oportunidad
3. CompressionEngine recomprime contenido con configuraci�n actual
4. Deduplicator identifica y consolida redundancias
5. RetentionManager aplica pol�ticas de retenci�n
6. Se actualiza Database Manager con nuevas referencias
7. Se reportan m�tricas de mejora y espacio recuperado

## Estrategias de Sostenibilidad

### Optimizaci�n de I/O

1. **Operaciones Agrupadas**
   - Escrituras por lotes para minimizar operaciones de disco
   - Lectura anticipativa para contenido probable
   - Actualizaci�n diferida para cambios frecuentes

2. **Acceso Inteligente**
   - Carga parcial de documentos grandes
   - Estrategias de prefetch basadas en patrones
   - Priorizaci�n de I/O seg�n contexto de usuario

3. **Minimizaci�n de Actividad de Disco**
   - Planificaci�n de operaciones en bloques
   - Retraso adaptativo de operaciones no cr�ticas
   - Coordinaci�n con otros servicios para distribuci�n de carga

### Compresi�n Adaptativa

| Tipo de Contenido | Algoritmo Preferido | Nivel de Compresi�n | Justificaci�n |
|-------------------|---------------------|---------------------|---------------|
| Texto Markdown | zlib | 6-9 (adaptativo) | Balance CPU/compresi�n, excelente para texto |
| Im�genes sin p�rdida | PNG optimizado | Adaptativo | Mantenimiento de calidad con tama�o reducido |
| Im�genes con p�rdida permitida | WebP | 75-90% calidad | Excelente reducci�n con calidad aceptable |
| Metadatos | LZ4 | R�pido | Acceso frecuente requiere descompresi�n r�pida |
| Datos binarios | zstd | 3-19 (adaptativo) | Excelente ratio general, CPU eficiente |

### Estrategias de Deduplicaci�n

1. **Deduplicaci�n de Bloques**
   - Identificaci�n de fragmentos comunes entre documentos
   - Almacenamiento de referencias en lugar de duplicados
   - Granularidad adaptativa seg�n tipo de contenido

2. **Deduplicaci�n de Recursos**
   - Detecci�n de im�genes y archivos adjuntos id�nticos
   - Normalizaci�n de formatos para mejorar coincidencias
   - Referencias m�ltiples a recursos �nicos

3. **An�lisis de Similitud**
   - Detecci�n de contenido altamente similar pero no id�ntico
   - Sugerencias de consolidaci�n para usuarios
   - Optimizaci�n de almacenamiento diferencial

### Pol�ticas de Cach�

| Nivel | Ubicaci�n | Estrategia | Finalidad |
|-------|-----------|------------|-----------|
| L1 | Memoria RAM | LRU con ajuste din�mico | Acceso ultrarr�pido a documentos activos |
| L2 | Memoria comprimida | LFU con aging | Extender cach� efectiva sin impacto excesivo en RAM |
| L3 | Disco SSD/r�pido | Algoritmo ARC | Balance entre recencia y frecuencia para disco |
| L4 | Representaciones | FIFO con TTL | Vistas renderizadas y transformaciones costosas |

### M�tricas de Sostenibilidad

El Storage Service expone las siguientes m�tricas al Sustainability Monitor:

- Operaciones de I/O por segundo (clasificadas por tipo)
- Ratio de compresi�n efectiva por tipo de contenido
- Espacio ahorrado por deduplicaci�n
- Efectividad de cach� (hit ratio, eviction rate)
- Latencia promedio por tipo de operaci�n

## Adaptaci�n a Recursos

### Modos de Operaci�n

| Modo | Activaci�n | Adaptaciones |
|------|------------|--------------|
| **Est�ndar** | Condiciones normales | Balance entre rendimiento y eficiencia |
| **Ahorro** | Bater�a baja, espacio limitado | Mayor compresi�n, cach� reducida, I/O m�nimo |
| **Rendimiento** | Conectado a energ�a, recursos abundantes | Cach� expansiva, prefetch agresivo, compresi�n ligera |
| **Viaje** | Modo fuera de l�nea | Priorizaci�n de contenido esencial, compresi�n m�xima |

### Detecci�n de Recursos

- Monitoreo de estado de bater�a y fuente de energ�a
- An�lisis de espacio disponible en almacenamiento
- Evaluaci�n de memoria disponible para cach�s
- Detecci�n de tipo de almacenamiento (SSD vs. HDD)

### Estrategias Adaptativas

- Ajuste din�mico de niveles de compresi�n seg�n CPU disponible
- Escalado de cach� seg�n memoria disponible
- Modificaci�n de patrones de I/O seg�n tipo de almacenamiento
- Reprogramaci�n de tareas de optimizaci�n seg�n recursos

## Seguridad de Datos

### Protecci�n de Datos

1. **Integridad**
   - Checksums para verificaci�n de contenido
   - Transacciones at�micas para operaciones cr�ticas
   - Journaling para recuperaci�n ante interrupciones

2. **Aislamiento**
   - Separaci�n estricta entre datos de usuario y sistema
   - Permisos m�nimos necesarios en sistema de archivos
   - Verificaci�n de l�mites en todas las operaciones

3. **Cifrado**
   - Cifrado transparente para contenido sensible (opt-in)
   - Securizaci�n de metadatos cr�ticos
   - Soporte para cifrado a nivel de sistema de archivos

### Backup y Recuperaci�n

1. **Estrategias de Backup**
   - Copias de seguridad incrementales autom�ticas
   - Respaldos completos programados
   - Exportaci�n segura para almacenamiento externo

2. **Mecanismos de Recuperaci�n**
   - Recuperaci�n granular a nivel de documento
   - Restauraci�n completa de bibliotecas
   - Importaci�n verificada desde fuentes externas

3. **Protecci�n contra Corrupci�n**
   - Detecci�n temprana de inconsistencias
   - Copias de seguridad rotativas
   - Verificaci�n peri�dica de integridad

## Configuraciones y Tunables

### Par�metros Configurables

| Par�metro | Prop�sito | Valores Recomendados |
|-----------|-----------|----------------------|
| `compressionLevel` | Control de nivel de compresi�n | Auto (default), 1-9, o espec�ficos por tipo |
| `cacheSize` | Tama�o total de cach� en memoria | 5-20% de RAM disponible |
| `persistentCacheSize` | Tama�o de cach� en disco | 100MB-1GB seg�n disponibilidad |
| `ioScheduling` | Estrategia de programaci�n I/O | Adaptive (default), Performance, Efficiency |
| `deduplicationMode` | Nivel de deduplicaci�n | Basic, Enhanced, Aggressive |
| `optimizationSchedule` | Cu�ndo ejecutar optimizaciones | Idle, Daily, Weekly, Manual |
| `backupFrequency` | Frecuencia de respaldos autom�ticos | Daily, Weekly, Monthly, Manual |

### Configuraci�n Avanzada

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

- Divisi�n autom�tica en fragmentos gestionables
- Carga y modificaci�n parcial eficiente
- Metadatos especiales para navegaci�n eficiente
- Compresi�n por bloques para acceso aleatorio

### Contenido Mixto Rico

- Gesti�n optimizada de documentos con m�ltiples recursos
- Estrategias de carga diferida para contenido embebido
- Procesamiento paralelo de activos relacionados
- Vinculaci�n eficiente con minimizaci�n de redundancia

### Operaci�n en Dispositivos Limitados

- Detecci�n de capacidades de dispositivo
- Escalado din�mico de funcionalidades
- Priorizaci�n estricta para recursos cr�ticos
- Modos degradados con funcionalidad esencial

## Mecanismos de Extensibilidad

### Sistemas de Almacenamiento Alternativos

El Storage Service permite adaptadores personalizados para:

1. **Sistemas de Archivos Alternativos**
   - Integraci�n con almacenamiento en nube (mediante Sync Service)
   - Sistemas de archivos distribuidos
   - Soluciones personalizadas de almacenamiento

2. **Bases de Datos Alternativas**
   - Opciones NoSQL para metadatos especializados
   - Bases de datos relacionales externas
   - Sistemas de almacenamiento de objetos

### API de Extensi�n

```typescript
interface StorageAdapter {
  id: string;
  name: string;
  capabilities: StorageCapability[];
  
  // Operaciones b�sicas
  initialize(config: AdapterConfig): Promise<void>;
  connect(): Promise<ConnectionStatus>;
  disconnect(): Promise<void>;
  
  // Implementaci�n de almacenamiento
  read(location: ResourceLocation): Promise<ResourceContent>;
  write(location: ResourceLocation, content: ResourceContent): Promise<void>;
  delete(location: ResourceLocation): Promise<boolean>;
  list(path: string, options?: ListOptions): Promise<ResourceInfo[]>;
  
  // Metadatos y estado
  getMetrics(): AdapterMetrics;
  getSupportedFeatures(): Feature[];
  
  // Hooks para optimizaci�n
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

- Carga de documento peque�o (<50KB): <50ms
- Carga de documento mediano (50KB-1MB): <200ms
- Guardado de documento: <100ms para confirmaci�n
- B�squeda en metadatos: <50ms para resultados iniciales
- Operaciones por segundo sostenibles: >100 para uso t�pico

### Optimizaciones de Rendimiento

1. **Paralelizaci�n Selectiva**
   - Operaciones I/O no bloqueantes
   - Procesamiento concurrente donde beneficia
   - Coordinaci�n para evitar contenci�n

2. **Minimizaci�n de Serializaci�n**
   - Formatos binarios eficientes para almacenamiento interno
   - Transferencia de buffer directa cuando es posible
   - Conversiones diferidas a formatos de presentaci�n

3. **Locality of Reference**
   - Agrupaci�n de datos relacionados en almacenamiento
   - Predicci�n de acceso para prefetch eficiente
   - Minimizaci�n de saltos en patr�n de acceso a disco

### L�mites y Escalabilidad

| Dimensi�n | L�mite Pr�ctico | Estrategia de Escalado |
|-----------|-----------------|------------------------|
| Tama�o de documento | 100MB | Fragmentaci�n autom�tica |
| Documentos totales | 100,000+ | Indexaci�n jer�rquica, carga bajo demanda |
| Operaciones concurrentes | 50+ | Pool de workers, priorizaci�n |
| Almacenamiento total | Limitado por dispositivo | Pol�ticas de retenci�n, sugerencias de limpieza |

## Monitoreo y Diagn�stico

### Logging y Telemetr�a

- Registro detallado de operaciones cr�ticas (opt-in)
- M�tricas de rendimiento y utilizaci�n
- Detecci�n y registro de anomal�as
- Rotaci�n eficiente de logs para minimizar impacto

### Herramientas de Diagn�stico

- Verificaci�n de integridad de almacenamiento
- An�lisis de fragmentaci�n y oportunidades de optimizaci�n
- Estad�sticas detalladas de uso de cach�
- Pruebas de rendimiento integradas

## Pruebas y Calidad

### Estrategia de Testing

1. **Tests Unitarios**
   - Verificaci�n de algoritmos de compresi�n y deduplicaci�n
   - Pruebas de pol�ticas de cach�
   - Simulaci�n de condiciones de recursos variables

2. **Tests de Integraci�n**
   - Flujos completos con otros componentes
   - Operaciones concurrentes y bajo carga
   - Interacci�n con sistema de archivos real

3. **Tests de Rendimiento**
   - Benchmarks de operaciones cr�ticas
   - Mediciones de consumo de recursos
   - Simulaci�n de condiciones de dispositivo variadas

4. **Tests de Resiliencia**
   - Recuperaci�n ante interrupciones
   - Comportamiento con almacenamiento corrupto
   - Manejo de condiciones de espacio limitado

## Evoluci�n Futura

### Roadmap de Caracter�sticas

1. **Almacenamiento Predictivo**
   - Anticipaci�n inteligente de necesidades de usuario
   - Precarga y preoptimizaci�n basada en comportamiento
   - Gesti�n din�mica basada en patrones detectados

2. **Federaci�n de Almacenamiento**
   - Integraci�n transparente con m�ltiples ubicaciones
   - Migraci�n autom�tica seg�n uso y disponibilidad
   - Vista unificada de contenido distribuido

3. **Optimizaci�n Colaborativa**
   - Deduplicaci�n entre usuarios (con privacidad)
   - Compartici�n eficiente de recursos comunes
   - Optimizaciones espec�ficas para equipos

4. **An�lisis Avanzado de Espacio**
   - Visualizaciones intuitivas de uso de almacenamiento
   - Recomendaciones espec�ficas para optimizaci�n
   - Predicci�n de necesidades futuras

### Investigaci�n en Desarrollo

- Algoritmos de compresi�n adaptativa de pr�xima generaci�n
- T�cnicas avanzadas de deduplicaci�n sem�ntica
- Integraci�n con sistemas de archivos espec�ficos para sostenibilidad
- Modelos predictivos para comportamiento de almacenamiento

## Referencias

### Documentos Relacionados
- [Diagrama de Componentes](../architecture/component-diagram.md)
- [Flujo de Datos](../architecture/data-flow.md)
- [Document Core Service](document-core-service.md)
- [Sustainability Design](../architecture/sustainability-design.md)

### Est�ndares y Especificaciones
- SQLite Database File Format
- Efficient compression algorithms (zlib, zstd, LZ4)
- File system best practices
- Green Storage Principles (Green Software Foundation)