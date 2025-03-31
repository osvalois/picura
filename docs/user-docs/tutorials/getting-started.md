# Primeros Pasos con Picura MD

## Introducción

Bienvenido a Picura MD, la plataforma de documentación Markdown diseñada con sostenibilidad, experiencia empática, seguridad y adaptabilidad en su núcleo. Este tutorial te guiará a través de los primeros pasos para instalar, configurar y comenzar a utilizar Picura MD, asegurando que puedas aprovechar rápidamente sus capacidades fundamentales.

## Requisitos Previos

Antes de comenzar, asegúrate de cumplir con los siguientes requisitos mínimos:

- **Sistema Operativo**: Windows 10+, macOS 10.15+, o Ubuntu 20.04+ (u otra distribución Linux compatible)
- **Espacio en Disco**: Al menos 500 MB de espacio disponible
- **Memoria**: Mínimo 4 GB RAM (recomendado 8 GB)
- **Conexión a Internet**: Requerida solo para la instalación inicial y sincronización opcional

No se requieren conocimientos previos de Markdown, aunque alguna familiaridad con el formato resultará beneficiosa.

## Instalación

### Paso 1: Descargar Picura MD

1. Visita [www.picuramd.example.com/download](http://www.picuramd.example.com/download)
2. Selecciona la versión correspondiente a tu sistema operativo:
   - **Windows**: `PicuraMD-Installer-win-x64.exe`
   - **macOS**: `PicuraMD-Installer-mac.dmg`
   - **Linux**: `picuramd_[version]_amd64.deb` o `.rpm` según tu distribución

También ofrecemos opciones de instalación a través de gestores de paquetes:

**macOS (usando Homebrew)**:
```bash
brew install picuramd
```

**Linux (usando apt)**:
```bash
sudo apt-get update
sudo apt-get install picuramd
```

**Windows (usando Chocolatey)**:
```bash
choco install picuramd
```

### Paso 2: Ejecutar el Instalador

#### En Windows
1. Ejecuta el archivo `.exe` descargado
2. Sigue las instrucciones del asistente de instalación
3. Selecciona las opciones de instalación según tus preferencias (recomendamos mantener las opciones predeterminadas para comenzar)

#### En macOS
1. Abre el archivo `.dmg` descargado
2. Arrastra el icono de Picura MD a la carpeta de Aplicaciones
3. La primera vez que abras la aplicación, mantén presionada la tecla Control mientras haces clic en el icono, luego selecciona "Abrir" para autorizar la aplicación

#### En Linux
1. Para instalaciones basadas en `.deb`:
   ```bash
   sudo dpkg -i picuramd_[version]_amd64.deb
   sudo apt-get install -f  # Resuelve dependencias si es necesario
   ```

2. Para instalaciones basadas en `.rpm`:
   ```bash
   sudo rpm -i picuramd-[version].x86_64.rpm
   ```

### Paso 3: Verificar la Instalación

1. Inicia Picura MD desde el menú de inicio (Windows), Launchpad (macOS) o el lanzador de aplicaciones (Linux)
2. Deberías ver la pantalla de bienvenida de Picura MD
3. Si encuentras algún problema, consulta nuestra [guía de solución de problemas](../how-to-guides/troubleshooting.md)

## Configuración Inicial

La primera vez que inicies Picura MD, se te guiará a través de un proceso de configuración inicial diseñado para personalizar la experiencia según tus necesidades.

### Paso 1: Seleccionar tu Perfil

Picura MD te pedirá que selecciones un perfil que mejor se adapte a tus necesidades. Estos perfiles preconfiguran la interfaz y las características:

1. **Perfil Técnico**: Ideal para desarrolladores y documentación técnica
2. **Perfil Creativo**: Optimizado para escritores y creadores de contenido
3. **Perfil Académico**: Configurado para investigadores y entornos educativos
4. **Perfil Empresarial**: Diseñado para documentación corporativa y de negocios

No te preocupes por esta elección inicial; podrás cambiar entre perfiles o personalizar la experiencia más adelante.

### Paso 2: Configurar Preferencias de Sostenibilidad

A continuación, configura tus preferencias de sostenibilidad:

1. **Modo de Rendimiento**: Elige entre:
   - **Máxima Eficiencia**: Prioriza el ahorro de energía y recursos
   - **Equilibrado**: Balance entre rendimiento y eficiencia (recomendado)
   - **Máximo Rendimiento**: Prioriza velocidad y capacidades

2. **Procesamiento IA**:
   - **Local Prioritario**: Mantiene datos en tu dispositivo cuando es posible (recomendado)
   - **Equilibrado**: Utiliza nube para funciones avanzadas cuando se requiere
   - **Cloud Asistido**: Maximiza capacidades IA con mayor procesamiento en nube

3. **Monitor de Sostenibilidad**:
   - Activa o desactiva la visualización del impacto en tiempo real

### Paso 3: Configurar Directorio de Trabajo

Ahora configura dónde se almacenarán tus documentos:

1. **Crear Nuevo Directorio**: Picura MD creará una nueva estructura de carpetas
2. **Seleccionar Directorio Existente**: Utiliza una carpeta existente en tu sistema
3. **Conectar a Git**: Vincular con un repositorio Git existente

Recomendación: para comenzar, utiliza la opción "Crear Nuevo Directorio" con la ubicación predeterminada.

### Paso 4: Completar la Configuración

1. Revisa tus selecciones en la pantalla de resumen
2. Haz clic en "Finalizar Configuración"
3. Picura MD completará la configuración y te llevará a la pantalla principal

## Explorando la Interfaz

La interfaz de Picura MD está diseñada para ser intuitiva y adaptable. Vamos a explorar sus componentes principales:

### Barra Lateral de Navegación

Ubicada en el lado izquierdo, esta barra proporciona acceso a:

- **Explorador de Archivos**: Navega por tu estructura de documentos
- **Búsqueda Global**: Encuentra rápidamente cualquier contenido
- **Favoritos**: Acceso rápido a documentos importantes
- **Monitor de Sostenibilidad**: Visualiza métricas de impacto ambiental
- **Configuración**: Ajusta preferencias y personalización

Para ocultar o mostrar la barra lateral, utiliza el botón en la esquina inferior izquierda o presiona `Ctrl+B` (`Cmd+B` en macOS).

### Área Principal de Edición

El área central donde crearás y editarás tus documentos:

- **Barra de Herramientas**: Formato básico y comandos frecuentes
- **Área de Edición**: Donde escribes y editas contenido
- **Vista Previa**: Visualización renderizada de tu documento Markdown

### Panel de Control

En la parte superior encontrarás:

- **Selector de Modo**: Cambia entre modos Básico, Estándar y Avanzado
- **Controles de Documento**: Guardar, versiones, y opciones de exportación
- **Asistente IA**: Acceso a funciones de asistencia contextual
- **Menú Principal**: Acceso a todas las funcionalidades de la aplicación

### Barra de Estado

En la parte inferior, muestra información contextual:

- **Estadísticas del Documento**: Recuento de palabras, tiempo de lectura
- **Indicadores de Sincronización**: Estado de sincronización con Git u otros sistemas
- **Métricas de Sostenibilidad**: Indicadores compactos de impacto
- **Notificaciones**: Alertas y mensajes del sistema

## Creando Tu Primer Documento

Vamos a crear un documento simple para familiarizarte con el flujo de trabajo básico:

### Paso 1: Crear un Nuevo Documento

1. Haz clic en el botón "Nuevo" (+) en la barra lateral o utiliza `Ctrl+N` (`Cmd+N` en macOS)
2. Selecciona "Documento Markdown" de la lista de opciones
3. Elige una plantilla o comienza con un documento en blanco (recomendado para este tutorial)
4. Nombra tu documento, por ejemplo: "Mi Primer Documento"

### Paso 2: Escribir Contenido Básico

Escribe el siguiente contenido en el editor (puedes copiarlo y pegarlo):

```markdown
# Mi Primer Documento en Picura MD

## Introducción

Este es mi primer documento creado en Picura MD. Estoy aprendiendo a usar esta plataforma para crear documentación sostenible y adaptable.

## Características que quiero explorar

- Edición Markdown avanzada
- Control de versiones integrado
- Asistente IA sostenible
- Sincronización con Git

## Próximos pasos

1. Completar el tutorial de primeros pasos
2. Explorar las plantillas disponibles
3. Conectar con mi repositorio Git
```

### Paso 3: Utilizar Formato Básico

Ahora vamos a aplicar algunas opciones de formato:

1. Selecciona una palabra en tu texto (por ejemplo, "sostenible") y utiliza el botón de negrita (B) en la barra de herramientas o presiona `Ctrl+B` (`Cmd+B` en macOS)
2. Añade un enlace:
   - Selecciona "Picura MD" en tu texto
   - Haz clic en el botón de enlace o presiona `Ctrl+K` (`Cmd+K` en macOS)
   - Ingresa la URL: `https://www.picuramd.example.com`

### Paso 4: Guardar el Documento

1. Haz clic en el botón "Guardar" en el panel de control o presiona `Ctrl+S` (`Cmd+S` en macOS)
2. Confirma la ubicación en la que se guardará el documento
3. Verás una confirmación de que el documento ha sido guardado correctamente

## Cambiando entre Modos de Interfaz

Picura MD ofrece tres modos de interfaz diseñados para diferentes preferencias y niveles de experiencia. Vamos a explorarlos:

### Modo Básico (WYSIWYG)

Ideal para principiantes o cuando deseas enfocarte en el contenido sin preocuparte por la sintaxis Markdown:

1. Haz clic en el selector de modo en el panel de control
2. Selecciona "Modo Básico"
3. Observa cómo la interfaz cambia para mostrar un editor tipo procesador de texto
4. Prueba añadir un texto y aplicar formato utilizando los botones de la barra de herramientas

### Modo Estándar (Híbrido)

Un equilibrio entre visualización y edición de código:

1. Cambia al "Modo Estándar" desde el selector
2. Nota cómo ahora puedes ver y editar la sintaxis Markdown, pero con asistencia visual
3. Prueba añadir una lista numerada y observa cómo se proporciona ayuda contextual

### Modo Avanzado (Editor de Código)

Para usuarios que prefieren trabajar directamente con la sintaxis Markdown:

1. Selecciona "Modo Avanzado" desde el selector
2. Experimenta con la edición directa de la sintaxis Markdown
3. Observa las herramientas adicionales disponibles para usuarios avanzados

Puedes cambiar entre estos modos en cualquier momento sin afectar tu documento.

## Explorando el Monitor de Sostenibilidad

Una característica distintiva de Picura MD es su enfoque en la sostenibilidad digital. Vamos a explorar el Monitor de Sostenibilidad:

1. Haz clic en el icono del Monitor de Sostenibilidad en la barra lateral (icono de hoja)
2. Observa las métricas que se muestran:
   - **Consumo de Energía**: Estimación del consumo energético de tu sesión actual
   - **Optimización de Almacenamiento**: Eficiencia en el uso de espacio
   - **Transferencia de Datos**: Reducción en datos transmitidos (si aplica)
   - **Impacto Comparativo**: Comparación con herramientas tradicionales

3. Explora la sección "Recomendaciones" para obtener consejos sobre cómo reducir aún más tu impacto digital
4. Observa cómo diferentes acciones afectan tus métricas de sostenibilidad

## Configuración Adicional

### Personalizando la Experiencia

Vamos a ajustar algunas configuraciones para personalizar tu experiencia:

1. Accede a "Configuración" desde la barra lateral o mediante `Ctrl+,` (`Cmd+,` en macOS)
2. Explora las diferentes categorías de configuración:
   - **Apariencia**: Cambia entre temas claro, oscuro o sistema
   - **Editor**: Ajusta tamaño de fuente, espaciado y comportamiento
   - **Sostenibilidad**: Refina estrategias de optimización de recursos
   - **Atajos de Teclado**: Visualiza y personaliza atajos disponibles

3. Realiza algunos cambios según tus preferencias (recomendamos probar el tema oscuro, que es más eficiente energéticamente en pantallas OLED)
4. Aplica los cambios y observa cómo afectan a la interfaz

### Explorando las Plantillas

Picura MD incluye plantillas prediseñadas para diferentes propósitos:

1. Haz clic en "Nuevo" (+) en la barra lateral
2. Selecciona "Nuevo desde Plantilla"
3. Explora las diferentes categorías de plantillas disponibles:
   - **General**: Plantillas básicas para uso común
   - **Técnicas**: Para documentación de código, APIs, etc.
   - **Académicas**: Para papers, investigación, notas de estudio
   - **Empresariales**: Para documentación corporativa

4. Selecciona una plantilla que te interese para examinar su estructura y formato
5. Observa cómo las plantillas proporcionan estructura y orientación para diferentes tipos de contenido

## Próximos Pasos

¡Felicidades! Has completado el tutorial de primeros pasos con Picura MD. Ahora tienes un entendimiento básico de cómo instalar, configurar y comenzar a utilizar la plataforma. 

Para continuar tu aprendizaje, te recomendamos los siguientes pasos:

1. **Explora los siguientes tutoriales**:
   - [Tu Primer Documento](first-document.md) - Una guía más detallada sobre creación de documentos
   - [Fundamentos de Markdown](basic-markdown.md) - Profundiza en la sintaxis Markdown
   - [Organización de Documentos](organizing-documents.md) - Aprende a estructurar tu documentación

2. **Practica con proyectos reales**:
   - Intenta migrar algún documento existente a Picura MD
   - Crea un documento desde cero para algún proyecto personal o profesional
   - Experimenta con diferentes modos de interfaz para encontrar tu preferencia

3. **Explora características avanzadas**:
   - Prueba el [Asistente IA](using-ai-assistant.md) para experimentar con sus capacidades
   - Configura la [Sincronización con Git](sync-with-git.md) si utilizas control de versiones
   - Personaliza tu experiencia mediante las opciones de configuración avanzada

## Recursos Adicionales

- **[Documentación de Referencia](../reference/)** - Información detallada sobre todas las características
- **[Guías Prácticas](../how-to-guides/)** - Instrucciones paso a paso para tareas específicas
- **[Comunidad de Picura MD](https://community.picuramd.example.com)** - Foro para obtener ayuda y compartir ideas
- **[Canal de YouTube](https://www.youtube.com/c/PicuraMD)** - Tutoriales en video y demostraciones

---

*¿Tienes preguntas o comentarios sobre este tutorial? Por favor, contáctanos en learning@picura.example.com o visita nuestro [foro de soporte](https://support.picuramd.example.com).*