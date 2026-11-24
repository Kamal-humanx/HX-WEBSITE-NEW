/* The mutant gene's logic, carried over from the careers site: seven human edges, seven X factors,
   four bands of years shipping; 49 names, a deterministic specimen ID and sequence, and the
   role the three choices match. Years shipping only ever decides the role. */

export const HUMAN = [
  ['Attention', 'Attentive'],
  ['Curiosity', 'Curious'],
  ['Taste', 'Tasteful'],
  ['Storytelling', 'Storytelling'],
  ['Behaviour Sense', 'Behavioural'],
  ['Systems Thinking', 'Systemic'],
  ['Other', 'Unclassified'],
] as const
export const XS = [
  ['Prototypes in Code', 'Prototyper'],
  ['Prompts like a Pro', 'Prompter'],
  ['Builds Systems', 'System Builder'],
  ['Motion', 'Animator'],
  ['Data Instinct', 'Analyst'],
  /* added with the studio's AI-native work in mind: someone who designs with and for agents */
  ['Automates with Agents', 'Orchestrator'],
  ['Other', 'Wildcard'],
] as const
export const YEARS = ['0–1', '1–4', '4–7', '7+'] as const
/* what each band of years shipping is called on its card; the ranges (and the role they set) stay */
export const YEAR_NAMES = ['AI Native', 'Early Adopter', 'Robust Maker', 'System Shaper'] as const

export const ROLES: Record<string, string> = {
  'Senior UI Designer': 'https://www.humanx.io/job-roles/senior-ui-designer',
  'Senior Product Designer': 'https://www.humanx.io/job-roles/sr-product-designer',
  'Design Lead': 'https://www.humanx.io/job-roles/design-lead',
  'Product Designer': 'https://www.humanx.io/job-roles/product-designer-1',
  'Product Design Intern': 'https://www.humanx.io/job-roles/product-design-intern',
}

/* the senior band splits on craft: Motion or Taste reads as UI, everything else as product */
export function matchRole(h: string, x: string, y: string) {
  if (y === '0–1') return 'Product Design Intern'
  if (y === '1–4') return 'Product Designer'
  if (y === '4–7') return x === 'Motion' || h === 'Taste' ? 'Senior UI Designer' : 'Senior Product Designer'
  if (y === '7+') return 'Design Lead'
  return 'Product Designer'
}

export function hash(s: string) {
  let n = 7
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 9973
  return n
}

/* The sequence is written the way a gene is read, in codons (three bases each):
   - it opens on ATG, the start codon every gene begins with;
   - each human edge picked adds its own real codon (the amino acid it codes for is noted);
   - each X strand picked adds its own real codon with the middle base mutated to X: the mutation;
   - once the years are in, a stop codon closes the gene (TAA, TAG or TGA), as a real gene ends.
   Up to three picks per strand are written, in the order they were picked. */
const HUMAN_CODON: Record<string, string> = {
  Attention: 'GCT', // alanine (A)
  Curiosity: 'TGC', // cysteine (C)
  Taste: 'ACC', // threonine (T)
  Storytelling: 'TCA', // serine (S)
  'Behaviour Sense': 'CAC', // histidine
  'Systems Thinking': 'GGA', // glycine
  Other: 'AAT', // asparagine
}
const X_CODON: Record<string, string> = {
  'Prototypes in Code': 'CCG', // proline (P)
  'Prompts like a Pro': 'CGA', // arginine
  'Builds Systems': 'TAT', // tyrosine
  Motion: 'ATG', // methionine (M)
  'Data Instinct': 'GAT', // aspartate (D)
  'Automates with Agents': 'GCA', // alanine (A)
  Other: 'TGG', // tryptophan
}
const STOP = ['TAA', 'TAG', 'TGA', 'TAA'] // one per band of years shipping
const mutate = (c: string) => c[0] + 'X' + c[2]

export function sequence(hs: number[], xs: number[], yi: number | null) {
  const codons = ['ATG']
  hs.slice(0, 3).forEach((i) => codons.push(HUMAN_CODON[HUMAN[i][0]]))
  xs.slice(0, 3).forEach((i) => codons.push(mutate(X_CODON[XS[i][0]])))
  if (yi != null) codons.push(STOP[yi])
  return codons.join(' ')
}

/* the phenotype: how the specimen shows up, in plain words, from its lead X trait and lead human edge */
const X_LINE: Record<string, string> = {
  'Prototypes in Code': 'Prototypes in code',
  'Prompts like a Pro': 'Directs the models',
  'Builds Systems': 'Builds the system',
  Motion: 'Designs in motion',
  'Data Instinct': 'Follows the data',
  'Automates with Agents': 'Puts agents to work',
  Other: 'Finds the new tool',
}
const HUMAN_LINE: Record<string, string> = {
  Attention: 'notices what others miss',
  Curiosity: 'always asks why',
  Taste: 'has an eye for craft',
  Storytelling: 'tells the story',
  'Behaviour Sense': 'reads how people act',
  'Systems Thinking': 'thinks in systems',
  Other: 'does it their own way',
}
export function phenotype(hs: number[], xs: number[]) {
  const h = hs.length ? HUMAN_LINE[HUMAN[hs[0]][0]] : ''
  const x = xs.length ? X_LINE[XS[xs[0]][0]] : ''
  if (x && h) return x + ' and ' + h
  if (x) return x
  return h ? h[0].toUpperCase() + h.slice(1) : ''
}

/* the record for the current picks. Each strand can carry several traits; the first one picked on
   each leads (the name, ID and sequence are the lead pair's), and the senior rule looks at all of
   them. Unpicked strands fall back to the site's example specimen. */
export function specimen(hs: number[], xs: number[], yi: number | null) {
  const h = hs.length ? HUMAN[hs[0]][0] : 'Curiosity'
  const x = xs.length ? XS[xs[0]][0] : 'Prototypes in Code'
  const y = yi == null ? '' : YEARS[yi]
  const adj = HUMAN.find((t) => t[0] === h)![1], noun = XS.find((t) => t[0] === x)![1]
  const role = matchRole(hs.some((i) => HUMAN[i][0] === 'Taste') ? 'Taste' : h, xs.some((i) => XS[i][0] === 'Motion') ? 'Motion' : x, y)
  return {
    name: 'The ' + adj + ' ' + noun,
    adj,
    noun,
    id: 'HX-' + String(1000 + hash(h + x + y)).slice(-4),
    /* every pick (and the years) writes into it, so the visitor sees it change as they choose */
    sequence: sequence(hs, xs, yi),
    phenotype: phenotype(hs, xs),
    role,
    url: ROLES[role],
  }
}
