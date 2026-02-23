import { describe, it, expect } from 'vitest'
import { buildFeatures } from './buildFeatures'
import type { PAFHit } from './types'

function makeHit(overrides: Partial<PAFHit> = {}): PAFHit {
  return {
    queryName: '16S_rRNA',
    queryLen: 1542,
    queryStart: 0,
    queryEnd: 1542,
    strand: '+',
    targetName: 'contig1',
    targetLen: 5000,
    targetStart: 100,
    targetEnd: 1642,
    numMatches: 1500,
    blockLen: 1542,
    mapQ: 60,
    ...overrides,
  }
}

describe('buildFeatures', () => {
  it('converts PAF hit to GFF3Feature with 1-based coords', () => {
    const features = buildFeatures([makeHit()], 'rRNA', 75)
    expect(features).toHaveLength(1)
    const f = features[0]
    expect(f.start).toBe(101)   // targetStart 100 → 1-based 101
    expect(f.end).toBe(1642)
    expect(f.type).toBe('rRNA')
    expect(f.source).toBe('barrnapx')
    expect(f.product).toBe('16S ribosomal RNA')
  })

  it('filters hits below minIdentity', () => {
    // identity = 1000/1542 = 64.8% < 75%
    const features = buildFeatures([makeHit({ numMatches: 1000 })], 'rRNA', 75)
    expect(features).toHaveLength(0)
  })

  it('keeps hits above minIdentity', () => {
    // identity = 1500/1542 = 97.3% >= 75%
    const features = buildFeatures([makeHit()], 'rRNA', 75)
    expect(features).toHaveLength(1)
  })

  it('deduplicates overlapping hits keeping highest score', () => {
    const highScore = makeHit({ numMatches: 1530, targetStart: 100, targetEnd: 1642 })
    const lowScore = makeHit({ numMatches: 1200, targetStart: 200, targetEnd: 1600 })
    const features = buildFeatures([lowScore, highScore], 'rRNA', 75)
    expect(features).toHaveLength(1)
    expect(features[0].score).toBeGreaterThan(98)
  })

  it('returns empty array for empty hits input', () => {
    expect(buildFeatures([], 'rRNA', 75)).toHaveLength(0)
  })

  it('keeps non-overlapping features on the same contig', () => {
    const first  = makeHit({ targetStart: 100, targetEnd: 1642 })
    const second = makeHit({ queryName: '23S_rRNA', targetStart: 2000, targetEnd: 4904 })
    const features = buildFeatures([first, second], 'rRNA', 75)
    expect(features).toHaveLength(2)
  })

  it('keeps features on the same coordinates but opposite strands', () => {
    const plus  = makeHit({ strand: '+', targetStart: 100, targetEnd: 1642 })
    const minus = makeHit({ strand: '-', targetStart: 100, targetEnd: 1642 })
    const features = buildFeatures([plus, minus], 'rRNA', 75)
    expect(features).toHaveLength(2)
  })

  it('assigns tRNA product name for tRNA-Xxx query names', () => {
    const hit = makeHit({ queryName: 'tRNA-Gly', blockLen: 72, numMatches: 70 })
    const features = buildFeatures([hit], 'tRNA', 70)
    expect(features[0].product).toBe('tRNA-Gly transfer RNA')
  })

  it('assigns known ncRNA product for RNaseP_bact', () => {
    const hit = makeHit({ queryName: 'RNaseP_bact', blockLen: 400, numMatches: 380 })
    const features = buildFeatures([hit], 'ncRNA', 65)
    expect(features[0].product).toBe('Bacterial RNase P RNA')
  })

  it('falls back to query name for unknown product', () => {
    const hit = makeHit({ queryName: 'novel_RNA_42' })
    const features = buildFeatures([hit], 'ncRNA', 65)
    expect(features[0].product).toBe('novel_RNA_42')
  })

  it('rounds score to one decimal place', () => {
    // 1234 / 1542 = 80.025...
    const hit = makeHit({ numMatches: 1234, blockLen: 1542 })
    const features = buildFeatures([hit], 'rRNA', 75)
    expect(features[0].score).toBe(Math.round((1234 / 1542) * 1000) / 10)
  })
})
