/**
 * Renders the library dashboard and JSON-LD into the initial HTML response.
 *
 * Run before `vite build`:
 *   node ./scripts/generate-static-html.mjs
 *
 * The script is idempotent.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const rootDir = dirname(fileURLToPath(import.meta.url))
const dataFile = resolve(rootDir, '../public/data/libraries.json')
const indexFile = resolve(rootDir, '../index.html')

const SITE_URL = 'https://libs.despical.dev'
const profileUrl = 'https://github.com/Despical'

const data = JSON.parse(await readFile(dataFile, 'utf8'))
const { libraries } = data

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Despical's Minecraft Plugin Libraries",
      description:
        "Copy-ready Maven and Gradle dependency snippets for Despical's Java Minecraft plugin libraries.",
      publisher: {
        '@type': 'Person',
        name: 'Despical',
        url: profileUrl,
      },
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#library-list`,
      name: "Despical's Minecraft Plugin Libraries",
      url: SITE_URL,
      numberOfItems: libraries.length,
      itemListElement: libraries.map((lib, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareSourceCode',
          name: lib.name,
          description: lib.description,
          url: lib.repoUrl,
          codeRepository: lib.repoUrl,
          programmingLanguage: 'Java',
          runtimePlatform: 'Minecraft Java Edition',
        },
      })),
    },
  ],
}

// Use the same pure renderer as the browser so crawlers and visitors see the same content.
const rendererSource = await readFile(resolve(rootDir, '../src/render.ts'), 'utf8')
const renderer = ts.transpileModule(rendererSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
const { renderDashboard } = await import(`data:text/javascript;base64,${Buffer.from(renderer).toString('base64')}`)
let html = await readFile(indexFile, 'utf8')
const appStart = html.indexOf('<div id="app">')
const appEnd = html.indexOf('<script type="module"', appStart)
if (appStart < 0 || appEnd < 0) throw new Error('Could not locate the application shell in index.html')
html = html.slice(0, appStart) + `<div id="app">${renderDashboard(data)}</div>\n    ` + html.slice(appEnd)

const jsonLdTag = `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`
if (html.includes('application/ld+json')) {
  html = html.replace(/^[\t ]*<script type="application\/ld\+json">[\s\S]*?<\/script>/m, jsonLdTag)
} else {
  html = html.replace('</head>', `${jsonLdTag}\n</head>`)
}

await writeFile(indexFile, html.replace(/[\t ]+$/gm, ''), 'utf8')
console.log(`Rendered dashboard and JSON-LD for ${libraries.length} libraries in index.html`)
