# Modelo de Gobernanza

Este documento describe la estructura organizativa y los procesos de toma de decisiones que rigen el proyecto Picura MD.

## Estructura Organizacional

Picura MD sigue un modelo de gobernanza basado en meritocracia y consenso, con diferentes niveles de participación y responsabilidad:

### Roles del Proyecto

#### 1. Usuarios
- Personas que utilizan Picura MD
- Pueden reportar bugs, sugerir características y participar en discusiones
- No tienen acceso directo de commit al código

#### 2. Colaboradores
- Contribuyentes que han realizado una o más contribuciones al proyecto
- Pueden enviar pull requests que serán revisados
- No tienen acceso directo de commit al código

#### 3. Committers
- Contribuyentes reconocidos por sus contribuciones sostenidas y de calidad
- Tienen acceso directo de commit a partes específicas del código
- Pueden revisar y aprobar pull requests de su área de experiencia
- Deben seguir el proceso de revisión de código para cambios significativos

#### 4. Mantenedores
- Responsables de componentes o subsistemas específicos
- Tienen amplio acceso de commit a sus componentes asignados
- Toman decisiones técnicas en sus áreas de responsabilidad
- Revisan y aprueban cambios significativos en sus componentes

#### 5. Comité Técnico (TC)
- 5-7 miembros elegidos entre los mantenedores más activos y expertos
- Toman decisiones técnicas importantes que afectan a múltiples componentes
- Definen la arquitectura y dirección técnica del proyecto
- Resuelven disputas técnicas cuando no hay consenso

#### 6. Comité de Dirección
- Incluye miembros del Comité Técnico y otros interesados clave
- Toma decisiones estratégicas, no técnicas
- Define la visión, misión y objetivos a largo plazo
- Gestiona los recursos del proyecto y patrocinios
- Garantiza la alineación con los valores de sostenibilidad

### Comités Especializados

Además de los roles principales, existen comités especializados:

#### Comité de Sostenibilidad
- Supervisa las métricas e iniciativas de sostenibilidad
- Propone y evalúa mejoras relacionadas con la eficiencia de recursos
- Define estándares de desarrollo sostenible
- Revisa el impacto ambiental de las decisiones técnicas

#### Comité de Comunidad
- Gestiona las comunicaciones con la comunidad
- Organiza eventos y actividades de divulgación
- Supervisa los canales de comunicación
- Implementa iniciativas para ampliar y diversificar la comunidad

## Proceso de Toma de Decisiones

### Principios Generales

1. **Consenso sobre dictadura**: Buscamos el consenso, pero los responsables de cada área tienen la última palabra.
2. **Meritocracia**: La influencia se gana a través de contribuciones valiosas y sostenidas.
3. **Transparencia**: Las discusiones y decisiones se realizan en público cuando es posible.
4. **Inclusividad**: Valoramos diversas perspectivas y experiencias.
5. **Sostenibilidad**: Las decisiones consideran el impacto ambiental y la eficiencia de recursos.

### Proceso Específico

#### Decisiones Técnicas Menores
- Los committers y mantenedores pueden tomar decisiones menores directamente.
- Los cambios deben documentarse en commits y pull requests.
- No requieren aprobación formal si están dentro del alcance de responsabilidad.

#### Decisiones Técnicas Significativas
1. Se crea una propuesta como issue o documento de diseño.
2. Se abre un período de discusión de al menos una semana.
3. Los mantenedores relevantes buscan consenso.
4. Si hay consenso, se implementa la decisión.
5. Si no hay consenso, el Comité Técnico toma la decisión final.

#### Decisiones Estratégicas Importantes
1. Se crea una Propuesta de Mejora de Picura (PEP - Picura Enhancement Proposal).
2. La PEP se comparte con toda la comunidad para comentarios.
3. Período de discusión de al menos dos semanas.
4. El Comité de Dirección evalúa la propuesta y los comentarios.
5. Decisión final por consenso del Comité de Dirección o votación si es necesario.

### Votación

Cuando sea necesario votar:
- Se utilizará un sistema de votación "+1, 0, -1" (a favor, neutral, en contra).
- Los votos deben incluir justificación, especialmente los negativos.
- Según el tipo de decisión, se requerirá una mayoría simple o supermayoría (2/3).
- El quórum mínimo dependerá del tipo de decisión.

## Roles y Responsabilidades

### Mantenedores de Componentes

Actualmente, los componentes principales y sus mantenedores son:

| Componente | Mantenedor Principal | Mantenedores Adicionales |
|------------|----------------------|--------------------------|
| Core Engine | [Nombre] | [Nombres] |
| Editor | [Nombre] | [Nombres] |
| Storage Service | [Nombre] | [Nombres] |
| Sync Service | [Nombre] | [Nombres] |
| Sustainability Monitor | [Nombre] | [Nombres] |
| AI Assistant | [Nombre] | [Nombres] |
| Documentation | [Nombre] | [Nombres] |

### Responsabilidades Específicas

#### Mantenedores
- Revisar y aprobar pull requests en su área
- Mantener la calidad del código y la documentación
- Responder a issues y preguntas de su componente
- Participar en las discusiones técnicas relevantes
- Seguir y promover las prácticas de desarrollo sostenible

#### Comité Técnico
- Reunirse regularmente (al menos mensualmente)
- Decidir sobre cambios arquitectónicos importantes
- Mediar en disputas técnicas
- Aprobar la incorporación de nuevos mantenedores
- Revisar y actualizar los estándares técnicos

#### Comité de Dirección
- Reunirse trimestralmente para revisiones estratégicas
- Gestionar la hoja de ruta a largo plazo
- Supervisar la asignación de recursos
- Representar el proyecto externamente
- Garantizar la alineación con los valores fundamentales

## Procesos de Trabajo

### Desarrollo y Revisión de Código

1. **Desarrollo**:
   - Todo el código debe estar en ramas feature o fix
   - Debe pasar todas las pruebas automatizadas y de sostenibilidad
   - Debe seguir las guías de estilo y convenciones del proyecto

2. **Revisión**:
   - Todo pull request requiere al menos una revisión aprobada
   - Los mantenedores del componente deben aprobar cambios en su área
   - Los cambios que afectan a múltiples componentes requieren aprobación de cada mantenedor

3. **Integración**:
   - Los cambios se integran a la rama principal tras aprobación
   - Se utiliza integración continua para validar cambios
   - Los mantenedores son responsables de resolver conflictos de merge

### Gestión de Versiones

1. **Planificación**:
   - Ciclo de release de 8 semanas
   - Hitos definidos al inicio de cada ciclo
   - Revisión de hitos a mitad de ciclo

2. **Lanzamiento**:
   - Alpha, Beta, y Release Candidate según sea necesario
   - Todos los tests deben pasar para el lanzamiento
   - Las notas de lanzamiento deben ser revisadas por el Comité Técnico
   - El período de congelación de características es de 2 semanas antes del lanzamiento

### Comunicación

- **Reuniones**:
  - Reunión semanal de desarrollo abierta a todos
  - Reunión mensual del Comité Técnico
  - Reuniones trimestrales del Comité de Dirección

- **Canales**:
  - GitHub Issues y Pull Requests para trabajo técnico
  - Foro de la comunidad para discusiones generales
  - Canal de chat para comunicación en tiempo real
  - Lista de correo para anuncios importantes

## Resolución de Conflictos

Cuando surjan desacuerdos:

1. **Discusión abierta**: Intentar resolver a través de discusión constructiva.
2. **Mediación**: Si la discusión no resuelve el conflicto, un mantenedor no involucrado puede actuar como mediador.
3. **Escalamiento**: Si la mediación falla, el asunto se eleva al Comité Técnico.
4. **Decisión final**: El Comité Técnico tiene la autoridad final en asuntos técnicos; el Comité de Dirección en otros asuntos.

Nos comprometemos a mantener un entorno respetuoso incluso en medio de desacuerdos, siguiendo siempre nuestro [Código de Conducta](./code-of-conduct.md).

## Evolución de la Gobernanza

Este modelo de gobernanza evolucionará con el proyecto. Los cambios en la gobernanza:

1. Se propondrán como un PR a este documento.
2. Tendrán un período de comentarios de al menos dos semanas.
3. Requerirán aprobación por supermayoría (2/3) del Comité de Dirección.
4. Se anunciarán ampliamente tras su aprobación.

## Inclusión y Diversidad

Reconocemos el valor de diversas perspectivas. Nos comprometemos a:

- Fomentar la participación de personas con diversos antecedentes y experiencias.
- Ofrecer mentorías para nuevos contribuyentes.
- Revisar regularmente nuestros procesos para eliminar barreras de participación.
- Proporcionar documentación en múltiples idiomas cuando sea posible.

## Reconocimiento

Agradecemos a todos los miembros de la comunidad que han contribuido al desarrollo de Picura MD y a este modelo de gobernanza.

---

*Este documento fue aprobado el [fecha] y será revisado al menos anualmente.*

**Última actualización:** Marzo 2024