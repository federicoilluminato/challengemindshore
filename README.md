# MindShore Challenge — Solución

**Plataforma de Exploración Espacial con IA** — [Repo](https://github.com/tu-usuario/mindshore-challenge)

Stack: Next.js 14 · TypeScript · PostgreSQL · Prisma · Tailwind CSS · OpenAI · JWT

---

## ✨ Funcionalidades

| Feature | Estado |
|---------|--------|
| Búsqueda avanzada NASA (filtros: fecha, rover, cámara, misión) | ✅ |
| Colecciones personalizadas por usuario | ✅ |
| Enriquecimiento con IA (OpenAI + fallback semántico) | ✅ |
| Autenticación JWT (registro, login, logout) | ✅ |
| Timeline interactivo | ✅ |
| Sistema de tags (sugeridos por IA + manuales) | ✅ |
| Rate limiting (search, enrich, login, register) | ✅ |
| UI responsive + loading/error/empty states | ✅ |
| Validación de inputs (Zod + React Hook Form) | ✅ |
| Tests (frontend + backend con Vitest) | ✅ |
| Docker Compose (PostgreSQL + app) | ✅ |

---

## 🚀 Cómo correr localmente

### 1. Prerequisitos

- Node.js 18+
- Docker Desktop (para PostgreSQL)
- Una API key de [NASA](https://api.nasa.gov)
- (Opcional) Una API key de [OpenAI](https://platform.openai.com)

### 2. Clonar e instalar

```bash
git clone <tu-repo>
cd mindshore-challenge
npm install
```

### 3. Variables de entorno

Copiar `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Configurar:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mindshore"
JWT_SECRET="un-seguro-muy-largo"
NASA_API_KEY="tu-api-key-nasa"
OPENAI_API_KEY="tu-api-key-openai"    # Opcional
```

### 4. Base de datos

```bash
docker compose up -d db               # Levanta PostgreSQL
npx prisma migrate dev                # Crea las tablas
```

### 5. Iniciar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## 🐳 Docker Compose (todo en uno)

```bash
docker compose up
```

Levanta PostgreSQL + la app en el puerto `3000`.

---

## 🧪 Tests

```bash
npm run test
```

- 1 test frontend (Componente Button)
- 1 test backend (utilidad `cn`)

---

## 🏗️ Arquitectura

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # API endpoints (auth, nasa, collections, tags)
│   ├── (auth)/           # Login / Register pages
│   ├── explore/          # Búsqueda NASA
│   ├── timeline/         # Timeline interactivo
│   └── dashboard/        # Colecciones del usuario
├── components/
│   ├── ui/               # shadcn/ui (Button, Input, Label, Spinner)
│   ├── auth/             # LoginForm, RegisterForm, LogoutLink
│   ├── nasa/             # NasaSearchClient, NasaResultCard, NasaTimeline
│   └── collections/      # CollectionManager, CollectionGallery
├── lib/
│   ├── nasa.ts           # Cliente API NASA
│   ├── enrichment.ts     # Enriquecimiento IA + fallback semántico
│   ├── auth.ts           # JWT (create, verify, cookies)
│   ├── rate-limit.ts     # Rate limiter en memoria
│   ├── schemas/          # Zod schemas (nasa, auth, collections, enrichment)
│   ├── prisma.ts         # Cliente Prisma singleton
│   └── openai.ts         # Cliente OpenAI
└── test/                 # Tests Vitest
```

### Decisiones técnicas

| Decisión | Por qué |
|----------|---------|
| **Next.js App Router** | API + frontend en un mismo proyecto. Rutas dinámicas y server components. |
| **JWT propio sin Auth.js** | MVP simple, stateless, sin dependencias externas de autenticación. |
| **Prisma + PostgreSQL** | ORM type-safe con migraciones y schema visual. |
| **Zustand no implementado** | El estado global no fue necesario; React Hook Form + props alcanzaron. |
| **OpenAI con fallback** | Si no hay API key, se genera contexto semántico desde el título y metadata. |
| **Rate limiter en memoria** | Simple y efectivo para un MVP. En producción usar Redis. |
| **Vitest** | Rápido, compatible con el ecosistema Vite/Next.js. |
| **Render para deploy** | App + DB en un solo proveedor, menos piezas externas. |

---

## 🧠 Enriquecimiento IA

El sistema envía a OpenAI el título, descripción, rover, cámara, misión, keywords, centro y fotógrafo. El prompt pide explícitamente **no repetir la descripción** y agregar contexto histórico, científico o de misión.

**Fallback semántico**: Si no hay API key o la respuesta es muy genérica, se genera contexto infiriendo temas del título y metadata (marte, atardecer, pathfinder, atmósfera, etc.).

---

## 📈 Diferenciadores elegidos

1. **Timeline interactivo** — Las imágenes se ordenan cronológicamente en una línea de tiempo vertical con dots, thumbnails y metadata.
2. **Sistema de tags** — Sugeridos por IA y persistibles en la base de datos por imagen.

---

## 🔮 Qué haría con más tiempo

1. **Visualización 3D de planetas** (respuesta a "Sorprendenos"): un Google Maps espacial para ver dónde estaba cada rover cuando tomó cada foto, la trayectoria de la misión y el contexto geográfico. Usaría Three.js o Cesium.js.
2. **Búsqueda semántica** con embeddings.
3. **Exportar colecciones a PDF**.
4. **Redis** para rate limiting y caché de NASA API.
5. **Tests de integración** con base de datos real.
6. **Dashboard con estadísticas** de colecciones y actividad.

---

## 🌐 Deploy

**Elegido: Render** — App Next.js + PostgreSQL en un solo proveedor.

Alternativas válidas: Vercel (mejor para Next.js) o Railway (similar a Render).

---

## 🤝 Contribuciones

Este es un challenge técnico de MindShore. Para participar, forkear el [repo original](https://github.com/mindshoresl/challenge) y abrir un PR.
