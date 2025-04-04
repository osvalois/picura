# Integración con GitHub y GitLab

## Descripción general

La integración de Picura con plataformas de control de versiones como GitHub y GitLab proporciona capacidades avanzadas de gestión de versiones, colaboración y flujos de trabajo para documentos. Esta integración permite a los usuarios trabajar con documentos en un flujo similar al desarrollo de software, manteniendo un enfoque sostenible y eficiente.

## Arquitectura de integración de control de versiones

La arquitectura de integración con servicios Git sigue un diseño que abstrae las complejidades de Git mientras expone funcionalidades potentes:

```
                                                       
                  Aplicación Picura                    
                         ,                             
                          
                         ¼                             
           Version Control Service Core                
                         ,                             
                          
                         ¼                             
         VersionControlProvider Interface              
    ,               ,                ,                 
                                    
    ¼             ¼              ¼                    
  GitHub       GitLab         Local      Proveedores  
  Provider     Provider      Provider   personalizados
                                                      
```

### Componentes principales

1. **Version Control Service Core**: Coordina todas las operaciones de control de versiones.
2. **VersionControlProvider Interface**: Define el contrato para todos los adaptadores de proveedores Git.
3. **Git Engine**: Implementa operaciones Git optimizadas para documentos.
4. **Workflow Manager**: Gestiona flujos de trabajo como pull requests y revisiones.
5. **Repository Optimizer**: Implementa estrategias para minimizar el uso de recursos en operaciones Git.

## Proveedores de control de versiones compatibles

| Proveedor | Integración completa | Pull Requests | Issues | Características específicas |
|-----------|---------------------|--------------|--------|----------------------------|
| Local Git |  | L | L | Repositorio local sin servidor remoto |
| GitHub    |  |  |  | Integración con GitHub Actions, Gists |
| GitLab    |  |  |  | Integración con CI/CD, Snippets |
| Azure DevOps |  |  |  | Integración con Boards, Pipelines |
| Bitbucket |  |  |  | Integración con Jira |

## Implementación técnica

### Interfaz VersionControlProvider

```typescript
interface VersionControlProvider {
  // Métodos de inicialización
  initialize(config: VCConfig): Promise<boolean>;
  getCapabilities(): VCCapabilities;
  
  // Operaciones básicas Git
  clone(remoteUrl: string, localPath: string, options?: CloneOptions): Promise<Repository>;
  getStatus(repoPath: string): Promise<StatusResult>;
  commit(repoPath: string, message: string, files: string[], options?: CommitOptions): Promise<CommitResult>;
  push(repoPath: string, options?: PushOptions): Promise<PushResult>;
  
  // Operaciones avanzadas
  createBranch(repoPath: string, branchName: string, options?: BranchOptions): Promise<Branch>;
  checkout(repoPath: string, branchName: string, options?: CheckoutOptions): Promise<CheckoutResult>;
  merge(repoPath: string, sourceBranch: string, options?: MergeOptions): Promise<MergeResult>;
  
  // Operaciones de plataforma
  createPullRequest(repoPath: string, options: PROptions): Promise<PullRequest>;
  listPullRequests(repoPath: string, options?: PRListOptions): Promise<PullRequest[]>;
  createIssue(repoPath: string, options: IssueOptions): Promise<Issue>;
  
  // Gestión de recursos y sostenibilidad
  getRepositorySize(repoPath: string): Promise<SizeStats>;
  setResourceConstraints(constraints: ResourceConstraints): void;
  getResourceMetrics(): ResourceMetrics;
}
```

### Implementación sostenible de Git

Utilizamos varios enfoques para optimizar las operaciones Git:

1. **Clonado superficial**: Solo descargamos la historia reciente necesaria.
2. **Checkout disperso**: Solo descargamos los directorios necesarios.
3. **Compresión adaptativa**: Ajustamos la compresión según las condiciones.

```typescript
// Ejemplo de implementación de clonado optimizado
async function optimizedClone(remoteUrl: string, localPath: string, options: OptimizedCloneOptions): Promise<Repository> {
  // Determinar profundidad óptima basada en el uso y recursos
  const depth = determineOptimalDepth(options.usage, systemResources);
  
  // Determinar sparse-checkout basado en los directorios relevantes
  const sparsePatterns = determineSparsePatterns(options.directories);
  
  // Ejecutar clone con parámetros optimizados
  const cloneResult = await this.gitClient.clone(remoteUrl, localPath, {
    depth: depth,
    shallow: true,
    sparseCheckout: true,
    sparseCheckoutPatterns: sparsePatterns,
    singleBranch: options.singleBranch || true,
    noTags: options.noTags || true
  });
  
  // Configurar el repositorio para futuras optimizaciones
  await configureRepositoryForEfficiency(localPath);
  
  return {
    path: localPath,
    resourceMetrics: {
      diskSpaceUsed: await getDiskUsage(localPath),
      transferredBytes: cloneResult.transferStats.receivedBytes,
      resourceSavings: calculateResourceSavings(cloneResult, fullCloneEstimate)
    }
  };
}
```

## Consideraciones de sostenibilidad

Las integraciones con GitHub y GitLab implementan varias estrategias para minimizar el impacto ambiental:

1. **Optimización de repositorios**:
   - Clonado superficial y disperso
   - Limpieza periódica de objetos innecesarios
   - Compresión de objetos Git grandes

2. **Reducción de transferencia de red**:
   - Operaciones parciales (shallow fetch/clone)
   - Agrupación de operaciones de red
   - Caché local de objetos frecuentes

3. **Uso eficiente de recursos**:
   - Operaciones Git en segundo plano con baja prioridad
   - Programación de operaciones intensivas para momentos óptimos
   - Limitación de operaciones simultáneas

### Métricas de sostenibilidad

El sistema registra y reporta:

- Reducción de tamaño de repositorio comparado con clonado completo
- Ahorro de transferencia de red por operaciones optimizadas
- Impacto energético estimado de operaciones Git

## Configuración y personalización

### Configuración básica

```json
{
  "versionControl": {
    "defaultProvider": "github",
    "providers": {
      "github": {
        "enabled": true,
        "tokenVariable": "GITHUB_TOKEN",
        "defaultUser": "username",
        "defaultEmail": "user@example.com"
      },
      "gitlab": {
        "enabled": false,
        "tokenVariable": "GITLAB_TOKEN",
        "defaultUser": "username",
        "defaultEmail": "user@example.com"
      }
    },
    "gitSettings": {
      "autoCommit": false,
      "commitIntervalMinutes": 15,
      "defaultCommitMessage": "Actualización automática desde Picura"
    },
    "sustainabilitySettings": {
      "shallowClone": true,
      "sparseCheckout": true,
      "deferPushOnLowBattery": true,
      "compressionLevel": "adaptive"
    }
  }
}
```

### Configuración avanzada

Los usuarios avanzados pueden configurar:

- Plantillas personalizadas para mensajes de commit
- Reglas para branches y flujos de trabajo
- Integración con CI/CD
- Optimizaciones específicas por repositorio

## Flujos de trabajo y patrones de uso

### Sincronización con repositorio

1. El usuario vincula un directorio con un repositorio remoto
2. El sistema clona el repositorio de manera optimizada
3. Los cambios locales se rastrean automáticamente
4. El usuario puede hacer commit y push desde la interfaz de Picura

### Flujo de trabajo con Pull Requests

1. El usuario crea una rama para una nueva sección o documento
2. Realiza cambios y commits en esta rama
3. Crea un Pull Request desde la interfaz de Picura
4. El sistema facilita la revisión y comentarios
5. Después de aprobación, se realiza el merge

### Colaboración en equipo

1. Múltiples autores trabajan en ramas separadas
2. El sistema gestiona la sincronización y resolución de conflictos
3. Los cambios se integran a través de pull requests
4. La revisión y aprobación sigue procesos definidos

## Implementación de autenticación y seguridad

### Autenticación segura

- Implementación de OAuth 2.0 para GitHub y GitLab
- Soporte para tokens de acceso personal con alcance limitado
- Autenticación con claves SSH
- Almacenamiento seguro de credenciales

### Flujo de autenticación OAuth

```
                                              
  Picura           Browser          GitHub/Lab
    ,                 ,                 ,     
         1. Iniciar auth                   
                        >                  
                           2. Auth request 
                                          >
                                           
                           3. Auth prompt  
                         <                 
                                           
                           4. User consent 
                                          >
                                           
                           5. Auth code    
                         <                 
         6. Auth code                      
     <                                     
                                           
              7. Exchange code for token    
                                             >
                                           
              8. Access token               
     <                                        
                                           
```

## Características avanzadas

### Integración con Issues y tareas

- Creación y gestión de issues desde Picura
- Conversión de comentarios y anotaciones en tareas
- Seguimiento de progreso y asignaciones

### Integración con CI/CD y validación

- Verificación automática de enlaces internos
- Comprobación ortográfica y gramatical
- Validación de formato y estructura

### Gestión de revisiones y comentarios

- Comentarios contextuales en línea
- Ciclo de revisión completo
- Notificaciones de cambios y solicitudes

## Rendimiento y optimización

### Métricas de rendimiento

| Operación | Implementación estándar | Implementación optimizada | Ahorro |
|-----------|-------------------------|---------------------------|--------|
| Clonado inicial (repo 500MB) | 500 MB transferidos | 50-100 MB transferidos | 80-90% |
| Push de cambios (10 archivos) | 10 operaciones separadas | 1 operación agrupada | 70-80% |
| Verificación de estado | Operación completa | Verificación incremental | 60-70% |

### Estrategias de optimización

1. **Operaciones incrementales**: Verificación y actualización solo de cambios
2. **Transferencia diferencial**: Solo enviar los deltas de cambios
3. **Paralelización inteligente**: Dividir operaciones grandes en paralelo cuando los recursos lo permiten

## Solución de problemas comunes

### Diagnóstico y recuperación

El sistema incluye herramientas para:

1. **Diagnóstico de problemas Git**: Identificar y resolver problemas comunes
2. **Recuperación de estado**: Restaurar a versiones anteriores seguras
3. **Resolución de conflictos**: Asistencia guiada para resolver conflictos de merge

## Referencias y documentación adicional

- [Servicio de control de versiones](../components/version-control-service.md)
- [Integración Git](../api/git-integration.md)
- [Puntos de extensión](../api/extension-points.md)
- [Tutorial: Sincronización con Git](../../user-docs/tutorials/sync-with-git.md)

## Uso del API para desarrolladores

Los desarrolladores pueden implementar proveedores personalizados mediante la interfaz `VersionControlProvider`:

```typescript
// Ejemplo de implementación de proveedor personalizado
class CustomVCProvider implements VersionControlProvider {
  // Implementación de métodos requeridos
  // ...
  
  // Registro en el sistema de plugins
  static register() {
    PluginSystem.registerProvider('versionControl', 'custom-provider', new CustomVCProvider());
  }
}
```

### Extensión para plataformas adicionales

Los desarrolladores pueden extender la funcionalidad básica para soportar:

- Servicios Git autohospedados
- Sistemas de control de versiones alternativos
- Integraciones con herramientas de gestión de proyectos

Para más detalles sobre la implementación de proveedores personalizados, consulte la [documentación del sistema de plugins](../api/plugin-system.md).