/* The open positions exactly as the careers site lists them (hx-careers-index.vercel.app, "Archive of
   openings"): title, level and its filter, location, and the role's page on humanx.io. The Gene's
   matched roles use the same five titles, so a completed specimen points at a real opening. Each
   role carries one of the studio's own photographs from humanx.io (the team at work), shown on hover. */

export const OPENINGS = [
  { name: 'Senior UI Designer', level: 'Senior', f: 'senior', location: 'Mumbai', url: 'https://www.humanx.io/job-roles/senior-ui-designer', img: `/careers-ref/roles/team-brainstorm.webp` },
  { name: 'Senior Product Designer', level: 'Senior', f: 'senior', location: 'Mumbai', url: 'https://www.humanx.io/job-roles/sr-product-designer', img: `/careers-ref/roles/team-whiteboard.webp` },
  { name: 'Design Lead', level: 'Lead', f: 'lead', location: 'Mumbai', url: 'https://www.humanx.io/job-roles/design-lead', img: `/careers-ref/roles/team-wooden-table.webp` },
  { name: 'Product Designer', level: 'Mid', f: 'mid', location: 'Mumbai', url: 'https://www.humanx.io/job-roles/product-designer-1', img: `/careers-ref/roles/team-conference.webp` },
  { name: 'Product Design Intern', level: 'Intern', f: 'intern', location: 'Mumbai', url: 'https://www.humanx.io/job-roles/product-design-intern', img: `/careers-ref/roles/office.webp` },
]

/* the archive's filters, as the site labels them */
export const FILTERS = [
  ['all', 'All'],
  ['senior', 'Senior'],
  ['lead', 'Lead'],
  ['mid', 'Mid'],
  ['intern', 'Intern'],
] as const
