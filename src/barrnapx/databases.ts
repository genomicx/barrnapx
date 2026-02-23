import type { Kingdom, FeatureType } from './types'

const cache = new Map<string, string>()

async function fetchRef(path: string): Promise<string> {
  if (cache.has(path)) return cache.get(path)!
  const resp = await fetch(path)
  if (!resp.ok) throw new Error(`Failed to load reference: ${path} (${resp.status})`)
  const text = await resp.text()
  cache.set(path, text)
  return text
}

const KINGDOM_DIR: Record<Kingdom, string> = {
  bac: 'bacteria',
  arc: 'archaea',
  fun: 'fungi',
}

const RRNA_FILES: Record<Kingdom, string[]> = {
  bac: ['16S.fasta', '23S.fasta', '5S.fasta'],
  arc: ['16S.fasta', '23S.fasta', '5S.fasta'],
  fun: ['18S.fasta', '28S.fasta', '5.8S.fasta', '5S.fasta'],
}

/**
 * Load and concatenate all reference FASTA sequences for a given kingdom + feature type.
 * Returns a single multi-FASTA string.
 */
export async function loadReferenceSequences(
  kingdom: Kingdom,
  featureType: FeatureType,
): Promise<string> {
  const dir = KINGDOM_DIR[kingdom]
  let files: string[]

  if (featureType === 'rRNA') {
    files = RRNA_FILES[kingdom].map((f) => `/data/${dir}/${f}`)
  } else if (featureType === 'tRNA') {
    files = [`/data/tRNA/${dir}.fasta`]
  } else {
    // ncRNA
    files = [`/data/ncRNA/${dir}.fasta`]
  }

  const parts = await Promise.all(files.map(fetchRef))
  return parts.join('\n')
}
