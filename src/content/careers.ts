/** Careers page copy — verbatim from Figma frame 5521:352. */

export const CAREERS = {
  hero: {
    line1: "Your Canvas",
    line2: "Has No",
    line3: "Edges",
    brief:
      "Tools and roles evolve. Our foundations don’t. We shape the question, put it in people’s hands and see what it changes. Our design goes beyond the screen.",
    primaryCta: "See Open Roles",
    secondaryCta: "Find Your X",
    location: "HumanX, Mumbai",
  },
  manifesto: {
    line1: "In A World Shaped By AI,",
    line2: "Human Is The Advantage.",
    step: { current: "02", total: " / 03" },
    title: ["Move The Needle.", "Not Just The Pixels."],
    body: "We’re measured by the problems we solve and the behaviour we change. Tools are how we get there, never the point.",
    diagramAlt:
      "Diagram: lines from FIGMA, CODE, AI, RESEARCH, PROTOTYPES and WORKSHOPS converge through a field of points into a single orange point labelled “BEHAVIOUR, CHANGED”",
  },
  mutation: {
    title: "Every Builder Here Carries A Mutation.",
    humanEdge: {
      n: "01",
      title: "Human Edge",
      options: ["Attention", "Curiosity", "Taste", "Storytelling", "Behaviour Sense", "Systems Thinking", "Other"],
      selected: "Systems Thinking",
    },
    xStrand: {
      n: "02",
      title: "X Strand",
      options: ["Prototypes in Code", "Prompts like a Pro", "Builds Systems", "Motion", "Data Instinct", "Automates with Agents", "Other"],
      selected: "Automates with Agents",
    },
    record: {
      specimen: "Specimen HX-2270",
      titleLead: "The ",
      titleAccent: "Systemic",
      titleEnd: "Orchestrator",
      matchedRoleLabel: "Matched role",
      matchedRole: "Senior Product Designer",
      sequenceLabel: "Sequence",
      /** [text, isAccent] */
      sequence: [
        ["M", false], ["X", true], ["U", false], ["X", true], ["HU", false], ["XX", true], ["UM", false], ["X", true], ["U", false],
      ] as [string, boolean][],
      cta: "Bring Your X To HumanX",
    },
    years: {
      n: "03",
      title: "Years Shipping",
      options: [
        { range: "0–1 yrs", label: "AI Native" },
        { range: "1–4 yrs", label: "Early Adopter" },
        { range: "4–7 yrs", label: "Robust Maker" },
        { range: "7+ yrs", label: "System Shaper" },
      ],
      selected: "4–7 yrs",
    },
  },
  openings: {
    title: "Openings",
    filters: ["All", "Senior", "Lead", "Mid", "Intern"],
    count: "5 open roles",
    columns: { n: "#", role: "Role", level: "Level", location: "Location" },
    apply: "Apply",
    match: "Your match",
    roles: [
      { n: "01", role: "Senior UI Designer", level: "Senior", location: "Mumbai" },
      { n: "02", role: "Senior Product Designer", level: "Senior", location: "Mumbai", match: true },
      { n: "03", role: "Design Lead", level: "Lead", location: "Mumbai" },
      { n: "04", role: "Product Designer", level: "Mid", location: "Mumbai" },
      { n: "05", role: "Product Design Intern", level: "Intern", location: "Mumbai" },
    ],
  },
};
