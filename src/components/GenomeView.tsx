import { useRef, useCallback, useState } from 'react'
import type { GFF3Feature, FeatureType, SequenceInfo } from '../barrnapx/types'

interface GenomeViewProps {
  features: GFF3Feature[]
  sequences: SequenceInfo[]
}

const TRACK_HEIGHT = 28
const TRACK_PADDING = 8
const ROW_HEIGHT = TRACK_HEIGHT + TRACK_PADDING

const FEATURE_COLOR: Record<FeatureType, string> = {
  rRNA:  '#0d9488',
  tRNA:  '#7c3aed',
  ncRNA: '#ea580c',
}

interface TooltipState {
  x: number
  y: number
  feature: GFF3Feature
}

export function GenomeView({ features, sequences }: GenomeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent, feature: GFF3Feature) => {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top, feature })
  }, [])

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  if (features.length === 0) return null

  const seqsWithFeatures = sequences.filter((s) =>
    features.some((f) => f.seqId === s.name),
  )

  return (
    <div className="genome-view" ref={containerRef}>
      <h2 className="genome-view-title">Genome View</h2>
      {seqsWithFeatures.map((seq) => {
        const seqFeatures = features.filter((f) => f.seqId === seq.name)
        const svgWidth = containerRef.current?.clientWidth ?? 800
        const trackWidth = Math.max(svgWidth - 160, 100)
        const scale = trackWidth / seq.length

        return (
          <div key={seq.name} className="genome-track">
            <div className="genome-track-label" title={seq.name}>
              {seq.name.length > 16 ? seq.name.slice(0, 14) + '\u2026' : seq.name}
              <span className="genome-track-len">
                {(seq.length / 1000).toFixed(0)}kb
              </span>
            </div>
            <svg
              className="genome-track-svg"
              width={trackWidth}
              height={ROW_HEIGHT}
              aria-label={`Genome track for ${seq.name}`}
            >
              <rect
                x={0}
                y={TRACK_PADDING / 2}
                width={trackWidth}
                height={TRACK_HEIGHT}
                fill="var(--gx-bg-elevated)"
                stroke="var(--gx-border)"
                strokeWidth={1}
                rx={4}
              />
              {seqFeatures.map((f, i) => {
                const x = Math.max(0, f.start * scale)
                const w = Math.max(4, (f.end - f.start) * scale)
                const color = FEATURE_COLOR[f.type]
                const y = TRACK_PADDING / 2

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={TRACK_HEIGHT}
                      fill={color}
                      opacity={0.85}
                      rx={2}
                      style={{ cursor: 'pointer' }}
                      onMouseMove={(e) => handleMouseMove(e, f)}
                      onMouseLeave={handleMouseLeave}
                    />
                    {w > 12 && (
                      <polygon
                        points={
                          f.strand === '+'
                            ? `${x + w - 5},${y + TRACK_HEIGHT / 2} ${x + w},${y + TRACK_HEIGHT / 2 - 4} ${x + w},${y + TRACK_HEIGHT / 2 + 4}`
                            : `${x + 5},${y + TRACK_HEIGHT / 2} ${x},${y + TRACK_HEIGHT / 2 - 4} ${x},${y + TRACK_HEIGHT / 2 + 4}`
                        }
                        fill="white"
                        opacity={0.6}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        )
      })}

      <div className="genome-legend">
        {(Object.entries(FEATURE_COLOR) as [FeatureType, string][]).map(([type, color]) => (
          <span key={type} className="genome-legend-item">
            <span className="genome-legend-swatch" style={{ background: color }} />
            {type}
          </span>
        ))}
      </div>

      {tooltip && (
        <div
          className="genome-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          <strong>{tooltip.feature.name}</strong>
          <br />
          {tooltip.feature.seqId}: {tooltip.feature.start.toLocaleString()}&ndash;{tooltip.feature.end.toLocaleString()}
          <br />
          Strand: {tooltip.feature.strand} &middot; Score: {tooltip.feature.score.toFixed(1)}%
        </div>
      )}
    </div>
  )
}
