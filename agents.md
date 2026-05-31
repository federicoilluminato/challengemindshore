# Agents Notes

## Objetivo
Construir una app fullstack para el challenge de MindShore que cumpla todos los requisitos del README y destaque en calidad, claridad y terminacion.

## Stack acordado
- Next.js como framework principal
- React como base de UI dentro de Next.js
- TypeScript
- PostgreSQL como base de datos
- Prisma como ORM
- Tailwind CSS + shadcn/ui para la interfaz
- TanStack Query para estado de servidor
- Zustand para estado global ligero
- React Hook Form + Zod para formularios y validacion
- Auth.js para autenticacion
- OpenAI SDK para enriquecimiento con IA
- Vitest + React Testing Library para tests
- Docker Compose para levantar app + DB en desarrollo

## Deploy elegido
- Render para deployar toda la solución en un solo proveedor: app Next.js + PostgreSQL + servicios auxiliares si hicieran falta
- Elegimos Render sobre Vercel porque este challenge prioriza una entrega completa y simple de explicar, con menos piezas externas para la demo
- Elegimos Render sobre Railway porque nos da una historia de despliegue más clara para el repo y nos permite concentrar la documentación en una sola plataforma
- Vercel queda como alternativa válida si más adelante quisiéramos optimizar la experiencia específica de Next.js, pero no es la opción principal para este proyecto

## Arquitectura
- Monolito modular dentro de un solo repo
- Frontend y backend dentro de Next.js
- Separar por dominios: auth, nasa, collections, enrichment, tags, export, search
- Aislar integraciones externas: NASA API, OpenAI, exportacion PDF

## Base de datos
- Levantar PostgreSQL localmente con Docker Compose
- Usar Prisma migrations y seeds para setup reproducible
- En produccion se puede usar Neon o Supabase

## Requisitos del README a cubrir
- Busqueda avanzada de NASA con filtros por fecha, rover, camara y mision
- Colecciones personalizadas por usuario
- Enriquecimiento con IA
- Registro y login
- UI responsive con loading, error y empty states
- Validacion de inputs
- Rate limiting basico
- Al menos un test frontend y uno backend
- Documentacion tecnica y decisiones

## Decisiones tecnicas
- Autenticacion stateless con JWT en Auth.js, sin persistir sesiones en la base de datos para mantener el MVP simple
- El schema de Prisma se mantiene minimo: `User`, `Collection`, `CollectionItem`, `NasaImage`, `Tag` e `ImageTag`
- No modelar OAuth, magic links ni verification tokens por ahora; solo email + password con `passwordHash`
- Quitar campos que no aportan al MVP inicial, como `image`, `emailVerified`, `note` y `source`
- Agregar tablas o campos solo cuando exista una necesidad funcional concreta

## Diferenciadores elegidos
1. Timeline interactivo
2. Sistema de tags
3. Opcional si hay tiempo: busqueda semantica o comparador de imagenes

## MVP por fases
1. Inicializar proyecto, DB, auth y estructura base
2. Integrar NASA API y busqueda avanzada
3. Implementar colecciones por usuario
4. Agregar enriquecimiento con IA
5. Construir timeline y tags
6. Agregar tests
7. Docker, README y pulido final

## Criterio de trabajo
- Preferir cambios pequenos y correctos
- No sobrearquitecturar
- Mantener el proyecto facil de revisar y de correr
