# SPEC 02 — Home landing y Acerca de

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-09-20
> **Objective:** Migrar `references/templates/home-about/*.jsx` a Next.js 16 App Router, moviendo la Biblioteca actual de `/` a `/games` para liberar `/` como landing page (Home) de marketing, y agregando una pantalla "Acerca de" con formulario de contacto simulado en `/about`.

## Scope

**In:**

- Nueva landing page (`Home`) en `/`, portada de `references/templates/home-about/home.jsx`: hero con siluetas flotantes decorativas, sección "por qué Arcade Vault", preview de juegos (mini-rail), sección de estadísticas, actividad en vivo (últimas puntuaciones y top jugadores del día), sección de precios (plan único gratis + FAQ), y CTA final.
- Mover la Biblioteca actual (contenido íntegro de `app/page.tsx`: hero, buscador, chips de categoría, grid de `GameCard`) de `/` a `/games`.
- Nueva página "Acerca de" en `/about`, portada de `about.jsx`: hero de misión, fila de highlights, banner divisor decorativo, y sección de contacto con formulario mock (nombre, correo, mensaje).
- Actualizar `common/components/nav.tsx`: agregar enlaces "Inicio" (`/`) y "Acerca de" (`/about`), y cambiar el enlace "Biblioteca" para que apunte a `/games` (tanto en el nav de escritorio como en el panel móvil), ajustando `isActive` en consecuencia.
- Actualizar los tres enlaces "volver a la biblioteca" que hoy apuntan a `/` (`app/juegos/[id]/page.tsx`, `app/juegos/[id]/jugar/page.tsx`, `app/salon-de-la-fama/page.tsx`) para que apunten a `/games`.
- Migrar a `app/globals.css` las clases CSS de `references/templates/home-about/styles.css` que falten (prefijos `home-*`, `about-*`, `contact-*`, `mini-*`, `feature-*`, `ft-*`, `stat-*`, `activity-*`, `tick-*`, `top-*`, `pricing-*`, `price-*`, `pc-*`, `faq-*`, `highlight-*`, `hl-*`, `div-*` y animaciones asociadas como `.reveal`/`.in`).
- El hook `useReveal` (IntersectionObserver que agrega la clase `in` a los elementos `.reveal` al hacer scroll) se porta tal cual, como hook local de cada página o compartido en `common/` si ambas pantallas lo usan igual.
- El formulario de contacto de "Acerca de" valida que los tres campos no estén vacíos (si falta alguno, aplica el efecto `shake` del template) y, al enviarse correctamente, muestra la animación de "terminal de éxito" ya existente en el template — sin llamar a ningún backend ni persistir el mensaje.
- Los datos de "últimas puntuaciones" y "top jugadores" del Home siguen siendo arrays estáticos embebidos en el componente, igual que en el template (no se conectan a `app/data/ranking.ts`).

**Out of scope (for future specs):**

- Envío real de mensajes de contacto (backend, email, guardado en base de datos).
- Conectar las secciones "actividad en vivo" y "top jugadores" del Home a datos reales o mockeados desde `app/data/`.
- Sistema de créditos funcional (el contador "CRÉDITOS · 03" del Nav sigue siendo decorativo, sin cambios respecto a spec 01).
- Cualquier cambio a las pantallas ya implementadas en spec 01 más allá de los enlaces y el Nav mencionados arriba.

## Data model

No se introduce ningún tipo, estructura de datos ni módulo nuevo en `app/data/` o `common/types.ts`. Los datos usados en Home (features, mini-rail de juegos vía `GAMES` existente, estadísticas, actividad en vivo, top jugadores, precios, FAQ) y en About (highlights) permanecen como arrays literales dentro de cada componente, igual que en el template original.

## Implementation plan

1. Revisar `references/templates/home-about/styles.css` contra `app/globals.css` y añadir las clases y animaciones faltantes (secciones listadas en Scope).
2. Crear `app/games/page.tsx` moviendo tal cual el contenido actual de `app/page.tsx` (Biblioteca: hero, buscador, chips, grid).
3. Reescribir `app/page.tsx` como la nueva landing (`Home`), portando `home.jsx`: `FloatingSilhouettes`, `MiniCard`, `FeatureIcon` y el hook `useReveal`, usando `GAMES` de `app/data/games.ts` para el mini-rail (primeros 6 juegos) y enlazando "EXPLORAR JUEGOS" / "VER TODOS LOS JUEGOS" a `/games`, "CREAR CUENTA" / "EMPEZAR GRATIS" a `/auth`, y cada `MiniCard` a `/juegos/[id]`.
4. Crear `app/about/page.tsx` portando `about.jsx`: hero de misión, highlights, banner divisor, y formulario de contacto mock con validación y animación de terminal de éxito.
5. Actualizar `common/components/nav.tsx`: agregar "Inicio" (`/`) y "Acerca de" (`/about`) a los links de escritorio y del panel móvil, cambiar "Biblioteca" para apuntar a `/games`, y actualizar `isActive` para distinguir `/` (Inicio) de `/games` + `/juegos/*` (Biblioteca).
6. Actualizar los tres `<Link href="/">` de "volver a biblioteca" en `app/juegos/[id]/page.tsx`, `app/juegos/[id]/jugar/page.tsx` y `app/salon-de-la-fama/page.tsx` para que apunten a `/games`.
7. Ejecutar `bun run lint` y `bun run build`, y probar manualmente con `bun dev`: navegación completa entre `/`, `/games`, `/about`, `/juegos/[id]`, `/salon-de-la-fama` y `/auth`, el estado activo del Nav en cada ruta, el efecto `reveal` al hacer scroll, y el flujo del formulario de contacto (vacío → shake; completo → terminal de éxito → "enviar otro mensaje").

## Acceptance criteria

- [x] `/` muestra la landing page (Home) con hero, siluetas flotantes, sección "por qué Arcade Vault", mini-rail de juegos, estadísticas, actividad en vivo, precios/FAQ y CTA final.
- [x] `/games` muestra la Biblioteca (buscador, chips de categoría, grid de `GameCard`) exactamente con el mismo comportamiento que tenía antes en `/`.
- [x] `/about` muestra el hero de misión, la fila de highlights, y la sección de contacto.
- [x] En `/about`, enviar el formulario de contacto con algún campo vacío dispara el efecto visual `shake` y no muestra el mensaje de éxito.
- [x] En `/about`, enviar el formulario con los tres campos completos muestra la animación de "terminal de éxito" con el nombre ingresado, y el botón "enviar otro mensaje" limpia el formulario sin recargar la página.
- [x] El Nav muestra "Inicio", "Biblioteca", "Salón de la Fama" y "Acerca de", cada uno resaltado como activo en su ruta correspondiente (`/`, `/games` + `/juegos/*`, `/salon-de-la-fama`, `/about`), tanto en escritorio como en el panel móvil.
- [x] Los botones "EXPLORAR JUEGOS" y "VER TODOS LOS JUEGOS →" del Home navegan a `/games`; los botones "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/auth`; cada tarjeta del mini-rail navega a `/juegos/[id]` del juego correspondiente; "VER SALÓN →" navega a `/salon-de-la-fama`.
- [x] Los enlaces "volver a la biblioteca" en Detalle de juego, Reproductor y Salón de la Fama apuntan a `/games` (ya no a `/`).
- [x] Las secciones marcadas con `.reveal` en Home y About aplican la animación de entrada al hacer scroll hasta ellas.
- [x] `bun run lint` y `bun run build` terminan sin errores.

## Decisions

- **Sí:** `/` pasa a ser la landing page (Home) de marketing y la Biblioteca se mueve a `/games`. Decisión explícita del usuario, replica la separación de rutas "Inicio"/"Biblioteca" que ya trae el Nav del template original.
- **Sí:** "Acerca de" vive en `/about` (slug en inglés, no `/acerca-de`). Decisión explícita del usuario.
- **Sí:** el formulario de contacto se mantiene como mock visual (valida campos vacíos, simula el envío con la animación de terminal), sin backend real ni persistencia del mensaje — consistente con el resto del MVP definido en spec 01.
- **No:** conectar "actividad en vivo" / "top jugadores" del Home a datos reales de `app/data/ranking.ts`. Quedan como arrays estáticos igual que en el template; conectar esto a datos reales es una decisión para un spec futuro cuando exista backend de partidas.
- **Sí:** el hook `useReveal` y las animaciones de scroll (`IntersectionObserver`) se portan tal cual desde el template, sin reemplazarlas por una librería de animación.

## What is **not** in this spec

- Envío real de mensajes de contacto o cualquier backend asociado.
- Datos reales o persistentes para "actividad en vivo" y "top jugadores" del Home.
- Cambios funcionales al sistema de créditos, autenticación o puntuaciones ya definidos en spec 01.

Cada uno de estos, si se implementa, va en su propio spec.
