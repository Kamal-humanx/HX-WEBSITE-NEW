/** Contact page copy — verbatim from Figma frame 5376:3969. */

export const CONTACT = {
  heading: "Every Great Idea Needs A Co‑Conspirator",
  form: {
    fullName: { label: "Full Name*", placeholder: "Jane Doe" },
    contact: { label: "Contact ", placeholder: "XXXXX XXXXX" },
    email: { label: "Email Address*", placeholder: "jane@company.com" },
    company: { label: "Company*", placeholder: "Your company or website" },
    budget: { label: "Roughly, what's your budget?*", options: ["$25k – $50k", "$50k – $100k", "$100k+", "Not sure yet"] },
    message: {
      label: "What brings you here today?*",
      placeholder: "We'd love to hear your story, your challenge or simply what you're thinking about...",
    },
    submit: "Start Something New",
    note: "*We usually reply within 48 hours.",
  },
  /**
   * Validation + status messages. NOT in Figma — newly written, minimal, and listed in REPORT.md
   * for copy approval.
   */
  messages: {
    required: "This field is required.",
    email: "Enter a valid email address.",
    budget: "Choose a budget range.",
    sending: "Sending…",
    success: "Thank you — your message has been sent.",
    error: "Something went wrong. Please try again in a moment.",
    phone: "Enter a valid phone number.",
    tooShort: "Please add a little more detail.",
    tooLong: "This is too long — please shorten it.",
    tooFast: "That was quick — please wait a few seconds and send again.",
    rateLimited: "You have sent several messages already. Please try again in an hour.",
    botCheck: "We could not verify your browser. Please reload the page and try again.",
    staleForm: "This form has expired. Please send it again.",
  },
  where: {
    title: "Where We Are",
    intro: "Come by, say hello, and spend some time with the people and ideas behind HumanX.",
    hoursLabel: "Hours",
    emailLabel: "Email",
    mapsCta: "View On Maps",
  },
  faq: {
    title: "Questions People Usually Ask",
    items: [
      {
        q: "Do I need a detailed brief?",
        a: "Not necessarily. A detailed brief isn’t required to get started. A high-level overview of what you’re looking to achieve, the key requirements, and any important context should be enough. From there, I can help shape the direction and ask for any additional details or clarification where needed.",
      },
      // Answers for the following are not in the design (collapsed rows only) — see REPORT.md.
      { q: "Can we start with just an idea?" },
      { q: "Do you work internationally?" },
      { q: "Can we visit the studio?" },
      { q: "How quickly can projects begin?" },
    ] as { q: string; a?: string }[],
  },
};
