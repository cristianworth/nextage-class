import { LEVELS } from '../domain/models'

export function LevelPicker({
  levels,
  onChange,
}: {
  levels: string[]
  onChange: (levels: string[]) => void
}) {
  return (
    <fieldset className="level-picker">
      <legend>
        Níveis atendidos{' '}
        <span className="required-marker" aria-hidden="true">
          *
        </span>
      </legend>
      {LEVELS.map((level) => (
        <label key={level} className="check-field">
          <input
            type="checkbox"
            checked={levels.includes(level)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? LEVELS.filter((item) => item === level || levels.includes(item))
                  : levels.filter((item) => item !== level),
              )
            }
          />
          {level}
        </label>
      ))}
    </fieldset>
  )
}
