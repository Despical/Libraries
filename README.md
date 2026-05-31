# Despical's Libraries

Static Vite + TypeScript site for listing Despical's libraries with copyable Maven, Gradle Groovy, and Gradle Kotlin snippets.

## Tech stack

- Vite
- TypeScript
- Plain TypeScript rendering in `src/main.ts`
- Static generated data in `public/data/libraries.json`

## Local development

```bash
npm install
npm run update-data
npm run dev
```

## Build commands

```bash
npm run build
```

Rebuild data, pre-render static HTML, and produce the Pages-ready output:

```bash
npm run build:pages
```

`build:pages` runs three steps in order:

1. `update-data` — fetches latest versions from Maven Central / JitPack and writes `public/data/libraries.json`
2. `generate-static` — reads `libraries.json` and injects pre-rendered library cards + JSON-LD structured data into `index.html` so search engines can index the content without executing JavaScript
3. `build` — TypeScript check + Vite production build

## Automation

- `refresh-data.yml` runs every 6 hours and updates `public/data/libraries.json`.
- `deploy.yml` runs on push or manual dispatch, refreshes data again, builds the site, and deploys it to GitHub Pages.

## Updating libraries

Edit `scripts/update-library-data.mjs` when you want to add, remove, or change library entries. That script controls source selection, coordinates, descriptions, badges, stars, and generated snippets.