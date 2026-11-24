/* the arrow the HumanX website's buttons carry (Figma, careers frame: "View Details", "Submit
   Portfolio"): a 14px line arrow drawn at a 1.17 stroke in the text's own colour. Turned up a
   quarter for a way out to another page. */
export function Arrow({ up = false, className = '' }: { up?: boolean; className?: string }) {
  return (
    <svg
      className={'hx-arrow' + (up ? ' is-up' : '') + (className ? ' ' + className : '')}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2.917 7h8.167" stroke="currentColor" strokeWidth="1.167" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 2.917 11.083 7 7 11.084" stroke="currentColor" strokeWidth="1.167" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
