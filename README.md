<p align="center">
  <h1 align="center">🎓 Deltos — Sistema de Gestión de Proyectos Académicos</h1>
  <p align="center">
    API REST robusta construida con <strong>Node.js</strong>, <strong>Express</strong>, <strong>TypeScript</strong> y <strong>Prisma ORM</strong> para la gestión integral de eventos, equipos, proyectos y evaluaciones académicas.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-5.19-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📑 Tabla de Contenidos

- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Diagrama de Entidad-Relación (UML)](#-diagrama-de-entidad-relación-uml)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Ejecución](#-ejecución)
- [Docker](#-docker)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Scripts Disponibles](#-scripts-disponibles)
- [Buenas Prácticas y Notas](#-buenas-prácticas-y-notas)
- [Autores](#-autores)

---

## 🛠 Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|-----------|
| **Runtime** | Node.js 20 (Alpine) |
| **Lenguaje** | TypeScript 6.x |
| **Framework** | Express 4.x |
| **ORM** | Prisma 5.19 |
| **Base de Datos** | MySQL 8.0 |
| **Autenticación** | JSON Web Tokens (jsonwebtoken + bcryptjs) |
| **Validación** | Zod 4.x |
| **Documentación** | Swagger (swagger-jsdoc + swagger-ui-express) |
| **Generación PDF** | PDFKit |
| **Generación Excel** | ExcelJS / xlsx |
| **Carga de Archivos** | Multer |
| **Contenedores** | Docker + Docker Compose |
| **Hot Reload (dev)** | tsx |

---

## 🏗 Arquitectura del Sistema

El backend implementa una **arquitectura multicapa modular** con separación clara de responsabilidades por dominio:

```mermaid
flowchart TD
    classDef frontend fill:#41B883,stroke:#35495E,stroke-width:1px,color:#ffffff
    classDef entry    fill:#FEF3C7,stroke:#B45309,stroke-width:1px,color:#78350F
    classDef layer    fill:#EDE9FE,stroke:#6D28D9,stroke-width:1px,color:#4C1D95
    classDef helper   fill:#F3F4F6,stroke:#6B7280,stroke-width:1px,color:#374151
    classDef database fill:#DBEAFE,stroke:#1D4ED8,stroke-width:1px,color:#1E3A8A

    Client["💻 Cliente — Frontend Vue 3<br/><i>Vite · Pinia · Router · Axios · Tailwind</i>"]:::frontend

    subgraph Backend ["🐳 Backend Node.js + Express + TypeScript (Docker)"]
        direction TB
        API["🚀 app.ts / server.ts<br/><i>Middlewares · Rutas base · Swagger</i>"]:::entry
        Auth["🛡️ Auth middleware (JWT)"]:::helper

        subgraph Modulo ["📦 Módulo de dominio (ej. Proyectos)"]
            direction TB
            Router["📡 Router — capa de presentación<br/><i>proyecto.router.ts</i>"]:::layer
            Zod["✅ Zod schema<br/><i>proyecto.schema.ts</i>"]:::helper
            Service["⚙️ Service — capa de negocio<br/><i>proyecto.service.ts</i>"]:::layer
            Mapper["🔄 Mapper<br/><i>proyecto.mapper.ts</i>"]:::helper
            ErrorH["⚠️ Error handler<br/><i>captura AppError</i>"]:::helper
            Repository["💾 Repository — capa de datos<br/><i>proyecto.repository.ts</i>"]:::layer
        end

        Prisma["🗃️ Prisma Client (ORM)"]:::entry
    end

    DB[("🛢️ MySQL 8.0")]:::database

    Client -- "Petición HTTP / REST" --> API
    API --> Auth
    Auth --> Router
    Router --> Service
    Service --> Repository
    Repository --> Prisma
    Prisma -- "TCP/IP" --> DB

    Router -. "valida entrada" .-> Zod
    Service -. "formatea DTOs" .-> Mapper
    Service -. "lanza excepción" .-> ErrorH
```

**Flujo de una petición:**

1. El **Cliente Vue 3** envía una petición HTTP.
2. **Express** la recibe y aplica middlewares globales (CORS, JSON parser).
3. El **Auth Middleware** verifica el JWT y extrae el usuario.
4. El **Role Middleware** válida que el rol del usuario tenga acceso.
5. El **Router** del módulo correspondiente valida el body con **Zod** y delega al **Service**.
6. El **Service** ejecuta la lógica de negocio, usa **Mappers** para transformar datos y lanza **AppError** en caso de fallo.
7. El **Repository** interactúa con **Prisma Client** para las operaciones en base de datos.
8. La respuesta regresa por el mismo camino al cliente.

---

## 📂 Estructura del Proyecto

```
e2_backend/
├── docker-compose.yml          # Orquestación de servicios
├── backend/
│   ├── Dockerfile              # Build multi-stage (build + producción)
│   ├── docker-entrypoint.sh    # Migraciones automáticas al arrancar
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── .env                    # Variables locales (no versionado)
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── prisma/
│   │   ├── schema.prisma       # Definición de modelos y relaciones
│   │   ├── seed.ts             # Script de datos iniciales
│   │   └── migrations/         # Historial de migraciones
│   ├── src/
│   │   ├── server.ts           # Punto de entrada (arranque del servidor)
│   │   ├── app.ts              # Configuración de Express, rutas y middlewares
│   │   ├── config.ts           # Validación de env con Zod
│   │   ├── errors.ts           # Clase AppError personalizada
│   │   ├── prisma.config.ts    # Instancia singleton de PrismaClient
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # Verificación JWT
│   │   │   ├── role.middleware.ts   # Control de acceso por rol
│   │   │   └── error.middleware.ts  # Manejador global de errores
│   │   ├── modules/            # Módulos de dominio
│   │   │   ├── admin/          # Dashboard y preferencias admin
│   │   │   ├── auth/           # Registro, login, perfil, avatar
│   │   │   ├── avances/        # Bitácora de avances (participante)
│   │   │   ├── carreras/       # Catálogo de carreras
│   │   │   ├── constancias/    # Gestión de constancias/certificados
│   │   │   ├── criterios/      # Criterios de evaluación
│   │   │   ├── equipos/        # Gestión de equipos y miembros
│   │   │   ├── eventos/        # CRUD de eventos y asignación de jueces
│   │   │   ├── invitaciones/   # Invitaciones entre participantes
│   │   │   ├── jueces/         # Dashboard y evaluaciones del juez
│   │   │   ├── participante/   # Dashboard completo del participante
│   │   │   ├── perfiles/       # Catálogo de perfiles (roles de equipo)
│   │   │   ├── proyectos/      # CRUD de proyectos
│   │   │   ├── reportes/       # Generación de reportes PDF
│   │   │   └── resultados/     # Rankings y constancias de resultados
│   │   ├── users/              # CRUD de usuarios (admin)
│   │   └── utils/
│   │       └── pdf.service.ts  # Servicio de generación de PDFs
│   └── uploads/                # Archivos subidos (avatares, etc.)
└── frontend/                   # Aplicación Vue 3 (separada)
```

---

## 📊 Diagrama de Entidad-Relación (UML)

```mermaid
erDiagram
    users {
        int id
        string name
        string email
        string password
        string avatar
        string carrera
        string no_control
        string telefono
        string role
    }

    eventos {
        int id
        string nombre
        string descripcion
        string fecha_inicio
        string fecha_fin
        int max_jueces
    }

    equipos {
        int id
        string nombre
        int max_programadores
        int max_disenadores
        int max_testers
    }

    proyectos {
        int id
        int equipo_id
        int evento_id
        string nombre
        string descripcion
        string repositorio_url
    }

    equipo_miembros {
        int id
        int equipo_id
        int user_id
        string rol
    }

    equipo_interacciones {
        int id
        int equipo_id
        int user_id
        string tipo
        string estado
        string mensaje
        int perfil_id
    }

    evaluacion_criterios {
        int id
        int evento_id
        string nombre
        float ponderacion
    }

    evaluaciones {
        int id
        int proyecto_id
        int juez_id
        int criterio_id
        float puntuacion
        string comentario
    }

    evento_jueces {
        int evento_id
        int user_id
    }

    proyecto_avances {
        int id
        int proyecto_id
        string descripcion
        string fecha
    }

    certificados {
        int id
        int user_id
        int evento_id
        string tipo
        string archivo_path
        string codigo_qr
    }

    user_preferences {
        int id
        int user_id
        string settings
    }

    carreras {
        int id
        string nombre
        string clave
    }

    perfiles {
        int id
        string nombre
    }


    users ||--o{ equipo_miembros : participa
    users ||--o{ equipo_interacciones : interacciones
    users ||--o{ evaluaciones : evalua
    users ||--o{ certificados : obtiene
    users ||--o{ evento_jueces : juez
    users ||--o| user_preferences : tiene

    equipos ||--o{ equipo_miembros : miembros
    equipos ||--o{ equipo_interacciones : acciones
    equipos ||--o{ proyectos : proyectos

    eventos ||--o{ proyectos : contiene
    eventos ||--o{ evaluacion_criterios : criterios
    eventos ||--o{ evento_jueces : jueces
    eventos ||--o{ certificados : certificados

    proyectos ||--o{ evaluaciones : evaluaciones
    proyectos ||--o{ proyecto_avances : avances

    evaluacion_criterios ||--o{ evaluaciones : puntua

    perfiles ||--o{ equipo_interacciones : perfil
```
---

## ⚙️ Instalación

### Requisitos Previos

- **Node.js** ≥ 20
- **MySQL** 8.0 corriendo con la base de datos `gestor_proyectos` creada
- **npm** (incluido con Node.js)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-organizacion/e2_backend.git
cd e2_backend

# 2. Instalar dependencias del backend
cd backend
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales reales

# 4. Generar el cliente Prisma
npx prisma generate

# 5. Aplicar migraciones a la base de datos
npx prisma db push

# 6. (Opcional) Poblar la base de datos con datos de prueba
npm run seed
```

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en `backend/` basado en `.env.example`:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor Express | `3001` |
| `DB_HOST` | Host de la base de datos MySQL | `127.0.0.1` |
| `DB_PORT` | Puerto de MySQL | `3306` |
| `DB_NAME` | Nombre de la base de datos | `gestor_proyectos` |
| `DB_USER` | Usuario de MySQL | `root` |
| `DB_PASS` | Contraseña de MySQL | `****` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `****` |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token | `24h` |
| `DATABASE_URL` | URL de conexión Prisma | `mysql://user:pass@host:port/db` |

---

## 🚀 Ejecución

### Desarrollo (Hot Reload)

```bash
cd backend
npm run dev
```

- **API:** [http://localhost:3001](http://localhost:3001)
- **Swagger Docs:** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)
- **Health Check:** [http://localhost:3001/health](http://localhost:3001/health)

### Producción

```bash
cd backend
npm run build    # Compila TypeScript → dist/
npm start        # Ejecuta dist/server.js
```

---

## 🐳 Docker

El proyecto incluye un `docker-compose.yml` con **3 servicios** pre-configurados:

| Servicio | Contenedor | Puerto Externo | Puerto Interno |
|----------|-----------|----------------|----------------|
| MySQL 8.0 | `e2_mysql` | `3307` | `3306` |
| Backend Node.js | `e2_backend` | `3002` | `3001` |
| Frontend Vue.js | `e2_frontend` | `8080` | `80` |

### Levantar todo con Docker Compose

```bash
# Desde la raíz del proyecto
docker compose up --build -d
```

### Detener los servicios

```bash
docker compose down
```

### Características del contenedor Backend

- **Build multi-stage:** Etapa de compilación (TypeScript → JavaScript) y etapa de producción ligera.
- **Migraciones automáticas:** El `docker-entrypoint.sh` ejecuta `prisma db push` al arrancar el contenedor, sincronizando el esquema automáticamente.
- **Volumen persistente:** Los archivos subidos (`uploads/`) se persisten mediante un volumen Docker.

---

## 📡 Endpoints de la API

> 📖 Documentación interactiva completa en **[/api-docs](http://localhost:3001/api-docs)** (Swagger UI).

### 🔓 Autenticación (`/api/auth`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registrar nuevo usuario |
| `POST` | `/api/auth/login` | Iniciar sesión (devuelve JWT) |
| `GET` | `/api/auth/me` | Obtener perfil del usuario autenticado |
| `POST` | `/api/auth/logout` | Cerrar sesión |
| `PUT` | `/api/auth/profile` | Actualizar información personal |
| `PUT` | `/api/auth/password` | Cambiar contraseña |
| `POST` | `/api/auth/avatar` | Subir foto de perfil (multipart) |

### 🔴 Rutas de Administrador (`/api/admin/...`) — Rol: `ADMIN`

<details>
<summary><b>👥 Usuarios</b> — <code>/api/admin/usuarios</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar usuarios (paginado, filtrable) |
| `GET` | `/exportar` | Exportar usuarios a Excel (.xlsx) |
| `POST` | `/` | Crear usuario |
| `GET` | `/:id` | Obtener usuario por ID |
| `PUT` | `/:id` | Actualizar usuario |
| `DELETE` | `/:id` | Eliminar usuario |

</details>

<details>
<summary><b>📅 Eventos</b> — <code>/api/admin/eventos</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar eventos (paginado) |
| `GET` | `/jueces/disponibles` | Jueces disponibles para asignar |
| `POST` | `/` | Crear evento |
| `GET` | `/:id` | Obtener evento por ID |
| `PUT` | `/:id` | Actualizar evento |
| `DELETE` | `/:id` | Eliminar evento |
| `POST` | `/:id/jueces` | Asignar juez al evento |
| `DELETE` | `/:id/jueces/:userId` | Remover juez del evento |
| `POST` | `/:eventoId/criterios` | Agregar criterio de evaluación |

</details>

<details>
<summary><b>📏 Criterios</b> — <code>/api/admin/criterios</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/:id` | Obtener criterio por ID |
| `PUT` | `/:id` | Actualizar criterio |
| `DELETE` | `/:id` | Eliminar criterio |

</details>

<details>
<summary><b>👥 Equipos</b> — <code>/api/admin/equipos</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar equipos (paginado, filtrable) |
| `POST` | `/` | Crear equipo |
| `GET` | `/:id` | Obtener equipo por ID |
| `PUT` | `/:id` | Actualizar equipo |
| `DELETE` | `/:id` | Eliminar equipo |
| `POST` | `/:id/miembros` | Agregar miembro |
| `DELETE` | `/:id/miembros/:participanteId` | Remover miembro |

</details>

<details>
<summary><b>📁 Proyectos</b> — <code>/api/admin/proyectos</code></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Listar proyectos (paginado, filtrable) |
| `GET` | `/:id` | Obtener proyecto por ID |
| `POST` | `/` | Crear proyecto |
| `PUT` | `/:id` | Actualizar proyecto |
| `DELETE` | `/:id` | Eliminar proyecto |

</details>

<details>
<summary><b>📊 Dashboard, Reportes y Más</b></summary>

| Módulo | Método | Ruta | Descripción |
|--------|--------|------|-------------|
| Dashboard | `GET` | `/api/admin/dashboard` | Métricas del dashboard |
| Dashboard | `POST` | `/api/admin/dashboard/preferences` | Guardar preferencias de widgets |
| Dashboard | `GET` | `/api/admin/dashboard/report` | Generar reporte PDF del dashboard |
| Resultados | `GET` | `/api/admin/resultados` | Ranking de proyectos por evento |
| Resultados | `GET` | `/api/admin/resultados/constancia/:proyectoId/:posicion` | Descargar constancia PDF |
| Constancias | `GET` | `/api/admin/constancias` | Listar constancias |
| Constancias | `GET` | `/api/admin/constancias/:id` | Detalle de constancia |
| Reportes | `GET` | `/api/admin/reportes` | Estadísticas generales |
| Reportes | `GET` | `/api/admin/reportes/usuarios/pdf` | PDF de usuarios |
| Reportes | `GET` | `/api/admin/reportes/equipos/pdf` | PDF de equipos |
| Reportes | `GET` | `/api/admin/reportes/eventos/pdf` | PDF de eventos |
| Reportes | `GET` | `/api/admin/reportes/proyectos/pdf` | PDF de proyectos |
| Carreras | `GET/POST` | `/api/admin/carreras` | CRUD catálogo de carreras |
| Carreras | `GET/PUT/DELETE` | `/api/admin/carreras/:id` | Operaciones por ID |
| Perfiles | `GET/POST` | `/api/admin/perfiles` | CRUD catálogo de perfiles |
| Perfiles | `GET/PUT/DELETE` | `/api/admin/perfiles/:id` | Operaciones por ID |

</details>

### 🟡 Rutas de Juez (`/api/juez/...`) — Rol: `JUEZ`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/juez/dashboard` | Dashboard del juez |
| `GET` | `/api/juez/eventos/:eventoId` | Detalle de evento asignado |
| `GET` | `/api/juez/evaluacion/:proyectoId` | Formulario de evaluación |
| `POST` | `/api/juez/evaluacion/:proyectoId` | Guardar evaluación |

### 🟢 Rutas de Participante (`/api/participante/...`) — Rol: `PARTICIPANTE`

<details>
<summary><b>Ver todos los endpoints del participante</b></summary>

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/dashboard` | Dashboard completo del participante |
| `GET` | `/dashboard/registro-inicial` | Datos para registro académico |
| `POST` | `/dashboard/registro-inicial` | Guardar registro académico |
| `GET` | `/eventos-disponibles` | Eventos abiertos para inscripción |
| `GET` | `/eventos-proximos` | Alias de eventos disponibles |
| `GET` | `/equipos-disponibles` | Equipos con vacantes en un evento |
| `POST` | `/equipos` | Crear equipo y proyecto |
| `DELETE` | `/equipos/salir` | Abandonar equipo |
| `GET` | `/avances` | Listar avances del proyecto |
| `POST` | `/avances` | Registrar nuevo avance |
| `PUT` | `/avances/:id` | Actualizar avance |
| `DELETE` | `/avances/:id` | Eliminar avance |
| `GET` | `/invitaciones/mis` | Invitaciones recibidas |
| `POST` | `/invitaciones/equipo/:equipoId` | Enviar invitación |
| `GET` | `/invitaciones/equipo/:equipoId/enviadas` | Invitaciones enviadas |
| `POST` | `/invitaciones/:id/aceptar` | Aceptar invitación |
| `POST` | `/invitaciones/:id/rechazar` | Rechazar invitación |
| `GET` | `/resultados` | Resultados/ranking del participante |

</details>

### ⚙️ Rutas del Sistema

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/` | Health check con info de la API |
| `GET` | `/health` | Health check simple |
| `GET` | `/api-docs` | Swagger UI (documentación interactiva) |

---

## 📜 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| **dev** | `npm run dev` | Servidor de desarrollo con hot reload (tsx watch) |
| **build** | `npm run build` | Compilar TypeScript a JavaScript (`dist/`) |
| **start** | `npm start` | Ejecutar el build de producción |
| **seed** | `npm run seed` | Poblar la base de datos con datos iniciales |

### Comandos Prisma útiles

```bash
npx prisma studio          # Editor visual de base de datos
npx prisma db push         # Sincronizar esquema sin migración
npx prisma migrate dev     # Crear migración de desarrollo
npx prisma generate        # Regenerar el cliente Prisma
```

---

## 📌 Buenas Prácticas y Notas

- **Validación de entorno:** Las variables de entorno se validan al arrancar usando Zod. Si faltan o son inválidas, el servidor no arranca y muestra errores descriptivos.
- **Autenticación JWT:** Todos los endpoints (excepto `/api/auth/register`, `/api/auth/login`, `/health` y `/`) requieren un token Bearer válido.
- **Control de acceso por roles:** Tres roles (`ADMIN`, `JUEZ`, `PARTICIPANTE`) con guards middleware por grupo de rutas.
- **Validación de entrada:** Schemas Zod en cada módulo para validación de payloads antes de llegar al servicio.
- **Manejo de errores centralizado:** Clase `AppError` personalizada + middleware global que captura excepciones y errores de validación.
- **Serialización BigInt:** Los valores `BigInt` de Prisma se serializan automáticamente como strings en las respuestas JSON.
- **Migraciones Docker automáticas:** `docker-entrypoint.sh` ejecuta `prisma db push` al iniciar el contenedor, evitando desincronización del esquema.
- **Soft Deletes:** Los modelos `carreras` y `perfiles` implementan soft delete via campo `deleted_at`.
- **Generación de reportes:** PDFs generados con PDFKit y exportaciones Excel con ExcelJS, ambos streameados directamente al cliente.

---

## 👥 Autores

| Nombre | Rol |
|--------|-----|
| **García Pino Leonardo Sadot** | Desarrollo Backend & Frontend |
| **Hernández Díaz Leonardo** | Desarrollo Backend & Frontend |
| **Sánchez Pérez Carlos Raúl** | Desarrollo Backend & Frontend |



---

<p align="center">
  <sub>
    Hecho con ❤️ usando Node.js, Express, TypeScript y Prisma — Deltos &copy; 2026
  </sub>
</p>
