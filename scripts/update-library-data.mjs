import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const outputFile = resolve(rootDir, '../public/data/libraries.json')

const librarySpecs = [
  {
    id: 'commons',
    name: 'Commons',
    description: 'Shared Java and Minecraft utilities for plugin development.',
    owner: 'Despical',
    repo: 'Commons',
    sourceKind: 'maven-central',
    groupId: 'dev.despical',
    artifactId: 'commons',
  },
  {
    id: 'command-framework',
    name: 'CommandFramework',
    description: 'Annotation-driven command framework for Minecraft plugins.',
    owner: 'Despical',
    repo: 'CommandFramework',
    sourceKind: 'maven-central',
    groupId: 'dev.despical',
    artifactId: 'command-framework',
  },
  {
    id: 'inventory-framework',
    name: 'InventoryFramework',
    description: 'GUI and inventory composition framework for server-side menus.',
    owner: 'Despical',
    repo: 'InventoryFramework',
    sourceKind: 'maven-central',
    groupId: 'dev.despical',
    artifactId: 'inventory-framework',
  },
  {
    id: 'file-items',
    name: 'FileItems',
    description: 'YAML-driven item loading utilities for plugin content pipelines.',
    owner: 'Despical',
    repo: 'FileItems',
    sourceKind: 'maven-central',
    groupId: 'dev.despical',
    artifactId: 'file-items',
  },
  {
    id: 'particle-lib',
    name: 'ParticleLib',
    description: 'Cross-version particle API with a fluent builder for visual effects.',
    owner: 'Despical',
    repo: 'ParticleLib',
    sourceKind: 'jitpack',
    groupId: 'com.github.Despical',
    artifactId: 'ParticleLib',
  },
  {
    id: 'item-nbt-api',
    name: 'Item-NBT-API',
    description: 'NBT access layer for item metadata and plugin integrations.',
    owner: 'Despical',
    repo: 'Item-NBT-API',
    sourceKind: 'jitpack',
    groupId: 'com.github.Despical',
    artifactId: 'Item-NBT-API',
  },
]

const sourceHandlers = {
  'maven-central': async ({ groupId, artifactId }) => {
    const metadataUrl = `https://repo.maven.apache.org/maven2/${groupId.replaceAll('.', '/')}/${artifactId}/maven-metadata.xml`
    const xml = await fetchText(metadataUrl)
    const version = extractVersion(xml)

    return {
      sourceLabel: 'Maven Central',
      version,
      versionLink: `https://central.sonatype.com/artifact/${groupId}/${artifactId}`,
      badges: [
        {
          alt: `${artifactId} Maven Central version`,
          href: `https://central.sonatype.com/artifact/${groupId}/${artifactId}`,
          src: `https://img.shields.io/maven-central/v/${groupId}/${artifactId}?style=for-the-badge&label=Maven%20Central`,
        },
      ],
    }
  },
  jitpack: async ({ owner, repo }) => {
    const metadataUrl = `https://jitpack.io/com/github/${owner}/${repo}/maven-metadata.xml`
    const xml = await fetchText(metadataUrl)
    const version = extractVersion(xml)

    return {
      sourceLabel: 'JitPack',
      version,
      versionLink: `https://jitpack.io/#${owner}/${repo}/${version}`,
      badges: [
        {
          alt: `${repo} JitPack version`,
          href: `https://jitpack.io/#${owner}/${repo}`,
          src: `https://img.shields.io/jitpack/v/github/${owner}/${repo}?style=for-the-badge&label=JitPack`,
        },
      ],
    }
  },
}

const libraries = await Promise.all(
  librarySpecs.map(async (spec) => {
    const sourceData = await sourceHandlers[spec.sourceKind](spec)
    const githubData = await fetchGitHubRepoData(spec.owner, spec.repo)
    const version = sourceData.version
    const coordinates = {
      groupId: spec.groupId,
      artifactId: spec.artifactId,
      version,
    }

    return {
      id: spec.id,
      name: spec.name,
      description: spec.description,
      repoUrl: `https://github.com/${spec.owner}/${spec.repo}`,
      stargazersUrl: `https://github.com/${spec.owner}/${spec.repo}`,
      stars: githubData.stars,
      sourceKind: spec.sourceKind,
      sourceLabel: sourceData.sourceLabel,
      versionLink: sourceData.versionLink,
      coordinates,
      badges: [
        ...sourceData.badges,
        {
          alt: `${spec.repo} release badge`,
          href: `https://github.com/${spec.owner}/${spec.repo}/releases`,
          src: `https://img.shields.io/github/v/release/${spec.owner}/${spec.repo}?display_name=tag&style=for-the-badge&label=GitHub`,
        },
      ],
      snippets: {
        maven: createMavenSnippet(spec.sourceKind, coordinates),
        groovy: createGroovySnippet(spec.sourceKind, coordinates),
        kotlin: createKotlinSnippet(spec.sourceKind, coordinates),
      },
    }
  }),
)

const payload = {
  generatedAt: new Date().toISOString(),
  libraries,
}

await mkdir(dirname(outputFile), { recursive: true })
await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(`Updated ${libraries.length} library entries.`)

function createMavenSnippet(sourceKind, coordinates) {
  const repositoryBlock =
    sourceKind === 'jitpack'
      ? `<repositories>\n  <repository>\n    <id>jitpack.io</id>\n    <url>https://jitpack.io</url>\n  </repository>\n</repositories>\n\n`
      : ''

  return `${repositoryBlock}<dependency>\n  <groupId>${coordinates.groupId}</groupId>\n  <artifactId>${coordinates.artifactId}</artifactId>\n  <version>${coordinates.version}</version>\n</dependency>`
}

function createGroovySnippet(sourceKind, coordinates) {
  const repositoryBlock =
    sourceKind === 'jitpack'
      ? `repositories {\n    mavenCentral()\n    maven { url 'https://jitpack.io' }\n}\n\n`
      : ''

  return `${repositoryBlock}dependencies {\n    implementation '${coordinates.groupId}:${coordinates.artifactId}:${coordinates.version}'\n}`
}

function createKotlinSnippet(sourceKind, coordinates) {
  const repositoryBlock =
    sourceKind === 'jitpack'
      ? `repositories {\n    mavenCentral()\n    maven("https://jitpack.io")\n}\n\n`
      : ''

  return `${repositoryBlock}dependencies {\n    implementation("${coordinates.groupId}:${coordinates.artifactId}:${coordinates.version}")\n}`
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'despical-libraries-dashboard',
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with ${response.status}.`)
  }

  return response.text()
}

async function fetchGitHubRepoData(owner, repo) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'despical-libraries-dashboard',
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub repo request failed for ${owner}/${repo} with ${response.status}.`)
  }

  const payload = await response.json()

  return {
    stars: payload.stargazers_count ?? 0,
  }
}

function extractVersion(xml) {
  const latest = extractTag(xml, 'release') ?? extractTag(xml, 'latest')

  if (latest) {
    return latest
  }

  const matches = [...xml.matchAll(/<version>([^<]+)<\/version>/g)]
    .map((match) => match[1]?.trim())
    .filter(Boolean)

  if (matches.length === 0) {
    throw new Error('No version found in maven metadata.')
  }

  return matches.at(-1)
}

function extractTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}>([^<]+)</${tagName}>`))
  return match?.[1]?.trim() ?? null
}