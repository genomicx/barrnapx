import { describe, it, expect } from 'vitest'
import { formatGFF3 } from './formatGFF3'
import type { GFF3Feature } from './types'

const sampleFeature: GFF3Feature = {
  seqId: 'NC_000913.3',
  source: 'barrnapx',
  type: 'rRNA',
  start: 101,
  end: 1642,
  score: 97.3,
  strand: '+',
  phase: 0,
  name: '16S_rRNA',
  product: '16S ribosomal RNA',
}

describe('formatGFF3', () => {
  it('starts with GFF3 version pragma', () => {
    const out = formatGFF3([sampleFeature], 'test.fasta')
    expect(out).toMatch(/^##gff-version 3/)
  })

  it('includes input filename in header', () => {
    const out = formatGFF3([sampleFeature], 'genome.fa')
    expect(out).toContain('##input-file genome.fa')
  })

  it('formats feature columns correctly', () => {
    const out = formatGFF3([sampleFeature], 'test.fasta')
    const lines = out.split('\n').filter((l) => !l.startsWith('#') && l.trim())
    expect(lines).toHaveLength(1)
    const cols = lines[0].split('\t')
    expect(cols[0]).toBe('NC_000913.3')
    expect(cols[1]).toBe('barrnapx')
    expect(cols[2]).toBe('rRNA')
    expect(cols[3]).toBe('101')
    expect(cols[4]).toBe('1642')
    expect(cols[6]).toBe('+')
    expect(cols[7]).toBe('0')
  })

  it('returns header only for empty feature array', () => {
    const out = formatGFF3([], 'empty.fasta')
    expect(out).toMatch(/^##gff-version 3/)
    const dataLines = out.split('\n').filter((l) => !l.startsWith('#') && l.trim())
    expect(dataLines).toHaveLength(0)
  })

  it('formats score to one decimal place', () => {
    const feature = { ...sampleFeature, score: 97.333 }
    const out = formatGFF3([feature], 'test.fasta')
    const dataLine = out.split('\n').find((l) => !l.startsWith('#') && l.trim())!
    const score = dataLine.split('\t')[5]
    expect(score).toBe('97.3')
  })

  it('includes correct ID, Name, and product in attributes', () => {
    const out = formatGFF3([sampleFeature], 'test.fasta')
    const dataLine = out.split('\n').find((l) => !l.startsWith('#') && l.trim())!
    const attrs = dataLine.split('\t')[8]
    expect(attrs).toContain('ID=16S_rRNA_NC_000913.3_101')
    expect(attrs).toContain('Name=16S_rRNA')
    expect(attrs).toContain('product=16S ribosomal RNA')
  })

  it('includes a date header line', () => {
    const out = formatGFF3([sampleFeature], 'test.fasta')
    expect(out).toMatch(/^##date \d{4}-\d{2}-\d{2}$/m)
  })

  it('outputs one data line per feature', () => {
    const second: GFF3Feature = { ...sampleFeature, seqId: 'contig2', start: 500, end: 600 }
    const out = formatGFF3([sampleFeature, second], 'test.fasta')
    const dataLines = out.split('\n').filter((l) => !l.startsWith('#') && l.trim())
    expect(dataLines).toHaveLength(2)
  })
})
