export type Kingdom = 'bac' | 'arc' | 'fun'
export type FeatureType = 'rRNA' | 'tRNA' | 'ncRNA'

export interface GFF3Feature {
  seqId: string
  source: string          // 'barrnapx'
  type: FeatureType
  start: number           // 1-based, inclusive
  end: number
  score: number           // % identity (0-100)
  strand: '+' | '-'
  phase: number           // always 0 for RNA
  name: string            // e.g. '16S_rRNA', 'tRNA-Gly'
  product: string         // human-readable label
}

export interface BarrnapOptions {
  kingdom: Kingdom
  detectRrna: boolean
  detectTrna: boolean
  detectNcrna: boolean
  legacyMode: boolean     // rRNA only, mirrors barrnap <1.0
}

export const DEFAULT_OPTIONS: BarrnapOptions = {
  kingdom: 'bac',
  detectRrna: true,
  detectTrna: true,
  detectNcrna: true,
  legacyMode: false,
}

export interface SequenceInfo {
  name: string
  length: number
}

export interface BarrnapResult {
  features: GFF3Feature[]
  sequences: SequenceInfo[]
  gff3Text: string
  inputFileName: string
  featureCount: Record<FeatureType, number>
}

/** Raw PAF alignment hit from minimap2 */
export interface PAFHit {
  queryName: string
  queryLen: number
  queryStart: number
  queryEnd: number
  strand: '+' | '-'
  targetName: string
  targetLen: number
  targetStart: number
  targetEnd: number
  numMatches: number
  blockLen: number
  mapQ: number
}
