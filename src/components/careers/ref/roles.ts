/* The open positions exactly as the careers site lists them (hx-careers-index.vercel.app, "Archive of
   openings"): title, level and its filter, location, and the role's application form on Recruit CRM
   (the "Apply now" target of each humanx.io/job-roles page, so applicants skip that step). The Gene's
   matched roles use the same five titles, so a completed specimen points at a real opening. Each
   role carries one of the studio's own photographs from humanx.io (the team at work), shown on hover. */

export const OPENINGS = [
  { name: 'Senior UI Designer', level: 'Senior', f: 'senior', location: 'Mumbai', url: 'https://recruitcrm.io/apply/17252664795840068169Pbe', img: `/careers-ref/roles/team-brainstorm.webp` },
  { name: 'Senior Product Designer', level: 'Senior', f: 'senior', location: 'Mumbai', url: 'https://recruitcrm.io/apply/17249944376770068169MAI', img: `/careers-ref/roles/team-whiteboard.webp` },
  { name: 'Design Lead', level: 'Lead', f: 'lead', location: 'Mumbai', url: 'https://recruitcrm.io/apply/17218929918870068169KFp', img: `/careers-ref/roles/team-wooden-table.webp` },
  { name: 'Product Designer', level: 'Mid', f: 'mid', location: 'Mumbai', url: 'https://recruitcrm.io/apply/17283921567990068169CeZ', img: `/careers-ref/roles/team-conference.webp` },
  { name: 'Product Design Intern', level: 'Intern', f: 'intern', location: 'Mumbai', url: 'https://recruitcrm.io/apply/17301815425210068169ldp', img: `/careers-ref/roles/office.webp` },
]

/* the archive's filters, as the site labels them */
export const FILTERS = [
  ['all', 'All'],
  ['senior', 'Senior'],
  ['lead', 'Lead'],
  ['mid', 'Mid'],
  ['intern', 'Intern'],
] as const
