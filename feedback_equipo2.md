# Feedback – Equipo 2: Gestión de Proyectos Académicos
**Stack:** Node.js + Express + TypeScript · Vue · MySQL (Prisma ORM)  
**Fecha de revisión:** 22 de abril de 2025

---

## Resumen general

El equipo entrega un proyecto con muy buen nivel de madurez técnica. La arquitectura multicapas modular, la cobertura de funcionalidades (jueces, criterios, evaluaciones, constancias, reportes) y la integración de Swagger demuestran un trabajo sostenido y comprensión clara de los conceptos del curso.

---

## Lo que están haciendo bien ✅

### Arquitectura multicapas modular
Cada módulo de negocio (`proyectos`, `equipos`, `jueces`, `criterios`, `eventos`, `avances`, etc.) tiene su propia carpeta con la misma estructura interna de 3 capas:

```
modulo/
  ├── modulo.router.ts      → capa de presentación: recibe HTTP, llama al service
  ├── modulo.service.ts     → capa de negocio: lógica, validaciones, orquestación
  ├── modulo.repository.ts  → capa de datos: queries con Prisma
  ├── modulo.schema.ts      → validación de entrada con Zod
  └── modulo.types.ts       → tipos TypeScript del módulo
```

Esta consistencia es valiosa: la arquitectura en capas está presente y es uniforme en todo el proyecto, no solo en algunos módulos.

### Separación Router → Service → Repository
El flujo es claro: el router recibe la petición HTTP y delega al service; el service contiene la lógica de negocio; el repository se encarga exclusivamente del acceso a datos con Prisma. Ninguna capa hace el trabajo de otra.

### DTOs con Zod
Los esquemas Zod en `modulo.schema.ts` actúan como DTOs de entrada: definen y validan exactamente qué campos acepta cada operación. Esto protege las capas internas de datos malformados o inesperados.

### Autenticación con JWT
Tienen `auth.middleware.ts` con validación de tokens JWT que protege las rutas. El flujo de registro/login está implementado en `auth.service.ts` y `auth.repository.ts`.

### Swagger / OpenAPI
La documentación de la API está configurada con `swagger-jsdoc` y los comentarios JSDoc en los routers. Está disponible en `/api-docs`.

### Docker
Tienen `Dockerfile` y `docker-compose.yml` que cubre backend y frontend, lo que facilita reproducir el ambiente completo. Esto corresponde al tema de ambientes de desarrollo y despliegue del curso.

### README funcional
El README describe cómo correr el backend y el frontend, qué puertos usa cada uno, los prerrequisitos y los scripts disponibles. Es claro y útil.

---

## Áreas de mejora 🔧

### El repositorio se instancia directamente dentro del módulo del service

En `ProyectoService` (y probablemente en otros services) el repositorio se crea así:

```ts
// Dentro del archivo proyecto.service.ts, fuera de la clase
const proyectoRepository = new ProyectoRepository();
```

Esto funciona, pero tiene un problema: el service está acoplado a una implementación concreta del repositorio. Si en algún momento necesitan reemplazarlo o probarlo de forma aislada, no pueden hacerlo sin modificar el service.

La alternativa es usar inyección de dependencias: el repositorio se recibe desde afuera, en lugar de crearse adentro:

```ts
export class ProyectoService {
  constructor(private readonly repo: ProyectoRepository) {}

  async getProyectoById(id: number) {
    const proyecto = await this.repo.findById(id);
    // ...
  }
}

// Al usar el service, se pasa el repositorio:
const service = new ProyectoService(new ProyectoRepository());
```

Con este patrón, la capa de negocio no decide qué implementación de repositorio usar — esa decisión queda fuera.

### Lógica de transformación de datos mezclada con lógica de negocio

En `ProyectoService.getProyectoById()` hay bloques largos de código que convierten BigInt a Number, renombran campos y construyen alias (`calificaciones` = copia de `evaluaciones`) para compatibilidad con el frontend. Toda esa transformación no es lógica de negocio — es mapeo de formato.

Lo correcto es extraer eso a una función o clase separada dentro del mismo módulo:

```ts
// proyecto.mapper.ts
export function toProyectoResponse(proyecto: any) {
  return {
    ...proyecto,
    id: Number(proyecto.id),
    equipo_id: Number(proyecto.equipo_id),
    evaluaciones: proyecto.evaluaciones.map(toEvaluacionResponse),
    // ...
  };
}
```

Y en el service:

```ts
import { toProyectoResponse } from './proyecto.mapper';

async getProyectoById(id: number) {
  const proyecto = await this.repo.findById(id);
  if (!proyecto) throw new AppError(404, 'Proyecto no encontrado');
  return { success: true, data: toProyectoResponse(proyecto) };
}
```

El service queda limpio y cada función tiene una responsabilidad.

### Errores lanzados como objetos literales

En varios services los errores se lanzan así:

```ts
throw { status: 404, message: 'Proyecto no encontrado' };
```

Esto tiene dos problemas: no genera un stack trace (lo que dificulta el debugging) y no es una instancia de `Error`, por lo que algunos manejadores de errores pueden ignorarlo.

La forma correcta en TypeScript es crear una clase de error personalizada:

```ts
// errors.ts
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
```

Y usarla así:

```ts
import { AppError } from '../../errors';

throw new AppError(404, 'Proyecto no encontrado');
```

El manejador global de Express puede entonces verificar `if (err instanceof AppError)` y usar `err.statusCode` con confianza.

### Falta diagrama de arquitectura en el README

El README cubre instrucciones de ejecución pero no incluye un diagrama de arquitectura. Para la actividad 10 y la presentación final es requerido. Puede ser un diagrama de capas mostrando cómo fluye una petición desde el frontend hasta la base de datos.

---

## Calificación conceptual

| Criterio | Evaluación |
|---|---|
| Arquitectura multicapas modular | ✅ Excelente |
| Separación Router / Service / Repository | ✅ Bien aplicado |
| DTOs con Zod | ✅ Presente |
| Autenticación JWT | ✅ Implementado |
| Swagger / OpenAPI | ✅ Configurado |
| Docker | ✅ Presente |
| README | ✅ Funcional |
| Inyección de dependencias | ⚠️ Acoplamiento directo — mejorable |
| Separación de mapeo vs. lógica de negocio | ⚠️ Mezclados en el service |
| Manejo de errores | ⚠️ Objetos literales en lugar de clases Error |
| Diagrama de arquitectura | ❌ No encontrado |

---

## Recomendación final

Proyecto sólido con muy buena cobertura funcional y arquitectura bien planteada. Para la presentación final enfóquense en: (1) agregar el diagrama de arquitectura al README, y (2) poder explicar con claridad la responsabilidad de cada capa. Los puntos de mejora son refinamientos de diseño, no problemas estructurales — el sistema funciona y está bien organizado.

---

## Sugerencias adicionales de buenas prácticas

Estas son mejoras aplicables en el tiempo que queda, sin afectar la funcionalidad:

**1. Crear un archivo `errors.ts` centralizado**
Definir la clase `AppError` en un solo lugar y reemplazar todos los `throw { status, message }` del proyecto. Es un cambio de búsqueda y reemplazo guiado que toma menos de una hora.

**2. Asignar tipos explícitos a los parámetros `any` en los routers**
En los routers hay varios `(req: any, res: any)`. Usar `Request` y `Response` de Express activa el autocompletado y detecta errores en tiempo de compilación:
```ts
import { Request, Response, NextFunction } from 'express';
router.get('/', async (req: Request, res: Response) => { ... });
```

**3. Usar variables de entorno para la URL de la base de datos en el `schema.prisma`**
Verificar que `DATABASE_URL` no esté hardcodeada en ningún archivo del repositorio. Si existe un `.env.example` con los nombres de las variables (sin valores reales), es suficiente para documentar qué se necesita configurar.

**4. Agregar un health check endpoint**
Un endpoint simple `GET /health` que retorne `{ status: 'ok' }` es útil para verificar que el servidor está corriendo, especialmente al usar Docker. Es una línea de código:
```ts
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
```

**5. Mover las importaciones de routers al inicio del archivo `app.ts`**
En el `app.ts` actual hay importaciones de módulos mezcladas en la mitad del archivo entre la configuración de middlewares y las rutas. La convención es que todas las importaciones estén al inicio del archivo. Es un cambio cosmético pero mejora la legibilidad.
