# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault: plataforma para jugar online y competir por puntuación. El proyecto sigue Spec Driven Design (comandos `/spec` y `/spec-impl`) según las prácticas de https://github.com/Klerith/fernando-skills, instalables con `npx skills@latest add Klerith/fernando-skills`.

El código de la app aún no está implementado: actualmente es el scaffold por defecto de `create-next-app` (App Router).

## Skills
Usa siempre /frontend-design para diseñar la interfaaz de usuario.

## Commands

Gestor de paquetes: `bun` (ver `packageManager` en package.json).

- `bun dev` — servidor de desarrollo (Next.js con Turbopack por defecto)
- `bun run build` — build de producción
- `bun start` — sirve el build de producción
- `bun run lint` — ESLint (flat config, `eslint-config-next`)

No hay suite de tests configurada todavía.

## Architecture

- App Router de Next.js 16, sin carpeta `src/` (código en `app/` desde la raíz).
- Alias de import `@/*` apunta a la raíz del repo (ver `tsconfig.json`).
- Estilos con Tailwind CSS v4 vía `@tailwindcss/postcss` (`app/globals.css`).
- **Importante**: Next.js 16 introduce cambios que rompen compatibilidad respecto a versiones anteriores. Antes de escribir código nuevo, consultar la guía relevante en `node_modules/next/dist/docs/` (resuelta desde la ubicación de `AGENTS.md`) y respetar los avisos de deprecación ahí indicados.
