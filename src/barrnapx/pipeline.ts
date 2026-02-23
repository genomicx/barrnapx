import type { BarrnapOptions, BarrnapResult, GFF3Feature, FeatureType } from './types'
import { parseFasta } from './parseFasta'
import { parsePAF } from './parsePAF'
import { buildFeatures } from './buildFeatures'
import { formatGFF3 } from './formatGFF3'
import { loadReferenceSequences } from './databases'

// Aioli is loaded globally via CDN script tag in index.html
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Aioli: any

type ProgressCallback = (msg: string, pct: number) => void
type LogCallback = (msg: string) => void

const IDENTITY_THRESHOLD: Record<FeatureType, number> = {
  rRNA: 75,
  tRNA: 70,
  ncRNA: 65,
}

/**
 * Run the full barrnapx annotation pipeline.
 *
 * Steps:
 * 1. Parse FASTA (all contigs)                                [0–10%]
 * 2. Load reference sequences for selected kingdom            [10–20%]
 * 3. Init Aioli minimap2                                      [20–25%]
 * 4. Mount genome contigs as genome.fa                        [25%]
 * 5. rRNA alignment (if enabled)                             [25–45%]
 * 6. tRNA alignment (if enabled + not legacyMode)            [45–65%]
 * 7. ncRNA alignment (if enabled + not legacyMode)           [65–85%]
 * 8. Sort features                                           [85–90%]
 * 9. Format GFF3                                             [90–95%]
 * 10. Return result                                          [95–100%]
 */
export async function runBarrnapx(
  inputFiles: File[],
  options: BarrnapOptions,
  onProgress: ProgressCallback,
  onLog: LogCallback,
): Promise<BarrnapResult> {
  if (inputFiles.length === 0) {
    throw new Error('No input files provided')
  }

  const file = inputFiles[0]
  onProgress('Reading genome file...', 0)
  onLog(`[barrnapx] Processing: ${file.name}`)

  const text = await file.text()
  onProgress('Parsing FASTA...', 5)

  const fastaEntries = parseFasta(text)
  if (fastaEntries.length === 0) {
    throw new Error('No sequences found in input FASTA')
  }
  onLog(`[barrnapx] ${fastaEntries.length} contig(s) found`)

  const sequences = fastaEntries.map((e) => ({
    name: e.name,
    length: e.sequence.length,
  }))

  onProgress('Loading reference sequences...', 10)
  onLog(`[barrnapx] Loading ${options.kingdom} references`)

  const [rrnaRef, trnaRef, ncrnaRef] = await Promise.all([
    options.detectRrna ? loadReferenceSequences(options.kingdom, 'rRNA') : Promise.resolve(''),
    options.detectTrna && !options.legacyMode ? loadReferenceSequences(options.kingdom, 'tRNA') : Promise.resolve(''),
    options.detectNcrna && !options.legacyMode ? loadReferenceSequences(options.kingdom, 'ncRNA') : Promise.resolve(''),
  ])
  onProgress('References loaded', 20)

  onProgress('Initializing minimap2...', 20)
  onLog('[barrnapx] Initializing Aioli/minimap2')
  const cli = await new Aioli(['minimap2/2.22'])

  // Build combined FASTA for all contigs
  const genomeFasta = fastaEntries
    .map((e) => `>${e.name}\n${e.sequence}`)
    .join('\n') + '\n'
  await cli.mount({ name: 'genome.fa', data: genomeFasta })
  onProgress('Genome mounted', 25)

  const allFeatures: GFF3Feature[] = []

  // Step 5: rRNA alignment
  if (options.detectRrna && rrnaRef) {
    onProgress('Aligning rRNA references...', 25)
    onLog('[barrnapx] Running rRNA alignment')
    await cli.mount({ name: 'rrna.fa', data: rrnaRef })
    const pafOut: string = await cli.exec('minimap2 -k 14 -w 4 -N 50 genome.fa rrna.fa')
    const hits = parsePAF(pafOut)
    onLog(`[barrnapx] ${hits.length} rRNA alignment hits`)
    const features = buildFeatures(hits, 'rRNA', IDENTITY_THRESHOLD.rRNA)
    onLog(`[barrnapx] ${features.length} rRNA features after filtering`)
    allFeatures.push(...features)
    onProgress('rRNA done', 45)
  }

  // Step 6: tRNA alignment
  if (options.detectTrna && !options.legacyMode && trnaRef) {
    onProgress('Aligning tRNA references...', 45)
    onLog('[barrnapx] Running tRNA alignment')
    await cli.mount({ name: 'trna.fa', data: trnaRef })
    const pafOut: string = await cli.exec('minimap2 -k 8 -w 2 -N 50 genome.fa trna.fa')
    const hits = parsePAF(pafOut)
    onLog(`[barrnapx] ${hits.length} tRNA alignment hits`)
    const features = buildFeatures(hits, 'tRNA', IDENTITY_THRESHOLD.tRNA)
    onLog(`[barrnapx] ${features.length} tRNA features after filtering`)
    allFeatures.push(...features)
    onProgress('tRNA done', 65)
  }

  // Step 7: ncRNA alignment
  if (options.detectNcrna && !options.legacyMode && ncrnaRef) {
    onProgress('Aligning ncRNA references...', 65)
    onLog('[barrnapx] Running ncRNA alignment')
    await cli.mount({ name: 'ncrna.fa', data: ncrnaRef })
    const pafOut: string = await cli.exec('minimap2 -k 10 -w 3 -N 50 genome.fa ncrna.fa')
    const hits = parsePAF(pafOut)
    onLog(`[barrnapx] ${hits.length} ncRNA alignment hits`)
    const features = buildFeatures(hits, 'ncRNA', IDENTITY_THRESHOLD.ncRNA)
    onLog(`[barrnapx] ${features.length} ncRNA features after filtering`)
    allFeatures.push(...features)
    onProgress('ncRNA done', 85)
  }

  // Step 8: Sort features by seqId then start position
  onProgress('Sorting features...', 90)
  allFeatures.sort((a, b) => {
    const seqCmp = a.seqId.localeCompare(b.seqId)
    return seqCmp !== 0 ? seqCmp : a.start - b.start
  })

  // Step 9: Format GFF3
  onProgress('Formatting GFF3...', 95)
  const gff3Text = formatGFF3(allFeatures, file.name)

  const featureCount = {
    rRNA: allFeatures.filter((f) => f.type === 'rRNA').length,
    tRNA: allFeatures.filter((f) => f.type === 'tRNA').length,
    ncRNA: allFeatures.filter((f) => f.type === 'ncRNA').length,
  }
  onLog(`[barrnapx] Complete: ${featureCount.rRNA} rRNA, ${featureCount.tRNA} tRNA, ${featureCount.ncRNA} ncRNA`)

  onProgress('Complete', 100)

  return {
    features: allFeatures,
    sequences,
    gff3Text,
    inputFileName: file.name,
    featureCount,
  }
}
