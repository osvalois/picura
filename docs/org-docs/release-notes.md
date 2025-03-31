# Notas de Lanzamiento

## Picura MD 0.5.0

*Fecha de lanzamiento: 30 de marzo de 2024*

### Resumen

Nos complace presentar Picura MD 0.5.0, una versi�n preliminar que establece las bases de nuestra visi�n de una plataforma de gesti�n documental sostenible. Esta versi�n incluye el n�cleo funcional del editor Markdown, capacidades b�sicas de sincronizaci�n, y nuestro innovador monitor de sostenibilidad para optimizar el uso de recursos.

### Nuevas Caracter�sticas

#### Editor Markdown

![Editor Markdown](../assets/images/editor-screenshot.png)

El editor Markdown incluye:

- Soporte para sintaxis Markdown extendida, incluyendo tablas, listas de tareas y notas al pie
- Vista previa en tiempo real con renderizado optimizado
- Tema claro/oscuro/autom�tico que se adapta a las preferencias del sistema
- Autocompletado inteligente para enlaces, im�genes y referencias
- Marcado de sintaxis con resaltado personalizable

#### Sistema de Sincronizaci�n

Implementaci�n inicial del sistema de sincronizaci�n con:

- Almacenamiento local persistente con respaldo autom�tico
- Soporte para sincronizaci�n b�sica con GitHub
- Sistema de resoluci�n de conflictos para cambios concurrentes
- Sincronizaci�n diferencial para minimizar transferencia de datos

#### Visor de Documentos

![Visor de Documentos](../assets/images/viewer-screenshot.png)

- Modo de lectura optimizado con ajustes de legibilidad
- Opciones de personalizaci�n de fuente y espaciado
- Navegaci�n por encabezados y tabla de contenidos autom�tica
- Modo de enfoque para minimizar distracciones

#### Asistente de IA Local

- Ayuda contextual basada en el contenido del documento
- Sugerencias para mejorar la legibilidad y estructura
- Procesamiento local para preservar privacidad y reducir consumo de recursos
- Integraci�n opcional con servicios de IA en la nube

#### M�tricas de Sostenibilidad

![Dashboard de Sostenibilidad](../assets/images/sustainability-dashboard.png)

- Monitor de consumo de recursos en tiempo real
- M�tricas de eficiencia energ�tica comparativas
- Optimizaciones autom�ticas para preservar bater�a
- Recomendaciones para reducir el impacto ambiental

### Mejoras de Sostenibilidad

Esta versi�n establece nuestra base para una gesti�n documental sostenible:

- **Optimizaci�n de Bater�a**: Detecci�n autom�tica de uso con bater�a y ajuste de operaciones intensivas.
- **Uso Eficiente de CPU**: Algoritmos optimizados para minimizar ciclos de procesamiento.
- **Gesti�n de Memoria**: Uso eficiente de memoria con liberaci�n proactiva de recursos.
- **Optimizaci�n de Red**: Transferencia diferencial y compresi�n adaptativa para minimizar tr�fico.
- **Almacenamiento Eficiente**: Compresi�n inteligente basada en patrones de acceso y uso.

Todas estas optimizaciones son transparentes para el usuario, manteniendo una experiencia fluida mientras se reduce significativamente el consumo de recursos.

### Mejoras T�cnicas

#### Arquitectura Base

Hemos establecido una arquitectura modular con:

- Sistema de componentes con interfaces bien definidas
- Patr�n de eventos para comunicaci�n eficiente entre m�dulos
- Pipeline de procesamiento optimizado para documentos
- Sistema de extensiones para funcionalidades adicionales

#### Sistema de Plugins

La arquitectura de plugins permite:

- Cargar/descargar plugins din�micamente
- Extender la funcionalidad sin modificar el n�cleo
- Sistema de permisos para plugins de terceros
- Puntos de extensi�n bien definidos para integraci�n

#### APIs Internas

Interfaces documentadas para:

- Gesti�n de documentos y metadatos
- Operaciones de sincronizaci�n
- Monitoreo de recursos y sostenibilidad
- Servicios de asistencia y an�lisis

### Cambios de Compatibilidad

Al ser una versi�n preliminar, no hay problemas de compatibilidad con versiones anteriores. Sin embargo, ten en cuenta:

- La estructura de almacenamiento de documentos puede cambiar en futuras versiones.
- Los plugins desarrollados para esta versi�n podr�an requerir adaptaci�n en la versi�n 1.0.

### Limitaciones Conocidas

- La sincronizaci�n con servicios en la nube distintos de GitHub es limitada.
- El soporte para documentos muy grandes (>1MB) puede tener problemas de rendimiento.
- Las m�tricas de sostenibilidad son estimaciones y se refinar�n en futuras versiones.
- El asistente de IA local tiene capacidades limitadas en comparaci�n con servicios en la nube.

### Agradecimientos

Queremos agradecer a todos los colaboradores tempranos que han hecho posible esta versi�n:

- [Nombre 1] - Desarrollo del editor core
- [Nombre 2] - Implementaci�n del monitor de sostenibilidad
- [Nombre 3] - Dise�o de la interfaz de usuario
- [Nombre 4] - Documentaci�n y pruebas

Tambi�n agradecemos a nuestros patrocinadores iniciales y a la comunidad de probadores por su invaluable retroalimentaci�n.

### Descargas

- [Windows (x64)](https://downloads.picura.org/0.5.0/picura-win-x64.exe)
- [macOS (Universal)](https://downloads.picura.org/0.5.0/picura-mac-universal.dmg)
- [Linux (AppImage)](https://downloads.picura.org/0.5.0/picura-linux-x86_64.AppImage)
- [Linux (deb)](https://downloads.picura.org/0.5.0/picura-linux-amd64.deb)

Tambi�n puedes acceder a todas las versiones en nuestro [repositorio de GitHub](https://github.com/picura/picura/releases).

---

## Versiones Anteriores

### Picura MD 0.4.0

*Fecha de lanzamiento: 15 de febrero de 2024*

Versi�n de prototipo con editor b�sico y sistema de almacenamiento local.

[Ver detalles completos](#)

### Picura MD 0.3.0

*Fecha de lanzamiento: 20 de enero de 2024*

Prueba de concepto con interfaz de usuario inicial.

[Ver detalles completos](#)

---

*Para m�s detalles sobre los cambios en cada versi�n, consulta nuestro [Registro de Cambios](./changelog.md).*