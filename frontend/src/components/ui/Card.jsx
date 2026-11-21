/** Flat surface with a 1px border. `interactive` adds a hover state for cards that are links. */
export default function Card({ as: Tag = 'div', interactive = false, padded = true, className = '', ...props }) {
  return (
    <Tag
      className={`rounded-card border border-line bg-surface ${padded ? 'p-5' : ''} ${
        interactive ? 'transition-shadow transition-colors hover:border-line-strong hover:shadow-[0_0_0_1px_var(--line-strong)]' : ''
      } ${className}`}
      {...props}
    />
  )
}
