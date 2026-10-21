import './style.css'

import { renderDashboard, renderCopyIcon, labelForTab, escapeHtml, type DashboardData, type TabKey } from './render'

const cardSelector = '[data-library-card]'

const appRootElement = document.querySelector<HTMLDivElement>('#app')

if (!appRootElement) {
    throw new Error('App root not found.')
}

const appRoot: HTMLDivElement = appRootElement

if (!appRoot.querySelector(cardSelector)) appRoot.innerHTML = `
  <main class="shell loading-shell">
    <p class="eyebrow">Preparing dependency hub</p>
    <h1>Loading current library versions...</h1>
  </main>
`

// Inject scroll-to-top button
const scrollBtn = document.createElement('button')
scrollBtn.className = 'scroll-to-top'
scrollBtn.type = 'button'
scrollBtn.setAttribute('aria-label', 'Scroll to top')
scrollBtn.innerHTML = `
  <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true" focusable="false">
    <path class="scroll-arrow-stem" d="M16 24V8.5" />
    <path class="scroll-arrow-head" d="M10.75 13.75 16 8.5l5.25 5.25" />
  </svg>
`
scrollBtn.style.display = 'none'
document.body.appendChild(scrollBtn)

let scrollBtnVisible = false
let scrollBtnFadeTimeout: number | undefined

window.addEventListener('scroll', () => {
    const show = window.scrollY > window.innerHeight * 1.2
    if (show && !scrollBtnVisible) {
        scrollBtnVisible = true
        scrollBtn.style.display = 'flex'
        scrollBtn.classList.add('fade-in')
        scrollBtn.classList.remove('fade-out')
    } else if (!show && scrollBtnVisible) {
        scrollBtnVisible = false
        scrollBtn.classList.remove('fade-in')
        scrollBtn.classList.add('fade-out')
        if (scrollBtnFadeTimeout) window.clearTimeout(scrollBtnFadeTimeout)
        scrollBtnFadeTimeout = window.setTimeout(() => {
            scrollBtn.style.display = 'none'
        }, 350)
    }
})

scrollBtn.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'})
})

void initialize()

type ScrollMode = ScrollBehavior | false

async function initialize() {
    try {
        const response = await fetch('./data/libraries.json', {cache: 'no-store'})

        if (!response.ok) {
            throw new Error(`Could not load dashboard data (${response.status}).`)
        }

        const data = (await response.json()) as DashboardData
        appRoot.innerHTML = renderDashboard(data)
        bindInteractions()
        syncHashSelection(window.location.hash ? 'auto' : false)
    } catch (error) {
        if (!appRoot.querySelector(cardSelector)) {
            renderError(error instanceof Error ? error.message : 'Unexpected error.')
        } else {
            bindInteractions()
            syncHashSelection(window.location.hash ? 'auto' : false)
        }
    }
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
        activeCard?.scrollIntoView({behavior: scrollBehavior, block: 'center'})
    })
}

function normalizeHash(value: string) {
    return decodeURIComponent(value.replace(/^#/, '').trim()).toLowerCase()
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
