# Gu�a de Contribuci�n

## Introducci�n

�Gracias por tu inter�s en contribuir a Picura MD! Este documento proporciona las directrices y mejores pr�cticas para contribuir a nuestro proyecto, con especial �nfasis en nuestro compromiso con la sostenibilidad.

Picura MD es una plataforma de gesti�n documental centrada en la sostenibilidad. Valoramos todas las contribuciones que ayuden a mejorar nuestro producto mientras mantienen o mejoran su eficiencia energ�tica y uso de recursos.

Antes de contribuir, por favor lee nuestro [C�digo de Conducta](./code-of-conduct.md) y nuestro [Compromiso de Sostenibilidad](./sustainability-commitment.md).

## Flujo de Trabajo de Contribuci�n

### 1. Preparaci�n del Entorno

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

1. **Crea una rama para tu contribuci�n**:
   ```bash
   git checkout -b nombre-de-caracteristica
   ```
   
   Usa un nombre descriptivo para tu rama que refleje el prop�sito de tus cambios.

2. **Desarrolla tus cambios**:
   - Aseg�rate de seguir las convenciones de c�digo y los principios de sostenibilidad.
   - Escribe tests para tus cambios cuando sea aplicable.

3. **Realiza commits incrementales**:
   ```bash
   git add .
   git commit -m "Descripci�n clara del cambio"
   ```
   
   Utiliza mensajes de commit descriptivos siguiendo las [convenciones de commits](https://www.conventionalcommits.org/):
   - `feat:` para nuevas caracter�sticas
   - `fix:` para correcciones de errores
   - `docs:` para cambios en documentaci�n
   - `style:` para cambios que no afectan el significado del c�digo
   - `refactor:` para cambios que no a�aden caracter�sticas ni corrigen errores
   - `perf:` para cambios que mejoran el rendimiento
   - `test:` para a�adir o corregir tests
   - `chore:` para cambios en el proceso de build o herramientas auxiliares
   - `sustain:` para mejoras espec�ficas de sostenibilidad

4. **Sincroniza regularmente con el repositorio principal**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### 3. Validaci�n de Cambios

Antes de enviar tu contribuci�n, aseg�rate de que tu c�digo:

1. **Funciona correctamente**:
   ```bash
   npm test
   ```

2. **Cumple con los est�ndares de c�digo**:
   ```bash
   npm run lint
   ```

3. **Tiene la documentaci�n apropiada**:
   - Actualiza README.md si a�ades nuevas caracter�sticas
   - A�ade comentarios de c�digo donde sea necesario
   - Actualiza la documentaci�n t�cnica si es relevante

4. **Pasa las m�tricas de sostenibilidad**:
   ```bash
   npm run sustainability-check
   ```

### 4. Env�o de Pull Requests

1. **Actualiza tu rama con los �ltimos cambios**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Sube tus cambios a tu fork**:
   ```bash
   git push origin nombre-de-caracteristica
   ```

3. **Crea un Pull Request**:
   - Ve a la p�gina de tu fork en GitHub
   - Haz clic en "New Pull Request"
   - Selecciona tu rama y completa la plantilla de PR
   - Incluye una descripci�n clara de los cambios y su prop�sito
   - Menciona cualquier issue relacionado usando #numero-de-issue

4. **Responde a los comentarios de revisi�n**:
   - Los mantenedores revisar�n tu PR y pueden sugerir cambios
   - Discute constructivamente y actualiza tu c�digo seg�n sea necesario
   - Realiza cambios adicionales en la misma rama y s�belos

## Est�ndares de C�digo

### Estilo de C�digo

- Sigue el estilo de c�digo definido en los archivos de configuraci�n del proyecto (ESLint, Prettier)
- Mant�n la consistencia con el c�digo existente
- Utiliza nombres descriptivos para variables, funciones y clases
- Comenta tu c�digo cuando la l�gica no sea evidente
- Evita c�digo duplicado (DRY - Don't Repeat Yourself)

### Tests

- Escribe tests unitarios para nuevas caracter�sticas
- Aseg�rate de que los tests existentes pasan con tus cambios
- Considera a�adir tests de integraci�n para cambios significativos
- Incluye tests de rendimiento para caracter�sticas cr�ticas

### Documentaci�n

- Documenta todas las APIs p�blicas
- Actualiza la documentaci�n existente afectada por tus cambios
- Incluye ejemplos cuando sea �til
- Usa markdown para la documentaci�n y sigue las convenciones de formato

## Principios de Sostenibilidad

Al contribuir a Picura MD, ten en cuenta estos principios de sostenibilidad:

1. **Eficiencia energ�tica**:
   - Optimiza algoritmos para reducir ciclos de CPU
   - Evita operaciones innecesarias o redundantes
   - Considera el impacto de procesamiento en dispositivos con bater�a

2. **Uso eficiente de recursos**:
   - Minimiza el uso de memoria y almacenamiento
   - Optimiza los recursos de red (reducir cantidad y tama�o de transferencias)
   - Implementa liberaci�n adecuada de recursos

3. **Adaptabilidad a condiciones limitadas**:
   - Aseg�rate de que las caracter�sticas funcionan en dispositivos de bajo rendimiento
   - Implementa degradaci�n elegante cuando los recursos son limitados
   - Prioriza operaciones esenciales en condiciones restringidas

4. **Medici�n y transparencia**:
   - Incluye m�tricas de consumo de recursos cuando sea relevante
   - Documenta el impacto de sostenibilidad de las nuevas caracter�sticas
   - Considera a�adir pruebas espec�ficas de sostenibilidad

## Informes de Errores

Si encuentras un error, por favor crea un issue utilizando la plantilla de bugs. Incluye:

1. **T�tulo claro y descriptivo**
2. **Descripci�n detallada**:
   - Pasos para reproducir el error
   - Comportamiento esperado vs. actual
   - Capturas de pantalla si aplica
   - Informaci�n del entorno (navegador, SO, versi�n de Picura)
3. **Informaci�n de contexto adicional** que pueda ser relevante

## Sugerencias de Caracter�sticas

Para sugerir nuevas caracter�sticas:

1. Primero verifica si la idea ya ha sido propuesta en los issues existentes
2. Crea un nuevo issue usando la plantilla de feature request
3. Describe claramente:
   - El problema que resuelve la caracter�stica
   - C�mo deber�a funcionar
   - C�mo se alinea con los principios de sostenibilidad
   - Cualquier alternativa considerada

## Comunidad

�nete a nuestra comunidad:

- **Chat**: [Enlace al Discord/Slack]
- **Foro**: [Enlace al foro]
- **Reuniones comunitarias**: Organizamos reuniones mensuales para discutir el desarrollo

## Reconocimiento

Todos los contribuyentes ser�n reconocidos en nuestro archivo CONTRIBUTORS.md. �Valoramos y agradecemos cada contribuci�n!

## Preguntas

Si tienes preguntas sobre c�mo contribuir, no dudes en:

- Abrir un issue con la etiqueta "question"
- Preguntar en nuestros canales de comunicaci�n
- Contactar directamente al equipo en contribute@picura.org

---

**Nota**: Este documento evolucionar� con el proyecto. Los cambios en estas directrices se comunicar�n a trav�s del changelog y anuncios en los canales oficiales.