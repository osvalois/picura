# Picura MD

> Editor de Markdown sostenible con funcionalidades avanzadas

Picura MD es una plataforma de documentación Markdown que combina simplicidad con capacidades avanzadas de edición, gestión y colaboración, diseñada desde su núcleo para minimizar el impacto ambiental y maximizar el valor para usuarios de todos los niveles técnicos.

## Características principales

- 📝 **Editor Markdown Adaptativo**: Interfaz que se ajusta a diferentes perfiles de usuario
- 🔋 **Diseño Sostenible**: Minimiza consumo de recursos y optimiza procesos
- 🔄 **Sincronización Git Eficiente**: Integración nativa con control de versiones
- 🤖 **Asistente IA Local**: Procesamiento local prioritario para asistencia contextual
- 🔍 **Búsqueda Avanzada**: Indexación y consulta optimizada de documentos
- 🎨 **Temas Optimizados**: Incluye modo oscuro eficiente para pantallas OLED

## Arquitectura MVP

El MVP de Picura MD implementa una arquitectura sostenible y escalable:

### Componentes clave

1. **Editor Adaptativo**: Tres modos (básico, estándar y avanzado) para diferentes perfiles
2. **Monitor de Sostenibilidad**: Seguimiento y optimización de recursos
3. **Sistema de Documentos**: Gestión eficiente con metadatos, versiones y etiquetas
4. **Sincronización Git**: Control de versiones con sincronización optimizada
5. **Búsqueda Avanzada**: Índice optimizado con filtros y sugerencias
6. **API de Comunicación**: IPC eficiente entre procesos main y renderer

### Optimizaciones de Sostenibilidad

- **Modos de Energía**: Estándar, bajo consumo, ultra ahorro y alto rendimiento
- **Procesamiento Adaptativo**: Ajuste de procesos según estado de batería y recursos
- **Renderizado Eficiente**: Optimizaciones de UI según perfil de energía
- **Sincronización Inteligente**: Estrategias adaptativas para reducir consumo de red
- **Monitoreo de Recursos**: Seguimiento en tiempo real de CPU, memoria, red y batería

### Tecnologías

- **Frontend**: Electron, React, TypeScript, TailwindCSS
- **Backend**: Node.js, SQLite, Git (isomorphic-git)
- **Sostenibilidad**: Sistema propio de medición y optimización de recursos

## Instalación

### Requisitos del sistema

- **Sistema Operativo**: Windows 10/11, macOS 11+, Ubuntu 20.04+ o equivalente
- **CPU**: Dual-core, 2.0 GHz o superior
- **RAM**: 4GB (8GB recomendado)
- **Almacenamiento**: 200MB para aplicación, espacio variable para documentos

### Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/your-org/picura-md.git
cd picura-md

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

## Filosofía del proyecto

Picura MD se basa en los siguientes principios:

1. **Sostenibilidad Integral**: Cada decisión técnica evalúa su impacto ambiental
2. **Experiencia Empática**: Diseño centrado en necesidades reales de usuarios
3. **Transparencia Radical**: Comunicación abierta sobre decisiones y métricas
4. **Innovación Responsable**: Equilibrio entre nuevas funcionalidades y eficiencia
5. **Colaboración Inclusiva**: Diseño para diversos perfiles y contextos

## Licencia

MIT © Picura MD Team
