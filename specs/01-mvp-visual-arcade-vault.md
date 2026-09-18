# SPEC 01 — MVP visual de Arcade Vault

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-09-18
> **Objective:** Migrar el prototipo estático de `references/templates/` a rutas reales de Next.js 16 App Router, implementando solo la parte visual e interactiva de las 5 pantallas (Biblioteca, Detalle, Reproductor placeholder, Auth y Salón de la Fama), sin lógica de juego real ni persistencia entre recargas.

## Scope

**In:**

- Migrar `references/templates/*.jsx` (app, nav, biblioteca, detalle, reproductor, auth, salon, data) de React vía CDN/Babel a componentes TSX de Next.js 16 App Router.
- 5 pantallas navegables con rutas reales: Biblioteca (`/`), Detalle de juego (`/juegos/[id]`), Reproductor placeholder (`/juegos/[id]/jugar`), Auth (`/auth`) y Salón de la Fama (`/salon-de-la-fama`).
- Barra de navegación (`Nav`) responsive con menú hamburguesa en móvil, integrada en `app/layout.tsx`.
- Catálogo de juegos y datos semilla de ranking mockeados en `app/data/`, simulando lo que eventualmente vendrá de una base de datos.
- Sesión de usuario (login mock: cualquier usuario/contraseña entra, o modo invitado) y puntuaciones guardadas al final de una partida, ambas en memoria de React (Context), sin persistencia entre recargas.
- Reutilización tal cual del "reproductor" simulado del template (HUD, puntuación automática, vidas, nivel, pausa, modal de fin de partida) como placeholder visual, hasta que se implementen los juegos reales en specs futuras.
- Ajuste de `app/globals.css` si falta algo del `styles.css` del template, y uso de Tailwind CSS v4 para cualquier estilo nuevo no cubierto por ese CSS ya migrado.
- Componentes y hooks compartidos entre pantallas en una carpeta `common/` en la raíz del proyecto.

**Out of scope (for future specs):**

- Implementación de cualquier juego real (Bloque Buster, Caída, Serpentina, etc.) — el reproductor sigue siendo una maqueta visual.
- Backend real, base de datos, o API — `app/data/` es un mock estático en código.
- Autenticación real (OAuth de Google/GitHub, validación de credenciales, JWT, etc.) — los botones sociales del template son solo decorativos.
- Persistencia real de sesión o puntuaciones (localStorage, cookies, IndexedDB, base de datos) — todo vive en memoria y se pierde al recargar la página.
- Multijugador, sonido, PWA/offline, pagos o sistema de créditos funcional.

## Data model

```ts
// common/types.ts
export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string; // clase CSS del template, ej. "cover-bricks"
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/AAAA"
}

export interface Session {
  name: string; // nombre de usuario o "INVITADO"
}
```

- `app/data/games.ts`: exporta `GAMES: Game[]` y `CATS: string[]` (copiados de `data.jsx`).
- `app/data/ranking.ts`: exporta `PLAYERS: string[]` y `seededScores(seed, count): ScoreRow[]` (misma función determinista del template).
- No hay esquema de base de datos ni versionado: todo es un módulo de datos estático importado directamente.

## Implementation plan

1. Crear `common/types.ts` con `Game`, `ScoreRow` y `Session`.
2. Crear `app/data/games.ts` y `app/data/ranking.ts` portando `GAMES`, `CATS`, `PLAYERS` y `seededScores` desde `references/templates/data.jsx`.
3. Crear `common/session/session-context.tsx`: `SessionProvider` (Context de React, client component) con `user`, `login(name)`, `logout()`, `scores` y `saveScore(entry)`, todo en memoria.
4. Integrar `SessionProvider` en `app/layout.tsx`, envolviendo `children`.
5. Crear `common/components/nav.tsx` portando `nav.jsx` (logo, links activos según ruta actual con `usePathname`, menú móvil, estado de sesión) e integrarlo en `app/layout.tsx` sobre el `main` existente.
6. Crear `common/components/game-card.tsx` portando el `GameCard` de `biblioteca.jsx` (incluye el efecto tilt con `useRef`).
7. Reescribir `app/page.tsx` como la Biblioteca: hero, buscador, chips de categoría y grid de `GameCard`, usando `GAMES`/`CATS` de `app/data`.
8. Crear `app/juegos/[id]/page.tsx` (Detalle) portando `detalle.jsx`, usando `seededScores` para el leaderboard y `notFound()` si el `id` no existe en `GAMES`.
9. Crear `app/juegos/[id]/jugar/page.tsx` (Reproductor) portando `reproductor.jsx` tal cual (client component): HUD, CRT, simulación de puntuación, pausa, modal de fin de partida que llama a `saveScore` del `SessionProvider`.
10. Crear `app/auth/page.tsx` portando `auth.jsx`: tabs iniciar sesión/crear cuenta, modo invitado, botones sociales decorativos, todos llamando a `login()` del `SessionProvider` y redirigiendo a `/` con `useRouter`.
11. Crear `app/salon-de-la-fama/page.tsx` portando `salon.jsx`: tabs por juego, podio top 3, tabla completa y fila "tu mejor marca" cuando hay sesión activa.
12. Revisar `app/globals.css` contra `references/templates/styles.css` y añadir cualquier clase/animación faltante; eliminar el placeholder original de `app/page.tsx`.
13. Ejecutar `bun run lint` y `bun run build`, y probar manualmente las 5 pantallas con `bun dev` verificando navegación, responsive y que ningún flujo dependa de `localStorage`.

## Acceptance criteria

- [ ] `/` muestra la Biblioteca con buscador y chips de categoría que filtran el grid de tarjetas en el cliente.
- [ ] `/juegos/[id]` muestra la información del juego (etiquetas, descripción, estadísticas) y el leaderboard mock correspondiente a ese `id`.
- [ ] Un `id` de juego inexistente en `/juegos/[id]` muestra la página 404 de Next.js.
- [ ] `/juegos/[id]/jugar` muestra el HUD (jugador, puntuación, vidas, nivel), el marco CRT con la simulación visual, y permite pausar/reanudar.
- [ ] Terminar la partida en `/juegos/[id]/jugar` abre el modal de fin de partida, permite ingresar iniciales y guardar la puntuación en el `SessionProvider` (sin persistir tras recargar).
- [ ] `/auth` permite alternar entre "Iniciar sesión" y "Crear cuenta", entrar como invitado, y redirige a `/` dejando una sesión activa en memoria.
- [ ] `/salon-de-la-fama` muestra podio (top 3), tabla completa por juego seleccionado, y la fila "tu mejor marca" solo cuando hay sesión activa.
- [ ] El `Nav` resalta la ruta activa, es responsive (menú hamburguesa en móvil) y muestra el nombre de usuario o el botón de inicio de sesión según el estado del `SessionProvider`.
- [ ] Recargar la página en cualquier ruta borra la sesión y las puntuaciones guardadas (confirmando que no hay persistencia).
- [ ] No queda ningún archivo `.jsx` ni referencia a React vía CDN/Babel dentro de `app/` o `common/`.
- [ ] `bun run lint` y `bun run build` terminan sin errores.

## Decisions

- **Sí:** rutas reales de Next.js App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon-de-la-fama`) en vez de SPA con routing por hash. Es el patrón estándar del proyecto y da URLs limpias y navegación nativa.
- **Sí:** sesión y puntuaciones en memoria de React (`SessionProvider`), sin `localStorage` ni backend. Decisión explícita del usuario para este MVP: se acepta perder el estado al recargar.
- **No:** persistencia real (localStorage, DB). Queda fuera de este MVP; puede abordarse en un spec futuro si se decide agregar backend.
- **Sí:** catálogo de juegos y datos semilla del ranking centralizados en `app/data/`, simulando el origen futuro desde base de datos.
- **Sí:** componentes y hooks compartidos entre pantallas en `common/` en la raíz, no dentro de `app/`, por preferencia explícita del usuario.
- **Sí:** se conserva tal cual la simulación de partida del template (puntuación automática, vidas, nivel, pausa, modal de fin) como placeholder visual del reproductor, ya que el usuario confirmó que ahí irán los juegos reales más adelante.
- **Sí:** Tailwind CSS v4 se usa para todo lo nuevo que no esté ya cubierto por los estilos migrados en `app/globals.css`; el CSS del template no se reescribe a utilidades.

## Risks

| Risk                                                                 | Mitigation                                                                                          |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Al no persistir la sesión, cualquier prueba manual del flujo login → puntuación → salón de la fama se pierde al recargar. | Documentar en el QA manual que el flujo debe probarse sin recargar la página; es un comportamiento esperado, no un bug. |
| Next.js 16 introduce cambios de compatibilidad (por ejemplo, params dinámicos) respecto a versiones anteriores. | Consultar `node_modules/next/dist/docs/` antes de escribir las rutas dinámicas, como indica `AGENTS.md`. |

## What is **not** in this spec

- Implementación de juegos reales jugables.
- Backend, base de datos o autenticación real.
- Persistencia de sesión o puntuaciones entre recargas.
- Multijugador, sonido, PWA/offline o sistema de créditos funcional.

Cada uno de estos, si se implementa, va en su propio spec.
