# Search Service

## Descripci�n General

El Search Service es el componente de Picura MD responsable de la indexaci�n, b�squeda y descubrimiento de contenido. Proporciona capacidades eficientes de b�squeda a trav�s de documentos y metadatos, optimizadas para rendimiento y sostenibilidad. Este servicio permite a los usuarios encontrar r�pidamente informaci�n relevante mientras minimiza el consumo de recursos.

## Prop�sito y Responsabilidades

El Search Service cumple las siguientes funciones principales:

1. **Indexaci�n Eficiente**: Creaci�n y mantenimiento de �ndices optimizados para contenido Markdown
2. **B�squeda de Texto Completo**: Localizaci�n r�pida de contenido en documentos
3. **B�squeda por Metadatos**: Filtrado y b�squeda basada en metadatos estructurados
4. **Relevancia Contextual**: Clasificaci�n de resultados seg�n relevancia para el usuario
5. **Sugerencias y Correcciones**: Asistencia para consultas con errores o alternativas
6. **An�lisis Sem�ntico B�sico**: Comprensi�n de relaciones entre t�rminos y conceptos
7. **B�squeda Incremental**: Resultados en tiempo real mientras el usuario escribe

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

**Responsabilidad**: Procesar documentos y metadatos para construir y mantener �ndices eficientes.

**Componentes Clave**:
- **ContentProcessor**: An�lisis y tokenizaci�n de texto Markdown
- **MetadataExtractor**: Extracci�n de metadatos relevantes para b�squeda
- **IndexBuilder**: Construcci�n de estructuras de �ndice optimizadas
- **IndexUpdater**: Actualizaci�n incremental de �ndices existentes

**Caracter�sticas Sostenibles**:
- Indexaci�n diferida e incremental para minimizar procesamiento
- Procesamiento adaptativo seg�n relevancia y frecuencia de acceso
- Filtrado de contenido no significativo para reducir tama�o de �ndice
- Priorizaci�n basada en patrones de usuario

#### Query Engine

**Responsabilidad**: Procesamiento de consultas y generaci�n de resultados relevantes.

**Componentes Clave**:
- **QueryParser**: An�lisis sint�ctico y sem�ntico de consultas
- **SearchExecutor**: Ejecuci�n eficiente de b�squedas en �ndices
- **ResultsProcessor**: Filtrado, clasificaci�n y formateo de resultados
- **SuggestionGenerator**: Generaci�n de sugerencias y autocorrecci�n

**Caracter�sticas Sostenibles**:
- Ejecuci�n estratificada para resultados r�pidos prioritarios
- Cancelaci�n temprana para consultas superadas
- Reutilizaci�n de resultados parciales
- Clasificaci�n progresiva con refinamiento incremental

#### Index Manager

**Responsabilidad**: Gesti�n del ciclo de vida de los �ndices y optimizaci�n de su almacenamiento.

**Componentes Clave**:
- **IndexStorage**: Persistencia eficiente de estructuras de �ndice
- **OptimizationEngine**: Compactaci�n y optimizaci�n peri�dica
- **FragmentManager**: Gesti�n de fragmentaci�n de �ndices grandes
- **ConsistencyChecker**: Verificaci�n y reparaci�n de integridad

**Caracter�sticas Sostenibles**:
- Compresi�n adaptativa de �ndices seg�n acceso
- Estratificaci�n para balance entre velocidad y tama�o
- Purga selectiva de t�rminos con bajo valor de b�squeda
- Reconstrucci�n parcial para minimizar operaciones

#### Analytics Engine

**Responsabilidad**: An�lisis de patrones de b�squeda para mejorar relevancia y rendimiento.

**Componentes Clave**:
- **UsageAnalyzer**: An�lisis de patrones de consulta de usuarios
- **RelevanceTrainer**: Mejora continua de algoritmos de relevancia
- **PatternDetector**: Identificaci�n de patrones y relaciones
- **PerformanceMonitor**: Monitoreo y optimizaci�n de rendimiento

**Caracter�sticas Sostenibles**:
- An�lisis en background durante periodos de baja carga
- Almacenamiento compacto de datos de an�lisis
- Entrenamiento incremental de modelos de relevancia
- Adaptaci�n din�mica a recursos disponibles

## Tipos de �ndices y Estructuras

### �ndices Principales

| Tipo de �ndice | Prop�sito | Caracter�sticas |
|----------------|-----------|----------------|
| **�ndice de Texto Completo** | B�squeda en contenido de documentos | Invertido, posicional, con skiplist |
| **�ndice de Metadatos** | B�squeda por atributos estructurados | B-Tree para valores discretos, R-Tree para rangos |
| **�ndice de Etiquetas** | B�squeda por etiquetas y categor�as | Hash con referencias cruzadas |
| **�ndice de Entidades** | B�squeda de entidades nombradas | Grafos compactos con relaciones |
| **�ndice de Similitud** | B�squeda de contenido similar | LSH (Locality-Sensitive Hashing) |

### Optimizaciones Estructurales

1. **Compresi�n de Diccionario**
   - Codificaci�n eficiente de t�rminos frecuentes
   - Compresi�n de prefijos para t�rminos relacionados
   - Mapeo de t�rminos a identificadores compactos

2. **Listas de Postings Optimizadas**
   - Codificaci�n delta para posiciones
   - Compresi�n variable seg�n frecuencia
   - Estructura en bloques para b�squeda eficiente

3. **�ndices Fragmentados**
   - Divisi�n estrat�gica para documentos grandes
   - Indexaci�n parcial de secciones menos relevantes
   - Carga bajo demanda para fragmentos espec�ficos

## Interfaces y Dependencias

### Interfaces Externas

| Interfaz | Tipo | Descripci�n |
|----------|------|-------------|
| `ISearchService` | P�blica | API principal para b�squedas |
| `IQueryBuilder` | P�blica | Construcci�n program�tica de consultas |
| `ISearchResults` | P�blica | Acceso a resultados paginados |
| `IIndexAdmin` | P�blica | Administraci�n de �ndices |
| `ISearchInsights` | P�blica | An�lisis y estad�sticas de b�squeda |
| `IIndexObserver` | Interna | Notificaciones de cambios en documentos |
| `IStoragePersistence` | Interna | Persistencia de �ndices |

### API P�blica Principal

```typescript
interface ISearchService {
  // B�squeda b�sica
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  searchByMetadata(criteria: MetadataCriteria): Promise<SearchResults>;
  typeahead(partialQuery: string, limit?: number): Promise<string[]>;
  
  // B�squeda avanzada
  buildQuery(): QueryBuilder;
  executeQuery(query: QueryDefinition): Promise<SearchResults>;
  suggest(query: string): Promise<SearchSuggestion[]>;
  
  // Administraci�n de �ndices
  getIndexStatus(): Promise<IndexStatus>;
  optimizeIndex(options?: OptimizationOptions): Promise<OptimizationResult>;
  rebuildIndex(scope?: IndexScope): Promise<RebuildResult>;
  
  // Eventos y configuraci�n
  on(event: SearchEvent, handler: EventHandler): Unsubscribe;
  configure(config: Partial<SearchConfig>): void;
}

interface SearchResults {
  items: SearchResultItem[];
  total: number;
  hasMore: boolean;
  timeTaken: number;
  facets?: Record<string, FacetValue[]>;
  
  // Navegaci�n de resultados
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

| Componente | Prop�sito | Interacci�n |
|------------|-----------|-------------|
| Document Core Service | Fuente de documentos | Notificaciones de cambios, acceso a contenido |
| Storage Service | Persistencia | Almacenamiento de �ndices |
| AI Assistant | An�lisis sem�ntico | Mejora de consultas, sugerencias contextuales |
| Sustainability Monitor | Monitoreo de recursos | Reporte de uso, adaptaci�n a disponibilidad |

## Flujos de Trabajo Principales

### Indexaci�n de Documento

1. Document Core Service notifica creaci�n o actualizaci�n
2. Indexer recibe notificaci�n con metadata del cambio
3. ContentProcessor obtiene y analiza contenido seg�n prioridad
4. Se tokeniza y normaliza texto, extrayendo t�rminos significativos
5. Se actualiza �ndice de forma incremental (solo partes modificadas)
6. Se extraen y procesan metadatos para �ndices secundarios
7. IndexManager persiste cambios en Storage Service
8. Se notifica actualizaci�n a componentes interesados

### Ejecuci�n de B�squeda

1. Usuario ingresa consulta a trav�s de UI
2. QueryParser analiza y normaliza t�rminos de b�squeda
3. Se identifican operadores especiales y estructura de consulta
4. SearchExecutor planifica estrategia �ptima de ejecuci�n
5. Se recuperan resultados preliminares con alta relevancia
6. ResultsProcessor filtra, clasifica y agrupa resultados
7. Se devuelven primeros resultados a UI para respuesta r�pida
8. En paralelo, se refinan resultados y clasificaci�n
9. Se actualizan resultados incrementalmente si es necesario

### Optimizaci�n de �ndice

1. Tarea programada o solicitud expl�cita de optimizaci�n
2. IndexManager eval�a estado actual y fragmentaci�n
3. OptimizationEngine planifica estrategia seg�n recursos disponibles
4. Se realiza compactaci�n, eliminando entradas obsoletas
5. Se rebalancean estructuras para acceso eficiente
6. ConsistencyChecker verifica integridad del resultado
7. Se actualizan referencias y se libera espacio no utilizado
8. Se reportan m�tricas de mejora y estado actualizado

## Estrategias de Sostenibilidad

### Indexaci�n Eficiente

1. **Indexaci�n Incremental**
   - Procesamiento limitado a contenido modificado
   - Detecci�n inteligente de impacto de cambios
   - Reutilizaci�n m�xima de estructuras existentes

2. **Indexaci�n Selectiva**
   - An�lisis de relevancia para determinar profundidad
   - Exclusi�n configurable de contenido menos �til
   - Indexaci�n parcial de documentos extensos

3. **Indexaci�n Programada**
   - Priorizaci�n basada en patrones de acceso
   - Procesamiento durante periodos de baja actividad
   - Agrupaci�n de operaciones para eficiencia

### Optimizaci�n de Consultas

1. **Ejecuci�n Estratificada**
   - Recuperaci�n inicial r�pida de resultados m�s relevantes
   - Refinamiento progresivo seg�n necesidad
   - Cancelaci�n temprana cuando sea apropiado

2. **Caching Inteligente**
   - Almacenamiento de resultados frecuentes
   - Reutilizaci�n parcial para consultas similares
   - Invalidaci�n selectiva ante cambios

3. **Optimizaci�n de Planes**
   - An�lisis de costo para seleccionar estrategia �ptima
   - Reordenamiento de operaciones para minimizar trabajo
   - Paralelizaci�n selectiva seg�n disponibilidad

### Gesti�n de Recursos

| Escenario | Adaptaciones |
|-----------|--------------|
| **Bater�a Baja** | Indexaci�n diferida, b�squedas simplificadas, cach� agresivo |
| **Almacenamiento Limitado** | Mayor compresi�n, purga selectiva, �ndices parciales |
| **CPU Limitada** | Algoritmos m�s simples, resultados aproximados, paralelismo reducido |
| **Prioridad Usuario** | Recursos concentrados en consultas interactivas, background reducido |

### M�tricas de Sostenibilidad

- Tiempo de CPU por documento indexado
- Tama�o de �ndice vs. contenido original
- Costo energ�tico estimado por consulta
- Eficiencia de cach� y tasa de reutilizaci�n
- Impacto de optimizaciones en consumo de recursos

## Capacidades de B�squeda

### Tipos de B�squeda Soportados

| Tipo | Descripci�n | Optimizaciones |
|------|-------------|----------------|
| **Texto Libre** | B�squeda general en contenido | T�rminos relevantes priorizados, stemming |
| **Frase Exacta** | Coincidencia exacta de secuencia | �ndices posicionales, skiplist |
| **Booleana** | Combinaciones con AND, OR, NOT | Ejecuci�n con corto-circuito, optimizaci�n de orden |
| **Por Campos** | B�squeda en metadatos espec�ficos | �ndices especializados por campo |
| **Por Etiquetas** | B�squeda basada en etiquetas | Estructuras hash optimizadas |
| **Rango Num�rico** | Valores dentro de rangos | �ndices de rango, b�squeda binaria |
| **Fecha/Temporal** | Periodos y puntos temporales | �ndices temporales optimizados |
| **Proximidad** | T�rminos cercanos entre s� | Ventanas deslizantes, distancia adaptativa |
| **Similitud** | Contenido conceptualmente similar | LSH, embeddings compactos |

### Funcionalidades Avanzadas

1. **Auto-completado**
   - Sugerencias mientras el usuario escribe
   - Priorizaci�n basada en popularidad y contexto
   - Correcci�n ortogr�fica integrada

2. **Correcci�n y Sugerencias**
   - Detecci�n y correcci�n de errores tipogr�ficos
   - Sugerencias de t�rminos alternativos
   - Expansi�n sem�ntica limitada

3. **Facetas y Filtros**
   - Agrupaci�n din�mica por atributos relevantes
   - Refinamiento progresivo de resultados
   - Estad�sticas de distribuci�n

4. **Historial y Contexto**
   - Consideraci�n de b�squedas anteriores
   - Adaptaci�n a preferencias observadas
   - Personalizaci�n sutil de relevancia

## Relevancia y Clasificaci�n

### Algoritmo de Relevancia

El Search Service utiliza un algoritmo de clasificaci�n adaptativo que considera:

1. **Factores de Documento**
   - Frecuencia de t�rminos (TF)
   - Rareza de t�rminos en colecci�n (IDF)
   - Proximidad entre t�rminos de b�squeda
   - Posici�n en documento (t�tulo > primeros p�rrafos > resto)
   - Estructura y �nfasis (encabezados, negritas, etc.)

2. **Factores de Usuario**
   - Historial de interacciones con documentos
   - Documentos recientemente accedidos
   - Preferencias impl�citas observadas
   - Contexto de trabajo actual

3. **Factores Contextuales**
   - Actualidad del contenido
   - Relacionamiento con otros documentos
   - Popularidad general
   - Completitud y calidad percibida

### Personalizaci�n de Relevancia

- Adaptaci�n gradual basada en selecciones previas
- Reordenamiento sutil sin cambios dr�sticos
- Transparencia sobre factores de clasificaci�n
- Control de usuario sobre nivel de personalizaci�n

## Configuraciones y Adaptabilidad

### Par�metros Configurables

| Par�metro | Prop�sito | Valores Recomendados |
|-----------|-----------|----------------------|
| `indexingDepth` | Profundidad de an�lisis | Standard, Deep, Minimal |
| `searchPrecision` | Balance precisi�n/rendimiento | High, Balanced, Performance |
| `stemmingStrength` | Nivel de normalizaci�n ling��stica | None, Light, Standard, Aggressive |
| `stopWordsHandling` | Tratamiento de palabras comunes | Include, Exclude, Smart |
| `indexingPriority` | Prioridad para recursos de sistema | Low, Normal, High |
| `cacheSize` | Tama�o de cach� de resultados | 10-50MB seg�n disponibilidad |
| `backgroundIndexing` | Cu�ndo realizar indexaci�n | Auto, Idle, Manual, Scheduled |

### Adaptaci�n Contextual

El Search Service ajusta su comportamiento seg�n:

1. **Estado del Dispositivo**
   - Modo de energ�a (conectado vs. bater�a)
   - Recursos disponibles (CPU, memoria)
   - Actividad del usuario (activo vs. idle)

2. **Patrones de Uso**
   - Frecuencia y complejidad de b�squedas
   - Distribuci�n de tama�os de documento
   - Tipos de consulta predominantes

3. **Requisitos de Precisi�n**
   - Consultas exploratorias vs. espec�ficas
   - Tolerancia a falsos positivos
   - Necesidad de resultados completos

## Diagn�stico y Monitoreo

### M�tricas Clave

| M�trica | Descripci�n | Uso |
|---------|-------------|-----|
| Tama�o de �ndice | Espacio utilizado por �ndices | Monitoreo de recursos, optimizaci�n |
| Tiempo de indexaci�n | Tiempo promedio para procesar documento | Rendimiento, planificaci�n |
| Latencia de b�squeda | Tiempo hasta primeros resultados | Experiencia de usuario, optimizaci�n |
| Hit ratio de cach� | Porcentaje de consultas servidas desde cach� | Eficiencia, ajuste de cach� |
| Consultas por segundo | Volumen de b�squedas procesadas | Capacidad, planificaci�n |
| T�rminos m�s buscados | Lista de t�rminos frecuentes | Optimizaci�n, insights |

### Herramientas de Diagn�stico

1. **Analizador de Consultas**
   - Visualizaci�n de plan de ejecuci�n
   - Estad�sticas de t�rminos y frecuencia
   - Identificaci�n de cuellos de botella

2. **Estad�sticas de �ndice**
   - Distribuci�n de t�rminos
   - Grado de fragmentaci�n
   - Oportunidades de optimizaci�n

3. **Monitor de Rendimiento**
   - Seguimiento de latencia por tipo de consulta
   - Consumo de recursos detallado
   - Alertas para degradaci�n de rendimiento

## Extensibilidad

### Puntos de Extensi�n

1. **Analizadores Personalizados**
   - Procesamiento especializado para tipos espec�ficos de contenido
   - Tokenizadores espec�ficos de dominio
   - Filtros de normalizaci�n personalizados

2. **Motores de Relevancia**
   - Algoritmos alternativos de clasificaci�n
   - Factores personalizados para dominios espec�ficos
   - Adaptaciones para casos de uso particulares

3. **Proveedores de �ndice**
   - Integraci�n con motores de b�squeda externos
   - Estructuras de �ndice especializadas
   - Estrategias alternativas de almacenamiento

### Ejemplo de Extensi�n

```typescript
// Analizador personalizado para terminolog�a t�cnica
searchService.registerAnalyzer({
  name: "technical-docs",
  tokenize: (text) => {
    // Reconocimiento de patrones t�cnicos especiales
    return tokenizeTechnicalContent(text, {
      recognizeCodeBlocks: true,
      preserveCamelCase: true,
      handleSpecialSymbols: true
    });
  },
  filter: (tokens) => {
    // Normalizaci�n espec�fica para documentaci�n t�cnica
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

## Integraci�n con AI Assistant

### Mejoras Basadas en IA

1. **Expansi�n Sem�ntica**
   - Inclusi�n limitada de t�rminos relacionados
   - Detecci�n de intenci�n de b�squeda
   - Correcci�n contextual de consultas

2. **Clasificaci�n Mejorada**
   - Factores sem�nticos para relevancia
   - Comprensi�n b�sica de contenido
   - Agrupaci�n por similitud conceptual

3. **Sugerencias Inteligentes**
   - Reformulaciones que mejoran resultados
   - T�rminos alternativos con mayor precisi�n
   - Correcci�n avanzada basada en contexto

### Sostenibilidad en Funciones de IA

- Procesamiento local para funciones b�sicas
- Uso selectivo de modelos ligeros
- Invocaci�n opcional de capacidades avanzadas
- Degradaci�n elegante sin componentes de IA

## Seguridad y Privacidad

### Consideraciones de Seguridad

1. **Protecci�n de �ndices**
   - Validaci�n de consultas para prevenir ataques
   - Limitaci�n de recursos por consulta
   - Protecci�n contra enumeraci�n

2. **Control de Acceso**
   - Filtrado de resultados seg�n permisos
   - Indexaci�n con respeto a permisos
   - Aislamiento entre espacios de usuario

3. **Datos Sensibles**
   - Opciones para excluir contenido sensible de �ndices
   - Tokenizaci�n segura de informaci�n cr�tica
   - Eliminaci�n segura cuando sea solicitado

### Privacidad de B�squeda

- Almacenamiento m�nimo de historiales
- Anonimizaci�n de patrones de b�squeda
- Transparencia sobre datos utilizados
- Control de usuario sobre recolecci�n

## Pruebas y Calidad

### Estrategia de Testing

1. **Tests Unitarios**
   - Precisi�n de tokenizaci�n y an�lisis
   - Correctitud de algoritmos de b�squeda
   - Comportamiento ante casos l�mite

2. **Tests de Integraci�n**
   - Flujos completos de indexaci�n y b�squeda
   - Interacci�n con otros componentes
   - Persistencia y recuperaci�n de �ndices

3. **Tests de Rendimiento**
   - Benchmarks con corpus de prueba
   - Escalabilidad con vol�menes crecientes
   - Eficiencia de recursos bajo carga

4. **Tests de Sostenibilidad**
   - Impacto en bater�a y recursos
   - Adaptabilidad a recursos limitados
   - Medici�n de huella energ�tica

### Corpus de Prueba

El Search Service incluye un corpus de prueba para verificar:
- Precisi�n en diferentes tipos de consulta
- Rendimiento con diferentes vol�menes
- Comportamiento con contenido diverso
- Adaptabilidad a diferentes idiomas

## Evoluci�n Futura

### Roadmap de Caracter�sticas

1. **B�squeda Sem�ntica Avanzada**
   - Comprensi�n mejorada de significado
   - B�squeda por conceptos y entidades
   - Relaciones sem�nticas entre documentos

2. **Optimizaci�n Predictiva**
   - Anticipaci�n de necesidades de b�squeda
   - Pre-indexaci�n inteligente
   - Caching predictivo de resultados

3. **Personalizaci�n Adaptativa**
   - Perfiles de usuario impl�citos
   - Adaptaci�n contextual a tareas
   - Relevancia personalizada transparente

4. **B�squeda Federada**
   - Integraci�n con fuentes externas
   - Unificaci�n de resultados heterog�neos
   - Estrategias �ptimas por fuente

### Investigaci�n en Desarrollo

- �ndices vectoriales ultracompactos para similitud
- Estrategias de indexaci�n progresiva para grandes vol�menes
- Compresi�n sem�ntica de contenido
- B�squeda multimodal eficiente (texto, elementos visuales)

## Referencias

### Documentos Relacionados
- [Diagrama de Componentes](../architecture/component-diagram.md)
- [Flujo de Datos](../architecture/data-flow.md)
- [Document Core Service](document-core-service.md)
- [AI Assistant](ai-assistant.md)

### Est�ndares y Especificaciones
- Apache Lucene/Solr conceptos (adaptados para eficiencia)
- Elasticsearch Query DSL (inspiraci�n para API)
- Natural Language Processing best practices
- Information Retrieval metrics (NDCG, MRR, MAP)