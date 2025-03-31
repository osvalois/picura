# Puntos de Extensi�n

## Visi�n General

Los puntos de extensi�n en Picura MD proporcionan interfaces bien definidas para ampliar la funcionalidad de la aplicaci�n de manera sostenible y segura. Est�n dise�ados para permitir personalizaciones y extensiones sin comprometer el rendimiento, la seguridad o la filosof�a de sostenibilidad del sistema.

## Categor�as de Puntos de Extensi�n

Picura MD ofrece puntos de extensi�n en las siguientes categor�as principales:

### 1. Extensiones de Contenido

Permiten extender la forma en que se procesa, visualiza y manipula el contenido Markdown.

### 2. Extensiones de UI

Extienden la interfaz de usuario con nuevos componentes, vistas y comandos.

### 3. Extensiones de Almacenamiento

Permiten integrar con sistemas de almacenamiento adicionales y formatos personalizados.

### 4. Extensiones de Integraci�n

Facilitan la conexi�n con servicios y herramientas externos.

### 5. Extensiones de Asistencia

Ampl�an las capacidades del asistente de IA integrado.

## Extensiones de Contenido

### Procesadores de Sintaxis Markdown

Extienden la sintaxis Markdown est�ndar con elementos personalizados.

```typescript
interface MarkdownSyntaxExtension {
  // Identificaci�n
  id: string;
  name: string;
  description: string;
  
  // Capacidades
  blockPatterns?: RegExp[];
  inlinePatterns?: RegExp[];
  
  // Procesadores
  processBlock(block: string, context: ProcessingContext): Promise<ProcessedBlock>;
  processInline?(inline: string, context: ProcessingContext): Promise<ProcessedInline>;
  
  // Recursos y dependencias
  getStylesheet?(): string;
  getScripts?(): string[];
  
  // Permisos y seguridad
  securityPolicy?: SecurityPolicy;
  
  // Sostenibilidad
  getSustainabilityProfile(): SustainabilityProfile;
}

interface SustainabilityProfile {
  processingComplexity: 'low' | 'medium' | 'high';
  adaptiveBehavior: boolean;
  resourceRequirements: {
    memory: 'minimal' | 'moderate' | 'substantial';
    computation: 'minimal' | 'moderate' | 'substantial';
    storage: 'minimal' | 'moderate' | 'substantial';
  };
}
```

**Ejemplo**: Extensi�n para diagramas simples

```typescript
// Procesador de diagramas ASCII a visualizaci�n SVG
const asciiDiagramProcessor: MarkdownSyntaxExtension = {
  id: 'ascii-diagrams',
  name: 'ASCII Diagrams',
  description: 'Convierte diagramas ASCII en visualizaciones SVG',
  
  blockPatterns: [/```diagram\n([\s\S]*?)```/g],
  
  async processBlock(block, context) {
    // Extraer contenido del diagrama
    const diagramContent = extractDiagramContent(block);
    
    // Adaptar procesamiento seg�n recursos disponibles
    const renderQuality = context.resources.constrained 
      ? 'simplified' 
      : 'detailed';
    
    // Convertir a SVG con nivel apropiado de detalle
    const svg = await generateSVG(diagramContent, {
      quality: renderQuality,
      maxSize: context.viewport.width * 0.9
    });
    
    return {
      type: 'custom-element',
      html: `<div class="diagram-container">${svg}</div>`,
      attributes: {
        'data-diagram-source': diagramContent,
        'data-diagram-type': 'ascii'
      }
    };
  },
  
  getSustainabilityProfile() {
    return {
      processingComplexity: 'medium',
      adaptiveBehavior: true,
      resourceRequirements: {
        memory: 'minimal',
        computation: 'moderate',
        storage: 'minimal'
      }
    };
  }
};
```

### Renderizadores Personalizados

Permiten visualizar contenido espec�fico de manera optimizada.

```typescript
interface CustomRenderer {
  id: string;
  name: string;
  supportedTypes: string[];
  
  canRender(content: ContentElement, context: RenderContext): boolean;
  render(content: ContentElement, context: RenderContext): Promise<RenderResult>;
  
  // Adaptaci�n seg�n recursos
  getVariants(): RenderVariant[];
  
  // Sostenibilidad
  getResourceProfile(): ResourceProfile;
}

interface RenderVariant {
  id: string;
  name: string;
  qualityLevel: 'basic' | 'standard' | 'high';
  resourceRequirements: ResourceRequirements;
}
```

**Ejemplo**: Renderizador de f�rmulas matem�ticas

```typescript
// Renderizador de f�rmulas matem�ticas con m�ltiples modos
const mathRenderer: CustomRenderer = {
  id: 'math-renderer',
  name: 'Math Formula Renderer',
  supportedTypes: ['math', 'equation', 'formula'],
  
  canRender(content, context) {
    return content.type === 'math' || 
           (content.type === 'code' && content.language === 'math');
  },
  
  async render(content, context) {
    // Determinar nivel de calidad seg�n contexto
    const variant = this.selectVariant(context.resources);
    
    // Estrategia adaptativa
    if (variant.id === 'basic') {
      // Renderizado simple con m�nimo procesamiento
      return this.renderBasicMath(content.content);
    } else if (variant.id === 'standard') {
      // Renderizado est�ndar
      return this.renderStandardMath(content.content);
    } else {
      // Renderizado avanzado con caracter�sticas adicionales
      return this.renderAdvancedMath(content.content, {
        interactive: true,
        highlightElements: true
      });
    }
  },
  
  getVariants() {
    return [
      {
        id: 'basic',
        name: 'B�sico',
        qualityLevel: 'basic',
        resourceRequirements: { cpu: 'minimal', memory: 'minimal' }
      },
      {
        id: 'standard',
        name: 'Est�ndar',
        qualityLevel: 'standard',
        resourceRequirements: { cpu: 'moderate', memory: 'moderate' }
      },
      {
        id: 'advanced',
        name: 'Avanzado',
        qualityLevel: 'high',
        resourceRequirements: { cpu: 'substantial', memory: 'moderate' }
      }
    ];
  },
  
  getResourceProfile() {
    return {
      adaptiveBehavior: true,
      minimumRequirements: { cpu: 'minimal', memory: '5MB' },
      optimumRequirements: { cpu: 'moderate', memory: '20MB' }
    };
  },
  
  // Implementaciones internas
  selectVariant(resources) {
    // Selecci�n basada en recursos disponibles
    if (resources.batteryLevel < 0.2 || resources.cpuAvailability < 0.3) {
      return this.getVariants()[0]; // b�sico
    } else if (resources.batteryLevel < 0.5 || resources.performance === 'limited') {
      return this.getVariants()[1]; // est�ndar
    } else {
      return this.getVariants()[2]; // avanzado
    }
  },
  
  renderBasicMath(formula) { /* ... */ },
  renderStandardMath(formula) { /* ... */ },
  renderAdvancedMath(formula, options) { /* ... */ }
};
```

### Exportadores de Contenido

Permiten exportar documentos a formatos adicionales.

```typescript
interface ContentExporter {
  id: string;
  name: string;
  description: string;
  fileExtension: string;
  mimeType: string;
  
  // Capacidades
  canExport(document: Document, context: ExportContext): boolean;
  export(document: Document, options: ExportOptions): Promise<ExportResult>;
  
  // Opciones espec�ficas soportadas
  getSupportedOptions(): ExportOptionDefinition[];
  
  // Sostenibilidad
  getResourceRequirements(): ResourceRequirements;
}
```

**Ejemplo**: Exportador a formato DOCX

```typescript
const docxExporter: ContentExporter = {
  id: 'docx-exporter',
  name: 'Microsoft Word Export',
  description: 'Exporta documentos a formato Microsoft Word (.docx)',
  fileExtension: 'docx',
  mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  canExport(document, context) {
    // Verificar si el documento es compatible
    return document.size < 10 * 1024 * 1024; // Limitar a 10MB para eficiencia
  },
  
  async export(document, options) {
    // Adaptar exportaci�n seg�n opciones y recursos
    const quality = options.quality || 'standard';
    const includeStyles = options.includeStyles !== false;
    
    // Implementar exportaci�n adaptativa seg�n recursos
    if (quality === 'draft') {
      // Modo r�pido con m�nimo formateo
      return this.generateSimplifiedDocx(document, options);
    } else {
      // Modo completo con todos los estilos
      return this.generateFullDocx(document, options);
    }
  },
  
  getSupportedOptions() {
    return [
      {
        id: 'quality',
        name: 'Calidad',
        type: 'select',
        options: [
          { id: 'draft', name: 'Borrador (r�pido)' },
          { id: 'standard', name: 'Est�ndar' },
          { id: 'high', name: 'Alta fidelidad' }
        ],
        default: 'standard'
      },
      {
        id: 'includeStyles',
        name: 'Incluir estilos',
        type: 'boolean',
        default: true
      }
    ];
  },
  
  getResourceRequirements() {
    return {
      memory: {
        minimum: '50MB',
        recommended: '100MB'
      },
      processing: {
        complexity: 'moderate',
        estimated: '2-5 seconds per document'
      }
    };
  }
};
```

## Extensiones de UI

### Comandos Personalizados

Permiten a�adir nuevas acciones al sistema de comandos.

```typescript
interface CustomCommand {
  id: string;
  name: string;
  description: string;
  
  // Definici�n
  keybinding?: KeyBinding;
  icon?: string;
  category?: string;
  
  // Ejecuci�n
  execute(context: CommandContext): Promise<void>;
  
  // Estado
  isEnabled(context: CommandContext): boolean;
  isVisible(context: CommandContext): boolean;
}

interface KeyBinding {
  mac?: string; // Ej: "cmd+shift+p"
  windows?: string; // Ej: "ctrl+shift+p" 
  linux?: string; // Ej: "ctrl+shift+p"
}
```

**Ejemplo**: Comando para an�lisis de documento

```typescript
const analyzeDocumentCommand: CustomCommand = {
  id: 'analyze-document',
  name: 'Analizar estructura del documento',
  description: 'Genera un an�lisis de la estructura y balance del documento actual',
  category: 'An�lisis',
  keybinding: {
    mac: 'cmd+shift+a',
    windows: 'ctrl+shift+a',
    linux: 'ctrl+shift+a'
  },
  icon: 'chart-bar',
  
  async execute(context) {
    // Verificar disponibilidad de recursos
    if (context.resources.batteryLevel < 0.15) {
      // En bater�a baja, mostrar advertencia
      await context.ui.showDialog({
        title: 'Bater�a baja',
        message: 'Esta operaci�n puede consumir energ�a. �Desea continuar?',
        buttons: ['Continuar', 'Cancelar'],
        defaultButton: 1
      });
    }
    
    // Implementar an�lisis adaptativo
    const document = await context.documents.getCurrentDocument();
    const analysisDetail = context.resources.performance === 'limited' ? 'basic' : 'detailed';
    
    // Realizar an�lisis con nivel apropiado de detalle
    const analysis = await analyzeDocument(document, {
      detail: analysisDetail,
      includeReadabilityMetrics: true,
      includeStructureBalance: true
    });
    
    // Mostrar resultados
    await context.ui.showPanel('analysis-results', {
      data: analysis,
      title: 'An�lisis de documento'
    });
  },
  
  isEnabled(context) {
    return context.editor.hasActiveDocument;
  },
  
  isVisible(context) {
    return context.user.preferences.advancedFeatures;
  }
};
```

### Vistas Personalizadas

Permiten a�adir nuevos paneles y visualizaciones.

```typescript
interface CustomView {
  id: string;
  name: string;
  description: string;
  
  // Ubicaci�n y presentaci�n
  location: 'sidebar' | 'panel' | 'modal' | 'statusbar';
  icon?: string;
  
  // Ciclo de vida
  initialize(container: HTMLElement, context: ViewContext): Promise<void>;
  update(props: ViewProps): Promise<void>;
  dispose(): Promise<void>;
  
  // Interacci�n con sistema
  onMessage(message: ViewMessage): Promise<void>;
  sendMessage(message: any): void;
  
  // Sostenibilidad
  getPriority(): 'background' | 'normal' | 'critical';
  getResourceProfile(): ResourceProfile;
}
```

**Ejemplo**: Panel de metadatos avanzados

```typescript
const metadataPanel: CustomView = {
  id: 'advanced-metadata',
  name: 'Metadatos Avanzados',
  description: 'Visualizaci�n y edici�n de metadatos extendidos del documento',
  location: 'sidebar',
  icon: 'tag',
  
  // Estado interno
  container: null,
  context: null,
  currentDocument: null,
  
  async initialize(container, context) {
    this.container = container;
    this.context = context;
    
    // Crear UI b�sica
    container.innerHTML = `
      <div class="metadata-panel">
        <div class="metadata-loading">Cargando metadatos...</div>
        <div class="metadata-content" style="display:none"></div>
      </div>
    `;
    
    // Suscribirse a eventos
    context.events.on('document-changed', this.handleDocumentChange.bind(this));
    
    // Cargar documento actual si existe
    if (context.editor.currentDocument) {
      await this.loadDocument(context.editor.currentDocument);
    }
  },
  
  async update(props) {
    // Actualizar estado o configuraci�n
    if (props.theme) {
      this.applyTheme(props.theme);
    }
    
    if (props.document && props.document !== this.currentDocument) {
      await this.loadDocument(props.document);
    }
  },
  
  async dispose() {
    // Limpieza al cerrar
    this.context.events.off('document-changed', this.handleDocumentChange);
    this.container = null;
    this.context = null;
    this.currentDocument = null;
  },
  
  async onMessage(message) {
    if (message.type === 'refresh') {
      await this.refreshMetadata();
    } else if (message.type === 'update-field') {
      await this.updateMetadataField(message.field, message.value);
    }
  },
  
  sendMessage(message) {
    // Comunicaci�n con sistema principal
    this.context.sendMessage(message);
  },
  
  // M�todos internos
  async loadDocument(document) {
    // Implementaci�n adaptativa seg�n recursos
    this.currentDocument = document;
    
    const contentDiv = this.container.querySelector('.metadata-content');
    const loadingDiv = this.container.querySelector('.metadata-loading');
    
    loadingDiv.style.display = 'block';
    contentDiv.style.display = 'none';
    
    try {
      // Adaptar nivel de detalle seg�n recursos
      const detailLevel = this.context.resources.constrained ? 'basic' : 'full';
      const metadata = await this.context.documents.getMetadata(document.id, { detail: detailLevel });
      
      // Renderizar con nivel apropiado de detalle
      contentDiv.innerHTML = this.renderMetadataHTML(metadata, detailLevel);
      
      // Configurar listeners para edici�n interactiva
      this.setupInteractiveElements(contentDiv, metadata);
      
    } catch (err) {
      contentDiv.innerHTML = `<div class="error">Error cargando metadatos: ${err.message}</div>`;
    } finally {
      loadingDiv.style.display = 'none';
      contentDiv.style.display = 'block';
    }
  },
  
  renderMetadataHTML(metadata, detailLevel) {
    // Implementar renderizado adaptativo seg�n nivel de detalle
    // ...
  },
  
  getPriority() {
    return 'normal'; // Prioridad est�ndar para UI secundaria
  },
  
  getResourceProfile() {
    return {
      memory: 'moderate',
      renderingComplexity: 'low',
      backgroundProcessing: false
    };
  }
};
```

### Elementos de Barra de Estado

Extienden la barra de estado con indicadores personalizados.

```typescript
interface StatusBarItem {
  id: string;
  name: string;
  
  // Ubicaci�n
  alignment: 'left' | 'right';
  priority: number; // 0-1000, mayor n�mero = mayor prioridad
  
  // Presentaci�n
  getText(): string;
  getTooltip?(): string;
  getColor?(): string;
  getIcon?(): string;
  
  // Interacci�n
  onClick?(): void;
  
  // Sostenibilidad
  getUpdateFrequency(): number; // milisegundos
  getImportance(): 'low' | 'medium' | 'high';
}
```

**Ejemplo**: Indicador de rendimiento sostenible

```typescript
const sustainabilityIndicator: StatusBarItem = {
  id: 'sustainability-indicator',
  name: 'Indicador de Sostenibilidad',
  alignment: 'right',
  priority: 300,
  
  // Estado interno
  currentScore: 0,
  sustainabilityMonitor: null,
  
  // Inicializaci�n (fuera de la interfaz)
  initialize(context) {
    this.sustainabilityMonitor = context.services.getSustainabilityMonitor();
    
    // Suscribirse a actualizaciones con frecuencia adaptativa
    const updateInterval = context.resources.batteryLevel < 0.3 ? 30000 : 10000;
    setInterval(() => this.updateMetrics(), updateInterval);
    
    // Carga inicial
    this.updateMetrics();
  },
  
  getText() {
    // Representaci�n visual eficiente
    const icon = this.getScoreIcon();
    return `${icon} ${this.currentScore}`;
  },
  
  getTooltip() {
    return `Puntuaci�n de sostenibilidad: ${this.currentScore}/100
Consumo estimado: ${this.currentUsage} mW
Clica para ver detalles`;
  },
  
  getColor() {
    // Color seg�n score
    if (this.currentScore > 80) return '#4CAF50';
    if (this.currentScore > 60) return '#8BC34A';
    if (this.currentScore > 40) return '#FFC107';
    if (this.currentScore > 20) return '#FF9800';
    return '#F44336';
  },
  
  onClick() {
    // Mostrar panel detallado de sostenibilidad
    this.context.commands.execute('sustainability.showDetailedReport');
  },
  
  getUpdateFrequency() {
    // Adaptativo seg�n bater�a y actividad
    if (this.context.resources.batteryCharging) return 5000;
    if (this.context.resources.batteryLevel < 0.2) return 60000;
    if (this.context.resources.userActive) return 10000;
    return 30000;
  },
  
  getImportance() {
    return 'medium';
  },
  
  // M�todos internos
  async updateMetrics() {
    try {
      const metrics = await this.sustainabilityMonitor.getCurrentMetrics();
      this.currentScore = metrics.sustainabilityScore;
      this.currentUsage = metrics.estimatedPowerUsage;
    } catch (err) {
      console.error('Error updating sustainability metrics', err);
    }
  },
  
  getScoreIcon() {
    if (this.currentScore > 80) return '<?';
    if (this.currentScore > 60) return '<C';
    if (this.currentScore > 40) return '<B';
    if (this.currentScore > 20) return '<A';
    return '=%';
  }
};
```

## Extensiones de Almacenamiento

### Proveedores de Almacenamiento

Permiten integrar con sistemas de almacenamiento adicionales.

```typescript
interface StorageProvider {
  id: string;
  name: string;
  description: string;
  
  // Capacidades
  capabilities: StorageCapability[];
  
  // Operaciones principales
  initialize(config: ProviderConfig): Promise<void>;
  read(path: string, options?: ReadOptions): Promise<StorageItem>;
  write(path: string, content: StorageContent, options?: WriteOptions): Promise<WriteResult>;
  delete(path: string): Promise<boolean>;
  list(directory: string, options?: ListOptions): Promise<StorageItemList>;
  
  // Operaciones opcionales
  move?(from: string, to: string): Promise<boolean>;
  copy?(from: string, to: string): Promise<boolean>;
  createDirectory?(path: string): Promise<boolean>;
  
  // Metadatos
  getMetadata?(path: string): Promise<StorageItemMetadata>;
  setMetadata?(path: string, metadata: Partial<StorageItemMetadata>): Promise<boolean>;
  
  // Estado
  getStatus(): StorageProviderStatus;
  
  // Sostenibilidad
  getResourceFootprint(): ResourceFootprint;
}
```

**Ejemplo**: Proveedor de almacenamiento en Dropbox

```typescript
const dropboxStorageProvider: StorageProvider = {
  id: 'dropbox-storage',
  name: 'Dropbox',
  description: 'Almacenamiento en Dropbox con sincronizaci�n eficiente',
  
  capabilities: [
    'read',
    'write',
    'delete',
    'list',
    'move',
    'copy',
    'metadata',
    'offline'
  ],
  
  // Estado interno
  client: null,
  config: null,
  offlineMode: false,
  offlineCache: new Map(),
  
  async initialize(config) {
    this.config = config;
    
    // Inicializar cliente con configuraciones adaptativas
    this.client = await createDropboxClient({
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      
      // Configuraciones adaptativas
      maxRetries: 3,
      timeoutMs: 15000,
      concurrentRequests: config.resourceProfile === 'limited' ? 2 : 5,
      
      // Configurar capacidades offline
      enableOfflineSupport: true,
      offlineCacheSize: config.offlineCacheSize || '50MB',
      
      // Opciones de sostenibilidad
      batchOperations: true,
      transferCompression: true
    });
    
    // Verificar conectividad
    try {
      await this.client.checkConnection();
      this.offlineMode = false;
    } catch (err) {
      // Iniciar en modo offline si no hay conexi�n
      console.log('Iniciando Dropbox en modo offline');
      this.offlineMode = true;
    }
    
    // Configurar monitoreo de red para adaptaci�n
    this.setupNetworkMonitoring();
  },
  
  async read(path, options = {}) {
    // Estrategia adaptativa seg�n modo online/offline
    if (this.offlineMode) {
      return this.readFromOfflineCache(path, options);
    }
    
    try {
      // Implementar lectura eficiente
      const response = await this.client.files.download({
        path: this.normalizePath(path),
        useCache: options.useCache !== false
      });
      
      // Actualizar cach� offline si est� habilitado
      if (options.updateOfflineCache !== false) {
        await this.updateOfflineCache(path, response);
      }
      
      return {
        content: response.fileBlob,
        metadata: {
          name: response.name,
          size: response.size,
          modifiedAt: response.server_modified,
          contentType: response.contentType
        }
      };
    } catch (err) {
      // Intentar recuperar desde cach� offline en caso de error
      if (this.offlineCache.has(path)) {
        this.offlineMode = true; // Cambiar a modo offline
        return this.readFromOfflineCache(path, options);
      }
      throw err;
    }
  },
  
  // Implementaciones de otras operaciones con enfoque sostenible...
  
  getStatus() {
    return {
      connected: !this.offlineMode,
      mode: this.offlineMode ? 'offline' : 'online',
      spaceUsage: this.spaceUsage,
      syncStatus: this.syncStatus
    };
  },
  
  getResourceFootprint() {
    return {
      networkUsage: {
        average: this.stats.averageNetworkUsage,
        optimizationRate: this.stats.networkOptimizationRate
      },
      processingOverhead: 'low',
      storageEfficiency: 'high',
      batteryImpact: this.offlineMode ? 'minimal' : 'low'
    };
  }
};
```

### Formatos de Documento Personalizados

Permiten soporte para formatos de archivo adicionales.

```typescript
interface DocumentFormat {
  id: string;
  name: string;
  extensions: string[];
  mimeTypes: string[];
  
  // Conversi�n
  importFromFormat(content: Buffer, options?: ImportOptions): Promise<DocumentContent>;
  exportToFormat(document: DocumentContent, options?: ExportOptions): Promise<Buffer>;
  
  // Detecci�n
  canImport(fileInfo: FileInfo): boolean;
  
  // Metadatos
  extractMetadata(content: Buffer): Promise<DocumentMetadata>;
  
  // Sostenibilidad
  getConversionEfficiency(): ConversionEfficiency;
}
```

**Ejemplo**: Soporte para formato AsciiDoc

```typescript
const asciiDocFormat: DocumentFormat = {
  id: 'asciidoc-format',
  name: 'AsciiDoc',
  extensions: ['.adoc', '.asciidoc', '.asc'],
  mimeTypes: ['text/x-asciidoc'],
  
  async importFromFormat(content, options) {
    // Configurar nivel de conversi�n seg�n recursos
    const conversionLevel = options?.resourceLevel || 
                          (this.context.resources.constrained ? 'basic' : 'complete');
    
    // Convertir de AsciiDoc a Markdown con nivel apropiado de fidelidad
    return await this.convertAsciiDocToMarkdown(content, {
      preserveAttributes: conversionLevel !== 'basic',
      convertTables: true,
      convertAdmonitions: conversionLevel === 'complete',
      processIncludes: options?.processIncludes !== false && conversionLevel === 'complete'
    });
  },
  
  async exportToFormat(document, options) {
    // Conversi�n adaptativa de Markdown a AsciiDoc
    const conversionQuality = options?.quality || 
                            (this.context.resources.batteryLevel < 0.3 ? 'draft' : 'standard');
    
    // Adaptar nivel de detalle seg�n calidad
    return await this.convertMarkdownToAsciiDoc(document.content, {
      generateToc: conversionQuality !== 'draft',
      optimizeImages: options?.optimizeImages !== false,
      resolveLinks: conversionQuality === 'high',
      preserveComments: conversionQuality !== 'draft'
    });
  },
  
  canImport(fileInfo) {
    // Verificar si puede importar el archivo
    return this.extensions.includes(fileInfo.extension.toLowerCase()) ||
           this.mimeTypes.includes(fileInfo.mimeType);
  },
  
  async extractMetadata(content) {
    // Extraer metadatos del documento AsciiDoc
    const headerContent = content.toString('utf8', 0, Math.min(content.length, 8192));
    
    // Implementar extracci�n adaptativa seg�n tama�o
    if (content.length > 1024 * 1024) {
      // Para documentos grandes, extracci�n b�sica
      return this.extractBasicMetadata(headerContent);
    } else {
      // Para documentos normales, extracci�n completa
      return this.extractDetailedMetadata(content.toString('utf8'));
    }
  },
  
  getConversionEfficiency() {
    return {
      importComplexity: 'medium',
      exportComplexity: 'medium',
      preservesFormatting: 'high',
      preservesStructure: 'high',
      roundTripQuality: 'good'
    };
  }
};
```

## Extensiones de Integraci�n

### Integraciones con Servicios

Permiten conectar con servicios externos manteniendo los principios de sostenibilidad.

```typescript
interface ServiceIntegration {
  id: string;
  name: string;
  description: string;
  
  // Autenticaci�n
  authenticate(options?: AuthOptions): Promise<AuthResult>;
  refreshAuth?(): Promise<AuthResult>;
  logout(): Promise<void>;
  
  // Capacidades
  getCapabilities(): ServiceCapability[];
  
  // Operaciones
  executeOperation(operation: string, params: any): Promise<OperationResult>;
  
  // Estado
  getConnectionStatus(): ConnectionStatus;
  
  // Sostenibilidad
  getNetworkEfficiency(): NetworkEfficiency;
  configureResourceUsage(profile: ResourceProfile): void;
}
```

**Ejemplo**: Integraci�n con servicio de an�lisis de texto

```typescript
const textAnalysisService: ServiceIntegration = {
  id: 'text-analysis-service',
  name: 'Servicio de An�lisis de Texto',
  description: 'Proporciona an�lisis avanzado de texto con optimizaci�n de recursos',
  
  // Estado interno
  authToken: null,
  authExpiry: null,
  pendingOperations: new Map(),
  queuedOperations: [],
  batchTimer: null,
  
  async authenticate(options) {
    // Implementar autenticaci�n eficiente
    this.authToken = await this.performAuth(options);
    this.authExpiry = Date.now() + 3600000; // 1 hora
    
    return {
      success: true,
      expiresAt: this.authExpiry
    };
  },
  
  async logout() {
    // Limpiar estado y cancelar operaciones pendientes
    this.cancelAllOperations();
    this.authToken = null;
    this.authExpiry = null;
  },
  
  getCapabilities() {
    return [
      'text-analysis',
      'sentiment-analysis',
      'entity-recognition',
      'language-detection',
      'summarization',
      'offline-analysis'
    ];
  },
  
  async executeOperation(operation, params) {
    // Verificar disponibilidad de recursos
    const networkStatus = await this.context.network.getStatus();
    const batteryLevel = this.context.resources.batteryLevel;
    
    // Estrategia adaptativa seg�n condiciones
    if (networkStatus.type === 'metered' || batteryLevel < 0.2) {
      // En recursos limitados, intentar procesamiento local
      if (this.canProcessLocally(operation)) {
        return this.executeLocalOperation(operation, params);
      }
      
      // Si es necesario procesamiento remoto y no es cr�tico, ofrecer diferir
      if (!params.critical) {
        const shouldDefer = await this.context.ui.confirmResourceUse({
          title: 'Red medida detectada',
          message: 'Esta operaci�n requiere conexi�n a internet. �Desea proceder o programar para m�s tarde?',
          options: ['Proceder', 'Programar para WiFi']
        });
        
        if (shouldDefer === 'Programar para WiFi') {
          return this.queueForLater(operation, params);
        }
      }
    }
    
    // Estrategia de lotes para operaciones similares
    if (this.canBatch(operation) && !params.immediate) {
      return this.addToBatch(operation, params);
    }
    
    // Ejecuci�n normal con optimizaciones
    return this.executeRemoteOperation(operation, params, {
      compression: true,
      timeout: networkStatus.quality === 'poor' ? 30000 : 15000,
      retry: networkStatus.stable ? 1 : 3
    });
  },
  
  getConnectionStatus() {
    return {
      connected: !!this.authToken && Date.now() < this.authExpiry,
      expiresIn: this.authExpiry ? Math.max(0, this.authExpiry - Date.now()) : 0,
      operationsPending: this.pendingOperations.size,
      operationsQueued: this.queuedOperations.length
    };
  },
  
  getNetworkEfficiency() {
    return {
      batchingSupport: true,
      compressionRate: 0.6, // 60% reducci�n promedio
      cachingStrategy: 'aggressive',
      offlineCapabilities: ['basic-analysis'],
      bandwidthUsage: 'optimized'
    };
  },
  
  configureResourceUsage(profile) {
    // Adaptar comportamiento seg�n perfil de recursos
    this.batchingEnabled = profile !== 'critical';
    this.batchInterval = profile === 'conservative' ? 60000 : 20000;
    this.maxConcurrentRequests = profile === 'conservative' ? 1 : 3;
    this.compressionLevel = profile === 'aggressive' ? 9 : 6;
    
    // Aplicar configuraci�n
    this.updateBatchingBehavior();
  }
};
```

### Extensiones para Control de Versiones

Ampl�an la funcionalidad del sistema de control de versiones.

```typescript
interface VersionControlExtension {
  id: string;
  name: string;
  
  // Capacidades
  supportedOperations: VersionControlOperation[];
  
  // Transformaciones
  transformCommitMessage?(message: string, context: CommitContext): Promise<string>;
  prepareCommit?(files: FileChange[], context: CommitContext): Promise<FileChange[]>;
  postCommit?(result: CommitResult, context: CommitContext): Promise<void>;
  
  // Hooks
  preCommit?(context: CommitContext): Promise<boolean>;
  prePush?(context: PushContext): Promise<boolean>;
  
  // Visualizaci�n
  enhanceHistoryView?(historyEntries: HistoryEntry[], context: HistoryContext): Promise<EnhancedHistoryEntry[]>;
  
  // Sostenibilidad
  getOperationImpact(): OperationImpact;
}
```

**Ejemplo**: Linting de commits

```typescript
const commitLinter: VersionControlExtension = {
  id: 'commit-linter',
  name: 'Linter de mensajes de commit',
  supportedOperations: ['commit'],
  
  async preCommit(context) {
    // Validar mensaje de commit con reglas configuradas
    const commitMsg = context.commitMessage;
    
    // Ajustar nivel de validaci�n seg�n contexto
    const validationLevel = context.resources.constrained ? 'basic' : 'complete';
    
    if (validationLevel === 'basic') {
      // Validaci�n m�nima para ahorrar recursos
      return this.validateBasicRules(commitMsg);
    } else {
      // Validaci�n completa
      return this.validateAllRules(commitMsg, context);
    }
  },
  
  async transformCommitMessage(message, context) {
    // Mejorar mensaje de commit
    
    // En modo de bajo recurso, cambios m�nimos
    if (context.resources.batteryLevel < 0.2) {
      return this.applyBasicFormatting(message);
    }
    
    // Transformaci�n completa en condiciones normales
    const enhancedMessage = await this.enhanceCommitMessage(message, {
      addScope: context.preferences.addCommitScope,
      spellCheck: context.preferences.spellCheckCommits,
      ensureConvention: true
    });
    
    return enhancedMessage;
  },
  
  getOperationImpact() {
    return {
      preCommit: 'low',
      transformCommitMessage: 'low',
      adaptiveBehavior: true
    };
  },
  
  // Implementaciones internas
  validateBasicRules(commitMsg) {
    // Reglas m�nimas: longitud y formato b�sico
    const hasValidLength = commitMsg.length > 10 && commitMsg.split('\n')[0].length < 72;
    const hasValidFormat = /^[a-z]+(\([a-z-]+\))?: .+/.test(commitMsg);
    
    return hasValidLength && hasValidFormat;
  },
  
  async validateAllRules(commitMsg, context) {
    // Reglas completas incluyendo convenciones, referencias, etc.
    // ...
  }
};
```

## Extensiones de Asistencia

### Proveedores de Asistencia IA

Extienden las capacidades del asistente de IA integrado.

```typescript
interface AIAssistanceProvider {
  id: string;
  name: string;
  
  // Capacidades
  capabilities: AICapability[];
  
  // Operaciones principales
  initialize(config: AIProviderConfig): Promise<void>;
  
  provideSuggestions(context: DocumentContext, options?: SuggestionOptions): Promise<AISuggestion[]>;
  analyzeText(text: string, analysisType: AnalysisType, options?: AnalysisOptions): Promise<AnalysisResult>;
  generateContent(prompt: string, options?: GenerationOptions): Promise<GeneratedContent>;
  
  // Retroalimentaci�n
  provideFeedback(suggestionId: string, wasHelpful: boolean, details?: string): Promise<void>;
  
  // Sostenibilidad
  getProcessingMode(): 'local' | 'hybrid' | 'remote';
  getResourceProfile(): AIResourceProfile;
  setResourceConstraints(constraints: ResourceConstraints): void;
}
```

**Ejemplo**: Proveedor local de asistencia ling��stica

```typescript
const localLanguageAssistant: AIAssistanceProvider = {
  id: 'local-language-assistant',
  name: 'Asistente Ling��stico Local',
  
  capabilities: [
    'grammar-checking',
    'style-suggestions',
    'spelling-correction',
    'basic-rephrasing'
  ],
  
  // Estado interno
  models: new Map(),
  activeModels: new Set(),
  
  async initialize(config) {
    // Cargar modelos apropiados seg�n configuraci�n y recursos
    const deviceCapacity = await this.estimateDeviceCapacity();
    
    // Seleccionar modelos seg�n capacidad
    if (deviceCapacity === 'high') {
      // Dispositivos potentes: cargar modelos completos
      await this.loadModels(['grammar-full', 'style-full', 'spelling-full']);
    } else if (deviceCapacity === 'medium') {
      // Dispositivos medios: modelos balanceados
      await this.loadModels(['grammar-balanced', 'style-light', 'spelling-full']);
    } else {
      // Dispositivos limitados: modelos m�nimos
      await this.loadModels(['grammar-light', 'spelling-basic']);
    }
    
    // Configurar comportamiento adaptativo
    this.setupAdaptiveBehavior(config.adaptationPreferences);
  },
  
  async provideSuggestions(context, options) {
    // Determinar qu� capacidades utilizar seg�n contexto y recursos
    const availableModels = this.determineAvailableModels();
    const suggestions = [];
    
    // Adaptaci�n a recursos actuales
    if (this.context.resources.batteryLevel < 0.15 && !this.context.resources.charging) {
      // En bater�a cr�tica, solo correcciones b�sicas
      if (availableModels.has('spelling-basic')) {
        const spellingResults = await this.runSpellingCheck(context.text, 'basic');
        suggestions.push(...spellingResults);
      }
    } else {
      // Operaci�n normal con adaptaci�n
      const priorityList = this.prioritizeSuggestionTypes(context, options);
      
      // Generar sugerencias por prioridad hasta l�mite o recursos
      for (const type of priorityList) {
        if (suggestions.length >= (options?.limit || 10)) break;
        
        const model = this.getModelForType(type);
        if (model && this.canRunModel(model)) {
          const typeResults = await this.generateSpecificSuggestions(context, type, model);
          suggestions.push(...typeResults);
        }
      }
    }
    
    return this.deduplicateAndRank(suggestions);
  },
  
  async analyzeText(text, analysisType, options) {
    // Implementar an�lisis eficiente y adaptativo
    const model = this.getModelForAnalysis(analysisType);
    
    // Adaptar complejidad seg�n opciones y recursos
    const complexity = options?.depth || 
                     (this.context.resources.performance === 'limited' ? 'basic' : 'standard');
    
    // En bater�a muy baja, ofrecer aplazar an�lisis complejo
    if (complexity !== 'basic' && 
        this.context.resources.batteryLevel < 0.1 && 
        !this.context.resources.charging) {
      throw new Error('resource_constrained');
    }
    
    // Ejecutar an�lisis con nivel apropiado
    return this.executeAnalysis(text, analysisType, model, complexity);
  },
  
  getProcessingMode() {
    return 'local'; // Procesamiento completamente local
  },
  
  getResourceProfile() {
    return {
      memoryFootprint: {
        idle: '20-50MB',
        active: '50-150MB'
      },
      processingIntensity: 'moderate',
      batteryImpact: 'low-moderate',
      adaptiveBehavior: true,
      storageFooptrint: '100-300MB'
    };
  },
  
  setResourceConstraints(constraints) {
    // Adaptar comportamiento seg�n restricciones
    if (constraints.memoryLimit) {
      this.adjustMemoryUsage(constraints.memoryLimit);
    }
    
    if (constraints.processingLimit) {
      this.adjustProcessingIntensity(constraints.processingLimit);
    }
    
    if (constraints.batteryConservation) {
      this.enableBatteryConservation(constraints.batteryConservation);
    }
  },
  
  // Implementaciones internas
  async loadModels(modelIds) {
    // Cargar modelos eficientemente
    for (const modelId of modelIds) {
      if (!this.models.has(modelId)) {
        // Cargar modelo desde almacenamiento local
        const model = await this.loadModelFromStorage(modelId);
        this.models.set(modelId, model);
      }
    }
  },
  
  determineAvailableModels() {
    // Determinar modelos disponibles seg�n recursos actuales
    const availableMemory = this.context.resources.availableMemory;
    const availableModels = new Map();
    
    // Priorizar modelos por importancia y requisitos
    for (const [id, model] of this.models.entries()) {
      if (model.memoryRequirement <= availableMemory * 0.7) {
        availableModels.set(id, model);
      }
    }
    
    return availableModels;
  }
};
```

### Extensiones de An�lisis de Documento

A�aden capacidades de an�lisis especializado a documentos.

```typescript
interface DocumentAnalyzer {
  id: string;
  name: string;
  analysisTypes: string[];
  
  // An�lisis
  canAnalyze(document: Document, type: string): boolean;
  analyze(document: Document, type: string, options?: AnalysisOptions): Promise<AnalysisResult>;
  
  // UI
  getAnalysisView(result: AnalysisResult): AnalysisView;
  
  // Sostenibilidad
  getAnalysisComplexity(document: Document, type: string): AnalysisComplexity;
  getResourceRequirements(type: string): ResourceRequirements;
}
```

**Ejemplo**: Analizador de legibilidad de documentos

```typescript
const readabilityAnalyzer: DocumentAnalyzer = {
  id: 'readability-analyzer',
  name: 'Analizador de Legibilidad',
  analysisTypes: ['readability', 'complexity', 'clarity', 'audience-fit'],
  
  canAnalyze(document, type) {
    // Verificar si puede analizar este tipo de documento y an�lisis
    return this.analysisTypes.includes(type) && 
           document.contentType === 'markdown' &&
           document.content.length > 0;
  },
  
  async analyze(document, type, options) {
    // Configurar nivel de an�lisis seg�n recursos
    const analysisDepth = this.determineAnalysisDepth(document, options);
    
    // Para documentos muy grandes, ofrecer an�lisis parcial
    let content = document.content;
    let isPartialAnalysis = false;
    
    if (content.length > 50000 && analysisDepth !== 'comprehensive') {
      // En an�lisis no exhaustivo, limitar tama�o para eficiencia
      content = content.substring(0, 15000) + '\n\n' + 
                this.selectRepresentativeSections(content, 15000);
      isPartialAnalysis = true;
    }
    
    // Ejecutar an�lisis apropiado
    let result;
    switch (type) {
      case 'readability':
        result = await this.analyzeReadability(content, analysisDepth);
        break;
      case 'complexity':
        result = await this.analyzeComplexity(content, analysisDepth);
        break;
      case 'clarity':
        result = await this.analyzeClarity(content, analysisDepth);
        break;
      case 'audience-fit':
        result = await this.analyzeAudienceFit(content, analysisDepth, options?.audience);
        break;
      default:
        throw new Error(`Unsupported analysis type: ${type}`);
    }
    
    return {
      ...result,
      isPartialAnalysis,
      analyzedCharacters: content.length,
      totalCharacters: document.content.length,
      analysisDepth
    };
  },
  
  getAnalysisView(result) {
    // Adaptar visualizaci�n seg�n tipo de resultado
    switch (result.type) {
      case 'readability':
        return this.createReadabilityView(result);
      case 'complexity':
        return this.createComplexityView(result);
      case 'clarity':
        return this.createClarityView(result);
      case 'audience-fit':
        return this.createAudienceFitView(result);
      default:
        return this.createGenericView(result);
    }
  },
  
  getAnalysisComplexity(document, type) {
    // Calcular complejidad basada en tama�o y tipo
    const contentSize = document.content.length;
    
    if (contentSize < 5000) {
      return 'low';
    } else if (contentSize < 20000) {
      return 'medium';
    } else {
      return 'high';
    }
  },
  
  getResourceRequirements(type) {
    // Requisitos espec�ficos seg�n tipo de an�lisis
    switch (type) {
      case 'readability':
        return { 
          cpu: 'low', 
          memory: 'low', 
          timeEstimate: 'fast' 
        };
      case 'complexity':
        return { 
          cpu: 'medium', 
          memory: 'low', 
          timeEstimate: 'moderate' 
        };
      case 'clarity':
        return { 
          cpu: 'medium', 
          memory: 'medium', 
          timeEstimate: 'moderate' 
        };
      case 'audience-fit':
        return { 
          cpu: 'high', 
          memory: 'medium', 
          timeEstimate: 'slow' 
        };
      default:
        return { 
          cpu: 'medium', 
          memory: 'medium', 
          timeEstimate: 'moderate' 
        };
    }
  },
  
  // Implementaciones internas
  determineAnalysisDepth(document, options) {
    // Determinar profundidad seg�n opciones, tama�o y recursos
    if (options?.depth) return options.depth;
    
    const contentSize = document.content.length;
    const batteryLevel = this.context.resources.batteryLevel;
    const performance = this.context.resources.performance;
    
    if (batteryLevel < 0.2 || performance === 'limited') {
      return 'basic';
    } else if (contentSize > 100000 || batteryLevel < 0.5) {
      return 'standard';
    } else {
      return 'comprehensive';
    }
  }
};
```

## Registro y Gesti�n de Extensiones

### Registro de Extensiones

Las extensiones se registran con el sistema a trav�s de puntos de registro espec�ficos:

```typescript
// Registro de extensi�n para sintaxis Markdown personalizada
picura.extensions.markdown.register(asciiDiagramProcessor);

// Registro de exportador personalizado
picura.extensions.export.register(docxExporter);

// Registro de comando personalizado
picura.extensions.commands.register(analyzeDocumentCommand);

// Registro de proveedor de almacenamiento
picura.extensions.storage.register(dropboxStorageProvider);
```

### Habilitaci�n/Deshabilitaci�n Din�mica

Las extensiones pueden ser habilitadas o deshabilitadas din�micamente seg�n necesidad y recursos:

```typescript
// Deshabilitar temporalmente una extensi�n intensiva en recursos
picura.extensions.disable('math-renderer', { 
  reason: 'battery_conservation', 
  temporary: true 
});

// Rehabilitar cuando los recursos est�n disponibles
picura.extensions.enable('math-renderer');

// Verificar disponibilidad
const isAvailable = picura.extensions.isEnabled('math-renderer');
```

### Gesti�n Adaptativa de Recursos

El sistema gestiona autom�ticamente las extensiones seg�n disponibilidad de recursos:

```typescript
// El sistema prioriza extensiones seg�n pol�ticas y estado de recursos
picura.resourceManager.applyPolicy('battery_critical', {
  disableExtensions: ['high_resource_extensions'],
  limitExtensions: {
    'medium_resource_extensions': 'basic_mode'
  },
  notifyUser: true
});

// Las extensiones pueden adaptarse a recursos disponibles
picura.resourceManager.getResourceConstraints().then(constraints => {
  // Adaptar comportamiento interno seg�n restricciones
  myExtension.adaptToResources(constraints);
});
```

## Directrices para Desarrolladores de Extensiones

### Principios de Sostenibilidad

Los desarrolladores de extensiones deben seguir estos principios:

1. **Adaptabilidad a Recursos**: Implementar niveles de servicio seg�n recursos disponibles
2. **Procesamiento Eficiente**: Optimizar algoritmos y minimizar overhead
3. **Carga Bajo Demanda**: Cargar recursos solo cuando sea necesario
4. **Descarga Proactiva**: Liberar recursos cuando no sean necesarios
5. **Transparencia**: Proporcionar informaci�n clara sobre requisitos y adaptabilidad

### Mejores Pr�cticas

1. **Perfiles de Recursos**: Definir claramente los requisitos de recursos de la extensi�n
2. **Modos Adaptativos**: Implementar diferentes modos seg�n disponibilidad de recursos
3. **Procesamiento As�ncrono**: Usar procesamiento en segundo plano para tareas intensivas
4. **Comunicaci�n Eficiente**: Minimizar intercambio de datos entre componentes
5. **Pruebas de Rendimiento**: Validar impacto en recursos antes de distribuci�n

### Seguridad y Aislamiento

1. **Verificaci�n de Entradas**: Validar y sanitizar todas las entradas
2. **Permisos M�nimos**: Solicitar solo los permisos necesarios
3. **Aislamiento de Estado**: Evitar interferencia con otras extensiones
4. **Manejo de Errores**: Implementar recuperaci�n robusta ante fallos
5. **Transparencia de Operaciones**: Informaci�n clara sobre acciones realizadas

## Evoluci�n y Compatibilidad

### Versionado de Puntos de Extensi�n

Los puntos de extensi�n siguen un versionado sem�ntico:

```typescript
// Especificar versi�n de API requerida
const myExtension = {
  apiVersion: '1.2',
  id: 'my-extension',
  // ...
};
```

### Degradaci�n Elegante

Las extensiones deben implementar degradaci�n elegante para mantener compatibilidad:

```typescript
// Verificar disponibilidad de caracter�sticas
if (picura.features.isAvailable('advanced-rendering')) {
  // Usar caracter�sticas avanzadas
} else {
  // Implementar alternativa compatible
}
```

### Migraci�n y Actualizaci�n

El sistema proporciona herramientas para migraci�n cuando los puntos de extensi�n evolucionan:

```typescript
// Herramientas para migrar extensiones entre versiones
picura.extensions.migrate('my-extension', {
  fromVersion: '1.0',
  toVersion: '2.0',
  transformations: [
    // Reglas de transformaci�n para adaptarse a nueva API
  ]
});
```

## Referencias

- [Sistema de Plugins](plugin-system.md): Informaci�n sobre el framework completo para plugins
- [Integraci�n con Git](git-integration.md): Detalles sobre integraci�n con sistemas de control de versiones
- [Servicios Remotos](remote-services.md): Informaci�n sobre integraci�n con servicios externos
- [APIs Internas](internal-apis.md): Documentaci�n de APIs internas para desarrollo de componentes