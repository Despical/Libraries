/**
 * Injects a pre-rendered version of the library grid into index.html so
 * search-engine crawlers see the full page content without executing JS.
 *
 * Run before `vite build`:
 *   node ./scripts/generate-static-html.mjs
 *
 * The script is idempotent – re-running it replaces the previous pre-render.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const dataFile = resolve(rootDir, '../public/data/libraries.json')
const indexFile = resolve(rootDir, '../index.html')

const SITE_URL = 'https://libs.despical.dev'
const profileUrl = 'https://github.com/Despical'
const repositoryUrl = 'https://github.com/Despical/Libraries'
const profileName = 'Despical'
const spigotUrl = 'https://www.spigotmc.org/resources/authors/despical.615094/'
const buyMeACoffeeUrl = 'https://buymeacoffee.com/despical'
const patreonUrl = 'https://patreon.com/despical'
const builtByBitUrl = 'https://builtbybit.com/creators/despical.257098/'

const tabLabels = { maven: 'Maven', groovy: 'Gradle Groovy', kotlin: 'Gradle Kotlin' }

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatStarCount(count) {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count)
}

function renderCard(library) {
  const docsLink = library.docsUrl
    ? `<a class="icon-link icon-link-subtle" href="${library.docsUrl}" target="_blank" rel="noreferrer" aria-label="Open ${library.name} documentation">Docs</a>`
    : ''

  const tabButtons = Object.entries(tabLabels)
    .map(
      ([key, label], index) =>
        `<button class="tab-button${index === 0 ? ' is-active' : ''}" type="button" role="tab" ` +
        `aria-selected="${index === 0}" data-library-id="${library.id}" data-tab="${key}">${label}</button>`,
    )
    .join('')

  const tabPanels = Object.keys(tabLabels)
    .map(
      (key, index) =>
        `<div class="snippet-panel snippet-panel-${library.sourceKind}${index === 0 ? ' is-active' : ''}" ` +
        `role="tabpanel" data-library-panel="${library.id}" data-panel="${key}">` +
        `<button class="copy-button" type="button" data-copy="${library.id}:${key}" ` +
        `aria-label="Copy ${tabLabels[key]} snippet" title="Copy"></button>` +
        `<pre class="snippet-box snippet-box-${library.sourceKind}"><code>${escapeHtml(library.snippets[key])}</code></pre>` +
        `</div>`,
    )
    .join('')

  return `
    <article class="library-card" id="${library.id}" data-library-card data-library-anchor="${library.id}">
      <div class="card-topline">
        <div class="card-topline-main">
          <a class="source-pill source-${library.sourceKind}" href="${library.versionLink}" target="_blank" rel="noreferrer">${library.sourceLabel}</a>
          <span class="version-link">v${library.coordinates.version}</span>
        </div>
        <div class="card-link-group">
          <a class="star-link" href="${library.stargazersUrl}" target="_blank" rel="noreferrer" aria-label="${library.name} GitHub stars">${formatStarCount(library.stars)}</a>
          ${docsLink}
          <a class="icon-link icon-link-subtle" href="${library.repoUrl}" target="_blank" rel="noreferrer" aria-label="Open ${library.name} repository">GitHub</a>
        </div>
      </div>
      <div class="card-header">
        <div class="card-copy">
          <div class="card-title-row">
            <a class="card-anchor" href="#${library.id}" aria-label="Link to ${library.name}">#</a>
            <h3>${library.name}</h3>
          </div>
          <p>${library.description}</p>
        </div>
      </div>
      <dl class="coordinates">
        <div><dt>Group</dt><dd>${library.coordinates.groupId}</dd></div>
        <div><dt>Artifact</dt><dd>${library.coordinates.artifactId}</dd></div>
      </dl>
      <div class="card-separator" aria-hidden="true"></div>
      <div class="tab-list" role="tablist" aria-label="Install snippet format">${tabButtons}</div>
      ${tabPanels}
    </article>`
}

// ── Load data ─────────────────────────────────────────────────────────────────

const data = JSON.parse(await readFile(dataFile, 'utf8'))
const { libraries } = data

// ── Static page content ───────────────────────────────────────────────────────

const footerLinks = [
  { href: profileUrl, label: 'GitHub' },
  { href: spigotUrl, label: 'SpigotMC' },
  { href: builtByBitUrl, label: 'BuiltByBit' },
  { href: buyMeACoffeeUrl, label: 'BuyMeACoffee' },
  { href: patreonUrl, label: 'Patreon' },
]

const staticContent = `<main class="shell">
    <section class="topbar">
      <a class="profile-chip" href="${profileUrl}" target="_blank" rel="noreferrer" aria-label="Open ${profileName} GitHub profile">
        <img class="profile-avatar" src="${profileUrl}.png" alt="${profileName} avatar" />
        <span><strong>${profileName}</strong></span>
      </a>
      <div class="topbar-actions">
        <div class="sync-pill" aria-label="Data refreshed ${formatDate(data.generatedAt)}">
          <span class="sync-dot" aria-hidden="true"></span>
          <span class="sync-copy"><strong>${formatDate(data.generatedAt)}</strong></span>
        </div>
        <a class="icon-link" href="${repositoryUrl}" target="_blank" rel="noreferrer" aria-label="Open ${profileName} Libraries repository on GitHub">GitHub</a>
      </div>
    </section>
    <section class="library-grid">
      ${libraries.map(renderCard).join('')}
    </section>
    <footer class="site-footer">
      <div class="footer-separator" aria-hidden="true"></div>
      <div class="footer-meta">
        <p class="footer-copy">&copy; 2026 Berke &quot;Despical&quot; Ak&ccedil;en</p>
        <nav class="footer-links" aria-label="Footer links">
          ${footerLinks
            .map(
              (l) =>
                `<a class="icon-link footer-link-icon" href="${l.href}" target="_blank" rel="noreferrer">${l.label}</a>`,
            )
            .join('')}
        </nav>
      </div>
    </footer>
  </main>`

// ── JSON-LD structured data ───────────────────────────────────────────────────

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

// ── Patch index.html ──────────────────────────────────────────────────────────

let html = await readFile(indexFile, 'utf8')

// Replace #app content – works whether div is empty or already pre-rendered
html = html.replace(/<div id="app">[\s\S]*?<\/div>/, `<div id="app">${staticContent}</div>`)

// Inject or replace JSON-LD block
const jsonLdTag = `  <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n  </script>`
if (html.includes('application/ld+json')) {
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdTag)
} else {
  html = html.replace('</head>', `${jsonLdTag}\n</head>`)
}

await writeFile(indexFile, html, 'utf8')
console.log(`Pre-rendered ${libraries.length} library cards + JSON-LD into index.html`)
