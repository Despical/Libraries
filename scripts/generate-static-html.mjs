/**
 * Keeps index.html lean for deployment while still updating the JSON-LD block.
 *
 * Run before `vite build`:
 *   node ./scripts/generate-static-html.mjs
 *
 * The script is idempotent.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const noscriptContent = `<noscript>
        <main class="shell loading-shell">
          <p class="eyebrow">JavaScript required</p>
          <h1>This page needs JavaScript enabled.</h1>
        </main>
      </noscript>`

let html = await readFile(indexFile, 'utf8')

html = html.replace(/<div id="app">[\s\S]*?<\/div>/, `<div id="app">\n      ${noscriptContent}\n    </div>`)

const jsonLdTag = `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`
if (html.includes('application/ld+json')) {
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdTag)
} else {
  html = html.replace('</head>', `${jsonLdTag}\n</head>`)
}

await writeFile(indexFile, html, 'utf8')
console.log(`Updated JSON-LD for ${libraries.length} libraries in index.html`)
