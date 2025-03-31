# Search Service

## Descripción General

El Search Service es el componente de Picura MD responsable de la indexación, búsqueda y descubrimiento de contenido. Proporciona capacidades eficientes de búsqueda a través de documentos y metadatos, optimizadas para rendimiento y sostenibilidad. Este servicio permite a los usuarios encontrar rápidamente información relevante mientras minimiza el consumo de recursos.

## Propósito y Responsabilidades

El Search Service cumple las siguientes funciones principales:

1. **Indexación Eficiente**: Creación y mantenimiento de índices optimizados para contenido Markdown
2. **Búsqueda de Texto Completo**: Localización rápida de contenido en documentos
3. **Búsqueda por Metadatos**: Filtrado y búsqueda basada en metadatos estructurados
4. **Relevancia Contextual**: Clasificación de resultados según relevancia para el usuario
5. **Sugerencias y Correcciones**: Asistencia para consultas con errores o alternativas
6. **Análisis Semántico Básico**: Comprensión de relaciones entre términos y conceptos
7. **Búsqueda Incremental**: Resultados en tiempo real mientras el usuario escribe

## Arquitectura Interna

### Diagrama de Componentes

```
+------------------------------------------------------------------+
|                                                                  |
|                         SEARCH SERVICE                           |
|                                                                  |
| +------------------------+         +------------------------+    |
| |                        |         |                        |    |
| |  Indexer               |         |  Query Engine          |    |
| |  - ContentProcessor    |         |  - QueryParser         |    |
| |  - MetadataExtractor   |<------->|  - SearchExecutor      |    |
| |  - IndexBuilder        |         |  - ResultsProcessor    |    |
| |  - IndexUpdater        |         |  - SuggestionGenerator |    |
| |                        |         |                        |    |
| +------------------------+         +------------------------+    |
|            ^                                   ^                 |
|            |                                   |                 |
|            v                                   v                 |
| +------------------------+         +------------------------+    |
| |                        |         |                        |    |
| |  Index Manager         |         |  Analytics Engine      |    |
| |  - IndexStorage        |         |  - UsageAnalyzer       |    |
| |  - OptimizationEngine  |<------->|  - RelevanceTrainer    |    |
| |  - FragmentManager     |         |  - PatternDetector     |    |
| |  - ConsistencyChecker  |         |  - PerformanceMonitor  |    |
| |                        |         |                        |    |
| +------------------------+         +------------------------+    |
|                                                                  |
+------------------------------------------------------------------+
                |                                |
                v                                v
    +------------------------+     +------------------------+
    |                        |     |                        |
    | Storage Service        |     | Other Services         |
    | - Index Persistence    |     | - Document Core        |
    | - Data Retrieval       |     | - AI Assistant         |
    |                        |     | - Sustainability       |
    |                        |     |   Monitor              |
    +------------------------+     +------------------------+
```

### Subcomponentes

#### Indexer

**Responsabilidad**: Procesar documentos y metadatos para construir y mantener índices eficientes.

**Componentes Clave**:
- **ContentProcessor**: Análisis y tokenización de texto Markdown
- **MetadataExtractor**: Extracción de metadatos relevantes para búsqueda
- **IndexBuilder**: Construcción de estructuras de índice optimizadas
- **IndexUpdater**: Actualización incremental de índices existentes

**Características Sostenibles**:
- Indexación diferida e incremental para minimizar procesamiento
- Procesamiento adaptativo según relevancia y frecuencia de acceso
- Filtrado de contenido no significativo para reducir tamaño de índice
- Priorización basada en patrones de usuario

#### Query Engine

**Responsabilidad**: Procesamiento de consultas y generación de resultados relevantes.

**Componentes Clave**:
- **QueryParser**: Análisis sintáctico y semántico de consultas
- **SearchExecutor**: Ejecución eficiente de búsquedas en índices
- **ResultsProcessor**: Filtrado, clasificación y formateo de resultados
- **SuggestionGenerator**: Generación de sugerencias y autocorrección

**Características Sostenibles**:
- Ejecución estratificada para resultados rápidos prioritarios
- Cancelación temprana para consultas superadas
- Reutilización de resultados parciales
- Clasificación progresiva con refinamiento incremental

#### Index Manager

**Responsabilidad**: Gestión del ciclo de vida de los índices y optimización de su almacenamiento.

**Componentes Clave**:
- **IndexStorage**: Persistencia eficiente de estructuras de índice
- **OptimizationEngine**: Compactación y optimización periódica
- **FragmentManager**: Gestión de fragmentación de índices grandes
- **ConsistencyChecker**: Verificación y reparación de integridad

**Características Sostenibles**:
- Compresión adaptativa de índices según acceso
- Estratificación para balance entre velocidad y tamaño
- Purga selectiva de términos con bajo valor de búsqueda
- Reconstrucción parcial para minimizar operaciones

#### Analytics Engine

**Responsabilidad**: Análisis de patrones de búsqueda para mejorar relevancia y rendimiento.

**Componentes Clave**:
- **UsageAnalyzer**: Análisis de patrones de consulta de usuarios
- **RelevanceTrainer**: Mejora continua de algoritmos de relevancia
- **PatternDetector**: Identificación de patrones y relaciones
- **PerformanceMonitor**: Monitoreo y optimización de rendimiento

**Características Sostenibles**:
- Análisis en background durante periodos de baja carga
- Almacenamiento compacto de datos de análisis
- Entrenamiento incremental de modelos de relevancia
- Adaptación dinámica a recursos disponibles

## Tipos de Índices y Estructuras

### Índices Principales

| Tipo de Índice | Propósito | Características |
|----------------|-----------|----------------|
| **Índice de Texto Completo** | Búsqueda en contenido de documentos | Invertido, posicional, con skiplist |
| **Índice de Metadatos** | Búsqueda por atributos estructurados | B-Tree para valores discretos, R-Tree para rangos |
| **Índice de Etiquetas** | Búsqueda por etiquetas y categorías | Hash con referencias cruzadas |
| **Índice de Entidades** | Búsqueda de entidades nombradas | Grafos compactos con relaciones |
| **Índice de Similitud** | Búsqueda de contenido similar | LSH (Locality-Sensitive Hashing) |

### Optimizaciones Estructurales

1. **Compresión de Diccionario**
   - Codificación eficiente de términos frecuentes
   - Compresión de prefijos para términos relacionados
   - Mapeo de términos a identificadores compactos

2. **Listas de Postings Optimizadas**
   - Codificación delta para posiciones
   - Compresión variable según frecuencia
   - Estructura en bloques para búsqueda eficiente

3. **Índices Fragmentados**
   - División estratégica para documentos grandes
   - Indexación parcial de secciones menos relevantes
   - Carga bajo demanda para fragmentos específicos

## Interfaces y Dependencias

### Interfaces Externas

| Interfaz | Tipo | Descripción |
|----------|------|-------------|
| `ISearchService` | Pública | API principal para búsquedas |
| `IQueryBuilder` | Pública | Construcción programática de consultas |
| `ISearchResults` | Pública | Acceso a resultados paginados |
| `IIndexAdmin` | Pública | Administración de índices |
| `ISearchInsights` | Pública | Análisis y estadísticas de búsqueda |
| `IIndexObserver` | Interna | Notificaciones de cambios en documentos |
| `IStoragePersistence` | Interna | Persistencia de índices |

### API Pública Principal

```typescript
interface ISearchService {
  // Búsqueda básica
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  searchByMetadata(criteria: MetadataCriteria): Promise<SearchResults>;
  typeahead(partialQuery: string, limit?: number): Promise<string[]>;
  
  // Búsqueda avanzada
  buildQuery(): QueryBuilder;
  executeQuery(query: QueryDefinition): Promise<SearchResults>;
  suggest(query: string): Promise<SearchSuggestion[]>;
  
  // Administración de índices
  getIndexStatus(): Promise<IndexStatus>;
  optimizeIndex(options?: OptimizationOptions): Promise<OptimizationResult>;
  rebuildIndex(scope?: IndexScope): Promise<RebuildResult>;
  
  // Eventos y configuración
  on(event: SearchEvent, handler: EventHandler): Unsubscribe;
  configure(config: Partial<SearchConfig>): void;
}

interface SearchResults {
  items: SearchResultItem[];
  total: number;
  hasMore: boolean;
  timeTaken: number;
  facets?: Record<string, FacetValue[]>;
  
  // Navegación de resultados
  next(): Promise<SearchResults>;
  getPage(page: number): Promise<SearchResults>;
  
  // Insights
  getSearchInfo(): SearchMetrics;
}

interface QueryBuilder {
  text(query: string): QueryBuilder;
  metadata(field: string, value: any): QueryBuilder;
  tags(tags: string[]): QueryBuilder;
  dateRange(field: string, start?: Date, end?: Date): QueryBuilder;
  sort(field: string, direction?: SortDirection): QueryBuilder;
  limit(count: number, offset?: number): QueryBuilder;
  facets(fields: string[]): QueryBuilder;
  build(): QueryDefinition;
}
```

### Dependencias

| Componente | Propósito | Interacción |
|------------|-----------|-------------|
| Document Core Service | Fuente de documentos | Notificaciones de cambios, acceso a contenido |
| Storage Service | Persistencia | Almacenamiento de índices |
| AI Assistant | Análisis semántico | Mejora de consultas, sugerencias contextuales |
| Sustainability Monitor | Monitoreo de recursos | Reporte de uso, adaptación a disponibilidad |

## Flujos de Trabajo Principales

### Indexación de Documento

1. Document Core Service notifica creación o actualización
2. Indexer recibe notificación con metadata del cambio
3. ContentProcessor obtiene y analiza contenido según prioridad
4. Se tokeniza y normaliza texto, extrayendo términos significativos
5. Se actualiza índice de forma incremental (solo partes modificadas)
6. Se extraen y procesan metadatos para índices secundarios
7. IndexManager persiste cambios en Storage Service
8. Se notifica actualización a componentes interesados

### Ejecución de Búsqueda

1. Usuario ingresa consulta a través de UI
2. QueryParser analiza y normaliza términos de búsqueda
3. Se identifican operadores especiales y estructura de consulta
4. SearchExecutor planifica estrategia óptima de ejecución
5. Se recuperan resultados preliminares con alta relevancia
6. ResultsProcessor filtra, clasifica y agrupa resultados
7. Se devuelven primeros resultados a UI para respuesta rápida
8. En paralelo, se refinan resultados y clasificación
9. Se actualizan resultados incrementalmente si es necesario

### Optimización de Índice

1. Tarea programada o solicitud explícita de optimización
2. IndexManager evalúa estado actual y fragmentación
3. OptimizationEngine planifica estrategia según recursos disponibles
4. Se realiza compactación, eliminando entradas obsoletas
5. Se rebalancean estructuras para acceso eficiente
6. ConsistencyChecker verifica integridad del resultado
7. Se actualizan referencias y se libera espacio no utilizado
8. Se reportan métricas de mejora y estado actualizado

## Estrategias de Sostenibilidad

### Indexación Eficiente

1. **Indexación Incremental**
   - Procesamiento limitado a contenido modificado
   - Detección inteligente de impacto de cambios
   - Reutilización máxima de estructuras existentes

2. **Indexación Selectiva**
   - Análisis de relevancia para determinar profundidad
   - Exclusión configurable de contenido menos útil
   - Indexación parcial de documentos extensos

3. **Indexación Programada**
   - Priorización basada en patrones de acceso
   - Procesamiento durante periodos de baja actividad
   - Agrupación de operaciones para eficiencia

### Optimización de Consultas

1. **Ejecución Estratificada**
   - Recuperación inicial rápida de resultados más relevantes
   - Refinamiento progresivo según necesidad
   - Cancelación temprana cuando sea apropiado

2. **Caching Inteligente**
   - Almacenamiento de resultados frecuentes
   - Reutilización parcial para consultas similares
   - Invalidación selectiva ante cambios

3. **Optimización de Planes**
   - Análisis de costo para seleccionar estrategia óptima
   - Reordenamiento de operaciones para minimizar trabajo
   - Paralelización selectiva según disponibilidad

### Gestión de Recursos

| Escenario | Adaptaciones |
|-----------|--------------|
| **Batería Baja** | Indexación diferida, búsquedas simplificadas, caché agresivo |
| **Almacenamiento Limitado** | Mayor compresión, purga selectiva, índices parciales |
| **CPU Limitada** | Algoritmos más simples, resultados aproximados, paralelismo reducido |
| **Prioridad Usuario** | Recursos concentrados en consultas interactivas, background reducido |

### Métricas de Sostenibilidad

- Tiempo de CPU por documento indexado
- Tamaño de índice vs. contenido original
- Costo energético estimado por consulta
- Eficiencia de caché y tasa de reutilización
- Impacto de optimizaciones en consumo de recursos

## Capacidades de Búsqueda

### Tipos de Búsqueda Soportados

| Tipo | Descripción | Optimizaciones |
|------|-------------|----------------|
| **Texto Libre** | Búsqueda general en contenido | Términos relevantes priorizados, stemming |
| **Frase Exacta** | Coincidencia exacta de secuencia | Índices posicionales, skiplist |
| **Booleana** | Combinaciones con AND, OR, NOT | Ejecución con corto-circuito, optimización de orden |
| **Por Campos** | Búsqueda en metadatos específicos | Índices especializados por campo |
| **Por Etiquetas** | Búsqueda basada en etiquetas | Estructuras hash optimizadas |
| **Rango Numérico** | Valores dentro de rangos | Índices de rango, búsqueda binaria |
| **Fecha/Temporal** | Periodos y puntos temporales | Índices temporales optimizados |
| **Proximidad** | Términos cercanos entre sí | Ventanas deslizantes, distancia adaptativa |
| **Similitud** | Contenido conceptualmente similar | LSH, embeddings compactos |

### Funcionalidades Avanzadas

1. **Auto-completado**
   - Sugerencias mientras el usuario escribe
   - Priorización basada en popularidad y contexto
   - Corrección ortográfica integrada

2. **Corrección y Sugerencias**
   - Detección y corrección de errores tipográficos
   - Sugerencias de términos alternativos
   - Expansión semántica limitada

3. **Facetas y Filtros**
   - Agrupación dinámica por atributos relevantes
   - Refinamiento progresivo de resultados
   - Estadísticas de distribución

4. **Historial y Contexto**
   - Consideración de búsquedas anteriores
   - Adaptación a preferencias observadas
   - Personalización sutil de relevancia

## Relevancia y Clasificación

### Algoritmo de Relevancia

El Search Service utiliza un algoritmo de clasificación adaptativo que considera:

1. **Factores de Documento**
   - Frecuencia de términos (TF)
   - Rareza de términos en colección (IDF)
   - Proximidad entre términos de búsqueda
   - Posición en documento (título > primeros párrafos > resto)
   - Estructura y énfasis (encabezados, negritas, etc.)

2. **Factores de Usuario**
   - Historial de interacciones con documentos
   - Documentos recientemente accedidos
   - Preferencias implícitas observadas
   - Contexto de trabajo actual

3. **Factores Contextuales**
   - Actualidad del contenido
   - Relacionamiento con otros documentos
   - Popularidad general
   - Completitud y calidad percibida

### Personalización de Relevancia

- Adaptación gradual basada en selecciones previas
- Reordenamiento sutil sin cambios drásticos
- Transparencia sobre factores de clasificación
- Control de usuario sobre nivel de personalización

## Configuraciones y Adaptabilidad

### Parámetros Configurables

| Parámetro | Propósito | Valores Recomendados |
|-----------|-----------|----------------------|
| `indexingDepth` | Profundidad de análisis | Standard, Deep, Minimal |
| `searchPrecision` | Balance precisión/rendimiento | High, Balanced, Performance |
| `stemmingStrength` | Nivel de normalización lingüística | None, Light, Standard, Aggressive |
| `stopWordsHandling` | Tratamiento de palabras comunes | Include, Exclude, Smart |
| `indexingPriority` | Prioridad para recursos de sistema | Low, Normal, High |
| `cacheSize` | Tamaño de caché de resultados | 10-50MB según disponibilidad |
| `backgroundIndexing` | Cuándo realizar indexación | Auto, Idle, Manual, Scheduled |

### Adaptación Contextual

El Search Service ajusta su comportamiento según:

1. **Estado del Dispositivo**
   - Modo de energía (conectado vs. batería)
   - Recursos disponibles (CPU, memoria)
   - Actividad del usuario (activo vs. idle)

2. **Patrones de Uso**
   - Frecuencia y complejidad de búsquedas
   - Distribución de tamaños de documento
   - Tipos de consulta predominantes

3. **Requisitos de Precisión**
   - Consultas exploratorias vs. específicas
   - Tolerancia a falsos positivos
   - Necesidad de resultados completos

## Diagnóstico y Monitoreo

### Métricas Clave

| Métrica | Descripción | Uso |
|---------|-------------|-----|
| Tamaño de índice | Espacio utilizado por índices | Monitoreo de recursos, optimización |
| Tiempo de indexación | Tiempo promedio para procesar documento | Rendimiento, planificación |
| Latencia de búsqueda | Tiempo hasta primeros resultados | Experiencia de usuario, optimización |
| Hit ratio de caché | Porcentaje de consultas servidas desde caché | Eficiencia, ajuste de caché |
| Consultas por segundo | Volumen de búsquedas procesadas | Capacidad, planificación |
| Términos más buscados | Lista de términos frecuentes | Optimización, insights |

### Herramientas de Diagnóstico

1. **Analizador de Consultas**
   - Visualización de plan de ejecución
   - Estadísticas de términos y frecuencia
   - Identificación de cuellos de botella

2. **Estadísticas de Índice**
   - Distribución de términos
   - Grado de fragmentación
   - Oportunidades de optimización

3. **Monitor de Rendimiento**
   - Seguimiento de latencia por tipo de consulta
   - Consumo de recursos detallado
   - Alertas para degradación de rendimiento

## Extensibilidad

### Puntos de Extensión

1. **Analizadores Personalizados**
   - Procesamiento especializado para tipos específicos de contenido
   - Tokenizadores específicos de dominio
   - Filtros de normalización personalizados

2. **Motores de Relevancia**
   - Algoritmos alternativos de clasificación
   - Factores personalizados para dominios específicos
   - Adaptaciones para casos de uso particulares

3. **Proveedores de Índice**
   - Integración con motores de búsqueda externos
   - Estructuras de índice especializadas
   - Estrategias alternativas de almacenamiento

### Ejemplo de Extensión

```typescript
// Analizador personalizado para terminología técnica
searchService.registerAnalyzer({
  name: "technical-docs",
  tokenize: (text) => {
    // Reconocimiento de patrones técnicos especiales
    return tokenizeTechnicalContent(text, {
      recognizeCodeBlocks: true,
      preserveCamelCase: true,
      handleSpecialSymbols: true
    });
  },
  filter: (tokens) => {
    // Normalización específica para documentación técnica
    return [
      ...normalizeTechnicalTerms(tokens),
      ...expandAcronyms(tokens, technicalDictionary)
    ];
  },
  // Perfil de sostenibilidad para el analizador
  sustainabilityProfile: {
    complexity: "medium",
    adaptiveExecution: true,
    resourceIntensiveSteps: ["acronym-expansion"]
  }
});
```

## Integración con AI Assistant

### Mejoras Basadas en IA

1. **Expansión Semántica**
   - Inclusión limitada de términos relacionados
   - Detección de intención de búsqueda
   - Corrección contextual de consultas

2. **Clasificación Mejorada**
   - Factores semánticos para relevancia
   - Comprensión básica de contenido
   - Agrupación por similitud conceptual

3. **Sugerencias Inteligentes**
   - Reformulaciones que mejoran resultados
   - Términos alternativos con mayor precisión
   - Corrección avanzada basada en contexto

### Sostenibilidad en Funciones de IA

- Procesamiento local para funciones básicas
- Uso selectivo de modelos ligeros
- Invocación opcional de capacidades avanzadas
- Degradación elegante sin componentes de IA

## Seguridad y Privacidad

### Consideraciones de Seguridad

1. **Protección de Índices**
   - Validación de consultas para prevenir ataques
   - Limitación de recursos por consulta
   - Protección contra enumeración

2. **Control de Acceso**
   - Filtrado de resultados según permisos
   - Indexación con respeto a permisos
   - Aislamiento entre espacios de usuario

3. **Datos Sensibles**
   - Opciones para excluir contenido sensible de índices
   - Tokenización segura de información crítica
   - Eliminación segura cuando sea solicitado

### Privacidad de Búsqueda

- Almacenamiento mínimo de historiales
- Anonimización de patrones de búsqueda
- Transparencia sobre datos utilizados
- Control de usuario sobre recolección

## Pruebas y Calidad

### Estrategia de Testing

1. **Tests Unitarios**
   - Precisión de tokenización y análisis
   - Correctitud de algoritmos de búsqueda
   - Comportamiento ante casos límite

2. **Tests de Integración**
   - Flujos completos de indexación y búsqueda
   - Interacción con otros componentes
   - Persistencia y recuperación de índices

3. **Tests de Rendimiento**
   - Benchmarks con corpus de prueba
   - Escalabilidad con volúmenes crecientes
   - Eficiencia de recursos bajo carga

4. **Tests de Sostenibilidad**
   - Impacto en batería y recursos
   - Adaptabilidad a recursos limitados
   - Medición de huella energética

### Corpus de Prueba

El Search Service incluye un corpus de prueba para verificar:
- Precisión en diferentes tipos de consulta
- Rendimiento con diferentes volúmenes
- Comportamiento con contenido diverso
- Adaptabilidad a diferentes idiomas

## Evolución Futura

### Roadmap de Características

1. **Búsqueda Semántica Avanzada**
   - Comprensión mejorada de significado
   - Búsqueda por conceptos y entidades
   - Relaciones semánticas entre documentos

2. **Optimización Predictiva**
   - Anticipación de necesidades de búsqueda
   - Pre-indexación inteligente
   - Caching predictivo de resultados

3. **Personalización Adaptativa**
   - Perfiles de usuario implícitos
   - Adaptación contextual a tareas
   - Relevancia personalizada transparente

4. **Búsqueda Federada**
   - Integración con fuentes externas
   - Unificación de resultados heterogéneos
   - Estrategias óptimas por fuente

### Investigación en Desarrollo

- Índices vectoriales ultracompactos para similitud
- Estrategias de indexación progresiva para grandes volúmenes
- Compresión semántica de contenido
- Búsqueda multimodal eficiente (texto, elementos visuales)

## Referencias

### Documentos Relacionados
- [Diagrama de Componentes](../architecture/component-diagram.md)
- [Flujo de Datos](../architecture/data-flow.md)
- [Document Core Service](document-core-service.md)
- [AI Assistant](ai-assistant.md)

### Estándares y Especificaciones
- Apache Lucene/Solr conceptos (adaptados para eficiencia)
- Elasticsearch Query DSL (inspiración para API)
- Natural Language Processing best practices
- Information Retrieval metrics (NDCG, MRR, MAP)