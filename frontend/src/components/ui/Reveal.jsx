/** Fades/slides children in when scrolled into view. Needs an ancestor using `useReveal`. */
export default function Reveal({ as: Tag = 'div', index = 0, className = '', style, ...props }) {
  return <Tag data-reveal className={className} style={{ ...style, transitionDelay: `${index * 70}ms` }} {...props} />
}
