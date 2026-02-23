import { useState, useCallback } from 'react'
import { saveAs } from 'file-saver'
import type { GFF3Feature, FeatureType } from '../barrnapx/types'

interface AnnotationTableProps {
  features: GFF3Feature[]
  gff3Text: string
  inputFileName: string
}

const BADGE_CLASS: Record<FeatureType, string> = {
  rRNA: 'badge badge-rrna',
  tRNA: 'badge badge-trna',
  ncRNA: 'badge badge-ncrna',
}

export function AnnotationTable({ features, gff3Text, inputFileName }: AnnotationTableProps) {
  const [filterType, setFilterType] = useState<FeatureType | 'all'>('all')

  const rRNACount = features.filter((f) => f.type === 'rRNA').length
  const tRNACount = features.filter((f) => f.type === 'tRNA').length
  const ncRNACount = features.filter((f) => f.type === 'ncRNA').length

  const displayed = filterType === 'all'
    ? features
    : features.filter((f) => f.type === filterType)

  const handleExportGFF3 = useCallback(() => {
    const blob = new Blob([gff3Text], { type: 'text/plain;charset=utf-8' })
    const stem = inputFileName.replace(/\.(fasta|fa|fna|fsa)(\.gz)?$/, '')
    saveAs(blob, `${stem}_barrnapx.gff3`)
  }, [gff3Text, inputFileName])

  const handleExportTSV = useCallback(() => {
    const header = 'SeqID\tType\tName\tProduct\tStart\tEnd\tStrand\tScore\n'
    const rows = features
      .map((f) =>
        [f.seqId, f.type, f.name, f.product, f.start, f.end, f.strand, f.score.toFixed(1)].join('\t'),
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/tab-separated-values;charset=utf-8' })
    const stem = inputFileName.replace(/\.(fasta|fa|fna|fsa)(\.gz)?$/, '')
    saveAs(blob, `${stem}_barrnapx.tsv`)
  }, [features, inputFileName])

  if (features.length === 0) return null

  return (
    <section className="results">
      <div className="results-header">
        <h2>Annotations</h2>
        <div className="results-actions">
          <button className="export-button" onClick={handleExportGFF3}>
            Export GFF3
          </button>
          <button className="export-button" onClick={handleExportTSV}>
            Export TSV
          </button>
        </div>
      </div>

      <div className="annotation-summary">
        <span className="badge badge-rrna">{rRNACount} rRNA</span>
        <span className="badge badge-trna">{tRNACount} tRNA</span>
        <span className="badge badge-ncrna">{ncRNACount} ncRNA</span>
        <span className="annotation-total">{features.length} total features</span>
      </div>

      <div className="annotation-filter">
        <button
          className={`filter-btn${filterType === 'all' ? ' filter-btn-active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button
          className={`filter-btn${filterType === 'rRNA' ? ' filter-btn-active' : ''}`}
          onClick={() => setFilterType('rRNA')}
        >
          rRNA
        </button>
        <button
          className={`filter-btn${filterType === 'tRNA' ? ' filter-btn-active' : ''}`}
          onClick={() => setFilterType('tRNA')}
        >
          tRNA
        </button>
        <button
          className={`filter-btn${filterType === 'ncRNA' ? ' filter-btn-active' : ''}`}
          onClick={() => setFilterType('ncRNA')}
        >
          ncRNA
        </button>
      </div>

      <div className="results-table-container">
        <table className="results-table">
          <thead>
            <tr>
              <th>Seq ID</th>
              <th>Type</th>
              <th>Name</th>
              <th>Product</th>
              <th>Start</th>
              <th>End</th>
              <th>Strand</th>
              <th>Score %</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((f, i) => (
              <tr key={i}>
                <td className="mono">{f.seqId}</td>
                <td>
                  <span className={BADGE_CLASS[f.type]}>{f.type}</span>
                </td>
                <td className="mono">{f.name}</td>
                <td>{f.product}</td>
                <td className="mono">{f.start.toLocaleString()}</td>
                <td className="mono">{f.end.toLocaleString()}</td>
                <td className="mono">{f.strand}</td>
                <td className="mono">{f.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
