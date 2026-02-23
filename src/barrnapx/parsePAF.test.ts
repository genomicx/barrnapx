import { describe, it, expect } from 'vitest'
import { parsePAF } from './parsePAF'

describe('parsePAF', () => {
  const sampleLine = [
    '16S_rRNA', '1542', '0', '1542', '+',
    'NC_000913.3', '4641652', '100', '1642',
    '1510', '1542', '60',
  ].join('\t')

  it('parses a valid PAF line', () => {
    const hits = parsePAF(sampleLine)
    expect(hits).toHaveLength(1)
    const h = hits[0]
    expect(h.queryName).toBe('16S_rRNA')
    expect(h.targetName).toBe('NC_000913.3')
    expect(h.targetStart).toBe(100)
    expect(h.targetEnd).toBe(1642)
    expect(h.strand).toBe('+')
    expect(h.numMatches).toBe(1510)
    expect(h.blockLen).toBe(1542)
  })

  it('returns empty array for empty input', () => {
    expect(parsePAF('')).toHaveLength(0)
  })

  it('skips lines with blockLen === 0', () => {
    const badLine = sampleLine.replace('\t1542\t60', '\t0\t60')
    expect(parsePAF(badLine)).toHaveLength(0)
  })

  it('skips lines with fewer than 12 fields', () => {
    const shortLine = '16S_rRNA\t1542\t0\t1542\t+'
    expect(parsePAF(shortLine)).toHaveLength(0)
  })

  it('skips lines with an invalid strand character', () => {
    const badStrand = sampleLine.replace('\t+\t', '\t?\t')
    expect(parsePAF(badStrand)).toHaveLength(0)
  })

  it('skips lines where a numeric field is non-numeric', () => {
    const badLine = sampleLine.replace('\t1542\t0\t', '\tNaN\t0\t')
    expect(parsePAF(badLine)).toHaveLength(0)
  })

  it('parses multiple valid lines', () => {
    const secondLine = [
      '23S_rRNA', '2904', '0', '2904', '-',
      'NC_000913.3', '4641652', '2000', '4904',
      '2850', '2904', '60',
    ].join('\t')
    const hits = parsePAF(`${sampleLine}\n${secondLine}`)
    expect(hits).toHaveLength(2)
    expect(hits[0].queryName).toBe('16S_rRNA')
    expect(hits[1].queryName).toBe('23S_rRNA')
  })

  it('parses negative strand correctly', () => {
    const minusLine = sampleLine.replace('\t+\t', '\t-\t')
    const hits = parsePAF(minusLine)
    expect(hits).toHaveLength(1)
    expect(hits[0].strand).toBe('-')
  })

  it('parses lines with extra optional tag columns', () => {
    const extraCols = `${sampleLine}\ttp:A:P\tcm:i:123\ts1:i:2000`
    const hits = parsePAF(extraCols)
    expect(hits).toHaveLength(1)
    expect(hits[0].queryName).toBe('16S_rRNA')
  })
})
