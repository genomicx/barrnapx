import { describe, it, expect } from 'vitest'
import { parseFasta } from './parseFasta'

describe('parseFasta', () => {
  it('parses single-entry FASTA', () => {
    const input = '>seq1\nACGTACGT\n'
    const result = parseFasta(input)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('seq1')
    expect(result[0].sequence).toBe('ACGTACGT')
  })

  it('parses multi-contig FASTA (all contigs returned)', () => {
    const input = '>contig1\nAAAA\n>contig2\nCCCC\n>contig3\nGGGG\n'
    const result = parseFasta(input)
    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('contig1')
    expect(result[1].name).toBe('contig2')
    expect(result[2].name).toBe('contig3')
  })

  it('strips description from FASTA header (uses only first word)', () => {
    const input = '>NC_000913.3 Escherichia coli K-12\nACGT\n'
    const result = parseFasta(input)
    expect(result[0].name).toBe('NC_000913.3')
  })

  it('returns empty array for empty input', () => {
    expect(parseFasta('')).toHaveLength(0)
  })

  it('uppercases sequence', () => {
    const result = parseFasta('>s1\nacgt\n')
    expect(result[0].sequence).toBe('ACGT')
  })

  it('joins multi-line sequences into a single string', () => {
    const input = '>seq1\nACGT\nTTTT\nGGGG\n'
    const result = parseFasta(input)
    expect(result).toHaveLength(1)
    expect(result[0].sequence).toBe('ACGTTTTTGGGG')
  })

  it('handles CRLF line endings', () => {
    const input = '>seq1\r\nACGT\r\nTTTT\r\n'
    const result = parseFasta(input)
    expect(result).toHaveLength(1)
    expect(result[0].sequence).toBe('ACGTTTTT')
  })

  it('strips trailing whitespace from sequence lines', () => {
    const input = '>seq1\nACGT   \nTTTT  \n'
    const result = parseFasta(input)
    expect(result[0].sequence).toBe('ACGTTTTT')
  })
})
