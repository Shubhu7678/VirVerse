import { useRef } from 'react'

// Six boxes for a verification code. Typing moves ahead, Backspace moves back, and a
// pasted code fills every box. `value` is a string of up to 6 digits.
export default function CodeInput({ value, onChange, disabled, error, onComplete }) {
  const refs = useRef([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '')

  const set = (next) => {
    const clean = next.replace(/\D/g, '').slice(0, 6)
    onChange(clean)
    if (clean.length === 6) onComplete?.(clean)
    return clean
  }
  const focus = (i) => refs.current[Math.max(0, Math.min(5, i))]?.focus()

  const onKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[i]) set(value.slice(0, i) + value.slice(i + 1))
      else if (i > 0) { set(value.slice(0, i - 1) + value.slice(i)); focus(i - 1) }
    } else if (e.key === 'ArrowLeft') focus(i - 1)
    else if (e.key === 'ArrowRight') focus(i + 1)
  }
  const onInput = (i, e) => {
    const typed = e.target.value.replace(/\D/g, '')
    if (!typed) return
    const clean = set(value.slice(0, i) + typed + value.slice(i + typed.length))
    focus(Math.min(i + typed.length, clean.length === 6 ? 5 : clean.length))
  }
  const onPaste = (e) => {
    e.preventDefault()
    const clean = set(e.clipboardData.getData('text'))
    focus(clean.length >= 6 ? 5 : clean.length)
  }

  return (
    <div role="group" aria-label="6-digit verification code" className="flex justify-between gap-2" onPaste={onPaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          value={d}
          onChange={(e) => onInput(i, e)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          aria-invalid={Boolean(error)}
          className={`h-12 w-full min-w-0 rounded-control border bg-surface text-center font-mono text-xl text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60 ${error ? 'border-danger' : 'border-line-strong'}`}
        />
      ))}
    </div>
  )
}
