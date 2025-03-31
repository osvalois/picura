# APIs Internas

## Visi�n General

Las APIs internas de Picura MD constituyen el contrato entre los componentes principales del sistema. Estas interfaces est�n dise�adas para proporcionar una comunicaci�n eficiente y sostenible entre m�dulos, permitiendo la evoluci�n independiente de cada componente mientras se mantiene la coherencia del sistema completo.

## Principios de Dise�o de API

Las APIs internas siguen estos principios espec�ficos:

1. **Minimalismo Intencional**: Interfaces con el m�nimo de m�todos necesarios para cumplir su prop�sito
2. **Tipado Estricto**: Uso de TypeScript para definir contratos claros entre componentes
3. **Inmutabilidad Preferente**: Estructuras de datos inmutables para prevenir efectos secundarios
4. **Observabilidad**: Capacidades integradas para monitoreo de rendimiento y sostenibilidad
5. **Composability**: Dise�o que favorece la composici�n de operaciones sobre herencia
6. **Asincron�a Eficiente**: Patrones as�ncronos optimizados para reducir bloqueo y overhead

## Estructura de APIs por Componente

### Document Core Service API

El n�cleo de gesti�n documental expone las siguientes interfaces principales:

```typescript
interface IDocumentCoreService {
  // Operaciones CRUD para documentos
  getDocument(id: string, options?: GetDocumentOptions): Promise<Document>;
  createDocument(template?: string, initialContent?: string): Promise<DocumentInfo>;
  updateDocument(id: string, changes: DocumentChanges): Promise<DocumentInfo>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Gesti�n de estructura organizativa
  getStructure(options?: StructureOptions): Promise<DocumentStructure>;
  createFolder(path: string, options?: FolderOptions): Promise<FolderInfo>;
  moveDocument(id: string, destination: string): Promise<boolean>;
  
  // Metadatos y propiedades
  getMetadata(id: string): Promise<DocumentMetadata>;
  updateMetadata(id: string, changes: Partial<DocumentMetadata>): Promise<DocumentMetadata>;
  
  // B�squeda interna
  findDocuments(query: SearchQuery, options?: SearchOptions): Promise<SearchResults>;
  
  // Eventos para observabilidad
  on(event: DocumentEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Carga selectiva de contenido con `options.loadContent` para minimizar transferencia de datos
- Cambios incrementales con `DocumentChanges` que especifican s�lo lo modificado
- Eventos granulares para actualizar s�lo lo necesario en la interfaz

### Storage Service API

Gestiona la persistencia y recuperaci�n de datos de manera eficiente:

```typescript
interface IStorageService {
  // Operaciones b�sicas
  read(key: string, options?: ReadOptions): Promise<StoredData>;
  write(key: string, data: StorableData, options?: WriteOptions): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Operaciones avanzadas
  query(criteria: QueryCriteria): Promise<QueryResults>;
  batchOperation(operations: StorageOperation[]): Promise<BatchResult>;
  
  // Gesti�n de recursos
  getUsageStats(): Promise<StorageStats>;
  optimizeStorage(options?: OptimizationOptions): Promise<OptimizationResult>;
  
  // Configuraci�n
  configure(config: StorageConfig): void;
  
  // Eventos
  on(event: StorageEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Operaciones por lotes para minimizar overhead de I/O
- Opciones configurables de compresi�n seg�n tipo de contenido y contexto
- Estad�sticas de uso para optimizaci�n adaptativa

### Editor Module API

Proporciona funcionalidades para edici�n de documentos:

```typescript
interface IEditorModule {
  // Gesti�n de sesi�n de edici�n
  initialize(element: HTMLElement, options?: EditorOptions): Promise<EditorInstance>;
  openDocument(id: string, options?: EditorViewOptions): Promise<void>;
  dispose(): void;
  
  // Control de contenido
  getContent(): string;
  setContent(content: string): void;
  insertText(text: string, position?: Position): void;
  
  // Formateo y edici�n
  applyFormatting(format: FormattingOption, selection?: Range): void;
  undo(): void;
  redo(): void;
  
  // Estado y configuraci�n
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
- Operaciones adaptativas seg�n estado de energ�a del sistema

### Viewer Module API

Especializada en renderizado eficiente de documentos:

```typescript
interface IViewerModule {
  // Operaciones de visualizaci�n
  renderDocument(documentId: string, options?: ViewerOptions): Promise<ViewerInstance>;
  getRenderedDocument(documentId: string): ViewerInstance | null;
  refreshView(options?: RefreshOptions): Promise<void>;
  
  // Configuraci�n y temas
  setTheme(theme: ViewerTheme): void;
  configureViewer(config: Partial<ViewerConfig>): void;
  
  // Exportaci�n
  exportDocument(format: ExportFormat, options?: ExportOptions): Promise<ExportResult>;
  
  // Eventos
  on(event: ViewerEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Renderizado diferido de elementos fuera de viewport
- Carga adaptativa de recursos embebidos seg�n condiciones de red
- Temas optimizados para diferentes displays (OLED, LCD)

### Version Control Service API

Gestiona el historial y versionado de documentos:

```typescript
interface IVersionControlService {
  // Operaciones b�sicas
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
- Estrategias adaptativas de compresi�n para historial
- Carga bajo demanda de informaci�n hist�rica

### Sync Service API

Coordina la sincronizaci�n eficiente con repositorios remotos:

```typescript
interface ISyncService {
  // Operaciones de sincronizaci�n
  sync(options?: SyncOptions): Promise<SyncResult>;
  syncDocument(docId: string, options?: SyncOptions): Promise<DocumentSyncResult>;
  cancelSync(operationId?: string): Promise<boolean>;
  
  // Configuraci�n
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
- Sincronizaci�n diferencial para minimizar transferencia
- Opciones de configuraci�n seg�n tipo de red y estado de bater�a
- Priorizaci�n configurable de contenido a sincronizar

### Search Service API

Proporciona capacidades de b�squeda e indexaci�n eficientes:

```typescript
interface ISearchService {
  // Operaciones b�sicas
  search(query: string, options?: SearchOptions): Promise<SearchResults>;
  searchByMetadata(criteria: MetadataCriteria): Promise<SearchResults>;
  
  // Operaciones avanzadas
  buildQuery(): QueryBuilder;
  executeQuery(query: QueryDefinition): Promise<SearchResults>;
  
  // Administraci�n de �ndices
  getIndexStatus(): Promise<IndexStatus>;
  optimizeIndex(options?: OptimizationOptions): Promise<OptimizationResult>;
  rebuildIndex(scope?: IndexScope): Promise<RebuildResult>;
  
  // Eventos
  on(event: SearchEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Indexaci�n adaptativa seg�n patrones de b�squeda
- Optimizaci�n para diferentes vol�menes de contenido
- Estrategias de b�squeda ajustadas seg�n recursos disponibles

### AI Assistant API

Proporciona asistencia contextual con procesamiento eficiente:

```typescript
interface IAIAssistant {
  // Configuraci�n y estado
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
- Modos de operaci�n ajustados a disponibilidad de recursos
- Procesamiento local prioritario con opci�n remota
- Sugerencias contextuales optimizadas para m�nimo impacto

### Sustainability Monitor API

Monitorea y optimiza el uso de recursos:

```typescript
interface ISustainabilityMonitor {
  // Estado y configuraci�n
  getStatus(): SustainabilityStatus;
  setEnergyMode(mode: EnergyMode): Promise<void>;
  configure(config: Partial<SustainabilityConfig>): void;
  
  // M�tricas
  getResourceMetrics(scope?: MetricsScope): ResourceMetrics;
  getImpactEstimation(timeframe?: Timeframe): ImpactEstimation;
  
  // Optimizaci�n
  runOptimization(target?: OptimizationTarget): Promise<OptimizationResult>;
  suggestImprovements(): SustainabilitySuggestion[];
  
  // Registro de componentes
  registerComponent(component: IResourceConsumer): void;
  
  // Eventos
  on(event: SustainabilityEvent, handler: EventHandler): Unsubscribe;
}
```

**Consideraciones de sostenibilidad**:
- Monitoreo con m�nimo overhead
- M�tricas adaptativas seg�n impacto en sistema
- Directivas optimizadas para diferentes estados de recursos

## Sistema de Eventos

Picura MD implementa un sistema de eventos eficiente para comunicaci�n entre componentes:

```typescript
interface EventEmitter {
  emit(event: string, ...args: any[]): boolean;
  on(event: string, listener: Function): Unsubscribe;
  once(event: string, listener: Function): Unsubscribe;
  onAny(listener: (event: string, ...args: any[]) => void): Unsubscribe;
}

// Tipo com�n para desuscripci�n
type Unsubscribe = () => void;
```

**Consideraciones de sostenibilidad**:
- Eventos tipados para prevenir errores en tiempo de desarrollo
- Mecanismo de unsubscribe para prevenir memory leaks
- Orden de ejecuci�n optimizado para minimizar bloqueos

## Patrones Comunes de API

### Patr�n de Configuraci�n

Las APIs de configuraci�n siguen un enfoque coherente:

```typescript
// Configuraci�n parcial con valores por defecto
component.configure({
  // Solo se proporcionan valores que difieren del default
  processingLevel: 'balanced',
  cacheSize: '20mb'
});

// M�todo fluido para m�ltiples configuraciones
component
  .setOption('key', value)
  .setOption('another', anotherValue)
  .apply();
```

### Patr�n de Operaciones As�ncronas

Operaciones que pueden ser lentas o consumir recursos:

```typescript
// Promise con soporte para cancelaci�n
const operation = component.longRunningOperation();

// Cancelaci�n
operation.cancel();

// Progreso (cuando aplicable)
operation.onProgress(progress => {
  console.log(`${progress.completed}/${progress.total}`);
});
```

### Patr�n de Recursos

Manejo consistente de ciclo de vida:

```typescript
// Adquisici�n de recurso
const resource = await component.acquireResource();

try {
  // Uso del recurso
  await resource.use();
} finally {
  // Liberaci�n garantizada
  await resource.release();
}

// Alternativa con patr�n using cuando est� disponible
await using(component.acquireResource(), async (resource) => {
  await resource.use();
});
```

## Mejores Pr�cticas para Desarrolladores

### Consumo Eficiente de APIs

1. **Suscripciones Limitadas**: Suscribirse solo a eventos necesarios
2. **Cancelaci�n Proactiva**: Cancelar operaciones que ya no sean necesarias
3. **Liberaci�n de Recursos**: Asegurar liberaci�n adecuada (unsubscribe, dispose)
4. **Peticiones Optimizadas**: Solicitar solo datos necesarios con opciones adecuadas
5. **Operaciones por Lotes**: Usar m�todos batch donde sea posible

### Implementaci�n de Interfaces

1. **Compatibilidad de Contrato**: Respetar la sem�ntica documentada
2. **Manejo de Errores**: Usar tipos de error est�ndar y proporcionar contexto
3. **Consumo de Recursos**: Reportar uso al Sustainability Monitor
4. **Validaci�n de Entrada**: Comprobar par�metros antes de operaciones costosas
5. **Retrocompatibilidad**: Mantener comportamiento documentado

## Evoluci�n y Versionado

### Ciclo de Vida de APIs

Las APIs internas evolucionan siguiendo estas fases:

1. **Experimental**: APIs en desarrollo, pueden cambiar sin previo aviso
2. **Beta**: APIs estables pero en prueba, depreciaci�n con aviso
3. **Estable**: APIs con compromiso de compatibilidad seg�n SemVer
4. **Obsoleta**: APIs marcadas para eliminaci�n futura
5. **Eliminada**: APIs removidas tras per�odo de transici�n

### Pol�ticas de Depreciaci�n

- Marcado claro con anotaciones `@deprecated`
- Per�odo m�nimo de 2 versiones menores antes de eliminaci�n
- Documentaci�n de alternativas y rutas de migraci�n
- Advertencias en tiempo de desarrollo y ejecuci�n

## Ap�ndice: Interfaces Comunes

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

// Informaci�n de error estandarizada
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

### Interfaces de Interacci�n

```typescript
// Rango de selecci�n
interface Range {
  start: Position;
  end: Position;
}

// Posici�n en documento
interface Position {
  line: number;
  column: number;
  offset?: number; // posici�n absoluta
}

// Configuraci�n de tema
interface ThemeConfig {
  colorScheme: 'light' | 'dark' | 'system';
  fontFamily?: string;
  fontSize?: number;
  spacing?: number;
  customColors?: Record<string, string>;
}
```