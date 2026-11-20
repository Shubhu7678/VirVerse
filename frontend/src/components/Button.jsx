import Spinner from './Spinner'
import { buttonClasses } from './buttonStyles'

/**
 * `fullWidth` defaults to true only because older screens rely on it; new code should pass
 * `fullWidth={false}` (or a className such as `w-auto`) for inline buttons.
 */
export default function Button({
  loading,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  className = '',
  type,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
