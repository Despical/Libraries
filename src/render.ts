type SourceKind = 'maven-central' | 'jitpack'
export type TabKey = 'maven' | 'groovy' | 'kotlin'

interface Coordinates {
    artifactId: string
    groupId: string
    version: string
}

interface LibraryEntry {
    coordinates: Coordinates
    description: string
    docsUrl?: string
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

export interface DashboardData {
    generatedAt: string
    libraries: LibraryEntry[]
}

const tabLabels: Record<TabKey, string> = {
    maven: 'Maven',
    groovy: 'Gradle Groovy',
    kotlin: 'Gradle Kotlin',
}

const profileUrl = 'https://github.com/Despical'
const repositoryUrl = 'https://github.com/Despical/Libraries'
const profileName = 'Despical'
const spigotUrl = 'https://www.spigotmc.org/resources/authors/despical.615094/'
const buyMeACoffeeUrl = 'https://buymeacoffee.com/despical'
const patreonUrl = 'https://patreon.com/despical'
const builtByBitUrl = 'https://builtbybit.com/creators/despical.257098/'

export function renderDashboard(data: DashboardData) {
    const footerLinks = [
        {
            ariaLabel: `Open ${profileName} GitHub profile`,
            href: profileUrl,
            icon: renderGithubIcon(),
            title: 'GitHub',
        },
        {
            ariaLabel: `Open ${profileName} Spigot profile`,
            href: spigotUrl,
            icon: renderBrandIcon('./icons/spigot.svg', 'SpigotMC'),
            title: 'SpigotMC',
        },
        {
            ariaLabel: `Open ${profileName} BuiltByBit profile`,
            href: builtByBitUrl,
            icon: renderBrandIcon('./icons/builtbybit.svg', 'BuiltByBit'),
            title: 'BuiltByBit',
        },
        {
            ariaLabel: `Open ${profileName} Buy Me a Coffee profile`,
            href: buyMeACoffeeUrl,
            icon: renderBrandIcon('./icons/buymeacoffee.svg', 'BuyMeACoffee'),
            title: 'BuyMeACoffee',
        },
        {
            ariaLabel: `Open ${profileName} Patreon profile`,
            href: patreonUrl,
            icon: renderBrandIcon('./icons/patreon.svg', 'Patreon'),
            title: 'Patreon',
        },
    ]

    return `
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
          <a class="icon-link" href="${repositoryUrl}" target="_blank" rel="noreferrer" aria-label="Open ${profileName} Libraries repository on GitHub">
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
            ${footerLinks
        .map(
            (link) => `
                  <a
                    class="icon-link footer-link-icon"
                    href="${link.href}"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="${link.ariaLabel}"
                    title="${link.title}"
                  >
                    ${link.icon}
                  </a>
                `,
        )
        .join('')}
          </nav>
        </div>
      </footer>
    </main>
  `
}

function renderCard(library: LibraryEntry) {
    const docsLink = library.docsUrl
        ? `
          <a class="icon-link icon-link-subtle" href="${library.docsUrl}" target="_blank" rel="noreferrer" aria-label="Open ${library.name} documentation">
            ${renderDocsIcon()}
          </a>
        `
        : ''

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
          ${docsLink}
          <a class="icon-link icon-link-subtle" href="${library.repoUrl}" target="_blank" rel="noreferrer" aria-label="Open ${library.name} repository">
            ${renderGithubIcon()}
          </a>
        </div>
      </div>

      <div class="card-header">
        <div class="card-copy">
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

export function labelForTab(tab: TabKey) {
    return tabLabels[tab]
}

export function escapeHtml(value: string) {
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

function renderBrandIcon(src: string, title: string) {
    return `
    <img class="brand-icon" src="${src}" alt="" aria-hidden="true" data-brand-icon="${title}" />
  `
}

function renderStarIcon() {
    return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 3.7 2.43 4.93 5.44.79-3.94 3.84.93 5.42L12 16.12 7.14 18.68l.93-5.42L4.13 9.42l5.44-.79Z" fill="currentColor" />
    </svg>
  `
}

function renderDocsIcon() {
    return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18.5Zm2.5 2.25a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5Zm0 3.5a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5Zm0 3.5a.75.75 0 0 0 0 1.5h5.25a.75.75 0 0 0 0-1.5Z" fill="currentColor" />
    </svg>
  `
}

export function renderCopyIcon(isCopied = false) {
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
