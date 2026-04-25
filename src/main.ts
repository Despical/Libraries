import './style.css'

type SourceKind = 'maven-central' | 'jitpack'
type TabKey = 'maven' | 'groovy' | 'kotlin'

interface Coordinates {
  artifactId: string
  groupId: string
  version: string
}

interface LibraryEntry {
  coordinates: Coordinates
  description: string
  id: string
  name: string
  repoUrl: string
  snippets: Record<TabKey, string>
  stars: number
  stargazersUrl: string
  sourceKind: SourceKind
  sourceLabel: string
  versionLink: string
}

interface DashboardData {
  generatedAt: string
  libraries: LibraryEntry[]
}

const cardSelector = '[data-library-card]'

const tabLabels: Record<TabKey, string> = {
  maven: 'Maven',
  groovy: 'Gradle Groovy',
  kotlin: 'Gradle Kotlin',
}

const profileUrl = 'https://github.com/Despical'
const profileName = 'Despical'
const spigotUrl = 'https://www.spigotmc.org/resources/authors/despical.615094/'
const buyMeACoffeeUrl = 'https://buymeacoffee.com/despical'
const patreonUrl = 'https://patreon.com/despical'

const appRootElement = document.querySelector<HTMLDivElement>('#app')

if (!appRootElement) {
  throw new Error('App root not found.')
}

const appRoot: HTMLDivElement = appRootElement

appRoot.innerHTML = `
  <main class="shell loading-shell">
    <p class="eyebrow">Preparing dependency hub</p>
    <h1>Loading current library versions...</h1>
  </main>
`

void initialize()

type ScrollMode = ScrollBehavior | false

async function initialize() {
  try {
    const response = await fetch('./data/libraries.json', { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`Could not load dashboard data (${response.status}).`)
    }

    const data = (await response.json()) as DashboardData
    renderDashboard(data)
    bindInteractions()
    syncHashSelection(window.location.hash ? 'auto' : false)
  } catch (error) {
    renderError(error instanceof Error ? error.message : 'Unexpected error.')
  }
}

function renderDashboard(data: DashboardData) {
  appRoot.innerHTML = `
    <main class="shell">
      <section class="topbar">
        <a class="profile-chip" href="${profileUrl}" target="_blank" rel="noreferrer" aria-label="Open ${profileName} GitHub profile">
          <img class="profile-avatar" src="${profileUrl}.png" alt="${profileName} avatar" />
          <span>
            <strong>${profileName}</strong>
          </span>
        </a>

        <div class="topbar-actions">
          <div class="sync-pill" aria-label="Data refreshed ${formatDate(data.generatedAt)}">
            <span class="sync-dot" aria-hidden="true"></span>
            <span class="sync-copy">
              <strong>${formatDate(data.generatedAt)}</strong>
            </span>
          </div>
          <a class="icon-link" href="${profileUrl}" target="_blank" rel="noreferrer" aria-label="Open ${profileName} on GitHub">
            ${renderGithubIcon()}
          </a>
        </div>
      </section>

      <section class="library-grid">
        ${data.libraries.map((library) => renderCard(library)).join('')}
      </section>

      <footer class="site-footer">
        <div class="footer-separator" aria-hidden="true"></div>
        <div class="footer-meta">
          <p class="footer-copy">&copy; 2026 Berke &quot;Despical&quot; Akçen</p>
          <nav class="footer-links" aria-label="Footer links">
            <a href="${spigotUrl}" target="_blank" rel="noreferrer">Spigot</a>
            <a href="${profileUrl}" target="_blank" rel="noreferrer">GitHub</a>
            <a href="${buyMeACoffeeUrl}" target="_blank" rel="noreferrer">BuyMeACoffee</a>
            <a href="${patreonUrl}" target="_blank" rel="noreferrer">Patreon</a>
          </nav>
        </div>
      </footer>
    </main>
  `
}

function renderCard(library: LibraryEntry) {
  const tabButtons = (Object.entries(tabLabels) as Array<[TabKey, string]>)
    .map(
      ([key, label], index) => `
        <button
          class="tab-button${index === 0 ? ' is-active' : ''}"
          type="button"
          role="tab"
          aria-selected="${index === 0}"
          data-library-id="${library.id}"
          data-tab="${key}"
        >
          ${label}
        </button>
      `,
    )
    .join('')

  const tabPanels = (Object.keys(tabLabels) as TabKey[])
    .map(
      (key, index) => `
        <div
          class="snippet-panel snippet-panel-${library.sourceKind}${index === 0 ? ' is-active' : ''}"
          role="tabpanel"
          data-library-panel="${library.id}"
          data-panel="${key}"
        >
          <button
            class="copy-button"
            type="button"
            data-copy="${library.id}:${key}"
            aria-label="Copy ${labelForTab(key)} snippet"
            title="Copy"
          >
            ${renderCopyIcon()}
          </button>
          <pre class="snippet-box snippet-box-${library.sourceKind}"><code>${escapeHtml(library.snippets[key])}</code></pre>
        </div>
      `,
    )
    .join('')

  return `
    <article class="library-card" id="${library.id}" data-library-card data-library-anchor="${library.id}">
      <div class="card-topline">
        <div class="card-topline-main">
          <a class="source-pill source-${library.sourceKind}" href="${library.versionLink}" target="_blank" rel="noreferrer" aria-label="Open ${library.sourceLabel} page for ${library.name}">
            ${library.sourceLabel}
          </a>
          <span class="version-link">v${library.coordinates.version}</span>
        </div>
        <div class="card-link-group">
          <a class="star-link" href="${library.stargazersUrl}" target="_blank" rel="noreferrer" aria-label="Open ${library.name} GitHub page to star the repository">
            ${renderStarIcon()}
            <span>${formatStarCount(library.stars)}</span>
          </a>
          <a class="icon-link icon-link-subtle" href="${library.repoUrl}" target="_blank" rel="noreferrer" aria-label="Open ${library.name} repository">
            ${renderGithubIcon()}
          </a>
        </div>
      </div>

      <div class="card-header">
        <div>
          <div class="card-title-row">
            <a class="card-anchor" href="#${library.id}" aria-label="Link to ${library.name}">
              ${renderAnchorIcon()}
            </a>
            <h3>${library.name}</h3>
          </div>
          <p>${library.description}</p>
        </div>
      </div>

      <dl class="coordinates">
        <div>
          <dt>Group</dt>
          <dd>${library.coordinates.groupId}</dd>
        </div>
        <div>
          <dt>Artifact</dt>
          <dd>${library.coordinates.artifactId}</dd>
        </div>
      </dl>

      <div class="card-separator" aria-hidden="true"></div>

      <div class="tab-list" role="tablist" aria-label="Install snippet format">
        ${tabButtons}
      </div>

      ${tabPanels}
    </article>
  `
}

function bindInteractions() {
  window.addEventListener('hashchange', () => {
    syncHashSelection('smooth')
  })

  appRoot.addEventListener('click', async (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const anchorLink = target.closest<HTMLAnchorElement>('.card-anchor')

    if (anchorLink) {
      event.preventDefault()
      updateHashTarget(anchorLink.getAttribute('href') ?? '')
      return
    }

    const tabButton = target.closest<HTMLButtonElement>('[data-tab]')

    if (tabButton) {
      activateTab(tabButton.dataset.libraryId ?? '', tabButton.dataset.tab as TabKey)
      return
    }

    const copyButton = target.closest<HTMLButtonElement>('[data-copy]')

    if (copyButton) {
      const snippet = copyButton.closest('.snippet-panel')?.querySelector('code')?.textContent ?? ''

      if (!snippet) {
        return
      }

      await navigator.clipboard.writeText(snippet)
      copyButton.innerHTML = renderCopyIcon(true)
      copyButton.setAttribute('aria-label', 'Copied')
      copyButton.title = 'Copied'
      window.setTimeout(() => {
        copyButton.innerHTML = renderCopyIcon()
        const panel = copyButton.dataset.copy?.split(':')[1] as TabKey | undefined
        copyButton.setAttribute('aria-label', `Copy ${labelForTab(panel ?? 'maven')} snippet`)
        copyButton.title = 'Copy'
      }, 1400)
    }
  })
}

function updateHashTarget(hash: string) {
  if (!hash.startsWith('#')) {
    return
  }

  if (window.location.hash !== hash) {
    window.history.pushState(null, '', hash)
  }

  syncHashSelection('smooth')
}

function syncHashSelection(scrollBehavior: ScrollMode = false) {
  const normalizedHash = normalizeHash(window.location.hash)
  const cards = document.querySelectorAll<HTMLElement>(cardSelector)

  let activeCard: HTMLElement | null = null

  cards.forEach((card) => {
    const anchor = card.dataset.libraryAnchor ?? card.id
    const isActive = normalizedHash !== '' && normalizeHash(anchor) === normalizedHash
    card.classList.toggle('is-targeted', isActive)

    if (isActive) {
      activeCard = card
    }
  })

  if (!activeCard) {
    return
  }

  if (!scrollBehavior) {
    return
  }

  window.requestAnimationFrame(() => {
    activeCard?.scrollIntoView({ behavior: scrollBehavior, block: 'center' })
  })
}

function normalizeHash(value: string) {
  return decodeURIComponent(value.replace(/^#/, '').trim()).toLowerCase()
}

function labelForTab(tab: TabKey) {
  return tabLabels[tab]
}

function activateTab(libraryId: string, tab: TabKey) {
  const buttons = document.querySelectorAll<HTMLButtonElement>(`[data-library-id="${libraryId}"]`)
  const panels = document.querySelectorAll<HTMLDivElement>(`[data-library-panel="${libraryId}"]`)

  buttons.forEach((button) => {
    const isActive = button.dataset.tab === tab
    button.classList.toggle('is-active', isActive)
    button.setAttribute('aria-selected', String(isActive))
  })

  panels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.panel === tab)
  })
}

function renderError(message: string) {
  appRoot.innerHTML = `
    <main class="shell loading-shell">
      <p class="eyebrow">Dashboard unavailable</p>
      <h1>Version data could not be loaded.</h1>
      <p class="error-copy">${escapeHtml(message)}</p>
    </main>
  `
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatStarCount(value: number) {
  return new Intl.NumberFormat('en', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)
}

function renderGithubIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.66-.22.66-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.09 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.31.1-2.74 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.85c.85 0 1.7.12 2.5.35 1.9-1.34 2.74-1.06 2.74-1.06.55 1.43.21 2.48.1 2.74.64.72 1.03 1.64 1.03 2.77 0 3.96-2.34 4.82-4.57 5.08.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.17.59.67.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" fill="currentColor" />
    </svg>
  `
}

function renderStarIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 3.7 2.43 4.93 5.44.79-3.94 3.84.93 5.42L12 16.12 7.14 18.68l.93-5.42L4.13 9.42l5.44-.79Z" fill="currentColor" />
    </svg>
  `
}

function renderCopyIcon(isCopied = false) {
  return isCopied
    ? `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9.55 16.6 5.7 12.75l1.4-1.4 2.45 2.45 7.35-7.35 1.4 1.4Z" fill="currentColor" />
    </svg>
  `
    : `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v9h-2V7h-7V5Zm-3 4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Zm2 0v8h7v-8Z" fill="currentColor" />
    </svg>
  `
}

function renderAnchorIcon() {
  return `
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M7.775 3.275a.75.75 0 0 1 0 1.06L5.56 6.55a1.75 1.75 0 0 0 2.475 2.475l1.14-1.14a.75.75 0 1 1 1.06 1.06l-1.14 1.14A3.25 3.25 0 0 1 4.5 5.49l2.215-2.215a.75.75 0 0 1 1.06 0Zm.45 9.45a.75.75 0 0 1 0-1.06l2.215-2.215A1.75 1.75 0 0 0 7.965 6.975l-1.14 1.14a.75.75 0 1 1-1.06-1.06l1.14-1.14A3.25 3.25 0 0 1 11.5 10.51l-2.215 2.215a.75.75 0 0 1-1.06 0Z" fill="currentColor" />
    </svg>
  `
}
