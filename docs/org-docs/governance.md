# Modelo de Gobernanza

Este documento describe la estructura organizativa y los procesos de toma de decisiones que rigen el proyecto Picura MD.

## Estructura Organizacional

Picura MD sigue un modelo de gobernanza basado en meritocracia y consenso, con diferentes niveles de participaci�n y responsabilidad:

### Roles del Proyecto

#### 1. Usuarios
- Personas que utilizan Picura MD
- Pueden reportar bugs, sugerir caracter�sticas y participar en discusiones
- No tienen acceso directo de commit al c�digo

#### 2. Colaboradores
- Contribuyentes que han realizado una o m�s contribuciones al proyecto
- Pueden enviar pull requests que ser�n revisados
- No tienen acceso directo de commit al c�digo

#### 3. Committers
- Contribuyentes reconocidos por sus contribuciones sostenidas y de calidad
- Tienen acceso directo de commit a partes espec�ficas del c�digo
- Pueden revisar y aprobar pull requests de su �rea de experiencia
- Deben seguir el proceso de revisi�n de c�digo para cambios significativos

#### 4. Mantenedores
- Responsables de componentes o subsistemas espec�ficos
- Tienen amplio acceso de commit a sus componentes asignados
- Toman decisiones t�cnicas en sus �reas de responsabilidad
- Revisan y aprueban cambios significativos en sus componentes

#### 5. Comit� T�cnico (TC)
- 5-7 miembros elegidos entre los mantenedores m�s activos y expertos
- Toman decisiones t�cnicas importantes que afectan a m�ltiples componentes
- Definen la arquitectura y direcci�n t�cnica del proyecto
- Resuelven disputas t�cnicas cuando no hay consenso

#### 6. Comit� de Direcci�n
- Incluye miembros del Comit� T�cnico y otros interesados clave
- Toma decisiones estrat�gicas, no t�cnicas
- Define la visi�n, misi�n y objetivos a largo plazo
- Gestiona los recursos del proyecto y patrocinios
- Garantiza la alineaci�n con los valores de sostenibilidad

### Comit�s Especializados

Adem�s de los roles principales, existen comit�s especializados:

#### Comit� de Sostenibilidad
- Supervisa las m�tricas e iniciativas de sostenibilidad
- Propone y eval�a mejoras relacionadas con la eficiencia de recursos
- Define est�ndares de desarrollo sostenible
- Revisa el impacto ambiental de las decisiones t�cnicas

#### Comit� de Comunidad
- Gestiona las comunicaciones con la comunidad
- Organiza eventos y actividades de divulgaci�n
- Supervisa los canales de comunicaci�n
- Implementa iniciativas para ampliar y diversificar la comunidad

## Proceso de Toma de Decisiones

### Principios Generales

1. **Consenso sobre dictadura**: Buscamos el consenso, pero los responsables de cada �rea tienen la �ltima palabra.
2. **Meritocracia**: La influencia se gana a trav�s de contribuciones valiosas y sostenidas.
3. **Transparencia**: Las discusiones y decisiones se realizan en p�blico cuando es posible.
4. **Inclusividad**: Valoramos diversas perspectivas y experiencias.
5. **Sostenibilidad**: Las decisiones consideran el impacto ambiental y la eficiencia de recursos.

### Proceso Espec�fico

#### Decisiones T�cnicas Menores
- Los committers y mantenedores pueden tomar decisiones menores directamente.
- Los cambios deben documentarse en commits y pull requests.
- No requieren aprobaci�n formal si est�n dentro del alcance de responsabilidad.

#### Decisiones T�cnicas Significativas
1. Se crea una propuesta como issue o documento de dise�o.
2. Se abre un per�odo de discusi�n de al menos una semana.
3. Los mantenedores relevantes buscan consenso.
4. Si hay consenso, se implementa la decisi�n.
5. Si no hay consenso, el Comit� T�cnico toma la decisi�n final.

#### Decisiones Estrat�gicas Importantes
1. Se crea una Propuesta de Mejora de Picura (PEP - Picura Enhancement Proposal).
2. La PEP se comparte con toda la comunidad para comentarios.
3. Per�odo de discusi�n de al menos dos semanas.
4. El Comit� de Direcci�n eval�a la propuesta y los comentarios.
5. Decisi�n final por consenso del Comit� de Direcci�n o votaci�n si es necesario.

### Votaci�n

Cuando sea necesario votar:
- Se utilizar� un sistema de votaci�n "+1, 0, -1" (a favor, neutral, en contra).
- Los votos deben incluir justificaci�n, especialmente los negativos.
- Seg�n el tipo de decisi�n, se requerir� una mayor�a simple o supermayor�a (2/3).
- El qu�rum m�nimo depender� del tipo de decisi�n.

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

### Responsabilidades Espec�ficas

#### Mantenedores
- Revisar y aprobar pull requests en su �rea
- Mantener la calidad del c�digo y la documentaci�n
- Responder a issues y preguntas de su componente
- Participar en las discusiones t�cnicas relevantes
- Seguir y promover las pr�cticas de desarrollo sostenible

#### Comit� T�cnico
- Reunirse regularmente (al menos mensualmente)
- Decidir sobre cambios arquitect�nicos importantes
- Mediar en disputas t�cnicas
- Aprobar la incorporaci�n de nuevos mantenedores
- Revisar y actualizar los est�ndares t�cnicos

#### Comit� de Direcci�n
- Reunirse trimestralmente para revisiones estrat�gicas
- Gestionar la hoja de ruta a largo plazo
- Supervisar la asignaci�n de recursos
- Representar el proyecto externamente
- Garantizar la alineaci�n con los valores fundamentales

## Procesos de Trabajo

### Desarrollo y Revisi�n de C�digo

1. **Desarrollo**:
   - Todo el c�digo debe estar en ramas feature o fix
   - Debe pasar todas las pruebas automatizadas y de sostenibilidad
   - Debe seguir las gu�as de estilo y convenciones del proyecto

2. **Revisi�n**:
   - Todo pull request requiere al menos una revisi�n aprobada
   - Los mantenedores del componente deben aprobar cambios en su �rea
   - Los cambios que afectan a m�ltiples componentes requieren aprobaci�n de cada mantenedor

3. **Integraci�n**:
   - Los cambios se integran a la rama principal tras aprobaci�n
   - Se utiliza integraci�n continua para validar cambios
   - Los mantenedores son responsables de resolver conflictos de merge

### Gesti�n de Versiones

1. **Planificaci�n**:
   - Ciclo de release de 8 semanas
   - Hitos definidos al inicio de cada ciclo
   - Revisi�n de hitos a mitad de ciclo

2. **Lanzamiento**:
   - Alpha, Beta, y Release Candidate seg�n sea necesario
   - Todos los tests deben pasar para el lanzamiento
   - Las notas de lanzamiento deben ser revisadas por el Comit� T�cnico
   - El per�odo de congelaci�n de caracter�sticas es de 2 semanas antes del lanzamiento

### Comunicaci�n

- **Reuniones**:
  - Reuni�n semanal de desarrollo abierta a todos
  - Reuni�n mensual del Comit� T�cnico
  - Reuniones trimestrales del Comit� de Direcci�n

- **Canales**:
  - GitHub Issues y Pull Requests para trabajo t�cnico
  - Foro de la comunidad para discusiones generales
  - Canal de chat para comunicaci�n en tiempo real
  - Lista de correo para anuncios importantes

## Resoluci�n de Conflictos

Cuando surjan desacuerdos:

1. **Discusi�n abierta**: Intentar resolver a trav�s de discusi�n constructiva.
2. **Mediaci�n**: Si la discusi�n no resuelve el conflicto, un mantenedor no involucrado puede actuar como mediador.
3. **Escalamiento**: Si la mediaci�n falla, el asunto se eleva al Comit� T�cnico.
4. **Decisi�n final**: El Comit� T�cnico tiene la autoridad final en asuntos t�cnicos; el Comit� de Direcci�n en otros asuntos.

Nos comprometemos a mantener un entorno respetuoso incluso en medio de desacuerdos, siguiendo siempre nuestro [C�digo de Conducta](./code-of-conduct.md).

## Evoluci�n de la Gobernanza

Este modelo de gobernanza evolucionar� con el proyecto. Los cambios en la gobernanza:

1. Se propondr�n como un PR a este documento.
2. Tendr�n un per�odo de comentarios de al menos dos semanas.
3. Requerir�n aprobaci�n por supermayor�a (2/3) del Comit� de Direcci�n.
4. Se anunciar�n ampliamente tras su aprobaci�n.

## Inclusi�n y Diversidad

Reconocemos el valor de diversas perspectivas. Nos comprometemos a:

- Fomentar la participaci�n de personas con diversos antecedentes y experiencias.
- Ofrecer mentor�as para nuevos contribuyentes.
- Revisar regularmente nuestros procesos para eliminar barreras de participaci�n.
- Proporcionar documentaci�n en m�ltiples idiomas cuando sea posible.

## Reconocimiento

Agradecemos a todos los miembros de la comunidad que han contribuido al desarrollo de Picura MD y a este modelo de gobernanza.

---

*Este documento fue aprobado el [fecha] y ser� revisado al menos anualmente.*

**�ltima actualizaci�n:** Marzo 2024