# Guía de Contribución

## Introducción

¡Gracias por tu interés en contribuir a Picura MD! Este documento proporciona las directrices y mejores prácticas para contribuir a nuestro proyecto, con especial énfasis en nuestro compromiso con la sostenibilidad.

Picura MD es una plataforma de gestión documental centrada en la sostenibilidad. Valoramos todas las contribuciones que ayuden a mejorar nuestro producto mientras mantienen o mejoran su eficiencia energética y uso de recursos.

Antes de contribuir, por favor lee nuestro [Código de Conducta](./code-of-conduct.md) y nuestro [Compromiso de Sostenibilidad](./sustainability-commitment.md).

## Flujo de Trabajo de Contribución

### 1. Preparación del Entorno

1. **Fork del repositorio**:
   - Crea un fork del repositorio principal en GitHub.

2. **Clona tu fork**:
   ```bash
   git clone https://github.com/tu-usuario/picura.git
   cd picura
   ```

3. **Configura el repositorio remoto**:
   ```bash
   git remote add upstream https://github.com/picura/picura.git
   ```

4. **Instala las dependencias**:
   ```bash
   npm install
   ```

5. **Ejecuta las pruebas para asegurar que todo funciona**:
   ```bash
   npm test
   ```

### 2. Desarrollo de Cambios

1. **Crea una rama para tu contribución**:
   ```bash
   git checkout -b nombre-de-caracteristica
   ```
   
   Usa un nombre descriptivo para tu rama que refleje el propósito de tus cambios.

2. **Desarrolla tus cambios**:
   - Asegúrate de seguir las convenciones de código y los principios de sostenibilidad.
   - Escribe tests para tus cambios cuando sea aplicable.

3. **Realiza commits incrementales**:
   ```bash
   git add .
   git commit -m "Descripción clara del cambio"
   ```
   
   Utiliza mensajes de commit descriptivos siguiendo las [convenciones de commits](https://www.conventionalcommits.org/):
   - `feat:` para nuevas características
   - `fix:` para correcciones de errores
   - `docs:` para cambios en documentación
   - `style:` para cambios que no afectan el significado del código
   - `refactor:` para cambios que no añaden características ni corrigen errores
   - `perf:` para cambios que mejoran el rendimiento
   - `test:` para añadir o corregir tests
   - `chore:` para cambios en el proceso de build o herramientas auxiliares
   - `sustain:` para mejoras específicas de sostenibilidad

4. **Sincroniza regularmente con el repositorio principal**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### 3. Validación de Cambios

Antes de enviar tu contribución, asegúrate de que tu código:

1. **Funciona correctamente**:
   ```bash
   npm test
   ```

2. **Cumple con los estándares de código**:
   ```bash
   npm run lint
   ```

3. **Tiene la documentación apropiada**:
   - Actualiza README.md si añades nuevas características
   - Añade comentarios de código donde sea necesario
   - Actualiza la documentación técnica si es relevante

4. **Pasa las métricas de sostenibilidad**:
   ```bash
   npm run sustainability-check
   ```

### 4. Envío de Pull Requests

1. **Actualiza tu rama con los últimos cambios**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Sube tus cambios a tu fork**:
   ```bash
   git push origin nombre-de-caracteristica
   ```

3. **Crea un Pull Request**:
   - Ve a la página de tu fork en GitHub
   - Haz clic en "New Pull Request"
   - Selecciona tu rama y completa la plantilla de PR
   - Incluye una descripción clara de los cambios y su propósito
   - Menciona cualquier issue relacionado usando #numero-de-issue

4. **Responde a los comentarios de revisión**:
   - Los mantenedores revisarán tu PR y pueden sugerir cambios
   - Discute constructivamente y actualiza tu código según sea necesario
   - Realiza cambios adicionales en la misma rama y súbelos

## Estándares de Código

### Estilo de Código

- Sigue el estilo de código definido en los archivos de configuración del proyecto (ESLint, Prettier)
- Mantén la consistencia con el código existente
- Utiliza nombres descriptivos para variables, funciones y clases
- Comenta tu código cuando la lógica no sea evidente
- Evita código duplicado (DRY - Don't Repeat Yourself)

### Tests

- Escribe tests unitarios para nuevas características
- Asegúrate de que los tests existentes pasan con tus cambios
- Considera añadir tests de integración para cambios significativos
- Incluye tests de rendimiento para características críticas

### Documentación

- Documenta todas las APIs públicas
- Actualiza la documentación existente afectada por tus cambios
- Incluye ejemplos cuando sea útil
- Usa markdown para la documentación y sigue las convenciones de formato

## Principios de Sostenibilidad

Al contribuir a Picura MD, ten en cuenta estos principios de sostenibilidad:

1. **Eficiencia energética**:
   - Optimiza algoritmos para reducir ciclos de CPU
   - Evita operaciones innecesarias o redundantes
   - Considera el impacto de procesamiento en dispositivos con batería

2. **Uso eficiente de recursos**:
   - Minimiza el uso de memoria y almacenamiento
   - Optimiza los recursos de red (reducir cantidad y tamaño de transferencias)
   - Implementa liberación adecuada de recursos

3. **Adaptabilidad a condiciones limitadas**:
   - Asegúrate de que las características funcionan en dispositivos de bajo rendimiento
   - Implementa degradación elegante cuando los recursos son limitados
   - Prioriza operaciones esenciales en condiciones restringidas

4. **Medición y transparencia**:
   - Incluye métricas de consumo de recursos cuando sea relevante
   - Documenta el impacto de sostenibilidad de las nuevas características
   - Considera añadir pruebas específicas de sostenibilidad

## Informes de Errores

Si encuentras un error, por favor crea un issue utilizando la plantilla de bugs. Incluye:

1. **Título claro y descriptivo**
2. **Descripción detallada**:
   - Pasos para reproducir el error
   - Comportamiento esperado vs. actual
   - Capturas de pantalla si aplica
   - Información del entorno (navegador, SO, versión de Picura)
3. **Información de contexto adicional** que pueda ser relevante

## Sugerencias de Características

Para sugerir nuevas características:

1. Primero verifica si la idea ya ha sido propuesta en los issues existentes
2. Crea un nuevo issue usando la plantilla de feature request
3. Describe claramente:
   - El problema que resuelve la característica
   - Cómo debería funcionar
   - Cómo se alinea con los principios de sostenibilidad
   - Cualquier alternativa considerada

## Comunidad

Únete a nuestra comunidad:

- **Chat**: [Enlace al Discord/Slack]
- **Foro**: [Enlace al foro]
- **Reuniones comunitarias**: Organizamos reuniones mensuales para discutir el desarrollo

## Reconocimiento

Todos los contribuyentes serán reconocidos en nuestro archivo CONTRIBUTORS.md. ¡Valoramos y agradecemos cada contribución!

## Preguntas

Si tienes preguntas sobre cómo contribuir, no dudes en:

- Abrir un issue con la etiqueta "question"
- Preguntar en nuestros canales de comunicación
- Contactar directamente al equipo en contribute@picura.org

---

**Nota**: Este documento evolucionará con el proyecto. Los cambios en estas directrices se comunicarán a través del changelog y anuncios en los canales oficiales.