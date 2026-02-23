import type { PAFHit, GFF3Feature, FeatureType } from './types'

/** Map query names from reference FASTAs to human-readable products */
const PRODUCT_MAP: Record<string, string> = {
  // rRNA
  '5S_rRNA':   '5S ribosomal RNA',
  '16S_rRNA':  '16S ribosomal RNA',
  '23S_rRNA':  '23S ribosomal RNA',
  '5.8S_rRNA': '5.8S ribosomal RNA',
  '18S_rRNA':  '18S ribosomal RNA',
  '28S_rRNA':  '28S ribosomal RNA',
  // tRNA — generic fallback handled separately
  // ncRNA
  'RNaseP_bact': 'Bacterial RNase P RNA',
  'SRP_bact':    'Bacterial signal recognition particle RNA',
  'tmRNA':       'Transfer-messenger RNA',
  '6S_RNA':      '6S RNA',
  'RNaseP_arch': 'Archaeal RNase P RNA',
  'SRP_arch':    'Archaeal signal recognition particle RNA',
  'U1_snRNA':    'U1 small nuclear RNA',
  'U2_snRNA':    'U2 small nuclear RNA',
  'U4_snRNA':    'U4 small nuclear RNA',
  'U5_snRNA':    'U5 small nuclear RNA',
  'U6_snRNA':    'U6 small nuclear RNA',
  'U3_snoRNA':   'U3 small nucleolar RNA',
}

function getProduct(queryName: string): string {
  if (PRODUCT_MAP[queryName]) return PRODUCT_MAP[queryName]
  // tRNA-Gly style names
  if (queryName.startsWith('tRNA-')) return `${queryName} transfer RNA`
  return queryName
}

/**
 * Convert PAF hits to GFF3 features.
 *
 * Identity = numMatches / blockLen * 100
 * PAF coords are 0-based half-open → GFF3 1-based inclusive (start + 1)
 *
 * In PAF: query = reference sequence, target = genome contig
 */
export function buildFeatures(
  hits: PAFHit[],
  type: FeatureType,
  minIdentity: number,
): GFF3Feature[] {
  const features: GFF3Feature[] = []

  for (const hit of hits) {
    const identity = (hit.numMatches / hit.blockLen) * 100
    if (identity < minIdentity) continue

    features.push({
      seqId: hit.targetName,
      source: 'barrnapx',
      type,
      start: hit.targetStart + 1,   // PAF 0-based → GFF3 1-based
      end: hit.targetEnd,            // PAF half-open end = GFF3 inclusive end
      score: Math.round(identity * 10) / 10,
      strand: hit.strand,
      phase: 0,
      name: hit.queryName,
      product: getProduct(hit.queryName),
    })
  }

  return deduplicateFeatures(features)
}

/**
 * Remove overlapping features on the same contig+strand, keeping highest score.
 * Two features overlap if their coordinate ranges share any base.
 */
function deduplicateFeatures(features: GFF3Feature[]): GFF3Feature[] {
  // Group by seqId + strand
  const groups = new Map<string, GFF3Feature[]>()
  for (const f of features) {
    const key = `${f.seqId}::${f.strand}`
    const group = groups.get(key) ?? []
    group.push(f)
    groups.set(key, group)
  }

  const deduplicated: GFF3Feature[] = []
  for (const group of groups.values()) {
    // Sort by score descending, then greedily pick non-overlapping features
    const sorted = [...group].sort((a, b) => b.score - a.score)
    const kept: GFF3Feature[] = []

    for (const candidate of sorted) {
      const overlaps = kept.some(
        (k) => candidate.start <= k.end && candidate.end >= k.start,
      )
      if (!overlaps) {
        kept.push(candidate)
      }
    }
    deduplicated.push(...kept)
  }

  return deduplicated
}
