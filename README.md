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
| Búsqueda semántica por descripción natural | ✅ |
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
- (Opcional) Una API key de [OpenAI](https://platform.openai.com) — requiere agregar un método de pago (no hay free tier renovable)

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
│   ├── semantic-search.ts # Parser de lenguaje natural a filtros NASA
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
| **Zustand** | Store simple para estado de auth (setUser/clearUser). No se necesitó más estado global. |
| **OpenAI con fallback semántico** | Si no hay API key, cuota excedida o error, se genera contexto sin depender de un LLM externo. |
| **Rate limiter en memoria** | Simple y efectivo para un MVP. En producción usar Redis. |
| **Vitest** | Rápido, compatible con el ecosistema Vite/Next.js. |
| **Render para deploy** | App + DB en un solo proveedor, menos piezas externas. |

---

## 🧠 Enriquecimiento IA

### Integración

```
[Frontend] → POST /api/nasa/enrich → enrichment.ts → OpenAI (gpt-4o-mini)
                                                         ↓ fallback
                                           contexto semántico local
```

El endpoint recibe título, descripción, rover, cámara, misión, keywords, centro y fotógrafo. El prompt pide explícitamente **no repetir la descripción** y agregar contexto histórico, científico o de misión con `response_format: json_object`.

**Fallback semántico**: Si no hay API key, hay error de red, o la cuota está excedida, se genera contexto infiriendo temas del título y metadata (marte, atardecer, pathfinder, atmósfera, etc.) mediante reglas determinísticas.

### API Key: requisitos

OpenAI **no tiene free tier renovable**. Los créditos iniciales se agotan y luego requiere un método de pago. Si no se configura `OPENAI_API_KEY`, el sistema usa el fallback semántico sin errores visibles.

### Alternativas gratuitas (sin tarjeta)

| Provider | Free tier | Modelo sugerido | Cómo cambiar |
|----------|-----------|-----------------|--------------|
| **Groq** | 30 req/min, ~144k tokens/día | `llama-3.3-70b-versatile` | Editar `src/lib/openai.ts`: importar Groq SDK, cambiar `baseURL` y modelo |
| **Google Gemini** | 60 req/min (API estándar) | `gemini-2.0-flash` | Usar `@google/generative-ai`, cambiar tipo de cliente en `enrichment.ts` |
| **Anthropic Claude** | Free tier con límites | `claude-3-haiku-20240307` | Usar `@anthropic-ai/sdk`, cambiar schema de respuesta |

Para cambiar de proveedor: editar `src/lib/openai.ts` (cliente) y `src/lib/enrichment.ts` (llamada + prompt). La estructura de `NasaAiEnrichment` (summary, facts, tags) es agnóstica al provider.

---

## 📈 Diferenciadores elegidos

1. **Timeline interactivo** — Las imágenes se ordenan cronológicamente en una línea de tiempo vertical con dots, thumbnails y metadata.
2. **Sistema de tags** — Sugeridos por IA y persistibles en la base de datos por imagen.
3. **Búsqueda semántica** — Buscar imágenes por descripción natural ("show me sunsets on Mars"). Un parser traduce el texto a parámetros estructurados (rover, cámara, fecha) y llama a la API de NASA.

---

## 🔮 Qué haría con más tiempo

1. **Visualización 3D de planetas** (respuesta a "Sorprendenos"): un Google Maps espacial para ver dónde estaba cada rover cuando tomó cada foto, la trayectoria de la misión y el contexto geográfico. Usaría Three.js o Cesium.js.
2. **Embeddings para búsqueda semántica real** — la actual usa un parser determinista; con embeddings de OpenAI se podría buscar por significado real.
3. **Exportar colecciones a PDF**.
4. **Redis** para rate limiting y caché de NASA API.
5. **Tests de integración** con base de datos real.
6. **Dashboard con estadísticas** de colecciones y actividad.

---

## 🌐 Deploy

**Elegido: Render** — App Next.js + PostgreSQL en un solo proveedor.

### Configuración en Render

1. Crear un **Web Service** desde el repo
2. Agregar un **PostgreSQL** desde el Dashboard de Render
3. Setear variables de entorno en el Web Service:

```env
DATABASE_URL=<url-interna-de-tu-postgres-en-render>
JWT_SECRET=<un-seguro-muy-largo>
NASA_API_KEY=<tu-api-key-nasa>
OPENAI_API_KEY=<tu-api-key-openai>    # Opcional
```

4. Build Command: `npm run build`
5. Start Command: `npm start`

Alternativas válidas: Vercel (mejor para Next.js) o Railway (similar a Render).

---

## 🤝 Contribuciones

Este es un challenge técnico de MindShore. Para participar, forkear el [repo original](https://github.com/mindshoresl/challenge) y abrir un PR.
