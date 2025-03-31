# Notas de Lanzamiento

## Picura MD 0.5.0

*Fecha de lanzamiento: 30 de marzo de 2024*

### Resumen

Nos complace presentar Picura MD 0.5.0, una versión preliminar que establece las bases de nuestra visión de una plataforma de gestión documental sostenible. Esta versión incluye el núcleo funcional del editor Markdown, capacidades básicas de sincronización, y nuestro innovador monitor de sostenibilidad para optimizar el uso de recursos.

### Nuevas Características

#### Editor Markdown

![Editor Markdown](../assets/images/editor-screenshot.png)

El editor Markdown incluye:

- Soporte para sintaxis Markdown extendida, incluyendo tablas, listas de tareas y notas al pie
- Vista previa en tiempo real con renderizado optimizado
- Tema claro/oscuro/automático que se adapta a las preferencias del sistema
- Autocompletado inteligente para enlaces, imágenes y referencias
- Marcado de sintaxis con resaltado personalizable

#### Sistema de Sincronización

Implementación inicial del sistema de sincronización con:

- Almacenamiento local persistente con respaldo automático
- Soporte para sincronización básica con GitHub
- Sistema de resolución de conflictos para cambios concurrentes
- Sincronización diferencial para minimizar transferencia de datos

#### Visor de Documentos

![Visor de Documentos](../assets/images/viewer-screenshot.png)

- Modo de lectura optimizado con ajustes de legibilidad
- Opciones de personalización de fuente y espaciado
- Navegación por encabezados y tabla de contenidos automática
- Modo de enfoque para minimizar distracciones

#### Asistente de IA Local

- Ayuda contextual basada en el contenido del documento
- Sugerencias para mejorar la legibilidad y estructura
- Procesamiento local para preservar privacidad y reducir consumo de recursos
- Integración opcional con servicios de IA en la nube

#### Métricas de Sostenibilidad

![Dashboard de Sostenibilidad](../assets/images/sustainability-dashboard.png)

- Monitor de consumo de recursos en tiempo real
- Métricas de eficiencia energética comparativas
- Optimizaciones automáticas para preservar batería
- Recomendaciones para reducir el impacto ambiental

### Mejoras de Sostenibilidad

Esta versión establece nuestra base para una gestión documental sostenible:

- **Optimización de Batería**: Detección automática de uso con batería y ajuste de operaciones intensivas.
- **Uso Eficiente de CPU**: Algoritmos optimizados para minimizar ciclos de procesamiento.
- **Gestión de Memoria**: Uso eficiente de memoria con liberación proactiva de recursos.
- **Optimización de Red**: Transferencia diferencial y compresión adaptativa para minimizar tráfico.
- **Almacenamiento Eficiente**: Compresión inteligente basada en patrones de acceso y uso.

Todas estas optimizaciones son transparentes para el usuario, manteniendo una experiencia fluida mientras se reduce significativamente el consumo de recursos.

### Mejoras Técnicas

#### Arquitectura Base

Hemos establecido una arquitectura modular con:

- Sistema de componentes con interfaces bien definidas
- Patrón de eventos para comunicación eficiente entre módulos
- Pipeline de procesamiento optimizado para documentos
- Sistema de extensiones para funcionalidades adicionales

#### Sistema de Plugins

La arquitectura de plugins permite:

- Cargar/descargar plugins dinámicamente
- Extender la funcionalidad sin modificar el núcleo
- Sistema de permisos para plugins de terceros
- Puntos de extensión bien definidos para integración

#### APIs Internas

Interfaces documentadas para:

- Gestión de documentos y metadatos
- Operaciones de sincronización
- Monitoreo de recursos y sostenibilidad
- Servicios de asistencia y análisis

### Cambios de Compatibilidad

Al ser una versión preliminar, no hay problemas de compatibilidad con versiones anteriores. Sin embargo, ten en cuenta:

- La estructura de almacenamiento de documentos puede cambiar en futuras versiones.
- Los plugins desarrollados para esta versión podrían requerir adaptación en la versión 1.0.

### Limitaciones Conocidas

- La sincronización con servicios en la nube distintos de GitHub es limitada.
- El soporte para documentos muy grandes (>1MB) puede tener problemas de rendimiento.
- Las métricas de sostenibilidad son estimaciones y se refinarán en futuras versiones.
- El asistente de IA local tiene capacidades limitadas en comparación con servicios en la nube.

### Agradecimientos

Queremos agradecer a todos los colaboradores tempranos que han hecho posible esta versión:

- [Nombre 1] - Desarrollo del editor core
- [Nombre 2] - Implementación del monitor de sostenibilidad
- [Nombre 3] - Diseño de la interfaz de usuario
- [Nombre 4] - Documentación y pruebas

También agradecemos a nuestros patrocinadores iniciales y a la comunidad de probadores por su invaluable retroalimentación.

### Descargas

- [Windows (x64)](https://downloads.picura.org/0.5.0/picura-win-x64.exe)
- [macOS (Universal)](https://downloads.picura.org/0.5.0/picura-mac-universal.dmg)
- [Linux (AppImage)](https://downloads.picura.org/0.5.0/picura-linux-x86_64.AppImage)
- [Linux (deb)](https://downloads.picura.org/0.5.0/picura-linux-amd64.deb)

También puedes acceder a todas las versiones en nuestro [repositorio de GitHub](https://github.com/picura/picura/releases).

---

## Versiones Anteriores

### Picura MD 0.4.0

*Fecha de lanzamiento: 15 de febrero de 2024*

Versión de prototipo con editor básico y sistema de almacenamiento local.

[Ver detalles completos](#)

### Picura MD 0.3.0

*Fecha de lanzamiento: 20 de enero de 2024*

Prueba de concepto con interfaz de usuario inicial.

[Ver detalles completos](#)

---

*Para más detalles sobre los cambios en cada versión, consulta nuestro [Registro de Cambios](./changelog.md).*