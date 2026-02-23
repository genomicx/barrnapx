import type { GFF3Feature } from './types'

/**
 * Serialize features to GFF3 format.
 *
 * GFF3 columns (tab-separated):
 *   seqid, source, type, start, end, score, strand, phase, attributes
 */
export function formatGFF3(
  features: GFF3Feature[],
  inputFileName: string,
): string {
  const lines: string[] = [
    '##gff-version 3',
    `##source-version barrnapx 0.1.0`,
    `##input-file ${inputFileName}`,
    `##date ${new Date().toISOString().slice(0, 10)}`,
  ]

  for (const f of features) {
    const score = f.score.toFixed(1)
    const attrs = `ID=${f.name}_${f.seqId}_${f.start};Name=${f.name};product=${f.product}`
    lines.push(
      [f.seqId, f.source, f.type, f.start, f.end, score, f.strand, f.phase, attrs].join('\t'),
    )
  }

  return lines.join('\n') + '\n'
}
