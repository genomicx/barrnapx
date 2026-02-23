import type { PAFHit } from './types'

/**
 * Parse minimap2 PAF output into PAFHit array.
 *
 * PAF columns (0-indexed):
 *   0: qName   1: qLen   2: qStart   3: qEnd   4: strand
 *   5: tName   6: tLen   7: tStart   8: tEnd
 *   9: nMatch  10: blockLen  11: mapQ
 */
export function parsePAF(pafText: string): PAFHit[] {
  const hits: PAFHit[] = []
  const lines = pafText.trim().split('\n')

  for (const line of lines) {
    if (!line) continue
    const fields = line.split('\t')
    if (fields.length < 12) continue

    const queryName = fields[0]
    const queryLen = parseInt(fields[1], 10)
    const queryStart = parseInt(fields[2], 10)
    const queryEnd = parseInt(fields[3], 10)
    const strandRaw = fields[4]
    const targetName = fields[5]
    const targetLen = parseInt(fields[6], 10)
    const targetStart = parseInt(fields[7], 10)
    const targetEnd = parseInt(fields[8], 10)
    const numMatches = parseInt(fields[9], 10)
    const blockLen = parseInt(fields[10], 10)
    const mapQ = parseInt(fields[11], 10)

    if (
      isNaN(queryLen) || isNaN(queryStart) || isNaN(queryEnd) ||
      isNaN(targetLen) || isNaN(targetStart) || isNaN(targetEnd) ||
      isNaN(numMatches) || isNaN(blockLen) || isNaN(mapQ) ||
      blockLen === 0
    ) continue

    if (strandRaw !== '+' && strandRaw !== '-') continue
    const strand: '+' | '-' = strandRaw

    hits.push({
      queryName,
      queryLen,
      queryStart,
      queryEnd,
      strand,
      targetName,
      targetLen,
      targetStart,
      targetEnd,
      numMatches,
      blockLen,
      mapQ,
    })
  }

  return hits
}
