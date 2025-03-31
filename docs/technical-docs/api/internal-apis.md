# APIs Internas

## Visión General

Las APIs internas de Picura MD constituyen el contrato entre los componentes principales del sistema. Estas interfaces están diseñadas para proporcionar una comunicación eficiente y sostenible entre módulos, permitiendo la evolución independiente de cada componente mientras se mantiene la coherencia del sistema completo.

## Principios de Diseño de API

Las APIs internas siguen estos principios específicos:

1. **Minimalismo Intencional**: Interfaces con el mínimo de métodos necesarios para cumplir su propósito
2. **Tipado Estricto**: Uso de TypeScript para definir contratos claros entre componentes
3. **Inmutabilidad Preferente**: Estructuras de datos inmutables para prevenir efectos secundarios
4. **Observabilidad**: Capacidades integradas para monitoreo de rendimiento y sostenibilidad
5. **Composability**: Diseño que favorece la composición de operaciones sobre herencia
6. **Asincronía Eficiente**: Patrones asíncronos optimizados para reducir bloqueo y overhead

## Estructura de APIs por Componente

### Document Core Service API

El núcleo de gestión documental expone las siguientes interfaces principales:

```typescript
interface IDocumentCoreService {
  // Operaciones CRUD para documentos
  getDocument(id: string, options?: GetDocumentOptions): Promise<Document>;
  createDocument(template?: string, initialContent?: string): Promise<DocumentInfo>;
  updateDocument(id: string, changes: DocumentChanges): Promise<DocumentInfo>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Gestión de estructura organizativa
  getStructure(options?: StructureOptions): Promise<DocumentStructure>;
  createFolder(path: string, options?: FolderOptions): Promise<FolderInfo>;
  moveDocument(id: string, destination: string): Promise<boolean>;
  
  // Metadatos y propiedades
  getMetadata(id: string): Promise<DocumentMetadata>;
  updateMetadata(id: string, changes: Partial<DocumentMetadata>): Promise<DocumentMetadata>;
  
  // Búsqueda interna
  findDocuments(query: SearchQuery, options?: SearchOptions): Promise<SearchResults>;
  
  // Eventos para observabilidad
  on(event: DocumentEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Carga selectiva de contenido con `options.loadContent` para minimizar transferencia de datos
- Cambios incrementales con `DocumentChanges` que especifican sólo lo modificado
- Eventos granulares para actualizar sólo lo necesario en la interfaz

### Storage Service API

Gestiona la persistencia y recuperación de datos de manera eficiente:

```typescript
interface IStorageService {
  // Operaciones básicas
  read(key: string, options?: ReadOptions): Promise<StoredData>;
  write(key: string, data: StorableData, options?: WriteOptions): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Operaciones avanzadas
  query(criteria: QueryCriteria): Promise<QueryResults>;
  batchOperation(operations: StorageOperation[]): Promise<BatchResult>;
  
  // Gestión de recursos
  getUsageStats(): Promise<StorageStats>;
  optimizeStorage(options?: OptimizationOptions): Promise<OptimizationResult>;
  
  // Configuración
  configure(config: StorageConfig): void;
  
  // Eventos
  on(event: StorageEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Operaciones por lotes para minimizar overhead de I/O
- Opciones configurables de compresión según tipo de contenido y contexto
- Estadísticas de uso para optimización adaptativa

### Editor Module API

Proporciona funcionalidades para edición de documentos:

```typescript
interface IEditorModule {
  // Gestión de sesión de edición
  initialize(element: HTMLElement, options?: EditorOptions): Promise<EditorInstance>;
  openDocument(id: string, options?: EditorViewOptions): Promise<void>;
  dispose(): void;
  
  // Control de contenido
  getContent(): string;
  setContent(content: string): void;
  insertText(text: string, position?: Position): void;
  
  // Formateo y edición
  applyFormatting(format: FormattingOption, selection?: Range): void;
  undo(): void;
  redo(): void;
  
  // Estado y configuración
  getState(): EditorState;
  getSelection(): SelectionInfo;
  configure(config: Partial<EditorConfig>): void;
  
  // Modos de interfaz
  setInterfaceMode(mode: InterfaceMode): void;
  
  // Eventos
  on(event: EditorEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Renderizado selectivo para documentos grandes con ViewportOptions
- Modos de interfaz adaptados a diferentes usuarios y dispositivos
- Operaciones adaptativas según estado de energía del sistema

### Viewer Module API

Especializada en renderizado eficiente de documentos:

```typescript
interface IViewerModule {
  // Operaciones de visualización
  renderDocument(documentId: string, options?: ViewerOptions): Promise<ViewerInstance>;
  getRenderedDocument(documentId: string): ViewerInstance | null;
  refreshView(options?: RefreshOptions): Promise<void>;
  
  // Configuración y temas
  setTheme(theme: ViewerTheme): void;
  configureViewer(config: Partial<ViewerConfig>): void;
  
  // Exportación
  exportDocument(format: ExportFormat, options?: ExportOptions): Promise<ExportResult>;
  
  // Eventos
  on(event: ViewerEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Renderizado diferido de elementos fuera de viewport
- Carga adaptativa de recursos embebidos según condiciones de red
- Temas optimizados para diferentes displays (OLED, LCD)

### Version Control Service API

Gestiona el historial y versionado de documentos:

```typescript
interface IVersionControlService {
  // Operaciones básicas
  initialize(options?: RepositoryOptions): Promise<RepositoryInfo>;
  commit(message: string, options?: CommitOptions): Promise<CommitResult>;
  checkout(reference: string, options?: CheckoutOptions): Promise<CheckoutResult>;
  
  // Historial y diferencias
  getHistory(documentId?: string, options?: HistoryOptions): Promise<HistoryResult>;
  getVersion(versionId: string): Promise<DocumentVersion>;
  getDiff(fromVersion: string, toVersion: string, options?: DiffOptions): Promise<DiffResult>;
  
  // Operaciones avanzadas
  getBranches(): Promise<BranchInfo[]>;
  createBranch(name: string, options?: BranchOptions): Promise<BranchResult>;
  mergeBranch(sourceBranch: string, targetBranch?: string, options?: MergeOptions): Promise<MergeResult>;
  
  // Eventos
  on(event: VersionControlEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Operaciones incrementales para minimizar almacenamiento
- Estrategias adaptativas de compresión para historial
- Carga bajo demanda de información histórica

### Sync Service API

Coordina la sincronización eficiente con repositorios remotos:

```typescript
interface ISyncService {
  // Operaciones de sincronización
  sync(options?: SyncOptions): Promise<SyncResult>;
  syncDocument(docId: string, options?: SyncOptions): Promise<DocumentSyncResult>;
  cancelSync(operationId?: string): Promise<boolean>;
  
  // Configuración
  configure(config: Partial<SyncConfig>): void;
  setRemoteConfig(config: RemoteConfig): Promise<void>;
  
  // Estado
  getStatus(): SyncStatus;
  getLastSyncResult(): SyncResult;
  
  // Conflictos
  resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<boolean>;
  getPendingConflicts(): ConflictInfo[];
  
  // Eventos
  on(event: SyncEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Sincronización diferencial para minimizar transferencia
- Opciones de configuración según tipo de red y estado de batería
- Priorización configurable de contenido a sincronizar

### Search Service API

Proporciona capacidades de búsqueda e indexación eficientes:

```typescript
interface ISearchService {
  // Operaciones básicas
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  searchByMetadata(criteria: MetadataCriteria): Promise<SearchResults>;
  
  // Operaciones avanzadas
  buildQuery(): QueryBuilder;
  executeQuery(query: QueryDefinition): Promise<SearchResults>;
  
  // Administración de índices
  getIndexStatus(): Promise<IndexStatus>;
  optimizeIndex(options?: OptimizationOptions): Promise<OptimizationResult>;
  rebuildIndex(scope?: IndexScope): Promise<RebuildResult>;
  
  // Eventos
  on(event: SearchEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Indexación adaptativa según patrones de búsqueda
- Optimización para diferentes volúmenes de contenido
- Estrategias de búsqueda ajustadas según recursos disponibles

### AI Assistant API

Proporciona asistencia contextual con procesamiento eficiente:

```typescript
interface IAIAssistant {
  // Configuración y estado
  setAssistanceLevel(level: AssistanceLevel): void;
  setOperationMode(mode: OperationMode): void;
  getStatus(): AssistantStatus;
  
  // Solicitudes
  requestSuggestions(context: EditorContext): Promise<Suggestion[]>;
  checkGrammar(text: string): Promise<GrammarCorrection[]>;
  analyzeDocument(documentId: string): Promise<DocumentAnalysis>;
  
  // Feedback para aprendizaje
  provideFeedback(suggestionId: string, accepted: boolean, modifications?: string): void;
  
  // Eventos
  on(event: AssistantEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Modos de operación ajustados a disponibilidad de recursos
- Procesamiento local prioritario con opción remota
- Sugerencias contextuales optimizadas para mínimo impacto

### Sustainability Monitor API

Monitorea y optimiza el uso de recursos:

```typescript
interface ISustainabilityMonitor {
  // Estado y configuración
  getStatus(): SustainabilityStatus;
  setEnergyMode(mode: EnergyMode): Promise<void>;
  configure(config: Partial<SustainabilityConfig>): void;
  
  // Métricas
  getResourceMetrics(scope?: MetricsScope): ResourceMetrics;
  getImpactEstimation(timeframe?: Timeframe): ImpactEstimation;
  
  // Optimización
  runOptimization(target?: OptimizationTarget): Promise<OptimizationResult>;
  suggestImprovements(): SustainabilitySuggestion[];
  
  // Registro de componentes
  registerComponent(component: IResourceConsumer): void;
  
  // Eventos
  on(event: SustainabilityEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Monitoreo con mínimo overhead
- Métricas adaptativas según impacto en sistema
- Directivas optimizadas para diferentes estados de recursos

## Sistema de Eventos

Picura MD implementa un sistema de eventos eficiente para comunicación entre componentes:

```typescript
interface EventEmitter {
  emit(event: string, ...args: any[]): boolean;
  on(event: string, listener: Function): Unsubscribe;
  once(event: string, listener: Function): Unsubscribe;
  onAny(listener: (event: string, ...args: any[]) => void): Unsubscribe;
}

// Tipo común para desuscripción
type Unsubscribe = () => void;
```

**Consideraciones de sostenibilidad**:
- Eventos tipados para prevenir errores en tiempo de desarrollo
- Mecanismo de unsubscribe para prevenir memory leaks
- Orden de ejecución optimizado para minimizar bloqueos

## Patrones Comunes de API

### Patrón de Configuración

Las APIs de configuración siguen un enfoque coherente:

```typescript
// Configuración parcial con valores por defecto
component.configure({
  // Solo se proporcionan valores que difieren del default
  processingLevel: 'balanced',
  cacheSize: '20mb'
});

// Método fluido para múltiples configuraciones
component
  .setOption('key', value)
  .setOption('another', anotherValue)
  .apply();
```

### Patrón de Operaciones Asíncronas

Operaciones que pueden ser lentas o consumir recursos:

```typescript
// Promise con soporte para cancelación
const operation = component.longRunningOperation();

// Cancelación
operation.cancel();

// Progreso (cuando aplicable)
operation.onProgress(progress => {
  console.log(`${progress.completed}/${progress.total}`);
});
```

### Patrón de Recursos

Manejo consistente de ciclo de vida:

```typescript
// Adquisición de recurso
const resource = await component.acquireResource();

try {
  // Uso del recurso
  await resource.use();
} finally {
  // Liberación garantizada
  await resource.release();
}

// Alternativa con patrón using cuando esté disponible
await using(component.acquireResource(), async (resource) => {
  await resource.use();
});
```

## Mejores Prácticas para Desarrolladores

### Consumo Eficiente de APIs

1. **Suscripciones Limitadas**: Suscribirse solo a eventos necesarios
2. **Cancelación Proactiva**: Cancelar operaciones que ya no sean necesarias
3. **Liberación de Recursos**: Asegurar liberación adecuada (unsubscribe, dispose)
4. **Peticiones Optimizadas**: Solicitar solo datos necesarios con opciones adecuadas
5. **Operaciones por Lotes**: Usar métodos batch donde sea posible

### Implementación de Interfaces

1. **Compatibilidad de Contrato**: Respetar la semántica documentada
2. **Manejo de Errores**: Usar tipos de error estándar y proporcionar contexto
3. **Consumo de Recursos**: Reportar uso al Sustainability Monitor
4. **Validación de Entrada**: Comprobar parámetros antes de operaciones costosas
5. **Retrocompatibilidad**: Mantener comportamiento documentado

## Evolución y Versionado

### Ciclo de Vida de APIs

Las APIs internas evolucionan siguiendo estas fases:

1. **Experimental**: APIs en desarrollo, pueden cambiar sin previo aviso
2. **Beta**: APIs estables pero en prueba, depreciación con aviso
3. **Estable**: APIs con compromiso de compatibilidad según SemVer
4. **Obsoleta**: APIs marcadas para eliminación futura
5. **Eliminada**: APIs removidas tras período de transición

### Políticas de Depreciación

- Marcado claro con anotaciones `@deprecated`
- Período mínimo de 2 versiones menores antes de eliminación
- Documentación de alternativas y rutas de migración
- Advertencias en tiempo de desarrollo y ejecución

## Apéndice: Interfaces Comunes

### Tipos Compartidos

```typescript
// Identificadores
type DocumentId = string;
type VersionId = string;

// Resultados paginados
interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

// Información de error estandarizada
interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
  recoverable: boolean;
  suggestedAction?: string;
}

// Metadatos comunes
interface BaseMetadata {
  createdAt: string; // ISO 8601
  modifiedAt: string; // ISO 8601
  createdBy?: string;
  modifiedBy?: string;
  tags?: string[];
}
```

### Interfaces de Interacción

```typescript
// Rango de selección
interface Range {
  start: Position;
  end: Position;
}

// Posición en documento
interface Position {
  line: number;
  column: number;
  offset?: number; // posición absoluta
}

// Configuración de tema
interface ThemeConfig {
  colorScheme: 'light' | 'dark' | 'system';
  fontFamily?: string;
  fontSize?: number;
  spacing?: number;
  customColors?: Record<string, string>;
}
```