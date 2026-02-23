import type { BarrnapOptions, Kingdom } from '../barrnapx/types'

interface OptionsPanelProps {
  options: BarrnapOptions
  onChange: (opts: BarrnapOptions) => void
  disabled: boolean
}

const KINGDOM_LABELS: Record<Kingdom, string> = {
  bac: 'Bacteria',
  arc: 'Archaea',
  fun: 'Fungi',
}

export function OptionsPanel({ options, onChange, disabled }: OptionsPanelProps) {
  const set = (partial: Partial<BarrnapOptions>) =>
    onChange({ ...options, ...partial })

  const handleLegacyMode = (checked: boolean) => {
    set({
      legacyMode: checked,
      detectTrna: checked ? false : options.detectTrna,
      detectNcrna: checked ? false : options.detectNcrna,
    })
  }

  return (
    <div className="options-panel">
      <h3 className="options-title">Options</h3>

      <div className="options-row">
        <label className="options-label" htmlFor="kingdom-select">
          Kingdom
        </label>
        <select
          id="kingdom-select"
          className="options-select"
          value={options.kingdom}
          onChange={(e) => set({ kingdom: e.target.value as Kingdom })}
          disabled={disabled}
        >
          {(Object.entries(KINGDOM_LABELS) as [Kingdom, string][]).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="options-fieldset" disabled={disabled}>
        <legend className="options-legend">Detect</legend>

        <label className="options-check">
          <input
            type="checkbox"
            checked={options.detectRrna}
            onChange={(e) => set({ detectRrna: e.target.checked })}
          />
          rRNA
        </label>

        <label className="options-check">
          <input
            type="checkbox"
            checked={options.detectTrna}
            onChange={(e) => set({ detectTrna: e.target.checked })}
            disabled={options.legacyMode}
          />
          tRNA
        </label>

        <label className="options-check">
          <input
            type="checkbox"
            checked={options.detectNcrna}
            onChange={(e) => set({ detectNcrna: e.target.checked })}
            disabled={options.legacyMode}
          />
          ncRNA
        </label>
      </fieldset>

      <label className="options-check options-legacy">
        <input
          type="checkbox"
          checked={options.legacyMode}
          onChange={(e) => handleLegacyMode(e.target.checked)}
          disabled={disabled}
        />
        Legacy mode (rRNA only)
      </label>
    </div>
  )
}
