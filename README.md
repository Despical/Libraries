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

Rebuild data and then produce the Pages-ready output:

```bash
npm run build:pages
```

## Automation

- `refresh-data.yml` runs every 6 hours and updates `public/data/libraries.json`.
- `deploy.yml` runs on push or manual dispatch, refreshes data again, builds the site, and deploys it to GitHub Pages.

## Updating libraries

Edit `scripts/update-library-data.mjs` when you want to add, remove, or change library entries. That script controls source selection, coordinates, descriptions, badges, stars, and generated snippets.